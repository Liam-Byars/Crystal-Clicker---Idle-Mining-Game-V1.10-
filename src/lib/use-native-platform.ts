'use client';

import { useEffect, useState } from 'react';

/**
 * Returns true if running inside Capacitor native shell (iOS/Android app).
 * Safe to call on web — will return false.
 */
export function useNativePlatform(): boolean {
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    const check = () => {
      try {
        const w = window as unknown as Record<string, unknown>;
        setIsNative(!!w.Capacitor && !!(w.Capacitor as Record<string, unknown>).isNativePlatform);
      } catch {
        setIsNative(false);
      }
    };
    check();
  }, []);

  return isNative;
}

/**
 * Returns the current network connection status.
 * On native, uses the Capacitor Network plugin.
 * On web, uses navigator.onLine.
 */
export function useNetworkStatus(): { connected: boolean; connectionType: string } {
  const [connected, setConnected] = useState(true);
  const [connectionType, setConnectionType] = useState('unknown');

  useEffect(() => {
    let mounted = true;

    const update = async () => {
      try {
        const w = window as unknown as Record<string, unknown>;
        if (w.Capacitor && (w.Capacitor as Record<string, unknown>).isNativePlatform) {
          const { Network } = await import('@capacitor/network');
          const status = await Network.getStatus();
          if (mounted) {
            setConnected(status.connected);
            setConnectionType(status.connectionType);
          }
          Network.addListener('networkStatusChange', (s) => {
            if (mounted) {
              setConnected(s.connected);
              setConnectionType(s.connectionType);
            }
          });
        } else {
          setConnected(navigator.onLine);
          setConnectionType(navigator.onLine ? 'wifi' : 'none');
          const handler = () => { if (mounted) setConnected(navigator.onLine); };
          window.addEventListener('online', handler);
          window.addEventListener('offline', handler);
          return () => {
            window.removeEventListener('online', handler);
            window.removeEventListener('offline', handler);
          };
        }
      } catch {
        if (mounted) setConnected(navigator.onLine);
      }
    };

    update();
    return () => { mounted = false; };
  }, []);

  return { connected, connectionType };
}
