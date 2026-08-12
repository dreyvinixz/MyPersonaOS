"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { usePersonaState } from "@/lib/storage";
import { CheckSquare, Trash2, Check, Star, Plus, Edit3, Calendar } from "lucide-react";
import { TaskDialog } from "@/components/tasks/TaskDialog";
import type { Task } from "@/types";

function TasksContent() {
  const { state, updateState, mounted } = usePersonaState();
  const searchParams = useSearchParams();
  const projectIdFilter = searchParams.get("project");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  if (!mounted) return null;

  const handleOpenCreate = () => {
    // Se estivermos numa URL com filtro de projeto, já pré-seleciona ele no dialog
    const newTaskInitialState = projectIdFilter 
      ? { projectId: projectIdFilter } as Task 
      : null;
    setEditingTask(newTaskInitialState);
    setDialogOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

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
    if (!confirm("Tem certeza que deseja excluir esta tarefa?")) return;
    updateState((previous) => ({
      ...previous,
      tasks: previous.tasks.filter((task) => task.id !== id),
    }));
  };

  const handleSave = (data: {
    title: string;
    status: Task["status"];
    priority: NonNullable<Task["priority"]>;
    dueDate?: string;
    projectId?: string;
    isToday: boolean;
  }) => {
    const now = new Date().toISOString();
    // Verify if editing an existing task, ignoring the dummy object passed for initial projectId
    const isEditingExisting = editingTask && editingTask.id;
    const wasDone = isEditingExisting && editingTask?.status === "done";
    const isDoneNow = data.status === "done";
    
    let completedAt = isEditingExisting ? editingTask?.completedAt : undefined;
    if (!wasDone && isDoneNow) {
      completedAt = now;
    } else if (!isDoneNow) {
      completedAt = undefined;
    }

    updateState((previous) => {
      if (isEditingExisting) {
        return {
          ...previous,
          tasks: previous.tasks.map((t) =>
            t.id === editingTask.id
              ? { ...t, ...data, completedAt, updatedAt: now }
              : t
          ),
        };
      }

      const newTask: Task = {
        id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `task-${Date.now()}`,
        ...data,
        completedAt,
        createdAt: now,
        updatedAt: now,
      };

      return {
        ...previous,
        tasks: [newTask, ...previous.tasks],
      };
    });

    setDialogOpen(false);
  };

  const filteredTasks = projectIdFilter
    ? state.tasks.filter(t => t.projectId === projectIdFilter)
    : state.tasks;

  const projectName = projectIdFilter 
    ? state.projects.find(p => p.id === projectIdFilter)?.name 
    : null;

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p
            className="text-[10px] uppercase tracking-[0.25em] font-semibold mb-2"
            style={{ color: "var(--text-subtle)" }}
          >
            {projectName ? `Projeto: ${projectName}` : "Execução & Lista Completa"}
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
        
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[var(--accent)] hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          Nova Tarefa
        </button>
      </div>

      <div
        className="rounded-xl border overflow-hidden shadow-sm"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
          {filteredTasks.length === 0 ? (
            <li
              className="p-12 text-center text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              Nenhuma tarefa encontrada.
            </li>
          ) : (
            filteredTasks.map((task) => {
              const isDone = task.status === "done";
              return (
                <li
                  key={task.id}
                  className="p-4 flex items-center justify-between gap-4 hover:bg-[var(--card-hover)] transition-colors group"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => handleToggleDone(task.id)}
                      className="w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors"
                      style={{
                        borderColor: isDone ? "var(--green)" : "var(--border)",
                        background: isDone ? "var(--green)" : "transparent",
                      }}
                    >
                      {isDone && <Check size={12} className="text-black stroke-[3]" />}
                    </button>
                    <div className="flex flex-col min-w-0 cursor-pointer" onClick={() => handleOpenEdit(task)}>
                      <span
                        className={`text-sm truncate transition-opacity ${isDone ? "line-through opacity-50" : ""}`}
                        style={{ color: "var(--text)" }}
                      >
                        {task.title}
                      </span>
                      {task.dueDate && !isDone && (
                        <span className="text-[10px] flex items-center gap-1 mt-0.5" style={{ color: "var(--text-subtle)" }}>
                          <Calendar size={10} />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleToggleToday(task.id)}
                      className="flex items-center gap-1 text-xs px-2 py-1.5 rounded border transition-colors"
                      style={{
                        borderColor: task.isToday ? "var(--accent)" : "transparent",
                        background: task.isToday ? "var(--accent-dim)" : "transparent",
                        color: task.isToday ? "var(--accent-hover)" : "var(--text-subtle)",
                      }}
                      title="Alternar no Dashboard Hoje"
                    >
                      <Star size={12} fill={task.isToday ? "currentColor" : "none"} />
                      <span className="hidden sm:inline">Hoje</span>
                    </button>
                    <button
                      onClick={() => handleOpenEdit(task)}
                      className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--surface)] transition-colors"
                      aria-label="Editar"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-red-400 hover:bg-[var(--surface)] transition-colors"
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
      
      {dialogOpen && (
        <TaskDialog
          task={editingTask}
          projects={state.projects}
          onClose={() => setDialogOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

export default function TasksPage() {
  return (
    <Suspense fallback={null}>
      <TasksContent />
    </Suspense>
  );
}
