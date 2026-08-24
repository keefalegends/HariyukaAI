"use client";

export type LogType = "SYS" | "API" | "JOB" | "SEO" | "OK" | "ERR";
export type TerminalStatus = "idle" | "running" | "completed" | "error";

export interface TerminalLog {
  id: string;
  time: string;
  type: LogType;
  message: string;
}

const STORAGE_KEY = "hariyuka_terminal_logs";
const STATUS_KEY = "hariyuka_terminal_status";

export function logTerminal(type: LogType, message: string) {
  if (typeof window === "undefined") return;

  const entry: TerminalLog = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    type,
    message,
  };

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const prev: TerminalLog[] = raw ? JSON.parse(raw) : [];
    const updated = [...prev.slice(-30), entry];
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    // Ignore storage issues
  }

  window.dispatchEvent(new CustomEvent("hariyuka:log", { detail: entry }));
}

export function setTerminalStatus(status: TerminalStatus, activeTask?: string) {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.setItem(STATUS_KEY, JSON.stringify({ status, activeTask, time: Date.now() }));
  } catch (e) {}

  window.dispatchEvent(new CustomEvent("hariyuka:status", { detail: { status, activeTask } }));
}

export function getStoredTerminalLogs(): TerminalLog[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}
