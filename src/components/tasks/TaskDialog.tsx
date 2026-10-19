import { useState, useEffect } from "react";
import { CheckSquare, X } from "lucide-react";
import type { Task, Project } from "@/types";
import { PERSONA_INPUT_LIMITS } from "@/lib/persona-state";
import { toDateOnly } from "@/lib/domain/date-only";

type TaskDialogProps = {
  task?: Task | null;
  initialProjectId?: string;
  projects: Project[];
  onClose: () => void;
  onSave: (data: {
    title: string;
    status: Task["status"];
    priority: NonNullable<Task["priority"]>;
    dueDate?: string;
    projectId?: string;
    isToday: boolean;
  }) => void;
};

export function TaskDialog({
  task,
  initialProjectId,
  projects,
  onClose,
  onSave,
}: TaskDialogProps) {
  const isEditing = Boolean(task);
  const [title, setTitle] = useState(task?.title || "");
  const [status, setStatus] = useState<Task["status"]>(task?.status || "pending");
  const [priority, setPriority] = useState<NonNullable<Task["priority"]>>(task?.priority || "medium");
  const [projectId, setProjectId] = useState<string>(
    task?.projectId || initialProjectId || ""
  );
  const [dueDate, setDueDate] = useState<string>(toDateOnly(task?.dueDate));
  const [isToday, setIsToday] = useState(task?.isToday || false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      status,
      priority,
      projectId: projectId || undefined,
      dueDate: dueDate || undefined,
      isToday,
    });
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[998] bg-[rgba(0,0,0,0.60)] backdrop-blur-[6px]"
        onClick={onClose}
      />
      <div
        className="fixed inset-0 z-[999] flex items-start justify-center px-3 pt-[8vh] sm:pt-[12vh]"
        onClick={onClose}
      >
        <form
          className="w-full max-w-[480px] rounded-2xl border shadow-2xl overflow-hidden animate-modal-in bg-[var(--card)] border-[var(--border)] [box-shadow:0_25px_60px_rgba(0,0,0,0.50),0_0_0_1px_var(--border)]"
          onClick={(event) => event.stopPropagation()}
          onSubmit={handleSubmit}
          role="dialog"
          aria-modal="true"
          aria-labelledby="task-dialog-title"
        >
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border)]">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-6 h-6 rounded-md bg-[var(--accent-dim)] text-[var(--accent)]">
                <CheckSquare size={13} strokeWidth={2.5} />
              </div>
              <span
                id="task-dialog-title"
                className="text-sm font-semibold text-[var(--text)]"
              >
                {isEditing ? "Editar Tarefa" : "Nova Tarefa"}
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
          
          <div className="px-5 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
            <div>
              <label
                htmlFor="task-title"
                className="text-[10px] uppercase tracking-widest font-semibold mb-2 block text-[var(--text-subtle)]"
              >
                Título da tarefa
              </label>
              <input
                id="task-title"
                autoFocus
                value={title}
                maxLength={PERSONA_INPUT_LIMITS.taskTitle}
                onChange={(event) => setTitle(event.target.value)}
                className="w-full bg-transparent text-sm outline-none border-b pb-2 text-[var(--text)] border-[var(--border)] focus:border-[var(--accent)] transition-colors"
                placeholder="O que precisa ser feito?"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="task-status"
                  className="text-[10px] uppercase tracking-widest font-semibold mb-2 block text-[var(--text-subtle)]"
                >
                  Status
                </label>
                <select
                  id="task-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Task["status"])}
                  className="w-full bg-[rgba(5,6,10,0.6)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                >
                  <option value="pending">Pendente</option>
                  <option value="in-progress">Em progresso</option>
                  <option value="done">Concluída</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="task-priority"
                  className="text-[10px] uppercase tracking-widest font-semibold mb-2 block text-[var(--text-subtle)]"
                >
                  Prioridade
                </label>
                <select
                  id="task-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as NonNullable<Task["priority"]>)}
                  className="w-full bg-[rgba(5,6,10,0.6)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                >
                  <option value="high">Alta</option>
                  <option value="medium">Média</option>
                  <option value="low">Baixa</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="task-project"
                className="text-[10px] uppercase tracking-widest font-semibold mb-2 block text-[var(--text-subtle)]"
              >
                Projeto Associado
              </label>
              <select
                id="task-project"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-[rgba(5,6,10,0.6)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
              >
                <option value="">(Nenhum projeto)</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="task-due-date"
                  className="text-[10px] uppercase tracking-widest font-semibold mb-2 block text-[var(--text-subtle)]"
                >
                  Data de Vencimento
                </label>
                <input
                  id="task-due-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-[rgba(5,6,10,0.6)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] [color-scheme:dark]"
                />
              </div>
              
              <div className="flex flex-col justify-end pb-1">
                <label className="flex items-center gap-3 cursor-pointer group focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--accent)]">
                  <div
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                      isToday ? "bg-[var(--accent)] border-[var(--accent)]" : "border-[var(--border)] group-hover:border-[var(--text-muted)]"
                    }`}
                  >
                    {isToday && <CheckSquare size={12} className="text-white" strokeWidth={3} />}
                  </div>
                  <span className="text-sm font-medium text-[var(--text)]">Dashboard Hoje</span>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={isToday}
                    onChange={(e) => setIsToday(e.target.checked)}
                  />
                </label>
                <p className="text-[10px] text-[var(--text-subtle)] mt-1.5 ml-8">
                  Destaca a tarefa para hoje.
                </p>
              </div>
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
              type="submit"
              disabled={!title.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-30 text-white bg-[var(--accent)]"
            >
              Salvar Tarefa
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
