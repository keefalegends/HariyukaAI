"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Globe, Eye, EyeOff, Terminal, Info, X, ShieldAlert, ArrowRight, Loader2 } from "lucide-react";
import { HariyukaLogo } from "@/components/ui/hariyuka-logo";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/dashboard";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showAboutModal, setShowAboutModal] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg("Operator ID dan Passphrase wajib diisi.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Successful login, redirect to dashboard or intended route
        router.push(from);
        router.refresh();
      } else {
        setErrorMsg(data.error || "Kredensial Operator tidak valid. Akses ditolak.");
        setIsLoading(false);
      }
    } catch (err) {
      setErrorMsg("Gagal menghubungi server gateway autentikasi.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0c0b] text-[#f5f5f4] flex flex-col items-center justify-center p-4 selection:bg-[#d97757] selection:text-white font-mono">
      {/* ─── ABOUT MODAL ─── */}
      {showAboutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowAboutModal(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-xl border border-[#44403c] bg-[#1c1917] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#2c2926] pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#d97757]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#f5f5f4]">
                  SYSTEM GATEWAY ARCHITECTURE
                </h3>
              </div>
              <button
                onClick={() => setShowAboutModal(false)}
                className="p-1 rounded text-[#a8a29e] hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#a8a29e] font-sans leading-relaxed">
              <p>
                <strong className="text-white font-mono">Hariyuka AI</strong> adalah sistem SEO Article Generator berbasis multi-step agentic AI pipeline untuk operator terverifikasi.
              </p>
              <div className="p-3 rounded-lg bg-[#141210] border border-[#2c2926] font-mono text-[11px] space-y-1.5">
                <div className="text-[#d97757]">// OPERATORS:</div>
                <div className="text-white">• Keefa — Architect & Developer</div>
                <div className="text-white">• Salna — Content Strategist & Helper</div>
                <div className="text-[#78716c] text-[10px] mt-1">// CONFIG: Set via AUTH_USERS in .env</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── MAIN GATEWAY TERMINAL CARD (Exact 1:1 Match with Screenshot) ─── */}
      <div className="w-full max-w-[440px] rounded-xl border border-[#2c2926] bg-[#141210] p-6 sm:p-8 shadow-2xl space-y-6 relative">
        {/* Top bar */}
        <div className="flex items-center justify-between text-[11px] text-[#78716c] pb-3 border-b border-[#24211e]">
          <div className="flex items-center gap-1.5 text-[#d97757] hover:underline cursor-pointer">
            <Globe className="w-3.5 h-3.5" />
            <span className="font-semibold tracking-wide">hariyuka.ai</span>
            <span className="text-[10px]">↗</span>
          </div>

          <button
            type="button"
            onClick={() => setShowAboutModal(true)}
            className="hover:text-[#f5f5f4] transition-colors tracking-wider font-semibold cursor-pointer"
          >
            // ABOUT
          </button>
        </div>

        {/* Second header line: Status & Version */}
        <div className="flex items-center justify-between text-[11px] tracking-wider text-[#a8a29e]">
          <div className="flex items-center gap-2 font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#d97757] animate-pulse" />
            <span className="text-[#d97757]">GATEWAY</span>
            <span>//</span>
            <span className="text-[#78716c]">AUTH_REQUIRED</span>
          </div>
          <span className="text-[#57534e] text-[10px] font-bold font-mono">v1.0.0</span>
        </div>

        {/* Main Branding */}
        <div className="text-center py-2 space-y-2.5 flex flex-col items-center">
          <div className="w-10 h-10 rounded-xl bg-[#d97757]/15 border border-[#d97757]/40 flex items-center justify-center p-2 text-[#d97757] shadow-lg shadow-[#d97757]/10">
            <HariyukaLogo className="w-full h-full" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-[0.25em] text-[#f5f5f4]">
              HARIYUKA<span className="text-[#d97757]">·</span>AI
            </h1>
            <p className="text-[11px] text-[#78716c] tracking-wide font-sans mt-0.5">
              Personal Console & Multi-Agent SEO Ground
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-lg border border-red-500/40 bg-red-950/30 text-red-300 text-xs flex items-start gap-2 animate-in fade-in">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="font-mono text-[11px] leading-tight">
              <span className="font-bold text-red-400">[AUTH_ERROR]</span> {errorMsg}
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 pt-1">
          {/* Operator ID Field */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#78716c]">
              OPERATOR ID / USERNAME
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#d97757] font-bold text-xs select-none">
                &gt;
              </span>
              <input
                type="text"
                required
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="operator username..."
                className="w-full bg-[#1c1917] border border-[#34302c] focus:border-[#d97757] rounded-lg pl-8 pr-4 py-2.5 text-xs text-[#f5f5f4] placeholder:text-[#57534e] font-mono focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Passphrase Field */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#78716c]">
              PASSPHRASE
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#78716c] font-bold text-xs select-none">
                #
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#1c1917] border border-[#34302c] focus:border-[#d97757] rounded-lg pl-8 pr-10 py-2.5 text-xs text-[#f5f5f4] placeholder:text-[#57534e] font-mono focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716c] hover:text-[#f5f5f4] transition-colors p-1"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || !username.trim() || !password.trim()}
              className="w-full py-3 px-4 rounded-lg border border-[#d97757] bg-[#d97757]/10 hover:bg-[#d97757] text-[#d97757] hover:text-white font-bold text-xs uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[#d97757]/5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>AUTHENTICATING...</span>
                </>
              ) : (
                <>
                  <span>AUTHENTICATE & ENTER</span>
                  <span className="text-sm font-normal">&gt;</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="pt-2 text-center border-t border-[#24211e]">
          <p className="text-[9px] font-mono text-[#57534e] uppercase tracking-wider">
            // ACCESS RESTRICTED TO AUTHORIZED OPERATORS ONLY
          </p>
        </div>
      </div>
    </div>
  );
}
