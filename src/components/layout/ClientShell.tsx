"use client";

import { usePathname } from "next/navigation";
import { AuthProvider, useAuth } from "@/components/auth/AuthProvider";
import { GlobalQuickCapture } from "@/components/capture/GlobalQuickCapture";
import { Sidebar } from "@/components/layout/Sidebar";
import { PersonaProvider } from "@/stores/persona-store";

function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isCloudMode, user, loading } = useAuth();
  const isAuthRoute = pathname.startsWith("/login");

  if (isAuthRoute) return children;

  // Never expose cached personal data while a Cloud Mode session is unresolved.
  if (isCloudMode && (loading || !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xs font-mono text-[var(--text-subtle)]">
        Verificando sessão privada…
      </div>
    );
  }

  return (
    <div className="app-shell flex h-screen overflow-hidden">
      <Sidebar />
      <main className="app-main flex-1 overflow-y-auto">{children}</main>
      <GlobalQuickCapture />
    </div>
  );
}

/** Client-side provider tree and authenticated application chrome. */
export function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <PersonaProvider>
        <AppFrame>{children}</AppFrame>
      </PersonaProvider>
    </AuthProvider>
  );
}
