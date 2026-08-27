"use client";

import { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  Loader2,
  X,
  RotateCcw,
  Check,
  Bot,
  User,
  ChevronDown,
  Wand2,
  Trash2,
} from "lucide-react";
import { useTokens } from "@/lib/use-tokens";
import { getApiUrl } from "@/lib/api-config";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  explanation?: string;
  modifiedContent?: string;
  wordCount?: number;
  seoScore?: number;
  timestamp: string;
}

interface AiCopilotChatProps {
  articleId: string;
  currentContent: string;
  onApplyContent: (newContent: string, newAudit?: any) => void;
  onUndoContent?: () => void;
  canUndo?: boolean;
  onClose: () => void;
}

const DEFAULT_MODELS = [
  { id: "ag/claude-opus-4-6-thinking", label: "Claude 4.6 Opus Thinking (Direkomendasikan)" },
  { id: "ag/gemini-3.7-flash-high", label: "Gemini 3.7 Flash Thinking" },
  { id: "ag/claude-sonnet-4-6", label: "Claude 4.6 Sonnet" },
];

const QUICK_PROMPTS = [
  "Tambahkan 1 tips praktis baru di H2 terakhir, minimal 3 kalimat sesuai SOP",
  "Ubah gaya bahasa agar lebih santai, mengalir, dan bertutur penutur asli Indonesia",
  "Pangkas sekitar 40 kata agar panjang artikel lebih pas tanpa mengurangi inti bahasan",
  "Perkuat penempatan focus keyphrase di kalimat awal pembuka dan kesimpulan",
  "Tambahkan tabel perbandingan kelebihan dan kekurangan sebelum bagian kesimpulan",
];

export function AiCopilotChat({
  articleId,
  currentContent,
  onApplyContent,
  onUndoContent,
  canUndo = false,
  onClose,
}: AiCopilotChatProps) {
  const tk = useTokens();
  const [selectedModel, setSelectedModel] = useState("ag/claude-opus-4-6-thinking");
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [inputPrompt, setInputPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [appliedMessageId, setAppliedMessageId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      role: "assistant",
      content:
        "Halo! Saya asisten AI Copilot Hariyuka. Tulis instruksi revisi apa pun di bawah, dan saya akan memperbarui artikel di sebelah kanan secara langsung. Anda juga bisa menggunakan tombol aksi cepat di bawah.",
      timestamp: "Baru saja",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 1. Auto-load persisted chat history from backend
  useEffect(() => {
    if (!articleId) return;
    const loadChatHistory = async () => {
      try {
        const res = await fetch(getApiUrl(`/api/v1/articles/${articleId}/copilot-chat`));
        if (res.ok) {
          const data = await res.json();
          if (data.messages && data.messages.length > 0) {
            setMessages(data.messages);
          }
        }
      } catch (err) {
        console.error("Failed to load chat history:", err);
      }
    };
    loadChatHistory();
  }, [articleId]);

  const handleClearChat = async () => {
    if (!window.confirm("Hapus semua riwayat percakapan untuk artikel ini?")) return;
    try {
      await fetch(getApiUrl(`/api/v1/articles/${articleId}/copilot-chat`), {
        method: "DELETE",
      });
      setMessages([
        {
          id: "welcome-1",
          role: "assistant",
          content:
            "Riwayat percakapan telah direset. Tulis instruksi revisi baru Anda di bawah.",
          timestamp: "Baru saja",
        },
      ]);
    } catch (err) {
      console.error("Failed to clear chat history:", err);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (promptText?: string) => {
    const textToSend = (promptText || inputPrompt).trim();
    if (!textToSend || isLoading) return;

    const userMessageId = `user-${Date.now()}`;
    const newUserMessage: ChatMessage = {
      id: userMessageId,
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputPrompt("");
    setIsLoading(true);

    try {
      // Build history for context
      const chatHistory = messages
        .filter((m) => m.id !== "welcome-1")
        .map((m) => ({
          role: m.role,
          content: m.role === "user" ? m.content : (m.explanation || m.content),
        }));

      const res = await fetch(getApiUrl(`/api/v1/articles/${articleId}/ai-edit`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instruction: textToSend,
          current_content_markdown: currentContent,
          model: selectedModel,
          chat_history: chatHistory,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Gagal memproses instruksi AI");
      }

      const data = await res.json();
      const assistantMessageId = `asst-${Date.now()}`;
      const newAssistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: "assistant",
        content: data.explanation || "Perubahan telah diterapkan pada artikel.",
        explanation: data.explanation,
        modifiedContent: data.modified_content_markdown,
        wordCount: data.word_count,
        seoScore: data.seo_score,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, newAssistantMessage]);

      // Auto-apply change to editor
      if (data.modified_content_markdown) {
        onApplyContent(data.modified_content_markdown, data.seo_audit);
        setAppliedMessageId(assistantMessageId);
      }
    } catch (err: any) {
      console.error("AI Edit error:", err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: `⚠️ Maaf, terjadi kesalahan: ${err.message || "Gagal menghubungi AI Gateway"}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={`flex flex-col h-full t-card border t-border rounded-2xl overflow-hidden font-sans shadow-sm`}>
      {/* Header bar (Claude style) */}
      <div className="flex items-center justify-between px-4 py-3 border-b t-border t-bg-tag">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#d97757]/20 border border-[#d97757]/40 flex items-center justify-center text-[#d97757] shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold ${tk.textPrimary}`}>AI Copilot</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded border t-border t-bg-card ${tk.textFaint} font-mono`}>
                Split-View
              </span>
            </div>
            <p className={`text-[10px] ${tk.textMuted}`}>Claude Artifacts Editor Assistant</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Model Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowModelPicker(!showModelPicker)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border t-border t-bg-card ${tk.textPrimary} text-[11px] font-mono transition-colors cursor-pointer hover:border-[#d97757]/50`}
            >
              <span className="max-w-[130px] truncate">
                {DEFAULT_MODELS.find((m) => m.id === selectedModel)?.label.split(" ")[0] || selectedModel}
              </span>
              <ChevronDown className={`w-3 h-3 ${tk.textFaint}`} />
            </button>

            {showModelPicker && (
              <div className={`absolute right-0 top-full mt-1.5 w-64 p-1.5 rounded-xl border t-border t-card shadow-2xl z-50 text-xs space-y-1`}>
                <div className={`text-[10px] uppercase font-bold ${tk.textFaint} px-2 py-1`}>Pilih Model 9Router</div>
                {DEFAULT_MODELS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setSelectedModel(m.id);
                      setShowModelPicker(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] transition-colors flex items-center justify-between cursor-pointer ${
                      selectedModel === m.id
                        ? "bg-[#d97757] text-white font-semibold"
                        : `${tk.textPrimary} hover:t-bg-tag`
                    }`}
                  >
                    <span className="truncate">{m.label}</span>
                    {selectedModel === m.id && <Check className="w-3 h-3 shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reset / Clear Chat Button */}
          {messages.length > 1 && (
            <button
              type="button"
              onClick={handleClearChat}
              title="Reset / Bersihkan Riwayat Chat"
              className={`w-7 h-7 rounded-lg border t-border hover:bg-red-500/10 hover:border-red-500/30 flex items-center justify-center ${tk.textMuted} hover:text-red-400 transition-colors cursor-pointer`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Close Split View */}
          <button
            type="button"
            onClick={onClose}
            title="Tutup Mode Copilot"
            className={`w-7 h-7 rounded-lg border t-border hover:bg-stone-500/10 flex items-center justify-center ${tk.textMuted} hover:${tk.textPrimary} transition-colors cursor-pointer`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
          >
            {/* Sender Label */}
            <div className={`flex items-center gap-1.5 text-[10px] ${tk.textFaint} mb-1 px-1`}>
              {msg.role === "user" ? (
                <>
                  <span>Anda</span>
                  <User className="w-3 h-3" />
                </>
              ) : (
                <>
                  <Bot className="w-3 h-3 text-[#d97757]" />
                  <span className={`${tk.textMuted} font-medium`}>Claude Copilot</span>
                </>
              )}
              <span>• {msg.timestamp}</span>
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[88%] rounded-2xl p-3.5 leading-relaxed ${
                msg.role === "user"
                  ? "bg-[#d97757]/20 border border-[#d97757]/40 t-text-primary rounded-tr-sm"
                  : "t-bg-tag border t-border t-text-primary rounded-tl-sm space-y-2.5 shadow-sm"
              }`}
            >
              <div className="text-xs whitespace-pre-wrap t-text-primary">{msg.content}</div>

              {/* Action and Metric Badges for Assistant revisions */}
              {msg.modifiedContent && (
                <div className="pt-2 border-t t-border flex items-center justify-between gap-2 flex-wrap text-[11px]">
                  <div className="flex items-center gap-2 font-mono text-[10px]">
                    <span className={`px-2 py-0.5 rounded t-bg-card border t-border ${tk.textMuted}`}>
                      {msg.wordCount} kata
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                      SEO: {msg.seoScore}/100
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {appliedMessageId === msg.id ? (
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                        <Check className="w-3 h-3" /> Aktif di Editor
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          if (msg.modifiedContent) {
                            onApplyContent(msg.modifiedContent);
                            setAppliedMessageId(msg.id);
                          }
                        }}
                        className="px-2.5 py-1 rounded-md bg-[#d97757] hover:bg-[#c26445] text-white text-[10px] font-semibold transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Wand2 className="w-3 h-3" />
                        Terapkan
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading Spinner Indicator */}
        {isLoading && (
          <div className="flex flex-col items-start">
            <div className={`flex items-center gap-1.5 text-[10px] ${tk.textFaint} mb-1 px-1`}>
              <Bot className="w-3 h-3 text-[#d97757]" />
              <span className={tk.textMuted}>Claude Copilot sedang merevisi...</span>
            </div>
            <div className={`rounded-2xl rounded-tl-sm p-3.5 t-bg-tag border t-border flex items-center gap-2.5 text-xs ${tk.textPrimary}`}>
              <Loader2 className="w-4 h-4 text-[#d97757] animate-spin" />
              <span>Memproses instruksi & merevisi draf artikel...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Suggestions */}
      <div className="px-4 py-2 border-t t-border t-bg-tag">
        <div className={`text-[10px] uppercase font-bold ${tk.textFaint} mb-1.5 flex items-center justify-between`}>
          <span>Inspirasi Instruksi Cepat</span>
          {canUndo && (
            <button
              type="button"
              onClick={onUndoContent}
              className="text-[10px] text-amber-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Batalkan Perubahan Terakhir (Undo)
            </button>
          )}
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {QUICK_PROMPTS.map((qp, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(qp)}
              disabled={isLoading}
              className={`shrink-0 px-2.5 py-1 rounded-lg border t-border t-bg-card hover:border-[#d97757]/60 ${tk.textPrimary} text-[10px] transition-all cursor-pointer truncate max-w-[240px]`}
              title={qp}
            >
              {qp}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Input Area */}
      <div className="p-3 border-t t-border t-bg-tag">
        <div className="relative rounded-xl border t-border t-bg-card focus-within:border-[#d97757] transition-all shadow-inner">
          <textarea
            ref={textareaRef}
            rows={2}
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="Tulis instruksi revisi ke Claude... (Tekan Enter untuk kirim)"
            className={`w-full bg-transparent px-3.5 py-2.5 text-xs ${tk.textPrimary} placeholder:opacity-50 placeholder:t-text-muted focus:outline-none resize-none leading-relaxed`}
          />

          <div className={`flex items-center justify-between px-3 py-1.5 border-t t-border t-bg-tag/50 rounded-b-xl text-[10px] ${tk.textFaint}`}>
            <span>Shift + Enter untuk baris baru</span>
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!inputPrompt.trim() || isLoading}
              className="px-3 py-1 rounded-lg bg-[#d97757] hover:bg-[#c26445] disabled:opacity-40 text-white font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Kirim</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
