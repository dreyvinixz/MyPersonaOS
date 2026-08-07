"use client";

import { useState } from "react";
import { usePersonaState } from "@/lib/storage";
import {
  Inbox,
  CheckCircle2,
  Trash2,
  ListTodo,
  FolderPlus,
  Archive,
  MoreHorizontal,
  X,
  Zap,
  Filter,
} from "lucide-react";
import type { InboxItem } from "@/types";

type FilterMode = "all" | "unprocessed" | "processed";

export default function InboxPage() {
  const { state, updateState, mounted } = usePersonaState();
  const [filter, setFilter] = useState<FilterMode>("all");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [convertingItem, setConvertingItem] = useState<{
    item: InboxItem;
    target: "task" | "project";
  } | null>(null);
  const [convertTitle, setConvertTitle] = useState("");

  if (!mounted) return null;

  // ── Filtering ──
  const filtered = state.inboxItems.filter((item) => {
    if (filter === "unprocessed") return !item.processed;
    if (filter === "processed") return item.processed;
    return true;
  });

  const unprocessedCount = state.inboxItems.filter((i) => !i.processed).length;
  const processedCount = state.inboxItems.filter((i) => i.processed).length;

  // ── Actions ──
  const handleMarkProcessed = (id: string) => {
    updateState((prev) => ({
      ...prev,
      inboxItems: prev.inboxItems.map((item) =>
        item.id === id ? { ...item, processed: !item.processed } : item
      ),
    }));
  };

  const handleDelete = (id: string) => {
    updateState((prev) => ({
      ...prev,
      inboxItems: prev.inboxItems.filter((item) => item.id !== id),
    }));
    setActiveMenu(null);
  };

  const handleArchive = (id: string) => {
    updateState((prev) => ({
      ...prev,
      inboxItems: prev.inboxItems.map((item) =>
        item.id === id ? { ...item, processed: true } : item
      ),
    }));
    setActiveMenu(null);
  };

  const handleClearProcessed = () => {
    updateState((prev) => ({
      ...prev,
      inboxItems: prev.inboxItems.filter((item) => !item.processed),
    }));
  };

  // ── Convert to Task ──
  const openConvertToTask = (item: InboxItem) => {
    setConvertingItem({ item, target: "task" });
    setConvertTitle(item.content);
    setActiveMenu(null);
  };

  // ── Convert to Project ──
  const openConvertToProject = (item: InboxItem) => {
    setConvertingItem({ item, target: "project" });
    setConvertTitle(item.content);
    setActiveMenu(null);
  };

  const handleConvertConfirm = () => {
    if (!convertingItem || !convertTitle.trim()) return;

    const { item, target } = convertingItem;

    if (target === "task") {
      updateState((prev) => ({
        ...prev,
        tasks: [
          {
            id: `t-${Date.now()}`,
            title: convertTitle.trim(),
            status: "pending" as const,
            priority: "medium" as const,
            isToday: false,
            createdAt: new Date().toISOString(),
          },
          ...prev.tasks,
        ],
        inboxItems: prev.inboxItems.map((i) =>
          i.id === item.id ? { ...i, processed: true } : i
        ),
      }));
    } else {
      updateState((prev) => ({
        ...prev,
        projects: [
          {
            id: `p-${Date.now()}`,
            name: convertTitle.trim(),
            description: `Originado da Inbox: "${item.content.substring(0, 80)}"`,
            progress: 0,
            tasks: [],
            createdAt: new Date().toISOString(),
          },
          ...prev.projects,
        ],
        inboxItems: prev.inboxItems.map((i) =>
          i.id === item.id ? { ...i, processed: true } : i
        ),
      }));
    }

    setConvertingItem(null);
    setConvertTitle("");
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <p
          className="text-[10px] uppercase tracking-[0.25em] font-semibold mb-2"
          style={{ color: "var(--text-subtle)" }}
        >
          Entrada Rápida
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Inbox size={28} style={{ color: "var(--accent)" }} />
            <h1
              className="text-3xl font-bold tracking-tight"
              style={{ color: "var(--text)" }}
            >
              Inbox
            </h1>
            {unprocessedCount > 0 && (
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{
                  background: "var(--accent-dim)",
                  color: "var(--accent)",
                }}
              >
                {unprocessedCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <kbd
              className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded"
              style={{
                background: "var(--surface)",
                color: "var(--text-subtle)",
                border: "1px solid var(--border)",
              }}
            >
              <Zap size={10} /> Ctrl+K
            </kbd>
          </div>
        </div>
        <p
          className="mt-2 text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          Capture primeiro. Organize depois.
        </p>
      </div>

      {/* Filter Bar */}
      <div
        className="flex items-center justify-between mb-4 px-1"
      >
        <div className="flex items-center gap-1">
          {(
            [
              { mode: "all" as FilterMode, label: "Todos", count: state.inboxItems.length },
              { mode: "unprocessed" as FilterMode, label: "Pendentes", count: unprocessedCount },
              { mode: "processed" as FilterMode, label: "Processados", count: processedCount },
            ] as const
          ).map(({ mode, label, count }) => (
            <button
              key={mode}
              onClick={() => setFilter(mode)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
              style={
                filter === mode
                  ? {
                      background: "var(--accent-dim)",
                      color: "var(--accent)",
                      border: "1px solid var(--accent)",
                    }
                  : {
                      color: "var(--text-muted)",
                      border: "1px solid transparent",
                    }
              }
            >
              {label}
              <span
                className="text-[10px] font-mono"
                style={{ opacity: 0.7 }}
              >
                {count}
              </span>
            </button>
          ))}
        </div>

        {processedCount > 0 && (
          <button
            onClick={handleClearProcessed}
            className="text-[11px] font-medium px-2.5 py-1 rounded-md transition-colors"
            style={{ color: "var(--red)", background: "var(--red-dim)" }}
          >
            Limpar processados
          </button>
        )}
      </div>

      {/* Items List */}
      <div
        className="rounded-xl border overflow-hidden shadow-sm"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
          {filtered.length === 0 ? (
            <li
              className="p-12 text-center"
              style={{ color: "var(--text-muted)" }}
            >
              <div className="flex flex-col items-center gap-3">
                <Inbox
                  size={40}
                  strokeWidth={1}
                  style={{ color: "var(--border)" }}
                />
                <div>
                  <p className="text-sm font-medium mb-1">
                    {filter === "all"
                      ? "Sua Inbox está limpa!"
                      : filter === "unprocessed"
                      ? "Nenhum item pendente."
                      : "Nenhum item processado."}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-subtle)" }}>
                    Use{" "}
                    <kbd
                      className="font-mono px-1 py-0.5 rounded text-[10px]"
                      style={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      Ctrl+K
                    </kbd>{" "}
                    para capturar algo novo.
                  </p>
                </div>
              </div>
            </li>
          ) : (
            filtered.map((item) => (
              <li
                key={item.id}
                className="group p-4 flex items-start justify-between gap-4 transition-colors"
                style={{
                  background: item.processed
                    ? "transparent"
                    : "var(--card)",
                }}
                onMouseEnter={() => {}}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => handleMarkProcessed(item.id)}
                    className="mt-0.5 shrink-0 transition-colors"
                  >
                    <CheckCircle2
                      size={20}
                      style={{
                        color: item.processed
                          ? "var(--green)"
                          : "var(--border)",
                      }}
                    />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm leading-relaxed ${
                        item.processed ? "line-through opacity-40" : ""
                      }`}
                      style={{ color: "var(--text)" }}
                    >
                      {item.content}
                    </p>
                    <p
                      className="text-[10px] mt-1"
                      style={{ color: "var(--text-subtle)" }}
                    >
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className="text-[10px] uppercase font-mono px-2 py-0.5 rounded"
                    style={{
                      background: "var(--surface)",
                      color: "var(--text-subtle)",
                    }}
                  >
                    {item.type}
                  </span>

                  {/* Actions menu */}
                  <div className="relative">
                    <button
                      onClick={() =>
                        setActiveMenu(
                          activeMenu === item.id ? null : item.id
                        )
                      }
                      className="p-1.5 rounded-md transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <MoreHorizontal size={16} />
                    </button>

                    {activeMenu === item.id && (
                      <div
                        className="absolute right-0 top-8 z-50 w-48 rounded-xl border shadow-2xl py-1 animate-fade-in"
                        style={{
                          background: "var(--card)",
                          borderColor: "var(--border)",
                          boxShadow:
                            "0 12px 40px rgba(0,0,0,0.4), 0 0 0 1px var(--border)",
                        }}
                      >
                        {!item.processed && (
                          <>
                            <button
                              onClick={() => openConvertToTask(item)}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors text-left hover:bg-[var(--card-hover)]"
                              style={{ color: "var(--text)" }}
                            >
                              <ListTodo
                                size={14}
                                style={{ color: "var(--accent)" }}
                              />
                              Converter em Tarefa
                            </button>
                            <button
                              onClick={() => openConvertToProject(item)}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors text-left hover:bg-[var(--card-hover)]"
                              style={{ color: "var(--text)" }}
                            >
                              <FolderPlus
                                size={14}
                                style={{ color: "var(--green)" }}
                              />
                              Converter em Projeto
                            </button>
                            <button
                              onClick={() => handleArchive(item.id)}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors text-left hover:bg-[var(--card-hover)]"
                              style={{ color: "var(--text)" }}
                            >
                              <Archive
                                size={14}
                                style={{ color: "var(--amber)" }}
                              />
                              Arquivar
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors text-left hover:bg-[var(--card-hover)]"
                          style={{ color: "var(--red)" }}
                        >
                          <Trash2 size={14} />
                          Excluir
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* ── Convert Modal ── */}
      {convertingItem && (
        <>
          <div
            className="fixed inset-0 z-[998]"
            style={{
              background: "rgba(0,0,0,0.60)",
              backdropFilter: "blur(6px)",
            }}
            onClick={() => {
              setConvertingItem(null);
              setConvertTitle("");
            }}
          />
          <div
            className="fixed inset-0 z-[999] flex items-start justify-center pt-[20vh]"
            onClick={() => {
              setConvertingItem(null);
              setConvertTitle("");
            }}
          >
            <div
              className="w-full max-w-[440px] rounded-2xl border shadow-2xl overflow-hidden animate-modal-in"
              style={{
                background: "var(--card)",
                borderColor: "var(--border)",
                boxShadow:
                  "0 25px 60px rgba(0,0,0,0.50), 0 0 0 1px var(--border)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-5 py-3.5 border-b"
                style={{ borderColor: "var(--border)" }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="flex items-center justify-center w-6 h-6 rounded-md"
                    style={{
                      background:
                        convertingItem.target === "task"
                          ? "var(--accent-dim)"
                          : "var(--green-dim)",
                      color:
                        convertingItem.target === "task"
                          ? "var(--accent)"
                          : "var(--green)",
                    }}
                  >
                    {convertingItem.target === "task" ? (
                      <ListTodo size={13} strokeWidth={2.5} />
                    ) : (
                      <FolderPlus size={13} strokeWidth={2.5} />
                    )}
                  </div>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "var(--text)" }}
                  >
                    {convertingItem.target === "task"
                      ? "Converter em Tarefa"
                      : "Converter em Projeto"}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setConvertingItem(null);
                    setConvertTitle("");
                  }}
                  className="p-1 rounded-md"
                  style={{ color: "var(--text-muted)" }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="px-5 py-4">
                <label
                  className="text-[10px] uppercase tracking-widest font-semibold mb-2 block"
                  style={{ color: "var(--text-subtle)" }}
                >
                  {convertingItem.target === "task"
                    ? "Título da tarefa"
                    : "Nome do projeto"}
                </label>
                <input
                  autoFocus
                  value={convertTitle}
                  onChange={(e) => setConvertTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleConvertConfirm();
                    if (e.key === "Escape") {
                      setConvertingItem(null);
                      setConvertTitle("");
                    }
                  }}
                  className="w-full bg-transparent text-sm outline-none border-b pb-2"
                  style={{
                    color: "var(--text)",
                    borderColor: "var(--border)",
                  }}
                />
                <p
                  className="text-[11px] mt-3"
                  style={{ color: "var(--text-subtle)" }}
                >
                  Original:{" "}
                  <span style={{ color: "var(--text-muted)" }}>
                    &ldquo;{convertingItem.item.content.substring(0, 100)}
                    {convertingItem.item.content.length > 100 ? "…" : ""}
                    &rdquo;
                  </span>
                </p>
              </div>

              {/* Footer */}
              <div
                className="flex items-center justify-end gap-2 px-5 py-3 border-t"
                style={{ borderColor: "var(--border)" }}
              >
                <button
                  onClick={() => {
                    setConvertingItem(null);
                    setConvertTitle("");
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{ color: "var(--text-muted)" }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConvertConfirm}
                  disabled={!convertTitle.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-30"
                  style={{
                    background:
                      convertingItem.target === "task"
                        ? "var(--accent)"
                        : "var(--green)",
                    color: "#fff",
                  }}
                >
                  {convertingItem.target === "task"
                    ? "Criar Tarefa"
                    : "Criar Projeto"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
