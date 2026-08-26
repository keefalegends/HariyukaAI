"use client";

import { useState, useEffect } from "react";
import {
  Server,
  Key,
  CheckCircle2,
  AlertCircle,
  Save,
  Globe,
  Sliders,
  RefreshCw,
  Search,
  Check,
  Zap,
} from "lucide-react";
import { useTokens } from "@/lib/use-tokens";
import { getApiUrl } from "@/lib/api-config";

export default function SettingsPage() {
  const tk = useTokens();
  const [baseUrl, setBaseUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [serpModel, setSerpModel] = useState("ag/gemini-3.7-flash-high");
  const [writerModel, setWriterModel] = useState("ag/claude-opus-4-6-thinking");

  const [isTesting, setIsTesting] = useState(false);
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [modelSearch, setModelSearch] = useState("");
  const [activeTargetSelector, setActiveTargetSelector] = useState<"serp" | "writer" | null>(null);

  const [testResult, setTestResult] = useState<{
    success: boolean;
    statusText: string;
    details: string;
  } | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Initial load from backend active config
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch(getApiUrl("/api/v1/settings/current"));
        if (res.ok) {
          const data = await res.json();
          if (data.base_url) setBaseUrl(data.base_url);
          if (data.model_serp) setSerpModel(data.model_serp);
          if (data.model_writer) setWriterModel(data.model_writer);
        }
      } catch (e) {
        // Fallback to health endpoint if current not available
        try {
          const res = await fetch(getApiUrl("/health"));
          if (res.ok) {
            const data = await res.json();
            if (data.models) {
              setSerpModel(data.models.serp_extractor || "ag/gemini-3.7-flash-high");
              setWriterModel(data.models.section_writer || "ag/claude-sonnet-4-6");
            }
          }
        } catch (err) {}
      }
    };
    loadSettings();
  }, []);

  // 1. REAL 9Router Gateway Validation Test
  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch(getApiUrl("/api/v1/settings/test-9router"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base_url: baseUrl.trim(),
          api_key: apiKey.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setTestResult({
          success: true,
          statusText: "Koneksi Berhasil!",
          details: `9Router Gateway Aktif. Ditemukan ${data.total_models || data.models?.length || 0} model AI siap pakai.`,
        });
        if (data.models && data.models.length > 0) {
          setAvailableModels(data.models);
        }
      } else {
        setTestResult({
          success: false,
          statusText: "Koneksi Gagal (401 / 500)",
          details: data.error || "Gagal menghubungi 9Router. Periksa Base URL dan API Key.",
        });
      }
    } catch (e) {
      setTestResult({
        success: false,
        statusText: "Error Jaringan",
        details: "Tidak dapat terhubung ke backend server.",
      });
    }
    setIsTesting(false);
  };

  // 2. Fetch Models from 9Router
  const handleFetchModels = async () => {
    setIsFetchingModels(true);
    try {
      const res = await fetch(getApiUrl("/api/v1/settings/test-9router"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base_url: baseUrl.trim(),
          api_key: apiKey.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.models) {
        setAvailableModels(data.models);
        setTestResult({
          success: true,
          statusText: `Berhasil Sinkronisasi ${data.models.length} Model!`,
          details: "Pilih model dari daftar di bawah untuk dipasangkan ke pipeline.",
        });
      } else {
        setTestResult({
          success: false,
          statusText: "Gagal Mengambil Daftar Model",
          details: data.error || "Periksa kembali API Key 9Router Anda.",
        });
      }
    } catch (e) {
      setTestResult({
        success: false,
        statusText: "Gagal Mengambil Model",
        details: "Koneksi ke backend atau 9Router terputus.",
      });
    }
    setIsFetchingModels(false);
  };

  // 3. Save Settings
  const handleSave = async () => {
    try {
      await fetch(getApiUrl("/api/v1/settings/save"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base_url: baseUrl.trim(),
          api_key: apiKey.trim(),
          model_serp: serpModel,
          model_writer: writerModel,
        }),
      });
    } catch (e) {
      console.warn("Save settings notice:", e);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const filteredModels = availableModels.filter((m) =>
    m.toLowerCase().includes(modelSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={`text-base font-semibold ${tk.textPrimary}`}>Pengaturan API & Model AI</h1>
          <p className={`text-xs ${tk.textMuted} mt-0.5`}>
            Kelola kredensial 9Router Proxy Gateway dan pemetaan model AI untuk pipeline penulisan artikel.
          </p>
        </div>

        {/* Real Test Connection Button */}
        <button
          type="button"
          onClick={handleTestConnection}
          disabled={isTesting}
          className={`t-accent-bg flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all active:scale-95 cursor-pointer disabled:opacity-50`}
        >
          {isTesting ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Zap className="w-3.5 h-3.5" />
          )}
          <span>Uji Koneksi Gateway</span>
        </button>
      </div>

      {/* Connection Test Result Badge */}
      {testResult && (
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
            testResult.success
              ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
              : "bg-red-950/20 border-red-500/30 text-red-300"
          }`}
        >
          {testResult.success ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          )}
          <div>
            <div className={`text-xs font-semibold ${testResult.success ? "text-emerald-300" : "text-red-300"}`}>
              {testResult.statusText}
            </div>
            <div className={`text-[11px] mt-0.5 ${tk.textMuted}`}>{testResult.details}</div>
          </div>
        </div>
      )}

      {/* 9Router Proxy Credentials Card */}
      <div className={`t-card rounded-xl p-5 md:p-6 space-y-6 shadow-sm`}>
        <div className="flex items-center gap-3 pb-4 border-b t-border">
          <div className="w-8 h-8 rounded-lg t-bg-tag border t-border flex items-center justify-center text-stone-400">
            <Server className="w-4 h-4" />
          </div>
          <div>
            <h3 className={`text-sm font-semibold ${tk.textPrimary}`}>9Router Proxy Gateway</h3>
            <p className={`text-xs ${tk.textMuted}`}>
              Kredensial gateway OpenAI-compatible untuk multi-model routing.
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className={`block font-semibold uppercase tracking-wider mb-1.5 ${tk.textFaint}`}>
              9Router Base URL
            </label>
            <div className="relative">
              <Globe className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${tk.textFaint}`} />
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                className={`w-full t-input border rounded-lg pl-9 pr-4 py-2 text-xs font-mono t-border-focus transition-colors`}
              />
            </div>
            <p className={`text-[11px] mt-1 ${tk.textFaint}`}>
              Format alamat gateway: <code className={tk.accentText}>http://host:20128/v1</code>
            </p>
          </div>

          <div>
            <label className={`block font-semibold uppercase tracking-wider mb-1.5 ${tk.textFaint}`}>
              9Router API Key
            </label>
            <div className="relative">
              <Key className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${tk.textFaint}`} />
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className={`w-full t-input border rounded-lg pl-9 pr-4 py-2 text-xs font-mono t-border-focus transition-colors`}
              />
            </div>
          </div>
        </div>

        {/* Model Routing Setup Section */}
        <div className="pt-5 border-t t-border space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-2 ${tk.textPrimary}`}>
              <Sliders className="w-3.5 h-3.5" />
              Konfigurasi Model Routing Pipeline
            </div>

            {/* Fetch Models Button */}
            <button
              type="button"
              onClick={handleFetchModels}
              disabled={isFetchingModels}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95 cursor-pointer disabled:opacity-50 ${tk.outlineBtn}`}
            >
              <RefreshCw className={`w-3 h-3 ${isFetchingModels ? "animate-spin" : ""}`} />
              <span>{isFetchingModels ? "Mengambil Model..." : "Fetch Models dari 9Router"}</span>
            </button>
          </div>

          {/* Model Inputs: SERP and Writer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className={`t-bg-tag border t-border rounded-xl p-4 space-y-2`}>
              <div className="flex items-center justify-between">
                <span className={`font-semibold ${tk.textPrimary}`}>1. SERP & Outline Model</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${tk.monoBadge}`}>
                  Gemini Alias
                </span>
              </div>
              <input
                type="text"
                value={serpModel}
                onChange={(e) => setSerpModel(e.target.value)}
                placeholder="misal: gemini/gemini-3.7-flash"
                className={`w-full t-input border rounded-lg px-3 py-2 text-xs font-mono t-border-focus`}
              />
              <p className={`text-[11px] ${tk.textMuted}`}>
                Ekstraksi intent SERP & perumusan kerangka outline JSON.
              </p>
            </div>

            <div className={`t-bg-tag border t-border rounded-xl p-4 space-y-2`}>
              <div className="flex items-center justify-between">
                <span className={`font-semibold ${tk.textPrimary}`}>2. Section Writer & SEO Polish</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${tk.monoBadge}`}>
                  Claude Alias
                </span>
              </div>
              <input
                type="text"
                value={writerModel}
                onChange={(e) => setWriterModel(e.target.value)}
                placeholder="misal: ag/claude-sonnet-4-6"
                className={`w-full t-input border rounded-lg px-3 py-2 text-xs font-mono t-border-focus`}
              />
              <p className={`text-[11px] ${tk.textMuted}`}>
                Penulisan artikel multi-pass mendalam & optimasi E-E-A-T.
              </p>
            </div>
          </div>

          {/* Model Selection Drawer */}
          {availableModels.length > 0 && (
            <div className={`border t-border rounded-xl p-4 space-y-3 mt-4 t-bg-tag`}>
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className={`font-semibold ${tk.textPrimary}`}>
                  Model Tersedia di 9Router ({availableModels.length} Model)
                </span>
                <div className="relative w-44">
                  <Search className={`w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 ${tk.textFaint}`} />
                  <input
                    type="text"
                    value={modelSearch}
                    onChange={(e) => setModelSearch(e.target.value)}
                    placeholder="Filter model..."
                    className={`w-full t-input border rounded-lg pl-7 pr-2.5 py-1 text-[11px] t-border-focus`}
                  />
                </div>
              </div>

              <div className={`text-[11px] ${tk.textMuted} flex items-center gap-2 flex-wrap`}>
                <span>Pasang model yang diklik ke:</span>
                <button
                  type="button"
                  onClick={() => setActiveTargetSelector(activeTargetSelector === "serp" ? null : "serp")}
                  className={`px-2.5 py-0.5 rounded-lg border text-xs font-medium transition-colors ${
                    activeTargetSelector === "serp"
                      ? "t-accent-bg border-transparent"
                      : tk.outlineBtn
                  }`}
                >
                  SERP/Outline Model
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTargetSelector(activeTargetSelector === "writer" ? null : "writer")}
                  className={`px-2.5 py-0.5 rounded-lg border text-xs font-medium transition-colors ${
                    activeTargetSelector === "writer"
                      ? "t-accent-bg border-transparent"
                      : tk.outlineBtn
                  }`}
                >
                  Writer Model
                </button>
              </div>

              <div className={`flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-1.5 rounded-lg border t-border ${tk.cardBgNoBorder}`}>
                {filteredModels.map((m) => {
                  const isSerp = serpModel === m;
                  const isWriter = writerModel === m;

                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        if (activeTargetSelector === "serp") {
                          setSerpModel(m);
                        } else if (activeTargetSelector === "writer") {
                          setWriterModel(m);
                        } else {
                          if (m.toLowerCase().includes("gemini")) {
                            setSerpModel(m);
                          } else {
                            setWriterModel(m);
                          }
                        }
                      }}
                      className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                        isSerp || isWriter
                          ? "t-accent-bg border-transparent"
                          : `${tk.tagBg} ${tk.textSecondary} hover:border-[#78716c]`
                      }`}
                    >
                      {isSerp && <span className="text-[9px] bg-black/20 text-white px-1 rounded">SERP</span>}
                      {isWriter && <span className="text-[9px] bg-black/20 text-white px-1 rounded">Writer</span>}
                      <span>{m}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t t-border">
          <div className={`text-[11px] ${tk.textFaint}`}>
            Hariyuka AI · 100% Open-Source & Self-Hosted
          </div>

          <button
            type="button"
            onClick={handleSave}
            className={`t-accent-bg px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer active:scale-95`}
          >
            {savedSuccess ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            <span>{savedSuccess ? "Tersimpan!" : "Simpan Pengaturan"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
