"use client";

import { useEffect, useState } from "react";
import { PersonaState } from "@/types";

const STORAGE_KEY = "mypersonaos_state_v1";
const STORAGE_EVENT = "persona_storage_update";

const now = new Date().toISOString();

const INITIAL_STATE: PersonaState = {
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

function normalizeState(parsed: Partial<PersonaState>): PersonaState {
  return {
    mainFocus: parsed.mainFocus || INITIAL_STATE.mainFocus,
    tasks: (parsed.tasks || INITIAL_STATE.tasks).map((t) => ({
      ...t,
      updatedAt: t.updatedAt || t.createdAt || now,
    })),
    projects: (parsed.projects || INITIAL_STATE.projects).map((p) => ({
      ...p,
      updatedAt: p.updatedAt || p.createdAt || now,
    })),
    contentPieces: (parsed.contentPieces || INITIAL_STATE.contentPieces).map(
      (c) => ({
        ...c,
        updatedAt: c.updatedAt || c.createdAt || now,
      })
    ),
    inboxItems: (parsed.inboxItems || INITIAL_STATE.inboxItems).map((item) => {
      // Backward compatibility mapping from legacy processed boolean
      const legacy = item as unknown as { processed?: boolean };
      let status = item.status;
      if (!status) {
        status = legacy.processed ? "archived" : "pending";
      }
      return {
        ...item,
        status,
        updatedAt: item.updatedAt || item.createdAt || now,
      };
    }),
    englishWords: (parsed.englishWords || INITIAL_STATE.englishWords).map(
      (w) => ({
        ...w,
        updatedAt: w.updatedAt || w.createdAt || now,
      })
    ),
  };
}

export function getPersonaState(): PersonaState {
  if (typeof window === "undefined") return INITIAL_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_STATE));
      return INITIAL_STATE;
    }
    const parsed = JSON.parse(raw);
    return normalizeState(parsed);
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

import { usePersonaStore } from "@/stores/persona-store";

export function usePersonaState() {
  const { state, updateState, syncStatus, mounted } = usePersonaStore();
  return { state, updateState, syncStatus, mounted };
}
