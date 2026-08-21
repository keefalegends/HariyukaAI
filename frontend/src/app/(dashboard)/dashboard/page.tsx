"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, ShieldCheck, Hash, ArrowUpRight, Plus, Clock } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { useTheme } from "@/contexts/theme-context";

interface DashboardStats {
  total_articles: number;
  total_words: number;
  average_seo_score: number;
  completed_articles: number;
  recent_articles: Array<{
    id: string;
    title: string;
    target_keyword: string;
    word_count: number;
    seo_score: number;
    created_at: string;
    status: string;
  }>;
}

const STATUS_MAP: Record<string, { label: string; dark: string; light: string }> = {
  completed:       { label: "Selesai",    dark: "text-emerald-400", light: "text-emerald-600" },
  generating:      { label: "Generating", dark: "text-blue-400",    light: "text-blue-600" },
  outline_pending: { label: "Review",     dark: "text-amber-400",   light: "text-amber-600" },
  draft:           { label: "Draft",      dark: "text-[#71717a]",   light: "text-[#a1a1aa]" },
  failed:          { label: "Gagal",      dark: "text-red-400",     light: "text-red-600" },
};

export default function DashboardPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [stats, setStats] = useState<DashboardStats>({
    total_articles: 0, total_words: 0, average_seo_score: 0,
    completed_articles: 0, recent_articles: [],
  });

  useEffect(() => {
    fetch("http://localhost:8000/api/v1/settings/dashboard-stats")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setStats(d); })
      .catch(() => {});
  }, []);

  // Theme-derived class helpers
  const card = isDark
    ? "bg-[#121215] border border-[#27272a]"
    : "bg-white border border-[#e4e4e7]";
  const cardHover = isDark
    ? "hover:bg-[#1e1e21]"
    : "hover:bg-[#f9f9f9]";
  const headerBorder = isDark ? "border-b border-[#27272a]" : "border-b border-[#e4e4e7]";
  const divider = isDark ? "divide-[#1e1e21]" : "divide-[#f4f4f5]";
  const textPrimary = isDark ? "text-white" : "text-[#09090b]";
  const textSec = isDark ? "text-[#a1a1aa]" : "text-[#71717a]";
  const textMuted = isDark ? "text-[#52525b]" : "text-[#a1a1aa]";
  const theadText = isDark ? "text-[#52525b]" : "text-[#a1a1aa]";
  const monoBg = isDark ? "bg-[#1e1e21] border-[#27272a]" : "bg-[#f4f4f5] border-[#e4e4e7]";
  const emptyBorder = isDark ? "border-[#27272a]" : "border-[#e4e4e7]";
  const emptyIconBg = isDark ? "bg-[#1e1e21]" : "bg-[#f4f4f5]";
  const ctaClass = isDark
    ? "bg-white hover:bg-[#f4f4f5] text-black"
    : "bg-[#09090b] hover:bg-[#18181b] text-white";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-base font-semibold ${textPrimary}`}>Dashboard</h1>
          <p className={`text-xs mt-0.5 ${textSec}`}>Overview artikel dan aktivitas generator.</p>
        </div>
        <Link
          href="/generator"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${ctaClass}`}
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
          Artikel Baru
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Artikel",         value: formatNumber(stats.total_articles), sub: stats.total_articles > 0 ? `${stats.completed_articles} selesai` : "—", icon: FileText },
          { label: "Total Kata",            value: formatNumber(stats.total_words), sub: stats.total_articles > 0 ? `~${formatNumber(Math.round(stats.total_words / stats.total_articles))}/artikel` : "—", icon: Hash },
          { label: "Rata-rata SEO Score",   value: stats.average_seo_score > 0 ? `${stats.average_seo_score}/100` : "—", sub: stats.average_seo_score >= 80 ? "E-E-A-T Ready" : "Belum ada data", icon: ShieldCheck },
          { label: "Artikel Selesai",       value: formatNumber(stats.completed_articles), sub: stats.total_articles > 0 ? `dari ${formatNumber(stats.total_articles)} total` : "—", icon: Clock },
        ].map((c) => (
          <div key={c.label} className={`${card} rounded-lg p-4 space-y-3`}>
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-medium ${textMuted}`}>{c.label}</span>
              <c.icon className={`w-3.5 h-3.5 ${textMuted}`} />
            </div>
            <div className={`text-xl font-semibold tracking-tight ${textPrimary}`}>{c.value}</div>
            <div className={`text-[11px] ${textMuted}`}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Recent Articles Table */}
      <div className={`${card} rounded-lg overflow-hidden`}>
        <div className={`flex items-center justify-between px-5 py-3.5 ${headerBorder}`}>
          <h2 className={`text-xs font-semibold ${textPrimary}`}>Artikel Terbaru</h2>
          {stats.total_articles > 0 && (
            <Link href="/articles" className={`flex items-center gap-1 text-[11px] ${textMuted} hover:${textSec} transition-colors`}>
              Lihat semua <ArrowUpRight className="w-3 h-3" />
            </Link>
          )}
        </div>

        {stats.recent_articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className={`w-10 h-10 rounded-lg ${emptyIconBg} border ${emptyBorder} flex items-center justify-center mb-4`}>
              <FileText className={`w-5 h-5 ${textMuted}`} />
            </div>
            <p className={`text-sm font-medium ${textSec}`}>Belum ada artikel</p>
            <p className={`text-xs mt-1 max-w-xs ${textMuted}`}>
              Mulai buat artikel SEO pertama Anda dengan memasukkan keyword target.
            </p>
            <Link
              href="/generator"
              className={`mt-4 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${ctaClass}`}
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
              Buat Artikel Pertama
            </Link>
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className={headerBorder}>
                <th className={`text-left px-5 py-2.5 text-[11px] font-medium ${theadText} w-full`}>Judul</th>
                <th className={`text-left px-4 py-2.5 text-[11px] font-medium ${theadText} whitespace-nowrap`}>Keyword</th>
                <th className={`text-right px-4 py-2.5 text-[11px] font-medium ${theadText} whitespace-nowrap`}>Kata</th>
                <th className={`text-right px-4 py-2.5 text-[11px] font-medium ${theadText} whitespace-nowrap`}>SEO</th>
                <th className={`text-right px-5 py-2.5 text-[11px] font-medium ${theadText} whitespace-nowrap`}>Status</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${divider}`}>
              {stats.recent_articles.map((item) => {
                const s = STATUS_MAP[item.status] ?? STATUS_MAP.draft;
                return (
                  <tr key={item.id} className={`${cardHover} transition-colors group`}>
                    <td className="px-5 py-3">
                      <Link href={`/articles/${item.id}`} className={`font-medium ${textSec} group-hover:${textPrimary} transition-colors line-clamp-1 flex items-center gap-1.5`}>
                        {item.title}
                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity shrink-0" />
                      </Link>
                      <span className={`text-[10px] mt-0.5 block ${textMuted}`}>
                        {new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-mono text-[10px] ${textMuted} ${monoBg} border px-1.5 py-0.5 rounded`}>
                        {item.target_keyword}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-right ${textMuted} tabular-nums`}>
                      {item.word_count > 0 ? formatNumber(item.word_count) : "—"}
                    </td>
                    <td className={`px-4 py-3 text-right ${textMuted} tabular-nums`}>
                      {item.seo_score > 0 ? `${item.seo_score}` : "—"}
                    </td>
                    <td className={`px-5 py-3 text-right font-medium ${isDark ? s.dark : s.light}`}>
                      {s.label}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
