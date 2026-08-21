"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  FileText,
  TrendingUp,
  ShieldCheck,
  Zap,
  Clock,
  ArrowRight,
  ChevronRight,
  Server,
  Plus,
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

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    total_articles: 0,
    total_words: 0,
    average_seo_score: 0,
    completed_articles: 0,
    recent_articles: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/v1/settings/dashboard-stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        } else {
          setStats({
            total_articles: 0,
            total_words: 0,
            average_seo_score: 0,
            completed_articles: 0,
            recent_articles: [],
          });
        }
      } catch (e) {
        setStats({
          total_articles: 0,
          total_words: 0,
          average_seo_score: 0,
          completed_articles: 0,
          recent_articles: [],
        });
      }
      setIsLoading(false);
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950/70 via-purple-950/50 to-slate-900/80 border border-indigo-500/20 p-8 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Multi-Step Agentic SEO Pipeline 2.0</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
            Selamat Datang di <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">Hariyuka AI</span>
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Hasilkan artikel SEO berperingkat tinggi di Google dengan pipeline multi-pass bertenaga Claude 4.6 & Gemini 3.7 via 9Router Proxy. Mengambil data referensi asli dari SERP Google.
          </p>
          <div className="pt-2">
            <Link
              href="/generator"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-sm font-bold text-white shadow-xl shadow-indigo-600/30 transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Tulis Artikel Baru Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Clean 3-Column Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Total Articles */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Artikel</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {formatNumber(stats.total_articles)}
          </div>
          <div className="text-[11px] text-slate-400">
            {stats.total_articles > 0 ? `${stats.completed_articles} artikel selesai` : "Belum ada artikel"}
          </div>
        </div>

        {/* Metric 2: Total Words */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Kata Digenerate</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {formatNumber(stats.total_words)}
          </div>
          <div className="text-[11px] text-slate-400 font-medium">
            {stats.total_articles > 0
              ? `Rata-rata ${formatNumber(Math.round(stats.total_words / stats.total_articles))} kata/artikel`
              : "0 kata tertulis"}
          </div>
        </div>

        {/* Metric 3: Average SEO Score */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Rata-Rata Skor SEO</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400">
            {stats.average_seo_score > 0 ? stats.average_seo_score : "-"}{" "}
            {stats.average_seo_score > 0 && <span className="text-xs text-slate-400">/100</span>}
          </div>
          <div className="text-[11px] text-emerald-400 font-semibold">
            {stats.average_seo_score >= 80 ? "Rank-ready E-E-A-T" : "Audit Real-Time"}
          </div>
        </div>
      </div>

      {/* Real Recent Articles & Pipeline Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Articles */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              Artikel Terbaru
            </h2>
            {stats.total_articles > 0 && (
              <Link
                href="/articles"
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
              >
                Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {stats.recent_articles.length === 0 ? (
            /* Clean Empty State */
            <div className="py-12 px-4 text-center space-y-3 bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Belum Ada Artikel yang Dibuat</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  Mulai buat artikel pertama Anda dengan memasukkan keyword target di Generator Artikel.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/generator"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md transition-all active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tulis Artikel Pertama</span>
                </Link>
              </div>
            </div>
          ) : (
            /* Real Articles List */
            <div className="divide-y divide-slate-800/60">
              {stats.recent_articles.map((item) => (
                <div
                  key={item.id}
                  className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-800/30 rounded-xl px-2 transition-colors"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/articles/${item.id}`}
                      className="text-sm font-bold text-slate-100 hover:text-indigo-400 transition-colors line-clamp-1"
                    >
                      {item.title}
                    </Link>
                    <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                      <span className="font-mono text-[11px] bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                        {item.target_keyword}
                      </span>
                      <span>• {formatNumber(item.word_count)} kata</span>
                      <span>
                        • {new Date(item.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {item.seo_score > 0 && (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 text-xs">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {item.seo_score}/100
                      </span>
                    )}
                    <Link
                      href={`/articles/${item.id}`}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Pipeline Status */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-400" />
              9Router AI Gateway
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Online
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 space-y-1.5">
              <div className="flex items-center justify-between font-semibold text-slate-300">
                <span>SERP & Intent Analysis</span>
                <span className="text-[10px] text-indigo-400 font-mono">Gemini 3.7</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Ekstraksi keyword LSI, entitas semantik & People Also Ask secara instan.
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 space-y-1.5">
              <div className="flex items-center justify-between font-semibold text-slate-300">
                <span>Multi-Pass Section Writer</span>
                <span className="text-[10px] text-purple-400 font-mono">Claude 4.6</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Prosa natural berstandar jurnalis tanpa klise AI dan tanpa repetisi alur.
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 space-y-1.5">
              <div className="flex items-center justify-between font-semibold text-slate-300">
                <span>SEO & E-E-A-T Polisher</span>
                <span className="text-[10px] text-emerald-400 font-mono">Claude 4.6</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Penataan bolding penekanan, visual tag placeholders, dan audit skor 100%.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
