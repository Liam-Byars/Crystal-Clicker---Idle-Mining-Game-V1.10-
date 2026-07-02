'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { auth, googleProvider, signInWithPopup, signOut, isFirebaseConfigured } from './firebase';
import type { User } from './firebase';

interface AuthState {
  user: User | null;
  loading: boolean;
  isGuest: boolean;
  userId: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextType extends AuthState {
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  playAsGuest: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = 'crystal_clicker_auth';

function generateGuestId(): string {
  return 'guest_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

function persistAuth(state: { mode: 'google' | 'guest'; userId: string; displayName?: string; photoURL?: string }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

function loadPersistedAuth(): { mode: 'google' | 'guest'; userId: string; displayName?: string; photoURL?: string } | null {
  try {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function clearPersistedAuth() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch { /* ignore */ }
}

function getInitialState(): AuthState {
  const persisted = loadPersistedAuth();
  if (persisted) {
    if (persisted.mode === 'guest') {
      return {
        user: null, loading: false, isGuest: true,
        userId: persisted.userId, displayName: persisted.displayName || 'Guest Miner', photoURL: null,
      };
    }
    // Google mode persisted - still need to verify with Firebase, so loading=true
    return {
      user: null, loading: isFirebaseConfigured, isGuest: false,
      userId: null, displayName: null, photoURL: null,
    };
  }
  return {
    user: null, loading: isFirebaseConfigured, isGuest: false,
    userId: null, displayName: null, photoURL: null,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(getInitialState);
  const initialized = useRef(false);

  // Handle Firebase onAuthStateChanged for Google auth
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) return;
    if (initialized.current) return;
    initialized.current = true;

    const persisted = loadPersistedAuth();
    const isGooglePersisted = persisted?.mode === 'google';

    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        persistAuth({
          mode: 'google',
          userId: firebaseUser.uid,
          displayName: firebaseUser.displayName || undefined,
          photoURL: firebaseUser.photoURL || undefined,
        });
        setState({
          user: firebaseUser, loading: false, isGuest: false,
          userId: firebaseUser.uid, displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        });
      } else if (isGooglePersisted) {
        clearPersistedAuth();
        setState(s => ({ ...s, loading: false }));
      } else {
        setState(s => ({ ...s, loading: false }));
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!isFirebaseConfigured || !auth || !googleProvider) {
      return { success: false, error: 'Firebase is not configured. Please add your Firebase config to .env.local' };
    }
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      persistAuth({
        mode: 'google',
        userId: user.uid,
        displayName: user.displayName || undefined,
        photoURL: user.photoURL || undefined,
      });
      setState({
        user, loading: false, isGuest: false,
        userId: user.uid, displayName: user.displayName, photoURL: user.photoURL,
      });
      return { success: true };
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      if (err.code === 'auth/unauthorized-domain') {
        return { success: false, error: 'This domain is not authorized for Firebase. Please add it to your Firebase Console.' };
      }
      if (err.code === 'auth/popup-closed-by-user') {
        return { success: false, error: 'Sign-in popup was closed.' };
      }
      return { success: false, error: err.message || 'Failed to sign in with Google' };
    }
  }, []);

  const playAsGuest = useCallback(() => {
    const guestId = generateGuestId();
    const guestName = 'Guest Miner';
    persistAuth({ mode: 'guest', userId: guestId, displayName: guestName });
    setState({
      user: null, loading: false, isGuest: true,
      userId: guestId, displayName: guestName, photoURL: null,
    });
  }, []);

  const logout = useCallback(async () => {
    if (auth) {
      try { await signOut(auth); } catch { /* ignore */ }
    }
    clearPersistedAuth();
    setState({
      user: null, loading: false, isGuest: false,
      userId: null, displayName: null, photoURL: null,
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{ ...state, signInWithGoogle, playAsGuest, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}