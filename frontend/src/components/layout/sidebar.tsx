"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  PenLine,
  LayoutDashboard,
  FileText,
  FolderOpen,
  Settings,
  Sun,
  Moon,
  Flame,
  Info,
  X,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import { useTheme, type Theme } from "@/contexts/theme-context";
import { useTokens } from "@/lib/use-tokens";
import { HariyukaLogo } from "@/components/ui/hariyuka-logo";

const navigation = [
  { name: "Dashboard",   href: "/dashboard", icon: LayoutDashboard },
  { name: "Generator",   href: "/generator",  icon: PenLine },
  { name: "Artikel",     href: "/articles",   icon: FileText },
  { name: "Proyek",      href: "/projects",   icon: FolderOpen },
  { name: "API & Model", href: "/settings",   icon: Settings },
];

const THEMES: { key: Theme; label: string; icon: any; desc: string }[] = [
  { key: "warm",  label: "Warm (Claude.ai)", icon: Flame, desc: "Warm editorial · Terracotta accent (Default)" },
  { key: "dark",  label: "Dark (Zinc)",      icon: Moon,  desc: "Cool dark · Minimalist neutral" },
  { key: "light", label: "Light (Sand)",     icon: Sun,   desc: "Warm off-white · Sand cream" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const tk = useTokens();
  const [collapsed, setCollapsed] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [articleCount, setArticleCount] = useState<number>(0);
  const [operatorName, setOperatorName] = useState<string>("keefa9");

  useEffect(() => {
    // Fetch dashboard stats
    fetch("http://localhost:8000/api/v1/settings/dashboard-stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.total_articles !== undefined) setArticleCount(d.total_articles);
      })
      .catch(() => {});

    // Fetch active logged-in operator
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.operator) setOperatorName(d.operator);
      })
      .catch(() => {});
  }, []);

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    window.location.href = "/login";
  };

  return (
    <>
      {/* ─── LOGOUT CONFIRMATION MODAL ─── */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in"
            onClick={() => !isLoggingOut && setShowLogoutModal(false)}
          />
          <div
            className={`relative z-10 w-full max-w-sm rounded-2xl border p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 ${tk.cardBg}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                  <LogOut className="w-4 h-4" />
                </div>
                <div>
                  <h2 className={`text-sm font-semibold ${tk.textPrimary}`}>
                    Akhiri Sesi Operator
                  </h2>
                  <p className={`text-[10px] ${tk.textFaint}`}>Gateway Lock Required</p>
                </div>
              </div>
              <button
                disabled={isLoggingOut}
                onClick={() => setShowLogoutModal(false)}
                className={`p-1.5 rounded-lg transition-colors ${tk.navInactive}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-3">
              <p className={`text-xs leading-relaxed ${tk.textMuted}`}>
                Apakah Anda yakin ingin keluar dari sesi operator{" "}
                <span className={`font-mono font-bold ${tk.textPrimary}`}>
                  {operatorName}
                </span>
                ? Kunci keamanan gateway akan diaktifkan dan Anda harus memasukkan passphrase kembali untuk mengakses dashboard.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t t-border">
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={() => setShowLogoutModal(false)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${tk.outlineBtn}`}
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={handleConfirmLogout}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-500 text-white shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Mengunci...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout & Kunci Gateway</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── ABOUT MODAL ─── */}
      {showAbout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAbout(false)} />
          <div className={`relative z-10 w-full max-w-sm rounded-2xl border p-6 shadow-2xl space-y-5 ${tk.cardBg}`}>
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <HariyukaLogo className="w-6 h-6 shrink-0" variant="white" />
                <div>
                  <h2 className={`text-sm font-semibold ${tk.textPrimary}`}>Hariyuka AI</h2>
                  <p className={`text-[10px] ${tk.textFaint}`}>Next-Gen SEO Platform</p>
                </div>
              </div>
              <button onClick={() => setShowAbout(false)} className={`p-1.5 rounded-lg transition-colors ${tk.navInactive}`}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* About body */}
            <div className="space-y-4">
              <p className={`text-xs leading-relaxed ${tk.textMuted}`}>
                Platform SEO Article Generator berbasis multi-step agentic AI pipeline. 100% open-source & self-hosted tanpa batasan kata atau paywall.
              </p>

              {/* Team Section */}
              <div className="space-y-2">
                <div className={`text-[10px] font-semibold uppercase tracking-widest ${tk.textFaint}`}>Tim Pembuat</div>
                {[
                  { initial: "K", name: "Keefa", role: "Developer & Architect" },
                  { initial: "S", name: "Salna", role: "Helper & Content Strategist" },
                ].map((p) => (
                  <div key={p.name} className={`flex items-center gap-3 p-3 rounded-xl border ${tk.tagBg}`}>
                    <div className="w-8 h-8 rounded-full t-accent-bg flex items-center justify-center text-sm font-bold shrink-0">
                      {p.initial}
                    </div>
                    <div>
                      <div className={`text-sm font-semibold ${tk.textPrimary}`}>{p.name}</div>
                      <div className={`text-[11px] ${tk.textMuted}`}>{p.role}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tech stack */}
              <div className={`p-3 rounded-xl border space-y-1 ${tk.tagBg}`}>
                <div className={`text-[10px] font-semibold uppercase tracking-widest ${tk.textFaint}`}>Teknologi</div>
                <p className={`text-[11px] ${tk.textMuted}`}>
                  Next.js 14 · FastAPI · Claude 4.6 · Gemini 3.7 · 9Router Proxy · Supabase
                </p>
              </div>

              <div className={`text-center text-[10px] ${tk.textFaint}`}>
                Made with ♥ by Keefa & Salna · Open-Source
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── SETTINGS (THEME) MODAL ─── */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSettings(false)} />
          <div className={`relative z-10 w-full max-w-sm rounded-2xl border p-6 shadow-2xl space-y-5 ${tk.cardBg}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className={`w-4 h-4 ${tk.accentText}`} />
                <h2 className={`text-sm font-semibold ${tk.textPrimary}`}>Pengaturan Tampilan</h2>
              </div>
              <button onClick={() => setShowSettings(false)} className={`p-1.5 rounded-lg transition-colors ${tk.navInactive}`}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <div className={`text-[10px] font-semibold uppercase tracking-widest ${tk.textFaint}`}>Pilih Tema Visual</div>
              {THEMES.map((t) => {
                const Icon = t.icon;
                const isActive = theme === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => { setTheme(t.key); setShowSettings(false); }}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isActive
                        ? "border-[#d97757] bg-[#d97757]/10 shadow-sm"
                        : `${tk.tagBg} ${tk.navInactive} hover:border-[#78716c]`
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isActive ? "bg-[#d97757] text-white" : "t-bg-card text-stone-400"
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-semibold ${isActive ? tk.textPrimary : tk.textSecondary}`}>
                        {t.label}
                      </div>
                      <div className={`text-[10px] mt-0.5 ${tk.textFaint}`}>
                        {t.desc}
                      </div>
                    </div>
                    {isActive && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#d97757] shrink-0 shadow-sm" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── SIDEBAR ─── */}
      <aside
        className={`relative flex flex-col h-screen sticky top-0 border-r t-sidebar sidebar-container ${
          collapsed ? "w-[60px]" : "w-56"
        }`}
      >
        {/* Logo & Header Toggle */}
        <div className="h-14 flex items-center justify-between px-3.5 border-b t-border shrink-0">
          {!collapsed ? (
            <>
              <div className="flex items-center gap-2.5 min-w-0">
                <HariyukaLogo className="w-5 h-5 shrink-0" variant="white" />
                <span className={`font-bold text-sm tracking-tight truncate t-text-primary`}>
                  Hariyuka AI
                </span>
              </div>

              <button
                onClick={() => setCollapsed(true)}
                className={`p-1.5 rounded-lg border t-border t-bg-tag hover:border-[#d97757] hover:text-[#d97757] text-stone-400 transition-colors cursor-pointer shrink-0`}
                title="Sembunyikan Sidebar"
              >
                <PanelLeftClose className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <div className="w-full flex justify-center">
              <button
                onClick={() => setCollapsed(false)}
                className="p-1.5 rounded-lg hover:bg-stone-800/60 transition-colors cursor-pointer"
                title="Buka Sidebar (Expand)"
              >
                <HariyukaLogo className="w-5 h-5 shrink-0" variant="white" />
              </button>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="p-2 mt-1 space-y-1 flex-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                title={collapsed ? item.name : undefined}
                className={`relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${
                  isActive ? `${tk.navActive} nav-active-indicator` : tk.navInactive
                } ${collapsed ? "justify-center px-0" : ""}`}
              >
                <Icon className="w-4 h-4 shrink-0" strokeWidth={isActive ? 2 : 1.75} />
                {!collapsed && (
                  <span className="truncate font-medium">
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* ─── BOTTOM USER & CONTROLS FOOTER ─── */}
        <div className="border-t t-border shrink-0">
          {!collapsed ? (
            <div className="p-3 space-y-2.5">
              {/* Row 1: 🟢 operatorName | [-> LOGOUT */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-medium t-text-primary">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 shadow-sm" />
                  <span className="truncate font-mono">{operatorName}</span>
                </div>
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="flex items-center gap-1 text-[11px] tracking-wider uppercase t-text-faint hover:t-text-primary transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-3 h-3" />
                  <span>LOGOUT</span>
                </button>
              </div>

              {/* Row 2: N chats / artikel | ABOUT | ⚙️ SETTINGS */}
              <div className="flex items-center justify-between text-[11px] pt-1.5 border-t t-border font-medium">
                <span className="t-text-faint">
                  {articleCount} {articleCount === 1 ? "artikel" : "chats"}
                </span>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowAbout(true)}
                    className="uppercase tracking-wider t-text-faint hover:t-text-primary transition-colors cursor-pointer"
                  >
                    ABOUT
                  </button>

                  <button
                    onClick={() => setShowSettings(true)}
                    className="flex items-center gap-1 uppercase tracking-wider t-text-faint hover:t-text-primary transition-colors cursor-pointer"
                  >
                    <Settings className="w-3 h-3" />
                    <span>SETTINGS</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Collapsed Bottom Buttons */
            <div className="p-1 space-y-1">
              <button
                onClick={() => setShowAbout(true)}
                className={`w-full flex items-center justify-center p-2 rounded-lg transition-colors ${tk.navInactive}`}
                title="About"
              >
                <Info className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className={`w-full flex items-center justify-center p-2 rounded-lg transition-colors ${tk.navInactive}`}
                title="Settings & Theme"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowLogoutModal(true)}
                className={`w-full flex items-center justify-center p-2 rounded-lg transition-colors text-red-400 hover:bg-red-500/10`}
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
