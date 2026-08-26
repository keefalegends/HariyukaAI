"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { AlertTriangle, Settings } from "lucide-react";
import { StepInput } from "./_components/step-input";
import { StepOutline, type ArticleOutline } from "./_components/step-outline";
import { StepGeneration } from "./_components/step-generation";
import { logTerminal, setTerminalStatus } from "@/lib/terminal-bus";
import { getApiUrl } from "@/lib/api-config";

function GeneratorContent() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [articleId, setArticleId] = useState<string>("");
  const [targetKeyword, setTargetKeyword] = useState("");
  const [outline, setOutline] = useState<ArticleOutline | null>(null);
  const [serpData, setSerpData] = useState<any>(null);

  // STEP 1 -> STEP 2: Trigger Outline Generation
  const handleInputSubmit = async (formData: any) => {
    setIsLoading(true);
    setErrorBanner(null);
    setTargetKeyword(formData.target_keyword);

    setTerminalStatus("running", `Analisis SERP: "${formData.target_keyword}"`);
    logTerminal("JOB", `Inisialisasi pipeline (${formData.article_type?.replace('_', ' ') || 'backlink'})...`);
    logTerminal("JOB", `Target Keyphrase: "${formData.target_keyword}"`);

    try {
      const res = await fetch(getApiUrl("/api/v1/articles/generate-outline"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const errMsg = errData.detail || "Gagal menghubungi backend gateway.";
        setIsLoading(false);
        setErrorBanner(errMsg);
        logTerminal("ERR", errMsg);
        setTerminalStatus("error", "Koneksi 9Router Belum Siap");
        return;
      }

      const data = await res.json();
      if (data.article_id) {
        setArticleId(data.article_id);
        logTerminal("SYS", `Task ID terdaftar: ${data.article_id.slice(0, 8)}...`);

        // Listen for outline_ready event via SSE
        const eventSource = new EventSource(getApiUrl(`/api/v1/stream/${data.article_id}`));

        eventSource.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);
            if (payload.event === "error") {
              setIsLoading(false);
              const errMsg = payload.data?.message || "Terjadi kesalahan pada AI Gateway";
              logTerminal("ERR", `Gagal: ${errMsg}`);
              setTerminalStatus("error", errMsg);
              setErrorBanner(errMsg);
              eventSource.close();
            }
            if (payload.event === "step_start") {
              logTerminal("API", `[Step ${payload.data?.step}] ${payload.data?.name}`);
              setTerminalStatus("running", payload.data?.name);
            }
            if (payload.event === "step_complete" && payload.data?.serp_data) {
              setSerpData(payload.data.serp_data);
              logTerminal("API", `Intent: ${payload.data.serp_data.search_intent} (${payload.data.serp_data.lsi_keywords?.length || 6} LSI Entities)`);
            }
            if (payload.event === "outline_ready") {
              setOutline(payload.data.outline);
              setIsLoading(false);
              setCurrentStep(2);
              logTerminal("SEO", `Outline ${payload.data.outline?.sections?.length || 4} Bagian H2/H3 Siap Ditinjau`);
              setTerminalStatus("idle", "Outline siap ditinjau");
              eventSource.close();
            }
          } catch (e) {
            console.error("SSE parse error", e);
          }
        };

        eventSource.onerror = () => {
          setIsLoading(false);
        };
      }
    } catch (err) {
      console.error("Failed to generate outline:", err);
      const errMsg = `Koneksi backend gagal: ${String(err)}`;
      logTerminal("ERR", errMsg);
      setTerminalStatus("error", "Koneksi backend gagal");
      setErrorBanner(errMsg);
      setIsLoading(false);
    }
  };

  // STEP 2 -> STEP 3: Continue to Writing Phase
  const handleOutlineContinue = async (updatedOutline: ArticleOutline, customTitle?: string) => {
    setIsLoading(true);
    setErrorBanner(null);
    setOutline(updatedOutline);

    logTerminal("JOB", `Menyetujui outline (${updatedOutline.sections?.length} bagian). Memulai penulisan...`);
    setTerminalStatus("running", "Menulis konten...");

    try {
      const res = await fetch(getApiUrl(`/api/v1/articles/${articleId}/continue-writing`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outline: updatedOutline,
          title: customTitle,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const errMsg = errData.detail || "Gagal memulai penulisan artikel.";
        setIsLoading(false);
        setErrorBanner(errMsg);
        logTerminal("ERR", errMsg);
        setTerminalStatus("error", "Koneksi 9Router Belum Siap");
        return;
      }
    } catch (err) {
      console.warn("Backend continue writing notice:", err);
      logTerminal("ERR", `Notice continue writing: ${String(err)}`);
    }

    setIsLoading(false);
    setCurrentStep(3);
  };

  return (
    <div className="py-2">
      {/* Error / Missing API Key Warning Banner */}
      {errorBanner && (
        <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-xs space-y-2.5 animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-red-500/20 text-red-500 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-red-500 text-xs">Peringatan: Tidak Bisa Memulai Generator</h4>
              <p className="text-stone-300 text-[11px] mt-0.5 leading-relaxed">{errorBanner}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1 pl-11">
            <Link
              href="/settings"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#d97757] hover:bg-[#c26445] text-white font-semibold text-xs transition-all shadow-sm active:scale-95"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Buka Menu API & Model</span>
            </Link>
            <button
              type="button"
              onClick={() => setErrorBanner(null)}
              className="px-3.5 py-1.5 rounded-xl border border-stone-700 text-stone-400 hover:text-white text-xs transition-all cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {currentStep === 1 && (
        <StepInput onSubmit={handleInputSubmit} isLoading={isLoading} />
      )}

      {currentStep === 2 && outline && (
        <StepOutline
          initialOutline={outline}
          targetKeyword={targetKeyword}
          serpData={serpData}
          onContinue={handleOutlineContinue}
          onBack={() => setCurrentStep(1)}
          isLoading={isLoading}
        />
      )}

      {currentStep === 3 && (
        <StepGeneration
          articleId={articleId}
          onFinished={() => {
            logTerminal("OK", "Pipeline selesai! Artikel siap di editor.");
            setTerminalStatus("completed", "Artikel selesai");
          }}
        />
      )}
    </div>
  );
}

export default function GeneratorPage() {
  return (
    <Suspense fallback={<div className="py-8 text-center text-xs text-[#78716c]">Memuat Generator...</div>}>
      <GeneratorContent />
    </Suspense>
  );
}
