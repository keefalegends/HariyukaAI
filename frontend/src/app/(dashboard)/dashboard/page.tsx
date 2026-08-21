"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  ShieldCheck,
  Hash,
  ArrowUpRight,
  Plus,
  Clock,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";

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

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  completed:       { label: "Selesai",    color: "text-emerald-500" },
  generating:      { label: "Generating", color: "text-blue-400" },
  outline_pending: { label: "Review",     color: "text-amber-400" },
  draft:           { label: "Draft",      color: "text-[#71717a]" },
  failed:          { label: "Gagal",      color: "text-red-500" },
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    total_articles: 0,
    total_words: 0,
    average_seo_score: 0,
    completed_articles: 0,
    recent_articles: [],
  });

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/v1/settings/dashboard-stats");
        if (res.ok) setStats(await res.json());
      } catch {}
    };
    fetch_();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header Row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-white">Dashboard</h1>
          <p className="text-xs text-[#71717a] mt-0.5">Overview artikel dan aktivitas generator.</p>
        </div>
        <Link
          href="/generator"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white hover:bg-[#f4f4f5] text-black text-xs font-semibold transition-colors"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
          Artikel Baru
        </Link>
      </div>

      {/* Metrics Row — 4 cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: "Total Artikel",
            value: formatNumber(stats.total_articles),
            sub: stats.total_articles > 0 ? `${stats.completed_articles} selesai` : "—",
            icon: FileText,
          },
          {
            label: "Total Kata",
            value: formatNumber(stats.total_words),
            sub: stats.total_articles > 0
              ? `~${formatNumber(Math.round(stats.total_words / stats.total_articles))}/artikel`
              : "—",
            icon: Hash,
          },
          {
            label: "Rata-rata SEO Score",
            value: stats.average_seo_score > 0 ? `${stats.average_seo_score}/100` : "—",
            sub: stats.average_seo_score >= 80 ? "E-E-A-T Ready" : "Belum ada data",
            icon: ShieldCheck,
          },
          {
            label: "Artikel Selesai",
            value: formatNumber(stats.completed_articles),
            sub: stats.total_articles > 0
              ? `dari ${formatNumber(stats.total_articles)} total`
              : "—",
            icon: Clock,
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-[#121215] border border-[#27272a] rounded-lg p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#71717a] font-medium">{card.label}</span>
              <card.icon className="w-3.5 h-3.5 text-[#52525b]" />
            </div>
            <div className="text-xl font-semibold text-white tracking-tight">{card.value}</div>
            <div className="text-[11px] text-[#52525b]">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Recent Articles Table */}
      <div className="bg-[#121215] border border-[#27272a] rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#27272a]">
          <h2 className="text-xs font-semibold text-white">Artikel Terbaru</h2>
          {stats.total_articles > 0 && (
            <Link
              href="/articles"
              className="flex items-center gap-1 text-[11px] text-[#71717a] hover:text-white transition-colors"
            >
              Lihat semua
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          )}
        </div>

        {stats.recent_articles.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-10 h-10 rounded-lg bg-[#1e1e21] border border-[#27272a] flex items-center justify-center mb-4">
              <FileText className="w-5 h-5 text-[#52525b]" />
            </div>
            <p className="text-sm font-medium text-[#a1a1aa]">Belum ada artikel</p>
            <p className="text-xs text-[#52525b] mt-1 max-w-xs">
              Mulai buat artikel SEO pertama Anda dengan memasukkan keyword target.
            </p>
            <Link
              href="/generator"
              className="mt-4 flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white hover:bg-[#f4f4f5] text-black text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
              Buat Artikel Pertama
            </Link>
          </div>
        ) : (
          /* Article rows */
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#27272a]">
                <th className="text-left px-5 py-2.5 text-[11px] font-medium text-[#52525b] w-full">Judul</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-medium text-[#52525b] whitespace-nowrap">Keyword</th>
                <th className="text-right px-4 py-2.5 text-[11px] font-medium text-[#52525b] whitespace-nowrap">Kata</th>
                <th className="text-right px-4 py-2.5 text-[11px] font-medium text-[#52525b] whitespace-nowrap">SEO</th>
                <th className="text-right px-5 py-2.5 text-[11px] font-medium text-[#52525b] whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e21]">
              {stats.recent_articles.map((item) => {
                const s = STATUS_MAP[item.status] ?? STATUS_MAP.draft;
                return (
                  <tr key={item.id} className="hover:bg-[#1e1e21] transition-colors group">
                    <td className="px-5 py-3">
                      <Link
                        href={`/articles/${item.id}`}
                        className="font-medium text-[#d4d4d8] group-hover:text-white transition-colors line-clamp-1 flex items-center gap-1.5"
                      >
                        {item.title}
                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity shrink-0" />
                      </Link>
                      <span className="text-[10px] text-[#52525b] mt-0.5 block">
                        {new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-[10px] text-[#71717a] bg-[#1e1e21] border border-[#27272a] px-1.5 py-0.5 rounded">
                        {item.target_keyword}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-[#a1a1aa] tabular-nums">
                      {item.word_count > 0 ? formatNumber(item.word_count) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-[#a1a1aa] tabular-nums">
                      {item.seo_score > 0 ? `${item.seo_score}` : "—"}
                    </td>
                    <td className={`px-5 py-3 text-right font-medium ${s.color}`}>
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
