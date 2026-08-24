"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Search,
  Bot,
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Copy,
  Trash2,
  Sparkles,
  Loader2,
  ArrowRight,
  RefreshCw,
  History,
  Clock,
  Eye,
} from "lucide-react";
import { useTokens } from "@/lib/use-tokens";
import { logTerminal } from "@/lib/terminal-bus";
import { getApiUrl } from "@/lib/api-config";

interface AuditResult {
  total_words: number;
  plagiarism?: {
    uniqueness_score: number;
    plagiarism_score: number;
    total_words: number;
    matched_sources: {
      url: string;
      title: string;
      matched_snippet: string;
      matched_sentence?: string;
    }[];
    matched_sentences_count: number;
  };
  ai_detection?: {
    ai_percentage: number;
    human_percentage: number;
    verdict: string;
    burstiness_score: number;
    total_sentences: number;
    sentences: {
      text: string;
      tag: "ai" | "human" | "warning";
      is_ai: boolean;
      confidence: number;
      reason: string;
    }[];
  };
}

interface HistoryItem {
  id: string;
  title: string;
  text: string;
  word_count: number;
  uniqueness_score: number;
  plagiarism_score: number;
  ai_percentage: number;
  human_percentage: number;
  verdict: string;
  report: AuditResult;
  created_at: string;
}

export default function CheckerPage() {
  const tk = useTokens();
  const [text, setText] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [checkPlag, setCheckPlag] = useState(true);
  const [checkAi, setCheckAi] = useState(true);
  const [result, setResult] = useState<AuditResult | null>(null);
  
  // History state
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  const fetchHistory = async () => {
    try {
      const res = await fetch(getApiUrl("/api/v1/checker/history"));
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (e) {
      console.warn("Failed to fetch checker history:", e);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handlePaste = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) setText(clipText);
    } catch (e) {
      console.warn("Clipboard read failed:", e);
    }
  };

  const handleClear = () => {
    setText("");
    setResult(null);
  };

  const handleLoadSample = () => {
    const sample = `Pentingnya Menemukan Rice Cooker Multifungsi Berkualitas untuk Dapur Modern

Milih alat masak yang beneran tahan lama itu susah-susah gampang, lho. Apalagi kalau butuh yang bisa masak nasi sekaligus ngukus lauk dalam satu waktu. Nah, 7 Tips Memilih Steamer Rice Cooker yang Bagus dan Awet Tahan Lama hadir sebagai panduan praktis buat kamu yang nggak mau salah beli.

Bayangin aja, tiap pagi bisa masak nasi sambil kukus ikan atau sayuran sekaligus. Hemat waktu, hemat gas, hemat listrik. Efisiensinya kerasa banget di keseharian keluarga, kan? Tapi banyak orang keburu beli tanpa riset dulu. Akhirnya? Alat cepat rusak, lapisan dalam mengelupas, atau fitur steamer-nya nggak berfungsi maksimal. Repot banget kalau sudah begitu.

1. Material Wadah Kukusan Itu Penting Banget
Jangan anggap remeh bagian ini. Pilih baki atau wadah kukusan berbahan stainless steel atau setidaknya plastik food grade BPA free. Kenapa? Karena uap panas langsung kontak sama makanan. Kalau materialnya asal-asalan, zat berbahaya bisa ikut masuk ke sayuran atau ikan yang sedang dikukus.`;
    setText(sample);
  };

  const handleRunAudit = async () => {
    if (!text.trim()) return;

    setIsScanning(true);
    logTerminal("JOB", `Memulai scan orisinalitas (${wordCount} kata)...`);

    try {
      const res = await fetch(getApiUrl("/api/v1/checker/audit"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          check_plagiarism: checkPlag,
          check_ai: checkAi,
        }),
      });

      const json = await res.json();
      if (json.data) {
        setResult(json.data);
        const aiScore = json.data.ai_detection?.ai_percentage ?? 0;
        const plagScore = json.data.plagiarism?.plagiarism_score ?? 0;
        logTerminal("OK", `Audit selesai: ${100 - plagScore}% Unik | ${100 - aiScore}% Human Written`);
        // Refresh history list
        fetchHistory();
      }
    } catch (e) {
      console.error("Audit error:", e);
      logTerminal("ERR", `Gagal melakukan scan: ${String(e)}`);
    }

    setIsScanning(false);
  };

  const handleLoadHistoryItem = (item: HistoryItem) => {
    setText(item.text);
    setResult(item.report);
    window.scrollTo({ top: 0, behavior: "smooth" });
    logTerminal("SYS", `Memuat hasil audit riwayat: "${item.title.slice(0, 30)}..."`);
  };

  const handleDeleteHistoryItem = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeletingId(id);
    try {
      const res = await fetch(getApiUrl(`/api/v1/checker/history/${id}`), {
        method: "DELETE",
      });
      if (res.ok) {
        setHistory((prev) => prev.filter((h) => h.id !== id));
      }
    } catch (e) {
      console.error("Failed to delete history item:", e);
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAllHistory = async () => {
    if (!confirm("Apakah Anda yakin ingin menghapus semua riwayat audit?")) return;
    try {
      const res = await fetch(getApiUrl("/api/v1/checker/history"), {
        method: "DELETE",
      });
      if (res.ok) {
        setHistory([]);
      }
    } catch (e) {
      console.error("Failed to clear history:", e);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* ─── HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b t-border">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#d97757]/15 border border-[#d97757]/40 flex items-center justify-center text-[#d97757]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h1 className={`text-lg font-bold ${tk.textPrimary}`}>Cek Orisinalitas & Plagiarisme</h1>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#d97757]/15 text-[#d97757] border border-[#d97757]/30 tracking-wider">
              BETA
            </span>
          </div>
          <p className={`text-xs mt-1 ${tk.textMuted}`}>
            Verifikasi keaslian artikel secara real-time: Pindai indeks web untuk duplikasi & deteksi probabilitas AI.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLoadSample}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${tk.outlineBtn}`}
          >
            Muat Contoh Teks
          </button>
        </div>
      </div>

      {/* ─── INPUT TEXTAREA CARD ─── */}
      <div className={`p-4 rounded-2xl border ${tk.cardBg} space-y-3`}>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <span className={`font-semibold ${tk.textPrimary}`}>Konten Artikel</span>
            <span className={tk.textFaint}>
              {wordCount} kata • {charCount} karakter
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePaste}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${tk.outlineBtn}`}
              title="Paste dari Clipboard"
            >
              <Copy className="w-3 h-3" />
              <span>Paste</span>
            </button>
            {text && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 rounded-md text-stone-400 hover:text-red-400 transition-colors cursor-pointer"
                title="Hapus Teks"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <textarea
          rows={8}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Tempel teks artikel atau draf konten yang ingin Anda periksa keasliannya di sini..."
          className="w-full bg-black/20 border t-border rounded-xl p-3.5 text-xs t-text-primary placeholder:text-stone-500 focus:outline-none focus:border-[#d97757] font-sans leading-relaxed resize-y"
        />

        {/* Audit Options & Trigger Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-4 text-xs select-none">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={checkPlag}
                onChange={(e) => setCheckPlag(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-stone-700 text-[#d97757] focus:ring-[#d97757] accent-[#d97757]"
              />
              <span className={tk.textPrimary}>Cek Plagiarisme Web</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={checkAi}
                onChange={(e) => setCheckAi(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-stone-700 text-[#d97757] focus:ring-[#d97757] accent-[#d97757]"
              />
              <span className={tk.textPrimary}>Cek Detektor AI</span>
            </label>
          </div>

          <button
            type="button"
            onClick={handleRunAudit}
            disabled={!text.trim() || isScanning}
            className="t-accent-bg px-5 py-2.5 rounded-xl text-xs font-semibold shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memindai Indeks Web & AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Mulai Audit Konten</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ─── AUDIT RESULTS DASHBOARD ─── */}
      {result && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Plagiarism Score Card */}
            {result.plagiarism && (
              <div className={`p-5 rounded-2xl border ${tk.cardBg} space-y-3 relative overflow-hidden`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                      Keunikan Konten (Plagiarisme)
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      result.plagiarism.uniqueness_score >= 85
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : "bg-red-500/15 text-red-400 border border-red-500/30"
                    }`}
                  >
                    {result.plagiarism.uniqueness_score >= 85 ? "Lolos Plagiasi" : "Perlu Ditinjau"}
                  </span>
                </div>

                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-extrabold font-mono text-emerald-400">
                    {result.plagiarism.uniqueness_score}%
                  </span>
                  <span className={`text-xs ${tk.textMuted}`}>
                    Unik ({result.plagiarism.plagiarism_score}% Kesamaan Web)
                  </span>
                </div>

                <div className="w-full bg-stone-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${result.plagiarism.uniqueness_score}%` }}
                  />
                </div>

                <p className={`text-[11px] ${tk.textFaint}`}>
                  {result.plagiarism.matched_sources.length === 0
                    ? "✓ Tidak ditemukan kalimat duplikat yang sama persis di indeks pencarian web."
                    : `Ditemukan ${result.plagiarism.matched_sources.length} halaman sumber di internet dengan kemiripan teks.`}
                </p>
              </div>
            )}

            {/* 2. AI Detector Score Card */}
            {result.ai_detection && (
              <div className={`p-5 rounded-2xl border ${tk.cardBg} space-y-3 relative overflow-hidden`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                      Detektor Konten AI
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      result.ai_detection.ai_percentage <= 30
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : result.ai_detection.ai_percentage <= 55
                        ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                        : "bg-red-500/15 text-red-400 border border-red-500/30"
                    }`}
                  >
                    {result.ai_detection.verdict}
                  </span>
                </div>

                <div className="flex items-baseline gap-3">
                  <span
                    className={`text-3xl font-extrabold font-mono ${
                      result.ai_detection.ai_percentage <= 30
                        ? "text-emerald-400"
                        : result.ai_detection.ai_percentage <= 55
                        ? "text-amber-400"
                        : "text-red-400"
                    }`}
                  >
                    {result.ai_detection.human_percentage}%
                  </span>
                  <span className={`text-xs ${tk.textMuted}`}>
                    Human Written ({result.ai_detection.ai_percentage}% AI Probability)
                  </span>
                </div>

                <div className="w-full bg-stone-800 rounded-full h-2 overflow-hidden flex">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-500"
                    style={{ width: `${result.ai_detection.human_percentage}%` }}
                  />
                  <div
                    className="bg-red-500 h-full transition-all duration-500"
                    style={{ width: `${result.ai_detection.ai_percentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className={tk.textFaint}>
                    Burstiness Score: <strong>{result.ai_detection.burstiness_score}</strong>
                  </span>
                  <span className={tk.textFaint}>
                    {result.ai_detection.total_sentences} kalimat dianalisis
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ─── SENTENCE-BY-SENTENCE BREAKDOWN ─── */}
          {result.ai_detection?.sentences && result.ai_detection.sentences.length > 0 && (
            <div className={`p-5 rounded-2xl border ${tk.cardBg} space-y-4`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b t-border">
                <div>
                  <h3 className={`text-sm font-bold ${tk.textPrimary}`}>
                    Analisis Kalimat per Kalimat
                  </h3>
                  <p className={`text-xs ${tk.textMuted}`}>
                    Sorotan warna mengidentifikasi variasi ritme dan pola probabilitas AI.
                  </p>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Human Written
                  </span>
                  <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Seragam (Warning)
                  </span>
                  <span className="flex items-center gap-1.5 text-red-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    Indikasi AI
                  </span>
                </div>
              </div>

              {/* Text Highlights */}
              <div className="p-4 rounded-xl bg-black/20 border t-border text-xs leading-relaxed space-y-2">
                {result.ai_detection.sentences.map((st, idx) => {
                  let bgClass = "bg-transparent";
                  if (st.tag === "ai") bgClass = "bg-red-500/20 text-red-200 border-b border-red-500/40";
                  else if (st.tag === "warning") bgClass = "bg-amber-500/20 text-amber-200 border-b border-amber-500/40";

                  return (
                    <span
                      key={idx}
                      className={`inline-block px-1 py-0.5 rounded mr-1 transition-colors ${bgClass}`}
                      title={`${st.tag.toUpperCase()}: ${st.reason}`}
                    >
                      {st.text}{" "}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── MATCHED SOURCES LIST (IF ANY) ─── */}
          {result.plagiarism && result.plagiarism.matched_sources.length > 0 && (
            <div className={`p-5 rounded-2xl border ${tk.cardBg} space-y-3`}>
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                <span>Sumber Web yang Ditemukan</span>
              </div>

              <div className="space-y-2">
                {result.plagiarism.matched_sources.map((src, i) => (
                  <a
                    key={i}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl border t-border bg-black/10 hover:border-[#d97757] flex items-start justify-between gap-3 group transition-colors block"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="text-xs font-semibold group-hover:text-[#d97757] transition-colors truncate">
                        {src.title}
                      </div>
                      <p className={`text-[11px] ${tk.textMuted} line-clamp-1`}>
                        "{src.matched_snippet}"
                      </p>
                      <div className="text-[10px] font-mono text-stone-500 truncate">
                        {src.url}
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-stone-500 group-hover:text-[#d97757] shrink-0 mt-1" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── RIWAYAT / HISTORIS AUDIT (PERSISTENT DISK DB) ─── */}
      <div className={`p-5 rounded-2xl border ${tk.cardBg} space-y-4`}>
        <div className="flex items-center justify-between pb-3 border-b t-border">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#d97757]" />
            <h3 className={`text-sm font-bold ${tk.textPrimary}`}>Riwayat Audit Orisinalitas</h3>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${tk.monoBadge}`}>
              {history.length} audit tersimpan
            </span>
          </div>

          {history.length > 0 && (
            <button
              type="button"
              onClick={handleClearAllHistory}
              className="text-[11px] text-stone-500 hover:text-red-400 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Bersihkan Riwayat</span>
            </button>
          )}
        </div>

        {isLoadingHistory ? (
          <div className="py-8 flex items-center justify-center gap-2 text-xs text-stone-400">
            <Loader2 className="w-4 h-4 animate-spin text-[#d97757]" />
            <span>Memuat riwayat audit...</span>
          </div>
        ) : history.length === 0 ? (
          <div className="py-8 text-center space-y-1">
            <p className={`text-xs ${tk.textMuted}`}>Belum ada riwayat audit tersimpan.</p>
            <p className={`text-[11px] ${tk.textFaint}`}>Setiap kali Anda menjalankan audit, hasilnya akan otomatis disimpan di sini.</p>
          </div>
        ) : (
          <div className="divide-y t-border">
            {history.map((item) => {
              const dateStr = new Date(item.created_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={item.id}
                  onClick={() => handleLoadHistoryItem(item)}
                  className="py-3 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-black/10 rounded-xl transition-colors cursor-pointer group"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-200 group-hover:text-[#d97757] transition-colors truncate">
                        {item.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[10px] text-stone-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-stone-500" />
                        {dateStr}
                      </span>
                      <span>•</span>
                      <span>{item.word_count} kata</span>
                    </div>
                  </div>

                  {/* Badges & Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      {item.uniqueness_score}% Unik
                    </span>

                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                        item.ai_percentage <= 30
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                          : item.ai_percentage <= 55
                          ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                          : "bg-red-500/15 text-red-400 border-red-500/30"
                      }`}
                    >
                      {item.human_percentage}% Human
                    </span>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteHistoryItem(e, item.id)}
                      disabled={deletingId === item.id}
                      className="p-1.5 rounded-lg text-stone-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Hapus Dari Riwayat"
                    >
                      {deletingId === item.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
