"use client";

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
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

export function PersonaProvider({ children }: { children: React.ReactNode }) {
  const { user, isCloudMode, loading: authLoading } = useAuth();
  const initialStateRef = useRef<PersonaState>(localRepository.getState());

  const [state, setState] = useState<PersonaState>(initialStateRef.current);
  const stateRef = useRef(state);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("initializing");
  const [mounted, setMounted] = useState(false);
  const flushPromiseRef = useRef<Promise<void> | null>(null);
  const realtimeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cloudReadyRef = useRef(false);

  const commitState = useCallback((next: PersonaState) => {
    stateRef.current = next;
    setState(next);
    localRepository.saveState(next);
  }, []);

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
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        setSyncStatus("offline");
        return;
      }

      cloudReadyRef.current = false;
      setSyncStatus("syncing");

      // Move the live in-memory state to UUIDs before the RPC starts. This closes
      // the migration race where a user action could otherwise queue a legacy ID
      // while V0.1 data was being converted in localStorage.
      const normalizedLocal = normalizeLegacySnapshot(stateRef.current);
      if (JSON.stringify(normalizedLocal) !== JSON.stringify(stateRef.current)) {
        commitState(normalizedLocal);
      }

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
    [commitState, flushQueuedMutations]
  );

  useEffect(() => {
    setMounted(true);

    if (authLoading) {
      cloudReadyRef.current = false;
      setSyncStatus("initializing");
      return;
    }

    if (!isCloudMode) {
      cloudReadyRef.current = false;
      commitState(localRepository.getState());
      setSyncStatus("local");

      const handleStorage = () => commitState(localRepository.getState());
      window.addEventListener("storage", handleStorage);
      return () => window.removeEventListener("storage", handleStorage);
    }

    if (!user) {
      cloudReadyRef.current = false;
      setSyncStatus("initializing");
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
    authLoading,
    commitState,
    initializeCloud,
    isCloudMode,
    refreshFromCloud,
    user,
  ]);

  const updateState = useCallback(
    (updater: (previous: PersonaState) => PersonaState) => {
      const previous = stateRef.current;
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

  const value = useMemo<PersonaStoreValue>(
    () => ({ state, updateState, syncStatus, mounted }),
    [mounted, state, syncStatus, updateState]
  );

  return createElement(PersonaStoreContext.Provider, { value }, children);
}

export function usePersonaStore(): PersonaStoreValue {
  const context = useContext(PersonaStoreContext);
  if (!context) {
    throw new Error("usePersonaStore must be used inside PersonaProvider");
  }
  return context;
}
