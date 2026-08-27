"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Search,
  FileText,
  MessageSquare,
  ChevronRight,
  ExternalLink,
  Save,
  Check,
  Loader2,
  Bot,
  Layers,
} from "lucide-react";
import { useTokens } from "@/lib/use-tokens";
import { getApiUrl } from "@/lib/api-config";
import { AiCopilotChat } from "@/components/editor/ai-copilot-chat";
import { TiptapEditor } from "@/components/editor/tiptap-editor";

interface ArticleItem {
  id: string;
  title: string;
  target_keyword?: string;
  status: string;
  word_count: number;
  seo_score: number;
  content_markdown?: string;
  copilot_chat_history?: any[];
  created_at: string;
}

export default function CopilotHubPage() {
  const tk = useTokens();
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<ArticleItem | null>(null);
  const [contentMarkdown, setContentMarkdown] = useState("");
  const [previousContents, setPreviousContents] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // 1. Fetch all articles
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await fetch(getApiUrl("/api/v1/articles"));
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : [];
          setArticles(list);
          if (list.length > 0 && !selectedArticleId) {
            setSelectedArticleId(list[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch articles:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArticles();
  }, []);

  // 2. Fetch full detail when selectedArticleId changes
  useEffect(() => {
    if (!selectedArticleId) return;
    const fetchDetail = async () => {
      try {
        const res = await fetch(getApiUrl(`/api/v1/articles/${selectedArticleId}`));
        if (res.ok) {
          const data = await res.json();
          setSelectedArticle(data);
          setContentMarkdown(data.content_markdown || "");
          setPreviousContents([]);
        }
      } catch (err) {
        console.error("Failed to load article detail:", err);
      }
    };
    fetchDetail();
  }, [selectedArticleId]);

  const filteredArticles = articles.filter((a) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (a.title || "").toLowerCase().includes(q) ||
      (a.target_keyword || "").toLowerCase().includes(q)
    );
  });

  const handleSave = async () => {
    if (!selectedArticleId) return;
    setIsSaving(true);
    try {
      const res = await fetch(getApiUrl(`/api/v1/articles/${selectedArticleId}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content_markdown: contentMarkdown,
        }),
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2000);
      }
    } catch (err) {
      console.error("Failed to save article:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b t-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#d97757]/15 border border-[#d97757]/30 flex items-center justify-center text-[#d97757] shrink-0 shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`text-base sm:text-lg font-bold ${tk.textPrimary}`}>
                AI Copilot Hub
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#d97757]/15 text-[#d97757] border border-[#d97757]/30 font-semibold">
                Claude Split-View
              </span>
            </div>
            <p className={`text-xs ${tk.textMuted}`}>
              Pilih artikel dari daftar untuk melihat dan melanjutkan percakapan revisi AI secara real-time.
            </p>
          </div>
        </div>

        {selectedArticle && (
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/articles/${selectedArticle.id}`}
              className={`h-9 inline-flex items-center gap-1.5 px-3 rounded-xl text-xs font-semibold border transition-all ${tk.outlineBtn}`}
              title="Buka Halaman Editor Penuh"
            >
              <span>Editor Penuh</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="h-9 inline-flex items-center gap-1.5 px-4 rounded-xl text-xs font-semibold bg-[#d97757] hover:bg-[#c26445] text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : savedSuccess ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>{savedSuccess ? "Tersimpan!" : "Simpan"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Container: Left Article Drawer + Right Split-View Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-10rem)]">
        {/* Left Column: Article Selector List (~25% width on large screens) */}
        <div className="lg:col-span-3 flex flex-col h-full rounded-2xl border t-border t-card overflow-hidden shadow-sm">
          {/* Search Header */}
          <div className="p-3 border-b t-border t-bg-tag space-y-2 shrink-0">
            <div className="flex items-center justify-between text-xs">
              <span className={`font-bold uppercase tracking-wider text-[11px] ${tk.textPrimary}`}>
                Daftar Artikel
              </span>
              <span className={`text-[10px] font-mono ${tk.textFaint}`}>
                {articles.length} Sesi
              </span>
            </div>

            <div className="relative">
              <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${tk.textFaint}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari artikel..."
                className="w-full t-input border rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* List of Articles */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {isLoading ? (
              <div className="p-6 text-center text-xs text-stone-500 space-y-2">
                <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#d97757]" />
                <p>Memuat daftar artikel...</p>
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="p-6 text-center text-xs text-stone-500 space-y-2">
                <FileText className="w-6 h-6 mx-auto opacity-40" />
                <p>Tidak ada artikel ditemukan.</p>
              </div>
            ) : (
              filteredArticles.map((a) => {
                const isSelected = a.id === selectedArticleId;
                const hasChats = a.copilot_chat_history && a.copilot_chat_history.length > 0;
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setSelectedArticleId(a.id)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                      isSelected
                        ? "border-[#d97757]/60 bg-[#d97757]/10 shadow-sm"
                        : "border-transparent hover:t-bg-tag hover:border-stone-700/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4
                        className={`text-xs font-semibold line-clamp-2 leading-snug ${
                          isSelected ? "text-[#d97757]" : tk.textPrimary
                        }`}
                      >
                        {a.title || "Tanpa Judul"}
                      </h4>
                      <ChevronRight
                        className={`w-3.5 h-3.5 shrink-0 mt-0.5 transition-transform ${
                          isSelected ? "text-[#d97757] translate-x-0.5" : tk.textFaint
                        }`}
                      />
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] flex-wrap font-mono">
                      <span className={`px-1.5 py-0.2 rounded border t-border t-bg-card ${tk.textMuted}`}>
                        {a.word_count || 0} kata
                      </span>

                      {a.seo_score > 0 && (
                        <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                          SEO {a.seo_score}
                        </span>
                      )}

                      {hasChats && (
                        <span className="px-1.5 py-0.2 rounded bg-[#d97757]/15 text-[#d97757] border border-[#d97757]/30 flex items-center gap-1">
                          <MessageSquare className="w-2.5 h-2.5" />
                          <span>Chat</span>
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Claude Split-View Workspace (~75% width) */}
        <div className="lg:col-span-9 h-full">
          {selectedArticle ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
              {/* Left Sub-column: AI Copilot Chat (5 cols ~ 42%) */}
              <div className="lg:col-span-5 h-full">
                <AiCopilotChat
                  articleId={selectedArticle.id}
                  currentContent={contentMarkdown}
                  onApplyContent={(newMarkdown) => {
                    setPreviousContents((prev) => [...prev, contentMarkdown]);
                    setContentMarkdown(newMarkdown);
                  }}
                  onUndoContent={() => {
                    if (previousContents.length > 0) {
                      const last = previousContents[previousContents.length - 1];
                      setPreviousContents((prev) => prev.slice(0, -1));
                      setContentMarkdown(last);
                    }
                  }}
                  canUndo={previousContents.length > 0}
                  onClose={() => {}}
                />
              </div>

              {/* Right Sub-column: Live Article Document (7 cols ~ 58%) */}
              <div className="lg:col-span-7 flex flex-col h-full rounded-2xl border t-border t-card overflow-hidden shadow-sm">
                <div className="flex items-center justify-between px-4 py-2.5 border-b t-border t-bg-tag text-xs shrink-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span className={`font-semibold ${tk.textPrimary} text-xs truncate max-w-[320px]`}>
                      {selectedArticle.title}
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono ${tk.textFaint}`}>
                    {contentMarkdown.split(/\s+/).filter(Boolean).length} kata
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  <TiptapEditor
                    initialContent={contentMarkdown}
                    onChange={(text) => setContentMarkdown(text)}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full rounded-2xl border t-border t-card p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#d97757]/15 border border-[#d97757]/30 flex items-center justify-center text-[#d97757]">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className={`text-sm font-bold ${tk.textPrimary}`}>Pilih Artikel untuk Memulai Copilot</h3>
              <p className={`text-xs ${tk.textMuted} max-w-sm`}>
                Pilih salah satu artikel dari menu sebelah kiri untuk melihat dokumen dan riwayat percakapan revisinya.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
