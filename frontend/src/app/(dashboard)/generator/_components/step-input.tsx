"use client";

import { useState } from "react";
import { Sparkles, Globe, Sliders, Type, BookOpen, Layers, Plus, X, Search } from "lucide-react";

interface StepInputProps {
  onSubmit: (formData: any) => void;
  isLoading: boolean;
}

export function StepInput({ onSubmit, isLoading }: StepInputProps) {
  const [keyword, setKeyword] = useState("");
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("id");
  const [tone, setTone] = useState("authoritative");
  const [targetLength, setTargetLength] = useState(2000);
  const [secondaryKeywords, setSecondaryKeywords] = useState<string[]>([]);
  const [newKeywordInput, setNewKeywordInput] = useState("");
  const [brandVoice, setBrandVoice] = useState("");
  const [competitorUrl, setCompetitorUrl] = useState("");

  const handleAddSecondary = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (("key" in e && e.key === "Enter") || e.type === "click") {
      e.preventDefault();
      if (newKeywordInput.trim() && !secondaryKeywords.includes(newKeywordInput.trim())) {
        setSecondaryKeywords([...secondaryKeywords, newKeywordInput.trim()]);
        setNewKeywordInput("");
      }
    }
  };

  const handleRemoveSecondary = (kw: string) => {
    setSecondaryKeywords(secondaryKeywords.filter((k) => k !== kw));
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
      competitor_urls: competitorUrl.trim() ? [competitorUrl.trim()] : [],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl mx-auto">
      {/* Header Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Langkah 1: Konfigurasi Target & Kata Kunci</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
          Buat Artikel SEO Human-Grade
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Mesin AI multi-agent kami akan menganalisis SERP Google, intent pembaca, dan membuat outline terstruktur sebelum menulis.
        </p>
      </div>

      {/* Main Form Card */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl backdrop-blur-sm">
        {/* Target Primary Keyword */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Target Keyword Utama <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <Search className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Contoh: cara riset keyword seo pemula 2026"
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
            />
          </div>
          <p className="mt-1.5 text-[11px] text-slate-500">
            Keyword utama yang ingin Anda kuasai di peringkat 1 Google.
          </p>
        </div>

        {/* Custom Title (Optional) */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Judul Artikel Khusus (Opsional)
          </label>
          <div className="relative">
            <Type className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Kosongkan jika ingin dibuatkan judul otomatis yang click-worthy oleh AI"
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* 2-Column Selectors: Language & Tone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Bahasa Konten
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-8 py-2.5 text-xs font-medium text-white focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
              >
                <option value="id">Bahasa Indonesia (ID)</option>
                <option value="en">English (US/UK)</option>
                <option value="ms">Bahasa Melayu (MY)</option>
                <option value="es">Español (ES)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Tone of Voice (Gaya Bahasa)
            </label>
            <div className="relative">
              <Sliders className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-8 py-2.5 text-xs font-medium text-white focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
              >
                <option value="authoritative">Authoritative & Pakar (Paling Direkomendasikan)</option>
                <option value="conversational">Santai & Mengalir (Conversational)</option>
                <option value="informative">Informatif & Ringkas</option>
                <option value="persuasive">Persuasif & Menjual (Copywriting)</option>
                <option value="storytelling">Storytelling & Studi Kasus</option>
                <option value="academic">Akademik & Formal</option>
              </select>
            </div>
          </div>
        </div>

        {/* Target Word Count Length */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Target Panjang Artikel
            </label>
            <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
              ~{targetLength.toLocaleString()} Kata
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[1000, 1500, 2000, 3000].map((len) => (
              <button
                key={len}
                type="button"
                onClick={() => setTargetLength(len)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  targetLength === len
                    ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-sm"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                {len.toLocaleString()} kata
              </button>
            ))}
          </div>
        </div>

        {/* Secondary LSI Keywords Tags */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Secondary & LSI Keywords (Opsional)
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newKeywordInput}
              onChange={(e) => setNewKeywordInput(e.target.value)}
              onKeyDown={handleAddSecondary}
              placeholder="Ketik keyword turunan lalu tekan Enter..."
              className="flex-1 bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={handleAddSecondary}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-xl border border-slate-700 transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah
            </button>
          </div>

          {secondaryKeywords.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {secondaryKeywords.map((kw) => (
                <span
                  key={kw}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-slate-800 border border-slate-700 text-slate-300"
                >
                  {kw}
                  <button
                    type="button"
                    onClick={() => handleRemoveSecondary(kw)}
                    className="hover:text-rose-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Brand Voice or Custom Instructions */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Instruksi Khusus / Brand Voice (Opsional)
          </label>
          <textarea
            rows={2}
            value={brandVoice}
            onChange={(e) => setBrandVoice(e.target.value)}
            placeholder="Contoh: Sebutkan brand kami 'Hariyuka', hindari kata klise, beri contoh praktis tools lokal..."
            className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl p-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-all resize-none"
          />
        </div>
      </div>

      {/* Action CTA Button */}
      <div className="flex justify-center">
        <button
          type="submit"
          disabled={isLoading || !keyword.trim()}
          className="w-full md:w-auto min-w-[320px] py-3.5 px-8 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-sm font-bold text-white shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2.5 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Menganalisis SERP & Membuat Outline...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Analisis SERP & Buat Kerangka Outline</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
