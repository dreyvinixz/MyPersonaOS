"use client";

import { useState } from "react";
import { usePersonaState } from "@/lib/storage";
import { Target, CheckCircle2, Circle } from "lucide-react";

export function MainFocus() {
  const { state, updateState, mounted } = usePersonaState();
  const [completed, setCompleted] = useState(false);

  if (!mounted) return null;

  const handleToggle = () => {
    setCompleted(!completed);
  };

  const handleChangeFocus = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    updateState((prev) => ({
      ...prev,
      mainFocus: value,
    }));
  };

  return (
    <div
      className="rounded-xl border p-5 transition-all shadow-sm"
      style={{
        background: "var(--card)",
        borderColor: completed ? "var(--green)" : "var(--accent)",
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Target size={16} style={{ color: "var(--accent)" }} />
        <span
          className="text-[11px] font-bold uppercase tracking-wider"
          style={{ color: "var(--accent)" }}
        >
          Foco Principal de Hoje
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleToggle}
          className="transition-transform active:scale-90"
        >
          {completed ? (
            <CheckCircle2 size={22} style={{ color: "var(--green)" }} />
          ) : (
            <Circle size={22} style={{ color: "var(--text-subtle)" }} />
          )}
        </button>

        <input
          type="text"
          value={state.mainFocus}
          onChange={handleChangeFocus}
          placeholder="Qual é o seu único foco inegociável hoje?"
          className={`flex-1 bg-transparent text-base font-semibold outline-none transition-all ${
            completed ? "line-through opacity-50" : ""
          }`}
          style={{ color: "var(--text)" }}
        />
      </div>
    </div>
  );
}
