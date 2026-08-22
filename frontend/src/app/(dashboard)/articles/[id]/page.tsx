"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { TiptapEditor } from "@/components/editor/tiptap-editor";
import { SeoSidebar } from "@/components/editor/seo-sidebar";
import {
  ArrowLeft,
  Save,
  Check,
  Trash2,
  AlertTriangle,
  X,
  Loader2,
} from "lucide-react";
import { useTokens } from "@/lib/use-tokens";

export default function ArticleDetailPage() {
  const tk = useTokens();
  const params = useParams();
  const router = useRouter();
  const articleId = params.id as string;

  const [article, setArticle] = useState<any>(null);
  const [contentMarkdown, setContentMarkdown] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [seoAudit, setSeoAudit] = useState<any>(null);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/v1/articles/${articleId}`);
        if (res.ok) {
          const data = await res.json();
          setArticle(data);
          setContentMarkdown(data.content_markdown || "");
          setContentHtml(data.content_html || "");
          setSeoAudit(data.seo_audit);
        } else {
          setArticle(null);
        }
      } catch (err) {
        setArticle(null);
      }
    };

    if (articleId) {
      fetchArticle();
    }
  }, [articleId]);

  const handleEditorChange = (markdown: string, html: string) => {
    setContentMarkdown(markdown);
    setContentHtml(html);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/articles/${articleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content_markdown: contentMarkdown,
          content_html: contentHtml,
          title: article?.title,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setArticle(updated);
        setSeoAudit(updated.seo_audit);
      }
    } catch (e) {
      console.warn("Save note:", e);
    }
    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/articles/${articleId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/articles");
        return;
      }
    } catch (e) {
      console.error("Delete article error:", e);
    }
    setIsDeleting(false);
    setShowDeleteModal(false);
  };

  return (
    <div className="space-y-6">
      {/* ─── DELETE CONFIRMATION MODAL ─── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in"
            onClick={() => !isDeleting && setShowDeleteModal(false)}
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
                onClick={() => setShowDeleteModal(false)}
                className={`p-1.5 rounded-lg transition-colors ${tk.navInactive}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className={`text-xs leading-relaxed ${tk.textMuted}`}>
              Apakah Anda yakin ingin menghapus artikel{" "}
              <strong className={tk.textPrimary}>"{article?.title || "ini"}"</strong>? Artikel akan dihapus permanen dari database disk.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t t-border">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setShowDeleteModal(false)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${tk.outlineBtn}`}
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
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

      {/* Top Header Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b t-border">
        <div className="flex items-center gap-3">
          <Link
            href="/articles"
            className={`p-2 rounded-lg text-xs font-medium transition-colors ${tk.outlineBtn}`}
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${tk.monoBadge}`}>
                Editor Suite
              </span>
              <span className={`text-[11px] ${tk.textFaint}`}>• ID: {articleId.slice(0, 8)}...</span>
            </div>
            <h1 className={`text-base font-semibold ${tk.textPrimary} truncate max-w-xl mt-0.5`}>
              {article?.title || "Memuat Artikel..."}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="p-2 rounded-lg border border-red-500/20 text-stone-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
            title="Hapus Artikel"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={`t-accent-bg flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all active:scale-95 cursor-pointer disabled:opacity-50`}
          >
            {isSaving ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : savedSuccess ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{savedSuccess ? "Tersimpan!" : "Simpan Perubahan"}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Tiptap Editor (Left) + Live SEO Sidebar (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor Area */}
        <div className="lg:col-span-2 space-y-4">
          <TiptapEditor
            initialContent={contentMarkdown}
            onChange={handleEditorChange}
          />
        </div>

        {/* SEO Sidebar */}
        <div className="space-y-4">
          <SeoSidebar
            score={seoAudit?.score || article?.seo_score || 94}
            wordCount={seoAudit?.word_count || article?.word_count || 550}
            readingTime={seoAudit?.reading_time_minutes || 3}
            keywordDensity={seoAudit?.keyword_density || 1.2}
            keywordCount={seoAudit?.keyword_count}
            targetKeyword={article?.target_keyword || "SEO"}
            checklist={seoAudit?.checklist}
            secondaryKeywords={seoAudit?.secondary_keywords}
          />
        </div>
      </div>
    </div>
  );
}
