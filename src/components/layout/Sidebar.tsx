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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePersonaState } from "@/lib/storage";

const nav = [
  { href: "/", label: "Today", icon: Home },
  { href: "/inbox", label: "Inbox", icon: Inbox, badge: true },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/projects", label: "Projects", icon: Folder },
  { href: "/content", label: "Content", icon: Video },
  { href: "/english", label: "English", icon: BookOpen },
];

export function Sidebar() {
  const pathname = usePathname();
  const { state, mounted } = usePersonaState();

  const inboxCount = mounted
    ? state.inboxItems.filter((i) => !i.processed).length
    : 0;

  return (
    <aside
      className="flex flex-col w-[60px] lg:w-[220px] h-screen border-r shrink-0 transition-all duration-300 select-none"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4 py-5 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <div
          className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 shadow-sm"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          <Zap size={16} strokeWidth={2.5} />
        </div>
        <span
          className="hidden lg:block text-sm font-semibold tracking-tight"
          style={{ color: "var(--text)" }}
        >
          MyPersonaOS
        </span>
      </div>

      {/* Quick Capture Hint */}
      <div className="px-2 pt-3 pb-1 hidden lg:block">
        <button
          onClick={() => {
            window.dispatchEvent(
              new KeyboardEvent("keydown", {
                key: "k",
                ctrlKey: true,
                bubbles: true,
              })
            );
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all duration-150 hover:bg-[var(--card-hover)]"
          style={{
            color: "var(--text-subtle)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <Zap size={12} />
          <span className="flex-1 text-left">Quick Capture</span>
          <kbd
            className="font-mono text-[10px] px-1.5 py-0.5 rounded"
            style={{
              background: "var(--bg)",
              border: "1px solid var(--border)",
            }}
          >
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 p-2 flex-1 mt-1">
        {nav.map(({ href, label, icon: Icon, badge }) => {
          const active = pathname === href;
          const showBadge = badge && inboxCount > 0;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                active ? "text-white" : "hover:opacity-80"
              )}
              style={
                active
                  ? {
                      background: "var(--accent-dim)",
                      color: "var(--accent-hover)",
                    }
                  : {
                      color: "var(--text-muted)",
                    }
              }
            >
              <div className="relative shrink-0">
                <Icon
                  size={18}
                  strokeWidth={active ? 2.5 : 1.8}
                />
                {showBadge && (
                  <span
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
                    style={{
                      background: "var(--accent)",
                      color: "#fff",
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
                  style={{ background: "var(--accent)" }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className="p-4 border-t hidden lg:block"
        style={{ borderColor: "var(--border)" }}
      >
        <p
          className="text-[10px] font-mono tracking-wider"
          style={{ color: "var(--text-subtle)" }}
        >
          why not today?
        </p>
      </div>
    </aside>
  );
}
