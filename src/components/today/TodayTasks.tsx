"use client";

import { useState } from "react";
import { usePersonaState } from "@/lib/storage";
import { CheckSquare, Plus, Check, Trash2, ArrowUpRight } from "lucide-react";
import { Priority, TaskStatus } from "@/types";

export function TodayTasks() {
  const { state, updateState, mounted } = usePersonaState();
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState<Priority>("medium");

  if (!mounted) return null;

  const todayTasks = state.tasks.filter((t) => t.isToday !== false);

  const handleAddTask = () => {
    if (!newTitle.trim()) return;
    const iso = new Date().toISOString();
    const newTask = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `task-${Date.now()}`,
      title: newTitle.trim(),
      status: "pending" as TaskStatus,
      priority: newPriority,
      isToday: true,
      createdAt: iso,
      updatedAt: iso,
    };
    updateState((prev) => ({
      ...prev,
      tasks: [newTask, ...prev.tasks],
    }));
    setNewTitle("");
  };

  const handleToggleStatus = (id: string) => {
    updateState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "done" ? "pending" : "done" }
          : t
      ),
    }));
  };

  const handleDelete = (id: string) => {
    updateState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== id),
    }));
  };

  return (
    <div
      className="rounded-xl border overflow-hidden shadow-sm"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
    >
      <div
        className="flex items-center justify-between px-5 py-4 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-2">
          <CheckSquare size={16} style={{ color: "var(--accent)" }} />
          <h2 className="text-sm font-semibold" style={{ color: "var(--text)" }}>
            Tarefas de Hoje ({todayTasks.filter((t) => t.status === "done").length}/{todayTasks.length})
          </h2>
        </div>
      </div>

      {/* Input */}
      <div
        className="p-4 border-b flex gap-2"
        style={{ borderColor: "var(--border)" }}
      >
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
          placeholder="Adicionar tarefa para hoje..."
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--text-subtle)]"
          style={{ color: "var(--text)" }}
        />
        <select
          value={newPriority}
          onChange={(e) => setNewPriority(e.target.value as Priority)}
          className="bg-transparent text-xs outline-none rounded px-2 py-1 border"
          style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
        >
          <option value="high" className="bg-[#16161F]">Alta</option>
          <option value="medium" className="bg-[#16161F]">Média</option>
          <option value="low" className="bg-[#16161F]">Baixa</option>
        </select>
        <button
          onClick={handleAddTask}
          disabled={!newTitle.trim()}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all disabled:opacity-40"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          <Plus size={14} /> Add
        </button>
      </div>

      {/* List */}
      <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
        {todayTasks.length === 0 ? (
          <li className="p-6 text-center text-xs" style={{ color: "var(--text-muted)" }}>
            Nenhuma tarefa agendada para hoje. Adicione uma acima!
          </li>
        ) : (
          todayTasks.map((t) => {
            const isDone = t.status === "done";
            return (
              <li
                key={t.id}
                className="flex items-center justify-between px-5 py-3 text-sm hover:bg-[var(--card-hover)] transition-colors group"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => handleToggleStatus(t.id)}
                    className="w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0"
                    style={{
                      borderColor: isDone ? "var(--green)" : "var(--border)",
                      background: isDone ? "var(--green)" : "transparent",
                    }}
                  >
                    {isDone && <Check size={12} className="text-black stroke-[3]" />}
                  </button>
                  <span
                    className={`truncate text-sm ${isDone ? "line-through opacity-50" : ""}`}
                    style={{ color: "var(--text)" }}
                  >
                    {t.title}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <span
                    className="text-[10px] uppercase font-bold px-2 py-0.5 rounded"
                    style={
                      t.priority === "high"
                        ? { background: "var(--red-dim)", color: "var(--red)" }
                        : t.priority === "medium"
                        ? { background: "var(--amber-dim)", color: "var(--amber)" }
                        : { background: "var(--accent-dim)", color: "var(--accent)" }
                    }
                  >
                    {t.priority || "medium"}
                  </span>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 transition-opacity text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
