"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";
import { Zap, Lock, ArrowRight, ShieldCheck, HardDrive } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const cloudConfigured = isSupabaseConfigured();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!cloudConfigured || !email || !password) return;

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message || "Email ou senha incorretos.");
        return;
      }

      router.replace("/");
      router.refresh();
    } catch (loginError) {
      console.error("Login failed:", loginError);
      setError("Não foi possível conectar ao sistema privado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--oil-gradient-soft)] rounded-full blur-3xl opacity-30 pointer-events-none" />

      <div
        className="oil-glass w-full max-w-[420px] rounded-2xl border p-8 shadow-2xl relative z-10 animate-modal-in"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex flex-col items-center text-center mb-8">
          <div className="oil-logo flex items-center justify-center w-12 h-12 rounded-xl mb-4 text-white shadow-lg">
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

        {!cloudConfigured ? (
          <div className="space-y-5">
            <div
              className="flex items-start gap-3 px-4 py-3.5 rounded-xl border text-sm"
              style={{
                background: "rgba(34,211,238,0.05)",
                borderColor: "rgba(34,211,238,0.18)",
                color: "var(--text-muted)",
              }}
            >
              <HardDrive
                size={18}
                className="shrink-0 mt-0.5 text-[var(--cyan)]"
              />
              <div>
                <p className="font-semibold text-[var(--text)] mb-1">
                  Local Mode ativo
                </p>
                <p className="text-xs leading-relaxed">
                  Supabase não está configurado neste ambiente. O MyPersonaOS
                  continua funcionando localmente sem autenticação.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => router.replace("/")}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold text-white shadow-lg"
              style={{ background: "var(--oil-gradient)" }}
            >
              Continuar em Local Mode
              <ArrowRight size={16} strokeWidth={2.5} />
            </button>
          </div>
        ) : (
          <>
            <div
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border mb-6 text-xs font-medium"
              style={{
                background: "rgba(155,135,245,0.06)",
                borderColor: "rgba(155,135,245,0.2)",
                color: "var(--text-muted)",
              }}
            >
              <Lock size={14} className="shrink-0 text-[var(--accent)]" />
              <span>Sistema privado — cadastro público deve permanecer desativado.</span>
            </div>

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
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
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
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
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
                style={{ background: "var(--oil-gradient)" }}
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
          </>
        )}

        <div
          className="mt-8 pt-6 border-t flex items-center justify-center gap-1.5 text-xs text-[var(--text-subtle)]"
          style={{ borderColor: "var(--border)" }}
        >
          <ShieldCheck size={14} className="text-[var(--green)]" />
          <span className="font-mono text-[11px]">
            {cloudConfigured ? "Private Single-Owner OS" : "Local-First OS"}
          </span>
        </div>
      </div>
    </div>
  );
}
