import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hariyuka AI - Next-Gen AI SEO Article Writer",
  description: "Generate human-grade, rank-ready long-form articles with multi-step agentic AI pipeline.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body className="min-h-screen bg-[#090d16] text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
