"use client";

import React from "react";
import { useTheme } from "@/contexts/theme-context";

interface HariyukaLogoProps {
  className?: string;
  variant?: "auto" | "white" | "dark";
}

export function HariyukaLogo({ className = "w-5 h-5", variant = "auto" }: HariyukaLogoProps) {
  let isLight = false;
  try {
    const { theme } = useTheme();
    isLight = theme === "light";
  } catch (e) {
    isLight = false;
  }

  // Khusus Tema Putih (Light Theme): Beri background hitam rounded agar logo putih terlihat kontras dan tegas
  if (isLight && variant !== "dark") {
    return (
      <div className="w-7 h-7 rounded-lg bg-[#18181b] border border-stone-300 flex items-center justify-center p-1.5 shrink-0 shadow-sm">
        <img
          src="/logo.png"
          alt="Hariyuka AI Logo"
          className="w-full h-full object-contain brightness-0 invert"
        />
      </div>
    );
  }

  // Tema Gelap & Warm (Dark / Warm Theme): Logo putih bersih tanpa background
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <img
        src="/logo.png"
        alt="Hariyuka AI Logo"
        className="w-full h-full object-contain brightness-0 invert"
      />
    </div>
  );
}
