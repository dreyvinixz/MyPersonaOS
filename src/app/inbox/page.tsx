"use client";

import { useState } from "react";
import { Inbox, Zap } from "lucide-react";
import { InboxConvertDialog } from "@/components/inbox/InboxConvertDialog";
import { InboxItemRow } from "@/components/inbox/InboxItemRow";
import {
  isInboxItemPending,
  isInboxItemProcessed,
  type InboxConvertTarget,
  type InboxFilterMode,
} from "@/lib/inbox";
import { usePersonaState } from "@/lib/storage";
import { openQuickCapture } from "@/lib/ui-events";
import type { InboxItem } from "@/types";

function createUuid(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  throw new Error("This browser does not support crypto.randomUUID().");
}

export default function InboxPage() {
  const { state, updateState, mounted } = usePersonaState();
  const [filter, setFilter] = useState<InboxFilterMode>("all");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [convertingItem, setConvertingItem] = useState<{
    item: InboxItem;
    target: InboxConvertTarget;
  } | null>(null);
  const [convertTitle, setConvertTitle] = useState("");

  if (!mounted) return null;

  const filtered = state.inboxItems.filter((item) => {
    if (filter === "unprocessed") return isInboxItemPending(item);
    if (filter === "processed") return isInboxItemProcessed(item);
    return true;
  });

  const unprocessedCount = state.inboxItems.filter(isInboxItemPending).length;
  const processedCount = state.inboxItems.filter(isInboxItemProcessed).length;

  const handleMarkProcessed = (id: string) => {
    const iso = new Date().toISOString();
    updateState((previous) => ({
      ...previous,
      inboxItems: previous.inboxItems.map((item) => {
        if (item.id !== id || item.status === "converted") return item;
        const archive = item.status !== "archived";
        return {
          ...item,
          status: archive ? "archived" : "pending",
          processedAt: archive ? iso : undefined,
          updatedAt: iso,
        };
      }),
    }));
  };

  const handleDelete = (id: string) => {
    const confirmed = window.confirm(
      "Excluir este item permanentemente da Inbox?"
    );
    if (!confirmed) return;

    updateState((previous) => ({
      ...previous,
      inboxItems: previous.inboxItems.filter((item) => item.id !== id),
    }));
    setActiveMenu(null);
  };

  const handleArchive = (id: string) => {
    const iso = new Date().toISOString();
    updateState((previous) => ({
      ...previous,
      inboxItems: previous.inboxItems.map((item) =>
        item.id === id
          ? { ...item, status: "archived", processedAt: iso, updatedAt: iso }
          : item
      ),
    }));
    setActiveMenu(null);
  };

  const handleClearProcessed = () => {
    if (processedCount === 0) return;

    const confirmed = window.confirm(
      `Excluir permanentemente ${processedCount} item${
        processedCount === 1 ? "" : "s"
      } processado${processedCount === 1 ? "" : "s"}?`
    );
    if (!confirmed) return;

    updateState((previous) => ({
      ...previous,
      inboxItems: previous.inboxItems.filter((item) => !isInboxItemProcessed(item)),
    }));
  };

  const openConvert = (item: InboxItem, target: InboxConvertTarget) => {
    if (item.status !== "pending") return;
    setConvertingItem({ item, target });
    setConvertTitle(item.content);
    setActiveMenu(null);
  };

  const closeConvert = () => {
    setConvertingItem(null);
    setConvertTitle("");
  };

  const handleConvertConfirm = () => {
    if (!convertingItem || !convertTitle.trim()) return;

    const title = convertTitle.trim();
    const { item, target } = convertingItem;
    const now = new Date().toISOString();
    const targetId = createUuid();

    if (target === "task") {
      updateState((previous) => ({
        ...previous,
        tasks: [
          {
            id: targetId,
            title,
            status: "pending" as const,
            priority: "medium" as const,
            isToday: false,
            createdAt: now,
            updatedAt: now,
          },
          ...previous.tasks,
        ],
        inboxItems: previous.inboxItems.map((candidate) =>
          candidate.id === item.id
            ? {
                ...candidate,
                status: "converted" as const,
                convertedToType: "task" as const,
                convertedToId: targetId,
                processedAt: now,
                updatedAt: now,
              }
            : candidate
        ),
      }));
    } else {
      updateState((previous) => ({
        ...previous,
        projects: [
          {
            id: targetId,
            name: title,
            description: `Originado da Inbox: "${item.content.substring(0, 80)}"`,
            progress: 0,
            tasks: [],
            createdAt: now,
            updatedAt: now,
          },
          ...previous.projects,
        ],
        inboxItems: previous.inboxItems.map((candidate) =>
          candidate.id === item.id
            ? {
                ...candidate,
                status: "converted" as const,
                convertedToType: "project" as const,
                convertedToId: targetId,
                processedAt: now,
                updatedAt: now,
              }
            : candidate
        ),
      }));
    }

    closeConvert();
  };

  const filters: { mode: InboxFilterMode; label: string; count: number }[] = [
    { mode: "all", label: "Todos", count: state.inboxItems.length },
    { mode: "unprocessed", label: "Pendentes", count: unprocessedCount },
    { mode: "processed", label: "Processados", count: processedCount },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-24 lg:pb-8">
      <div className="mb-8">
        <p
          className="text-xs uppercase font-mono tracking-[0.2em] font-semibold mb-2"
          style={{ color: "var(--text-subtle)" }}
        >
          Entrada Rápida
        </p>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Inbox size={32} style={{ color: "var(--accent)" }} />
            <h1
              className="text-3xl sm:text-4xl font-extrabold tracking-tight"
              style={{ color: "var(--text)" }}
            >
              Inbox
            </h1>
            {unprocessedCount > 0 && (
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full font-mono"
                style={{
                  background: "var(--accent-dim)",
                  color: "var(--accent-hover)",
                  border: "1px solid rgba(155,135,245,0.25)",
                }}
              >
                {unprocessedCount}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={openQuickCapture}
            className="hidden sm:flex items-center gap-2 text-xs font-medium px-3.5 py-2 rounded-lg border transition-all hover:bg-[var(--card-hover)]"
            style={{
              color: "var(--text-muted)",
              borderColor: "var(--border)",
              background: "rgba(255,255,255,0.02)",
            }}
          >
            <Zap size={14} style={{ color: "var(--cyan)" }} />
            Capturar
            <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[var(--surface)] text-[var(--text-subtle)] border border-[var(--border-subtle)]">
              Ctrl/⌘ K
            </kbd>
          </button>
        </div>

        <p
          className="mt-2 text-base font-normal"
          style={{ color: "var(--text-muted)" }}
        >
          Capture primeiro. Organize depois.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 mb-5 px-1">
        <div className="flex flex-wrap items-center gap-1.5">
          {filters.map(({ mode, label, count }) => (
            <button
              type="button"
              key={mode}
              onClick={() => setFilter(mode)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
              style={
                filter === mode
                  ? {
                      background: "var(--accent-dim)",
                      color: "var(--accent-hover)",
                      border: "1px solid var(--accent)",
                    }
                  : {
                      color: "var(--text-muted)",
                      border: "1px solid transparent",
                      background: "rgba(255,255,255,0.01)",
                    }
              }
            >
              {label}
              <span className="text-xs font-mono font-bold opacity-80">{count}</span>
            </button>
          ))}
        </div>

        {processedCount > 0 && (
          <button
            type="button"
            onClick={handleClearProcessed}
            className="text-xs font-semibold px-3 py-1.5 rounded-md transition-colors"
            style={{ color: "var(--red)", background: "var(--red-dim)" }}
          >
            Limpar processados
          </button>
        )}
      </div>

      <div
        className="rounded-xl border shadow-sm"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
          {filtered.length === 0 ? (
            <li className="p-12 text-center" style={{ color: "var(--text-muted)" }}>
              <div className="flex flex-col items-center gap-3">
                <Inbox size={40} strokeWidth={1} style={{ color: "var(--border)" }} />
                <div>
                  <p className="text-sm font-medium mb-1">
                    {filter === "all"
                      ? "Sua Inbox está limpa!"
                      : filter === "unprocessed"
                        ? "Nenhum item pendente."
                        : "Nenhum item processado."}
                  </p>
                  <button
                    type="button"
                    onClick={openQuickCapture}
                    className="text-xs hover:underline"
                    style={{ color: "var(--accent)" }}
                  >
                    Capturar algo novo
                  </button>
                </div>
              </div>
            </li>
          ) : (
            filtered.map((item) => (
              <InboxItemRow
                key={item.id}
                item={item}
                menuOpen={activeMenu === item.id}
                onToggleProcessed={() => handleMarkProcessed(item.id)}
                onToggleMenu={() =>
                  setActiveMenu(activeMenu === item.id ? null : item.id)
                }
                onConvert={(target) => openConvert(item, target)}
                onArchive={() => handleArchive(item.id)}
                onDelete={() => handleDelete(item.id)}
              />
            ))
          )}
        </ul>
      </div>

      {convertingItem && (
        <InboxConvertDialog
          item={convertingItem.item}
          target={convertingItem.target}
          title={convertTitle}
          onTitleChange={setConvertTitle}
          onClose={closeConvert}
          onConfirm={handleConvertConfirm}
        />
      )}
    </div>
  );
}
