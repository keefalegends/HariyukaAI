"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Save,
  ArrowLeft,
  Check,
  Trash2,
  AlertTriangle,
  X,
  Loader2,
  ShieldCheck,
  FileCheck2,
  Bot,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { TiptapEditor } from "@/components/editor/tiptap-editor";
import { SeoSidebar } from "@/components/editor/seo-sidebar";
import { AiCopilotChat } from "@/components/editor/ai-copilot-chat";
import { useTokens } from "@/lib/use-tokens";
import { logTerminal } from "@/lib/terminal-bus";
import { getApiUrl } from "@/lib/api-config";

export default function ArticleEditorPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const articleId = params?.id as string;
  const tk = useTokens();

  const [article, setArticle] = useState<any>(null);
  const [contentMarkdown, setContentMarkdown] = useState("");
  const [slug, setSlug] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [tags, setTags] = useState("");
  const [seoAudit, setSeoAudit] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedWordPress, setCopiedWordPress] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // AI Copilot Split-View Mode & History Stack
  const [isCopilotOpen, setIsCopilotOpen] = useState(searchParams?.get("copilot") === "true");
  const [previousContents, setPreviousContents] = useState<string[]>([]);

  useEffect(() => {
    if (searchParams?.get("copilot") === "true") {
      setIsCopilotOpen(true);
    }
  }, [searchParams]);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Authenticity / Plagiarism & AI Checker state
  const [showCheckerModal, setShowCheckerModal] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [checkerReport, setCheckerReport] = useState<any>(null);

  useEffect(() => {
    if (!articleId) return;

    const fetchArticle = async () => {
      try {
        const res = await fetch(getApiUrl(`/api/v1/articles/${articleId}`));
        if (res.ok) {
          const data = await res.json();
          setArticle(data);
          setContentMarkdown(data.content_markdown || "");
          setSlug(data.slug || "");
          setMetaDescription(data.meta_description || "");
          setSeoTitle(data.seo_title || data.title || "");
          setTags(data.tags || "");
          setSeoAudit(data.seo_audit || null);
        }
      } catch (err) {
        console.error("Failed to fetch article:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [articleId]);

  const handleEditorChange = (markdown: string) => {
    setContentMarkdown(markdown);
  };

  const handleUpdateMetadata = (meta: { slug?: string; metaDescription?: string; seoTitle?: string; tags?: string }) => {
    if (meta.slug !== undefined) setSlug(meta.slug);
    if (meta.metaDescription !== undefined) setMetaDescription(meta.metaDescription);
    if (meta.seoTitle !== undefined) setSeoTitle(meta.seoTitle);
    if (meta.tags !== undefined) setTags(meta.tags);
  };

  const handleCopyWordPress = () => {
    if (!contentMarkdown) return;
    navigator.clipboard.writeText(contentMarkdown);
    setCopiedWordPress(true);
    setTimeout(() => setCopiedWordPress(false), 2500);
  };

  const handleSave = async () => {
    if (!articleId) return;
    setIsSaving(true);

    try {
      const res = await fetch(getApiUrl(`/api/v1/articles/${articleId}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content_markdown: contentMarkdown,
          slug: slug,
          meta_description: metaDescription,
          seo_title: seoTitle,
          tags: tags,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setArticle(updated);
        setSeoAudit(updated.seo_audit);
        setSlug(updated.slug || slug);
        setMetaDescription(updated.meta_description || metaDescription);
        setSeoTitle(updated.seo_title || seoTitle);
        setTags(updated.tags || tags);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2000);
      }
    } catch (err) {
      console.error("Failed to update article content:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!articleId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(getApiUrl(`/api/v1/articles/${articleId}`), {
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

  const handleRunChecker = async () => {
    setShowCheckerModal(true);
    setIsChecking(true);
    logTerminal("JOB", `Memindai keaslian konten: "${article?.title || articleId.slice(0, 8)}"...`);

    try {
      const res = await fetch(getApiUrl("/api/v1/checker/audit"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: contentMarkdown || article?.content_markdown || "",
          check_plagiarism: true,
          check_ai: true,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setCheckerReport(json.data);
        const aiScore = json.data.ai_detection?.ai_percentage ?? 0;
        const plagScore = json.data.plagiarism?.plagiarism_score ?? 0;
        logTerminal("OK", `Audit orisinalitas: ${100 - plagScore}% Unik | ${100 - aiScore}% Human`);
      }
    } catch (e) {
      console.error("Checker audit failed:", e);
      logTerminal("ERR", `Gagal memindai orisinalitas: ${String(e)}`);
    } finally {
      setIsChecking(false);
    }
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
                    <span>Hapus Permanen</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── LIVE CHECKER AUDIT MODAL ─── */}
      {showCheckerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/75 backdrop-blur-sm animate-in fade-in"
            onClick={() => !isChecking && setShowCheckerModal(false)}
          />
          <div
            className={`relative z-10 w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 ${tk.cardBg}`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b t-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#d97757]/15 border border-[#d97757]/40 flex items-center justify-center text-[#d97757]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`text-sm font-bold ${tk.textPrimary}`}>Audit Orisinalitas & AI</h3>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-[#d97757]/15 text-[#d97757] border border-[#d97757]/30 tracking-wider">
                      BETA
                    </span>
                  </div>
                  <p className={`text-[10px] ${tk.textFaint}`}>Pindai Indeks Web & Detektor Probabilitas AI</p>
                </div>
              </div>
              <button
                onClick={() => setShowCheckerModal(false)}
                className={`p-1.5 rounded-lg transition-colors ${tk.navInactive}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Loading State */}
            {isChecking && (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#d97757]" />
                <p className={`text-xs font-semibold ${tk.textPrimary}`}>Memindai Keaslian Konten...</p>
                <p className={`text-[11px] ${tk.textFaint}`}>Mencocokkan ke web index & menganalisis variasi kalimat.</p>
              </div>
            )}

            {/* Results View */}
            {!isChecking && checkerReport && (
              <div className="space-y-4">
                {/* Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Plagiarism Box */}
                  <div className="p-4 rounded-xl border t-border bg-black/20 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-stone-400">Keunikan Plagiasi</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold">
                        {checkerReport.plagiarism?.uniqueness_score}% Unik
                      </span>
                    </div>
                    <div className="text-2xl font-extrabold font-mono text-emerald-400">
                      {checkerReport.plagiarism?.uniqueness_score}%
                    </div>
                    <p className="text-[10px] text-stone-400">
                      {checkerReport.plagiarism?.matched_sources?.length === 0
                        ? "✓ 100% Bebas plagiasi dari web index."
                        : `Ditemukan ${checkerReport.plagiarism?.matched_sources?.length} sumber yang cocok.`}
                    </p>
                  </div>

                  {/* AI Detector Box */}
                  <div className="p-4 rounded-xl border t-border bg-black/20 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-stone-400">Detektor Konten AI</span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                          checkerReport.ai_detection?.ai_percentage <= 30
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-amber-500/15 text-amber-400"
                        }`}
                      >
                        {checkerReport.ai_detection?.verdict}
                      </span>
                    </div>
                    <div
                      className={`text-2xl font-extrabold font-mono ${
                        checkerReport.ai_detection?.ai_percentage <= 30 ? "text-emerald-400" : "text-amber-400"
                      }`}
                    >
                      {checkerReport.ai_detection?.human_percentage}% Human
                    </div>
                    <p className="text-[10px] text-stone-400">
                      Skor AI: {checkerReport.ai_detection?.ai_percentage}% • Burstiness: {checkerReport.ai_detection?.burstiness_score}
                    </p>
                  </div>
                </div>

                {/* Sentence Highlight Breakdown */}
                {checkerReport.ai_detection?.sentences && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className={`font-semibold ${tk.textPrimary}`}>Pratinjau Ritme Kalimat:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 text-[10px]">● Human</span>
                        <span className="text-amber-400 text-[10px]">● Warning</span>
                        <span className="text-red-400 text-[10px]">● Terindikasi AI</span>
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-black/30 border t-border text-xs leading-relaxed max-h-48 overflow-y-auto">
                      {checkerReport.ai_detection.sentences.map((s: any, idx: number) => {
                        let bg = "";
                        if (s.tag === "ai") bg = "bg-red-500/20 text-red-200";
                        else if (s.tag === "warning") bg = "bg-amber-500/20 text-amber-200";
                        return (
                          <span key={idx} className={`px-1 py-0.5 rounded mr-1 ${bg}`} title={s.reason}>
                            {s.text}{" "}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Web Sources list if any */}
                {checkerReport.plagiarism?.matched_sources?.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <span className="text-xs font-semibold text-amber-400">Sumber Web yang Ditemukan:</span>
                    <div className="space-y-1">
                      {checkerReport.plagiarism.matched_sources.map((src: any, i: number) => (
                        <a
                          key={i}
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg border t-border bg-black/20 hover:border-[#d97757] flex items-center justify-between text-xs"
                        >
                          <span className="truncate">{src.title}</span>
                          <ExternalLink className="w-3 h-3 shrink-0 text-stone-400" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-3 border-t t-border">
              <Link
                href="/checker"
                className={`text-xs font-medium ${tk.accentText} hover:underline flex items-center gap-1`}
              >
                <span>Buka Tool Checker Penuh</span>
                <ExternalLink className="w-3 h-3" />
              </Link>

              <button
                type="button"
                onClick={() => setShowCheckerModal(false)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${tk.outlineBtn}`}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b t-border">
        {/* Left: Back button & Title */}
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          {isCopilotOpen ? (
            <button
              type="button"
              onClick={() => setIsCopilotOpen(false)}
              className={`h-9 w-9 inline-flex items-center justify-center rounded-xl text-xs font-medium transition-colors shrink-0 ${tk.outlineBtn} cursor-pointer`}
              title="Tutup AI Copilot (Kembali ke Tampilan Normal)"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : (
            <Link
              href="/articles"
              className={`h-9 w-9 inline-flex items-center justify-center rounded-xl text-xs font-medium transition-colors shrink-0 ${tk.outlineBtn}`}
              title="Kembali ke Daftar Artikel"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${tk.monoBadge}`}>
                Editor Suite
              </span>
              <span className={`text-[11px] ${tk.textFaint}`}>• ID: {articleId.slice(0, 8)}...</span>
            </div>
            <h1 className={`text-base font-semibold ${tk.textPrimary} truncate max-w-xl mt-0.5`} title={article?.title}>
              {article?.title || "Memuat Artikel..."}
            </h1>
          </div>
        </div>

        {/* Right: Unified Action Buttons Toolbar */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {/* Delete Button */}
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="h-9 w-9 inline-flex items-center justify-center rounded-xl border border-red-500/20 text-stone-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0 shadow-sm"
            title="Hapus Artikel"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Save Button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={`h-9 inline-flex items-center gap-2 px-4 rounded-xl text-xs font-semibold transition-all active:scale-95 cursor-pointer disabled:opacity-50 whitespace-nowrap shadow-sm bg-[#d97757] hover:bg-[#c26445] text-white`}
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

      {/* Main Content: Split-View Mode vs Standard View */}
      {isCopilotOpen ? (
        /* Claude Artifacts Split-View Layout (Left: AI Chat, Right: Live Article Document) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-8.5rem)] animate-in fade-in duration-200">
          {/* Left Column: AI Copilot Chat (5 cols ~ 42%) */}
          <div className="lg:col-span-5 h-full">
            <AiCopilotChat
              articleId={articleId}
              currentContent={contentMarkdown}
              onApplyContent={(newMarkdown, newAudit) => {
                setPreviousContents((prev) => [...prev, contentMarkdown]);
                setContentMarkdown(newMarkdown);
                if (newAudit) setSeoAudit(newAudit);
              }}
              onUndoContent={() => {
                if (previousContents.length > 0) {
                  const last = previousContents[previousContents.length - 1];
                  setPreviousContents((prev) => prev.slice(0, -1));
                  setContentMarkdown(last);
                }
              }}
              canUndo={previousContents.length > 0}
              onClose={() => setIsCopilotOpen(false)}
            />
          </div>

          {/* Right Column: Live Article Document Editor (7 cols ~ 58%) */}
          <div className="lg:col-span-7 flex flex-col h-full overflow-hidden rounded-2xl border t-border t-card shadow-sm">
            <div className="flex items-center justify-between px-4 py-2.5 border-b t-border t-bg-tag text-xs shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className={`font-semibold ${tk.textPrimary} text-xs truncate max-w-[280px]`}>
                  {seoTitle || article?.title || "Dokumen Artikel"}
                </span>
                <span className={`text-[10px] font-mono ${tk.textFaint} shrink-0`}>
                  ({seoAudit?.word_count || contentMarkdown.split(/\s+/).filter(Boolean).length} kata)
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold font-mono">
                  SEO: {seoAudit?.score || article?.seo_score || 94}/100
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <TiptapEditor
                initialContent={contentMarkdown}
                onChange={handleEditorChange}
              />
            </div>
          </div>
        </div>
      ) : (
        /* Standard Layout: Tiptap Editor (Left 2 cols) + Live SEO Sidebar (Right 1 col) */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
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
              slug={slug}
              metaDescription={metaDescription}
              seoTitle={seoTitle}
              tags={tags}
              onUpdateMetadata={handleUpdateMetadata}
              onOpenCopilot={() => setIsCopilotOpen(true)}
              onRunChecker={handleRunChecker}
            />
          </div>
        </div>
      )}
    </div>
  );
}
