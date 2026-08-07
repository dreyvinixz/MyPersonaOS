"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { usePersonaState } from "@/lib/storage";
import {
  Command,
  X,
  Zap,
  Type,
  Link as LinkIcon,
  Mic,
  Image,
  ArrowRight,
} from "lucide-react";

type CaptureType = "text" | "link" | "audio" | "image";

const captureTypes: { type: CaptureType; icon: typeof Type; label: string }[] =
  [
    { type: "text", icon: Type, label: "Texto" },
    { type: "link", icon: LinkIcon, label: "Link" },
    { type: "audio", icon: Mic, label: "Áudio" },
    { type: "image", icon: Image, label: "Imagem" },
  ];

export function GlobalQuickCapture() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [selected, setSelected] = useState<CaptureType>("text");
  const [justCaptured, setJustCaptured] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { updateState, mounted } = usePersonaState();

  // ── Ctrl+K / Cmd+K global shortcut ──
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape" && open) {
        e.preventDefault();
        setOpen(false);
      }
    },
    [open]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // ── Auto-focus the textarea when modal opens ──
  useEffect(() => {
    if (open) {
      // Small delay so the animation starts first
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    } else {
      // Reset state when closing
      setValue("");
      setSelected("text");
      setJustCaptured(false);
    }
  }, [open]);

  if (!mounted) return null;

  const handleCapture = () => {
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
    setJustCaptured(true);
    setTimeout(() => {
      setJustCaptured(false);
    }, 1600);
    // Re-focus for rapid sequential captures
    inputRef.current?.focus();
  };

  const handleTextareaKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    // Enter to capture (Shift+Enter for newline)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleCapture();
    }
  };

  return (
    <>
      {/* ── Backdrop ── */}
      {open && (
        <div
          className="fixed inset-0 z-[998] transition-opacity duration-200"
          style={{ background: "rgba(0,0,0,0.60)", backdropFilter: "blur(6px)" }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Modal ── */}
      {open && (
        <div
          className="fixed inset-0 z-[999] flex items-start justify-center pt-[18vh]"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-[540px] rounded-2xl border shadow-2xl overflow-hidden animate-modal-in"
            style={{
              background: "var(--card)",
              borderColor: "var(--border)",
              boxShadow:
                "0 25px 60px rgba(0,0,0,0.50), 0 0 0 1px var(--border), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-3.5 border-b"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="flex items-center justify-center w-6 h-6 rounded-md"
                  style={{ background: "var(--accent-dim)", color: "var(--accent)" }}
                >
                  <Zap size={13} strokeWidth={2.5} />
                </div>
                <span
                  className="text-sm font-semibold"
                  style={{ color: "var(--text)" }}
                >
                  Quick Capture
                </span>
              </div>
              <div className="flex items-center gap-2">
                <kbd
                  className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded"
                  style={{
                    background: "var(--surface)",
                    color: "var(--text-subtle)",
                    border: "1px solid var(--border)",
                  }}
                >
                  ESC
                </kbd>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 rounded-md transition-colors hover:opacity-80"
                  style={{ color: "var(--text-muted)" }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Capture Type Pills */}
            <div
              className="flex items-center gap-1.5 px-5 py-3 border-b"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              {captureTypes.map(({ type, icon: Icon, label }) => (
                <button
                  key={type}
                  onClick={() => {
                    setSelected(type);
                    inputRef.current?.focus();
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
                  style={
                    selected === type
                      ? {
                          background: "var(--accent-dim)",
                          color: "var(--accent)",
                          border: "1px solid var(--accent)",
                        }
                      : {
                          color: "var(--text-muted)",
                          border: "1px solid transparent",
                        }
                  }
                >
                  <Icon size={12} />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>

            {/* Input Area */}
            <div className="px-5 py-4">
              <textarea
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleTextareaKeyDown}
                placeholder="O que está na sua mente agora?"
                rows={3}
                className="w-full bg-transparent text-sm outline-none resize-none placeholder:text-[var(--text-subtle)] leading-relaxed"
                style={{ color: "var(--text)" }}
              />
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-between px-5 py-3 border-t"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="flex items-center gap-2">
                {justCaptured && (
                  <span
                    className="text-xs font-medium animate-fade-in"
                    style={{ color: "var(--green)" }}
                  >
                    ✓ Enviado para a Inbox
                  </span>
                )}
                {!justCaptured && (
                  <span
                    className="text-[11px]"
                    style={{ color: "var(--text-subtle)" }}
                  >
                    <kbd
                      className="font-mono px-1 py-0.5 rounded text-[10px]"
                      style={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      Enter
                    </kbd>{" "}
                    para capturar ·{" "}
                    <kbd
                      className="font-mono px-1 py-0.5 rounded text-[10px]"
                      style={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      Shift+Enter
                    </kbd>{" "}
                    nova linha
                  </span>
                )}
              </div>
              <button
                onClick={handleCapture}
                disabled={!value.trim()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-150 disabled:opacity-30"
                style={{
                  background: value.trim() ? "var(--accent)" : "var(--surface)",
                  color: value.trim() ? "#fff" : "var(--text-muted)",
                }}
              >
                Capturar
                <ArrowRight size={13} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
