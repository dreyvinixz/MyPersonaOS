"use client";

import { useState } from "react";
import { usePersonaState } from "@/lib/storage";
import {
  CheckCircle2,
  FolderPlus,
  Inbox,
  RotateCcw,
  Star,
  Trash2,
} from "lucide-react";

type InboxFilter = "pending" | "processed" | "all";
type ProcessAction = "today" | "project" | "done";

export default function InboxPage() {
  const { state, updateState, mounted } = usePersonaState();
  const [filter, setFilter] = useState<InboxFilter>("pending");

  if (!mounted) return null;

  const pendingCount = state.inboxItems.filter((item) => !item.processed).length;
  const processedCount = state.inboxItems.length - pendingCount;

  const visibleItems = state.inboxItems.filter((item) => {
    if (filter === "pending") return !item.processed;
    if (filter === "processed") return item.processed;
    return true;
  });

  const processItem = (id: string, action: ProcessAction) => {
    updateState((prev) => {
      const item = prev.inboxItems.find((entry) => entry.id === id);
      if (!item || item.processed) return prev;

      const createdAt = new Date().toISOString();
      const processedInboxItems = prev.inboxItems.map((entry) =>
        entry.id === id ? { ...entry, processed: true } : entry
      );

      if (action === "today") {
        return {
          ...prev,
          inboxItems: processedInboxItems,
          tasks: [
            {
              id: `task-${Date.now()}-${item.id}`,
              title: item.content,
              status: "pending",
              priority: "medium",
              isToday: true,
              createdAt,
            },
            ...prev.tasks,
          ],
        };
      }

      if (action === "project") {
        const projectName =
          item.content.length > 64
            ? `${item.content.slice(0, 61).trimEnd()}...`
            : item.content;

        return {
          ...prev,
          inboxItems: processedInboxItems,
          projects: [
            {
              id: `project-${Date.now()}-${item.id}`,
              name: projectName,
              description: "Criado a partir da Inbox.",
              progress: 0,
              tasks: [],
              createdAt,
            },
            ...prev.projects,
          ],
        };
      }

      return {
        ...prev,
        inboxItems: processedInboxItems,
      };
    });
  };

  const handleRestore = (id: string) => {
    updateState((prev) => ({
      ...prev,
      inboxItems: prev.inboxItems.map((item) =>
        item.id === id ? { ...item, processed: false } : item
      ),
    }));
  };

  const handleDelete = (id: string) => {
    updateState((prev) => ({
      ...prev,
      inboxItems: prev.inboxItems.filter((item) => item.id !== id),
    }));
  };

  const formatCapturedAt = (value: string) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p
            className="text-[10px] uppercase tracking-[0.25em] font-semibold mb-2"
            style={{ color: "var(--text-subtle)" }}
          >
            Entrada Rápida
          </p>
          <div className="flex items-center gap-3">
            <Inbox size={28} style={{ color: "var(--accent)" }} />
            <h1
              className="text-3xl font-bold tracking-tight"
              style={{ color: "var(--text)" }}
            >
              Inbox
            </h1>
          </div>
          <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
            Capture primeiro. Decida o destino quando tiver contexto.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span
            className="rounded-lg border px-2.5 py-1.5"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            <strong style={{ color: "var(--text)" }}>{pendingCount}</strong> pendentes
          </span>
          <span
            className="rounded-lg border px-2.5 py-1.5"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            <strong style={{ color: "var(--green)" }}>{processedCount}</strong> processados
          </span>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {([
          ["pending", "Pendentes"],
          ["processed", "Processados"],
          ["all", "Todos"],
        ] as const).map(([value, label]) => {
          const active = filter === value;
          return (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className="rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
              style={{
                borderColor: active ? "var(--accent)" : "var(--border)",
                background: active ? "var(--accent-dim)" : "var(--card)",
                color: active ? "var(--accent-hover)" : "var(--text-muted)",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div
        className="rounded-xl border overflow-hidden shadow-sm"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
          {visibleItems.length === 0 ? (
            <li className="p-12 text-center text-sm" style={{ color: "var(--text-muted)" }}>
              {filter === "pending"
                ? "Inbox zerada. Use Ctrl+K / Cmd+K para capturar qualquer ideia."
                : filter === "processed"
                  ? "Nenhum item processado ainda."
                  : "Sua Inbox está vazia."}
            </li>
          ) : (
            visibleItems.map((item) => (
              <li
                key={item.id}
                className="p-4 sm:p-5 hover:bg-[var(--card-hover)] transition-colors"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span
                          className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[var(--surface)]"
                          style={{ color: "var(--text-subtle)" }}
                        >
                          {item.type}
                        </span>
                        <span className="text-[11px]" style={{ color: "var(--text-subtle)" }}>
                          {formatCapturedAt(item.createdAt)}
                        </span>
                        {item.processed && (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] uppercase font-semibold"
                            style={{ color: "var(--green)" }}
                          >
                            <CheckCircle2 size={12} />
                            Processado
                          </span>
                        )}
                      </div>

                      <p
                        className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${
                          item.processed ? "opacity-55" : ""
                        }`}
                        style={{ color: "var(--text)" }}
                      >
                        {item.content}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="shrink-0 p-1.5 rounded-md text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors"
                      title="Excluir permanentemente"
                      aria-label="Excluir item da Inbox"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div
                    className="flex flex-wrap items-center gap-2 border-t pt-3"
                    style={{ borderColor: "var(--border-subtle)" }}
                  >
                    {!item.processed ? (
                      <>
                        <button
                          onClick={() => processItem(item.id, "today")}
                          className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-[var(--accent-dim)]"
                          style={{ borderColor: "var(--border)", color: "var(--text)" }}
                          title="Criar uma tarefa e colocar em Today"
                        >
                          <Star size={13} />
                          Enviar para Hoje
                        </button>
                        <button
                          onClick={() => processItem(item.id, "project")}
                          className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-[var(--surface)]"
                          style={{ borderColor: "var(--border)", color: "var(--text)" }}
                          title="Criar um novo projeto a partir deste item"
                        >
                          <FolderPlus size={13} />
                          Criar Projeto
                        </button>
                        <button
                          onClick={() => processItem(item.id, "done")}
                          className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-[var(--surface)]"
                          style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
                          title="Marcar como processado sem criar outro item"
                        >
                          <CheckCircle2 size={13} />
                          Concluir
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleRestore(item.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-[var(--surface)]"
                        style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
                        title="Mover o item de volta para pendentes"
                      >
                        <RotateCcw size={13} />
                        Restaurar para Inbox
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
