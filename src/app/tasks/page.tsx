"use client";

import { usePersonaState } from "@/lib/storage";
import { CheckSquare, Trash2, Check, Star } from "lucide-react";

export default function TasksPage() {
  const { state, updateState, mounted } = usePersonaState();

  if (!mounted) return null;

  const handleToggleDone = (id: string) => {
    const iso = new Date().toISOString();
    updateState((previous) => ({
      ...previous,
      tasks: previous.tasks.map((task) => {
        if (task.id !== id) return task;
        const done = task.status !== "done";
        return {
          ...task,
          status: done ? "done" : "pending",
          completedAt: done ? iso : undefined,
          updatedAt: iso,
        };
      }),
    }));
  };

  const handleToggleToday = (id: string) => {
    const iso = new Date().toISOString();
    updateState((previous) => ({
      ...previous,
      tasks: previous.tasks.map((task) =>
        task.id === id
          ? { ...task, isToday: !task.isToday, updatedAt: iso }
          : task
      ),
    }));
  };

  const handleDelete = (id: string) => {
    updateState((previous) => ({
      ...previous,
      tasks: previous.tasks.filter((task) => task.id !== id),
    }));
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="mb-8">
        <p
          className="text-[10px] uppercase tracking-[0.25em] font-semibold mb-2"
          style={{ color: "var(--text-subtle)" }}
        >
          Execução & Lista Completa
        </p>
        <div className="flex items-center gap-3">
          <CheckSquare size={28} style={{ color: "var(--accent)" }} />
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ color: "var(--text)" }}
          >
            Tarefas
          </h1>
        </div>
      </div>

      <div
        className="rounded-xl border overflow-hidden shadow-sm"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
          {state.tasks.length === 0 ? (
            <li
              className="p-12 text-center text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              Nenhuma tarefa cadastrada.
            </li>
          ) : (
            state.tasks.map((task) => {
              const isDone = task.status === "done";
              return (
                <li
                  key={task.id}
                  className="p-4 flex items-center justify-between gap-4 hover:bg-[var(--card-hover)] transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => handleToggleDone(task.id)}
                      className="w-5 h-5 rounded border flex items-center justify-center shrink-0"
                      style={{
                        borderColor: isDone ? "var(--green)" : "var(--border)",
                        background: isDone ? "var(--green)" : "transparent",
                      }}
                    >
                      {isDone && <Check size={12} className="text-black stroke-[3]" />}
                    </button>
                    <span
                      className={`text-sm ${isDone ? "line-through opacity-50" : ""}`}
                      style={{ color: "var(--text)" }}
                    >
                      {task.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleToday(task.id)}
                      className="flex items-center gap-1 text-xs px-2 py-1 rounded border transition-colors"
                      style={{
                        borderColor: task.isToday ? "var(--accent)" : "var(--border)",
                        background: task.isToday ? "var(--accent-dim)" : "transparent",
                        color: task.isToday ? "var(--accent-hover)" : "var(--text-subtle)",
                      }}
                      title="Alternar no Dashboard Hoje"
                    >
                      <Star size={12} fill={task.isToday ? "currentColor" : "none"} />
                      Hoje
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="p-1 text-red-400 hover:text-red-300"
                      aria-label={`Excluir ${task.title}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}
