"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  LayoutDashboard,
  FileText,
  FolderKanban,
  Settings,
  CreditCard,
  Zap,
  Globe2,
  ChevronRight,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Generator Artikel", href: "/generator", icon: Sparkles, badge: "AI" },
  { name: "Artikel Saya", href: "/articles", icon: FileText },
  { name: "Proyek & Brand Voice", href: "/projects", icon: FolderKanban },
  { name: "Billing & Kredit", href: "/billing", icon: CreditCard },
  { name: "Pengaturan", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-[#0c121e]/90 backdrop-blur-xl flex flex-col justify-between h-screen sticky top-0">
      <div>
        {/* Logo / Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800/60 gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <span className="font-bold text-base bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">
              Hariyuka AI
            </span>
            <div className="text-[10px] text-indigo-400 font-medium tracking-wider uppercase">
              Next-Gen SEO Writer
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-inner"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? "text-indigo-400" : "text-slate-400 group-hover:text-slate-200"
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-md">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Credit Status */}
      <div className="p-4 border-t border-slate-800/60 space-y-3">
        <div className="p-3.5 rounded-xl bg-gradient-to-b from-slate-900/90 to-slate-900/40 border border-slate-800">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Sisa Kredit Kata
            </span>
            <span className="text-indigo-400 font-semibold">4.850 / 5.000</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full w-[97%]" />
          </div>
          <div className="mt-2.5 flex items-center justify-between">
            <span className="text-[10px] text-slate-500">Plan Pro Tier</span>
            <Link
              href="/billing"
              className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 font-medium"
            >
              Upgrade <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* User Card */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-xs text-white">
            HA
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-slate-200 truncate">Hariyuka User</div>
            <div className="text-[10px] text-slate-500 truncate">user@hariyuka.ai</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
