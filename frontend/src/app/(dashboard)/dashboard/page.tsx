"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  ShieldCheck,
  Hash,
  ArrowUpRight,
  Plus,
  Clock,
  Sparkles,
  Zap,
  Bot,
  Search,
  BookOpen,
  TrendingUp,
  Layers,
  CheckCircle2,
  Sliders,
  ChevronRight,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { useTokens } from "@/lib/use-tokens";

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

const QUICK_TOPICS = [
  {
    category: "Panduan Lengkap",
    title: "Cara Riset Keyword SEO Volume Tinggi Low Competition 2026",
    tag: "High Volume",
    length: "2.000 kata",
  },
  {
    category: "Perbandingan & Review",
    title: "10 Tools AI Content Writer Terbaik untuk Blogger Indonesia",
    tag: "Commercial",
    length: "2.500 kata",
  },
  {
    category: "Strategi Lanjutan",
    title: "Optimasi Google E-E-A-T: Panduan Praktis Menembus Peringkat 1",
    tag: "Informational",
    length: "2.000 kata",
  },
  {
    category: "Tutorial Teknis",
    title: "Checklist SEO On-Page Lengkap untuk Website Baru",
    tag: "Actionable",
    length: "1.500 kata",
  },
];

export default function DashboardPage() {
  const tk = useTokens();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    total_articles: 0,
    total_words: 0,
    average_seo_score: 0,
    completed_articles: 0,
    recent_articles: [],
  });

  useEffect(() => {
    fetch("http://localhost:8000/api/v1/settings/dashboard-stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) setStats(d);
      })
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
    ({
      completed: "Selesai",
      generating: "Generating",
      outline_pending: "Review",
      draft: "Draft",
      failed: "Gagal",
    }[s] ?? "Draft");

  return (
    <div className="space-y-7">
      {/* ─── 1. WELCOME & QUICK ACTION HEADER ─── */}
      <div className={`t-card rounded-2xl p-6 relative overflow-hidden shadow-sm`}>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className={`text-[11px] font-semibold uppercase tracking-wider ${tk.accentText}`}>
                9Router Multi-Agent Pipeline Active
              </span>
            </div>
            <h1 className={`text-xl md:text-2xl font-bold tracking-tight ${tk.textPrimary}`}>
              Selamat Datang di Hariyuka AI
            </h1>
            <p className={`text-xs ${tk.textMuted} leading-relaxed`}>
              Tulis artikel SEO berstandar manusia tanpa klise AI. Didukung oleh analisis SERP real-time, context chaining, dan audit skor SEO 100 poin.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/settings"
              className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-colors ${tk.outlineBtn} flex items-center gap-1.5`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Routing Model</span>
            </Link>

            <Link
              href="/generator"
              className="t-accent-bg flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              <span>Mulai Tulis Artikel</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ─── 2. KEY METRICS GRID ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[
          {
            label: "Total Artikel",
            value: formatNumber(stats.total_articles),
            sub: stats.total_articles > 0 ? `${stats.completed_articles} artikel selesai` : "Belum ada artikel",
            icon: FileText,
            badge: stats.total_articles > 0 ? "Live" : null,
          },
          {
            label: "Total Kata Tertulis",
            value: formatNumber(stats.total_words),
            sub:
              stats.total_articles > 0
                ? `~${formatNumber(Math.round(stats.total_words / stats.total_articles))} kata/artikel`
                : "0 kata tertulis",
            icon: Hash,
            badge: "Multi-Pass",
          },
          {
            label: "Rata-rata Skor SEO",
            value: stats.average_seo_score > 0 ? `${stats.average_seo_score}/100` : "—",
            sub: stats.average_seo_score >= 80 ? "E-E-A-T Rank Ready" : "Audit otomatis",
            icon: ShieldCheck,
            badge: "E-E-A-T",
          },
          {
            label: "Active Engine",
            value: "Claude 4.6",
            sub: "Gemini 3.7 (SERP/Outline)",
            icon: Bot,
            badge: "9Router",
          },
        ].map((c) => (
          <div key={c.label} className={`t-card rounded-xl p-4.5 space-y-3 shadow-sm hover:border-[#78716c] transition-colors`}>
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-semibold uppercase tracking-wider ${tk.textFaint}`}>
                {c.label}
              </span>
              <div className={`p-1.5 rounded-lg t-bg-tag border t-border`}>
                <c.icon className={`w-3.5 h-3.5 ${tk.accentText}`} />
              </div>
            </div>

            <div>
              <div className={`text-xl font-bold tracking-tight ${tk.textPrimary}`}>{c.value}</div>
              <div className={`text-[11px] mt-0.5 ${tk.textMuted} flex items-center justify-between`}>
                <span>{c.sub}</span>
                {c.badge && (
                  <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${tk.monoBadge}`}>
                    {c.badge}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── 3. QUICK TOPIC STARTERS / INSPIRASI PENULISAN ─── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-2">
            <TrendingUp className={`w-4 h-4 ${tk.accentText}`} />
            <h2 className={`text-xs font-semibold uppercase tracking-wider ${tk.textPrimary}`}>
              Inspirasi Cepat: Topik Siap Tulis
            </h2>
          </div>
          <span className={`text-[11px] ${tk.textFaint}`}>Klik topik untuk langsung masuk ke generator</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {QUICK_TOPICS.map((topic, i) => (
            <Link
              key={i}
              href={`/generator?keyword=${encodeURIComponent(topic.title)}`}
              className={`t-card rounded-xl p-4 space-y-2.5 shadow-sm hover:border-[#d97757] transition-all group flex flex-col justify-between`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-semibold uppercase tracking-wider ${tk.accentText}`}>
                    {topic.category}
                  </span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${tk.monoBadge}`}>
                    {topic.tag}
                  </span>
                </div>
                <h3 className={`text-xs font-semibold ${tk.textPrimary} group-hover:${tk.accentText} transition-colors line-clamp-2 leading-snug`}>
                  {topic.title}
                </h3>
              </div>

              <div className="flex items-center justify-between pt-2 border-t t-border text-[10px]">
                <span className={tk.textFaint}>{topic.length}</span>
                <span className={`flex items-center gap-1 font-medium ${tk.accentText} group-hover:translate-x-0.5 transition-transform`}>
                  Mulai <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ─── 4. HOW THE PIPELINE WORKS (VISUAL PIPELINE OVERVIEW) ─── */}
      <div className={`t-card rounded-2xl p-5 md:p-6 space-y-4 shadow-sm`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg t-bg-tag border t-border flex items-center justify-center">
              <Layers className={`w-4 h-4 ${tk.accentText}`} />
            </div>
            <div>
              <h3 className={`text-sm font-semibold ${tk.textPrimary}`}>
                Alur Kerja Multi-Step Agentic SEO Pipeline
              </h3>
              <p className={`text-xs ${tk.textMuted}`}>
                Setiap artikel melewati 4 tahapan AI independen untuk menjamin kualitas peringkat 1 Google.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-1">
          {[
            {
              step: "01",
              title: "Analisis SERP & Intent",
              desc: "Ekstraksi LSI keywords, PAA (People Also Ask), dan search intent dari Google.",
              engine: "Gemini 3.7",
            },
            {
              step: "02",
              title: "Arsitektur Outline JSON",
              desc: "Penyusunan hierarki H2/H3 terstruktur dengan alokasi target bobot kata per section.",
              engine: "Gemini 3.7",
            },
            {
              step: "03",
              title: "Deep Section Writer",
              desc: "Penulisan multi-pass bertahap dengan context chaining untuk mencegah repetisi.",
              engine: "Claude 4.6",
            },
            {
              step: "04",
              title: "E-E-A-T & SEO Polish",
              desc: "Penataan bolding penekanan, visual tag placeholders, dan audit skor 100 poin.",
              engine: "Claude 4.6",
            },
          ].map((s) => (
            <div key={s.step} className={`t-bg-tag border t-border rounded-xl p-3.5 space-y-2`}>
              <div className="flex items-center justify-between">
                <span className={`font-mono text-xs font-bold ${tk.accentText}`}>{s.step}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${tk.monoBadge}`}>
                  {s.engine}
                </span>
              </div>
              <h4 className={`text-xs font-semibold ${tk.textPrimary}`}>{s.title}</h4>
              <p className={`text-[11px] ${tk.textMuted} leading-relaxed`}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 5. RECENT ARTICLES TABLE ─── */}
      <div className={`t-card rounded-xl overflow-hidden shadow-sm`}>
        <div className="flex items-center justify-between px-5 py-3.5 border-b t-border">
          <div className="flex items-center gap-2">
            <FileText className={`w-3.5 h-3.5 ${tk.accentText}`} />
            <h2 className={`text-xs font-semibold uppercase tracking-wider ${tk.textPrimary}`}>
              Artikel Terbaru
            </h2>
          </div>

          {stats.total_articles > 0 && (
            <Link
              href="/articles"
              className={`flex items-center gap-1 text-[11px] ${tk.textFaint} hover:${tk.accentText} transition-colors`}
            >
              Lihat semua artikel <ArrowUpRight className="w-3 h-3" />
            </Link>
          )}
        </div>

        {stats.recent_articles.length === 0 ? (
          /* Clean Empty State */
          <div className="flex flex-col items-center justify-center py-14 px-6 text-center space-y-3">
            <div className={`w-12 h-12 rounded-2xl t-bg-tag border t-border flex items-center justify-center`}>
              <BookOpen className={`w-6 h-6 ${tk.textFaint}`} />
            </div>
            <div>
              <p className={`text-sm font-semibold ${tk.textPrimary}`}>Belum Ada Artikel yang Dibuat</p>
              <p className={`text-xs mt-1 max-w-sm mx-auto ${tk.textMuted}`}>
                Pilih topik di atas atau masukkan target keyword Anda di Generator Artikel untuk memulai proses penulisan.
              </p>
            </div>
            <Link
              href="/generator"
              className="t-accent-bg inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all mt-1"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
              <span>Buat Artikel Pertama</span>
            </Link>
          </div>
        ) : (
          /* Table of Articles */
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b t-border">
                <th className={`text-left px-5 py-2.5 text-[11px] font-medium ${tk.textFaint} w-full`}>
                  Judul Artikel
                </th>
                <th className={`text-left px-4 py-2.5 text-[11px] font-medium ${tk.textFaint} whitespace-nowrap`}>
                  Target Keyword
                </th>
                <th className={`text-right px-4 py-2.5 text-[11px] font-medium ${tk.textFaint} whitespace-nowrap`}>
                  Jumlah Kata
                </th>
                <th className={`text-right px-4 py-2.5 text-[11px] font-medium ${tk.textFaint} whitespace-nowrap`}>
                  Skor SEO
                </th>
                <th className={`text-right px-5 py-2.5 text-[11px] font-medium ${tk.textFaint} whitespace-nowrap`}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${tk.dividerRow}`}>
              {stats.recent_articles.map((item) => (
                <tr key={item.id} className="t-bg-card-hover transition-colors group">
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/articles/${item.id}`}
                      className={`font-medium ${tk.textSecondary} group-hover:${tk.textPrimary} transition-colors line-clamp-1 flex items-center gap-1.5`}
                    >
                      {item.title}
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity shrink-0" />
                    </Link>
                    <span className={`text-[10px] mt-0.5 block ${tk.textFaint}`}>
                      {new Date(item.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded border ${tk.monoBadge}`}>
                      {item.target_keyword}
                    </span>
                  </td>
                  <td className={`px-4 py-3.5 text-right ${tk.textMuted} tabular-nums`}>
                    {item.word_count > 0 ? formatNumber(item.word_count) : "—"}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    {item.seo_score > 0 ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-400">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {item.seo_score}/100
                      </span>
                    ) : (
                      <span className={tk.textFaint}>—</span>
                    )}
                  </td>
                  <td className={`px-5 py-3.5 text-right font-medium ${statusColor(item.status)}`}>
                    {statusLabel(item.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
