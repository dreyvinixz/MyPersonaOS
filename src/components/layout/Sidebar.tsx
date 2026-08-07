"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Inbox,
  CheckSquare,
  Folder,
  Video,
  BookOpen,
  Zap,
  LogOut,
  Wifi,
  CloudCheck,
  RefreshCw,
  HardDrive,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePersonaState } from "@/lib/storage";
import { useAuth } from "@/components/auth/AuthProvider";
import { openQuickCapture } from "@/lib/ui-events";
import type { SyncStatus } from "@/types";

const nav = [
  { href: "/", label: "Today", icon: Home },
  { href: "/inbox", label: "Inbox", icon: Inbox, badge: true },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/projects", label: "Projects", icon: Folder },
  { href: "/content", label: "Content", icon: Video },
  { href: "/english", label: "English", icon: BookOpen },
];

function SyncIndicator({ status }: { status: SyncStatus }) {
  switch (status) {
    case "synced":
      return (
        <div className="flex items-center gap-1.5 text-xs text-[var(--green)]">
          <span className="w-2 h-2 rounded-full bg-[var(--green)] animate-pulse" />
          <span>Cloud synced</span>
        </div>
      );
    case "syncing":
      return (
        <div className="flex items-center gap-1.5 text-xs text-[var(--accent-hover)]">
          <RefreshCw size={12} className="animate-spin" />
          <span>Syncing...</span>
        </div>
      );
    case "local":
      return (
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-subtle)]">
          <HardDrive size={12} />
          <span>Local mode</span>
        </div>
      );
    case "offline":
      return (
        <div className="flex items-center gap-1.5 text-xs text-[var(--amber)]">
          <AlertTriangle size={12} />
          <span>Offline</span>
        </div>
      );
    case "error":
      return (
        <div className="flex items-center gap-1.5 text-xs text-[var(--red)]">
          <AlertTriangle size={12} />
          <span>Sync error</span>
        </div>
      );
    default:
      return (
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-subtle)]">
          <RefreshCw size={12} className="animate-spin" />
          <span>Initializing...</span>
        </div>
      );
  }
}

export function Sidebar() {
  const pathname = usePathname();
  const { state, syncStatus, mounted } = usePersonaState();
  const { user, isCloudMode, signOut } = useAuth();

  const inboxCount = mounted
    ? state.inboxItems.filter((item) => item.status === "pending").length
    : 0;

  return (
    <aside
      className="flex flex-col w-[60px] lg:w-[220px] h-screen border-r shrink-0 transition-all duration-300 select-none backdrop-blur-2xl"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
      }}
    >
      {/* Brand Logo */}
      <div
        className="flex items-center gap-3 px-4 py-5 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <div
          className="oil-logo flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
          style={{ color: "#fff" }}
        >
          <Zap size={16} strokeWidth={2.5} />
        </div>
        <span
          className="hidden lg:block text-sm font-bold tracking-tight"
          style={{ color: "var(--text)" }}
        >
          MyPersonaOS
        </span>
      </div>

      {/* Quick Capture Hint */}
      <div className="px-2 pt-3 pb-1 hidden lg:block">
        <button
          type="button"
          onClick={openQuickCapture}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all duration-150 hover:bg-[var(--card-hover)]"
          style={{
            color: "var(--text-subtle)",
            border: "1px solid var(--border-subtle)",
            background: "rgba(255,255,255,0.015)",
          }}
        >
          <Zap size={12} style={{ color: "var(--cyan)" }} />
          <span className="flex-1 text-left">Quick Capture</span>
          <kbd
            className="font-mono text-[10px] px-1.5 py-0.5 rounded"
            style={{
              background: "rgba(5,6,10,0.72)",
              border: "1px solid var(--border)",
            }}
          >
            Ctrl/⌘ K
          </kbd>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col gap-1 p-2 flex-1 mt-1">
        {nav.map(({ href, label, icon: Icon, badge }) => {
          const active = pathname === href;
          const showBadge = badge && inboxCount > 0;

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150",
                active ? "text-white" : "hover:opacity-90"
              )}
              style={
                active
                  ? {
                      background: "var(--accent-dim)",
                      color: "var(--accent-hover)",
                      boxShadow: "inset 0 0 0 1px rgba(196,181,253,0.08)",
                    }
                  : {
                      color: "var(--text-muted)",
                    }
              }
            >
              <div className="relative shrink-0">
                <Icon size={18} strokeWidth={active ? 2.5 : 1.8} />
                {showBadge && (
                  <span
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center font-mono"
                    style={{
                      background: "var(--magenta)",
                      color: "#fff",
                      boxShadow: "0 0 14px rgba(236,72,153,0.3)",
                    }}
                  >
                    {inboxCount > 9 ? "9+" : inboxCount}
                  </span>
                )}
              </div>
              <span className="hidden lg:block">{label}</span>
              {active && (
                <span
                  className="hidden lg:block ml-auto w-1.5 h-1.5 rounded-full"
                  style={{ background: "var(--cyan)" }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer & Sync Status Indicator */}
      <div
        className="p-4 border-t flex flex-col gap-2.5 hidden lg:flex"
        style={{ borderColor: "var(--border)" }}
      >
        <SyncIndicator status={syncStatus} />

        {isCloudMode && user ? (
          <div className="flex items-center justify-between pt-1">
            <span
              className="text-xs font-mono truncate max-w-[120px]"
              style={{ color: "var(--text-subtle)" }}
              title={user.email || ""}
            >
              {user.email?.split("@")[0]}
            </span>
            <button
              type="button"
              onClick={() => signOut()}
              className="p-1 rounded text-xs transition-colors hover:text-[var(--red)]"
              style={{ color: "var(--text-subtle)" }}
              title="Sair da conta"
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <p className="text-[10px] font-mono tracking-wider oil-gradient-text">
            why not today?
          </p>
        )}
      </div>
    </aside>
  );
}
