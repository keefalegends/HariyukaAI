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
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <Check className="w-3.5 h-3.5" />
          <span>Langkah 2: Review & Kustomisasi Kerangka Outline (Gemini 3.7)</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
          Struktur Artikel Siap Ditinjau
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          AI telah menyusun outline berdasarkan analisis kompetitor SERP. Anda dapat mengubah urutan, menambah subheading, atau mengedit target kata sebelum proses penulisan.
        </p>
      </div>

      {/* SERP Insights Pill Strip */}
      {serpData && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="text-slate-500 text-[10px] font-semibold uppercase">Search Intent</div>
              <div className="text-slate-200 font-semibold">{serpData.search_intent || "Informational"}</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <div className="text-slate-500 text-[10px] font-semibold uppercase">LSI Keywords Terdeteksi</div>
              <div className="text-slate-200 font-medium truncate max-w-[200px]">
                {serpData.lsi_keywords?.slice(0, 3).join(", ") || "Terpetakan"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="text-slate-500 text-[10px] font-semibold uppercase">Total Target Kata</div>
              <div className="text-slate-200 font-semibold">{totalTargetWords} Kata ({outline.sections.length} Section)</div>
            </div>
          </div>
        </div>
      )}

      {/* Editable Title Section */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-2">
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Judul Artikel SEO (Dapat Diedit)
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-base font-bold text-white focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Outline Section List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            Daftar Heading & Subheading ({outline.sections.length})
          </h3>
          <button
            type="button"
            onClick={addH2Section}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Tambah Subheading H2
          </button>
        </div>

        {outline.sections.map((section, idx) => (
          <div
            key={section.id || idx}
            className="bg-slate-900/70 border border-slate-800/90 hover:border-slate-700 rounded-xl p-4 transition-all space-y-3 group"
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
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-all flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali
        </button>

        <button
          type="button"
          disabled={isLoading || outline.sections.length === 0}
          onClick={() => onContinue({ ...outline, title }, title)}
          className="py-3.5 px-8 rounded-xl bg-gradient-to-r from-emerald-600 via-indigo-600 to-purple-600 hover:from-emerald-500 hover:to-purple-500 text-sm font-bold text-white shadow-xl shadow-indigo-500/25 flex items-center gap-2.5 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Memulai Penulisan Section via Claude 4.6...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Lanjutkan Penulisan Artikel (Claude 4.6)</span>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
