"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckSquare, Plus } from "lucide-react";
import { TaskDialog } from "@/components/tasks/TaskDialog";
import { TaskListItem } from "@/components/tasks/TaskListItem";
import { createEntityId } from "@/lib/ids";
import { usePersonaState } from "@/lib/storage";
import type { Task } from "@/types";

type TaskFormData = {
  title: string;
  status: Task["status"];
  priority: NonNullable<Task["priority"]>;
  dueDate?: string;
  projectId?: string;
  isToday: boolean;
};

function TasksContent() {
  const { state, updateState, mounted } = usePersonaState();
  const searchParams = useSearchParams();
  const projectIdFilter = searchParams.get("project");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  if (!mounted) return null;

  const selectedProject = projectIdFilter
    ? state.projects.find((project) => project.id === projectIdFilter)
    : undefined;
  const filteredTasks = projectIdFilter
    ? state.tasks.filter((task) => task.projectId === projectIdFilter)
    : state.tasks;
  const projectNames = new Map(
    state.projects.map((project) => [project.id, project.name])
  );

  const handleOpenCreate = () => {
    setEditingTask(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => setDialogOpen(false);

  const handleToggleDone = (id: string) => {
    const now = new Date().toISOString();
    updateState((previous) => ({
      ...previous,
      tasks: previous.tasks.map((task) => {
        if (task.id !== id) return task;
        const done = task.status !== "done";
        return {
          ...task,
          status: done ? "done" : "pending",
          completedAt: done ? now : undefined,
          updatedAt: now,
        };
      }),
    }));
  };

  const handleToggleToday = (id: string) => {
    const now = new Date().toISOString();
    updateState((previous) => ({
      ...previous,
      tasks: previous.tasks.map((task) =>
        task.id === id
          ? { ...task, isToday: !task.isToday, updatedAt: now }
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

  const handleSave = (data: TaskFormData) => {
    const now = new Date().toISOString();

    updateState((previous) => {
      if (editingTask) {
        return {
          ...previous,
          tasks: previous.tasks.map((task) => {
            if (task.id !== editingTask.id) return task;

            const completedAt =
              data.status === "done"
                ? task.status === "done"
                  ? task.completedAt || now
                  : now
                : undefined;

            return { ...task, ...data, completedAt, updatedAt: now };
          }),
        };
      }

      const newTask: Task = {
        id: createEntityId(),
        ...data,
        completedAt: data.status === "done" ? now : undefined,
        createdAt: now,
        updatedAt: now,
      };

      return {
        ...previous,
        tasks: [newTask, ...previous.tasks],
      };
    });

    handleCloseDialog();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p
            className="text-[10px] uppercase tracking-[0.25em] font-semibold mb-2"
            style={{ color: "var(--text-subtle)" }}
          >
            {selectedProject
              ? `Projeto: ${selectedProject.name}`
              : projectIdFilter
                ? "Projeto não encontrado"
                : "Execução & Lista Completa"}
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
          type="button"
          onClick={handleOpenCreate}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[var(--accent)] hover:opacity-90 transition-opacity"
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
            filteredTasks.map((task) => (
              <TaskListItem
                key={task.id}
                task={task}
                projectName={
                  task.projectId ? projectNames.get(task.projectId) : undefined
                }
                onDelete={handleDelete}
                onEdit={handleOpenEdit}
                onToggleDone={handleToggleDone}
                onToggleToday={handleToggleToday}
              />
            ))
          )}
        </ul>
      </div>

      {dialogOpen ? (
        <TaskDialog
          task={editingTask}
          initialProjectId={selectedProject?.id}
          projects={state.projects}
          onClose={handleCloseDialog}
          onSave={handleSave}
        />
      ) : null}
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
