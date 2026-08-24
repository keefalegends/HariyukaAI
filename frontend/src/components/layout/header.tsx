"use client";

import { useState } from "react";
import { Search, Zap, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { useTokens } from "@/lib/use-tokens";
import { getApiUrl } from "@/lib/api-config";

export function Header() {
  const tk = useTokens();
  const [testing, setTesting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);

  const handleTestApi = async () => {
    setTesting(true);
    setStatusMsg(null);
    try {
      const res = await fetch(getApiUrl("/api/v1/settings/test-9router"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsSuccess(true);
        setStatusMsg(`Online (${data.total_models || data.models?.length || 12} Models)`);
      } else {
        setIsSuccess(false);
        setStatusMsg("Gagal Terhubung");
      }
    } catch {
      setIsSuccess(false);
      setStatusMsg("Backend Offline");
    }
    setTesting(false);
    setTimeout(() => {
      setStatusMsg(null);
      setIsSuccess(null);
    }, 4000);
  };

  return (
    <header className={`h-14 border-b px-6 flex items-center justify-between sticky top-0 z-30 t-header transition-colors`}>
      {/* Search */}
      <div className="relative w-64">
        <Search className="w-3.5 h-3.5 t-text-faint absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Cari artikel atau keyword..."
          className="t-input w-full border rounded-lg pl-8 pr-3 py-1.5 text-xs t-border-focus transition-colors"
        />
      </div>

      {/* Right: 9Router Status Pill + Live "Tes Koneksi API" Button */}
      <div className="flex items-center gap-3">
        {/* 9Router Status Indicator */}
        <div
          className={`flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full t-bg-tag border transition-colors ${
            isSuccess === false
              ? "border-red-500/40 text-red-400 bg-red-950/20"
              : isSuccess === true
              ? "border-emerald-500/40 text-emerald-300 bg-emerald-950/20"
              : "t-border t-text-faint"
          }`}
        >
          {isSuccess === false ? (
            <AlertCircle className="w-3 h-3 text-red-400 shrink-0" />
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse shrink-0" />
          )}
          <span className="truncate">{statusMsg ? statusMsg : "9Router Online"}</span>
        </div>

        {/* Live Tes Koneksi API Button */}
        <button
          type="button"
          onClick={handleTestApi}
          disabled={testing}
          className="t-accent-bg flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          title="Uji koneksi gateway 9Router"
        >
          {testing ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Zap className="w-3.5 h-3.5" />
          )}
          <span>{testing ? "Menguji..." : "Tes Koneksi API"}</span>
        </button>
      </div>
    </header>
  );
}
