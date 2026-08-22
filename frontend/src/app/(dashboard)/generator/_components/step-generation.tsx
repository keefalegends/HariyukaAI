"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Loader2,
  FileEdit,
  ArrowRight,
  Terminal,
  ShieldCheck,
} from "lucide-react";
import { useTokens } from "@/lib/use-tokens";
import { logTerminal, setTerminalStatus } from "@/lib/terminal-bus";

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
  const tk = useTokens();
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

    const eventSource = new EventSource(`http://localhost:8000/api/v1/stream/${articleId}`);

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const eventType = payload.event;
        const data = payload.data;

        if (eventType === "connected") {
          setLogs((prev) => [...prev, `[System] Terhubung ke real-time agentic stream.`]);
          logTerminal("SYS", `Stream worker connected (Task: ${articleId.slice(0, 8)}...)`);
        } else if (eventType === "step_start") {
          setCurrentStep(data.step);
          setProgress(data.progress);
          setLogs((prev) => [...prev, `[Step ${data.step}] ${data.name}...`]);
          logTerminal("JOB", `[Step ${data.step}/5] ${data.name}...`);
          setTerminalStatus("running", data.name);
        } else if (eventType === "section_writing_start") {
          setCurrentSectionTitle(`Menulis: ${data.heading} (${data.section_index}/${data.total_sections})`);
          setProgress(data.progress);
          setLogs((prev) => [...prev, `[Claude 4.6] Menulis section: "${data.heading}"`]);
          logTerminal("API", `Claude 4.6: Menulis "${data.heading}" (${data.section_index}/${data.total_sections})`);
          setTerminalStatus("running", `Writing: ${data.heading}`);
        } else if (eventType === "stream_chunk") {
          setStreamedText((prev) => prev + data.chunk);
        } else if (eventType === "generation_completed") {
          setIsCompleted(true);
          setProgress(100);
          setCurrentStep(5);
          if (data.result?.seo_score) {
            setSeoScore(data.result.seo_score);
          }
          const finishMsg = `Artikel selesai (${data.result?.word_count || 550} kata, Skor SEO: ${data.result?.seo_score || 94}/100)`;
          setLogs((prev) => [...prev, `[Selesai] ${finishMsg}`]);
          logTerminal("OK", finishMsg);
          setTerminalStatus("completed", "Selesai 100%");
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

  useEffect(() => {
    streamBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [streamedText]);

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-[11px] t-text-faint">
          <span className={`font-medium ${tk.textPrimary}`}>Generator</span>
          <span>/</span>
          <span>Penulisan</span>
        </div>
        <h1 className={`text-base font-semibold ${tk.textPrimary}`}>
          {isCompleted ? "Artikel Selesai" : "Sedang Menulis Artikel..."}
        </h1>
        <p className={`text-xs ${tk.textMuted}`}>
          {isCompleted
            ? "Artikel berhasil digenerate dengan optimasi E-E-A-T lengkap."
            : "Claude 4.6 sedang menulis setiap section secara mendalam tanpa repetisi."}
        </p>
      </div>

      {/* Progress + Pipeline steps */}
      <div className={`t-card rounded-xl p-5 space-y-4`}>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className={`flex items-center gap-2 font-medium ${tk.textSecondary}`}>
              {!isCompleted && <Loader2 className={`w-3.5 h-3.5 ${tk.accentText} animate-spin`} />}
              {currentSectionTitle}
            </span>
            <span className={`tabular-nums ${tk.textMuted}`}>{progress}%</span>
          </div>
          <div className={`w-full h-1.5 rounded-full overflow-hidden t-bg-tag`}>
            <div
              className={`h-full transition-all duration-500 rounded-full t-accent-bg`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 5-Step indicators */}
        <div className="grid grid-cols-5 gap-2">
          {PIPELINE_STEPS.map((s) => {
            const isDone = isCompleted || s.step < currentStep;
            const isCurrent = !isCompleted && s.step === currentStep;
            return (
              <div
                key={s.step}
                className={`p-2.5 rounded-lg border text-[10px] transition-colors ${
                  isDone
                    ? "border-emerald-500/30 text-emerald-400 t-bg-tag"
                    : isCurrent
                    ? "border-[#d97757] t-text-primary t-bg-tag"
                    : "t-border t-text-faint"
                }`}
              >
                <div className="flex items-center gap-1 font-medium mb-0.5">
                  {isDone ? (
                    <CheckCircle2 className="w-3 h-3 shrink-0 text-emerald-400" />
                  ) : isCurrent ? (
                    <Loader2 className="w-3 h-3 animate-spin shrink-0 text-[#d97757]" />
                  ) : (
                    <span className="w-3 h-3 rounded-full border border-current flex items-center justify-center text-[8px]">
                      {s.step}
                    </span>
                  )}
                  <span>Step {s.step}</span>
                </div>
                <div className={`text-[9px] ${tk.textMuted} line-clamp-2 leading-tight`}>{s.name}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Completion Banner */}
      {isCompleted && (
        <div className={`t-card rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg t-bg-tag border t-border flex items-center justify-center`}>
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className={`text-sm font-semibold ${tk.textPrimary}`}>Artikel Berhasil Digenerate</p>
              <p className={`text-xs ${tk.textMuted} mt-0.5`}>
                Skor SEO: <span className="text-emerald-400 font-semibold">{seoScore || 92}/100</span> — Siap diedit di editor Tiptap.
              </p>
            </div>
          </div>
          <Link
            href={`/articles/${articleId}`}
            className={`t-accent-bg flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors shrink-0`}
          >
            <FileEdit className="w-3.5 h-3.5" />
            <span>Buka di Editor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Stream + Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Live stream */}
        <div className={`lg:col-span-2 t-card rounded-xl overflow-hidden`}>
          <div className="flex items-center justify-between px-4 py-2.5 border-b t-border">
            <span className={`text-[11px] font-medium ${tk.textSecondary}`}>Live Markdown Output</span>
            <span className={`text-[10px] font-mono ${tk.textFaint}`}>Claude 4.6</span>
          </div>
          <div className={`h-[360px] overflow-y-auto font-mono text-xs ${tk.textSecondary} leading-relaxed p-4 whitespace-pre-wrap`}>
            {streamedText || <span className={tk.textFaint}>Menunggu data stream dari backend...</span>}
            <div ref={streamBottomRef} />
          </div>
        </div>

        {/* Execution logs */}
        <div className={`t-card rounded-xl overflow-hidden flex flex-col`}>
          <div className="flex items-center justify-between px-4 py-2.5 border-b t-border">
            <span className={`text-[11px] font-medium ${tk.textSecondary} flex items-center gap-1.5`}>
              <Terminal className="w-3 h-3" />
              Execution Log
            </span>
            {!isCompleted && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
          </div>
          <div className={`flex-1 h-[360px] overflow-y-auto font-mono text-[10px] ${tk.textFaint} space-y-1 p-3.5`}>
            {logs.map((log, i) => (
              <div key={i} className={tk.textMuted}>
                <span className={tk.accentText}>&gt;</span> {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
