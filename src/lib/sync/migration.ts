import { createClient } from "@/lib/supabase/client";
import { localRepository } from "@/lib/repositories/local-repository";

export async function runLocalToCloudMigration(userId: string): Promise<boolean> {
  const supabase = createClient();

  try {
    // 1. Fetch user profile migration status
    const { data: profile, error } = await supabase
      .from("user_profiles")
      .select("migration_version")
      .eq("id", userId)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      console.error("Failed to check profile migration version:", error);
    }

    // 2. Idempotency Check: If migration_version >= 1, skip migration
    if (profile && profile.migration_version >= 1) {
      return false;
    }

    // 3. Read current local snapshot
    const snapshot = localRepository.getState();

    // 4. Call single-transaction PostgreSQL RPC import_local_snapshot
    const { data, error: rpcError } = await supabase.rpc("import_local_snapshot", {
      snapshot,
    });

    if (rpcError) {
      console.error("Atomic local-to-cloud RPC migration error:", rpcError);
      return false;
    }

    return Boolean(data?.imported);
  } catch (err) {
    console.error("Unexpected migration error:", err);
    return false;
  }
}
