import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { ClientShell } from "@/components/layout/ClientShell";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600"],
});

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
    <html lang="pt-BR" className={`${jakarta.variable} ${mono.variable}`}>
      <body className="font-sans antialiased selection:bg-[var(--accent-dim)] selection:text-white">
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
