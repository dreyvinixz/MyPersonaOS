import type { PersonaState } from "@/types";

export const PERSONA_INPUT_LIMITS = {
  mainFocus: 500,
  taskTitle: 500,
  projectName: 200,
  projectDescription: 5_000,
  inboxContent: 10_000,
  contentTitle: 500,
  contentNotes: 20_000,
  englishTerm: 200,
  englishDefinition: 5_000,
  englishExample: 5_000,
} as const;

export function createEmptyPersonaState(): PersonaState {
  return {
    mainFocus: "",
    tasks: [],
    projects: [],
    contentPieces: [],
    inboxItems: [],
    englishWords: [],
  };
}
