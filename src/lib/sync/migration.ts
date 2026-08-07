import { createClient } from "@/lib/supabase/client";
import { localRepository } from "@/lib/repositories/local-repository";
import type { PersonaState } from "@/types";

export type MigrationResult = {
  ok: boolean;
  imported: boolean;
  reason: "already_migrated" | "cloud_has_data" | "local_imported" | "skipped";
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function newUuid(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  throw new Error("This browser does not support crypto.randomUUID(), required for safe migration.");
}

function buildIdMap(ids: string[]): Map<string, string> {
  const map = new Map<string, string>();
  ids.forEach((id) => map.set(id, UUID_RE.test(id) ? id : newUuid()));
  return map;
}

/**
 * V0.1 used IDs such as `1`, `p1`, `i1`. PostgreSQL V0.2 uses UUIDs.
 * Normalize a snapshot in memory before calling the atomic import RPC and
 * preserve cross-entity references while doing so.
 */
export function normalizeLegacySnapshot(state: PersonaState): PersonaState {
  const projectIds = buildIdMap(state.projects.map((project) => project.id));
  const taskIds = buildIdMap(state.tasks.map((task) => task.id));
  const inboxIds = buildIdMap(state.inboxItems.map((item) => item.id));
  const contentIds = buildIdMap(state.contentPieces.map((content) => content.id));
  const englishIds = buildIdMap(state.englishWords.map((word) => word.id));

  return {
    ...state,
    projects: state.projects.map((project) => ({
      ...project,
      id: projectIds.get(project.id)!,
      tasks: [],
    })),
    tasks: state.tasks.map((task) => ({
      ...task,
      id: taskIds.get(task.id)!,
      projectId: task.projectId
        ? projectIds.get(task.projectId) ||
          (UUID_RE.test(task.projectId) ? task.projectId : undefined)
        : undefined,
    })),
    inboxItems: state.inboxItems.map((item) => {
      let convertedToId = item.convertedToId;
      if (convertedToId && item.convertedToType === "task") {
        convertedToId =
          taskIds.get(convertedToId) ||
          (UUID_RE.test(convertedToId) ? convertedToId : undefined);
      }
      if (convertedToId && item.convertedToType === "project") {
        convertedToId =
          projectIds.get(convertedToId) ||
          (UUID_RE.test(convertedToId) ? convertedToId : undefined);
      }

      return {
        ...item,
        id: inboxIds.get(item.id)!,
        convertedToId,
      };
    }),
    contentPieces: state.contentPieces.map((content) => ({
      ...content,
      id: contentIds.get(content.id)!,
    })),
    englishWords: state.englishWords.map((word) => ({
      ...word,
      id: englishIds.get(word.id)!,
    })),
  };
}

export async function runLocalToCloudMigration(
  userId: string
): Promise<MigrationResult> {
  const supabase = createClient();

  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("migration_version")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    throw new Error(`Failed to check migration version: ${profileError.message}`);
  }

  if (profile && profile.migration_version >= 1) {
    return {
      ok: true,
      imported: false,
      reason: "already_migrated",
    };
  }

  // Keep a recoverable browser-side snapshot before the first cloud migration.
  localRepository.createBackup("pre-v0.2-cloud-migration");

  const localSnapshot = localRepository.getState();
  const normalizedSnapshot = normalizeLegacySnapshot(localSnapshot);

  const { data, error: rpcError } = await supabase.rpc("import_local_snapshot", {
    snapshot: normalizedSnapshot,
  });

  if (rpcError) {
    throw new Error(`Atomic local-to-cloud migration failed: ${rpcError.message}`);
  }

  const reason =
    data?.reason === "cloud_has_data"
      ? "cloud_has_data"
      : data?.reason === "already_migrated"
        ? "already_migrated"
        : data?.reason === "local_imported"
          ? "local_imported"
          : "skipped";

  return {
    ok: true,
    imported: Boolean(data?.imported),
    reason,
  };
}
