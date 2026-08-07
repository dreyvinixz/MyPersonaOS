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

const nav = [
  { href: "/", label: "Today", icon: Home },
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/projects", label: "Projects", icon: Folder },
  { href: "/content", label: "Content", icon: Video },
  { href: "/english", label: "English", icon: BookOpen },
];

export function Sidebar() {
  const pathname = usePathname();

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

      {/* Nav */}
      <nav className="flex flex-col gap-1 p-2 flex-1 mt-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
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
              <Icon
                size={18}
                strokeWidth={active ? 2.5 : 1.8}
                className="shrink-0"
              />
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
