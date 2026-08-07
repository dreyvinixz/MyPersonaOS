"use client";

import { usePersonaStore } from "@/stores/persona-store";

/**
 * Compatibility facade for existing components.
 * Local persistence now belongs to LocalRepository and the shared state lives
 * in PersonaProvider. New code may import usePersonaStore directly.
 */
export function usePersonaState() {
  return usePersonaStore();
}
