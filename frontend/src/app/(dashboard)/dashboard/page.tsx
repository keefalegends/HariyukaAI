"use client";

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
  Flame,
  Globe,
} from "lucide-react";

export default function DashboardPage() {
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
            Hasilkan artikel berperingkat tinggi di Google dengan analisis SERP kompetitor real-time, review outline interaktif, dan penulisan multi-pass bertenaga Claude 4.6 & Gemini 3.7.
          </p>
          <div className="pt-2">
            <Link
              href="/generator"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-sm font-bold text-white shadow-xl shadow-indigo-600/30 transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Buat Artikel Baru Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Artikel</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">18</div>
          <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +4 minggu ini
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Kata Digenerate</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">38.450</div>
          <div className="text-[11px] text-slate-400 font-medium">Rata-rata 2.130 kata/artikel</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Rata-Rata Skor SEO</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400">93.8 <span className="text-xs text-slate-400">/100</span></div>
          <div className="text-[11px] text-emerald-400 font-semibold">Rank-ready E-E-A-T</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Kredit Tersedia</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">4.850</div>
          <div className="text-[11px] text-slate-400">Diperbarui bulan ini</div>
        </div>
      </div>

      {/* Recent Articles & Quick Generator Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Articles */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              Artikel Terbaru
            </h2>
            <Link
              href="/articles"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-800/60">
            {[
              {
                id: "art-1",
                title: "Panduan Lengkap SEO On-Page 2026: Strategi Peringkat 1 Google",
                keyword: "SEO On-Page",
                words: 1850,
                score: 94,
                date: "Hari ini",
              },
              {
                id: "art-2",
                title: "10 AI Tools Terbaik untuk Meningkatkan Produktivitas Penulisan Konten",
                keyword: "AI tools penulisan",
                words: 2200,
                score: 89,
                date: "Kemarin",
              },
              {
                id: "art-3",
                title: "Cara Efektif Membangun Topical Authority untuk Website Baru",
                keyword: "Topical Authority SEO",
                words: 2450,
                score: 96,
                date: "3 hari lalu",
              },
            ].map((item) => (
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
                      {item.keyword}
                    </span>
                    <span>• {item.words} kata</span>
                    <span>• {item.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 text-xs">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {item.score}/100
                  </span>
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
        </div>

        {/* Right 1 Col: Pipeline Status */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            9Router AI Engine
          </h2>

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
