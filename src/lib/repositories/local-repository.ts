import { PersonaState } from "@/types";
import { getPersonaState, savePersonaState } from "@/lib/storage";

export class LocalRepository {
  getState(): PersonaState {
    return getPersonaState();
  }

  saveState(state: PersonaState): void {
    savePersonaState(state);
  }
}

export const localRepository = new LocalRepository();
