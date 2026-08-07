"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Zap, Lock, ArrowRight, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message || "Email ou senha incorretos.");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Oil Slick Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--oil-gradient-soft)] rounded-full blur-3xl opacity-30 pointer-events-none" />

      <div
        className="oil-glass w-full max-w-[420px] rounded-2xl border p-8 shadow-2xl relative z-10 animate-modal-in"
        style={{ borderColor: "var(--border)" }}
      >
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div
            className="oil-logo flex items-center justify-center w-12 h-12 rounded-xl mb-4 text-white shadow-lg"
          >
            <Zap size={24} strokeWidth={2.5} />
          </div>
          <h1
            className="text-2xl font-extrabold tracking-tight"
            style={{ color: "var(--text)" }}
          >
            MyPersonaOS
          </h1>
          <p
            className="text-sm mt-1.5 font-medium"
            style={{ color: "var(--text-muted)" }}
          >
            Your life. One system.
          </p>
        </div>

        {/* Private OS Warning Banner */}
        <div
          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border mb-6 text-xs font-medium"
          style={{
            background: "rgba(155,135,245,0.06)",
            borderColor: "rgba(155,135,245,0.2)",
            color: "var(--text-muted)",
          }}
        >
          <Lock size={14} className="shrink-0 text-[var(--accent)]" />
          <span>Sistema privado — cadastro público desativado.</span>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-xs uppercase font-mono tracking-wider font-semibold mb-2"
              style={{ color: "var(--text-subtle)" }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full px-4 py-3 rounded-xl border bg-[rgba(5,6,10,0.6)] text-sm outline-none transition-all focus:border-[var(--accent)]"
              style={{
                color: "var(--text)",
                borderColor: "var(--border)",
              }}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs uppercase font-mono tracking-wider font-semibold mb-2"
              style={{ color: "var(--text-subtle)" }}
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-3 rounded-xl border bg-[rgba(5,6,10,0.6)] text-sm outline-none transition-all focus:border-[var(--accent)]"
              style={{
                color: "var(--text)",
                borderColor: "var(--border)",
              }}
            />
          </div>

          {error && (
            <div
              className="p-3 rounded-lg text-xs font-medium border animate-fade-in"
              style={{
                background: "var(--red-dim)",
                color: "var(--red)",
                borderColor: "rgba(251,113,133,0.3)",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold text-white shadow-lg transition-all duration-150 disabled:opacity-50 mt-2"
            style={{
              background: "var(--oil-gradient)",
            }}
          >
            {loading ? (
              "Entrando..."
            ) : (
              <>
                Entrar no MyPersonaOS
                <ArrowRight size={16} strokeWidth={2.5} />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t flex items-center justify-center gap-1.5 text-xs text-[var(--text-subtle)]" style={{ borderColor: "var(--border)" }}>
          <ShieldCheck size={14} className="text-[var(--green)]" />
          <span className="font-mono text-[11px]">Private Single-Owner OS</span>
        </div>
      </div>
    </div>
  );
}
