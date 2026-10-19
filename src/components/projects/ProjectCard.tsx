import { Calendar, Edit3, Trash2 } from "lucide-react";
import { formatDateOnly } from "@/lib/domain/date-only";
import type { Project } from "@/types";

type ProjectCardProps = {
  project: Project;
  onDelete: (id: string) => void;
  onEdit: (project: Project) => void;
  onOpen: (id: string) => void;
};

export function ProjectCard({
  project,
  onDelete,
  onEdit,
  onOpen,
}: ProjectCardProps) {
  const completedTasks = project.tasks.reduce(
    (total, task) => total + (task.status === "done" ? 1 : 0),
    0
  );
  const totalTasks = project.tasks.length;

  return (
    <article
      className="group rounded-xl border p-5 min-h-44 flex flex-col justify-between shadow-sm hover:border-[var(--accent)] transition-colors relative"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
    >
      <button
        type="button"
        onClick={() => onOpen(project.id)}
        className="absolute inset-0 rounded-xl z-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
        aria-label={`Ver tarefas do projeto ${project.name}`}
      />

      <div className="absolute z-20 top-4 right-4 flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => onEdit(project)}
          className="p-1.5 rounded-md bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
          aria-label={`Editar ${project.name}`}
        >
          <Edit3 size={14} />
        </button>
        <button
          type="button"
          onClick={() => onDelete(project.id)}
          className="p-1.5 rounded-md bg-[var(--surface)] text-[var(--text-muted)] hover:text-red-400 transition-colors"
          aria-label={`Excluir ${project.name}`}
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="relative z-10 pointer-events-none">
        <h2
          className="font-semibold text-base mb-1 pr-16"
          style={{ color: "var(--text)" }}
        >
          {project.name}
        </h2>
        <p
          className="text-xs mb-2 line-clamp-2"
          style={{ color: "var(--text-muted)" }}
        >
          {project.description || "Nenhuma descrição"}
        </p>
        {project.deadline ? (
          <p className="text-[10px] flex items-center gap-1 mb-4 text-[var(--text-subtle)]">
            <Calendar size={10} />
            Prazo: {formatDateOnly(project.deadline)}
          </p>
        ) : (
          <div className="mb-4" />
        )}
      </div>

      <div className="relative z-10 pointer-events-none">
        <div
          className="flex justify-between text-xs mb-2"
          style={{ color: "var(--text-subtle)" }}
        >
          <span>
            Progresso ({completedTasks}/{totalTasks} tarefas)
          </span>
          <span className="font-mono">{project.progress}%</span>
        </div>
        <div
          className="w-full bg-[var(--surface)] h-1.5 rounded-full overflow-hidden"
          role="progressbar"
          aria-label={`Progresso de ${project.name}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={project.progress}
        >
          <div
            className="h-full transition-all duration-300 rounded-full"
            style={{
              width: `${project.progress}%`,
              background: "var(--accent)",
            }}
          />
        </div>
      </div>
    </article>
  );
}
