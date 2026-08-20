"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";
import { ShieldCheck } from "lucide-react";
import { LoginCardHeader } from "@/components/auth/LoginCardHeader";
import { LocalModeBanner } from "@/components/auth/LocalModeBanner";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const cloudConfigured = isSupabaseConfigured();

  const handleLogin = async ({ email, password }: { email: string; password: string }) => {
    if (!cloudConfigured) return;

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError("Não foi possível autenticar com as credenciais informadas.");
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
      <meta name="robots" content="noindex, nofollow" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--oil-gradient-soft)] rounded-full blur-3xl opacity-30 pointer-events-none" />

      <div
        className="oil-glass w-full max-w-[420px] rounded-2xl border p-8 shadow-2xl relative z-10 animate-modal-in"
        style={{ borderColor: "var(--border)" }}
      >
        <LoginCardHeader />

        {!cloudConfigured ? (
          <LocalModeBanner onContinue={() => router.replace("/")} />
        ) : (
          <LoginForm onSubmit={handleLogin} loading={loading} error={error} />
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
