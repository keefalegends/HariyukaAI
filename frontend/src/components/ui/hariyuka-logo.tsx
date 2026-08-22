"use client";

import React from "react";
import Image from "next/image";

interface HariyukaLogoProps {
  className?: string;
  variant?: "white" | "dark" | "default";
}

export function HariyukaLogo({ className = "w-5 h-5", variant = "white" }: HariyukaLogoProps) {
  // If variant is white (e.g. inside terracotta accent box or dark background), invert the black PNG
  const filterClass = variant === "white" ? "brightness-0 invert" : variant === "dark" ? "brightness-0" : "";

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <img
        src="/logo.png"
        alt="Hariyuka AI Logo"
        className={`w-full h-full object-contain ${filterClass}`}
      />
    </div>
  );
}
