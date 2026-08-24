"use client";

import { useState, useEffect, useRef } from "react";
import {
  Terminal,
  ChevronDown,
  ChevronUp,
  Activity,
  Maximize2,
  Trash2,
  CheckCircle2,
  Loader2,
  Server,
  Zap,
} from "lucide-react";
import { useTokens } from "@/lib/use-tokens";
import { TerminalLog, getStoredTerminalLogs, TerminalStatus } from "@/lib/terminal-bus";
import { getApiUrl } from "@/lib/api-config";

interface SidebarTerminalProps {
  collapsed?: boolean;
}

export function SidebarTerminal({ collapsed = false }: SidebarTerminalProps) {
  const tk = useTokens();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [gatewayStatus, setGatewayStatus] = useState<"online" | "offline">("online");
  const [jobStatus, setJobStatus] = useState<TerminalStatus>("idle");
  const [activeTask, setActiveTask] = useState<string>("daemon idle");
  const [logs, setLogs] = useState<TerminalLog[]>([]);

  const logEndRef = useRef<HTMLDivElement>(null);

  // Client-side hydration mount
  useEffect(() => {
    setMounted(true);
    const stored = getStoredTerminalLogs();
    if (stored && stored.length > 0) {
      setLogs(stored);
    } else {
      const now = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setLogs([
        { id: "1", time: now, type: "SYS", message: "Hariyuka Daemon v1.0 online" },
        { id: "2", time: now, type: "API", message: "9Router Gateway: 200 OK" },
        { id: "3", time: now, type: "SEO", message: "Yoast 12-Rules SOP Loaded" },
      ]);
    }

    const handleLogEvent = (e: Event) => {
      const custom = e as CustomEvent<TerminalLog>;
      if (custom.detail) {
        setLogs((prev) => [...prev.slice(-30), custom.detail]);
      }
    };

    const handleStatusEvent = (e: Event) => {
      const custom = e as CustomEvent<{ status: TerminalStatus; activeTask?: string }>;
      if (custom.detail) {
        setJobStatus(custom.detail.status);
        if (custom.detail.activeTask) {
          setActiveTask(custom.detail.activeTask);
        }
      }
    };

    window.addEventListener("hariyuka:log", handleLogEvent);
    window.addEventListener("hariyuka:status", handleStatusEvent);
    return () => {
      window.removeEventListener("hariyuka:log", handleLogEvent);
      window.removeEventListener("hariyuka:status", handleStatusEvent);
    };
  }, []);

  // Auto scroll terminal to bottom when new logs arrive
  useEffect(() => {
    if (isOpen && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, isOpen]);

  // Periodic heartbeat & status check to 9Router backend
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch(getApiUrl("/health"));
        if (res.ok) {
          setGatewayStatus("online");
        } else {
          setGatewayStatus("offline");
        }
      } catch (e) {
        setGatewayStatus("offline");
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleClearLogs = () => {
    const now = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const resetLog: TerminalLog = {
      id: String(Date.now()),
      time: now,
      type: "SYS",
      message: "Terminal buffer cleared",
    };
    setLogs([resetLog]);
    try {
      sessionStorage.removeItem("hariyuka_terminal_logs");
    } catch (e) {}
  };

  const getTypeColor = (type: TerminalLog["type"]) => {
    switch (type) {
      case "SYS":
        return "text-[#a8a29e]";
      case "API":
        return "text-cyan-400";
      case "JOB":
        return "text-amber-400";
      case "SEO":
        return "text-[#d97757]";
      case "OK":
        return "text-emerald-400";
      case "ERR":
        return "text-red-400";
      default:
        return "text-stone-400";
    }
  };

  if (!mounted) {
    return (
      <div className="mx-2 mb-2 rounded-xl border border-[#2c2926] bg-[#0f0e0c] h-8 flex items-center px-2.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 opacity-50" />
        <span className="ml-1.5 text-[10px] font-mono text-[#78716c]">TERMINAL</span>
      </div>
    );
  }

  // If sidebar is collapsed (w-60px), show miniature icon indicator
  if (collapsed) {
    return (
      <div className="p-2 border-t t-border flex justify-center">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 rounded-lg t-bg-tag hover:border-[#d97757] transition-all text-stone-400 cursor-pointer"
          title={`Background Terminal: ${jobStatus.toUpperCase()} (${gatewayStatus.toUpperCase()})`}
        >
          <Terminal className="w-4 h-4" />
          <span
            className={`w-2 h-2 rounded-full absolute top-1 right-1 ${
              jobStatus === "running"
                ? "bg-amber-400 animate-pulse shadow-sm shadow-amber-400/50"
                : gatewayStatus === "online"
                ? "bg-emerald-500 shadow-sm"
                : "bg-red-500"
            }`}
          />
        </button>
      </div>
    );
  }

  return (
    <div className="mx-2 mb-2 rounded-xl border border-[#2c2926] bg-[#0f0e0c] shadow-sm overflow-hidden flex flex-col transition-all">
      {/* ─── TERMINAL HEADER BAR ─── */}
      <div className="h-8 px-2.5 bg-[#171513] border-b border-[#24211e] flex items-center justify-between select-none">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-wider text-[#a8a29e] hover:text-white transition-colors cursor-pointer"
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              jobStatus === "running"
                ? "bg-amber-400 animate-pulse shadow-sm shadow-amber-400/50"
                : gatewayStatus === "online"
                ? "bg-emerald-400 shadow-sm shadow-emerald-400/50"
                : "bg-red-400"
            }`}
          />
          <Terminal className="w-3 h-3 text-[#d97757]" />
          <span>TERMINAL</span>
          <span className="text-[9px] font-normal text-[#78716c]">
            {isOpen ? "(BUKA)" : "(TUTUP)"}
          </span>
        </button>

        <div className="flex items-center gap-1">
          {isOpen && (
            <button
              type="button"
              onClick={handleClearLogs}
              className="p-1 rounded text-[#78716c] hover:text-[#f5f5f4] transition-colors cursor-pointer"
              title="Bersihkan Buffer Log"
            >
              <Trash2 className="w-2.5 h-2.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 rounded text-[#78716c] hover:text-[#f5f5f4] transition-colors cursor-pointer"
            title={isOpen ? "Tutup Terminal" : "Buka Terminal"}
          >
            {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* ─── TERMINAL BODY OUTPUT (COLLAPSIBLE) ─── */}
      {isOpen && (
        <div className="p-2.5 font-mono text-[10px] leading-tight space-y-1.5 max-h-[140px] overflow-y-auto bg-[#0a0908] scrollbar-thin">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-1.5 break-all animate-in fade-in duration-100">
              <span className="text-[#57534e] shrink-0" suppressHydrationWarning>{log.time}</span>
              <span className={`font-bold shrink-0 ${getTypeColor(log.type)}`}>
                [{log.type}]
              </span>
              <span className="text-[#d6d3d1]">{log.message}</span>
            </div>
          ))}

          {/* Active status & prompt cursor */}
          <div className="flex items-center gap-1.5 pt-0.5 text-[#78716c]">
            {jobStatus === "running" ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-amber-400 shrink-0" />
                <span className="text-[9px] text-amber-300 font-semibold">{activeTask}</span>
              </>
            ) : (
              <>
                <span className="text-emerald-500 font-bold">❯</span>
                <span className="text-[9px] text-[#78716c]">{activeTask}</span>
                <span className="w-1.5 h-3 bg-[#d97757] animate-pulse inline-block" />
              </>
            )}
          </div>

          <div ref={logEndRef} />
        </div>
      )}
    </div>
  );
}
