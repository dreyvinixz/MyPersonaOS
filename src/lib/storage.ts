"use client";

import { useEffect, useState } from "react";
import {
  PersonaState,
  Task,
  Project,
  ContentPiece,
  InboxItem,
  EnglishWord,
} from "@/types";

const STORAGE_KEY = "mypersonaos_state_v1";

const INITIAL_STATE: PersonaState = {
  mainFocus: "Finish CodeToday video #01",
  tasks: [
    {
      id: "1",
      title: "Review script for CodeToday #01",
      status: "in-progress",
      priority: "high",
      isToday: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      title: "Practice 15 mins English read-aloud",
      status: "pending",
      priority: "medium",
      isToday: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "3",
      title: "Outline Quant Base initial paper",
      status: "pending",
      priority: "low",
      isToday: true,
      createdAt: new Date().toISOString(),
    },
  ],
  projects: [
    {
      id: "p1",
      name: "MyPersonaOS Launch",
      description: "Personal Life OS V0.1 release",
      progress: 60,
      tasks: [],
      createdAt: new Date().toISOString(),
    },
    {
      id: "p2",
      name: "English Lab Method",
      description: "Daily habit tracking & vocab loop",
      progress: 35,
      tasks: [],
      createdAt: new Date().toISOString(),
    },
  ],
  contentPieces: [
    {
      id: "c1",
      title: "Building an OS for Your Life in 2026",
      brand: "codetoday",
      stage: "script",
      platforms: ["youtube", "reels"],
      createdAt: new Date().toISOString(),
    },
    {
      id: "c2",
      title: "Why Focus Belongs to Today",
      brand: "personal",
      stage: "idea",
      createdAt: new Date().toISOString(),
    },
  ],
  inboxItems: [
    {
      id: "i1",
      content: "Explore Supabase RLS policies for multi-device sync",
      type: "text",
      createdAt: new Date().toISOString(),
      processed: false,
    },
  ],
  englishWords: [
    {
      id: "w1",
      term: "Resilience",
      definition: "The capacity to withstand or recover quickly from difficulties.",
      example: "Building a personal system requires resilience.",
      masteryLevel: 4,
      createdAt: new Date().toISOString(),
    },
  ],
};

const STORAGE_EVENT = "persona_storage_update";

export function getPersonaState(): PersonaState {
  if (typeof window === "undefined") return INITIAL_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_STATE));
      return INITIAL_STATE;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to parse PersonaStorage state:", err);
    return INITIAL_STATE;
  }
}

export function savePersonaState(state: PersonaState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event(STORAGE_EVENT));
  } catch (err) {
    console.error("Failed to save PersonaStorage state:", err);
  }
}

export function usePersonaState() {
  const [state, setState] = useState<PersonaState>(INITIAL_STATE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setState(getPersonaState());
    setMounted(true);

    const handleUpdate = () => {
      setState(getPersonaState());
    };

    window.addEventListener(STORAGE_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener(STORAGE_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const updateState = (updater: (prev: PersonaState) => PersonaState) => {
    const next = updater(state);
    setState(next);
    savePersonaState(next);
  };

  return { state, updateState, mounted };
}
