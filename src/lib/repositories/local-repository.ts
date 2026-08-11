import type { PersonaState } from "@/types";
import { createEmptyPersonaState } from "@/lib/persona-state";

const LEGACY_STORAGE_KEY = "mypersonaos_state_v1";
const LOCAL_STORAGE_KEY = "mypersonaos_state_v2_local";
const LEGACY_OWNER_KEY = "mypersonaos_legacy_owner_v1";
const BACKUP_PREFIX = "mypersonaos_backup";

function storageKey(userId?: string): string {
  return userId ? `mypersonaos_state_v2_user_${userId}` : LOCAL_STORAGE_KEY;
}

function getLegacyCandidate(userId?: string): string | null {
  const localState = window.localStorage.getItem(LOCAL_STORAGE_KEY);
  const legacyState = window.localStorage.getItem(LEGACY_STORAGE_KEY);

  if (!userId) return localState || legacyState;

  const claimedOwner = window.localStorage.getItem(LEGACY_OWNER_KEY);
  if (claimedOwner && claimedOwner !== userId) return null;

  const candidate = localState || legacyState;
  if (candidate && !claimedOwner) {
    window.localStorage.setItem(LEGACY_OWNER_KEY, userId);
  }
  return candidate;
}

function normalizeState(parsed: Partial<PersonaState>): PersonaState {
  const initial = createEmptyPersonaState();
  const now = new Date().toISOString();

  return {
    mainFocus: parsed.mainFocus ?? initial.mainFocus,
    tasks: (parsed.tasks ?? initial.tasks).map((task) => ({
      ...task,
      updatedAt: task.updatedAt || task.createdAt || now,
    })),
    projects: (parsed.projects ?? initial.projects).map((project) => ({
      ...project,
      tasks: project.tasks ?? [],
      updatedAt: project.updatedAt || project.createdAt || now,
    })),
    contentPieces: (parsed.contentPieces ?? initial.contentPieces).map((content) => ({
      ...content,
      platforms: content.platforms ?? [],
      updatedAt: content.updatedAt || content.createdAt || now,
    })),
    inboxItems: (parsed.inboxItems ?? initial.inboxItems).map((item) => {
      const legacy = item as typeof item & { processed?: boolean };
      const status = item.status || (legacy.processed ? "archived" : "pending");
      return {
        ...item,
        status,
        updatedAt: item.updatedAt || item.createdAt || now,
      };
    }),
    englishWords: (parsed.englishWords ?? initial.englishWords).map((word) => ({
      ...word,
      updatedAt: word.updatedAt || word.createdAt || now,
    })),
  };
}

export class LocalRepository {
  getState(userId?: string): PersonaState {
    if (typeof window === "undefined") return createEmptyPersonaState();

    try {
      const key = storageKey(userId);
      const raw = window.localStorage.getItem(key) || getLegacyCandidate(userId);
      if (!raw) {
        const initial = createEmptyPersonaState();
        window.localStorage.setItem(key, JSON.stringify(initial));
        return initial;
      }
      const state = normalizeState(JSON.parse(raw) as Partial<PersonaState>);
      window.localStorage.setItem(key, JSON.stringify(state));
      return state;
    } catch (error) {
      console.error("Failed to read local PersonaState:", error);
      return createEmptyPersonaState();
    }
  }

  saveState(state: PersonaState, userId?: string): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(storageKey(userId), JSON.stringify(state));
  }

  createBackup(label = "manual", userId?: string): string | null {
    if (typeof window === "undefined") return null;
    // The first cloud migration runs before getState(userId) has copied a V0.1
    // snapshot into the user-scoped V0.2 key. Fall back to the eligible legacy
    // candidate so the exact pre-normalization payload remains recoverable.
    const raw =
      window.localStorage.getItem(storageKey(userId)) ?? getLegacyCandidate(userId);
    if (!raw) return null;

    const scope = userId ? `user_${userId}` : "local";
    const key = `${BACKUP_PREFIX}_${scope}_${label}_${new Date().toISOString()}`;
    window.localStorage.setItem(key, raw);
    return key;
  }
}

export const localRepository = new LocalRepository();
