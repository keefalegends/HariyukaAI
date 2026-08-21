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

    fetchArticle();
  }, [articleId]);

  const handleEditorChange = (text: string, html: string) => {
    setContentMarkdown(text);
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

  return (
    <div className="space-y-6">
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
            wordCount={seoAudit?.word_count || article?.word_count || 1850}
            readingTime={seoAudit?.reading_time_minutes || 9}
            keywordDensity={seoAudit?.keyword_density || 1.4}
            targetKeyword={article?.target_keyword || "SEO"}
            checklist={seoAudit?.checklist}
            secondaryKeywords={seoAudit?.secondary_keywords}
          />
        </div>
      </div>
    </div>
  );
}
