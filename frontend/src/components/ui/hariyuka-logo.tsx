import React from "react";

interface HariyukaLogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export function HariyukaLogo({ className = "w-4 h-4", ...props }: HariyukaLogoProps) {
  return (
    <svg
      viewBox="0 0 100 130"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Outer Window Frame */}
      <rect
        x="8"
        y="8"
        width="84"
        height="114"
        rx="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="9"
      />
      {/* 3 Header Dots */}
      <circle cx="23" cy="23" r="4.5" fill="currentColor" />
      <circle cx="36" cy="23" r="4.5" fill="currentColor" />
      <circle cx="49" cy="23" r="4.5" fill="currentColor" />
      {/* Hero Banner Box */}
      <rect x="20" y="38" width="60" height="26" rx="5" fill="currentColor" />
      {/* Subheading Short Bar */}
      <rect x="20" y="74" width="20" height="6.5" rx="3.25" fill="currentColor" />
      {/* Body Content Bars */}
      <rect x="20" y="88" width="60" height="6.5" rx="3.25" fill="currentColor" />
      <rect x="20" y="102" width="60" height="6.5" rx="3.25" fill="currentColor" />
    </svg>
  );
}
