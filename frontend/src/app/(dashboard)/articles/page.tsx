"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ChevronRight,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Plus,
} from "lucide-react";

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

export function ArticlesPage() {
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
          setArticles(data);
        } else {
          // Fallback mock data
          setArticles([
            {
              id: "art-1",
              title: "Panduan Lengkap SEO On-Page 2026: Strategi Peringkat 1 Google",
              target_keyword: "SEO On-Page",
              language: "id",
              status: "completed",
              word_count: 1850,
              seo_score: 94,
              created_at: new Date().toISOString(),
            },
            {
              id: "art-2",
              title: "10 AI Tools Terbaik untuk Meningkatkan Produktivitas Penulisan Konten",
              target_keyword: "AI tools penulisan",
              language: "id",
              status: "completed",
              word_count: 2200,
              seo_score: 89,
              created_at: new Date(Date.now() - 86400000).toISOString(),
            },
            {
              id: "art-3",
              title: "Cara Riset Long-Tail Keywords dengan Search Intent Tinggi",
              target_keyword: "riset long-tail keywords",
              language: "id",
              status: "outline_pending",
              word_count: 0,
              seo_score: 0,
              created_at: new Date(Date.now() - 172800000).toISOString(),
            },
          ]);
        }
      } catch (err) {
        // Fallback mock data
        setArticles([
          {
            id: "art-1",
            title: "Panduan Lengkap SEO On-Page 2026: Strategi Peringkat 1 Google",
            target_keyword: "SEO On-Page",
            language: "id",
            status: "completed",
            word_count: 1850,
            seo_score: 94,
            created_at: new Date().toISOString(),
          },
          {
            id: "art-2",
            title: "10 AI Tools Terbaik untuk Meningkatkan Produktivitas Penulisan Konten",
            target_keyword: "AI tools penulisan",
            language: "id",
            status: "completed",
            word_count: 2200,
            seo_score: 89,
            created_at: new Date(Date.now() - 86400000).toISOString(),
          },
        ]);
      }
      setIsLoading(false);
    };

    fetchArticles();
  }, []);

  const filteredArticles = articles.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.target_keyword.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="w-3 h-3" /> Selesai
          </span>
        );
      case "outline_pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Clock className="w-3 h-3" /> Review Outline
          </span>
        );
      case "generating":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Sparkles className="w-3 h-3 animate-spin" /> Menulis...
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
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
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Artikel Saya</h1>
          <p className="text-xs text-slate-400">
            Kelola, edit, dan pantau performa seluruh artikel SEO yang telah Anda buat.
          </p>
        </div>

        <Link
          href="/generator"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 transition-all active:scale-95 w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Tulis Artikel Baru</span>
        </Link>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan judul atau keyword..."
            className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {["all", "completed", "outline_pending"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                statusFilter === st
                  ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                  : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              {st === "all" ? "Semua Status" : st === "completed" ? "Selesai" : "Menunggu Review"}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Judul & Keyword</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Kata</th>
                <th className="py-3.5 px-4">Skor SEO</th>
                <th className="py-3.5 px-4">Dibuat Pada</th>
                <th className="py-3.5 px-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredArticles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Belum ada artikel yang cocok. Buat artikel pertama Anda sekarang!
                  </td>
                </tr>
              ) : (
                filteredArticles.map((art) => (
                  <tr
                    key={art.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="py-4 px-5 max-w-sm">
                      <Link
                        href={`/articles/${art.id}`}
                        className="font-bold text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-1 text-sm"
                      >
                        {art.title}
                      </Link>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                        <span className="font-mono bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-800">
                          {art.target_keyword}
                        </span>
                        <span>• {art.language.toUpperCase()}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4">{getStatusBadge(art.status)}</td>

                    <td className="py-4 px-4 font-semibold text-slate-200">
                      {art.word_count > 0 ? `${art.word_count.toLocaleString()} kata` : "-"}
                    </td>

                    <td className="py-4 px-4">
                      {art.seo_score > 0 ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          {art.seo_score}/100
                        </span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-slate-400">
                      {new Date(art.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td className="py-4 px-5 text-right">
                      <Link
                        href={`/articles/${art.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-semibold transition-all"
                      >
                        <span>Buka Editor</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ArticlesPage;
