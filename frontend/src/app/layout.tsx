import type { Metadata } from "next";
import "./globals.css";
import "./theme.css";
import { ThemeProvider } from "@/contexts/theme-context";

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
      <body className="min-h-screen antialiased selection:bg-zinc-700 selection:text-white">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
