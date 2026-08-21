"use client";

import { useState } from "react";
import { Globe, Sliders, Type, Plus, X, Search, ChevronDown, ArrowRight } from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface StepInputProps {
  onSubmit: (formData: any) => void;
  isLoading: boolean;
}

const TONES = [
  { value: "authoritative", label: "Authoritative" },
  { value: "conversational", label: "Conversational" },
  { value: "informative",   label: "Informatif" },
  { value: "persuasive",    label: "Persuasif" },
  { value: "storytelling",  label: "Storytelling" },
  { value: "academic",      label: "Akademik" },
];

const LENGTHS = [
  { value: 1000, label: "1.000" },
  { value: 1500, label: "1.500" },
  { value: 2000, label: "2.000" },
  { value: 3000, label: "3.000" },
];

export function StepInput({ onSubmit, isLoading }: StepInputProps) {
  const [keyword, setKeyword] = useState("");
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("id");
  const [tone, setTone] = useState("authoritative");
  const [targetLength, setTargetLength] = useState(2000);
  const [secondaryKeywords, setSecondaryKeywords] = useState<string[]>([]);
  const [newKeywordInput, setNewKeywordInput] = useState("");
  const [brandVoice, setBrandVoice] = useState("");

  const handleAddSecondary = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (("key" in e && e.key !== "Enter") && e.type !== "click") return;
    e.preventDefault();
    const kw = newKeywordInput.trim();
    if (kw && !secondaryKeywords.includes(kw)) {
      setSecondaryKeywords([...secondaryKeywords, kw]);
      setNewKeywordInput("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    onSubmit({
      target_keyword: keyword.trim(),
      title: title.trim() || undefined,
      language,
      tone,
      target_length: Number(targetLength),
      secondary_keywords: secondaryKeywords,
      brand_voice_instructions: brandVoice.trim() || undefined,
      competitor_urls: [],
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page header */}
      <div className="space-y-1">
        <h1 className="text-base font-semibold text-white">Generator Artikel</h1>
        <p className="text-xs text-[#71717a]">
          Isi detail artikel lalu AI akan menganalisis SERP, membuat outline, dan menulis kontennya.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 text-[11px]">
        <div className="flex items-center gap-1.5 text-white font-medium">
          <span className="w-4 h-4 rounded-full bg-white text-black text-[9px] font-bold flex items-center justify-center">1</span>
          Konfigurasi
        </div>
        <ChevronDown className="w-3 h-3 text-[#3f3f46] rotate-[-90deg]" />
        <span className="text-[#52525b]">Outline</span>
        <ChevronDown className="w-3 h-3 text-[#3f3f46] rotate-[-90deg]" />
        <span className="text-[#52525b]">Penulisan</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Target Keyword — primary, most prominent */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-medium text-[#a1a1aa] uppercase tracking-wider">
            Target Keyword Utama <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-[#52525b] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="contoh: cara riset keyword seo untuk pemula"
              className="w-full bg-[#121215] border border-[#27272a] focus:border-[#3f3f46] rounded-md pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-[#3f3f46] focus:outline-none transition-colors"
            />
          </div>
          <p className="text-[11px] text-[#52525b]">Keyword yang ingin mendominasi halaman 1 Google.</p>
        </div>

        {/* Custom Title */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-medium text-[#a1a1aa] uppercase tracking-wider">
            Judul Artikel <span className="text-[#3f3f46] font-normal normal-case">— Opsional, dibuatkan otomatis jika kosong</span>
          </label>
          <div className="relative">
            <Type className="w-4 h-4 text-[#52525b] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Biarkan kosong untuk judul otomatis yang click-worthy"
              className="w-full bg-[#121215] border border-[#27272a] focus:border-[#3f3f46] rounded-md pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-[#3f3f46] focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Language + Tone — 2 col */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium text-[#a1a1aa] uppercase tracking-wider">
              Bahasa
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-[#52525b] absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-[#121215] border border-[#27272a] focus:border-[#3f3f46] rounded-md pl-9 pr-3 py-2.5 text-sm text-[#d4d4d8] focus:outline-none appearance-none cursor-pointer transition-colors"
              >
                <option value="id">Indonesia</option>
                <option value="en">English</option>
                <option value="ms">Melayu</option>
                <option value="es">Español</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium text-[#a1a1aa] uppercase tracking-wider">
              Tone of Voice
            </label>
            <div className="relative">
              <Sliders className="w-4 h-4 text-[#52525b] absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-[#121215] border border-[#27272a] focus:border-[#3f3f46] rounded-md pl-9 pr-3 py-2.5 text-sm text-[#d4d4d8] focus:outline-none appearance-none cursor-pointer transition-colors"
              >
                {TONES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Target Length */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-medium text-[#a1a1aa] uppercase tracking-wider">
            Target Panjang Artikel
          </label>
          <div className="flex gap-2">
            {LENGTHS.map((l) => (
              <button
                key={l.value}
                type="button"
                onClick={() => setTargetLength(l.value)}
                className={`flex-1 py-2 rounded-md text-xs font-medium border transition-colors ${
                  targetLength === l.value
                    ? "bg-[#1e1e21] border-[#3f3f46] text-white"
                    : "bg-[#121215] border-[#27272a] text-[#71717a] hover:border-[#3f3f46] hover:text-[#a1a1aa]"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-[#52525b]">~{formatNumber(targetLength)} kata target output akhir.</p>
        </div>

        {/* Secondary Keywords */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-medium text-[#a1a1aa] uppercase tracking-wider">
            Secondary & LSI Keywords <span className="text-[#3f3f46] font-normal normal-case">— Opsional</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newKeywordInput}
              onChange={(e) => setNewKeywordInput(e.target.value)}
              onKeyDown={handleAddSecondary}
              placeholder="Ketik lalu tekan Enter untuk menambah..."
              className="flex-1 bg-[#121215] border border-[#27272a] focus:border-[#3f3f46] rounded-md px-3 py-2 text-xs text-white placeholder:text-[#3f3f46] focus:outline-none transition-colors"
            />
            <button
              type="button"
              onClick={handleAddSecondary}
              className="px-3 py-2 bg-[#1e1e21] hover:bg-[#27272a] border border-[#27272a] text-[#a1a1aa] hover:text-white rounded-md text-xs font-medium transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah
            </button>
          </div>
          {secondaryKeywords.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {secondaryKeywords.map((kw) => (
                <span
                  key={kw}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#1e1e21] border border-[#27272a] text-[11px] text-[#a1a1aa] font-mono"
                >
                  {kw}
                  <button
                    type="button"
                    onClick={() => setSecondaryKeywords(secondaryKeywords.filter((k) => k !== kw))}
                    className="hover:text-red-400 transition-colors ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Brand Voice */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-medium text-[#a1a1aa] uppercase tracking-wider">
            Instruksi Tambahan / Brand Voice <span className="text-[#3f3f46] font-normal normal-case">— Opsional</span>
          </label>
          <textarea
            rows={2}
            value={brandVoice}
            onChange={(e) => setBrandVoice(e.target.value)}
            placeholder="Contoh: Sebutkan brand kami, hindari kata klise AI, gunakan contoh dari tools lokal..."
            className="w-full bg-[#121215] border border-[#27272a] focus:border-[#3f3f46] rounded-md p-3 text-xs text-white placeholder:text-[#3f3f46] focus:outline-none resize-none transition-colors"
          />
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading || !keyword.trim()}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-6 rounded-md bg-white hover:bg-[#f4f4f5] disabled:bg-[#27272a] disabled:text-[#52525b] text-black text-sm font-semibold transition-colors disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-[#52525b] border-t-[#a1a1aa] rounded-full animate-spin" />
                <span className="text-[#a1a1aa]">Menganalisis SERP & membuat outline...</span>
              </>
            ) : (
              <>
                <span>Analisis SERP & Buat Outline</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
