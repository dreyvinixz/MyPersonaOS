import type { PersonaState } from "@/types";

const STORAGE_KEY = "mypersonaos_state_v1";
const BACKUP_PREFIX = "mypersonaos_backup";

function createInitialState(): PersonaState {
  const now = new Date().toISOString();
  return {
    mainFocus: "Finish CodeToday video #01",
    tasks: [
      {
        id: "a1b2c3d4-0001-4000-8000-000000000001",
        title: "Review script for CodeToday #01",
        status: "in-progress",
        priority: "high",
        isToday: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "a1b2c3d4-0002-4000-8000-000000000002",
        title: "Practice 15 mins English read-aloud",
        status: "pending",
        priority: "medium",
        isToday: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "a1b2c3d4-0003-4000-8000-000000000003",
        title: "Outline Quant Base initial paper",
        status: "pending",
        priority: "low",
        isToday: true,
        createdAt: now,
        updatedAt: now,
      },
    ],
    projects: [
      {
        id: "b1c2d3e4-0001-4000-8000-000000000001",
        name: "MyPersonaOS Launch",
        description: "Personal Life OS V0.1 release",
        progress: 60,
        tasks: [],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "b1c2d3e4-0002-4000-8000-000000000002",
        name: "English Lab Method",
        description: "Daily habit tracking & vocab loop",
        progress: 35,
        tasks: [],
        createdAt: now,
        updatedAt: now,
      },
    ],
    contentPieces: [
      {
        id: "c1d2e3f4-0001-4000-8000-000000000001",
        title: "Building an OS for Your Life in 2026",
        brand: "codetoday",
        stage: "script",
        platforms: ["youtube", "reels"],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "c1d2e3f4-0002-4000-8000-000000000002",
        title: "Why Focus Belongs to Today",
        brand: "personal",
        stage: "idea",
        createdAt: now,
        updatedAt: now,
      },
    ],
    inboxItems: [
      {
        id: "d1e2f3a4-0001-4000-8000-000000000001",
        content: "Explore Supabase RLS policies for multi-device sync",
        type: "text",
        status: "pending",
        createdAt: now,
        updatedAt: now,
      },
    ],
    englishWords: [
      {
        id: "e1f2a3b4-0001-4000-8000-000000000001",
        term: "Resilience",
        definition: "The capacity to withstand or recover quickly from difficulties.",
        example: "Building a personal system requires resilience.",
        masteryLevel: 4,
        createdAt: now,
        updatedAt: now,
      },
    ],
  };
}

function normalizeState(parsed: Partial<PersonaState>): PersonaState {
  const initial = createInitialState();
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
  getState(): PersonaState {
    if (typeof window === "undefined") return createInitialState();

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const initial = createInitialState();
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
        return initial;
      }
      return normalizeState(JSON.parse(raw) as Partial<PersonaState>);
    } catch (error) {
      console.error("Failed to read local PersonaState:", error);
      return createInitialState();
    }
  }

  saveState(state: PersonaState): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  createBackup(label = "manual"): string | null {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const key = `${BACKUP_PREFIX}_${label}_${new Date().toISOString()}`;
    window.localStorage.setItem(key, raw);
    return key;
  }
}

export const localRepository = new LocalRepository();
