// app/layout.tsx
import React from 'react';
import '@/app/globals.css'; 
import ResizableSidebar from '@/src/components/ResizableSidebar';
import { Geist, Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from 'sonner';
import { FloatingAIAvatar } from '@/src/components/floatingAiAvatar';

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

export const metadata = {
  title: 'ClarityFi // AI Budget Manager',
  description: 'Intelligent financial tracking built with Next.js',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("h-full bg-slate-950 text-slate-50 antialiased", "font-sans", inter.variable)}>
      <body className="flex h-full overflow-hidden font-sans">
        {/* Persistent Modular Resizable Sidebar Navigation */}
        <ResizableSidebar />

        {/* Main Content Stage */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Navbar with Ambient AI Quick Ingestion */}
          <header className="h-16 border-b border-slate-800 bg-slate-900/30 flex items-center justify-between px-6">
            <div className="w-full max-w-xl">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ask AI or log instantly (e.g., 'Spent $45 on dinner at Grill'd yesterday')..."
                  className="w-full bg-slate-900 text-sm rounded-lg border border-slate-800 px-4 py-2 pl-10 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
                <div className="absolute left-3 top-2.5 text-slate-500 text-xs font-semibold px-1 rounded bg-slate-800 border border-slate-700">
                  AI
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span>Status: <strong className="text-emerald-400 font-medium">Synced</strong></span>
            </div>
          </header>

          {/* Dynamic Page Views Container */}          
          <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-gradient-to-b from-slate-900/20 to-slate-950">
            {children}
          </main>
          
          <FloatingAIAvatar />
          <Toaster />
        </div>
      </body>
    </html>
  );
}