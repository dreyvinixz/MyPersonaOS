import { useState, useEffect } from "react";
import { Folder, X } from "lucide-react";
import type { Project } from "@/types";
import { PERSONA_INPUT_LIMITS } from "@/lib/persona-state";

type ProjectDialogProps = {
  project?: Project | null;
  onClose: () => void;
  onSave: (data: { name: string; description?: string; deadline?: string }) => void;
};

export function ProjectDialog({ project, onClose, onSave }: ProjectDialogProps) {
  const [name, setName] = useState(project?.name || "");
  const [description, setDescription] = useState(project?.description || "");
  const [deadline, setDeadline] = useState(
    project?.deadline ? new Date(project.deadline).toISOString().split("T")[0] : ""
  );

  // Prevent background scrolling when dialog is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      deadline: deadline ? new Date(deadline).toISOString() : undefined,
    });
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[998] bg-[rgba(0,0,0,0.60)] backdrop-blur-[6px]"
        onClick={onClose}
      />
      <div
        className="fixed inset-0 z-[999] flex items-start justify-center px-3 pt-[16vh] sm:pt-[20vh]"
        onClick={onClose}
      >
        <div
          className="w-full max-w-[440px] rounded-2xl border shadow-2xl overflow-hidden animate-modal-in bg-[var(--card)] border-[var(--border)] [box-shadow:0_25px_60px_rgba(0,0,0,0.50),0_0_0_1px_var(--border)]"
          onClick={(event) => event.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-dialog-title"
        >
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border)]">
            <div className="flex items-center gap-2.5">
              <div
                className="flex items-center justify-center w-6 h-6 rounded-md bg-[var(--accent-dim)] text-[var(--accent)]"
              >
                <Folder size={13} strokeWidth={2.5} />
              </div>
              <span
                id="project-dialog-title"
                className="text-sm font-semibold text-[var(--text)]"
              >
                {project ? "Editar Projeto" : "Novo Projeto"}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
              aria-label="Fechar"
            >
              <X size={16} />
            </button>
          </div>
          
          <div className="px-5 py-5 space-y-4">
            <div>
              <label
                htmlFor="project-name"
                className="text-[10px] uppercase tracking-widest font-semibold mb-2 block text-[var(--text-subtle)]"
              >
                Nome do projeto
              </label>
              <input
                id="project-name"
                autoFocus
                value={name}
                maxLength={PERSONA_INPUT_LIMITS.projectName}
                onChange={(event) => setName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") handleSave();
                  if (event.key === "Escape") onClose();
                }}
                className="w-full bg-transparent text-sm outline-none border-b pb-2 text-[var(--text)] border-[var(--border)] focus:border-[var(--accent)] transition-colors"
                placeholder="Ex: Refatorar módulo de autenticação"
              />
            </div>
            
            <div>
              <label
                htmlFor="project-desc"
                className="text-[10px] uppercase tracking-widest font-semibold mb-2 block text-[var(--text-subtle)]"
              >
                Descrição (opcional)
              </label>
              <textarea
                id="project-desc"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="w-full bg-transparent text-sm outline-none border-b pb-2 text-[var(--text)] border-[var(--border)] focus:border-[var(--accent)] transition-colors resize-none h-16"
                placeholder="Objetivo principal deste projeto..."
              />
            </div>

            <div>
              <label
                htmlFor="project-deadline"
                className="text-[10px] uppercase tracking-widest font-semibold mb-2 block text-[var(--text-subtle)]"
              >
                Prazo Final (opcional)
              </label>
              <input
                id="project-deadline"
                type="date"
                value={deadline}
                onChange={(event) => setDeadline(event.target.value)}
                className="w-full bg-transparent text-sm outline-none border-b pb-2 text-[var(--text)] border-[var(--border)] focus:border-[var(--accent)] transition-colors [color-scheme:dark]"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!name.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-30 text-white bg-[var(--accent)]"
            >
              Salvar Projeto
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
