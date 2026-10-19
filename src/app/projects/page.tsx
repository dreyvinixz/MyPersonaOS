"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Folder, Plus } from "lucide-react";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectDialog } from "@/components/projects/ProjectDialog";
import { createEntityId } from "@/lib/ids";
import { usePersonaState } from "@/lib/storage";
import type { Project } from "@/types";

type ProjectFormData = {
  name: string;
  description?: string;
  deadline?: string;
};

export default function ProjectsPage() {
  const { state, updateState, mounted } = usePersonaState();
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  if (!mounted) return null;

  const handleOpenCreate = () => {
    setEditingProject(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (project: Project) => {
    setEditingProject(project);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => setDialogOpen(false);
  const handleOpenProject = (id: string) => router.push(`/tasks?project=${id}`);

  const handleDelete = (id: string) => {
    if (
      !confirm(
        "Tem certeza que deseja excluir este projeto? As tarefas associadas ficarão sem projeto."
      )
    ) {
      return;
    }

    updateState((previous) => ({
      ...previous,
      projects: previous.projects.filter((project) => project.id !== id),
    }));
  };

  const handleSave = (data: ProjectFormData) => {
    const now = new Date().toISOString();

    updateState((previous) => {
      if (editingProject) {
        return {
          ...previous,
          projects: previous.projects.map((project) =>
            project.id === editingProject.id
              ? { ...project, ...data, updatedAt: now }
              : project
          ),
        };
      }

      const newProject: Project = {
        id: createEntityId(),
        name: data.name,
        description: data.description,
        deadline: data.deadline,
        progress: 0,
        tasks: [],
        createdAt: now,
        updatedAt: now,
      };

      return {
        ...previous,
        projects: [newProject, ...previous.projects],
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
            Visão Geral
          </p>
          <div className="flex items-center gap-3">
            <Folder size={28} style={{ color: "var(--accent)" }} />
            <h1
              className="text-3xl font-bold tracking-tight"
              style={{ color: "var(--text)" }}
            >
              Projetos
            </h1>
          </div>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[var(--accent)] hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          Novo Projeto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {state.projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onDelete={handleDelete}
            onEdit={handleOpenEdit}
            onOpen={handleOpenProject}
          />
        ))}

        {state.projects.length === 0 ? (
          <div
            className="col-span-full p-12 text-center border rounded-xl border-dashed"
            style={{ borderColor: "var(--border)" }}
          >
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Nenhum projeto cadastrado.
            </p>
          </div>
        ) : null}
      </div>

      {dialogOpen ? (
        <ProjectDialog
          project={editingProject}
          onClose={handleCloseDialog}
          onSave={handleSave}
        />
      ) : null}
    </div>
  );
}
