"use client";

import { AuthProvider } from "@/components/auth/AuthProvider";
import { GlobalQuickCapture } from "@/components/capture/GlobalQuickCapture";

/**
 * Client-side providers and global overlays.
 * Mounted once in the root layout to provide app-wide functionality.
 */
export function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <GlobalQuickCapture />
    </AuthProvider>
  );
}
