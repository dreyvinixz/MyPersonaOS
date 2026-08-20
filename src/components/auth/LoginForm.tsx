import { useState } from "react";
import { ArrowRight, Lock } from "lucide-react";

interface LoginFormProps {
  onSubmit: (credentials: { email: string; password: string }) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function LoginForm({ onSubmit, loading, error }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email || !password || loading) return;
    await onSubmit({ email, password });
  };

  return (
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

      <form onSubmit={handleSubmit} className="space-y-4">
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
            autoCapitalize="none"
            spellCheck={false}
            maxLength={320}
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
            maxLength={1024}
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
          className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold text-white shadow-lg transition-all duration-150 disabled:opacity-50 mt-2 cursor-pointer"
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
  );
}
