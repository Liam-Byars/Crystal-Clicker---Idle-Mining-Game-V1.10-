'use client';

import { useState, useEffect, useRef, useSyncExternalStore } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function getIsStandalone() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches || !!(window.navigator as unknown as { standalone?: boolean }).standalone;
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const isInstalled = useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia('(display-mode: standalone)');
      m.addEventListener('change', cb);
      return () => m.removeEventListener('change', cb);
    },
    getIsStandalone,
    () => false // server snapshot
  );

  const isIOS = typeof navigator !== 'undefined' ? /iPad|iPhone|iPod/.test(navigator.userAgent) : false;

  useEffect(() => {
    if (isInstalled) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowPrompt(true), 30000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [isInstalled]);

  const install = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === 'accepted') setDeferredPrompt(null);
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const dismiss = () => setShowPrompt(false);

  return { canInstall: !!deferredPrompt && !isInstalled, isInstalled, isIOS, showPrompt, install, dismiss };
}
