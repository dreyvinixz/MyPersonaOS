import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

export function subscribeToPersonaRealtime(
  userId: string,
  onRemoteChange: () => void
): RealtimeChannel | null {
  if (!userId) return null;

  const supabase = createClient();

  const channel = supabase
    .channel(`persona-sync-${userId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        filter: `user_id=eq.${userId}`,
      },
      () => {
        onRemoteChange();
      }
    )
    .subscribe();

  return channel;
}
