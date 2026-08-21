"use client";

import { useState } from "react";
import { Globe, Sliders, Type, Plus, X, Search, ChevronDown, ArrowRight } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { useTokens } from "@/lib/use-tokens";

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
const LENGTHS = [1000, 1500, 2000, 3000];

export function StepInput({ onSubmit, isLoading }: StepInputProps) {
  const tk = useTokens();
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
      target_keyword: keyword.trim(), title: title.trim() || undefined,
      language, tone, target_length: Number(targetLength),
      secondary_keywords: secondaryKeywords,
      brand_voice_instructions: brandVoice.trim() || undefined,
      competitor_urls: [],
    });
  };

  const labelClass = `text-[11px] font-semibold uppercase tracking-wider ${tk.textFaint}`;
  const inputShared = "t-input border rounded-lg py-2.5 text-sm t-border-focus transition-colors";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page header */}
      <div className="space-y-1">
        <h1 className={`text-base font-semibold ${tk.textPrimary}`}>Generator Artikel</h1>
        <p className={`text-xs ${tk.textMuted}`}>
          Isi detail artikel lalu AI akan menganalisis SERP, membuat outline, dan menulis kontennya.
        </p>
      </div>

      {/* Breadcrumb steps */}
      <div className="flex items-center gap-2 text-[11px]">
        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold t-accent-bg`}>1</span>
        <span className={`font-medium ${tk.textPrimary}`}>Konfigurasi</span>
        <ChevronDown className={`w-3 h-3 rotate-[-90deg] ${tk.textFaint}`} />
        <span className={tk.textMuted}>Outline</span>
        <ChevronDown className={`w-3 h-3 rotate-[-90deg] ${tk.textFaint}`} />
        <span className={tk.textMuted}>Penulisan</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Primary Keyword */}
        <div className="space-y-1.5">
          <label className={labelClass}>Target Keyword Utama <span className="text-red-500">*</span></label>
          <div className="relative">
            <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${tk.textFaint}`} />
            <input
              type="text" required value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="contoh: cara riset keyword seo untuk pemula"
              className={`w-full ${inputShared} pl-9 pr-4`}
            />
          </div>
          <p className={`text-[11px] ${tk.textFaint}`}>Keyword yang ingin mendominasi halaman 1 Google.</p>
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <label className={labelClass}>
            Judul Artikel <span className={`font-normal normal-case ${tk.textFaint}`}>— Opsional</span>
          </label>
          <div className="relative">
            <Type className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${tk.textFaint}`} />
            <input
              type="text" value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Biarkan kosong untuk judul otomatis yang click-worthy"
              className={`w-full ${inputShared} pl-9 pr-4`}
            />
          </div>
        </div>

        {/* Language + Tone */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Bahasa", icon: Globe, value: language, onChange: setLanguage, options: [{v:"id",l:"Indonesia"},{v:"en",l:"English"},{v:"ms",l:"Melayu"},{v:"es",l:"Español"}] },
            { label: "Tone of Voice", icon: Sliders, value: tone, onChange: setTone, options: TONES.map(t => ({v:t.value,l:t.label})) },
          ].map((field) => (
            <div key={field.label} className="space-y-1.5">
              <label className={labelClass}>{field.label}</label>
              <div className="relative">
                <field.icon className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${tk.textFaint}`} />
                <select
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  className={`w-full ${inputShared} pl-9 pr-3 appearance-none cursor-pointer`}
                >
                  {field.options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>

        {/* Length selector */}
        <div className="space-y-1.5">
          <label className={labelClass}>Target Panjang Artikel</label>
          <div className="flex gap-2">
            {LENGTHS.map((l) => (
              <button
                key={l} type="button"
                onClick={() => setTargetLength(l)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${targetLength === l ? tk.lenActive : tk.lenInactive}`}
              >
                {l.toLocaleString("id-ID")}
              </button>
            ))}
          </div>
          <p className={`text-[11px] ${tk.textFaint}`}>~{formatNumber(targetLength)} kata target output akhir.</p>
        </div>

        {/* Secondary keywords */}
        <div className="space-y-1.5">
          <label className={labelClass}>
            Secondary & LSI Keywords <span className={`font-normal normal-case ${tk.textFaint}`}>— Opsional</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text" value={newKeywordInput}
              onChange={(e) => setNewKeywordInput(e.target.value)}
              onKeyDown={handleAddSecondary}
              placeholder="Ketik lalu tekan Enter..."
              className={`flex-1 t-input border rounded-lg px-3 py-2 text-xs t-border-focus transition-colors`}
            />
            <button
              type="button" onClick={handleAddSecondary}
              className={`px-3 py-2 border rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${tk.outlineBtn}`}
            >
              <Plus className="w-3.5 h-3.5" /> Tambah
            </button>
          </div>
          {secondaryKeywords.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {secondaryKeywords.map((kw) => (
                <span key={kw} className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-[11px] font-mono ${tk.monoBadge}`}>
                  {kw}
                  <button type="button" onClick={() => setSecondaryKeywords(secondaryKeywords.filter((k) => k !== kw))} className="hover:text-red-400 transition-colors ml-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Brand voice */}
        <div className="space-y-1.5">
          <label className={labelClass}>
            Instruksi / Brand Voice <span className={`font-normal normal-case ${tk.textFaint}`}>— Opsional</span>
          </label>
          <textarea
            rows={2} value={brandVoice}
            onChange={(e) => setBrandVoice(e.target.value)}
            placeholder="Contoh: Sebutkan brand kami, hindari kata klise AI, gunakan contoh dari tools lokal..."
            className={`w-full t-input border rounded-lg p-3 text-xs t-border-focus resize-none transition-colors`}
          />
        </div>

        {/* CTA */}
        <div className="pt-1">
          <button
            type="submit"
            disabled={isLoading || !keyword.trim()}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-6 rounded-lg text-sm font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 t-accent-bg`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Menganalisis SERP & membuat outline...</span>
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
