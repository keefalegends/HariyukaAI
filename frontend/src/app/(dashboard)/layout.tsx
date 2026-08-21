"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useTheme } from "@/contexts/theme-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`flex min-h-screen transition-colors ${isDark ? "bg-[#09090b]" : "bg-[#fafafa]"}`}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className={`flex-1 p-6 md:p-8 overflow-y-auto max-w-[1100px] mx-auto w-full transition-colors ${isDark ? "text-white" : "text-[#09090b]"}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
