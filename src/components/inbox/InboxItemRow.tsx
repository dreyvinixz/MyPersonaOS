import {
  Archive,
  CheckCircle2,
  FolderPlus,
  ListTodo,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { formatInboxDate, isInboxItemProcessed } from "@/lib/inbox";
import type { InboxConvertTarget } from "@/lib/inbox";
import type { InboxItem } from "@/types";

type InboxItemActionsProps = {
  item: InboxItem;
  open: boolean;
  processed: boolean;
  onToggle: () => void;
  onConvert: (target: InboxConvertTarget) => void;
  onArchive: () => void;
  onDelete: () => void;
};

function InboxItemActions({
  item,
  open,
  processed,
  onToggle,
  onConvert,
  onArchive,
  onDelete,
}: InboxItemActionsProps) {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <span className="hidden sm:inline text-xs uppercase font-mono font-semibold px-2.5 py-1 rounded border bg-[rgba(255,255,255,0.03)] text-[var(--text-muted)] border-[var(--border-subtle)]">
        {item.type}
      </span>
      <div className="relative">
        <button
          type="button"
          onClick={onToggle}
          className="p-1.5 rounded-md transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100 text-[var(--text-muted)]"
          aria-label="Abrir ações do item"
          aria-expanded={open}
        >
          <MoreHorizontal size={17} />
        </button>
        {open && (
          <div className="absolute right-0 top-8 z-50 w-48 rounded-xl border shadow-2xl py-1 animate-fade-in bg-[var(--card)] border-[var(--border)] [box-shadow:0_12px_40px_rgba(0,0,0,0.4),0_0_0_1px_var(--border)]">
            {!processed && (
              <>
                <ActionButton
                  icon={<ListTodo size={14} className="text-[var(--accent)]" />}
                  label="Converter em Tarefa"
                  onClick={() => onConvert("task")}
                />
                <ActionButton
                  icon={<FolderPlus size={14} className="text-[var(--green)]" />}
                  label="Converter em Projeto"
                  onClick={() => onConvert("project")}
                />
                <ActionButton
                  icon={<Archive size={14} className="text-[var(--amber)]" />}
                  label="Arquivar"
                  onClick={onArchive}
                />
              </>
            )}
            <ActionButton
              icon={<Trash2 size={14} />}
              label="Excluir"
              onClick={onDelete}
              danger
            />
          </div>
        )}
      </div>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
  danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-left hover:bg-[var(--card-hover)]"
      style={{ color: danger ? "var(--red)" : "var(--text)" }}
    >
      {icon}
      {label}
    </button>
  );
}

type InboxItemRowProps = {
  item: InboxItem;
  menuOpen: boolean;
  onToggleProcessed: () => void;
  onToggleMenu: () => void;
  onConvert: (target: InboxConvertTarget) => void;
  onArchive: () => void;
  onDelete: () => void;
};

export function InboxItemRow({
  item,
  menuOpen,
  onToggleProcessed,
  onToggleMenu,
  onConvert,
  onArchive,
  onDelete,
}: InboxItemRowProps) {
  const processed = isInboxItemProcessed(item);
  const converted = item.status === "converted";

  return (
    <li
      className="group p-4 flex items-start justify-between gap-3 transition-colors relative"
      style={{ background: processed ? "transparent" : "var(--card)" }}
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <button
          type="button"
          onClick={onToggleProcessed}
          disabled={converted}
          className="mt-0.5 shrink-0 transition-colors disabled:cursor-default"
          aria-label={
            converted
              ? "Item convertido"
              : item.status === "archived"
                ? "Marcar como pendente"
                : "Arquivar item"
          }
          title={converted ? "Itens convertidos mantêm sua linhagem" : undefined}
        >
          <CheckCircle2
            size={20}
            style={{ color: processed ? "var(--green)" : "var(--border)" }}
          />
        </button>
        <div className="flex-1 min-w-0">
          <p
            className={`text-base font-medium leading-relaxed break-words ${
              processed ? "line-through opacity-45" : ""
            }`}
            style={{ color: "var(--text)" }}
          >
            {item.content}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xs font-mono font-medium text-[var(--text-subtle)]">
              {formatInboxDate(item.createdAt)}
            </span>
            {converted && item.convertedToType && (
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[var(--accent-dim)] text-[var(--accent-hover)] border border-[rgba(155,135,245,0.25)]">
                → {item.convertedToType}
              </span>
            )}
          </div>
        </div>
      </div>
      <InboxItemActions
        item={item}
        open={menuOpen}
        processed={processed}
        onToggle={onToggleMenu}
        onConvert={onConvert}
        onArchive={onArchive}
        onDelete={onDelete}
      />
    </li>
  );
}
