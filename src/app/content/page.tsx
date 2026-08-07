"use client";

import { usePersonaState } from "@/lib/storage";
import { Video } from "lucide-react";

export default function ContentPage() {
  const { state, mounted } = usePersonaState();

  if (!mounted) return null;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.25em] font-semibold mb-2" style={{ color: "var(--text-subtle)" }}>
          Pipeline de Mídia
        </p>
        <div className="flex items-center gap-3">
          <Video size={28} style={{ color: "var(--accent)" }} />
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--text)" }}>Content Studio</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {state.contentPieces.map((item) => (
          <div key={item.id} className="rounded-xl border p-4 flex flex-col justify-between shadow-sm" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[var(--surface)]" style={{ color: "var(--accent)" }}>
                  {item.brand}
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: "var(--text-muted)" }}>
                  {item.stage}
                </span>
              </div>
              <h3 className="font-semibold text-sm mb-2" style={{ color: "var(--text)" }}>{item.title}</h3>
            </div>
            {item.platforms && (
              <div className="flex gap-1 mt-3">
                {item.platforms.map((p) => (
                  <span key={p} className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-[var(--border)]" style={{ color: "var(--text-subtle)" }}>
                    {p}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
