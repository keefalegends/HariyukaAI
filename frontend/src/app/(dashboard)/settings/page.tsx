"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  ShieldCheck,
  Zap,
  Server,
  Key,
  CheckCircle2,
  AlertCircle,
  Save,
  Globe,
  Sliders,
  Sparkles,
  Infinity,
  RefreshCw,
  Search,
  Check,
} from "lucide-react";

export default function SettingsPage() {
  const [baseUrl, setBaseUrl] = useState("http://202.10.47.200:20128/v1");
  const [apiKey, setApiKey] = useState("sk-fc0b27cf63ed9f2a-hilooi-b3a32928");
  const [serpModel, setSerpModel] = useState("gemini/gemini-3.7-flash");
  const [writerModel, setWriterModel] = useState("ag/claude-sonnet-4-6");

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

  // Initial load
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch("http://localhost:8000/health");
        if (res.ok) {
          const data = await res.json();
          if (data.models) {
            setSerpModel(data.models.serp_extractor || "gemini/gemini-3.7-flash");
            setWriterModel(data.models.section_writer || "ag/claude-sonnet-4-6");
          }
        }
      } catch (e) {
        // Backend offline or local
      }
    };
    loadSettings();
  }, []);

  // 1. REAL 9Router Gateway Validation Test
  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch("http://localhost:8000/api/v1/settings/test-9router", {
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
          statusText: "Connected (9Router Proxy Terverifikasi)",
          details: `Koneksi gateway 9Router BERHASIL! Ditemukan ${data.total_models} model AI siap digunakan.`,
        });
        if (data.models && data.models.length > 0) {
          setAvailableModels(data.models);
        }
      } else {
        // Real rejection error from 9Router
        setTestResult({
          success: false,
          statusText: "Autentikasi Gagal",
          details: data.error || "API Key 9Router tidak valid atau server proxy tidak dapat dijangkau.",
        });
      }
    } catch (e: any) {
      setTestResult({
        success: false,
        statusText: "Koneksi Backend / 9Router Gagal",
        details: "Pastikan backend FastAPI aktif dan 9Router Base URL dapat dijangkau.",
      });
    }
    setIsTesting(false);
  };

  // 2. Fetch Models from 9Router
  const handleFetchModels = async () => {
    setIsFetchingModels(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/settings/test-9router", {
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
      await fetch("http://localhost:8000/api/v1/settings/save", {
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
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Pengaturan API & Model AI</h1>
          <p className="text-xs text-slate-400 mt-1">
            Kelola konfigurasi 9Router Gateway asli, routing model Gemini & Claude, dan koneksi server.
          </p>
        </div>

        {/* Real Test Connection Button */}
        <button
          type="button"
          onClick={handleTestConnection}
          disabled={isTesting}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
        >
          {isTesting ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
          ) : (
            <Zap className="w-3.5 h-3.5 text-amber-300" />
          )}
          <span>Uji Koneksi Gateway</span>
        </button>
      </div>

      {/* Connection Test Result Badge (Real Validation) */}
      {testResult && (
        <div
          className={`p-4 rounded-2xl border flex items-start gap-3 transition-all ${
            testResult.success
              ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-300"
              : "bg-rose-950/40 border-rose-500/40 text-rose-300"
          }`}
        >
          {testResult.success ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div>
            <div className="text-xs font-bold text-white">{testResult.statusText}</div>
            <div className="text-[11px] text-slate-300 mt-0.5">{testResult.details}</div>
          </div>
        </div>
      )}

      {/* 9Router Proxy Credentials Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">9Router Proxy Gateway</h3>
            <p className="text-xs text-slate-400">
              Kredensial gateway OpenAI-compatible untuk multi-model routing.
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              9Router Base URL
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Default server proxy: <code className="text-indigo-400">http://202.10.47.200:20128/v1</code>
            </p>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              9Router API Key
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Model Routing Setup Section */}
        <div className="pt-6 border-t border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              Konfigurasi Model Routing Pipeline
            </div>

            {/* Fetch Models Button (Placed on the right header) */}
            <button
              type="button"
              onClick={handleFetchModels}
              disabled={isFetchingModels}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all active:scale-95 cursor-pointer self-start sm:self-auto disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetchingModels ? "animate-spin" : ""}`} />
              <span>{isFetchingModels ? "Mengambil Model..." : "Fetch Models dari 9Router"}</span>
            </button>
          </div>

          {/* Model Inputs: SERP and Writer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">1. SERP & Outline Model</span>
                <span className="text-[10px] text-indigo-400 font-mono bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  Gemini Alias
                </span>
              </div>
              <input
                type="text"
                value={serpModel}
                onChange={(e) => setSerpModel(e.target.value)}
                placeholder="misal: gemini/gemini-3.7-flash"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-indigo-300 focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[11px] text-slate-400">
                Digunakan untuk ekstraksi intent & pembuatan outline JSON cepat.
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">2. Section Writer & SEO Polish</span>
                <span className="text-[10px] text-purple-400 font-mono bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                  Claude Alias
                </span>
              </div>
              <input
                type="text"
                value={writerModel}
                onChange={(e) => setWriterModel(e.target.value)}
                placeholder="misal: ag/claude-sonnet-4-6"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-purple-300 focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[11px] text-slate-400">
                Digunakan untuk penulisan artikel multi-pass & optimasi E-E-A-T.
              </p>
            </div>
          </div>

          {/* Model Selection Drawer / List when models are fetched */}
          {availableModels.length > 0 && (
            <div className="bg-slate-950/80 border border-indigo-500/30 rounded-2xl p-4 space-y-3 mt-4">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="font-bold text-slate-200 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  Model Tersedia di 9Router ({availableModels.length} Model)
                </span>
                <div className="relative w-48">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={modelSearch}
                    onChange={(e) => setModelSearch(e.target.value)}
                    placeholder="Filter model..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-7 pr-2.5 py-1 text-[11px] text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center gap-2">
                <span>Klik tombol model di bawah untuk memasang ke:</span>
                <button
                  type="button"
                  onClick={() => setActiveTargetSelector(activeTargetSelector === "serp" ? null : "serp")}
                  className={`px-2 py-0.5 rounded border font-semibold ${
                    activeTargetSelector === "serp"
                      ? "bg-indigo-600 text-white border-indigo-500"
                      : "bg-slate-800 text-indigo-300 border-slate-700"
                  }`}
                >
                  SERP/Outline Model
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTargetSelector(activeTargetSelector === "writer" ? null : "writer")}
                  className={`px-2 py-0.5 rounded border font-semibold ${
                    activeTargetSelector === "writer"
                      ? "bg-purple-600 text-white border-purple-500"
                      : "bg-slate-800 text-purple-300 border-slate-700"
                  }`}
                >
                  Writer Model
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-1 bg-slate-900/60 rounded-xl border border-slate-800/80">
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
                          // Default smart assignment
                          if (m.toLowerCase().includes("gemini")) {
                            setSerpModel(m);
                          } else if (m.toLowerCase().includes("claude")) {
                            setWriterModel(m);
                          } else {
                            setWriterModel(m);
                          }
                        }
                      }}
                      className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
                        isSerp && isWriter
                          ? "bg-gradient-to-r from-indigo-900 to-purple-900 border-indigo-400 text-white shadow-sm"
                          : isSerp
                          ? "bg-indigo-950/60 border-indigo-500 text-indigo-300 shadow-sm"
                          : isWriter
                          ? "bg-purple-950/60 border-purple-500 text-purple-300 shadow-sm"
                          : "bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-600"
                      }`}
                    >
                      {isSerp && <span className="text-[9px] bg-indigo-500 text-white px-1 rounded">SERP</span>}
                      {isWriter && <span className="text-[9px] bg-purple-500 text-white px-1 rounded">Writer</span>}
                      <span>{m}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div className="text-[11px] text-slate-500">
            Open-Source Edition • Hariyuka AI
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            {savedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Save className="w-3.5 h-3.5" />}
            <span>{savedSuccess ? "Pengaturan Tersimpan!" : "Simpan Pengaturan"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
