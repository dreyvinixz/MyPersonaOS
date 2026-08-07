"use client";

import Link from "next/link";
import { usePersonaState } from "@/lib/storage";
import { Folder, Video, BookOpen, ArrowRight } from "lucide-react";

export function ModuleSummaries() {
  const { state, mounted } = usePersonaState();

  if (!mounted) return null;

  const activeProjects = state.projects.length;
  const activeContent = state.contentPieces.length;
  const vocabCount = state.englishWords.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Projects */}
      <Link
        href="/projects"
        className="rounded-xl border p-4 transition-all hover:border-[var(--accent)] group shadow-sm flex flex-col justify-between"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Folder size={16} style={{ color: "var(--accent)" }} />
            <h3 className="text-xs font-semibold" style={{ color: "var(--text)" }}>
              Projetos
            </h3>
          </div>
          <ArrowRight
            size={14}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: "var(--accent)" }}
          />
        </div>
        <div className="text-2xl font-bold" style={{ color: "var(--text)" }}>
          {activeProjects} <span className="text-xs font-normal" style={{ color: "var(--text-muted)" }}>ativos</span>
        </div>
      </Link>

      {/* Content */}
      <Link
        href="/content"
        className="rounded-xl border p-4 transition-all hover:border-[var(--accent)] group shadow-sm flex flex-col justify-between"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Video size={16} style={{ color: "var(--accent)" }} />
            <h3 className="text-xs font-semibold" style={{ color: "var(--text)" }}>
              Content Studio
            </h3>
          </div>
          <ArrowRight
            size={14}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: "var(--accent)" }}
          />
        </div>
        <div className="text-2xl font-bold" style={{ color: "var(--text)" }}>
          {activeContent} <span className="text-xs font-normal" style={{ color: "var(--text-muted)" }}>em produção</span>
        </div>
      </Link>

      {/* English */}
      <Link
        href="/english"
        className="rounded-xl border p-4 transition-all hover:border-[var(--accent)] group shadow-sm flex flex-col justify-between"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BookOpen size={16} style={{ color: "var(--accent)" }} />
            <h3 className="text-xs font-semibold" style={{ color: "var(--text)" }}>
              English Lab
            </h3>
          </div>
          <ArrowRight
            size={14}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: "var(--accent)" }}
          />
        </div>
        <div className="text-2xl font-bold" style={{ color: "var(--text)" }}>
          {vocabCount} <span className="text-xs font-normal" style={{ color: "var(--text-muted)" }}>palavras</span>
        </div>
      </Link>
    </div>
  );
}
