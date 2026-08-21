"use client";

import Link from "next/link";
import { Search, Plus } from "lucide-react";
import { useTokens } from "@/lib/use-tokens";

export function Header() {
  const tk = useTokens();

  return (
    <header className={`h-14 border-b px-6 flex items-center justify-between sticky top-0 z-30 t-header transition-colors`}>
      {/* Search */}
      <div className="relative w-64">
        <Search className="w-3.5 h-3.5 t-text-faint absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Cari artikel atau keyword..."
          className="t-input w-full border rounded-lg pl-8 pr-3 py-1.5 text-xs t-border-focus transition-colors"
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-[11px] t-text-faint">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
          <span>9Router</span>
        </div>
        <Link
          href="/generator"
          className="t-accent-bg flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
          <span>Artikel Baru</span>
        </Link>
      </div>
    </header>
  );
}
