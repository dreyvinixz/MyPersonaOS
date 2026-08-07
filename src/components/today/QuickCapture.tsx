"use client";

import { useState } from "react";
import { usePersonaState } from "@/lib/storage";
import { Plus, Link as LinkIcon, Mic, Image, Type } from "lucide-react";

type CaptureType = "text" | "link" | "audio" | "image";

const types: { type: CaptureType; icon: typeof Type; label: string }[] = [
  { type: "text", icon: Type, label: "Text" },
  { type: "link", icon: LinkIcon, label: "Link" },
  { type: "audio", icon: Mic, label: "Audio" },
  { type: "image", icon: Image, label: "Image" },
];

export function QuickCapture() {
  const { state, updateState, mounted } = usePersonaState();
  const [value, setValue] = useState("");
  const [selected, setSelected] = useState<CaptureType>("text");

  if (!mounted) return null;

  const handleSave = () => {
    if (!value.trim()) return;
    const newItem = {
      id: Date.now().toString(),
      content: value.trim(),
      type: selected,
      createdAt: new Date().toISOString(),
      processed: false,
    };
    updateState((prev) => ({
      ...prev,
      inboxItems: [newItem, ...prev.inboxItems],
    }));
    setValue("");
  };

  const recentCaptures = state.inboxItems.slice(0, 3);

  return (
    <div
      className="rounded-xl border overflow-hidden shadow-sm"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
    >
      <div
        className="flex items-center justify-between px-5 py-4 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <h2 className="text-sm font-semibold" style={{ color: "var(--text)" }}>
          Quick Capture (Captura Rápida)
        </h2>
        <div className="flex gap-1">
          {types.map(({ type, icon: Icon }) => (
            <button
              key={type}
              onClick={() => setSelected(type)}
              className="p-1.5 rounded-md transition-all"
              style={
                selected === type
                  ? {
                      background: "var(--accent-dim)",
                      color: "var(--accent)",
                    }
                  : { color: "var(--text-subtle)" }
              }
              title={type}
            >
              <Icon size={14} />
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 flex gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          placeholder="O que está na sua mente agora?"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--text-subtle)]"
          style={{ color: "var(--text)" }}
        />
        <button
          onClick={handleSave}
          disabled={!value.trim()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-40"
          style={{
            background: "var(--accent)",
            color: "#fff",
          }}
        >
          <Plus size={14} strokeWidth={2.5} />
          Capturar
        </button>
      </div>

      {recentCaptures.length > 0 && (
        <div
          className="border-t px-4 py-3"
          style={{ borderColor: "var(--border)" }}
        >
          <p
            className="text-[10px] uppercase tracking-widest mb-2"
            style={{ color: "var(--text-subtle)" }}
          >
            Últimas capturas salvas na Inbox
          </p>
          <ul className="flex flex-col gap-1">
            {recentCaptures.map((item) => (
              <li
                key={item.id}
                className="text-xs truncate flex items-center justify-between"
                style={{ color: "var(--text-muted)" }}
              >
                <span>· {item.content}</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[var(--surface)] text-[var(--text-subtle)]">
                  {item.type}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
