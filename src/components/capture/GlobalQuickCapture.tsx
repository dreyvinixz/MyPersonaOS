"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePersonaState } from "@/lib/storage";
import { createEntityId } from "@/lib/ids";
import { QUICK_CAPTURE_OPEN_EVENT } from "@/lib/ui-events";
import { PERSONA_INPUT_LIMITS } from "@/lib/persona-state";
import {
  ArrowRight,
  Image,
  Link as LinkIcon,
  Mic,
  Plus,
  Type,
  X,
  Zap,
} from "lucide-react";

type CaptureType = "text" | "link" | "audio" | "image";

type CaptureOption = {
  type: CaptureType;
  icon: typeof Type;
  label: string;
  enabled: boolean;
};

const captureTypes: CaptureOption[] = [
  { type: "text", icon: Type, label: "Texto", enabled: true },
  { type: "link", icon: LinkIcon, label: "Link", enabled: true },
  { type: "audio", icon: Mic, label: "Áudio", enabled: false },
  { type: "image", icon: Image, label: "Imagem", enabled: false },
];

export function GlobalQuickCapture() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [selected, setSelected] = useState<CaptureType>("text");
  const [justCaptured, setJustCaptured] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { updateState, mounted } = usePersonaState();

  const openCapture = useCallback(() => {
    setValue("");
    setSelected("text");
    setJustCaptured(false);
    setOpen(true);
  }, []);

  const closeCapture = useCallback(() => {
    setOpen(false);
    setValue("");
    setSelected("text");
    setJustCaptured(false);
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (open) closeCapture();
        else openCapture();
      }

      if (event.key === "Escape" && open) {
        event.preventDefault();
        closeCapture();
      }
    },
    [closeCapture, open, openCapture]
  );

  useEffect(() => {
    const handleOpenRequest = () => openCapture();

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener(QUICK_CAPTURE_OPEN_EVENT, handleOpenRequest);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener(QUICK_CAPTURE_OPEN_EVENT, handleOpenRequest);
    };
  }, [handleKeyDown, openCapture]);

  useEffect(() => {
    if (!open) return;
    const timeout = setTimeout(() => inputRef.current?.focus(), 80);
    return () => clearTimeout(timeout);
  }, [open]);

  if (!mounted) return null;

  const handleCapture = () => {
    const content = value.trim();
    if (!content) return;

    const iso = new Date().toISOString();
    const newItem = {
      id: createEntityId(),
      content,
      type: selected,
      status: "pending" as const,
      createdAt: iso,
      updatedAt: iso,
    };

    updateState((previous) => ({
      ...previous,
      inboxItems: [newItem, ...previous.inboxItems],
    }));

    setValue("");
    setJustCaptured(true);
    setTimeout(() => setJustCaptured(false), 1600);
    inputRef.current?.focus();
  };

  const handleTextareaKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleCapture();
    }
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={openCapture}
          className="lg:hidden fixed right-4 bottom-4 z-[900] h-12 w-12 rounded-full flex items-center justify-center shadow-2xl transition-transform active:scale-95"
          style={{
            background: "var(--accent)",
            color: "#fff",
            boxShadow: "0 12px 32px rgba(0,0,0,0.45)",
          }}
          aria-label="Abrir Quick Capture"
        >
          <Plus size={21} strokeWidth={2.5} />
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 z-[998] transition-opacity duration-200"
          style={{ background: "rgba(0,0,0,0.60)", backdropFilter: "blur(6px)" }}
          onClick={closeCapture}
        />
      )}

      {open && (
        <div
          className="fixed inset-0 z-[999] flex items-start justify-center px-3 pt-[12vh] sm:pt-[18vh]"
          onClick={closeCapture}
        >
          <div
            className="w-full max-w-[540px] rounded-2xl border shadow-2xl overflow-hidden animate-modal-in"
            style={{
              background: "var(--card)",
              borderColor: "var(--border)",
              boxShadow:
                "0 25px 60px rgba(0,0,0,0.50), 0 0 0 1px var(--border), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Quick Capture"
          >
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
                <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>
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
                  type="button"
                  onClick={closeCapture}
                  className="p-1 rounded-md transition-colors hover:opacity-80"
                  style={{ color: "var(--text-muted)" }}
                  aria-label="Fechar Quick Capture"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div
              className="flex flex-wrap items-center gap-1.5 px-5 py-3 border-b"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              {captureTypes.map(({ type, icon: Icon, label, enabled }) => (
                <button
                  type="button"
                  key={type}
                  disabled={!enabled}
                  title={enabled ? label : `${label} — em breve`}
                  onClick={() => {
                    if (!enabled) return;
                    setSelected(type);
                    inputRef.current?.focus();
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-35"
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
                  {!enabled && (
                    <span className="hidden md:inline text-[9px] uppercase tracking-wide">
                      em breve
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="px-5 py-4">
              <textarea
                ref={inputRef}
                value={value}
                maxLength={PERSONA_INPUT_LIMITS.inboxContent}
                onChange={(event) => setValue(event.target.value)}
                onKeyDown={handleTextareaKeyDown}
                placeholder={
                  selected === "link"
                    ? "Cole um link ou escreva por que ele importa..."
                    : "O que está na sua mente agora?"
                }
                rows={3}
                className="w-full bg-transparent text-sm outline-none resize-none placeholder:text-[var(--text-subtle)] leading-relaxed"
                style={{ color: "var(--text)" }}
              />
            </div>

            <div
              className="flex items-center justify-between gap-3 px-5 py-3 border-t"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="min-w-0">
                {justCaptured ? (
                  <span
                    className="text-xs font-medium animate-fade-in"
                    style={{ color: "var(--green)" }}
                  >
                    ✓ Enviado para a Inbox
                  </span>
                ) : (
                  <span
                    className="hidden sm:inline text-[11px]"
                    style={{ color: "var(--text-subtle)" }}
                  >
                    Enter para capturar · Shift+Enter nova linha
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleCapture}
                disabled={!value.trim()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-150 disabled:opacity-30 shrink-0"
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
