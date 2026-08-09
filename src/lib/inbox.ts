import type { InboxItem } from "@/types";

export type InboxFilterMode = "all" | "unprocessed" | "processed";
export type InboxConvertTarget = "task" | "project";

export function isInboxItemPending(item: InboxItem): boolean {
  return item.status === "pending" || (!item.status && !item.processed);
}

export function isInboxItemProcessed(item: InboxItem): boolean {
  return (
    item.status === "archived" ||
    item.status === "converted" ||
    Boolean(item.processed && !item.status)
  );
}

export function formatInboxDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
