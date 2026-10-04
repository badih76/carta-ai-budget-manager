'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '@/src/components/Logo';
import {
  ChevronDown,
} from 'lucide-react';
import { NAV_ITEMS } from './navmenu';
import { Show, SignOutButton, UserButton, useUser } from '@clerk/nextjs';

export default function ResizableSidebar() {
  
  const [ userName, setUserName ] = useState<string>('');
  const { isSignedIn, user, isLoaded } = useUser()

  useEffect(() => {    
    if(isLoaded)
      setUserName(user?.fullName!);

  }, [ isLoaded ]);

  const pathname = usePathname();
  const [sidebarWidth, setSidebarWidth] = useState<number>(256);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  
  // Auto-expand Settings if user is currently on a settings sub-route
  const isSettingsActive = pathname?.startsWith('/settings');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(isSettingsActive);

  const sidebarRef = useRef<HTMLDivElement>(null);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;
      let newWidth = e.clientX;
      if (newWidth < 200) newWidth = 200;
      if (newWidth > 450) newWidth = 450;
      setSidebarWidth(newWidth);
    },
    [isResizing]
  );

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, resize, stopResizing]);

  return (
    <aside
      ref={sidebarRef}
      style={{ width: `${sidebarWidth}px` }}
      className="relative bg-slate-900/60 border-r border-slate-800/80 flex flex-col justify-between hidden md:flex shrink-0 h-full select-none backdrop-blur-md"
    >
      {/* Sidebar Content */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
        {/* Header / Logo */}
        <div className="h-10 flex items-center px-3 mb-2">
          <Logo />
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;

            // Handle Sub-Menu Items (e.g., Settings)
            if (item.subItems) {
              const hasActiveChild = item.subItems.some((sub) => pathname === sub.href);

              return (
                <div key={item.name} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold rounded-lg transition-all group ${
                      hasActiveChild
                        ? 'text-white bg-slate-800/60'
                        : 'text-slate-300 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${hasActiveChild ? 'text-indigo-400' : 'text-slate-300 group-hover:text-slate-200'}`} />
                      <span className="truncate">{item.name}</span>
                    </div>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-300 transition-transform duration-200 shrink-0 ${
                        isSettingsOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Sub-menu Accordion Container */}
                  {isSettingsOpen && (
                    <div className="pl-2 ml-2 border-l border-slate-800/80 space-y-1 mt-1">
                      {item.subItems.map((sub) => {
                        const SubIcon = sub.icon;
                        const isSubActive = pathname === sub.href;

                        return (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            className={`flex items-center gap-2.5 px-2 py-2 text-xs font-medium rounded-md transition-all truncate block ${
                              isSubActive
                                ? 'bg-indigo-400/30 text-slate-300 font-semibold'
                                : 'text-slate-300 hover:text-slate-200 hover:bg-slate-800/30'
                            }`}
                          >
                            <SubIcon className={`w-3.5 h-3.5 shrink-0 ${isSubActive ? 'text-slate-300' : 'text-slate-400'}`} />
                            <span className="truncate">{sub.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // Standard Single Nav Items
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href!}
                className={`flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-lg transition-all group truncate ${
                  isActive
                    ? 'bg-indigo-400/30 text-slate-300 border border-emerald-500/20 shadow-sm'
                    : 'text-slate-300 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-slate-300' : 'text-slate-400 group-hover:text-slate-200'}`} />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Profile Section Footer */}
          <Show when="signed-in">
            <div className="p-3 border-t border-slate-800/80 shrink-0 bg-slate-900/40">
              <div className="flex items-center gap-3 px-2 py-1.5 overflow-hidden rounded-lg hover:bg-slate-800/30 transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 text-emerald-300 font-semibold text-xs shrink-0 shadow-inner">
                  <UserButton />
                </div>
                <div className="text-xs truncate">
                  <p className="font-semibold text-slate-200 truncate">{userName}</p>
                  <p className="text-[10px] text-slate-400 truncate">Premium Account</p>
                </div>
              </div>
              <SignOutButton>
                <button className="text-white rounded-md font-bold text-xs p-2 cursor-pointer">
                  Sign Out
                </button>
              </SignOutButton>
            </div>
          </Show>

      {/* Interactive Resizable Border Handle */}
      <div
        onMouseDown={startResizing}
        className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize group z-10"
      >
        <div
          className={`w-[2px] h-full mx-auto transition-colors ${
            isResizing ? 'bg-emerald-500' : 'bg-transparent group-hover:bg-emerald-500/50'
          }`}
        />
      </div>
    </aside>
  );
}