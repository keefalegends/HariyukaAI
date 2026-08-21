"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, ShieldCheck, Hash, ArrowUpRight, Plus, Clock } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { useTokens } from "@/lib/use-tokens";

interface DashboardStats {
  total_articles: number;
  total_words: number;
  average_seo_score: number;
  completed_articles: number;
  recent_articles: Array<{
    id: string; title: string; target_keyword: string;
    word_count: number; seo_score: number; created_at: string; status: string;
  }>;
}

export default function DashboardPage() {
  const tk = useTokens();
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

  const statusColor = (s: string) => {
    if (s === "completed") return tk.statusSuccess;
    if (s === "generating") return tk.statusRunning;
    if (s === "outline_pending") return tk.statusPending;
    if (s === "failed") return tk.statusFailed;
    return tk.statusDraft;
  };
  const statusLabel = (s: string) =>
    ({ completed: "Selesai", generating: "Generating", outline_pending: "Review", draft: "Draft", failed: "Gagal" }[s] ?? "Draft");

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-base font-semibold ${tk.textPrimary}`}>Dashboard</h1>
          <p className={`text-xs mt-0.5 ${tk.textMuted}`}>Overview artikel dan aktivitas generator.</p>
        </div>
        <Link href="/generator" className="t-accent-bg flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors">
          <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
          Artikel Baru
        </Link>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Artikel",       value: formatNumber(stats.total_articles),    sub: stats.total_articles > 0 ? `${stats.completed_articles} selesai` : "—", icon: FileText },
          { label: "Total Kata",          value: formatNumber(stats.total_words),        sub: stats.total_articles > 0 ? `~${formatNumber(Math.round(stats.total_words / stats.total_articles))}/artikel` : "—", icon: Hash },
          { label: "Rata-rata SEO Score", value: stats.average_seo_score > 0 ? `${stats.average_seo_score}/100` : "—", sub: stats.average_seo_score >= 80 ? "E-E-A-T Ready" : "Belum ada data", icon: ShieldCheck },
          { label: "Artikel Selesai",     value: formatNumber(stats.completed_articles), sub: stats.total_articles > 0 ? `dari ${formatNumber(stats.total_articles)} total` : "—", icon: Clock },
        ].map((c) => (
          <div key={c.label} className={`t-card rounded-xl p-4 space-y-3`}>
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-medium ${tk.textFaint}`}>{c.label}</span>
              <c.icon className={`w-3.5 h-3.5 ${tk.textFaint}`} />
            </div>
            <div className={`text-xl font-semibold tracking-tight ${tk.textPrimary}`}>{c.value}</div>
            <div className={`text-[11px] ${tk.textMuted}`}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Articles table */}
      <div className="t-card rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b t-border">
          <h2 className={`text-xs font-semibold ${tk.textPrimary}`}>Artikel Terbaru</h2>
          {stats.total_articles > 0 && (
            <Link href="/articles" className={`flex items-center gap-1 text-[11px] ${tk.textFaint} transition-colors`}>
              Lihat semua <ArrowUpRight className="w-3 h-3" />
            </Link>
          )}
        </div>

        {stats.recent_articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className={`w-10 h-10 rounded-xl t-bg-tag border t-border flex items-center justify-center mb-4`}>
              <FileText className={`w-5 h-5 ${tk.textFaint}`} />
            </div>
            <p className={`text-sm font-medium ${tk.textSecondary}`}>Belum ada artikel</p>
            <p className={`text-xs mt-1 max-w-xs ${tk.textMuted}`}>
              Mulai buat artikel SEO pertama Anda dengan memasukkan keyword target.
            </p>
            <Link href="/generator" className="mt-4 t-accent-bg flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors">
              <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
              Buat Artikel Pertama
            </Link>
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b t-border">
                {["Judul", "Keyword", "Kata", "SEO", "Status"].map((h, i) => (
                  <th key={h} className={`py-2.5 text-[11px] font-medium ${tk.textFaint} ${i === 0 ? "text-left px-5 w-full" : i >= 2 ? "text-right px-4 whitespace-nowrap" : "text-left px-4 whitespace-nowrap"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${tk.dividerRow}`}>
              {stats.recent_articles.map((item) => (
                <tr key={item.id} className="t-bg-card-hover transition-colors group">
                  <td className="px-5 py-3">
                    <Link href={`/articles/${item.id}`} className={`font-medium ${tk.textSecondary} line-clamp-1 flex items-center gap-1.5 group-hover:t-text-primary transition-colors`}>
                      {item.title}
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity shrink-0" />
                    </Link>
                    <span className={`text-[10px] mt-0.5 block ${tk.textFaint}`}>
                      {new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded border ${tk.monoBadge}`}>{item.target_keyword}</span>
                  </td>
                  <td className={`px-4 py-3 text-right ${tk.textMuted} tabular-nums`}>{item.word_count > 0 ? formatNumber(item.word_count) : "—"}</td>
                  <td className={`px-4 py-3 text-right ${tk.textMuted} tabular-nums`}>{item.seo_score > 0 ? item.seo_score : "—"}</td>
                  <td className={`px-5 py-3 text-right font-medium ${statusColor(item.status)}`}>{statusLabel(item.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
