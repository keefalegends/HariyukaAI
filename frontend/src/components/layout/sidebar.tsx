"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  PenLine,
  LayoutDashboard,
  FileText,
  FolderOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Info,
  X,
} from "lucide-react";
import { useTheme } from "@/contexts/theme-context";

const navigation = [
  { name: "Dashboard",   href: "/dashboard", icon: LayoutDashboard },
  { name: "Generator",   href: "/generator",  icon: PenLine },
  { name: "Artikel",     href: "/articles",   icon: FileText },
  { name: "Proyek",      href: "/projects",   icon: FolderOpen },
  { name: "API & Model", href: "/settings",   icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const isDark = theme === "dark";

  const base = isDark
    ? "bg-[#121215] border-[#27272a] text-[#a1a1aa]"
    : "bg-white border-[#e4e4e7] text-[#3f3f46]";
  const activeLink = isDark
    ? "bg-[#27272a] text-white"
    : "bg-[#f4f4f5] text-[#09090b]";
  const hoverLink = isDark
    ? "hover:bg-[#1e1e21] hover:text-white"
    : "hover:bg-[#f4f4f5] hover:text-[#09090b]";
  const mutedText = isDark ? "text-[#52525b]" : "text-[#a1a1aa]";
  const borderTop = isDark ? "border-[#27272a]" : "border-[#e4e4e7]";
  const bgHover = isDark ? "hover:bg-[#1e1e21]" : "hover:bg-[#f4f4f5]";
  const cardBg = isDark ? "bg-[#1e1e21] border-[#27272a]" : "bg-[#f4f4f5] border-[#e4e4e7]";

  return (
    <>
      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAbout(false)}
          />
          <div className={`relative z-10 w-full max-w-sm rounded-xl border p-6 shadow-2xl space-y-4 ${isDark ? "bg-[#121215] border-[#27272a]" : "bg-white border-[#e4e4e7]"}`}>
            <div className="flex items-center justify-between">
              <h2 className={`text-sm font-semibold ${isDark ? "text-white" : "text-[#09090b]"}`}>Tentang Hariyuka AI</h2>
              <button
                onClick={() => setShowAbout(false)}
                className={`p-1 rounded-md ${bgHover} transition-colors`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className={`space-y-3 text-xs ${isDark ? "text-[#a1a1aa]" : "text-[#52525b]"}`}>
              <div className={`p-3 rounded-lg border ${cardBg} space-y-1`}>
                <div className={`text-[10px] uppercase tracking-wider font-medium ${mutedText}`}>Platform</div>
                <p className={`font-medium ${isDark ? "text-white" : "text-[#09090b]"}`}>Hariyuka AI</p>
                <p className={mutedText}>Multi-Step Agentic SEO Article Writer — 100% Open-Source & Self-Hosted</p>
              </div>

              <div className={`p-3 rounded-lg border ${cardBg} space-y-2`}>
                <div className={`text-[10px] uppercase tracking-wider font-medium ${mutedText}`}>Tim Pembuat</div>
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-[11px] font-bold text-white">K</div>
                  <div>
                    <div className={`font-semibold ${isDark ? "text-white" : "text-[#09090b]"}`}>Keefa</div>
                    <div className={mutedText}>Developer & Architect</div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-zinc-600 flex items-center justify-center text-[11px] font-bold text-white">S</div>
                  <div>
                    <div className={`font-semibold ${isDark ? "text-white" : "text-[#09090b]"}`}>Salna</div>
                    <div className={mutedText}>Helper & Content Strategist</div>
                  </div>
                </div>
              </div>

              <div className={`p-3 rounded-lg border ${cardBg} space-y-1`}>
                <div className={`text-[10px] uppercase tracking-wider font-medium ${mutedText}`}>Stack Teknologi</div>
                <p className={mutedText}>Next.js 14 · FastAPI · Supabase · Claude 4.6 · Gemini 3.7 via 9Router</p>
              </div>

              <div className={`text-center text-[10px] ${mutedText}`}>
                Made with ♥ · Open-Source
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside
        className={`relative flex flex-col justify-between h-screen sticky top-0 border-r transition-[width] duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden ${base} ${collapsed ? "w-[57px]" : "w-56"}`}
      >
        {/* Toggle button — sits on the edge */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`absolute -right-3 top-[54px] z-20 w-6 h-6 rounded-full border flex items-center justify-center shadow-md transition-colors ${isDark ? "bg-[#121215] border-[#27272a] hover:bg-[#1e1e21] text-[#71717a]" : "bg-white border-[#e4e4e7] hover:bg-[#f4f4f5] text-[#71717a]"}`}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed
            ? <ChevronRight className="w-3 h-3" />
            : <ChevronLeft className="w-3 h-3" />
          }
        </button>

        <div className="flex flex-col min-h-0 flex-1">
          {/* Logo */}
          <div className={`h-14 flex items-center px-3.5 border-b ${borderTop} shrink-0`}>
            <div className="flex items-center gap-2.5">
              <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${isDark ? "bg-white" : "bg-[#09090b]"}`}>
                <PenLine className={`w-3.5 h-3.5 ${isDark ? "text-black" : "text-white"}`} strokeWidth={2.5} />
              </div>
              <span
                className={`font-semibold text-sm tracking-tight transition-[opacity,width] duration-200 overflow-hidden whitespace-nowrap ${isDark ? "text-white" : "text-[#09090b]"} ${collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"}`}
              >
                Hariyuka AI
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-2 mt-1 space-y-0.5 flex-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={collapsed ? item.name : undefined}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors group ${isActive ? activeLink : `${mutedText} ${hoverLink}`}`}
                >
                  <Icon className="w-4 h-4 shrink-0" strokeWidth={isActive ? 2 : 1.75} />
                  <span
                    className={`transition-[opacity,width] duration-200 overflow-hidden whitespace-nowrap ${collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"}`}
                  >
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom section */}
        <div className={`border-t ${borderTop} p-2 space-y-1 shrink-0`}>
          {/* Settings (Theme) button */}
          {!collapsed && (
            <div className={`rounded-lg border p-3 space-y-2 ${cardBg}`}>
              <div className={`text-[10px] uppercase tracking-wider font-medium ${mutedText}`}>Tampilan</div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setTheme("dark")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                    !isDark
                      ? `${isDark ? "text-[#71717a] border-[#27272a]" : "text-[#a1a1aa] border-[#e4e4e7]"}`
                      : "bg-[#27272a] border-[#3f3f46] text-white"
                  }`}
                >
                  <Moon className="w-3 h-3" />
                  <span>Dark</span>
                </button>
                <button
                  onClick={() => setTheme("light")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                    isDark
                      ? "text-[#71717a] border-[#27272a] hover:border-[#3f3f46]"
                      : "bg-[#e4e4e7] border-[#d4d4d8] text-[#09090b]"
                  }`}
                >
                  <Sun className="w-3 h-3" />
                  <span>Light</span>
                </button>
              </div>
            </div>
          )}

          {/* About button */}
          <button
            onClick={() => setShowAbout(true)}
            title="Tentang Hariyuka AI"
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors ${mutedText} ${bgHover}`}
          >
            <Info className="w-4 h-4 shrink-0" strokeWidth={1.75} />
            <span className={`transition-[opacity,width] duration-200 overflow-hidden whitespace-nowrap ${collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"}`}>
              Tentang
            </span>
          </button>

          {/* User profile */}
          <div className={`flex items-center gap-2.5 px-2.5 py-2`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${isDark ? "bg-[#27272a] border border-[#3f3f46] text-[#a1a1aa]" : "bg-[#e4e4e7] border border-[#d4d4d8] text-[#52525b]"}`}>
              H
            </div>
            <div className={`min-w-0 transition-[opacity,width] duration-200 overflow-hidden ${collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"}`}>
              <div className={`text-xs font-medium truncate ${isDark ? "text-[#d4d4d8]" : "text-[#3f3f46]"}`}>Hariyuka Writer</div>
              <div className={`text-[10px] truncate flex items-center gap-1 ${mutedText}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                Self-Hosted
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
