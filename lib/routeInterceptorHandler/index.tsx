'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export function usePromptUnsavedChanges(hasUnsavedChanges: boolean) {
  useEffect(() => {
    // 1. Intercept Browser Tab Close / Refresh / External URLs
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    // 2. Intercept Browser Back / Forward buttons
    const handlePopState = () => {
      if (hasUnsavedChanges) {
        const confirmLeave = window.confirm(
          'You have unsaved changes. Are you sure you want to leave?'
        );
        if (!confirmLeave) {
          window.history.pushState(null, '', window.location.href);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasUnsavedChanges]);
}

export function useUnsavedChangesModal(isDirty: boolean) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);

  // 1. Native tab close / refresh protection
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // 2. Intercept browser Back / Forward buttons
  useEffect(() => {
    if (!isDirty) return;

    window.history.pushState({ unsavedGuard: true }, '', window.location.href);

    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      setPendingUrl(null); // Back navigation
      setShowModal(true);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isDirty]);

  // 3. Intercept ALL internal Link (<a>) clicks in Next.js
  useEffect(() => {
    if (!isDirty) return;

    const handleClick = (e: MouseEvent) => {
      // Find closest anchor tag clicked
      const target = (e.target as HTMLElement).closest('a');

      if (!target) return;

      const href = target.getAttribute('href');

      // Ignore external links, anchor fragments, or target="_blank"
      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('http') ||
        target.target === '_blank'
      ) {
        return;
      }

      // Stop Next.js soft navigation
      e.preventDefault();
      e.stopPropagation();

      setPendingUrl(href);
      setShowModal(true);
    };

    // Capture phase listener ensures we run before Next.js Link handler
    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [isDirty]);

  // 4. Programmatic navigation helper (for custom buttons using router.push)
  const requestNavigation = useCallback(
    (url: string) => {
      if (isDirty) {
        setPendingUrl(url);
        setShowModal(true);
      } else {
        router.push(url);
      }
    },
    [isDirty, router]
  );

  const handleConfirmLeave = () => {
    setShowModal(false);
    if (pendingUrl) {
      router.push(pendingUrl);
    } else {
      // Undo the pushState guard and navigate back
      window.history.go(-2);
    }
  };

  const handleCancelLeave = () => {
    setShowModal(false);
    setPendingUrl(null);
    if (isDirty) {
      window.history.pushState({ unsavedGuard: true }, '', window.location.href);
    }
  };

  return {
    showModal,
    requestNavigation,
    handleConfirmLeave,
    handleCancelLeave,
  };
}

interface IRouteInterceptorModalProps {
    showModal: boolean,
    handleCancelLeave: () => void,
    handleConfirmLeave: () => void
}

export const RouteChangeInterceptorModal = ({ showModal, handleCancelLeave, handleConfirmLeave }: IRouteInterceptorModalProps) => {
    return (
       <>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-100 shadow-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-amber-500/10 text-amber-400">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-white">Unsaved Changes</h3>
              </div>
              
              <p className="text-sm text-slate-400">
                You have made changes that haven't been saved yet. If you leave now, your changes will be lost.
              </p>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={handleCancelLeave}
                  className="border-slate-800 text-slate-300 hover:bg-slate-800"
                >
                  Stay on Page
                </Button>
                <Button
                  onClick={handleConfirmLeave}
                  className="bg-red-600 hover:bg-red-500 text-white"
                >
                  Discard & Leave
                </Button>
              </div>
            </div>
          </div>
        )}
      </>
    )
}