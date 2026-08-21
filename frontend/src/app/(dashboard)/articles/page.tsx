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
} from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { useTokens } from "@/lib/use-tokens";

interface ArticleItem {
  id: string;
  title: string;
  target_keyword: string;
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
          className="t-accent-bg flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors w-fit"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
          <span>Buat Artikel Baru</span>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${tk.textFaint}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan judul atau keyword..."
            className={`w-full t-input border rounded-lg pl-8 pr-3 py-1.5 text-xs t-border-focus transition-colors`}
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {["all", "completed", "generating", "outline_pending"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                statusFilter === st
                  ? "t-accent-bg border-transparent"
                  : tk.outlineBtn
              }`}
            >
              {st === "all"
                ? "Semua"
                : st === "completed"
                ? "Selesai"
                : st === "generating"
                ? "Menulis"
                : "Review"}
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
                    <Link
                      href={`/articles/${art.id}`}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${tk.outlineBtn}`}
                    >
                      <span>Buka</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </Link>
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
