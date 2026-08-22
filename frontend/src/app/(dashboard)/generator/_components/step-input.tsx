"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Globe,
  Sliders,
  Type,
  Plus,
  X,
  Search,
  ChevronDown,
  ArrowRight,
  Link2,
  Sparkles,
  ShoppingBag,
  FileText,
  BookmarkCheck,
  ShieldCheck,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { useTokens } from "@/lib/use-tokens";

interface StepInputProps {
  onSubmit: (formData: any) => void;
  isLoading: boolean;
}

const ARTICLE_TYPES = [
  {
    id: "backlink_article",
    name: "Backlink Artikel",
    badge: "500 – 599 kata",
    desc: "Mendorong ranking artikel utama dengan fokus keyphrase kuat & 2 tautan kontekstual.",
    icon: Link2,
    words: 550,
  },
  {
    id: "backlink_product",
    name: "Backlink Produk",
    badge: "500 – 599 kata",
    desc: "Mendorong artikel produk perusahaan dengan soft-selling natural & link brand.",
    icon: ShoppingBag,
    words: 550,
  },
  {
    id: "pillar",
    name: "Artikel Utama (Pillar)",
    badge: "1.500 – 1.599 kata",
    desc: "Artikel pilar mendalam, komprehensif, multi-heading H2/H3 untuk dominasi SERP.",
    icon: FileText,
    words: 1550,
  },
];

const TONES = [
  { value: "authoritative", label: "Authoritative (Ahli)" },
  { value: "conversational", label: "Conversational (Santai)" },
  { value: "informative",   label: "Informatif" },
  { value: "persuasive",    label: "Persuasif" },
  { value: "storytelling",  label: "Storytelling" },
  { value: "academic",      label: "Akademik" },
];

export function StepInput({ onSubmit, isLoading }: StepInputProps) {
  const tk = useTokens();
  const searchParams = useSearchParams();

  const [articleType, setArticleType] = useState<"pillar" | "backlink_article" | "backlink_product">("backlink_article");
  const [keyword, setKeyword] = useState("");
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("id");
  const [tone, setTone] = useState("authoritative");
  const [targetLength, setTargetLength] = useState(550);
  const [secondaryKeywords, setSecondaryKeywords] = useState<string[]>([]);
  const [newKeywordInput, setNewKeywordInput] = useState("");
  const [brandVoice, setBrandVoice] = useState("");

  // Salna Backlink SOP Link injection states
  const [showLinkSettings, setShowLinkSettings] = useState(false);
  const [humanizeWriting, setHumanizeWriting] = useState(true);
  const [includeImagePlaceholder, setIncludeImagePlaceholder] = useState(false);
  const [link1Url, setLink1Url] = useState("");
  const [link1Anchor, setLink1Anchor] = useState("");
  const [link2Url, setLink2Url] = useState("");
  const [link2Anchor, setLink2Anchor] = useState("");
  const [productName, setProductName] = useState("");
  const [productPromoContext, setProductPromoContext] = useState("");

  useEffect(() => {
    const kwParam = searchParams.get("keyword");
    if (kwParam) {
      setKeyword(kwParam);
    }
  }, [searchParams]);

  const handleSelectArticleType = (type: "pillar" | "backlink_article" | "backlink_product") => {
    setArticleType(type);
    if (type === "pillar") {
      setTargetLength(1550);
    } else {
      setTargetLength(550);
    }
    if (type === "backlink_product" || type === "backlink_article") {
      setShowLinkSettings(true);
    }
  };

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
      article_type: articleType,
      language,
      tone,
      target_length: Number(targetLength),
      secondary_keywords: secondaryKeywords,
      brand_voice_instructions: brandVoice.trim() || undefined,
      competitor_urls: [],
      humanize_writing: humanizeWriting,
      include_image_placeholder: includeImagePlaceholder,
      target_link_1_url: link1Url.trim() || undefined,
      target_link_1_anchor: link1Anchor.trim() || undefined,
      target_link_2_url: link2Url.trim() || undefined,
      target_link_2_anchor: link2Anchor.trim() || undefined,
      product_name: productName.trim() || undefined,
      product_promotion_context: productPromoContext.trim() || undefined,
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
          Pilih tipe artikel sesuai SOP, isi target keyword, lalu AI akan menyusun outline dan menulis konten standar Yoast WordPress.
        </p>
      </div>

      {/* Breadcrumb steps */}
      <div className="flex items-center gap-2 text-[11px]">
        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold t-accent-bg`}>1</span>
        <span className={`font-medium ${tk.textPrimary}`}>Konfigurasi SOP</span>
        <ChevronDown className={`w-3 h-3 rotate-[-90deg] ${tk.textFaint}`} />
        <span className={tk.textMuted}>Outline H2/H3</span>
        <ChevronDown className={`w-3 h-3 rotate-[-90deg] ${tk.textFaint}`} />
        <span className={tk.textMuted}>Penulisan & SEO</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ─── 1. PILIH TIPE ARTIKEL (SOP SALNA) ─── */}
        <div className="space-y-2">
          <label className={labelClass}>Tipe Artikel (SOP Salna)</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {ARTICLE_TYPES.map((t) => {
              const isSelected = articleType === t.id;
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleSelectArticleType(t.id as any)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                    isSelected
                      ? "border-[#d97757] bg-[#d97757]/10 shadow-sm"
                      : "t-card border t-border hover:border-[#78716c]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`p-1.5 rounded-lg ${isSelected ? "bg-[#d97757] text-white" : "t-bg-tag text-stone-400"}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border ${
                      isSelected ? "border-[#d97757] text-[#d97757] bg-[#d97757]/20" : tk.monoBadge
                    }`}>
                      {t.badge}
                    </span>
                  </div>

                  <div>
                    <div className={`text-xs font-bold ${isSelected ? tk.textPrimary : tk.textSecondary}`}>
                      {t.name}
                    </div>
                    <p className={`text-[10px] mt-0.5 ${tk.textMuted} leading-tight line-clamp-2`}>
                      {t.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── 2. TARGET KEYWORD UTAMA ─── */}
        <div className="space-y-1.5">
          <label className={labelClass}>Focus Keyphrase Utama <span className="text-red-500">*</span></label>
          <div className="relative">
            <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${tk.textFaint}`} />
            <input
              type="text" required value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="contoh: pentingnya cooker hood di dapur"
              className={`w-full ${inputShared} pl-9 pr-4`}
            />
          </div>
          <p className={`text-[11px] ${tk.textFaint}`}>
            Kata kunci ini akan otomatis disebar 5–7 kali secara natural (pembuka, 3 subheadings, alt gambar & kesimpulan).
          </p>
        </div>

        {/* ─── 3. JUDUL ARTIKEL (OPSIONAL) ─── */}
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

        {/* ─── 4. PENGATURAN LINK & PROMOSI PRODUK (ACCORDION) ─── */}
        <div className="border t-border rounded-xl overflow-hidden t-bg-tag">
          <button
            type="button"
            onClick={() => setShowLinkSettings(!showLinkSettings)}
            className="w-full flex items-center justify-between p-3.5 text-xs font-semibold t-text-primary hover:bg-[#d97757]/5 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Link2 className={`w-4 h-4 ${tk.accentText}`} />
              <span>Pengaturan Link & Promosi Produk (SOP Backlink)</span>
              {(link1Url || link2Url || productName) && (
                <span className="w-2 h-2 rounded-full bg-[#d97757]" />
              )}
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${showLinkSettings ? "rotate-180" : ""}`} />
          </button>

          {showLinkSettings && (
            <div className="p-4 pt-1 space-y-4 border-t t-border bg-black/10">
              {/* Product Push fields (if backlink_product or custom) */}
              {articleType === "backlink_product" && (
                <div className="p-3 rounded-lg border border-[#d97757]/30 bg-[#d97757]/5 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#d97757]">
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Detail Produk untuk Promosi Halus</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="Nama Produk (contoh: Rumah Mesin / RisupKitchen)"
                      className={`w-full ${inputShared} px-3 py-2 text-xs`}
                    />
                    <input
                      type="text"
                      value={productPromoContext}
                      onChange={(e) => setProductPromoContext(e.target.value)}
                      placeholder="Kelebihan produk (contoh: daya hisap kuat & filter mudah dicuci)"
                      className={`w-full ${inputShared} px-3 py-2 text-xs`}
                    />
                  </div>
                </div>
              )}

              {/* Link 1: Contextual Link */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-stone-300">
                    Link 1: Tautan Kontekstual (Paragraf Pembuka/Body)
                  </label>
                  <span className="text-[10px] text-stone-500">Opsional</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="url"
                    value={link1Url}
                    onChange={(e) => setLink1Url(e.target.value)}
                    placeholder="URL Target (contoh: https://domain.com/blog/...)"
                    className={`w-full ${inputShared} px-3 py-2 text-xs font-mono`}
                  />
                  <input
                    type="text"
                    value={link1Anchor}
                    onChange={(e) => setLink1Anchor(e.target.value)}
                    placeholder="Anchor Text (contoh: macam macam cooker hood)"
                    className={`w-full ${inputShared} px-3 py-2 text-xs`}
                  />
                </div>
              </div>

              {/* Link 2: Brand / Product Link */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-stone-300">
                    Link 2: Tautan Brand / Homepage (Paragraf Kesimpulan)
                  </label>
                  <span className="text-[10px] text-stone-500">Opsional</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="url"
                    value={link2Url}
                    onChange={(e) => setLink2Url(e.target.value)}
                    placeholder="URL Brand (contoh: https://domain.com/)"
                    className={`w-full ${inputShared} px-3 py-2 text-xs font-mono`}
                  />
                  <input
                    type="text"
                    value={link2Anchor}
                    onChange={(e) => setLink2Anchor(e.target.value)}
                    placeholder="Anchor Text (contoh: RisupKitchen)"
                    className={`w-full ${inputShared} px-3 py-2 text-xs`}
                  />
                </div>
              </div>

              {/* Image Caption Option Toggle */}
              <div className="pt-2.5 border-t t-border">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeImagePlaceholder}
                    onChange={(e) => setIncludeImagePlaceholder(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-stone-700 text-[#d97757] focus:ring-[#d97757] accent-[#d97757] cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-semibold text-stone-300">
                      Sertakan Placeholder Gambar WordPress (`[caption]`)
                    </span>
                    <p className="text-[10px] text-stone-500 mt-0.5">
                      Default tidak dicentang (Fokus teks murni 500-599 kata, gambar dapat ditambahkan sendiri saat posting ke WordPress).
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* ─── 5. HUMANIZE WRITING (ANTI-AI DETECTOR MODE) ─── */}
        <div
          onClick={() => setHumanizeWriting(!humanizeWriting)}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
            humanizeWriting
              ? "bg-[#d97757]/10 border-[#d97757]/60 shadow-sm shadow-[#d97757]/5"
              : "t-bg-tag t-border hover:border-stone-600"
          }`}
        >
          <div className="pt-0.5">
            <input
              type="checkbox"
              checked={humanizeWriting}
              onChange={(e) => setHumanizeWriting(e.target.checked)}
              className="w-4 h-4 rounded border-stone-700 text-[#d97757] focus:ring-[#d97757] accent-[#d97757] cursor-pointer"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <ShieldCheck className={`w-4 h-4 ${humanizeWriting ? "text-[#d97757]" : "text-stone-400"}`} />
              <span className={`text-xs font-bold ${humanizeWriting ? "text-[#d97757]" : "t-text-primary"}`}>
                Humanize Writing (Bypass AI Detector Mode)
              </span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                humanizeWriting ? "bg-[#d97757]/20 text-[#d97757] border border-[#d97757]/30" : "bg-stone-800 text-stone-400"
              }`}>
                Target Skor AI &lt; 30%
              </span>
            </div>
            <p className={`text-[11px] mt-1 ${tk.textMuted} leading-relaxed`}>
              Mengoptimasi variasi ritme kalimat (<em>sentence burstiness</em>), membuang frasa klise robotik, dan meniru gaya bercerita penutur asli untuk lolos detektor AI.
            </p>
          </div>
        </div>

        {/* ─── 6. BAHASA & TONE ─── */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Bahasa", icon: Globe, value: language, onChange: setLanguage, options: [{v:"id",l:"Indonesia"},{v:"en",l:"English"},{v:"ms",l:"Melayu"}] },
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

        {/* ─── 6. SECONDARY KEYWORDS ─── */}
        <div className="space-y-1.5">
          <label className={labelClass}>
            Secondary & LSI Keywords <span className={`font-normal normal-case ${tk.textFaint}`}>— Opsional</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text" value={newKeywordInput}
              onChange={(e) => setNewKeywordInput(e.target.value)}
              onKeyDown={handleAddSecondary}
              placeholder="Ketik keyword lalu tekan Enter..."
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

        {/* ─── 7. BRAND VOICE ─── */}
        <div className="space-y-1.5">
          <label className={labelClass}>
            Instruksi Khusus / Brand Voice <span className={`font-normal normal-case ${tk.textFaint}`}>— Opsional</span>
          </label>
          <textarea
            rows={2} value={brandVoice}
            onChange={(e) => setBrandVoice(e.target.value)}
            placeholder="Contoh: Hindari kata klise AI, gunakan analogi sehari-hari yang dekat dengan dapur Indonesia..."
            className={`w-full t-input border rounded-lg p-3 text-xs t-border-focus resize-none transition-colors`}
          />
        </div>

        {/* ─── CTA BUTTON ─── */}
        <div className="pt-1">
          <button
            type="submit"
            disabled={isLoading || !keyword.trim()}
            className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-xs uppercase tracking-wider font-bold transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 t-accent-bg shadow-sm active:scale-[0.99]`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Menganalisis SERP & Menyiapkan Outline H2/H3...</span>
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
