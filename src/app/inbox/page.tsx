"use client";

import { useState } from "react";
import {
  Archive,
  CheckCircle2,
  FolderPlus,
  Inbox,
  ListTodo,
  MoreHorizontal,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import { usePersonaState } from "@/lib/storage";
import { openQuickCapture } from "@/lib/ui-events";
import type { InboxItem } from "@/types";

type FilterMode = "all" | "unprocessed" | "processed";
type ConvertTarget = "task" | "project";

export default function InboxPage() {
  const { state, updateState, mounted } = usePersonaState();
  const [filter, setFilter] = useState<FilterMode>("all");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [convertingItem, setConvertingItem] = useState<{
    item: InboxItem;
    target: ConvertTarget;
  } | null>(null);
  const [convertTitle, setConvertTitle] = useState("");

  if (!mounted) return null;

  const filtered = state.inboxItems.filter((item) => {
    if (filter === "unprocessed") return !item.processed;
    if (filter === "processed") return item.processed;
    return true;
  });

  const unprocessedCount = state.inboxItems.filter(
    (item) => !item.processed
  ).length;
  const processedCount = state.inboxItems.filter(
    (item) => item.processed
  ).length;

  const handleMarkProcessed = (id: string) => {
    updateState((previous) => ({
      ...previous,
      inboxItems: previous.inboxItems.map((item) =>
        item.id === id ? { ...item, processed: !item.processed } : item
      ),
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
    updateState((previous) => ({
      ...previous,
      inboxItems: previous.inboxItems.map((item) =>
        item.id === id ? { ...item, processed: true } : item
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
      inboxItems: previous.inboxItems.filter((item) => !item.processed),
    }));
  };

  const openConvert = (item: InboxItem, target: ConvertTarget) => {
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
    const uniqueSuffix = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 7)}`;

    if (target === "task") {
      updateState((previous) => ({
        ...previous,
        tasks: [
          {
            id: `t-${uniqueSuffix}`,
            title,
            status: "pending" as const,
            priority: "medium" as const,
            isToday: false,
            createdAt: now,
          },
          ...previous.tasks,
        ],
        inboxItems: previous.inboxItems.map((candidate) =>
          candidate.id === item.id
            ? { ...candidate, processed: true }
            : candidate
        ),
      }));
    } else {
      updateState((previous) => ({
        ...previous,
        projects: [
          {
            id: `p-${uniqueSuffix}`,
            name: title,
            description: `Originado da Inbox: "${item.content.substring(
              0,
              80
            )}"`,
            progress: 0,
            tasks: [],
            createdAt: now,
          },
          ...previous.projects,
        ],
        inboxItems: previous.inboxItems.map((candidate) =>
          candidate.id === item.id
            ? { ...candidate, processed: true }
            : candidate
        ),
      }));
    }

    closeConvert();
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  const filters: { mode: FilterMode; label: string; count: number }[] = [
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

        <p className="mt-2 text-base font-normal" style={{ color: "var(--text-muted)" }}>
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
              <li
                key={item.id}
                className="group p-4 flex items-start justify-between gap-3 transition-colors relative"
                style={{
                  background: item.processed ? "transparent" : "var(--card)",
                }}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => handleMarkProcessed(item.id)}
                    className="mt-0.5 shrink-0 transition-colors"
                    aria-label={
                      item.processed
                        ? "Marcar como pendente"
                        : "Marcar como processado"
                    }
                  >
                    <CheckCircle2
                      size={20}
                      style={{
                        color: item.processed ? "var(--green)" : "var(--border)",
                      }}
                    />
                  </button>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-base font-medium leading-relaxed break-words ${
                        item.processed ? "line-through opacity-45" : ""
                      }`}
                      style={{ color: "var(--text)" }}
                    >
                      {item.content}
                    </p>
                    <p
                      className="text-xs font-mono font-medium mt-1.5"
                      style={{ color: "var(--text-subtle)" }}
                    >
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className="hidden sm:inline text-xs uppercase font-mono font-semibold px-2.5 py-1 rounded border"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      color: "var(--text-muted)",
                      borderColor: "var(--border-subtle)",
                    }}
                  >
                    {item.type}
                  </span>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveMenu(activeMenu === item.id ? null : item.id)
                      }
                      className="p-1.5 rounded-md transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100"
                      style={{ color: "var(--text-muted)" }}
                      aria-label="Abrir ações do item"
                      aria-expanded={activeMenu === item.id}
                    >
                      <MoreHorizontal size={17} />
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
                              type="button"
                              onClick={() => openConvert(item, "task")}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-left hover:bg-[var(--card-hover)]"
                              style={{ color: "var(--text)" }}
                            >
                              <ListTodo size={14} style={{ color: "var(--accent)" }} />
                              Converter em Tarefa
                            </button>
                            <button
                              type="button"
                              onClick={() => openConvert(item, "project")}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-left hover:bg-[var(--card-hover)]"
                              style={{ color: "var(--text)" }}
                            >
                              <FolderPlus size={14} style={{ color: "var(--green)" }} />
                              Converter em Projeto
                            </button>
                            <button
                              type="button"
                              onClick={() => handleArchive(item.id)}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-left hover:bg-[var(--card-hover)]"
                              style={{ color: "var(--text)" }}
                            >
                              <Archive size={14} style={{ color: "var(--amber)" }} />
                              Arquivar
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-left hover:bg-[var(--card-hover)]"
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

      {convertingItem && (
        <>
          <div
            className="fixed inset-0 z-[998]"
            style={{
              background: "rgba(0,0,0,0.60)",
              backdropFilter: "blur(6px)",
            }}
            onClick={closeConvert}
          />
          <div
            className="fixed inset-0 z-[999] flex items-start justify-center px-3 pt-[16vh] sm:pt-[20vh]"
            onClick={closeConvert}
          >
            <div
              className="w-full max-w-[440px] rounded-2xl border shadow-2xl overflow-hidden animate-modal-in"
              style={{
                background: "var(--card)",
                borderColor: "var(--border)",
                boxShadow:
                  "0 25px 60px rgba(0,0,0,0.50), 0 0 0 1px var(--border)",
              }}
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
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
                  type="button"
                  onClick={closeConvert}
                  className="p-1 rounded-md"
                  style={{ color: "var(--text-muted)" }}
                  aria-label="Fechar"
                >
                  <X size={16} />
                </button>
              </div>

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
                  onChange={(event) => setConvertTitle(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") handleConvertConfirm();
                    if (event.key === "Escape") closeConvert();
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

              <div
                className="flex items-center justify-end gap-2 px-5 py-3 border-t"
                style={{ borderColor: "var(--border)" }}
              >
                <button
                  type="button"
                  onClick={closeConvert}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{ color: "var(--text-muted)" }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
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
