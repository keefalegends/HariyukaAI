"use client";

import { useState, Suspense } from "react";
import { StepInput } from "./_components/step-input";
import { StepOutline, type ArticleOutline } from "./_components/step-outline";
import { StepGeneration } from "./_components/step-generation";
import { logTerminal, setTerminalStatus } from "@/lib/terminal-bus";
import { getApiUrl } from "@/lib/api-config";

function GeneratorContent() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [articleId, setArticleId] = useState<string>("");
  const [targetKeyword, setTargetKeyword] = useState("");
  const [outline, setOutline] = useState<ArticleOutline | null>(null);
  const [serpData, setSerpData] = useState<any>(null);

  // STEP 1 -> STEP 2: Trigger Outline Generation
  const handleInputSubmit = async (formData: any) => {
    setIsLoading(true);
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

      const data = await res.json();
      if (data.article_id) {
        setArticleId(data.article_id);
        logTerminal("SYS", `Task ID terdaftar: ${data.article_id.slice(0, 8)}...`);

        // Listen for outline_ready event via SSE
        const eventSource = new EventSource(getApiUrl(`/api/v1/stream/${data.article_id}`));

        eventSource.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);
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
      logTerminal("ERR", `Koneksi backend gagal: ${String(err)}`);
      setTerminalStatus("error", "Koneksi backend gagal");
      setIsLoading(false);
    }
  };

  // STEP 2 -> STEP 3: Continue to Writing Phase
  const handleOutlineContinue = async (updatedOutline: ArticleOutline, customTitle?: string) => {
    setIsLoading(true);
    setOutline(updatedOutline);

    logTerminal("JOB", `Menyetujui outline (${updatedOutline.sections?.length} bagian). Memulai penulisan...`);
    setTerminalStatus("running", "Menulis konten...");

    try {
      await fetch(getApiUrl(`/api/v1/articles/${articleId}/continue-writing`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outline: updatedOutline,
          title: customTitle,
        }),
      });
    } catch (err) {
      console.warn("Backend continue writing notice:", err);
      logTerminal("ERR", `Notice continue writing: ${String(err)}`);
    }

    setIsLoading(false);
    setCurrentStep(3);
  };

  return (
    <div className="py-2">
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
