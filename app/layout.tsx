import React from 'react';
import '@/app/globals.css'; 
import ResizableSidebar from '@/src/components/ResizableSidebar';
import MobileNavDrawer from '@/src/components/MobileNavDraser';
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from 'sonner';
import { FloatingAIAvatar } from '@/src/components/floatingAiAvatar';
import { SettingsProvider } from '@/src/context/settingsContext';
import { addSettings, getSettings } from '@/app/settings/aiAvatarSettings/actions';

import { ClerkProvider, Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import HttpStatus from '@/lib/HttpStatus';
import { ToastError } from '@/lib/sonnerUtils';
import { DBBudgetMakerSettings } from '@/src/drizzle/schema';
import { uuid } from 'uuidv4';
import Logo from '@/src/components/Logo';
import HomePage from './home/page';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata = {
  title: 'ClarityFi // AI Budget Manager',
  description: 'Intelligent financial tracking built with Next.js',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { userId, isAuthenticated } = await auth();
  let initialSettings: any = null;

  if (userId) {
    const result = await getSettings(userId);

    if (result.status !== HttpStatus.OK) {
      ToastError(`There was a problem fetching your settings. ${result.error!}`);
    } else {
      if (result.data.length === 0) {
        let defaultSettings: DBBudgetMakerSettings = {
          userId: userId,
          id: uuid(),
          displayCartaAiAvatar: 1,
          cartaAiAvatarGender: 'male',
          cartaAiAvatarNameFemale: 'Sandra',
          cartaAiAvatarNameMale: 'Alex',
          cartaAiAvatarStyle: 2,
          lastUpdated: new Date()
        };

        initialSettings = defaultSettings;
        
        if (isAuthenticated) {
          const insSettingsResult = await addSettings(defaultSettings);
          if (insSettingsResult.status !== HttpStatus.OK) {
            ToastError(`There was an issue handling your app settings. ${insSettingsResult.error}`);
          }
        }
      } else {
        initialSettings = result.data[0];
      }
    }
  }

  return (
    <html lang="en" className={cn("h-full bg-slate-950 text-slate-100 antialiased", "font-sans", inter.variable)}>
      <body className="flex h-full overflow-hidden font-sans">
        <ClerkProvider>
          <Show when="signed-in">
            {/* Persistent Resizable Sidebar (hidden on small/medium screens) */}
            <div className="hidden lg:flex">
              <ResizableSidebar />
            </div>
          </Show>

          {/* Main Content Stage */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top Navbar */}
            <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur flex items-center px-4 md:px-6 shrink-0">
              {/* Signed Out Header */}
              <Show when="signed-out">
                <div className="w-full flex items-center justify-between">
                  <div className="flex items-center">
                    <Logo />
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <SignInButton>
                      <button className="px-3.5 py-1.5 text-xs sm:text-sm font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition-all cursor-pointer">
                        Sign In
                      </button>
                    </SignInButton>
                    <SignUpButton>
                      <button className="px-3.5 py-1.5 text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all shadow-sm shadow-blue-600/20 cursor-pointer">
                        Sign Up
                      </button>
                    </SignUpButton>
                  </div>
                </div>
              </Show>

              {/* Signed In Header */}
              <Show when="signed-in">
                <div className="w-full flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 max-w-xl">
                    <MobileNavDrawer />
                    <div className="w-full relative">
                      <input
                        type="text"
                        placeholder="Ask AI or log instantly..."
                        className="w-full bg-slate-900 text-sm rounded-lg border border-slate-800 px-4 py-2 pl-10 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                      />
                      <div className="absolute left-3 top-2.5 text-slate-500 text-xs font-semibold px-1 rounded bg-slate-800 border border-slate-700">
                        AI
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <span className="hidden sm:inline">
                      Status: <strong className="text-emerald-400 font-medium">Synced</strong>
                    </span>
                    <UserButton />
                  </div>
                </div>
              </Show>
            </header>

            {/* Main Stage Router */}
            <Show when="signed-out">
              <main className="flex-1 overflow-y-auto bg-slate-950">
                <HomePage />
              </main>
            </Show>

            <Show when="signed-in">
              <SettingsProvider initialSettings={initialSettings} userId={userId || ''}>
                <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-gradient-to-b from-slate-900/20 to-slate-950">
                  {children}
                </main>
                <FloatingAIAvatar />
              </SettingsProvider>
            </Show>

            <Toaster />
          </div>
        </ClerkProvider>
      </body>
    </html>
  );
}