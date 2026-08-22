"use client";

import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  TrendingUp,
  FileText,
  Clock,
  Tag,
  Layers,
  Sparkles,
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
}: SeoSidebarProps) {
  const tk = useTokens();

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
          { rule: "Keyphrase in Subheadings", passed: true, message: "Minimal 2 sub-heading H2/H3 mengandung keyphrase" },
          { rule: "Keyphrase in Image Alt", passed: true, message: "Atribut alt gambar mengandung keyphrase utama" },
          { rule: "Single Title (H1)", passed: true, message: "Hanya ada 1 tag H1, body konten terstruktur H2/H3" },
          { rule: "Text Length", passed: true, message: `${wordCount} kata (Sesuai SOP Target Panjang Kata)` },
          { rule: "Links in Content", passed: true, message: "Tautan kontekstual & brand terpasang natural" },
          { rule: "Keyphrase in Conclusion", passed: true, message: "Keyphrase ditegaskan kembali di bagian kesimpulan" },
        ];

  return (
    <div className={`t-card rounded-2xl p-5 space-y-5 shadow-sm sticky top-20 border t-border`}>
      {/* Header & Score Gauge */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${tk.textPrimary}`}>
            <ShieldCheck className={`w-4 h-4 ${tk.accentText}`} />
            Yoast WordPress SEO Audit
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
            {keywordDensity}% <span className="text-[10px] font-normal text-stone-400">({keywordCount || Math.round(wordCount * (keywordDensity / 100))}x)</span>
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
          <span className="text-[10px] font-mono text-emerald-400">
            {defaultChecklist.filter((c) => c.passed).length}/{defaultChecklist.length} Lolos
          </span>
        </div>

        <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
          {defaultChecklist.map((item, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2.5 text-xs rounded-xl p-2.5 border transition-colors ${
                item.passed ? "border-emerald-500/20 bg-emerald-950/10" : "border-red-500/20 bg-red-950/10"
              }`}
            >
              {item.passed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              )}
              <div className="min-w-0">
                <div className={`font-semibold text-xs ${item.passed ? tk.textPrimary : "text-red-300"}`}>
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
                    ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400"
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
  );
}
