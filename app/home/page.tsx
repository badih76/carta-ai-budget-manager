// app/page.tsx
import React from 'react';
import { SignInButton, SignUpButton } from '@clerk/nextjs';

export default async function HomePage() {
  return (
    <div className="w-full bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-blue-500 selection:text-white relative overflow-hidden">
      
      {/* Visual Graphic 1: Hero Ambient Glowing Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[350px] bg-gradient-to-b from-blue-500/10 via-indigo-500/5 to-transparent blur-3xl pointer-events-none" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 pt-6 pb-16 flex flex-col gap-16 md:gap-24 relative z-10">
        
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center gap-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-xs text-blue-400 font-medium backdrop-blur-md shadow-sm shadow-blue-500/10">
            <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
            Powered by Gemini 2.5 & Vercel AI SDK
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.15]">
            AI-Driven Ledger & <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
              Smart Budgeting
            </span>
          </h1>

          <p className="text-slate-400 text-base md:text-lg max-w-2xl leading-relaxed">
            Real-time health snapshots, predictive insights, and automated line-item receipt extraction tailored to your custom accounting taxonomy.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center pt-2">
            <SignUpButton>
              <button className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 text-center cursor-pointer">
                Create Free Account
              </button>
            </SignUpButton>
            <SignInButton>
              <button className="w-full sm:w-auto px-8 py-3.5 bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-800 font-medium rounded-xl transition-all backdrop-blur-md text-center cursor-pointer">
                Sign In
              </button>
            </SignInButton>
          </div>
        </section>

        {/* Visual Graphic 2: Live Feature Preview Mockup Dashboard */}
        <section className="relative rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 md:p-8 backdrop-blur-xl overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 via-transparent to-indigo-600/5 pointer-events-none" />

          {/* Header Bar */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6 mb-8">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Live Extraction Telemetry
              </h2>
              <p className="text-sm text-slate-400">Streamed Server Actions with precise token usage tracking</p>
            </div>
            <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="h-2 w-2 rounded-full bg-emerald-500 -ml-4" />
              Stream Status: Connected
            </div>
          </div>

          {/* Dashboard Preview Graphic */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Column 1: Live Receipt Stream Graphic */}
            <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Receipt Stream</span>
                <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">Active</span>
              </div>
              <div className="space-y-3 font-mono text-xs">
                <div className="p-2.5 rounded bg-slate-900/90 border border-slate-800 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span className="text-slate-300">AWS Cloud Hosting</span>
                  </div>
                  <span className="text-emerald-400">$142.50</span>
                </div>
                <div className="p-2.5 rounded bg-slate-900/90 border border-slate-800 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span className="text-slate-300">Office Espresso Supplies</span>
                  </div>
                  <span className="text-emerald-400">$28.90</span>
                </div>
                <div className="p-2.5 rounded bg-slate-900/40 border border-slate-800/50 flex justify-between items-center opacity-60">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                    <span className="text-slate-400">Parsing SaaS Invoice...</span>
                  </div>
                  <span className="text-slate-500">--.--</span>
                </div>
              </div>
            </div>

            {/* Column 2: Simulated Vector Bar Chart Illustration */}
            <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex flex-col justify-between gap-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Budget Velocity</span>
                <span className="text-xs text-emerald-400 font-semibold">+18.4% vs Target</span>
              </div>
              
              {/* Vector Bar Chart SVG */}
              <div className="h-28 flex items-end justify-between gap-2 pt-4 px-2">
                <div className="w-full bg-slate-800/60 rounded-t h-[40%] hover:bg-blue-500/50 transition-all relative group">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 hidden group-hover:block">$420</div>
                </div>
                <div className="w-full bg-slate-800/60 rounded-t h-[65%] hover:bg-blue-500/50 transition-all relative group">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 hidden group-hover:block">$680</div>
                </div>
                <div className="w-full bg-slate-800/60 rounded-t h-[50%] hover:bg-blue-500/50 transition-all relative group">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 hidden group-hover:block">$510</div>
                </div>
                <div className="w-full bg-blue-500 rounded-t h-[85%] relative group shadow-lg shadow-blue-500/20">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-blue-400 font-bold">$920</div>
                </div>
                <div className="w-full bg-slate-800/60 rounded-t h-[60%] hover:bg-blue-500/50 transition-all relative group">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 hidden group-hover:block">$610</div>
                </div>
              </div>

              <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span>
              </div>
            </div>

            {/* Column 3: AI Model Specs */}
            <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex flex-col justify-between gap-3">
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-2">Engine Metrics</span>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Model</span>
                    <span className="text-slate-200 font-medium">Gemini 2.5 Flash</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Latency</span>
                    <span className="text-emerald-400 font-mono">240ms</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Accuracy</span>
                    <span className="text-blue-400 font-mono">99.4%</span>
                  </div>
                </div>
              </div>
              <div className="p-2.5 rounded bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
                🔒 Zero client spoofing with strict session validation.
              </div>
            </div>

          </div>
        </section>

        {/* Visual Graphic 3: Original SVG Process Diagram (How It Works) */}
        <section className="flex flex-col items-center gap-8 py-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white">Automated Financial Pipeline</h2>
            <p className="text-slate-400 text-sm mt-1">From raw unstructured receipt to categorized ledger entries in seconds</p>
          </div>

          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 relative">
            
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-slate-900/30 border border-slate-800/80 flex flex-col items-center text-center gap-3 relative">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <h3 className="font-semibold text-white">1. Capture & Upload</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Drop PDF invoices, images, or receipts directly into your workspace.</p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-slate-900/30 border border-slate-800/80 flex flex-col items-center text-center gap-3 relative">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white">2. Gemini Parsing</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Multimodal AI extracts line-items, tax values, vendor details, and dates.</p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-slate-900/30 border border-slate-800/80 flex flex-col items-center text-center gap-3 relative">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white">3. Smart Ledger Sync</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Line-items are instantly mapped into your custom category taxonomy.</p>
            </div>

          </div>
        </section>

        {/* Feature Grid with Modern SVG Icons */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="p-6 rounded-xl bg-slate-900/30 border border-slate-800/80 flex flex-col gap-3 hover:border-slate-700 transition-all group">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white">Streamed Receipt Extraction</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Upload invoices or receipts and watch streaming line-item extractions update your dashboard in real-time without blocking execution.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-slate-900/30 border border-slate-800/80 flex flex-col gap-3 hover:border-slate-700 transition-all group">
            <div className="h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white">Dynamic Analytics</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Visualize financial velocity with dynamic grid-based layouts, responsive widgets, and flexible multi-column component grids.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-slate-900/30 border border-slate-800/80 flex flex-col gap-3 hover:border-slate-700 transition-all group">
            <div className="h-10 w-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white">Isolated Tenant Security</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Protected server endpoints with strict server-side session checks, token quotas, and isolated multi-tenant data access.
            </p>
          </div>

        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 relative z-10 shrink-0">
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