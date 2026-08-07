"use client";

import { usePathname } from "next/navigation";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { GlobalQuickCapture } from "@/components/capture/GlobalQuickCapture";
import { Sidebar } from "@/components/layout/Sidebar";
import { PersonaProvider } from "@/stores/persona-store";

/**
 * Client-side provider tree and authenticated application chrome.
 * /login is intentionally isolated from Sidebar/QuickCapture.
 */
export function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = pathname.startsWith("/login");

  return (
    <AuthProvider>
      <PersonaProvider>
        {isAuthRoute ? (
          children
        ) : (
          <div className="app-shell flex h-screen overflow-hidden">
            <Sidebar />
            <main className="app-main flex-1 overflow-y-auto">{children}</main>
            <GlobalQuickCapture />
          </div>
        )}
      </PersonaProvider>
    </AuthProvider>
  );
}
