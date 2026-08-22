"use client";

import { useState } from "react";
import {
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { useTokens } from "@/lib/use-tokens";

export interface OutlineSectionItem {
  id: string;
  heading: string;
  level: "h2" | "h3";
  target_word_count: number;
  key_points: string[];
  keywords_to_include: string[];
  subsections?: OutlineSectionItem[];
}

export interface ArticleOutline {
  title: string;
  estimated_total_words: number;
  sections: OutlineSectionItem[];
}

interface StepOutlineProps {
  initialOutline: ArticleOutline;
  serpData?: any;
  targetKeyword: string;
  onContinue: (updatedOutline: ArticleOutline, customTitle?: string) => void;
  onBack: () => void;
  isLoading: boolean;
}

export function StepOutline({
  initialOutline,
  serpData,
  targetKeyword,
  onContinue,
  onBack,
  isLoading,
}: StepOutlineProps) {
  const tk = useTokens();
  const [outline, setOutline] = useState<ArticleOutline>(initialOutline);
  const [title, setTitle] = useState(initialOutline.title || "");

  // Move Section Up/Down
  const moveSection = (index: number, direction: "up" | "down") => {
    const newSections = [...outline.sections];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newSections.length) return;

    const temp = newSections[index];
    newSections[index] = newSections[targetIdx];
    newSections[targetIdx] = temp;

    setOutline({ ...outline, sections: newSections });
  };

  // Delete Section
  const deleteSection = (index: number) => {
    const newSections = outline.sections.filter((_, i) => i !== index);
    setOutline({ ...outline, sections: newSections });
  };

  // Add New H2 Section
  const addH2Section = () => {
    const newId = `section-${Date.now()}`;
    const newSec: OutlineSectionItem = {
      id: newId,
      heading: "Judul Subheading Baru",
      level: "h2",
      target_word_count: 300,
      key_points: ["Poin penting pembahasan"],
      keywords_to_include: [targetKeyword],
      subsections: [],
    };
    setOutline({ ...outline, sections: [...outline.sections, newSec] });
  };

  // Update Section Heading
  const updateSectionHeading = (index: number, newHeading: string) => {
    const newSections = [...outline.sections];
    newSections[index].heading = newHeading;
    setOutline({ ...outline, sections: newSections });
  };

  // Update Section Target Word Count
  const updateSectionWordCount = (index: number, count: number) => {
    const newSections = [...outline.sections];
    newSections[index].target_word_count = count;
    setOutline({ ...outline, sections: newSections });
  };

  // Calculate dynamic total words
  const totalTargetWords = outline.sections.reduce(
    (acc, sec) => acc + (sec.target_word_count || 0),
    0
  );

  const hasEmptyHeadings = outline.sections.some((s) => !s.heading.trim());

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-[11px] t-text-faint">
          <span className={`font-medium ${tk.textPrimary}`}>Generator</span>
          <span>/</span>
          <span>Outline Review</span>
        </div>
        <h1 className={`text-base font-semibold ${tk.textPrimary}`}>Review Kerangka Artikel</h1>
        <p className={`text-xs ${tk.textMuted}`}>
          AI telah menyusun outline berdasarkan analisis SERP. Edit urutan atau bobot kata sebelum memulai penulisan.
        </p>
      </div>

      {/* SERP Insights strip */}
      {serpData && (
        <div className={`t-card rounded-xl px-5 py-3.5 grid grid-cols-3 gap-3 text-xs`}>
          <div>
            <div className={`text-[10px] uppercase tracking-wider mb-0.5 ${tk.textFaint}`}>Search Intent</div>
            <div className={`font-medium ${tk.textSecondary}`}>{serpData.search_intent || "Informational"}</div>
          </div>
          <div>
            <div className={`text-[10px] uppercase tracking-wider mb-0.5 ${tk.textFaint}`}>LSI Keywords</div>
            <div className={`font-medium truncate ${tk.textSecondary}`}>
              {serpData.lsi_keywords?.slice(0, 3).join(", ") || "Terpetakan"}
            </div>
          </div>
          <div>
            <div className={`text-[10px] uppercase tracking-wider mb-0.5 ${tk.textFaint}`}>Target Kata</div>
            <div className={`font-medium ${tk.textSecondary}`}>
              {totalTargetWords} kata · {outline.sections.length} section
            </div>
          </div>
        </div>
      )}

      {/* Editable Title */}
      <div className="space-y-1.5">
        <label className={`block text-[11px] font-semibold uppercase tracking-wider ${tk.textFaint}`}>
          Judul Artikel
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`w-full t-input border rounded-lg px-4 py-2.5 text-sm font-semibold t-border-focus transition-colors`}
        />
      </div>

      {/* Section List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className={`text-[11px] font-semibold uppercase tracking-wider ${tk.textFaint}`}>
            Struktur Heading ({outline.sections.length})
          </h3>
          <button
            type="button"
            onClick={addH2Section}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${tk.outlineBtn}`}
          >
            <Plus className="w-3.5 h-3.5" /> Tambah H2
          </button>
        </div>

        {outline.sections.map((section, idx) => (
          <div
            key={section.id || idx}
            className={`t-card rounded-xl p-4 transition-colors space-y-3 group`}
          >
            <div className="flex items-center justify-between gap-3">
              {/* Level & Heading */}
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <span className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-bold shrink-0 ${tk.monoBadge}`}>
                  {section.level.toUpperCase()}
                </span>

                <input
                  type="text"
                  value={section.heading}
                  onChange={(e) => updateSectionHeading(idx, e.target.value)}
                  className={`flex-1 bg-transparent border-b border-transparent focus:border-[#d97757] text-sm font-semibold ${tk.textPrimary} focus:outline-none px-1 py-0.5 transition-colors`}
                />
              </div>

              {/* Word count target + Reordering & Delete Controls */}
              <div className="flex items-center gap-2 shrink-0">
                <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg border t-border ${tk.tagBg}`}>
                  <input
                    type="number"
                    min={100}
                    max={1500}
                    step={50}
                    value={section.target_word_count}
                    onChange={(e) => updateSectionWordCount(idx, Number(e.target.value))}
                    className={`w-12 bg-transparent text-right font-medium ${tk.textSecondary} focus:outline-none`}
                  />
                  <span className={tk.textFaint}>kata</span>
                </div>

                <div className="flex items-center gap-1 border-l t-border pl-2">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveSection(idx, "up")}
                    className={`p-1 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${tk.navInactive}`}
                    title="Pindah ke atas"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === outline.sections.length - 1}
                    onClick={() => moveSection(idx, "down")}
                    className={`p-1 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${tk.navInactive}`}
                    title="Pindah ke bawah"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteSection(idx)}
                    className="p-1 rounded-md text-stone-500 hover:text-red-400 transition-colors"
                    title="Hapus section"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Key points tags */}
            {section.key_points && section.key_points.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pl-9">
                {section.key_points.map((pt, pIdx) => (
                  <span
                    key={pIdx}
                    className={`text-[11px] px-2 py-0.5 rounded-md border ${tk.monoBadge}`}
                  >
                    • {pt}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-4 border-t t-border">
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${tk.outlineBtn}`}
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali
        </button>

        <button
          type="button"
          disabled={isLoading || outline.sections.length === 0 || hasEmptyHeadings}
          onClick={() => onContinue({ ...outline, title }, title)}
          className={`t-accent-bg flex items-center gap-2 py-2 px-5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer`}
          title={hasEmptyHeadings ? "Ada judul subheading yang masih kosong" : undefined}
        >
          {isLoading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Memulai penulisan...</span>
            </>
          ) : hasEmptyHeadings ? (
            <span>Lengkapi Judul Subheading</span>
          ) : (
            <>
              <span>Lanjutkan Penulisan</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
