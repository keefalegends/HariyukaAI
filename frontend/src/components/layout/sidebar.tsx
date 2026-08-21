"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PenLine,
  LayoutDashboard,
  FileText,
  FolderOpen,
  Settings,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Generator", href: "/generator", icon: PenLine },
  { name: "Artikel", href: "/articles", icon: FileText },
  { name: "Proyek", href: "/projects", icon: FolderOpen },
  { name: "Pengaturan", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 border-r border-[#27272a] bg-[#121215] flex flex-col justify-between h-screen sticky top-0">
      <div>
        {/* Logo */}
        <div className="h-14 flex items-center px-5 border-b border-[#27272a]">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-white flex items-center justify-center">
              <PenLine className="w-3.5 h-3.5 text-black" strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-sm text-white tracking-tight">Hariyuka AI</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-2 mt-1 space-y-0.5">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? "bg-[#27272a] text-white font-medium"
                    : "text-[#71717a] hover:text-white hover:bg-[#1e1e21]"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" strokeWidth={isActive ? 2 : 1.75} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer — User */}
      <div className="p-3 border-t border-[#27272a]">
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <div className="w-7 h-7 rounded-full bg-[#27272a] border border-[#3f3f46] flex items-center justify-center text-xs font-semibold text-[#a1a1aa]">
            H
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium text-[#d4d4d8] truncate">Hariyuka Writer</div>
            <div className="text-[10px] text-[#52525b] truncate">Self-Hosted</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
