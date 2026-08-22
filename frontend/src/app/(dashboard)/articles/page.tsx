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
} from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { useTokens } from "@/lib/use-tokens";

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
        const res = await fetch("http://localhost:8000/api/v1/articles");
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
      const res = await fetch(`http://localhost:8000/api/v1/articles/${articleToDelete.id}`, {
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

      {/* Table Card */}
      <div className={`t-card rounded-xl overflow-hidden shadow-sm`}>
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-2">
            <Loader2 className={`w-5 h-5 animate-spin ${tk.accentText}`} />
            <span className={`text-xs ${tk.textMuted}`}>Memuat daftar artikel...</span>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="py-20 px-4 text-center space-y-3">
            <div className={`w-10 h-10 rounded-xl t-bg-tag border t-border flex items-center justify-center mx-auto`}>
              <FileText className={`w-5 h-5 ${tk.textFaint}`} />
            </div>
            <div>
              <h3 className={`text-sm font-semibold ${tk.textPrimary}`}>Belum Ada Artikel</h3>
              <p className={`text-xs ${tk.textMuted} mt-1 max-w-sm mx-auto`}>
                Tidak ada artikel yang sesuai dengan kriteria pencarian. Buat artikel baru sekarang.
              </p>
            </div>
            <Link
              href="/generator"
              className="t-accent-bg inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors mt-2"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
              <span>Tulis Artikel</span>
            </Link>
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b t-border">
                <th className={`py-2.5 px-5 text-left text-[11px] font-medium ${tk.textFaint} w-full`}>Judul Artikel</th>
                <th className={`py-2.5 px-4 text-left text-[11px] font-medium ${tk.textFaint} whitespace-nowrap`}>Target Keyword</th>
                <th className={`py-2.5 px-4 text-right text-[11px] font-medium ${tk.textFaint} whitespace-nowrap`}>Kata</th>
                <th className={`py-2.5 px-4 text-right text-[11px] font-medium ${tk.textFaint} whitespace-nowrap`}>SEO Score</th>
                <th className={`py-2.5 px-4 text-left text-[11px] font-medium ${tk.textFaint} whitespace-nowrap`}>Status</th>
                <th className={`py-2.5 px-4 text-left text-[11px] font-medium ${tk.textFaint} whitespace-nowrap`}>Tanggal</th>
                <th className={`py-2.5 px-5 text-right text-[11px] font-medium ${tk.textFaint} whitespace-nowrap`}>Aksi</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${tk.dividerRow}`}>
              {filteredArticles.map((art) => (
                <tr key={art.id} className="t-bg-card-hover transition-colors group">
                  <td className="py-3.5 px-5">
                    <Link
                      href={`/articles/${art.id}`}
                      className={`font-semibold ${tk.textPrimary} hover:${tk.accentText} transition-colors line-clamp-1 flex items-center gap-1.5`}
                    >
                      {art.title}
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity shrink-0" />
                    </Link>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded border ${tk.monoBadge}`}>
                      {art.target_keyword}
                    </span>
                  </td>
                  <td className={`py-3.5 px-4 text-right ${tk.textMuted} tabular-nums`}>
                    {art.word_count > 0 ? formatNumber(art.word_count) : "—"}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {art.seo_score > 0 ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-400">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {art.seo_score}/100
                      </span>
                    ) : (
                      <span className={tk.textFaint}>—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    {getStatusBadge(art.status)}
                  </td>
                  <td className={`py-3.5 px-4 ${tk.textFaint}`}>
                    {new Date(art.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/articles/${art.id}`}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${tk.outlineBtn}`}
                      >
                        <span>Buka</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setArticleToDelete(art)}
                        className="p-1 rounded-md text-stone-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Hapus artikel"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
