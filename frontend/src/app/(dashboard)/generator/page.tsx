"use client";

import { useState } from "react";
import { StepInput } from "./_components/step-input";
import { StepOutline, ArticleOutline } from "./_components/step-outline";
import { StepGeneration } from "./_components/step-generation";

export default function GeneratorPage() {
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

    try {
      const res = await fetch("http://localhost:8000/api/v1/articles/generate-outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.article_id) {
        setArticleId(data.article_id);

        // Listen for outline_ready event via SSE
        const eventSource = new EventSource(`http://localhost:8000/api/v1/stream/${data.article_id}`);

        eventSource.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);
            if (payload.event === "step_complete" && payload.data?.serp_data) {
              setSerpData(payload.data.serp_data);
            }
            if (payload.event === "outline_ready") {
              setOutline(payload.data.outline);
              setIsLoading(false);
              setCurrentStep(2);
              eventSource.close();
            }
          } catch (e) {
            console.error("SSE parse error", e);
          }
        };

        eventSource.onerror = () => {
          // Fallback if disconnected
          setIsLoading(false);
        };
      }
    } catch (err) {
      console.error("Failed to generate outline:", err);
      // Fallback preview outline if backend isn't running yet
      const fallbackOutline: ArticleOutline = {
        title: `Panduan Lengkap ${formData.target_keyword} 2026`,
        estimated_total_words: formData.target_length || 2000,
        sections: [
          {
            id: "sec-1",
            heading: `Pengenalan dan Dasar ${formData.target_keyword}`,
            level: "h2",
            target_word_count: 350,
            key_points: ["Definisi mendasar", "Mengapa topik ini penting di era sekarang"],
            keywords_to_include: [formData.target_keyword],
          },
          {
            id: "sec-2",
            heading: "Langkah-Langkah Praktis & Strategi Terbaik",
            level: "h2",
            target_word_count: 600,
            key_points: ["Tutorial bertahap", "Tips menghindari kesalahan umum"],
            keywords_to_include: [formData.target_keyword],
          },
          {
            id: "sec-3",
            heading: "Optimasi Lanjutan dan Studi Kasus Nyata",
            level: "h2",
            target_word_count: 500,
            key_points: ["Contoh penerapan langsung", "Framework evaluasi hasil"],
            keywords_to_include: [formData.target_keyword],
          },
          {
            id: "sec-4",
            heading: "Kesimpulan dan Action Plan",
            level: "h2",
            target_word_count: 300,
            key_points: ["Ringkasan takeaways", "Langkah selanjutnya"],
            keywords_to_include: [formData.target_keyword],
          },
        ],
      };
      setOutline(fallbackOutline);
      setArticleId(`art-demo-${Date.now()}`);
      setIsLoading(false);
      setCurrentStep(2);
    }
  };

  // STEP 2 -> STEP 3: Continue to Writing Phase
  const handleOutlineContinue = async (updatedOutline: ArticleOutline, customTitle?: string) => {
    setIsLoading(true);
    setOutline(updatedOutline);

    try {
      await fetch(`http://localhost:8000/api/v1/articles/${articleId}/continue-writing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outline: updatedOutline,
          title: customTitle,
        }),
      });
    } catch (err) {
      console.warn("Backend continue writing notice:", err);
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
          serpData={serpData}
          targetKeyword={targetKeyword}
          onContinue={handleOutlineContinue}
          onBack={() => setCurrentStep(1)}
          isLoading={isLoading}
        />
      )}

      {currentStep === 3 && (
        <StepGeneration
          articleId={articleId}
          onFinished={(result) => {
            console.log("Generation finished:", result);
          }}
        />
      )}
    </div>
  );
}
