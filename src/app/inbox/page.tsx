"use client";

import { usePersonaState } from "@/lib/storage";
import { Inbox, CheckCircle2, Trash2 } from "lucide-react";

export default function InboxPage() {
  const { state, updateState, mounted } = usePersonaState();

  if (!mounted) return null;

  const handleMarkProcessed = (id: string) => {
    updateState((prev) => ({
      ...prev,
      inboxItems: prev.inboxItems.map((item) =>
        item.id === id ? { ...item, processed: !item.processed } : item
      ),
    }));
  };

  const handleDelete = (id: string) => {
    updateState((prev) => ({
      ...prev,
      inboxItems: prev.inboxItems.filter((item) => item.id !== id),
    }));
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.25em] font-semibold mb-2" style={{ color: "var(--text-subtle)" }}>
          Entrada Rápida
        </p>
        <div className="flex items-center gap-3">
          <Inbox size={28} style={{ color: "var(--accent)" }} />
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--text)" }}>Inbox</h1>
        </div>
        <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>Capture primeiro. Organize depois.</p>
      </div>

      <div className="rounded-xl border overflow-hidden shadow-sm" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
          {state.inboxItems.length === 0 ? (
            <li className="p-12 text-center text-sm" style={{ color: "var(--text-muted)" }}>
              Sua Inbox está limpa! Use o Quick Capture no Dashboard para adicionar ideias.
            </li>
          ) : (
            state.inboxItems.map((item) => (
              <li key={item.id} className="p-4 flex items-center justify-between gap-4 hover:bg-[var(--card-hover)] transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button onClick={() => handleMarkProcessed(item.id)}>
                    <CheckCircle2 size={20} style={{ color: item.processed ? "var(--green)" : "var(--border)" }} />
                  </button>
                  <span className={`text-sm ${item.processed ? "line-through opacity-50" : ""}`} style={{ color: "var(--text)" }}>
                    {item.content}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[var(--surface)]" style={{ color: "var(--text-subtle)" }}>
                    {item.type}
                  </span>
                  <button onClick={() => handleDelete(item.id)} className="p-1 text-red-400 hover:text-red-300">
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
