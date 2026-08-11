export type TaskStatus = "pending" | "done" | "in-progress";
export type Priority = "high" | "medium" | "low";

export type ContentStage =
  | "idea"
  | "research"
  | "script"
  | "recording"
  | "editing"
  | "thumbnail"
  | "scheduled"
  | "published";

export type ContentBrand = "codetoday" | "personal" | "quantbase";

export type InboxItemStatus = "pending" | "archived" | "converted";
export type InboxItemType = "text" | "link" | "audio" | "image";

export type SyncStatus =
  | "initializing"
  | "local"
  | "syncing"
  | "synced"
  | "offline"
  | "error";

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority?: Priority;
  isToday?: boolean;
  dueDate?: string;
  projectId?: string;
  createdAt: string;
  completedAt?: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  progress: number; // 0-100
  deadline?: string;
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface ContentPiece {
  id: string;
  title: string;
  brand: ContentBrand;
  stage: ContentStage;
  platforms?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InboxItem {
  id: string;
  content: string;
  type: InboxItemType;
  status: InboxItemStatus;
  convertedToType?: "task" | "project";
  convertedToId?: string;
  createdAt: string;
  processedAt?: string;
  updatedAt: string;

  /** @deprecated Read only for V0.1 localStorage compatibility; new code uses status. */
  processed?: boolean;
}

export interface EnglishWord {
  id: string;
  term: string;
  definition: string;
  example?: string;
  masteryLevel: number; // 1-5
  lastReviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  settings?: Record<string, unknown>;
  migrationVersion: number;
  localImportedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PersonaState {
  mainFocus: string;
  tasks: Task[];
  projects: Project[];
  contentPieces: ContentPiece[];
  inboxItems: InboxItem[];
  englishWords: EnglishWord[];
}
