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
  ShieldAlert,
} from "lucide-react";
import { useTokens } from "@/lib/use-tokens";
import { getApiUrl } from "@/lib/api-config";

interface ModelItem {
  id: string;
  source: "api_1" | "api_2";
  sourceName: string;
}

export default function SettingsPage() {
  const tk = useTokens();

  // ─── Slot 1: API 1 Gateway (e.g. 9Router) ───
  const [api1BaseUrl, setApi1BaseUrl] = useState("");
  const [api1ApiKey, setApi1ApiKey] = useState("");
  const [isTestingApi1, setIsTestingApi1] = useState(false);

  // ─── Slot 2: API 2 Gateway (e.g. Re:Link Gateway / OpenRouter) ───
  const [api2BaseUrl, setApi2BaseUrl] = useState("");
  const [api2ApiKey, setApi2ApiKey] = useState("");
  const [isTestingApi2, setIsTestingApi2] = useState(false);

  // ─── Box 1: SERP & Outline Pipeline ───
  const [serpModel, setSerpModel] = useState("ag/gemini-3.7-flash-high");
  const [serpProvider, setSerpProvider] = useState<"api_1" | "api_2">("api_1");
  const [serpFallbackEnabled, setSerpFallbackEnabled] = useState(false);
  const [serpFallbackModel, setSerpFallbackModel] = useState("");
  const [serpFallbackProvider, setSerpFallbackProvider] = useState<"api_1" | "api_2">("api_2");

  // ─── Box 2: Section Writer & SEO Polish Pipeline ───
  const [writerModel, setWriterModel] = useState("claude-opus-5-5");
  const [writerProvider, setWriterProvider] = useState<"api_1" | "api_2">("api_2");
  const [writerFallbackEnabled, setWriterFallbackEnabled] = useState(true);
  const [writerFallbackModel, setWriterFallbackModel] = useState("ag/claude-opus-4-6-thinking");
  const [writerFallbackProvider, setWriterFallbackProvider] = useState<"api_1" | "api_2">("api_1");

  // ─── Models Drawer & Filter State ───
  const [fetchedModels, setFetchedModels] = useState<ModelItem[]>([]);
  const [modelFilterSource, setModelFilterSource] = useState<"all" | "api_1" | "api_2">("all");
  const [modelSearch, setModelSearch] = useState("");
  const [activeTargetSelector, setActiveTargetSelector] = useState<
    "serpMain" | "serpFallback" | "writerMain" | "writerFallback"
  >("writerMain");

  // ─── Status & Feedback ───
  const [testResult, setTestResult] = useState<{
    source: string;
    success: boolean;
    statusText: string;
    details: string;
  } | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Load active settings from backend
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch(getApiUrl("/api/v1/settings/current"));
        if (res.ok) {
          const data = await res.json();
          // API 1
          if (data.api_1_base_url) setApi1BaseUrl(data.api_1_base_url);
          // API 2
          if (data.api_2_base_url) setApi2BaseUrl(data.api_2_base_url);

          // Box 1 (SERP)
          if (data.model_serp) setSerpModel(data.model_serp);
          if (data.serp_provider) setSerpProvider(data.serp_provider);
          if (typeof data.serp_fallback_enabled === "boolean") {
            setSerpFallbackEnabled(data.serp_fallback_enabled);
          }
          if (data.serp_fallback_model) setSerpFallbackModel(data.serp_fallback_model);
          if (data.serp_fallback_provider) setSerpFallbackProvider(data.serp_fallback_provider);

          // Box 2 (Writer)
          if (data.model_writer) setWriterModel(data.model_writer);
          if (data.writer_provider) setWriterProvider(data.writer_provider);
          if (typeof data.writer_fallback_enabled === "boolean") {
            setWriterFallbackEnabled(data.writer_fallback_enabled);
          }
          if (data.writer_fallback_model) setWriterFallbackModel(data.writer_fallback_model);
          if (data.writer_fallback_provider) setWriterFallbackProvider(data.writer_fallback_provider);
        }
      } catch (e) {
        console.warn("Failed to load settings:", e);
      }
    };
    loadSettings();
  }, []);

  // 1. Test & Fetch API 1 (9Router)
  const handleTestApi1 = async () => {
    setIsTestingApi1(true);
    setTestResult(null);

    try {
      const res = await fetch(getApiUrl("/api/v1/settings/test-gateway"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base_url: api1BaseUrl.trim(),
          api_key: api1ApiKey.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          source: "API 1",
          success: true,
          statusText: "Koneksi API 1 Berhasil!",
          details: `Ditemukan ${data.total_models || data.models?.length || 0} model siap pakai.`,
        });

        if (Array.isArray(data.models)) {
          const newItems: ModelItem[] = data.models.map((m: string) => ({
            id: m,
            source: "api_1",
            sourceName: "API 1",
          }));
          setFetchedModels((prev) => [
            ...prev.filter((item) => item.source !== "api_1"),
            ...newItems,
          ]);
        }
      } else {
        setTestResult({
          source: "API 1",
          success: false,
          statusText: "Koneksi API 1 Gagal",
          details: data.error || "Periksa Base URL dan API Key API 1 Anda.",
        });
      }
    } catch (e) {
      setTestResult({
        source: "API 1",
        success: false,
        statusText: "Error Jaringan",
        details: "Tidak dapat terhubung ke backend server.",
      });
    }
    setIsTestingApi1(false);
  };

  // 2. Test & Fetch API 2 (Re:Link Gateway / OpenRouter)
  const handleTestApi2 = async () => {
    setIsTestingApi2(true);
    setTestResult(null);

    try {
      const res = await fetch(getApiUrl("/api/v1/settings/test-gateway"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base_url: api2BaseUrl.trim(),
          api_key: api2ApiKey.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          source: "API 2",
          success: true,
          statusText: "Koneksi API 2 Berhasil!",
          details: `Ditemukan ${data.total_models || data.models?.length || 0} model siap pakai.`,
        });

        if (Array.isArray(data.models)) {
          const newItems: ModelItem[] = data.models.map((m: string) => ({
            id: m,
            source: "api_2",
            sourceName: "API 2",
          }));
          setFetchedModels((prev) => [
            ...prev.filter((item) => item.source !== "api_2"),
            ...newItems,
          ]);
        }
      } else {
        setTestResult({
          source: "API 2",
          success: false,
          statusText: "Koneksi API 2 Gagal",
          details: data.error || "Periksa Base URL dan API Key API 2 Anda.",
        });
      }
    } catch (e) {
      setTestResult({
        source: "API 2",
        success: false,
        statusText: "Error Jaringan",
        details: "Tidak dapat terhubung ke backend server.",
      });
    }
    setIsTestingApi2(false);
  };

  // 3. Save Settings
  const handleSave = async () => {
    try {
      await fetch(getApiUrl("/api/v1/settings/save"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_1_base_url: api1BaseUrl.trim(),
          api_1_api_key: api1ApiKey.trim(),
          api_2_base_url: api2BaseUrl.trim(),
          api_2_api_key: api2ApiKey.trim(),

          model_serp: serpModel.trim(),
          serp_provider: serpProvider,
          serp_fallback_enabled: serpFallbackEnabled,
          serp_fallback_model: serpFallbackModel.trim() || null,
          serp_fallback_provider: serpFallbackProvider,

          model_writer: writerModel.trim(),
          writer_provider: writerProvider,
          writer_fallback_enabled: writerFallbackEnabled,
          writer_fallback_model: writerFallbackModel.trim() || null,
          writer_fallback_provider: writerFallbackProvider,
        }),
      });
    } catch (e) {
      console.warn("Save settings notice:", e);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Filtered models
  const displayedModels = fetchedModels.filter((m) => {
    const matchSearch = m.id.toLowerCase().includes(modelSearch.toLowerCase());
    const matchSource =
      modelFilterSource === "all" ? true : m.source === modelFilterSource;
    return matchSearch && matchSource;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={`text-base font-semibold ${tk.textPrimary}`}>
            Pengaturan API & Model AI
          </h1>
          <p className={`text-xs ${tk.textMuted} mt-0.5`}>
            Kelola 2 kredensial API dan atur model penulisan artikel dengan opsi fallback darurat.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className={`t-accent-bg flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all active:scale-95 cursor-pointer`}
        >
          {savedSuccess ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
          <span>{savedSuccess ? "Tersimpan!" : "Simpan Pengaturan"}</span>
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

      {/* ─── Kredensial API 1 & API 2 (Grid 2 Kolom Bersih) ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* SLOT API 1 */}
        <div className={`t-card rounded-xl p-5 space-y-4 shadow-sm`}>
          <div className="flex items-center justify-between pb-3 border-b t-border">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg t-bg-tag border t-border flex items-center justify-center text-stone-400">
                <Server className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className={`text-xs font-semibold ${tk.textPrimary}`}>API 1 (misal 9Router)</h3>
                <p className={`text-[11px] ${tk.textMuted}`}>Kredensial gateway pertama</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleTestApi1}
              disabled={isTestingApi1}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all active:scale-95 cursor-pointer disabled:opacity-50 ${tk.outlineBtn}`}
            >
              <RefreshCw className={`w-3 h-3 ${isTestingApi1 ? "animate-spin" : ""}`} />
              <span>{isTestingApi1 ? "Cek..." : "Uji & Fetch"}</span>
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className={`block font-semibold uppercase tracking-wider mb-1 ${tk.textFaint}`}>
                Base URL
              </label>
              <div className="relative">
                <Globe className={`w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 ${tk.textFaint}`} />
                <input
                  type="text"
                  value={api1BaseUrl}
                  onChange={(e) => setApi1BaseUrl(e.target.value)}
                  placeholder="http://host:20128/v1"
                  className={`w-full t-input border rounded-lg pl-8 pr-3 py-1.5 text-xs font-mono t-border-focus`}
                />
              </div>
            </div>

            <div>
              <label className={`block font-semibold uppercase tracking-wider mb-1 ${tk.textFaint}`}>
                API Key
              </label>
              <div className="relative">
                <Key className={`w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 ${tk.textFaint}`} />
                <input
                  type="password"
                  value={api1ApiKey}
                  onChange={(e) => setApi1ApiKey(e.target.value)}
                  placeholder="sk-..."
                  className={`w-full t-input border rounded-lg pl-8 pr-3 py-1.5 text-xs font-mono t-border-focus`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SLOT API 2 */}
        <div className={`t-card rounded-xl p-5 space-y-4 shadow-sm`}>
          <div className="flex items-center justify-between pb-3 border-b t-border">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg t-bg-tag border t-border flex items-center justify-center text-stone-400">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className={`text-xs font-semibold ${tk.textPrimary}`}>API 2 (misal Re:Link / OpenRouter)</h3>
                <p className={`text-[11px] ${tk.textMuted}`}>Kredensial gateway kedua</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleTestApi2}
              disabled={isTestingApi2}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all active:scale-95 cursor-pointer disabled:opacity-50 ${tk.outlineBtn}`}
            >
              <RefreshCw className={`w-3 h-3 ${isTestingApi2 ? "animate-spin" : ""}`} />
              <span>{isTestingApi2 ? "Cek..." : "Uji & Fetch"}</span>
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className={`block font-semibold uppercase tracking-wider mb-1 ${tk.textFaint}`}>
                Base URL
              </label>
              <div className="relative">
                <Globe className={`w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 ${tk.textFaint}`} />
                <input
                  type="text"
                  value={api2BaseUrl}
                  onChange={(e) => setApi2BaseUrl(e.target.value)}
                  placeholder="https://api.relink-gateway.biz.id/v1"
                  className={`w-full t-input border rounded-lg pl-8 pr-3 py-1.5 text-xs font-mono t-border-focus`}
                />
              </div>
            </div>

            <div>
              <label className={`block font-semibold uppercase tracking-wider mb-1 ${tk.textFaint}`}>
                API Key
              </label>
              <div className="relative">
                <Key className={`w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 ${tk.textFaint}`} />
                <input
                  type="password"
                  value={api2ApiKey}
                  onChange={(e) => setApi2ApiKey(e.target.value)}
                  placeholder="sk-..."
                  className={`w-full t-input border rounded-lg pl-8 pr-3 py-1.5 text-xs font-mono t-border-focus`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Konfigurasi Model Routing Pipeline (2 Kotak Persis Dulu + Toggle Fallback) ─── */}
      <div className={`t-card rounded-xl p-5 md:p-6 space-y-5 shadow-sm`}>
        <div className="flex items-center gap-2 pb-3 border-b t-border">
          <Sliders className="w-4 h-4 text-stone-400" />
          <div>
            <h3 className={`text-sm font-semibold ${tk.textPrimary}`}>
              Konfigurasi Model Routing Pipeline
            </h3>
            <p className={`text-xs ${tk.textMuted}`}>
              Atur model untuk masing-masing tahapan artikel. Opsi fallback akan aktif otomatis jika API utama mengalami kendala.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* KOTAK 1: SERP & OUTLINE */}
          <div className={`t-bg-tag border t-border rounded-xl p-4 space-y-3`}>
            <div className="flex items-center justify-between">
              <span className={`font-semibold ${tk.textPrimary}`}>1. SERP & Outline Model</span>
              <select
                value={serpProvider}
                onChange={(e) => setSerpProvider(e.target.value as "api_1" | "api_2")}
                className={`text-[10px] font-mono px-2 py-0.5 rounded border bg-transparent ${tk.monoBadge}`}
              >
                <option value="api_1">Lewat API 1</option>
                <option value="api_2">Lewat API 2</option>
              </select>
            </div>

            <div>
              <label className={`block font-medium mb-1 ${tk.textFaint}`}>Model Utama:</label>
              <input
                type="text"
                value={serpModel}
                onChange={(e) => setSerpModel(e.target.value)}
                placeholder="misal: ag/gemini-3.7-flash-high"
                className={`w-full t-input border rounded-lg px-3 py-1.5 text-xs font-mono t-border-focus`}
              />
              <p className={`text-[11px] mt-1 ${tk.textMuted}`}>
                Dipakai untuk analisa intent kata kunci & perumusan outline JSON.
              </p>
            </div>

            {/* Checkbox Toggle Fallback */}
            <div className="pt-2 border-t t-border">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={serpFallbackEnabled}
                  onChange={(e) => setSerpFallbackEnabled(e.target.checked)}
                  className="rounded border-stone-600 accent-amber-500 cursor-pointer"
                />
                <span className={`text-[11px] font-medium ${serpFallbackEnabled ? "text-amber-400" : tk.textMuted}`}>
                  Aktifkan Fallback Model (jika API utama error)
                </span>
              </label>

              {/* Sub-pilihan Model Fallback */}
              {serpFallbackEnabled && (
                <div className="mt-2.5 p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-amber-300 flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" /> Model Cadangan (SERP):
                    </span>
                    <select
                      value={serpFallbackProvider}
                      onChange={(e) => setSerpFallbackProvider(e.target.value as "api_1" | "api_2")}
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-amber-500/30 bg-black/30 text-amber-200"
                    >
                      <option value="api_2">Gunakan API 2</option>
                      <option value="api_1">Gunakan API 1</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    value={serpFallbackModel}
                    onChange={(e) => setSerpFallbackModel(e.target.value)}
                    placeholder="misal: gemini-4-argon atau deepseek-v4-flash"
                    className="w-full t-input border rounded-lg px-2.5 py-1 text-xs font-mono t-border-focus"
                  />
                </div>
              )}
            </div>
          </div>

          {/* KOTAK 2: SECTION WRITER & SEO POLISH */}
          <div className={`t-bg-tag border t-border rounded-xl p-4 space-y-3`}>
            <div className="flex items-center justify-between">
              <span className={`font-semibold ${tk.textPrimary}`}>2. Section Writer & SEO Polish</span>
              <select
                value={writerProvider}
                onChange={(e) => setWriterProvider(e.target.value as "api_1" | "api_2")}
                className={`text-[10px] font-mono px-2 py-0.5 rounded border bg-transparent ${tk.monoBadge}`}
              >
                <option value="api_2">Lewat API 2</option>
                <option value="api_1">Lewat API 1</option>
              </select>
            </div>

            <div>
              <label className={`block font-medium mb-1 ${tk.textFaint}`}>Model Utama:</label>
              <input
                type="text"
                value={writerModel}
                onChange={(e) => setWriterModel(e.target.value)}
                placeholder="misal: claude-opus-5-5"
                className={`w-full t-input border rounded-lg px-3 py-1.5 text-xs font-mono t-border-focus`}
              />
              <p className={`text-[11px] mt-1 ${tk.textMuted}`}>
                Dipakai untuk penulisan artikel mendalam & optimasi E-E-A-T.
              </p>
            </div>

            {/* Checkbox Toggle Fallback */}
            <div className="pt-2 border-t t-border">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={writerFallbackEnabled}
                  onChange={(e) => setWriterFallbackEnabled(e.target.checked)}
                  className="rounded border-stone-600 accent-amber-500 cursor-pointer"
                />
                <span className={`text-[11px] font-medium ${writerFallbackEnabled ? "text-amber-400" : tk.textMuted}`}>
                  Aktifkan Fallback Model (jika API utama error)
                </span>
              </label>

              {/* Sub-pilihan Model Fallback */}
              {writerFallbackEnabled && (
                <div className="mt-2.5 p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-amber-300 flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" /> Model Cadangan (Writer):
                    </span>
                    <select
                      value={writerFallbackProvider}
                      onChange={(e) => setWriterFallbackProvider(e.target.value as "api_1" | "api_2")}
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-amber-500/30 bg-black/30 text-amber-200"
                    >
                      <option value="api_1">Gunakan API 1</option>
                      <option value="api_2">Gunakan API 2</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    value={writerFallbackModel}
                    onChange={(e) => setWriterFallbackModel(e.target.value)}
                    placeholder="misal: ag/claude-opus-4-6-thinking"
                    className="w-full t-input border rounded-lg px-2.5 py-1 text-xs font-mono t-border-focus"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── Drawer Model Tersedia dari API 1 & API 2 ─── */}
        {fetchedModels.length > 0 && (
          <div className={`border t-border rounded-xl p-4 space-y-3 mt-4 t-bg-tag`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className={`font-semibold ${tk.textPrimary}`}>
                  Model Tersedia ({fetchedModels.length} Model)
                </span>

                {/* Filter Sumber */}
                <div className="flex items-center gap-1 ml-2">
                  <button
                    type="button"
                    onClick={() => setModelFilterSource("all")}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                      modelFilterSource === "all" ? "t-accent-bg border-transparent" : tk.outlineBtn
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    type="button"
                    onClick={() => setModelFilterSource("api_1")}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                      modelFilterSource === "api_1" ? "t-accent-bg border-transparent" : tk.outlineBtn
                    }`}
                  >
                    API 1 ({fetchedModels.filter((m) => m.source === "api_1").length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setModelFilterSource("api_2")}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                      modelFilterSource === "api_2" ? "t-accent-bg border-transparent" : tk.outlineBtn
                    }`}
                  >
                    API 2 ({fetchedModels.filter((m) => m.source === "api_2").length})
                  </button>
                </div>
              </div>

              <div className="relative w-full sm:w-48">
                <Search className={`w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 ${tk.textFaint}`} />
                <input
                  type="text"
                  value={modelSearch}
                  onChange={(e) => setModelSearch(e.target.value)}
                  placeholder="Cari model..."
                  className={`w-full t-input border rounded-lg pl-7 pr-2.5 py-1 text-xs t-border-focus`}
                />
              </div>
            </div>

            {/* Target Selector Action Pills */}
            <div className={`text-xs ${tk.textMuted} flex items-center gap-1.5 flex-wrap pt-1`}>
              <span className="text-[11px]">Pasang model yang diklik ke:</span>
              <button
                type="button"
                onClick={() => setActiveTargetSelector("serpMain")}
                className={`px-2 py-0.5 rounded-lg border text-[11px] font-medium transition-colors ${
                  activeTargetSelector === "serpMain" ? "t-accent-bg border-transparent" : tk.outlineBtn
                }`}
              >
                Model Utama SERP
              </button>
              {serpFallbackEnabled && (
                <button
                  type="button"
                  onClick={() => setActiveTargetSelector("serpFallback")}
                  className={`px-2 py-0.5 rounded-lg border text-[11px] font-medium transition-colors ${
                    activeTargetSelector === "serpFallback" ? "bg-amber-600 text-white border-transparent" : tk.outlineBtn
                  }`}
                >
                  Fallback SERP
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveTargetSelector("writerMain")}
                className={`px-2 py-0.5 rounded-lg border text-[11px] font-medium transition-colors ${
                  activeTargetSelector === "writerMain" ? "t-accent-bg border-transparent" : tk.outlineBtn
                }`}
              >
                Model Utama Writer
              </button>
              {writerFallbackEnabled && (
                <button
                  type="button"
                  onClick={() => setActiveTargetSelector("writerFallback")}
                  className={`px-2 py-0.5 rounded-lg border text-[11px] font-medium transition-colors ${
                    activeTargetSelector === "writerFallback" ? "bg-amber-600 text-white border-transparent" : tk.outlineBtn
                  }`}
                >
                  Fallback Writer
                </button>
              )}
            </div>

            {/* Chip List */}
            <div className={`flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-1.5 rounded-lg border t-border ${tk.cardBgNoBorder}`}>
              {displayedModels.map((m) => {
                const isSerpMain = serpModel === m.id;
                const isSerpFallback = serpFallbackModel === m.id;
                const isWriterMain = writerModel === m.id;
                const isWriterFallback = writerFallbackModel === m.id;

                return (
                  <button
                    key={`${m.source}-${m.id}`}
                    type="button"
                    onClick={() => {
                      if (activeTargetSelector === "serpMain") {
                        setSerpModel(m.id);
                        setSerpProvider(m.source);
                      } else if (activeTargetSelector === "serpFallback") {
                        setSerpFallbackModel(m.id);
                        setSerpFallbackProvider(m.source);
                      } else if (activeTargetSelector === "writerMain") {
                        setWriterModel(m.id);
                        setWriterProvider(m.source);
                      } else if (activeTargetSelector === "writerFallback") {
                        setWriterFallbackModel(m.id);
                        setWriterFallbackProvider(m.source);
                      }
                    }}
                    className={`text-[11px] font-mono px-2 py-1 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSerpMain || isWriterMain
                        ? "t-accent-bg border-transparent"
                        : isSerpFallback || isWriterFallback
                        ? "bg-amber-900/60 text-amber-200 border-amber-500/40"
                        : `${tk.tagBg} ${tk.textSecondary} hover:border-[#78716c]`
                    }`}
                  >
                    <span
                      className={`text-[9px] px-1 rounded font-bold ${
                        m.source === "api_1" ? "bg-blue-500/20 text-blue-300" : "bg-emerald-500/20 text-emerald-300"
                      }`}
                    >
                      {m.source === "api_1" ? "API 1" : "API 2"}
                    </span>
                    <span>{m.id}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
