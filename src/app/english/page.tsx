"use client";

import { usePersonaState } from "@/lib/storage";
import { BookOpen } from "lucide-react";

export default function EnglishPage() {
  const { state, mounted } = usePersonaState();

  if (!mounted) return null;

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.25em] font-semibold mb-2" style={{ color: "var(--text-subtle)" }}>
          Método de Aprendizado
        </p>
        <div className="flex items-center gap-3">
          <BookOpen size={28} style={{ color: "var(--accent)" }} />
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--text)" }}>English Lab</h1>
        </div>
      </div>

      <div className="rounded-xl border overflow-hidden shadow-sm" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="px-5 py-4 border-b font-semibold text-sm" style={{ borderColor: "var(--border)", color: "var(--text)" }}>
          Vocabulário Ativo ({state.englishWords.length})
        </div>
        <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
          {state.englishWords.map((word) => (
            <li key={word.id} className="p-4">
              <div className="flex items-baseline justify-between mb-1">
                <h3 className="font-bold text-base" style={{ color: "var(--accent-hover)" }}>{word.term}</h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[var(--surface)]" style={{ color: "var(--green)" }}>
                  Nível {word.masteryLevel}/5
                </span>
              </div>
              <p className="text-sm mb-1" style={{ color: "var(--text)" }}>{word.definition}</p>
              {word.example && (
                <p className="text-xs italic" style={{ color: "var(--text-muted)" }}>"{word.example}"</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
