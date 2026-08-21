"use client";

import { useState } from "react";
import {
  Sparkles,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  Edit2,
  Check,
  Tag,
  HelpCircle,
  TrendingUp,
  FileText,
  ChevronRight,
  BookOpen,
  ArrowLeft,
} from "lucide-react";

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
  const [outline, setOutline] = useState<ArticleOutline>(initialOutline);
  const [title, setTitle] = useState(initialOutline.title || "");
  const [editingId, setEditingId] = useState<string | null>(null);

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
    setEditingId(newId);
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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-[11px] text-[#71717a]">
          <span className="text-white font-medium">Generator</span>
          <span>/</span>
          <span>Outline Review</span>
        </div>
        <h1 className="text-base font-semibold text-white">Review Kerangka Artikel</h1>
        <p className="text-xs text-[#71717a]">
          AI telah menyusun outline berdasarkan analisis SERP. Edit urutan atau konten sebelum memulai penulisan.
        </p>
      </div>

      {/* SERP Insights strip */}
      {serpData && (
        <div className="bg-[#121215] border border-[#27272a] rounded-lg px-5 py-3.5 grid grid-cols-3 gap-3 text-xs">
          <div>
            <div className="text-[10px] text-[#52525b] uppercase tracking-wider mb-0.5">Search Intent</div>
            <div className="text-[#d4d4d8] font-medium">{serpData.search_intent || "Informational"}</div>
          </div>
          <div>
            <div className="text-[10px] text-[#52525b] uppercase tracking-wider mb-0.5">LSI Keywords</div>
            <div className="text-[#d4d4d8] font-medium truncate">{serpData.lsi_keywords?.slice(0, 3).join(", ") || "Terpetakan"}</div>
          </div>
          <div>
            <div className="text-[10px] text-[#52525b] uppercase tracking-wider mb-0.5">Target Kata</div>
            <div className="text-[#d4d4d8] font-medium">{totalTargetWords} kata · {outline.sections.length} section</div>
          </div>
        </div>
      )}

      {/* Editable Title */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-medium text-[#a1a1aa] uppercase tracking-wider">
          Judul Artikel
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-[#121215] border border-[#27272a] focus:border-[#3f3f46] rounded-md px-4 py-2.5 text-sm font-semibold text-white focus:outline-none transition-colors"
        />
      </div>

      {/* Section List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-medium text-[#a1a1aa] uppercase tracking-wider">
            Struktur Heading ({outline.sections.length})
          </h3>
          <button
            type="button"
            onClick={addH2Section}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#1e1e21] hover:bg-[#27272a] border border-[#27272a] text-[#a1a1aa] hover:text-white text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Tambah H2
          </button>
        </div>

        {outline.sections.map((section, idx) => (
          <div
            key={section.id || idx}
            className="bg-[#121215] border border-[#27272a] hover:border-[#3f3f46] rounded-lg p-4 transition-colors space-y-3 group"
          >
            <div className="flex items-center justify-between gap-3">
              {/* Level & Heading */}
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono text-[11px] font-bold shrink-0">
                  {section.level.toUpperCase()}
                </span>

                <input
                  type="text"
                  value={section.heading}
                  onChange={(e) => updateSectionHeading(idx, e.target.value)}
                  className="flex-1 bg-transparent border-b border-transparent focus:border-indigo-500 text-sm font-semibold text-slate-100 focus:outline-none px-1 py-0.5 transition-colors"
                />
              </div>

              {/* Word count target + Reordering & Delete Controls */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1 text-xs text-slate-400 bg-slate-950/60 px-2 py-1 rounded-lg border border-slate-800">
                  <input
                    type="number"
                    min={100}
                    max={1500}
                    step={50}
                    value={section.target_word_count}
                    onChange={(e) => updateSectionWordCount(idx, Number(e.target.value))}
                    className="w-12 bg-transparent text-right font-medium text-slate-200 focus:outline-none"
                  />
                  <span>kata</span>
                </div>

                <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveSection(idx, "up")}
                    className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Pindah ke atas"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === outline.sections.length - 1}
                    onClick={() => moveSection(idx, "down")}
                    className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Pindah ke bawah"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteSection(idx)}
                    className="p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
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
                    className="text-[11px] bg-slate-950/80 text-slate-400 px-2 py-0.5 rounded-md border border-slate-800/80"
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
      <div className="flex items-center justify-between pt-4 border-t border-[#27272a]">
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="px-3.5 py-2 rounded-md border border-[#27272a] text-xs font-medium text-[#71717a] hover:text-white hover:border-[#3f3f46] transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali
        </button>

        <button
          type="button"
          disabled={isLoading || outline.sections.length === 0}
          onClick={() => onContinue({ ...outline, title }, title)}
          className="flex items-center gap-2 py-2 px-5 rounded-md bg-white hover:bg-[#f4f4f5] disabled:bg-[#27272a] disabled:text-[#52525b] text-black text-xs font-semibold transition-colors disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-[#52525b] border-t-[#a1a1aa] rounded-full animate-spin" />
              <span className="text-[#a1a1aa]">Memulai penulisan...</span>
            </>
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
