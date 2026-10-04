'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { NAV_ITEMS } from '../ResizableSidebar/navmenu';
import { usePathname } from 'next/navigation';
import Logo from '../Logo';

export default function MobileNavDrawer() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const isSettingsActive = pathname?.startsWith('/settings');
    const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(isSettingsActive);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger>
        <div
          // variant="ghost"
          // size="icon"
          className="lg:hidden text-white hover:text-slate-600 hover:bg-slate-800 focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-6 w-6" />
        </div>
      </SheetTrigger>

      <SheetContent side="left" className="w-72 bg-slate-900 border-r border-slate-800 text-slate-100 p-6 flex flex-col">
        <SheetHeader className="border-b border-slate-800 pb-4 mb-4">
          <SheetTitle className="text-emerald-400 font-bold text-lg flex items-center gap-2">
            <Logo />
          </SheetTitle>
        </SheetHeader>

        <nav className="space-y-1">
        {/* Navigation Links */}
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
                            <SubIcon className={`w-3.5 h-3.5 shrink-0 ${isSubActive ? 'text-slate-300' : 'text-slate-500'}`} />
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
      </SheetContent>
    </Sheet>
  );
}