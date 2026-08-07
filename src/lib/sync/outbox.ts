import type {
  ContentPiece,
  EnglishWord,
  InboxItem,
  PersonaState,
  Project,
  Task,
} from "@/types";
import { supabaseRepository } from "@/lib/repositories/supabase-repository";

const OUTBOX_KEY = "mypersonaos_cloud_outbox_v1";

type MutationBase = {
  mutationId: string;
  userId: string;
  createdAt: string;
};

type CloudMutationPayload =
  | { kind: "saveMainFocus"; value: string }
  | { kind: "upsertTask"; entity: Task }
  | { kind: "deleteTask"; entityId: string }
  | { kind: "upsertProject"; entity: Project }
  | { kind: "deleteProject"; entityId: string }
  | { kind: "upsertInboxItem"; entity: InboxItem }
  | { kind: "deleteInboxItem"; entityId: string }
  | { kind: "upsertContentPiece"; entity: ContentPiece }
  | { kind: "deleteContentPiece"; entityId: string }
  | { kind: "upsertEnglishWord"; entity: EnglishWord }
  | { kind: "deleteEnglishWord"; entityId: string };

export type CloudMutation = MutationBase & CloudMutationPayload;

function randomId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `mutation-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function readAll(): CloudMutation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(OUTBOX_KEY);
    return raw ? (JSON.parse(raw) as CloudMutation[]) : [];
  } catch (error) {
    console.error("Failed to read cloud outbox:", error);
    return [];
  }
}

function writeAll(mutations: CloudMutation[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(OUTBOX_KEY, JSON.stringify(mutations));
}

function mutationKey(mutation: CloudMutation): string {
  switch (mutation.kind) {
    case "saveMainFocus":
      return `${mutation.userId}:mainFocus`;
    case "upsertTask":
      return `${mutation.userId}:task:${mutation.entity.id}`;
    case "deleteTask":
      return `${mutation.userId}:task:${mutation.entityId}`;
    case "upsertProject":
      return `${mutation.userId}:project:${mutation.entity.id}`;
    case "deleteProject":
      return `${mutation.userId}:project:${mutation.entityId}`;
    case "upsertInboxItem":
      return `${mutation.userId}:inbox:${mutation.entity.id}`;
    case "deleteInboxItem":
      return `${mutation.userId}:inbox:${mutation.entityId}`;
    case "upsertContentPiece":
      return `${mutation.userId}:content:${mutation.entity.id}`;
    case "deleteContentPiece":
      return `${mutation.userId}:content:${mutation.entityId}`;
    case "upsertEnglishWord":
      return `${mutation.userId}:english:${mutation.entity.id}`;
    case "deleteEnglishWord":
      return `${mutation.userId}:english:${mutation.entityId}`;
  }
}

function withMeta(userId: string, mutation: CloudMutationPayload): CloudMutation {
  return {
    ...mutation,
    mutationId: randomId(),
    userId,
    createdAt: new Date().toISOString(),
  } as CloudMutation;
}

function changed<T>(before: T, after: T): boolean {
  return JSON.stringify(before) !== JSON.stringify(after);
}

function diffCollection<T extends { id: string }>(
  previous: T[],
  next: T[],
  onUpsert: (entity: T) => CloudMutation,
  onDelete: (id: string) => CloudMutation
): CloudMutation[] {
  const upserts: CloudMutation[] = [];
  const deletes: CloudMutation[] = [];
  const previousById = new Map(previous.map((entity) => [entity.id, entity]));
  const nextById = new Map(next.map((entity) => [entity.id, entity]));

  next.forEach((entity) => {
    const before = previousById.get(entity.id);
    if (!before || changed(before, entity)) upserts.push(onUpsert(entity));
  });

  previous.forEach((entity) => {
    if (!nextById.has(entity.id)) deletes.push(onDelete(entity.id));
  });

  return [...upserts, ...deletes];
}

export function buildCloudMutations(
  previous: PersonaState,
  next: PersonaState,
  userId: string
): CloudMutation[] {
  const mutations: CloudMutation[] = [];

  if (previous.mainFocus !== next.mainFocus) {
    mutations.push(withMeta(userId, { kind: "saveMainFocus", value: next.mainFocus }));
  }

  // Projects precede Tasks so a newly linked task never races its FK target.
  mutations.push(
    ...diffCollection(
      previous.projects,
      next.projects,
      (entity) => withMeta(userId, { kind: "upsertProject", entity }),
      (entityId) => withMeta(userId, { kind: "deleteProject", entityId })
    ),
    ...diffCollection(
      previous.tasks,
      next.tasks,
      (entity) => withMeta(userId, { kind: "upsertTask", entity }),
      (entityId) => withMeta(userId, { kind: "deleteTask", entityId })
    ),
    ...diffCollection(
      previous.inboxItems,
      next.inboxItems,
      (entity) => withMeta(userId, { kind: "upsertInboxItem", entity }),
      (entityId) => withMeta(userId, { kind: "deleteInboxItem", entityId })
    ),
    ...diffCollection(
      previous.contentPieces,
      next.contentPieces,
      (entity) => withMeta(userId, { kind: "upsertContentPiece", entity }),
      (entityId) => withMeta(userId, { kind: "deleteContentPiece", entityId })
    ),
    ...diffCollection(
      previous.englishWords,
      next.englishWords,
      (entity) => withMeta(userId, { kind: "upsertEnglishWord", entity }),
      (entityId) => withMeta(userId, { kind: "deleteEnglishWord", entityId })
    )
  );

  return mutations;
}

export function enqueueCloudMutations(mutations: CloudMutation[]): void {
  if (mutations.length === 0) return;
  const byKey = new Map(readAll().map((mutation) => [mutationKey(mutation), mutation]));
  mutations.forEach((mutation) => byKey.set(mutationKey(mutation), mutation));
  writeAll(Array.from(byKey.values()));
}

export function getPendingMutationCount(userId: string): number {
  return readAll().filter((mutation) => mutation.userId === userId).length;
}

async function applyMutation(mutation: CloudMutation): Promise<void> {
  switch (mutation.kind) {
    case "saveMainFocus":
      return supabaseRepository.saveMainFocus(mutation.userId, mutation.value);
    case "upsertProject":
      return supabaseRepository.upsertProject(mutation.userId, mutation.entity);
    case "deleteProject":
      return supabaseRepository.deleteProject(mutation.userId, mutation.entityId);
    case "upsertTask":
      return supabaseRepository.upsertTask(mutation.userId, mutation.entity);
    case "deleteTask":
      return supabaseRepository.deleteTask(mutation.userId, mutation.entityId);
    case "upsertInboxItem":
      return supabaseRepository.upsertInboxItem(mutation.userId, mutation.entity);
    case "deleteInboxItem":
      return supabaseRepository.deleteInboxItem(mutation.userId, mutation.entityId);
    case "upsertContentPiece":
      return supabaseRepository.upsertContentPiece(mutation.userId, mutation.entity);
    case "deleteContentPiece":
      return supabaseRepository.deleteContentPiece(mutation.userId, mutation.entityId);
    case "upsertEnglishWord":
      return supabaseRepository.upsertEnglishWord(mutation.userId, mutation.entity);
    case "deleteEnglishWord":
      return supabaseRepository.deleteEnglishWord(mutation.userId, mutation.entityId);
  }
}

export async function flushCloudOutbox(userId: string): Promise<void> {
  while (true) {
    const nextMutation = readAll().find((mutation) => mutation.userId === userId);
    if (!nextMutation) return;

    await applyMutation(nextMutation);

    const current = readAll();
    writeAll(
      current.filter((mutation) => mutation.mutationId !== nextMutation.mutationId)
    );
  }
}
