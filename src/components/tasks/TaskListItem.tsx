import {
  Calendar,
  Check,
  Edit3,
  Folder,
  Star,
  Trash2,
} from "lucide-react";
import { formatDateOnly } from "@/lib/domain/date-only";
import type { Priority, Task } from "@/types";

type TaskListItemProps = {
  task: Task;
  projectName?: string;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onToggleDone: (id: string) => void;
  onToggleToday: (id: string) => void;
};

const PRIORITY_LABELS: Record<Priority, string> = {
  high: "Alta",
  medium: "Média",
  low: "Baixa",
};

function priorityStyle(priority: Priority) {
  if (priority === "high") {
    return { background: "var(--red-dim)", color: "var(--red)" };
  }
  if (priority === "medium") {
    return { background: "var(--amber-dim)", color: "var(--amber)" };
  }
  return { background: "var(--accent-dim)", color: "var(--accent)" };
}

export function TaskListItem({
  task,
  projectName,
  onDelete,
  onEdit,
  onToggleDone,
  onToggleToday,
}: TaskListItemProps) {
  const isDone = task.status === "done";
  const priority = task.priority || "medium";

  return (
    <li className="p-4 flex items-center justify-between gap-3 hover:bg-[var(--card-hover)] transition-colors group">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <button
          type="button"
          onClick={() => onToggleDone(task.id)}
          className="mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors"
          style={{
            borderColor: isDone ? "var(--green)" : "var(--border)",
            background: isDone ? "var(--green)" : "transparent",
          }}
          aria-label={isDone ? `Reabrir ${task.title}` : `Concluir ${task.title}`}
          aria-pressed={isDone}
        >
          {isDone ? (
            <Check size={12} className="text-black stroke-[3]" />
          ) : null}
        </button>

        <button
          type="button"
          onClick={() => onEdit(task)}
          className="flex flex-col min-w-0 text-left"
        >
          <span
            className={`text-sm truncate transition-opacity ${isDone ? "line-through opacity-50" : ""}`}
            style={{ color: "var(--text)" }}
          >
            {task.title}
          </span>
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[10px] text-[var(--text-subtle)]">
            <span
              className="uppercase font-bold px-1.5 py-0.5 rounded"
              style={priorityStyle(priority)}
            >
              {PRIORITY_LABELS[priority]}
            </span>
            {projectName ? (
              <span className="flex items-center gap-1">
                <Folder size={10} />
                {projectName}
              </span>
            ) : null}
            {task.dueDate && !isDone ? (
              <span className="flex items-center gap-1">
                <Calendar size={10} />
                {formatDateOnly(task.dueDate)}
              </span>
            ) : null}
          </span>
        </button>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <button
          type="button"
          onClick={() => onToggleToday(task.id)}
          className="flex items-center gap-1 text-xs px-2 py-1.5 rounded border transition-colors"
          style={{
            borderColor: task.isToday ? "var(--accent)" : "transparent",
            background: task.isToday ? "var(--accent-dim)" : "transparent",
            color: task.isToday
              ? "var(--accent-hover)"
              : "var(--text-subtle)",
          }}
          aria-label={
            task.isToday
              ? `Remover ${task.title} de Hoje`
              : `Adicionar ${task.title} a Hoje`
          }
          aria-pressed={Boolean(task.isToday)}
        >
          <Star size={12} fill={task.isToday ? "currentColor" : "none"} />
          <span className="hidden md:inline">Hoje</span>
        </button>
        <button
          type="button"
          onClick={() => onEdit(task)}
          className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--surface)] transition-colors"
          aria-label={`Editar ${task.title}`}
        >
          <Edit3 size={16} />
        </button>
        <button
          type="button"
          onClick={() => onDelete(task.id)}
          className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-red-400 hover:bg-[var(--surface)] transition-colors"
          aria-label={`Excluir ${task.title}`}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </li>
  );
}
