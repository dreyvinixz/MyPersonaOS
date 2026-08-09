import { FolderPlus, ListTodo, X } from "lucide-react";
import type { InboxConvertTarget } from "@/lib/inbox";
import { PERSONA_INPUT_LIMITS } from "@/lib/persona-state";
import type { InboxItem } from "@/types";

type InboxConvertDialogProps = {
  item: InboxItem;
  target: InboxConvertTarget;
  title: string;
  onTitleChange: (title: string) => void;
  onClose: () => void;
  onConfirm: () => void;
};

export function InboxConvertDialog({
  item,
  target,
  title,
  onTitleChange,
  onClose,
  onConfirm,
}: InboxConvertDialogProps) {
  const isTask = target === "task";
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
          aria-labelledby="inbox-convert-title"
        >
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border)]">
            <div className="flex items-center gap-2.5">
              <div
                className="flex items-center justify-center w-6 h-6 rounded-md"
                style={{
                  background: isTask ? "var(--accent-dim)" : "var(--green-dim)",
                  color: isTask ? "var(--accent)" : "var(--green)",
                }}
              >
                {isTask ? (
                  <ListTodo size={13} strokeWidth={2.5} />
                ) : (
                  <FolderPlus size={13} strokeWidth={2.5} />
                )}
              </div>
              <span
                id="inbox-convert-title"
                className="text-sm font-semibold text-[var(--text)]"
              >
                {isTask ? "Converter em Tarefa" : "Converter em Projeto"}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-md text-[var(--text-muted)]"
              aria-label="Fechar"
            >
              <X size={16} />
            </button>
          </div>
          <div className="px-5 py-4">
            <label
              htmlFor="inbox-convert-input"
              className="text-[10px] uppercase tracking-widest font-semibold mb-2 block text-[var(--text-subtle)]"
            >
              {isTask ? "Título da tarefa" : "Nome do projeto"}
            </label>
            <input
              id="inbox-convert-input"
              autoFocus
              value={title}
              maxLength={
                isTask
                  ? PERSONA_INPUT_LIMITS.taskTitle
                  : PERSONA_INPUT_LIMITS.projectName
              }
              onChange={(event) => onTitleChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") onConfirm();
                if (event.key === "Escape") onClose();
              }}
              className="w-full bg-transparent text-sm outline-none border-b pb-2 text-[var(--text)] border-[var(--border)]"
            />
            <p className="text-[11px] mt-3 text-[var(--text-subtle)]">
              Original:{" "}
              <span className="text-[var(--text-muted)]">
                &ldquo;{item.content.substring(0, 100)}
                {item.content.length > 100 ? "…" : ""}&rdquo;
              </span>
            </p>
          </div>
          <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--text-muted)]"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={!title.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-30 text-white"
              style={{ background: isTask ? "var(--accent)" : "var(--green)" }}
            >
              {isTask ? "Criar Tarefa" : "Criar Projeto"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
