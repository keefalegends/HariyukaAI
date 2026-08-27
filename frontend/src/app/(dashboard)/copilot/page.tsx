"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Search,
  FileText,
  MessageSquare,
  ArrowRight,
  Loader2,
  Tag,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Flame,
} from "lucide-react";
import { useTokens } from "@/lib/use-tokens";
import { getApiUrl } from "@/lib/api-config";

function formatDate(dateStr?: string): string {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

interface ArticleItem {
  id: string;
  title: string;
  target_keyword?: string;
  status: string;
  word_count: number;
  seo_score: number;
  copilot_chat_history?: any[];
  created_at: string;
  updated_at?: string;
}

export default function CopilotHubPage() {
  const tk = useTokens();
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterChatOnly, setFilterChatOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await fetch(getApiUrl("/api/v1/articles"));
        if (res.ok) {
          const data = await res.json();
          setArticles(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to fetch articles:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArticles();
  }, []);

  const filteredArticles = articles.filter((a) => {
    const matchesSearch =
      !searchQuery.trim() ||
      (a.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.target_keyword || "").toLowerCase().includes(searchQuery.toLowerCase());

    const hasChats = a.copilot_chat_history && a.copilot_chat_history.length > 0;
    if (filterChatOnly && !hasChats) return false;

    return matchesSearch;
  });

  const totalWithChats = articles.filter(
    (a) => a.copilot_chat_history && a.copilot_chat_history.length > 0
  ).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b t-border">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#d97757]/15 border border-[#d97757]/30 flex items-center justify-center text-[#d97757] shadow-sm shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`text-xl font-bold ${tk.textPrimary}`}>
                AI Copilot Hub
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#d97757]/15 text-[#d97757] border border-[#d97757]/30 font-semibold">
                Claude 4.6 Opus
              </span>
            </div>
            <p className={`text-xs ${tk.textMuted} mt-0.5`}>
              Pilih artikel yang ingin direvisi menggunakan asisten AI Copilot interaktif.
            </p>
          </div>
        </div>

        {/* Quick Stats Banner */}
        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-2 rounded-xl t-card border t-border flex items-center gap-2 shadow-sm">
            <FileText className="w-4 h-4 text-[#d97757]" />
            <span className={tk.textMuted}>Total Artikel:</span>
            <span className={`font-bold font-mono ${tk.textPrimary}`}>{articles.length}</span>
          </div>

          <div className="px-3 py-2 rounded-xl t-card border t-border flex items-center gap-2 shadow-sm">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span className={tk.textMuted}>Sesi Chat Aktif:</span>
            <span className={`font-bold font-mono text-emerald-400`}>{totalWithChats}</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${tk.textFaint}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan judul atau focus keyphrase..."
            className="w-full t-input border rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterChatOnly(false)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              !filterChatOnly
                ? "bg-[#d97757] text-white border-transparent shadow-sm"
                : `${tk.outlineBtn}`
            }`}
          >
            Semua Artikel ({articles.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterChatOnly(true)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
              filterChatOnly
                ? "bg-[#d97757] text-white border-transparent shadow-sm"
                : `${tk.outlineBtn}`
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ada Percakapan ({totalWithChats})</span>
          </button>
        </div>
      </div>

      {/* Article List Cards */}
      <div className="space-y-3.5">
        {isLoading ? (
          <div className="p-12 text-center t-card border t-border rounded-2xl space-y-3">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#d97757]" />
            <p className={`text-xs ${tk.textMuted}`}>Memuat daftar artikel...</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="p-12 text-center t-card border t-border rounded-2xl space-y-3">
            <FileText className="w-10 h-10 mx-auto text-stone-500 opacity-40" />
            <h3 className={`text-sm font-bold ${tk.textPrimary}`}>Tidak Ada Artikel Ditemukan</h3>
            <p className={`text-xs ${tk.textMuted} max-w-sm mx-auto`}>
              {searchQuery
                ? "Tidak ada artikel yang cocok dengan pencarian Anda."
                : "Belum ada artikel yang dibuat. Buat artikel baru melalui menu Generator terlebih dahulu."}
            </p>
          </div>
        ) : (
          filteredArticles.map((article) => {
            const hasChats =
              article.copilot_chat_history && article.copilot_chat_history.length > 0;
            const chatCount = article.copilot_chat_history?.length || 0;

            return (
              <div
                key={article.id}
                className="t-card border t-border rounded-2xl p-5 md:p-6 transition-all hover:border-[#d97757]/50 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 group"
              >
                {/* Left: Article Details */}
                <div className="space-y-2.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {/* Chat Persistence Status Indicator */}
                    {hasChats ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-medium font-mono">
                        <MessageSquare className="w-3 h-3" />
                        <span>{chatCount} Pesan Percakapan Tersimpan</span>
                      </span>
                    ) : (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full t-bg-tag border t-border ${tk.textFaint} text-[11px] font-mono`}>
                        <Sparkles className="w-3 h-3" />
                        <span>Siap Direvisi</span>
                      </span>
                    )}

                    {/* Word Count Badge */}
                    <span className={`px-2 py-0.5 rounded-md border t-border t-bg-tag text-[11px] font-mono ${tk.textMuted}`}>
                      {article.word_count || 0} kata
                    </span>

                    {/* SEO Score Badge */}
                    {article.seo_score > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>SEO {article.seo_score}/100</span>
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className={`text-base font-bold ${tk.textPrimary} group-hover:text-[#d97757] transition-colors leading-snug`}>
                    {article.title || "Tanpa Judul"}
                  </h3>

                  {/* Meta: Keyword & Date */}
                  <div className={`flex items-center gap-4 text-xs ${tk.textMuted} flex-wrap`}>
                    {article.target_keyword && (
                      <div className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-[#d97757]" />
                        <span className="font-mono text-[#d97757]">{article.target_keyword}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 text-[11px]">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatDate(article.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Action Buttons */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <Link
                    href={`/articles/${article.id}`}
                    className={`h-10 inline-flex items-center gap-1.5 px-3.5 rounded-xl text-xs font-semibold border transition-all ${tk.outlineBtn}`}
                    title="Buka Halaman Editor Biasa"
                  >
                    <span>Editor Standar</span>
                  </Link>

                  {/* Primary CTA: Enter AI Copilot Split-View */}
                  <Link
                    href={`/articles/${article.id}?copilot=true`}
                    className="h-10 inline-flex items-center gap-2 px-4 rounded-xl text-xs font-bold bg-[#d97757] hover:bg-[#c26445] text-white shadow-sm transition-all active:scale-95 cursor-pointer"
                    title="Buka AI Copilot Claude Split-View Editor"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Masuk ke AI Copilot</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
