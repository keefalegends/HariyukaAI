"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  Loader2,
  FileEdit,
  Flame,
  ArrowRight,
  Terminal,
  ShieldCheck,
} from "lucide-react";

interface StepGenerationProps {
  articleId: string;
  onFinished: (articleData: any) => void;
}

const PIPELINE_STEPS = [
  { step: 1, name: "SERP Scraping & Intent (Gemini 3.7)", desc: "Menganalisis kompetitor peringkat 1-3 & keyword LSI" },
  { step: 2, name: "Kerangka Outline JSON (Gemini 3.7)", desc: "Menyusun hierarki H2/H3 dan target bobot kata" },
  { step: 3, name: "Multi-Pass Section Writer (Claude 4.6)", desc: "Menulis konten per section dengan context chaining" },
  { step: 4, name: "SEO Optimization & Polish (Claude 4.6)", desc: "Penyempurnaan bolding, visual tags, dan sinyal E-E-A-T" },
  { step: 5, name: "Kalkulasi Skor SEO & Audit", desc: "Audit live 100-poin dan finalisasi artikel" },
];

export function StepGeneration({ articleId, onFinished }: StepGenerationProps) {
  const [currentStep, setCurrentStep] = useState(3);
  const [progress, setProgress] = useState(55);
  const [streamedText, setStreamedText] = useState("");
  const [currentSectionTitle, setCurrentSectionTitle] = useState("Memulai penulisan section...");
  const [logs, setLogs] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [seoScore, setSeoScore] = useState<number | null>(null);
  const streamBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!articleId) return;

    // Connect to FastAPI SSE Stream
    const eventSource = new EventSource(`http://localhost:8000/api/v1/stream/${articleId}`);

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const eventType = payload.event;
        const data = payload.data;

        if (eventType === "connected") {
          setLogs((prev) => [...prev, `[System] Terhubung ke real-time agentic stream.`]);
        } else if (eventType === "step_start") {
          setCurrentStep(data.step);
          setProgress(data.progress);
          setLogs((prev) => [...prev, `[Step ${data.step}] ${data.name}...`]);
        } else if (eventType === "section_writing_start") {
          setCurrentSectionTitle(`Menulis: ${data.heading} (${data.section_index}/${data.total_sections})`);
          setProgress(data.progress);
          setLogs((prev) => [...prev, `[Claude 4.6] Menulis section: "${data.heading}"`]);
        } else if (eventType === "stream_chunk") {
          setStreamedText((prev) => prev + data.chunk);
        } else if (eventType === "generation_completed") {
          setIsCompleted(true);
          setProgress(100);
          setCurrentStep(5);
          if (data.result?.seo_score) {
            setSeoScore(data.result.seo_score);
          }
          setLogs((prev) => [...prev, `[Selesai] Artikel berhasil digenerate dengan skor SEO ${data.result?.seo_score || 95}/100!`]);
          onFinished(data.result);
          eventSource.close();
        }
      } catch (err) {
        console.error("SSE parse error:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.warn("SSE connection closed or reconnected:", err);
    };

    return () => {
      eventSource.close();
    };
  }, [articleId, onFinished]);

  // Auto-scroll stream preview
  useEffect(() => {
    streamBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [streamedText]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          <span>Langkah 3: Proses Penulisan AI Real-Time</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
          {isCompleted ? "Artikel Anda Siap Digunakan!" : "Sedang Menulis Artikel Human-Grade..."}
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          {isCompleted
            ? "Artikel selesai digenerate dengan struktur SEO sempurna dan optimasi E-E-A-T."
            : "Claude 4.6 sedang menulis setiap section secara mendalam tanpa repetisi dan cliches."}
        </p>
      </div>

      {/* Progress Bar & Steps Status */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-semibold flex items-center gap-2">
              {!isCompleted && <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />}
              {currentSectionTitle}
            </span>
            <span className="text-indigo-400 font-bold">{progress}% Selesai</span>
          </div>
          <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 h-full transition-all duration-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 5-Step Pipeline Indicator */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5 pt-2">
          {PIPELINE_STEPS.map((s) => {
            const isDone = isCompleted || s.step < currentStep;
            const isCurrent = !isCompleted && s.step === currentStep;

            return (
              <div
                key={s.step}
                className={`p-3 rounded-xl border text-xs transition-all ${
                  isDone
                    ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                    : isCurrent
                    ? "bg-indigo-950/30 border-indigo-500/50 text-indigo-200 shadow-md shadow-indigo-500/10"
                    : "bg-slate-950/40 border-slate-800/60 text-slate-500"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin shrink-0" />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-700 text-[9px] flex items-center justify-center">
                      {s.step}
                    </span>
                  )}
                  <span className="truncate">Step {s.step}</span>
                </div>
                <div className="text-[10px] text-slate-400 line-clamp-2">{s.name}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Completion Banner */}
      {isCompleted && (
        <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-emerald-900/40 border border-indigo-500/40 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Artikel Berhasil Digenerate!</h3>
              <p className="text-xs text-slate-300">
                Skor SEO: <span className="font-bold text-emerald-400">{seoScore || 92}/100</span> — Siap dipublish atau diedit di Tiptap Suite.
              </p>
            </div>
          </div>
          <Link
            href={`/articles/${articleId}`}
            className="w-full md:w-auto py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-500 via-indigo-600 to-purple-600 hover:from-emerald-400 hover:to-purple-500 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <FileEdit className="w-4 h-4" />
            <span>Buka di Tiptap Editor & SEO Suite</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Split Stream Preview & Execution Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Realtime Live Text Stream Window */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
            <span className="font-bold text-slate-200 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Live Streaming Markdown Output
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Claude 4.6 Stream</span>
          </div>

          <div className="h-[380px] overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 whitespace-pre-wrap selection:bg-indigo-500">
            {streamedText || "Menunggu data stream dari backend..."}
            <div ref={streamBottomRef} />
          </div>
        </div>

        {/* Live Execution Logs Console */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
            <span className="font-bold text-slate-200 flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-purple-400" />
              Pipeline Execution Log
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>

          <div className="flex-1 h-[380px] overflow-y-auto font-mono text-[11px] text-slate-400 space-y-1.5 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
            {logs.map((log, i) => (
              <div key={i} className="text-slate-300">
                <span className="text-indigo-400">&gt;</span> {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
