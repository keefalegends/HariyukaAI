"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useTokens } from "@/lib/use-tokens";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const tk = useTokens();
  return (
    <div className={`flex min-h-screen t-bg-page transition-colors`}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-[1100px] mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
