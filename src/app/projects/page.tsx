"use client";

import { usePersonaState } from "@/lib/storage";
import { Folder, Plus } from "lucide-react";

export default function ProjectsPage() {
  const { state, mounted } = usePersonaState();

  if (!mounted) return null;

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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {state.projects.map((proj) => (
          <div key={proj.id} className="rounded-xl border p-5 flex flex-col justify-between shadow-sm" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div>
              <h3 className="font-semibold text-base mb-1" style={{ color: "var(--text)" }}>{proj.name}</h3>
              <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>{proj.description}</p>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1" style={{ color: "var(--text-subtle)" }}>
                <span>Progresso</span>
                <span>{proj.progress}%</span>
              </div>
              <div className="w-full bg-[var(--surface)] h-2 rounded-full overflow-hidden">
                <div className="h-full transition-all duration-300" style={{ width: `${proj.progress}%`, background: "var(--accent)" }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
