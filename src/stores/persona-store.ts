"use client";

import { useEffect, useState, useCallback } from "react";
import type { PersonaState, SyncStatus } from "@/types";
import { localRepository } from "@/lib/repositories/local-repository";
import { supabaseRepository } from "@/lib/repositories/supabase-repository";
import { useAuth } from "@/components/auth/AuthProvider";
import { runLocalToCloudMigration } from "@/lib/sync/migration";
import { subscribeToPersonaRealtime } from "@/lib/sync/realtime";

export function usePersonaStore() {
  const { user, isCloudMode } = useAuth();
  const [state, setState] = useState<PersonaState>(() =>
    localRepository.getState()
  );
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("initializing");
  const [mounted, setMounted] = useState(false);

  const loadCloudState = useCallback(async (userId: string) => {
    try {
      setSyncStatus("syncing");
      // 1. Run local -> cloud idempotent migration
      await runLocalToCloudMigration(userId);

      // 2. Fetch full state from Supabase
      const cloudState = await supabaseRepository.fetchAllState(userId);
      setState(cloudState);
      localRepository.saveState(cloudState);
      setSyncStatus("synced");
    } catch (err) {
      console.error("Failed to load cloud state:", err);
      setSyncStatus("error");
    }
  }, []);

  useEffect(() => {
    setMounted(true);

    if (!isCloudMode || !user) {
      const local = localRepository.getState();
      setState(local);
      setSyncStatus("local");
      return;
    }

    let isMounted = true;
    loadCloudState(user.id);

    // Subscribe to Postgres Changes Realtime
    const channel = subscribeToPersonaRealtime(user.id, () => {
      if (isMounted) {
        loadCloudState(user.id);
      }
    });

    return () => {
      isMounted = false;
      if (channel) channel.unsubscribe();
    };
  }, [isCloudMode, user, loadCloudState]);

  const updateState = useCallback(
    (updater: (prev: PersonaState) => PersonaState) => {
      setState((prev) => {
        const next = updater(prev);

        // Always save to localStorage for offline cache
        localRepository.saveState(next);

        // If in Cloud Mode and authenticated, push mutations asynchronously
        if (isCloudMode && user) {
          setSyncStatus("syncing");
          
          const syncOps: Promise<void>[] = [];

          if (prev.mainFocus !== next.mainFocus) {
            syncOps.push(supabaseRepository.saveMainFocus(user.id, next.mainFocus));
          }

          next.inboxItems.forEach((item) => {
            syncOps.push(supabaseRepository.upsertInboxItem(user.id, item));
          });

          next.tasks.forEach((task) => {
            syncOps.push(supabaseRepository.upsertTask(user.id, task));
          });

          next.projects.forEach((project) => {
            syncOps.push(supabaseRepository.upsertProject(user.id, project));
          });

          next.contentPieces.forEach((content) => {
            syncOps.push(supabaseRepository.upsertContentPiece(user.id, content));
          });

          next.englishWords.forEach((word) => {
            syncOps.push(supabaseRepository.upsertEnglishWord(user.id, word));
          });

          Promise.all(syncOps)
            .then(() => setSyncStatus("synced"))
            .catch((err) => {
              console.error("Cloud sync mutation error:", err);
              setSyncStatus("error");
            });
        }

        return next;
      });
    },
    [isCloudMode, user]
  );

  return { state, updateState, syncStatus, mounted };
}
