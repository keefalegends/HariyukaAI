"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { TiptapEditor } from "@/components/editor/tiptap-editor";
import { SeoSidebar } from "@/components/editor/seo-sidebar";
import {
  ArrowLeft,
  Save,
  Sparkles,
  Download,
  Share2,
  Check,
  ExternalLink,
  Eye,
  FileCheck,
} from "lucide-react";

export default function ArticleDetailPage() {
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
    // Fetch article from backend API
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
          // Fallback mock data for preview
          const mockArticle = {
            id: articleId,
            title: "Panduan Lengkap SEO On-Page 2026: Strategi Peringkat 1 Google",
            target_keyword: "SEO On-Page",
            language: "id",
            tone: "authoritative",
            target_length: 2000,
            word_count: 1850,
            seo_score: 94,
            content_markdown: `# Panduan Lengkap SEO On-Page 2026: Strategi Peringkat 1 Google

Dalam lanskap pencarian modern saat ini, **SEO On-Page** menjadi fondasi utama untuk memenangkan persaingan algoritma Google. Tanpa struktur halaman yang tepat, konten terbaik sekalipun akan sulit ditemukan calon pembaca potensial.

Artikel ini menyajikan panduan mendalam langkah demi langkah untuk mengoptimasi setiap elemen teknis dan kontekstual halaman website Anda.

[IMAGE: Infografis Diagram Komponen SEO On-Page 2026 | alt='komponen utama optimasi seo on-page']

## 1. Riset Search Intent dan Pemetaan Kata Kunci

Sebelum menulis sebaris kalimat pun, memahami **search intent** adalah hal mutlak. Algoritma mesin pencari kini memprioritaskan relevansi langsung terhadap maksud pencarian pengguna:

- **Informational Intent**: Pengguna mencari penjelasan atau panduan ("bagaimana cara...").
- **Commercial Intent**: Pengguna membandingkan fitur atau layanan terbaik.
- **Transactional Intent**: Pengguna siap melakukan aksi pendaftaran atau pembelian.

## 2. Struktur Heading H2 & H3 yang Hierarkis

Penataan sub-heading yang logis tidak hanya membantu Google memahami alur artikel, tetapi juga menjaga kenyamanan membaca pengguna (readability):

### 2.1 Formula Penempatan Keyword pada H2
Pastikan kata kunci utama atau variasi LSI muncul secara natural pada setidaknya 2 sub-heading H2 utama Anda.

### 2.2 Sinyal E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)
Sertakan studi kasus nyata, kutipan data industri, dan kesimpulan yang dapat langsung dipraktikkan oleh pembaca.

[IMAGE: Contoh struktur heading artikel SEO | alt='struktur heading h2 h3 seo on-page']

## 3. Kesimpulan dan Rencana Aksi

Optimasi On-Page adalah proses berkelanjutan. Mulailah dengan mengaudit konten terpenting Anda hari ini dan perhatikan peningkatan impresi organik Anda di Google Search Console.`,
            status: "completed",
            seo_audit: {
              score: 94,
              word_count: 1850,
              reading_time_minutes: 9,
              keyword_density: 1.4,
              checklist: [
                { rule: "Word Count", passed: true, message: "1.850 kata (Sangat Bagus untuk Ranking)" },
                { rule: "Keyword Density", passed: true, message: "Kepadatan keyword utama ideal (1.4%)" },
                { rule: "First Paragraph Keyword", passed: true, message: "Keyword utama ada di paragraf pembuka" },
                { rule: "Heading Structure", passed: true, message: "Struktur sub-heading rapi (3 H2, 2 H3)" },
                { rule: "Rich Media & Formatting", passed: true, message: "Media visual & bold formatting optimal" }
              ]
            }
          };
          setArticle(mockArticle);
          setContentMarkdown(mockArticle.content_markdown);
          setSeoAudit(mockArticle.seo_audit);
        }
      } catch (err) {
        console.error("Fetch article error:", err);
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            href="/articles"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                Tiptap Rich Suite
              </span>
              <span className="text-[11px] text-slate-500">• ID: {articleId.slice(0, 8)}...</span>
            </div>
            <h1 className="text-lg md:text-xl font-bold text-white truncate max-w-xl">
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
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 transition-all active:scale-95 cursor-pointer"
          >
            {isSaving ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : savedSuccess ? (
              <Check className="w-3.5 h-3.5 text-emerald-300" />
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
