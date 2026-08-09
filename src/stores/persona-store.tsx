"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { PersonaState, SyncStatus } from "@/types";
import { localRepository } from "@/lib/repositories/local-repository";
import { supabaseRepository } from "@/lib/repositories/supabase-repository";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  normalizeLegacySnapshot,
  runLocalToCloudMigration,
} from "@/lib/sync/migration";
import { subscribeToPersonaRealtime } from "@/lib/sync/realtime";
import {
  buildCloudMutations,
  enqueueCloudMutations,
  flushCloudOutbox,
  getPendingMutationCount,
} from "@/lib/sync/outbox";

type PersonaStoreValue = {
  state: PersonaState;
  updateState: (updater: (previous: PersonaState) => PersonaState) => void;
  syncStatus: SyncStatus;
  mounted: boolean;
};

const PersonaStoreContext = createContext<PersonaStoreValue | null>(null);

function statesDiffer(left: PersonaState, right: PersonaState): boolean {
  return JSON.stringify(left) !== JSON.stringify(right);
}

const subscribeToHydration = () => () => {};
const getClientHydrationSnapshot = () => true;
const getServerHydrationSnapshot = () => false;

export function PersonaProvider({ children }: { children: React.ReactNode }) {
  const { user, isCloudMode, loading: authLoading } = useAuth();
  const [state, setState] = useState<PersonaState>(() =>
    localRepository.getState()
  );
  const stateRef = useRef(state);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(() =>
    isCloudMode ? "initializing" : "local"
  );
  const mounted = useSyncExternalStore(
    subscribeToHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot
  );
  const flushPromiseRef = useRef<Promise<void> | null>(null);
  const realtimeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cloudReadyRef = useRef(false);

  const adoptState = useCallback((next: PersonaState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  const commitState = useCallback(
    (next: PersonaState) => {
      adoptState(next);
      localRepository.saveState(next);
    },
    [adoptState]
  );

  const normalizeLiveStateForCloud = useCallback(() => {
    const current = stateRef.current;
    const normalized = normalizeLegacySnapshot(current);
    if (statesDiffer(current, normalized)) commitState(normalized);
    return normalized;
  }, [commitState]);

  const flushQueuedMutations = useCallback(async (userId: string) => {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setSyncStatus("offline");
      return;
    }

    if (flushPromiseRef.current) return flushPromiseRef.current;

    const run = (async () => {
      setSyncStatus("syncing");
      await flushCloudOutbox(userId);
      setSyncStatus("synced");
    })();

    flushPromiseRef.current = run.finally(() => {
      flushPromiseRef.current = null;
    });

    return flushPromiseRef.current;
  }, []);

  const refreshFromCloud = useCallback(
    async (userId: string) => {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        setSyncStatus("offline");
        return;
      }

      if (getPendingMutationCount(userId) > 0) {
        await flushQueuedMutations(userId);
      }

      if (getPendingMutationCount(userId) > 0) return;

      setSyncStatus("syncing");
      const cloudState = await supabaseRepository.fetchAllState(userId);
      commitState(cloudState);
      cloudReadyRef.current = true;
      setSyncStatus("synced");
    },
    [commitState, flushQueuedMutations]
  );

  const initializeCloud = useCallback(
    async (userId: string) => {
      cloudReadyRef.current = false;

      // Normalize even while offline, so every subsequent local mutation already
      // carries cloud-compatible UUIDs and can safely wait in the outbox.
      normalizeLiveStateForCloud();

      if (typeof navigator !== "undefined" && !navigator.onLine) {
        setSyncStatus("offline");
        return;
      }

      setSyncStatus("syncing");

      // Migration throws on failure. We intentionally do not fetch cloud state
      // after a failed migration, so local data can never be replaced by an
      // empty/partial cloud snapshot.
      await runLocalToCloudMigration(userId);
      await flushQueuedMutations(userId);

      if (getPendingMutationCount(userId) > 0) {
        throw new Error("Cloud outbox still contains pending mutations after flush.");
      }

      const cloudState = await supabaseRepository.fetchAllState(userId);
      commitState(cloudState);
      cloudReadyRef.current = true;
      setSyncStatus("synced");
    },
    [commitState, flushQueuedMutations, normalizeLiveStateForCloud]
  );

  useEffect(() => {
    if (authLoading) {
      cloudReadyRef.current = false;
      return;
    }

    if (!isCloudMode) {
      cloudReadyRef.current = false;

      // A storage event already represents a write from another tab. Adopt it
      // without writing it back, otherwise two tabs can echo the same event.
      let active = true;
      const handleStorage = () => {
        if (active) adoptState(localRepository.getState());
      };
      queueMicrotask(handleStorage);
      window.addEventListener("storage", handleStorage);
      return () => {
        active = false;
        window.removeEventListener("storage", handleStorage);
      };
    }

    if (!user) {
      cloudReadyRef.current = false;
      return;
    }

    let disposed = false;
    let channel: ReturnType<typeof subscribeToPersonaRealtime> = null;

    const scheduleRemoteRefresh = () => {
      if (disposed || !cloudReadyRef.current) return;
      if (realtimeTimerRef.current) clearTimeout(realtimeTimerRef.current);
      realtimeTimerRef.current = setTimeout(() => {
        if (
          disposed ||
          !cloudReadyRef.current ||
          getPendingMutationCount(user.id) > 0
        ) {
          return;
        }
        refreshFromCloud(user.id).catch((error) => {
          console.error("Realtime refresh failed:", error);
          setSyncStatus("error");
        });
      }, 250);
    };

    const start = async () => {
      try {
        await initializeCloud(user.id);
        if (disposed) return;
        channel = subscribeToPersonaRealtime(user.id, scheduleRemoteRefresh);
      } catch (error) {
        cloudReadyRef.current = false;
        console.error("Cloud initialization failed; preserving local state:", error);
        setSyncStatus("error");
      }
    };

    const handleOffline = () => setSyncStatus("offline");
    const handleOnline = () => {
      initializeCloud(user.id).catch((error) => {
        cloudReadyRef.current = false;
        console.error("Cloud reconnect failed:", error);
        setSyncStatus("error");
      });
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    void start();

    return () => {
      disposed = true;
      cloudReadyRef.current = false;
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      if (realtimeTimerRef.current) clearTimeout(realtimeTimerRef.current);
      if (channel) void channel.unsubscribe();
    };
  }, [
    adoptState,
    authLoading,
    initializeCloud,
    isCloudMode,
    refreshFromCloud,
    user,
  ]);

  const updateState = useCallback(
    (updater: (previous: PersonaState) => PersonaState) => {
      const rawPrevious = stateRef.current;
      const previous =
        isCloudMode && user && !cloudReadyRef.current
          ? normalizeLegacySnapshot(rawPrevious)
          : rawPrevious;

      if (statesDiffer(previous, rawPrevious)) commitState(previous);

      const next = updater(previous);
      commitState(next);

      if (!isCloudMode || !user) return;

      const mutations = buildCloudMutations(previous, next, user.id);
      if (mutations.length === 0) return;

      // Queue first, always. If the first migration/reconcile has not completed,
      // these mutations remain local and cannot accidentally seed a partial cloud.
      enqueueCloudMutations(mutations);

      if (!cloudReadyRef.current) return;

      if (typeof navigator !== "undefined" && !navigator.onLine) {
        setSyncStatus("offline");
        return;
      }

      void flushQueuedMutations(user.id).catch((error) => {
        console.error("Cloud sync mutation failed; operation remains queued:", error);
        setSyncStatus("error");
      });
    },
    [commitState, flushQueuedMutations, isCloudMode, user]
  );

  const visibleSyncStatus: SyncStatus =
    authLoading || (isCloudMode && !user) ? "initializing" : syncStatus;

  const value = useMemo<PersonaStoreValue>(
    () => ({ state, updateState, syncStatus: visibleSyncStatus, mounted }),
    [mounted, state, updateState, visibleSyncStatus]
  );

  return (
    <PersonaStoreContext.Provider value={value}>
      {children}
    </PersonaStoreContext.Provider>
  );
}

export function usePersonaStore(): PersonaStoreValue {
  const context = useContext(PersonaStoreContext);
  if (!context) {
    throw new Error("usePersonaStore must be used inside PersonaProvider");
  }
  return context;
}
