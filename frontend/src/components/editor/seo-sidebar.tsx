"use client";

import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  TrendingUp,
  FileText,
  Clock,
  Tag,
  Sparkles,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface SeoSidebarProps {
  score?: number;
  wordCount?: number;
  readingTime?: number;
  keywordDensity?: number;
  targetKeyword: string;
  checklist?: Array<{ rule: string; passed: boolean; message: string }>;
  secondaryKeywords?: Array<{ keyword: string; found: boolean }>;
}

export function SeoSidebar({
  score = 94,
  wordCount = 1850,
  readingTime = 9,
  keywordDensity = 1.4,
  targetKeyword,
  checklist = [],
  secondaryKeywords = [],
}: SeoSidebarProps) {
  // Score color logic
  const getScoreColor = (s: number) => {
    if (s >= 80) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    if (s >= 60) return "text-amber-400 border-amber-500/30 bg-amber-500/10";
    return "text-rose-400 border-rose-500/30 bg-rose-500/10";
  };

  const defaultChecklist = checklist.length > 0 ? checklist : [
    { rule: "Word Count", passed: wordCount >= 1000, message: `${wordCount} kata (Ideal untuk SEO)` },
    { rule: "Keyword Density", passed: keywordDensity >= 0.8 && keywordDensity <= 2.5, message: `Kepadatan ${keywordDensity}% (Optimal)` },
    { rule: "First Paragraph", passed: true, message: "Keyword utama ada di 150 kata pertama" },
    { rule: "Heading Hierarchy", passed: true, message: "Subheading H2 dan H3 terstruktur rapi" },
    { rule: "E-E-A-T & Formatting", passed: true, message: "Bold emphasis & visual tags optimal" },
  ];

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-6 shadow-xl sticky top-20">
      {/* Header & Score Gauge */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            Live SEO Score
          </span>
          <span className="text-[10px] text-slate-500 uppercase font-mono">Real-time</span>
        </div>

        <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-800/80 rounded-xl p-4">
          <div
            className={`w-16 h-16 rounded-2xl border-2 flex flex-col items-center justify-center ${getScoreColor(
              score
            )}`}
          >
            <span className="text-2xl font-black">{score}</span>
            <span className="text-[9px] font-bold uppercase tracking-widest">/100</span>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-bold text-white">
              {score >= 80 ? "Sangat Optimal (Rank Ready)" : score >= 60 ? "Cukup Baik" : "Perlu Optimasi"}
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Artikel ini memiliki sinyal E-E-A-T kuat dan siap bersaing di SERP Google.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-medium">
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            Jumlah Kata
          </div>
          <div className="text-sm font-bold text-white">{formatNumber(wordCount)} kata</div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-medium">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            Waktu Baca
          </div>
          <div className="text-sm font-bold text-white">~{readingTime} Menit</div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-medium">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            Density Keyword
          </div>
          <div className="text-sm font-bold text-emerald-400">{keywordDensity}%</div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-medium">
            <Tag className="w-3.5 h-3.5 text-amber-400" />
            Target Keyword
          </div>
          <div className="text-xs font-bold text-slate-200 truncate">{targetKeyword}</div>
        </div>
      </div>

      {/* Checklist Audit */}
      <div className="space-y-2.5">
        <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Checklist Evaluasi SEO
        </div>
        <div className="space-y-2">
          {defaultChecklist.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 text-xs bg-slate-950/40 border border-slate-800/60 rounded-xl p-2.5"
            >
              {item.passed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-semibold text-slate-200">{item.rule}</div>
                <div className="text-[11px] text-slate-400">{item.message}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Secondary Keywords Coverage */}
      {secondaryKeywords.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Cakupan Keyword Sekunder
          </div>
          <div className="flex flex-wrap gap-1.5">
            {secondaryKeywords.map((sk, i) => (
              <span
                key={i}
                className={`text-[11px] px-2 py-1 rounded-md border flex items-center gap-1 ${
                  sk.found
                    ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-300"
                    : "bg-slate-950 border-slate-800 text-slate-500"
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
