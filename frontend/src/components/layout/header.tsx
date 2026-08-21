"use client";

import Link from "next/link";
import { Search, Plus } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";

export function Header() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <header
      className={`h-14 border-b px-6 flex items-center justify-between sticky top-0 z-30 transition-colors ${
        isDark
          ? "bg-[#09090b] border-[#27272a]"
          : "bg-white border-[#e4e4e7]"
      }`}
    >
      {/* Search */}
      <div className="relative w-64">
        <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-[#52525b]" : "text-[#a1a1aa]"}`} />
        <input
          type="text"
          placeholder="Cari artikel atau keyword..."
          className={`w-full border rounded-md pl-8 pr-3 py-1.5 text-xs placeholder:transition-colors focus:outline-none transition-colors ${
            isDark
              ? "bg-[#121215] border-[#27272a] text-[#a1a1aa] placeholder:text-[#52525b] focus:border-[#3f3f46] focus:text-white"
              : "bg-[#f4f4f5] border-[#e4e4e7] text-[#3f3f46] placeholder:text-[#a1a1aa] focus:border-[#d4d4d8]"
          }`}
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* 9Router Status */}
        <div className={`flex items-center gap-1.5 text-[11px] ${isDark ? "text-[#52525b]" : "text-[#a1a1aa]"}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
          <span>9Router</span>
        </div>

        {/* New Article CTA */}
        <Link
          href="/generator"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
            isDark
              ? "bg-white hover:bg-[#f4f4f5] text-black"
              : "bg-[#09090b] hover:bg-[#18181b] text-white"
          }`}
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
          <span>Artikel Baru</span>
        </Link>
      </div>
    </header>
  );
}
