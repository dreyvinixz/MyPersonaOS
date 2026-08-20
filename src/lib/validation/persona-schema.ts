import type {
  ContentBrand,
  ContentPiece,
  ContentStage,
  EnglishWord,
  InboxItem,
  InboxItemStatus,
  InboxItemType,
  PersonaState,
  Priority,
  Project,
  SyncStatus,
  Task,
  TaskStatus,
} from "../../types";
import type { CloudMutation } from "../sync/outbox";

function createEmptyState(): PersonaState {
  return {
    mainFocus: "",
    tasks: [],
    projects: [],
    contentPieces: [],
    inboxItems: [],
    englishWords: [],
  };
}

// RFC4122 UUID v1-v5 matcher
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// String & Array Constraints (aligned with PostgreSQL constraints and SEC-06)
export const SCHEMA_LIMITS = {
  MAIN_FOCUS_MAX_LENGTH: 500,
  TASK_TITLE_MAX_LENGTH: 500,
  PROJECT_NAME_MAX_LENGTH: 200,
  PROJECT_DESC_MAX_LENGTH: 2000,
  INBOX_CONTENT_MAX_LENGTH: 2000,
  CONTENT_TITLE_MAX_LENGTH: 300,
  CONTENT_NOTES_MAX_LENGTH: 5000,
  CONTENT_PLATFORM_MAX_COUNT: 10,
  CONTENT_PLATFORM_MAX_LENGTH: 50,
  ENGLISH_TERM_MAX_LENGTH: 100,
  ENGLISH_DEF_MAX_LENGTH: 1000,
  ENGLISH_EXAMPLE_MAX_LENGTH: 1000,
} as const;

export const VALID_TASK_STATUSES: readonly TaskStatus[] = [
  "pending",
  "in-progress",
  "done",
];
export const VALID_PRIORITIES: readonly Priority[] = ["high", "medium", "low"];
export const VALID_CONTENT_STAGES: readonly ContentStage[] = [
  "idea",
  "research",
  "script",
  "recording",
  "editing",
  "thumbnail",
  "scheduled",
  "published",
];
export const VALID_CONTENT_BRANDS: readonly ContentBrand[] = [
  "codetoday",
  "personal",
  "quantbase",
];
export const VALID_INBOX_STATUSES: readonly InboxItemStatus[] = [
  "pending",
  "archived",
  "converted",
];
export const VALID_INBOX_TYPES: readonly InboxItemType[] = [
  "text",
  "link",
  "audio",
  "image",
];
export const VALID_SYNC_STATUSES: readonly SyncStatus[] = [
  "initializing",
  "local",
  "syncing",
  "synced",
  "offline",
  "error",
];

function isObject(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}

function sanitizeString(
  val: unknown,
  maxLength: number,
  fallback = ""
): string {
  if (typeof val !== "string") return fallback;
  const trimmed = val.trim();
  return trimmed.slice(0, maxLength);
}

function sanitizeOptionalString(
  val: unknown,
  maxLength: number
): string | undefined {
  if (typeof val !== "string" || val.trim().length === 0) return undefined;
  return val.trim().slice(0, maxLength);
}

function sanitizeIsoDate(val: unknown, fallback: string): string {
  if (typeof val !== "string") return fallback;
  const parsed = Date.parse(val);
  return isNaN(parsed) ? fallback : new Date(parsed).toISOString();
}

function sanitizeOptionalIsoDate(val: unknown): string | undefined {
  if (typeof val !== "string" || val.trim().length === 0) return undefined;
  const parsed = Date.parse(val);
  return isNaN(parsed) ? undefined : new Date(parsed).toISOString();
}

export function isValidUuid(id: unknown): id is string {
  return typeof id === "string" && UUID_REGEX.test(id);
}

export function validateTask(raw: unknown, now = new Date().toISOString()): Task | null {
  if (!isObject(raw)) return null;

  const id = typeof raw.id === "string" && raw.id.trim().length > 0 ? raw.id.trim() : null;
  if (!id) return null;

  const title = sanitizeString(raw.title, SCHEMA_LIMITS.TASK_TITLE_MAX_LENGTH);
  if (!title) return null;

  const status: TaskStatus = VALID_TASK_STATUSES.includes(raw.status as TaskStatus)
    ? (raw.status as TaskStatus)
    : "pending";

  const priority: Priority | undefined = VALID_PRIORITIES.includes(raw.priority as Priority)
    ? (raw.priority as Priority)
    : undefined;

  const isToday = typeof raw.isToday === "boolean" ? raw.isToday : undefined;
  const dueDate = sanitizeOptionalIsoDate(raw.dueDate);
  const projectId = sanitizeOptionalString(raw.projectId, 100);
  const createdAt = sanitizeIsoDate(raw.createdAt, now);
  const completedAt = sanitizeOptionalIsoDate(raw.completedAt);
  const updatedAt = sanitizeIsoDate(raw.updatedAt, createdAt);

  return {
    id,
    title,
    status,
    priority,
    isToday,
    dueDate,
    projectId,
    createdAt,
    completedAt,
    updatedAt,
  };
}

export function validateProject(raw: unknown, now = new Date().toISOString()): Project | null {
  if (!isObject(raw)) return null;

  const id = typeof raw.id === "string" && raw.id.trim().length > 0 ? raw.id.trim() : null;
  if (!id) return null;

  const name = sanitizeString(raw.name, SCHEMA_LIMITS.PROJECT_NAME_MAX_LENGTH);
  if (!name) return null;

  const description = sanitizeOptionalString(raw.description, SCHEMA_LIMITS.PROJECT_DESC_MAX_LENGTH);

  let progress = 0;
  if (typeof raw.progress === "number" && !isNaN(raw.progress)) {
    progress = Math.max(0, Math.min(100, Math.round(raw.progress)));
  }

  const deadline = sanitizeOptionalIsoDate(raw.deadline);

  const rawTasks = Array.isArray(raw.tasks) ? raw.tasks : [];
  const tasks: Task[] = [];
  for (const t of rawTasks) {
    const validated = validateTask(t, now);
    if (validated) tasks.push(validated);
  }

  const createdAt = sanitizeIsoDate(raw.createdAt, now);
  const updatedAt = sanitizeIsoDate(raw.updatedAt, createdAt);

  return {
    id,
    name,
    description,
    progress,
    deadline,
    tasks,
    createdAt,
    updatedAt,
  };
}

export function validateInboxItem(raw: unknown, now = new Date().toISOString()): InboxItem | null {
  if (!isObject(raw)) return null;

  const id = typeof raw.id === "string" && raw.id.trim().length > 0 ? raw.id.trim() : null;
  if (!id) return null;

  const content = sanitizeString(raw.content, SCHEMA_LIMITS.INBOX_CONTENT_MAX_LENGTH);
  if (!content) return null;

  const type: InboxItemType = VALID_INBOX_TYPES.includes(raw.type as InboxItemType)
    ? (raw.type as InboxItemType)
    : "text";

  let status: InboxItemStatus = "pending";
  if (VALID_INBOX_STATUSES.includes(raw.status as InboxItemStatus)) {
    status = raw.status as InboxItemStatus;
  } else if (raw.processed === true) {
    status = "archived";
  }

  const convertedToType =
    raw.convertedToType === "task" || raw.convertedToType === "project"
      ? raw.convertedToType
      : undefined;

  const convertedToId = sanitizeOptionalString(raw.convertedToId, 100);
  const createdAt = sanitizeIsoDate(raw.createdAt, now);
  const processedAt = sanitizeOptionalIsoDate(raw.processedAt);
  const updatedAt = sanitizeIsoDate(raw.updatedAt, createdAt);

  return {
    id,
    content,
    type,
    status,
    convertedToType,
    convertedToId,
    createdAt,
    processedAt,
    updatedAt,
  };
}

export function validateContentPiece(
  raw: unknown,
  now = new Date().toISOString()
): ContentPiece | null {
  if (!isObject(raw)) return null;

  const id = typeof raw.id === "string" && raw.id.trim().length > 0 ? raw.id.trim() : null;
  if (!id) return null;

  const title = sanitizeString(raw.title, SCHEMA_LIMITS.CONTENT_TITLE_MAX_LENGTH);
  if (!title) return null;

  const brand: ContentBrand = VALID_CONTENT_BRANDS.includes(raw.brand as ContentBrand)
    ? (raw.brand as ContentBrand)
    : "personal";

  const stage: ContentStage = VALID_CONTENT_STAGES.includes(raw.stage as ContentStage)
    ? (raw.stage as ContentStage)
    : "idea";

  const rawPlatforms = Array.isArray(raw.platforms) ? raw.platforms : [];
  const platforms: string[] = [];
  for (const p of rawPlatforms) {
    if (typeof p === "string" && p.trim().length > 0) {
      platforms.push(p.trim().slice(0, SCHEMA_LIMITS.CONTENT_PLATFORM_MAX_LENGTH));
      if (platforms.length >= SCHEMA_LIMITS.CONTENT_PLATFORM_MAX_COUNT) break;
    }
  }

  const notes = sanitizeOptionalString(raw.notes, SCHEMA_LIMITS.CONTENT_NOTES_MAX_LENGTH);
  const createdAt = sanitizeIsoDate(raw.createdAt, now);
  const updatedAt = sanitizeIsoDate(raw.updatedAt, createdAt);

  return {
    id,
    title,
    brand,
    stage,
    platforms,
    notes,
    createdAt,
    updatedAt,
  };
}

export function validateEnglishWord(
  raw: unknown,
  now = new Date().toISOString()
): EnglishWord | null {
  if (!isObject(raw)) return null;

  const id = typeof raw.id === "string" && raw.id.trim().length > 0 ? raw.id.trim() : null;
  if (!id) return null;

  const term = sanitizeString(raw.term, SCHEMA_LIMITS.ENGLISH_TERM_MAX_LENGTH);
  if (!term) return null;

  const definition = sanitizeString(raw.definition, SCHEMA_LIMITS.ENGLISH_DEF_MAX_LENGTH);
  if (!definition) return null;

  const example = sanitizeOptionalString(raw.example, SCHEMA_LIMITS.ENGLISH_EXAMPLE_MAX_LENGTH);

  let masteryLevel = 1;
  if (typeof raw.masteryLevel === "number" && !isNaN(raw.masteryLevel)) {
    masteryLevel = Math.max(1, Math.min(5, Math.round(raw.masteryLevel)));
  }

  const lastReviewedAt = sanitizeOptionalIsoDate(raw.lastReviewedAt);
  const createdAt = sanitizeIsoDate(raw.createdAt, now);
  const updatedAt = sanitizeIsoDate(raw.updatedAt, createdAt);

  return {
    id,
    term,
    definition,
    example,
    masteryLevel,
    lastReviewedAt,
    createdAt,
    updatedAt,
  };
}

export interface PersonaStateValidationResult {
  state: PersonaState;
  repairedCount: number;
  droppedCount: number;
  isValid: boolean;
}

export function validatePersonaState(raw: unknown): PersonaStateValidationResult {
  const empty = createEmptyState();
  if (!isObject(raw)) {
    return {
      state: empty,
      repairedCount: 0,
      droppedCount: 0,
      isValid: false,
    };
  }

  const now = new Date().toISOString();
  let repairedCount = 0;
  let droppedCount = 0;

  // Main Focus
  const mainFocus = sanitizeString(raw.mainFocus, SCHEMA_LIMITS.MAIN_FOCUS_MAX_LENGTH, "");
  if (typeof raw.mainFocus !== "string" && raw.mainFocus !== undefined) {
    repairedCount++;
  }

  // Tasks
  const tasks: Task[] = [];
  if (Array.isArray(raw.tasks)) {
    for (const t of raw.tasks) {
      const validated = validateTask(t, now);
      if (validated) {
        tasks.push(validated);
      } else {
        droppedCount++;
      }
    }
  } else if (raw.tasks !== undefined) {
    repairedCount++;
  }

  // Projects
  const projects: Project[] = [];
  if (Array.isArray(raw.projects)) {
    for (const p of raw.projects) {
      const validated = validateProject(p, now);
      if (validated) {
        projects.push(validated);
      } else {
        droppedCount++;
      }
    }
  } else if (raw.projects !== undefined) {
    repairedCount++;
  }

  // Content Pieces
  const contentPieces: ContentPiece[] = [];
  if (Array.isArray(raw.contentPieces)) {
    for (const c of raw.contentPieces) {
      const validated = validateContentPiece(c, now);
      if (validated) {
        contentPieces.push(validated);
      } else {
        droppedCount++;
      }
    }
  } else if (raw.contentPieces !== undefined) {
    repairedCount++;
  }

  // Inbox Items
  const inboxItems: InboxItem[] = [];
  if (Array.isArray(raw.inboxItems)) {
    for (const i of raw.inboxItems) {
      const validated = validateInboxItem(i, now);
      if (validated) {
        inboxItems.push(validated);
      } else {
        droppedCount++;
      }
    }
  } else if (raw.inboxItems !== undefined) {
    repairedCount++;
  }

  // English Words
  const englishWords: EnglishWord[] = [];
  if (Array.isArray(raw.englishWords)) {
    for (const w of raw.englishWords) {
      const validated = validateEnglishWord(w, now);
      if (validated) {
        englishWords.push(validated);
      } else {
        droppedCount++;
      }
    }
  } else if (raw.englishWords !== undefined) {
    repairedCount++;
  }

  const state: PersonaState = {
    mainFocus,
    tasks,
    projects,
    contentPieces,
    inboxItems,
    englishWords,
  };

  return {
    state,
    repairedCount,
    droppedCount,
    isValid: droppedCount === 0 && repairedCount === 0,
  };
}

export function validateCloudMutation(raw: unknown): CloudMutation | null {
  if (!isObject(raw)) return null;

  const mutationId =
    typeof raw.mutationId === "string" && raw.mutationId.trim().length > 0
      ? raw.mutationId.trim()
      : null;
  const userId =
    typeof raw.userId === "string" && raw.userId.trim().length > 0
      ? raw.userId.trim()
      : null;
  const createdAt = sanitizeIsoDate(raw.createdAt, new Date().toISOString());

  if (!mutationId || !userId) return null;

  const kind = typeof raw.kind === "string" ? raw.kind : null;
  if (!kind) return null;

  switch (kind) {
    case "saveMainFocus": {
      const value = sanitizeString(raw.value, SCHEMA_LIMITS.MAIN_FOCUS_MAX_LENGTH, "");
      return { mutationId, userId, createdAt, kind: "saveMainFocus", value };
    }
    case "upsertTask": {
      const entity = validateTask(raw.entity, createdAt);
      if (!entity) return null;
      return { mutationId, userId, createdAt, kind: "upsertTask", entity };
    }
    case "deleteTask": {
      const entityId = typeof raw.entityId === "string" && raw.entityId.trim().length > 0 ? raw.entityId.trim() : null;
      if (!entityId) return null;
      return { mutationId, userId, createdAt, kind: "deleteTask", entityId };
    }
    case "upsertProject": {
      const entity = validateProject(raw.entity, createdAt);
      if (!entity) return null;
      return { mutationId, userId, createdAt, kind: "upsertProject", entity };
    }
    case "deleteProject": {
      const entityId = typeof raw.entityId === "string" && raw.entityId.trim().length > 0 ? raw.entityId.trim() : null;
      if (!entityId) return null;
      return { mutationId, userId, createdAt, kind: "deleteProject", entityId };
    }
    case "upsertInboxItem": {
      const entity = validateInboxItem(raw.entity, createdAt);
      if (!entity) return null;
      return { mutationId, userId, createdAt, kind: "upsertInboxItem", entity };
    }
    case "deleteInboxItem": {
      const entityId = typeof raw.entityId === "string" && raw.entityId.trim().length > 0 ? raw.entityId.trim() : null;
      if (!entityId) return null;
      return { mutationId, userId, createdAt, kind: "deleteInboxItem", entityId };
    }
    case "upsertContentPiece": {
      const entity = validateContentPiece(raw.entity, createdAt);
      if (!entity) return null;
      return { mutationId, userId, createdAt, kind: "upsertContentPiece", entity };
    }
    case "deleteContentPiece": {
      const entityId = typeof raw.entityId === "string" && raw.entityId.trim().length > 0 ? raw.entityId.trim() : null;
      if (!entityId) return null;
      return { mutationId, userId, createdAt, kind: "deleteContentPiece", entityId };
    }
    case "upsertEnglishWord": {
      const entity = validateEnglishWord(raw.entity, createdAt);
      if (!entity) return null;
      return { mutationId, userId, createdAt, kind: "upsertEnglishWord", entity };
    }
    case "deleteEnglishWord": {
      const entityId = typeof raw.entityId === "string" && raw.entityId.trim().length > 0 ? raw.entityId.trim() : null;
      if (!entityId) return null;
      return { mutationId, userId, createdAt, kind: "deleteEnglishWord", entityId };
    }
    default:
      return null;
  }
}
