"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePersonaState } from "@/lib/storage";
import { Folder, Edit3, Trash2, Plus } from "lucide-react";
import { ProjectDialog } from "@/components/projects/ProjectDialog";
import type { Project } from "@/types";

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

  const handleOpenEdit = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProject(project);
    setDialogOpen(true);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Tem certeza que deseja excluir este projeto? As tarefas associadas ficarão sem projeto.")) return;
    updateState((previous) => ({
      ...previous,
      projects: previous.projects.filter((p) => p.id !== id),
    }));
  };

  const handleSave = (data: { name: string; description?: string; deadline?: string }) => {
    const now = new Date().toISOString();
    
    updateState((previous) => {
      if (editingProject) {
        return {
          ...previous,
          projects: previous.projects.map((p) =>
            p.id === editingProject.id
              ? { ...p, ...data, updatedAt: now }
              : p
          ),
        };
      }
      
      const newProject: Project = {
        id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `proj-${Date.now()}`,
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
    
    setDialogOpen(false);
  };

  const handleCardClick = (projectId: string) => {
    router.push(`/tasks?project=${projectId}`);
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] font-semibold mb-2" style={{ color: "var(--text-subtle)" }}>
            Visão Geral
          </p>
          <div className="flex items-center gap-3">
            <Folder size={28} style={{ color: "var(--accent)" }} />
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--text)" }}>Projetos</h1>
          </div>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[var(--accent)] hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          Novo Projeto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {state.projects.map((proj) => {
          const doneTasks = proj.tasks.filter((t) => t.status === "done").length;
          const totalTasks = proj.tasks.length;
          
          return (
            <div 
              key={proj.id} 
              onClick={() => handleCardClick(proj.id)}
              className="group rounded-xl border p-5 flex flex-col justify-between shadow-sm hover:border-[var(--accent)] cursor-pointer transition-colors relative" 
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
              <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => handleOpenEdit(proj, e)}
                  className="p-1.5 rounded-md bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
                  aria-label="Editar"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={(e) => handleDelete(proj.id, e)}
                  className="p-1.5 rounded-md bg-[var(--surface)] text-[var(--text-muted)] hover:text-red-400 transition-colors"
                  aria-label="Excluir"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div>
                <h3 className="font-semibold text-base mb-1 pr-16" style={{ color: "var(--text)" }}>{proj.name}</h3>
                <p className="text-xs mb-4 line-clamp-2" style={{ color: "var(--text-muted)" }}>
                  {proj.description || "Nenhuma descrição"}
                </p>
              </div>
              
              <div>
                <div className="flex justify-between text-xs mb-2" style={{ color: "var(--text-subtle)" }}>
                  <span>Progresso ({doneTasks}/{totalTasks} tarefas)</span>
                  <span className="font-mono">{proj.progress}%</span>
                </div>
                <div className="w-full bg-[var(--surface)] h-1.5 rounded-full overflow-hidden">
                  <div className="h-full transition-all duration-300 rounded-full" style={{ width: `${proj.progress}%`, background: "var(--accent)" }} />
                </div>
              </div>
            </div>
          );
        })}
        {state.projects.length === 0 && (
          <div className="col-span-full p-12 text-center border rounded-xl border-dashed" style={{ borderColor: "var(--border)" }}>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Nenhum projeto cadastrado.</p>
          </div>
        )}
      </div>

      {dialogOpen && (
        <ProjectDialog 
          project={editingProject} 
          onClose={() => setDialogOpen(false)} 
          onSave={handleSave} 
        />
      )}
    </div>
  );
}
