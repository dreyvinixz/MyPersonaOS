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

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority?: Priority;
  isToday?: boolean;
  dueDate?: string;
  projectId?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  progress: number; // 0-100
  deadline?: string;
  tasks: Task[];
  createdAt: string;
}

export interface ContentPiece {
  id: string;
  title: string;
  brand: ContentBrand;
  stage: ContentStage;
  platforms?: string[];
  notes?: string;
  createdAt: string;
}

export interface InboxItem {
  id: string;
  content: string;
  type: "text" | "link" | "audio" | "image";
  createdAt: string;
  processed: boolean;
}

export interface EnglishWord {
  id: string;
  term: string;
  definition: string;
  example?: string;
  masteryLevel: number; // 1-5
  lastReviewedAt?: string;
  createdAt: string;
}

export interface PersonaState {
  mainFocus: string;
  tasks: Task[];
  projects: Project[];
  contentPieces: ContentPiece[];
  inboxItems: InboxItem[];
  englishWords: EnglishWord[];
}
