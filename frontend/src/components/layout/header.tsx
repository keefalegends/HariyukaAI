"use client";

import Link from "next/link";
import { Sparkles, Bell, Search, ExternalLink, ShieldCheck } from "lucide-react";

export function Header() {
  return (
    <header className="h-16 border-b border-slate-800/80 bg-[#0c121e]/60 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Search / Context Status */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari artikel, keyword, atau proyek..."
            className="w-full bg-slate-900/60 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* 9Router Status Badge */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>9Router Proxy Online</span>
        </div>

        {/* Quick Generate CTA */}
        <Link
          href="/generator"
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 transition-all active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Tulis Artikel Baru</span>
        </Link>
      </div>
    </header>
  );
}
