"use client";

import Link from "next/link";
import { ArrowRight, Inbox as InboxIcon, Zap } from "lucide-react";
import { usePersonaState } from "@/lib/storage";
import { openQuickCapture } from "@/lib/ui-events";

export function QuickCapture() {
  const { state, mounted } = usePersonaState();

  if (!mounted) return null;

  const recentCaptures = state.inboxItems
    .filter((item) => !item.processed)
    .slice(0, 4);
  const unprocessedCount = state.inboxItems.filter(
    (item) => !item.processed
  ).length;

  return (
    <div
      className="rounded-xl border overflow-hidden shadow-sm"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
    >
      <div
        className="flex items-center justify-between px-5 py-4 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <h2 className="text-sm font-semibold" style={{ color: "var(--text)" }}>
          Quick Capture
        </h2>
        {unprocessedCount > 0 && (
          <Link
            href="/inbox"
            className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full transition-colors hover:opacity-80"
            style={{
              background: "var(--accent-dim)",
              color: "var(--accent)",
            }}
          >
            <InboxIcon size={10} />
            {unprocessedCount} na inbox
          </Link>
        )}
      </div>

      <div className="p-4">
        <button
          type="button"
          onClick={openQuickCapture}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-150 hover:border-[var(--accent)] group"
          style={{
            borderColor: "var(--border)",
            background: "var(--surface)",
          }}
        >
          <Zap
            size={16}
            strokeWidth={2}
            className="shrink-0 transition-colors group-hover:text-[var(--accent)]"
            style={{ color: "var(--text-subtle)" }}
          />
          <span
            className="flex-1 text-left text-sm"
            style={{ color: "var(--text-subtle)" }}
          >
            O que está na sua mente agora?
          </span>
          <kbd
            className="hidden sm:inline-flex font-mono text-[10px] px-1.5 py-0.5 rounded"
            style={{
              background: "var(--bg)",
              color: "var(--text-subtle)",
              border: "1px solid var(--border)",
            }}
          >
            Ctrl/⌘ K
          </kbd>
        </button>
      </div>

      {recentCaptures.length > 0 && (
        <div
          className="border-t px-4 py-3"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex items-center justify-between mb-2">
            <p
              className="text-[10px] uppercase tracking-widest"
              style={{ color: "var(--text-subtle)" }}
            >
              Pendentes na Inbox
            </p>
            <Link
              href="/inbox"
              className="flex items-center gap-1 text-[10px] font-medium transition-colors hover:opacity-80"
              style={{ color: "var(--accent)" }}
            >
              Ver todas <ArrowRight size={10} />
            </Link>
          </div>
          <ul className="flex flex-col gap-1">
            {recentCaptures.map((item) => (
              <li
                key={item.id}
                className="text-xs truncate flex items-center justify-between gap-2"
                style={{ color: "var(--text-muted)" }}
              >
                <span className="truncate">· {item.content}</span>
                <span
                  className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded shrink-0"
                  style={{
                    background: "var(--surface)",
                    color: "var(--text-subtle)",
                  }}
                >
                  {item.type}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
