import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { ClientShell } from "@/components/layout/ClientShell";

export const metadata: Metadata = {
  title: "MyPersonaOS — Personal Life Operating System",
  description: "What deserves attention today?",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MyPersonaOS",
  },
};

export const viewport: Viewport = {
  themeColor: "#05060A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <ClientShell>
          <div className="app-shell flex h-screen overflow-hidden">
            <Sidebar />
            <main className="app-main flex-1 overflow-y-auto">{children}</main>
          </div>
        </ClientShell>
      </body>
    </html>
  );
}
