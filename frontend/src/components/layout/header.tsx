"use client";

import Link from "next/link";
import { Search, Plus } from "lucide-react";

export function Header() {
  return (
    <header className="h-14 border-b border-[#27272a] bg-[#09090b] px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Search */}
      <div className="relative w-64">
        <Search className="w-3.5 h-3.5 text-[#52525b] absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Cari artikel atau keyword..."
          className="w-full bg-[#121215] border border-[#27272a] rounded-md pl-8 pr-3 py-1.5 text-xs text-[#a1a1aa] placeholder:text-[#52525b] focus:outline-none focus:border-[#3f3f46] focus:text-white transition-colors"
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* 9Router Status — minimal dot */}
        <div className="flex items-center gap-1.5 text-[11px] text-[#52525b]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
          <span>9Router</span>
        </div>

        {/* New Article CTA */}
        <Link
          href="/generator"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white hover:bg-[#f4f4f5] text-black text-xs font-semibold transition-colors"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
          <span>Artikel Baru</span>
        </Link>
      </div>
    </header>
  );
}
