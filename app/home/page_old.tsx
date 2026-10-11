// app/page.tsx
import React from 'react';
import Link from 'next/link';
import { SignInButton, SignUpButton } from '@clerk/nextjs';

export default async function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      {/* Top Navigation */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 md:py-20 flex flex-col gap-20">
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center gap-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-xs text-blue-400 font-medium">
            <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
            Powered by Gemini 2.5 & Vercel AI SDK
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight">
            AI-Driven Ledger & <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
              Smart Budgeting
            </span>
          </h1>

          <p className="text-slate-400 text-base md:text-lg max-w-2xl">
            Real-time health snapshots, predictive insights, and automated line-item receipt extraction tailored to your custom accounting taxonomy.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center pt-2">
            
            <SignUpButton>
                <button 
                    className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-all shadow-lg shadow-blue-500/25 text-center cursor-pointer"
                >
                    Create Account
                </button>
            </SignUpButton>
            <SignInButton>
                <button 
                    className="w-full sm:w-auto px-8 py-3 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-medium rounded-lg transition-all text-center cursor-pointer"
                >
                    Sign In
                </button>
            </SignInButton>
          </div>
        </section>

        {/* Live Feature Preview Mockup */}
        <section className="relative rounded-2xl border border-slate-800 bg-slate-900/40 p-6 md:p-8 backdrop-blur overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 via-transparent to-transparent pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-800 pb-6 mb-8">
            <div>
              <h2 className="text-xl font-bold text-white">Live Extraction Telemetry</h2>
              <p className="text-sm text-slate-400">Streamed Server Actions with precise token usage tracking</p>
            </div>
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Stream Status: Connected
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex flex-col gap-2">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">AI Model</span>
              <span className="text-lg font-semibold text-slate-200">Gemini 2.5 Flash</span>
              <span className="text-xs text-emerald-400">Structured Schema Stream</span>
            </div>

            <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex flex-col gap-2">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Category Logic</span>
              <span className="text-lg font-semibold text-slate-200">Standalone Dictionary</span>
              <span className="text-xs text-blue-400">Major/Sub Mapping Ready</span>
            </div>

            <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex flex-col gap-2">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Security Guard</span>
              <span className="text-lg font-semibold text-slate-200">Session Auth</span>
              <span className="text-xs text-indigo-400">Zero Client Spoofing</span>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-xl bg-slate-900/30 border border-slate-800/80 flex flex-col gap-3 hover:border-slate-700 transition-all">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              ⚡
            </div>
            <h3 className="text-lg font-semibold text-white">Streamed Receipt Extraction</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Upload invoices or receipts and watch streaming line-item extractions update your dashboard in real-time without blocking execution.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-slate-900/30 border border-slate-800/80 flex flex-col gap-3 hover:border-slate-700 transition-all">
            <div className="h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              📊
            </div>
            <h3 className="text-lg font-semibold text-white">Dynamic Recharts Analytics</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Visualize financial velocity with dynamic grid-based layouts, responsive widgets, and flexible multi-column component grids.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-slate-900/30 border border-slate-800/80 flex flex-col gap-3 hover:border-slate-700 transition-all">
            <div className="h-10 w-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              🔒
            </div>
            <h3 className="text-lg font-semibold text-white">Isolated Tenant Security</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Protected server endpoints with strict server-side session checks, token quotas, and isolated multi-tenant data access.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Carta-AI Budget Manager. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-slate-400 transition-colors cursor-pointer">Privacy</span>
            <span className="hover:text-slate-400 transition-colors cursor-pointer">Terms</span>
            <span className="hover:text-slate-400 transition-colors cursor-pointer">Security</span>
          </div>
        </div>
      </footer>
    </div>
  );
}