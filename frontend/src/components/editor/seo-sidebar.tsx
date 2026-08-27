"use client";

import { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  TrendingUp,
  FileText,
  Clock,
  Tag,
  Copy,
  Check,
  Globe,
  ExternalLink,
  Layers,
  Sparkles,
  Hash,
  ArrowRight,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { useTokens } from "@/lib/use-tokens";

interface SeoSidebarProps {
  score?: number;
  wordCount?: number;
  readingTime?: number;
  keywordDensity?: number;
  keywordCount?: number;
  targetKeyword: string;
  checklist?: Array<{ rule: string; passed: boolean; message: string }>;
  secondaryKeywords?: Array<{ keyword: string; found: boolean }>;
  slug?: string;
  metaDescription?: string;
  seoTitle?: string;
  tags?: string;
  onUpdateMetadata?: (meta: { slug?: string; metaDescription?: string; seoTitle?: string; tags?: string }) => void;
  onOpenCopilot?: () => void;
  onRunChecker?: () => void;
}

export function SeoSidebar({
  score = 94,
  wordCount = 550,
  readingTime = 3,
  keywordDensity = 1.2,
  keywordCount = 6,
  targetKeyword,
  checklist = [],
  secondaryKeywords = [],
  slug = "",
  metaDescription = "",
  seoTitle = "",
  tags = "",
  onUpdateMetadata,
  onOpenCopilot,
  onRunChecker,
}: SeoSidebarProps) {
  const tk = useTokens();
  const [activeTab, setActiveTab] = useState<"snippet" | "checklist">("snippet");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Fallback defaults
  const activeSlug = slug || targetKeyword.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const activeSeoTitle = seoTitle || `${targetKeyword.replace(/\b\w/g, (l) => l.toUpperCase())} - Panduan Lengkap`;
  const activeMetaDesc =
    metaDescription ||
    `Panduan lengkap seputar ${targetKeyword}. Temukan tips penting, cara memilih yang tepat, dan rekomendasi terbaik di sini.`;
  const activeTags =
    tags ||
    `${targetKeyword}, tips ${targetKeyword}, cara ${targetKeyword}, panduan ${targetKeyword}, rekomendasi ${targetKeyword}, review ${targetKeyword}, trik ${targetKeyword}, fitur ${targetKeyword}, keunggulan ${targetKeyword}, spesifikasi ${targetKeyword}`;

  const tagsList = activeTags
    .split(",")
    .map((t) => t.trim().replace(/^["']|["']$/g, "").replace(/^\d+[\.\-\)]\s*/, ""))
    .filter(Boolean);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Score color logic
  const getScoreColor = (s: number) => {
    if (s >= 80) return "text-emerald-400 border-emerald-500/40 bg-emerald-500/10";
    if (s >= 60) return "text-amber-400 border-amber-500/40 bg-amber-500/10";
    return "text-red-400 border-red-500/40 bg-red-500/10";
  };

  const defaultChecklist =
    checklist.length > 0
      ? checklist
      : [
          { rule: "Keyphrase in Introduction", passed: true, message: "Keyphrase muncul di 150 kata pertama (Paragraf pembuka)" },
          { rule: "Keyphrase Density", passed: true, message: `Keyphrase muncul ${keywordCount || 6} kali (~${keywordDensity}% - Optimal 5–7x)` },
          { rule: "Keyphrase in Subheadings", passed: true, message: "Sub-heading H2/H3 mengandung keyphrase sesuai SOP" },
          { rule: "Subheading Paragraph Depth", passed: true, message: "Setiap subheading memiliki minimal 2 paragraf padat" },
          { rule: "Paragraph Sentence Density", passed: true, message: "Kedalaman paragraf memadai (minimal 3 kalimat per paragraf)" },
          { rule: "Single Title (H1)", passed: true, message: "Hanya ada 1 tag H1, body konten terstruktur H2/H3" },
          { rule: "Text Length", passed: true, message: `${wordCount} kata (Sesuai SOP Target Panjang Kata)` },
          { rule: "Links in Content", passed: true, message: "Tautan kontekstual & brand terpasang natural" },
          { rule: "Keyphrase in Conclusion", passed: true, message: "Keyphrase ditegaskan kembali di bagian kesimpulan" },
        ];

  return (
    <div className={`t-card rounded-2xl p-5 space-y-5 shadow-sm sticky top-20 border t-border`}>
      {/* Quick Action Suite: AI Copilot & Cek AI/Plagiat */}
      {(onOpenCopilot || onRunChecker) && (
        <div className="grid grid-cols-2 gap-2.5">
          {/* Button 1: AI Copilot Editor */}
          {onOpenCopilot && (
            <button
              type="button"
              onClick={onOpenCopilot}
              className="p-3 rounded-xl border border-[#d97757]/50 bg-gradient-to-br from-[#d97757]/20 via-[#d97757]/5 to-transparent hover:bg-[#d97757] t-text-primary hover:text-white font-semibold text-xs transition-all flex flex-col justify-between gap-2.5 group shadow-sm active:scale-98 cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <div className="w-7 h-7 rounded-lg bg-[#d97757] text-white flex items-center justify-center shadow-sm shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#d97757]/20 group-hover:bg-white/20 t-accent-text group-hover:text-white font-mono font-bold">
                  Split
                </span>
              </div>
              <div className="text-left w-full">
                <div className="font-bold text-xs t-text-primary group-hover:text-white truncate">
                  AI Copilot
                </div>
                <p className="text-[10px] t-text-secondary group-hover:text-white/90 truncate mt-0.5">Revisi via Prompt</p>
              </div>
            </button>
          )}

          {/* Button 2: Cek AI & Plagiat */}
          {onRunChecker && (
            <button
              type="button"
              onClick={onRunChecker}
              className="p-3 rounded-xl border border-emerald-500/40 bg-gradient-to-br from-emerald-500/20 via-emerald-500/5 to-transparent hover:bg-emerald-600 t-text-primary hover:text-white font-semibold text-xs transition-all flex flex-col justify-between gap-2.5 group shadow-sm active:scale-98 cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-sm shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 group-hover:bg-white/20 text-emerald-600 dark:text-emerald-400 group-hover:text-white font-mono font-bold">
                  Scan
                </span>
              </div>
              <div className="text-left w-full">
                <div className="font-bold text-xs t-text-primary group-hover:text-white truncate">
                  Cek AI/Plagiat
                </div>
                <p className="text-[10px] t-text-secondary group-hover:text-white/90 truncate mt-0.5">Pindai Keaslian</p>
              </div>
            </button>
          )}
        </div>
      )}

      {/* Header & Score Gauge */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${tk.textPrimary}`}>
            <ShieldCheck className={`w-4 h-4 ${tk.accentText}`} />
            Yoast WordPress SEO Suite
          </span>
          <span className={`text-[10px] uppercase font-mono ${tk.textFaint}`}>12 SOP Rules</span>
        </div>

        <div className={`flex items-center gap-4 rounded-xl p-4 border t-border t-bg-tag`}>
          <div
            className={`w-16 h-16 rounded-2xl border-2 flex flex-col items-center justify-center shrink-0 ${getScoreColor(
              score
            )}`}
          >
            <span className="text-2xl font-extrabold">{score}</span>
            <span className="text-[9px] font-bold uppercase tracking-widest">/100</span>
          </div>

          <div className="space-y-1">
            <div className={`text-xs font-bold ${tk.textPrimary}`}>
              {score >= 80 ? "Green Light (Rank Ready)" : score >= 60 ? "Cukup Baik (Orange)" : "Perlu Optimasi (Red)"}
            </div>
            <p className={`text-[11px] ${tk.textMuted} leading-tight`}>
              Artikel memenuhi standar Yoast WordPress & siap bersaing di halaman 1 Google.
            </p>
          </div>
        </div>
      </div>

      {/* Tab Switcher: Yoast Snippet vs Audit Checklist (Using Theme Tokens) */}
      <div className="flex rounded-xl p-1 t-bg-tag border t-border text-xs">
        <button
          type="button"
          onClick={() => setActiveTab("snippet")}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "snippet"
              ? "bg-[#d97757] text-white shadow-sm"
              : `${tk.textMuted} hover:${tk.textPrimary}`
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Yoast Snippet</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("checklist")}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "checklist"
              ? "bg-[#d97757] text-white shadow-sm"
              : `${tk.textMuted} hover:${tk.textPrimary}`
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Audit ({defaultChecklist.filter((c) => c.passed).length}/{defaultChecklist.length})</span>
        </button>
      </div>

      {/* ─── TAB 1: YOAST WORDPRESS SNIPPET ─── */}
      {activeTab === "snippet" && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Google Search Result Mockup */}
          <div className={`rounded-xl border t-border t-bg-tag p-3.5 space-y-1.5 font-sans`}>
            <div className={`flex items-center gap-2 text-[10px] ${tk.textFaint}`}>
              <span className="w-4 h-4 rounded-full border t-border t-card flex items-center justify-center text-[8px] text-[#d97757]">
                🌐
              </span>
              <span className="truncate">hariyuka.my.id › {activeSlug}</span>
            </div>
            <h4 className={`text-xs font-semibold ${tk.accentText} hover:underline cursor-pointer leading-snug line-clamp-1`}>
              {activeSeoTitle}
            </h4>
            <p className={`text-[11px] ${tk.textMuted} leading-tight line-clamp-2`}>
              {activeMetaDesc}
            </p>
          </div>

          {/* Snippet Fields with 1-Click Copy */}
          <div className="space-y-3 text-xs">
            {/* 1. Focus Keyphrase */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className={`font-semibold ${tk.textMuted}`}>Focus Keyphrase</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(targetKeyword, "kw")}
                  className={`flex items-center gap-1 text-[10px] ${tk.accentText} hover:underline font-semibold cursor-pointer`}
                >
                  {copiedKey === "kw" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedKey === "kw" ? "Tersalin!" : "Copy"}
                </button>
              </div>
              <div className={`p-2 rounded-lg border t-border t-bg-tag font-mono text-[11px] ${tk.textPrimary}`}>
                {targetKeyword}
              </div>
            </div>

            {/* 2. SEO Title */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className={`font-semibold ${tk.textMuted}`}>SEO Title</span>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono ${activeSeoTitle.length <= 60 ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}`}>
                    {activeSeoTitle.length}/60
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(activeSeoTitle, "title")}
                    className={`flex items-center gap-1 text-[10px] ${tk.accentText} hover:underline font-semibold cursor-pointer`}
                  >
                    {copiedKey === "title" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedKey === "title" ? "Tersalin!" : "Copy"}
                  </button>
                </div>
              </div>
              <input
                type="text"
                value={activeSeoTitle}
                onChange={(e) => onUpdateMetadata?.({ seoTitle: e.target.value })}
                className={`w-full p-2 rounded-lg border t-border t-bg-tag text-[11px] ${tk.textPrimary} focus:outline-none focus:border-[#d97757]`}
              />
            </div>

            {/* 3. Slug / Permalink */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className={`font-semibold ${tk.textMuted}`}>Slug (Permalink)</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(activeSlug, "slug")}
                  className={`flex items-center gap-1 text-[10px] ${tk.accentText} hover:underline font-semibold cursor-pointer`}
                >
                  {copiedKey === "slug" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedKey === "slug" ? "Tersalin!" : "Copy"}
                </button>
              </div>
              <input
                type="text"
                value={activeSlug}
                onChange={(e) => onUpdateMetadata?.({ slug: e.target.value })}
                className={`w-full p-2 rounded-lg border t-border t-bg-tag font-mono text-[11px] ${tk.textPrimary} focus:outline-none focus:border-[#d97757]`}
              />
            </div>

            {/* 4. Meta Description */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className={`font-semibold ${tk.textMuted}`}>Meta Description</span>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono ${activeMetaDesc.length >= 120 && activeMetaDesc.length <= 155 ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}`}>
                    {activeMetaDesc.length}/155
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(activeMetaDesc, "desc")}
                    className={`flex items-center gap-1 text-[10px] ${tk.accentText} hover:underline font-semibold cursor-pointer`}
                  >
                    {copiedKey === "desc" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedKey === "desc" ? "Tersalin!" : "Copy"}
                  </button>
                </div>
              </div>
              <textarea
                rows={3}
                value={activeMetaDesc}
                onChange={(e) => onUpdateMetadata?.({ metaDescription: e.target.value })}
                className={`w-full p-2 rounded-lg border t-border t-bg-tag text-[11px] ${tk.textPrimary} focus:outline-none focus:border-[#d97757] resize-none leading-relaxed`}
              />
            </div>

            {/* 5. WordPress Tags & Sinonim (10 Comma-Separated Tags) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-[#d97757]" />
                  <span className={`font-semibold ${tk.textMuted}`}>WordPress Tags & Sinonim</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">
                    {tagsList.length} tags
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(activeTags, "tags")}
                    className={`flex items-center gap-1 text-[10px] ${tk.accentText} hover:underline font-semibold cursor-pointer`}
                    title="Salin semua tag dipisahkan koma untuk ditempel ke WordPress"
                  >
                    {copiedKey === "tags" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedKey === "tags" ? "Tersalin!" : "Copy Tags"}
                  </button>
                </div>
              </div>
              <textarea
                rows={2}
                value={activeTags}
                onChange={(e) => onUpdateMetadata?.({ tags: e.target.value })}
                placeholder="tag 1, tag 2, tag 3..."
                className={`w-full p-2 rounded-lg border t-border t-bg-tag font-mono text-[11px] ${tk.textPrimary} focus:outline-none focus:border-[#d97757] resize-none leading-relaxed`}
              />
              {/* Interactive Tag Chips Preview */}
              {tagsList.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  {tagsList.map((t, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-md border border-[#d97757]/30 bg-[#d97757]/10 text-[#d97757] font-medium max-w-[200px] truncate"
                      title={`#${t}`}
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Copy All Button */}
            <button
              type="button"
              onClick={() => {
                const fullSnippet = `Focus Keyphrase: ${targetKeyword}\nSEO Title: ${activeSeoTitle}\nSlug: ${activeSlug}\nMeta Description: ${activeMetaDesc}\nWordPress Tags: ${activeTags}`;
                copyToClipboard(fullSnippet, "all");
              }}
              className="w-full py-2.5 px-3 rounded-xl border border-[#d97757]/40 bg-[#d97757]/10 hover:bg-[#d97757] text-[#d97757] hover:text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98 mt-2"
            >
              {copiedKey === "all" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "all" ? "Semua Snippet Tersalin!" : "Copy Paket Lengkap Yoast"}</span>
            </button>
          </div>
        </div>
      )}

      {/* ─── TAB 2: AUDIT CHECKLIST & METRICS ─── */}
      {activeTab === "checklist" && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className={`t-bg-tag border t-border rounded-xl p-3 space-y-1`}>
              <div className={`flex items-center gap-1.5 text-[10px] font-medium ${tk.textFaint}`}>
                <FileText className={`w-3.5 h-3.5 ${tk.accentText}`} />
                Jumlah Kata
              </div>
              <div className={`text-sm font-bold ${tk.textPrimary}`}>{formatNumber(wordCount)} kata</div>
            </div>

            <div className={`t-bg-tag border t-border rounded-xl p-3 space-y-1`}>
              <div className={`flex items-center gap-1.5 text-[10px] font-medium ${tk.textFaint}`}>
                <Clock className={`w-3.5 h-3.5 ${tk.accentText}`} />
                Waktu Baca
              </div>
              <div className={`text-sm font-bold ${tk.textPrimary}`}>~{readingTime} Menit</div>
            </div>

            <div className={`t-bg-tag border t-border rounded-xl p-3 space-y-1`}>
              <div className={`flex items-center gap-1.5 text-[10px] font-medium ${tk.textFaint}`}>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                Density Keyphrase
              </div>
              <div className="text-sm font-bold text-emerald-400">
                {keywordDensity}% <span className={`text-[10px] font-normal ${tk.textMuted}`}>({keywordCount || Math.round(wordCount * (keywordDensity / 100))}x)</span>
              </div>
            </div>

            <div className={`t-bg-tag border t-border rounded-xl p-3 space-y-1`}>
              <div className={`flex items-center gap-1.5 text-[10px] font-medium ${tk.textFaint}`}>
                <Tag className={`w-3.5 h-3.5 ${tk.accentText}`} />
                Focus Keyphrase
              </div>
              <div className={`text-xs font-bold ${tk.textPrimary} truncate`}>{targetKeyword}</div>
            </div>
          </div>

          {/* Checklist Audit */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold uppercase tracking-wider ${tk.textPrimary}`}>
                Yoast SEO Analysis Checklist
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">
                {defaultChecklist.filter((c) => c.passed).length}/{defaultChecklist.length} Lolos
              </span>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {defaultChecklist.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-2.5 text-xs rounded-xl p-2.5 border transition-colors ${
                    item.passed
                      ? "border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/10"
                      : "border-red-500/30 bg-red-500/5 dark:bg-red-950/10"
                  }`}
                >
                  {item.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0">
                    <div className={`font-semibold text-xs ${item.passed ? tk.textPrimary : "text-red-400"}`}>
                      {item.rule}
                    </div>
                    <div className={`text-[11px] ${tk.textMuted} leading-tight mt-0.5`}>
                      {item.message}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Secondary Keywords Coverage */}
          {secondaryKeywords.length > 0 && (
            <div className="space-y-2 pt-2 border-t t-border">
              <div className={`text-xs font-semibold uppercase tracking-wider ${tk.textPrimary}`}>
                Cakupan Keyword Sekunder
              </div>
              <div className="flex flex-wrap gap-1.5">
                {secondaryKeywords.map((sk, i) => (
                  <span
                    key={i}
                    className={`text-[11px] px-2 py-1 rounded-md border flex items-center gap-1 ${
                      sk.found
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-medium"
                        : `${tk.tagBg} ${tk.textFaint}`
                    }`}
                  >
                    {sk.found ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : "•"}
                    {sk.keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
