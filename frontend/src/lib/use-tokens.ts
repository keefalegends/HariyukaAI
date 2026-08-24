/**
 * useTokens — returns Tailwind class strings mapped to CSS custom properties.
 * Usage: const tk = useTokens();
 * All classes reference --css-variables defined in theme.css.
 */
import { useTheme } from "@/contexts/theme-context";

export function useTokens() {
  const { theme } = useTheme();
  const isWarm  = theme === "warm";
  const isLight = theme === "light";
  const isDark  = theme === "dark";

  return {
    theme, isWarm, isLight, isDark,
    
    // Backgrounds
    pageBg:       "t-bg-page",
    cardBg:       "t-bg-card border t-border t-card",
    cardBgNoBorder: "t-bg-card",
    inputBg:      "t-input",
    tagBg:        "t-bg-tag t-border border",
    hoverCard:    "t-bg-card-hover",

    // Text
    textPrimary:  "t-text-primary",
    textSecondary:"t-text-secondary",
    textMuted:    "t-text-muted",
    textFaint:    "t-text-faint",

    // Accent CTA button
    accentBtn:    "t-accent-bg",
    accentText:   "t-accent-text",

    // Secondary button (outline)
    outlineBtn: isLight
      ? "border border-stone-300 text-stone-700 hover:bg-stone-100"
      : isWarm
      ? "border border-[#44403c] text-[#a8a29e] hover:bg-[#312e2b] hover:text-[#f5f5f4]"
      : "border border-[#27272a] text-[#71717a] hover:bg-[#1e1e21] hover:text-white",

    // Divider
    divider:    "border-t t-border",
    dividerRow: isLight ? "divide-[#f4f0eb]" : isWarm ? "divide-[#312e2b]" : "divide-[#1e1e21]",

    // Active nav link
    navActive: isLight
      ? "bg-[#f4f0eb] text-[#1c1917] font-semibold"
      : isWarm
      ? "bg-[#312e2b] text-[#f5f5f4] font-semibold"
      : "bg-[#27272a] text-white font-semibold",

    navInactive: isLight
      ? "text-[#78716c] hover:bg-[#f4f0eb] hover:text-[#1c1917]"
      : isWarm
      ? "text-[#78716c] hover:bg-[#312e2b] hover:text-[#f5f5f4]"
      : "text-[#71717a] hover:bg-[#1e1e21] hover:text-white",

    // Sidebar & header
    sidebarClass:  "t-sidebar",
    headerClass:   "t-header",

    // Mono badge
    monoBadge: isLight
      ? "bg-[#f4f0eb] border-[#e7e5e4] text-[#78716c]"
      : isWarm
      ? "bg-[#312e2b] border-[#44403c] text-[#a8a29e]"
      : "bg-[#1e1e21] border-[#27272a] text-[#71717a]",

    // Status colors
    statusSuccess: isLight ? "text-emerald-600" : "text-emerald-400",
    statusPending: isLight ? "text-amber-600"   : "text-amber-400",
    statusFailed:  isLight ? "text-red-600"     : "text-red-400",
    statusRunning: isLight ? "text-blue-600"    : "text-blue-400",
    statusDraft:   "t-text-faint",

    // Length selector button
    lenActive: isLight
      ? "bg-[#d97757] border-[#d97757] text-white"
      : isWarm
      ? "bg-[#d97757] border-[#d97757] text-white"
      : "bg-[#1e1e21] border-[#3f3f46] text-white",

    lenInactive: isLight
      ? "bg-white border-[#e7e5e4] text-[#78716c] hover:border-[#c4b5a5]"
      : isWarm
      ? "bg-[#211f1c] border-[#44403c] text-[#78716c] hover:border-[#d97757] hover:text-[#a8a29e]"
      : "bg-[#121215] border-[#27272a] text-[#71717a] hover:border-[#3f3f46]",
  };
}
