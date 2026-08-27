"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Plus,
  Loader2,
  ArrowUpRight,
  Trash2,
  AlertTriangle,
  X,
  Sparkles,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { useTokens } from "@/lib/use-tokens";
import { getApiUrl } from "@/lib/api-config";

interface ArticleItem {
  id: string;
  title: string;
  target_keyword: string;
  article_type?: string;
  language: string;
  status: string;
  word_count: number;
  seo_score: number;
  created_at: string;
}

export default function ArticlesPage() {
  const tk = useTokens();
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  // Delete modal state
  const [articleToDelete, setArticleToDelete] = useState<ArticleItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await fetch(getApiUrl("/api/v1/articles"));
        if (res.ok) {
          const data = await res.json();
          setArticles(Array.isArray(data) ? data : []);
        } else {
          setArticles([]);
        }
      } catch (err) {
        setArticles([]);
      }
      setIsLoading(false);
    };

    fetchArticles();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!articleToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(getApiUrl(`/api/v1/articles/${articleToDelete.id}`), {
        method: "DELETE",
      });
      if (res.ok) {
        setArticles((prev) => prev.filter((a) => a.id !== articleToDelete.id));
      }
    } catch (err) {
      console.error("Delete article error:", err);
    }
    setIsDeleting(false);
    setArticleToDelete(null);
  };

  const filteredArticles = articles.filter((a) => {
    const matchesSearch =
      a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.target_keyword?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className={`inline-flex items-center gap-1 font-semibold ${tk.statusSuccess}`}>
            <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
          </span>
        );
      case "outline_pending":
        return (
          <span className={`inline-flex items-center gap-1 font-semibold ${tk.statusPending}`}>
            <Clock className="w-3.5 h-3.5" /> Review Outline
          </span>
        );
      case "generating":
        return (
          <span className={`inline-flex items-center gap-1 font-semibold ${tk.statusRunning}`}>
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Menulis...
          </span>
        );
      case "failed":
        return (
          <span className={`inline-flex items-center gap-1 font-semibold ${tk.statusFailed}`}>
            Gagal
          </span>
        );
      default:
        return (
          <span className={`inline-flex items-center gap-1 font-semibold ${tk.statusDraft}`}>
            Draft
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── DELETE CONFIRMATION MODAL ─── */}
      {articleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in"
            onClick={() => !isDeleting && setArticleToDelete(null)}
          />
          <div
            className={`relative z-10 w-full max-w-sm rounded-2xl border p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 ${tk.cardBg}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={`text-sm font-semibold ${tk.textPrimary}`}>Hapus Artikel?</h3>
                  <p className={`text-[10px] ${tk.textFaint}`}>Tindakan Permanen</p>
                </div>
              </div>
              <button
                disabled={isDeleting}
                onClick={() => setArticleToDelete(null)}
                className={`p-1.5 rounded-lg transition-colors ${tk.navInactive}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className={`text-xs leading-relaxed ${tk.textMuted}`}>
              Apakah Anda yakin ingin menghapus artikel{" "}
              <strong className={tk.textPrimary}>"{articleToDelete.title}"</strong>? Artikel akan dihapus permanen dari database disk.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t t-border">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setArticleToDelete(null)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${tk.outlineBtn}`}
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-500 text-white shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Artikel</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={`text-base font-semibold ${tk.textPrimary}`}>Artikel Saya</h1>
          <p className={`text-xs ${tk.textMuted} mt-0.5`}>
            Daftar seluruh artikel SEO yang telah dibuat melalui pipeline Hariyuka AI.
          </p>
        </div>

        <Link
          href="/generator"
          className="t-accent-bg flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95 shrink-0 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          <span>Buat Artikel Baru</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${tk.textFaint}`} />
          <input
            type="text"
            placeholder="Cari berdasarkan judul atau keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="t-input w-full border rounded-lg pl-8 pr-3 py-1.5 text-xs t-border-focus transition-colors"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "Semua" },
            { id: "completed", label: "Selesai" },
            { id: "generating", label: "Menulis" },
            { id: "outline_pending", label: "Review" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                statusFilter === tab.id
                  ? "t-accent-bg font-semibold shadow-sm"
                  : `${tk.tagBg} ${tk.textFaint} hover:t-text-primary`
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Article Cards List */}
      <div className="space-y-3.5">
        {isLoading ? (
          <div className="p-12 text-center t-card border t-border rounded-2xl space-y-3">
            <Loader2 className={`w-8 h-8 animate-spin mx-auto ${tk.accentText}`} />
            <span className={`text-xs ${tk.textMuted}`}>Memuat daftar artikel...</span>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="p-12 text-center t-card border t-border rounded-2xl space-y-3">
            <div className="w-12 h-12 rounded-2xl t-bg-tag border t-border flex items-center justify-center mx-auto">
              <FileText className={`w-6 h-6 ${tk.textFaint}`} />
            </div>
            <div>
              <h3 className={`text-sm font-bold ${tk.textPrimary}`}>Belum Ada Artikel</h3>
              <p className={`text-xs ${tk.textMuted} mt-1 max-w-sm mx-auto`}>
                Tidak ada artikel yang sesuai dengan kriteria pencarian. Buat artikel baru sekarang.
              </p>
            </div>
            <Link
              href="/generator"
              className="t-accent-bg inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all mt-2 active:scale-95 shadow-sm"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              <span>Tulis Artikel Baru</span>
            </Link>
          </div>
        ) : (
          filteredArticles.map((art) => (
            <div
              key={art.id}
              className="t-card border t-border rounded-2xl p-5 transition-all hover:border-[#d97757]/50 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 group"
            >
              {/* Left Details */}
              <div className="space-y-2 min-w-0 flex-1">
                {/* Meta Badges */}
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  {getStatusBadge(art.status)}

                  <span className={`px-2 py-0.5 rounded-md border t-border t-bg-tag text-[11px] font-mono ${tk.textMuted}`}>
                    {art.word_count > 0 ? `${formatNumber(art.word_count)} kata` : "0 kata"}
                  </span>

                  {art.seo_score > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[11px] font-mono font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>SEO {art.seo_score}/100</span>
                    </span>
                  )}
                </div>

                {/* Title */}
                <Link
                  href={`/articles/${art.id}`}
                  className={`text-base font-bold ${tk.textPrimary} group-hover:text-[#d97757] transition-colors leading-snug block`}
                >
                  {art.title}
                </Link>

                {/* Meta: Keyword & Date */}
                <div className={`flex items-center gap-4 text-xs ${tk.textMuted} flex-wrap`}>
                  {art.target_keyword && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#d97757]/10 text-[#d97757] border border-[#d97757]/20 font-semibold">
                        🔑 {art.target_keyword}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-[11px]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {new Date(art.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                {/* AI Copilot Direct Action */}
                <Link
                  href={`/articles/${art.id}?copilot=true`}
                  className="h-9 inline-flex items-center gap-1.5 px-3 rounded-xl text-xs font-semibold border border-[#d97757]/40 bg-[#d97757]/10 text-[#d97757] hover:bg-[#d97757] hover:text-white transition-all shadow-sm cursor-pointer"
                  title="Buka AI Copilot Editor"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Copilot</span>
                </Link>

                {/* Standard Editor Action */}
                <Link
                  href={`/articles/${art.id}`}
                  className={`h-9 inline-flex items-center gap-1.5 px-3.5 rounded-xl text-xs font-semibold border transition-all ${tk.outlineBtn}`}
                  title="Buka Editor Artikel"
                >
                  <span>Buka Editor</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => setArticleToDelete(art)}
                  className="h-9 w-9 inline-flex items-center justify-center rounded-xl border border-red-500/20 text-stone-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0 shadow-sm"
                  title="Hapus Artikel"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
