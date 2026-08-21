"use client";

import { Check, Zap, Sparkles, ShieldCheck, Flame, ArrowRight } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "Rp 149.000",
    period: "/bulan",
    credits: "15.000 kata",
    desc: "Cocok untuk blogger pemula dan website niche personal.",
    features: [
      "15.000 Kata AI Human-Grade",
      "SERP & Intent Analysis (Gemini 3.7)",
      "Multi-Pass Writing (Claude 4.6)",
      "Interactive Outline Editor",
      "Tiptap Editor & Export Markdown/HTML",
      "1 Brand Voice Profile",
    ],
    popular: false,
    cta: "Pilih Starter",
  },
  {
    name: "Pro Writer",
    price: "Rp 349.000",
    period: "/bulan",
    credits: "60.000 kata",
    desc: "Pilihan terbaik untuk affiliate marketer, agensi kecil, dan content creator.",
    features: [
      "60.000 Kata AI Human-Grade",
      "Prioritas Jalur Antrian 9Router",
      "SERP & Intent Analysis Mendalam",
      "Multi-Pass Writing (Claude 4.6)",
      "Real-time Live SEO Scoring (0-100)",
      "Unlimited Proyek & Brand Voice",
      "Auto Media & Image Placeholders",
    ],
    popular: true,
    cta: "Paket Aktif Saat Ini",
  },
  {
    name: "Agency & Business",
    price: "Rp 899.000",
    period: "/bulan",
    credits: "200.000 kata",
    desc: "Untuk agensi SEO dan media publisher skala besar dengan kebutuhan volume tinggi.",
    features: [
      "200.000 Kata AI Human-Grade",
      "Kecepatan Generasi Maksimal",
      "Akses API Backend & Webhook",
      "Multi-user Team Collaboration",
      "Custom Brand Voice Per Klien",
      "Dedicated Support 24/7",
    ],
    popular: false,
    cta: "Upgrade ke Agency",
  },
];

export default function BillingPage() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          Billing & Kredit Penulisan
        </h1>
        <p className="text-xs md:text-sm text-slate-400 max-w-lg mx-auto">
          Pilih paket berlangganan yang sesuai dengan kebutuhan volume artikel SEO dan tim Anda.
        </p>
      </div>

      {/* Current Credit Balance Card */}
      <div className="bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900/80 border border-indigo-500/30 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
            <Flame className="w-3.5 h-3.5" />
            <span>Saldo Kredit Aktif</span>
          </div>
          <div className="text-3xl font-black text-white">
            4.850 <span className="text-sm font-semibold text-slate-400">/ 5.000 Kata Tersedia</span>
          </div>
          <p className="text-xs text-slate-400">
            Paket <strong className="text-indigo-400 font-semibold">Pro Writer</strong> diperpanjang otomatis pada 21 September 2026.
          </p>
        </div>

        <button
          type="button"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-xs font-bold text-white shadow-xl shadow-indigo-600/30 transition-all active:scale-95 whitespace-nowrap"
        >
          Top Up Tambahan Kata
        </button>
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => (
          <div
            key={p.name}
            className={`rounded-3xl p-6 md:p-8 flex flex-col justify-between transition-all relative ${
              p.popular
                ? "bg-slate-900/90 border-2 border-indigo-500 shadow-2xl shadow-indigo-500/15"
                : "bg-slate-900/50 border border-slate-800 hover:border-slate-700"
            }`}
          >
            {p.popular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-[10px] font-bold text-white uppercase tracking-wider shadow-md">
                Paling Populer
              </div>
            )}

            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-white">{p.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{p.desc}</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-2xl md:text-3xl font-black text-white">{p.price}</span>
                <span className="text-xs text-slate-400">{p.period}</span>
              </div>

              <div className="py-2.5 px-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-semibold text-indigo-300 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>{p.credits}</span>
              </div>

              {/* Feature Checklist */}
              <div className="space-y-2.5 pt-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Fitur Unggulan:
                </div>
                {p.features.map((f, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-300">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6">
              <button
                type="button"
                disabled={p.popular}
                className={`w-full py-3 rounded-xl text-xs font-bold transition-all ${
                  p.popular
                    ? "bg-slate-800 text-slate-400 border border-slate-700 cursor-default"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20"
                }`}
              >
                {p.cta}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
