import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

const DOMAIN_TABLES = [
  "user_profiles",
  "inbox_items",
  "tasks",
  "projects",
  "content_pieces",
  "english_words",
] as const;

/**
 * One channel per authenticated PersonaProvider. We intentionally avoid
 * per-user postgres_changes filters so DELETE events are also observed.
 * RLS remains the authorization boundary for which rows the subscriber can see.
 */
export function subscribeToPersonaRealtime(
  userId: string,
  onRemoteChange: () => void
): RealtimeChannel | null {
  if (!userId) return null;

  const supabase = createClient();
  let channel = supabase.channel(`persona-sync-${userId}`);

  DOMAIN_TABLES.forEach((table) => {
    channel = channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table,
      },
      onRemoteChange
    );
  });

  return channel.subscribe();
}
