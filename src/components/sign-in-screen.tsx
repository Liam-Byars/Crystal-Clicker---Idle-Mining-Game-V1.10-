'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { isFirebaseConfigured } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Gem, LogIn, User } from 'lucide-react';

export function SignInScreen() {
  const { signInWithGoogle, playAsGuest } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    setError(null);
    const result = await signInWithGoogle();
    if (!result.success) {
      setError(result.error || 'Sign-in failed');
      setSigningIn(false);
    }
  };

  const handleGuestPlay = () => {
    playAsGuest();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: '#0a0a1a' }}
    >
      {/* Grid pattern background */}
      <div className="fixed inset-0 bg-grid-pattern pointer-events-none" />

      {/* Animated gradient orbs */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full opacity-20 blur-[120px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #a855f7, transparent 70%)' }}
        animate={{ x: [0, 30, -20, 0], y: [0, -20, 30, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full opacity-15 blur-[100px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #06b6d4, transparent 70%)' }}
        animate={{ x: [0, -30, 20, 0], y: [0, 20, -30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center gap-8 px-4 max-w-md w-full"
      >
        {/* Crystal icon with glow */}
        <motion.div
          className="relative"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="w-24 h-24 flex items-center justify-center">
            <Gem className="w-16 h-16 text-purple-400 drop-shadow-[0_0_20px_rgba(168,85,247,0.6)]" strokeWidth={1.5} />
          </div>
          <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl animate-pulse" />
        </motion.div>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-2">
            <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              Crystal Clicker
            </span>
          </h1>
          <p className="text-purple-300/60 text-sm">Mine crystals. Buy upgrades. Reach infinity.</p>
        </div>

        {/* Sign in card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col gap-4"
        >
          <h2 className="text-white/90 font-semibold text-lg text-center">Choose how to play</h2>

          {/* Google sign-in button */}
          {isFirebaseConfigured && (
            <Button
              onClick={handleGoogleSignIn}
              disabled={signingIn}
              className="w-full h-12 bg-white text-gray-800 hover:bg-gray-100 font-medium text-base rounded-xl transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer"
              size="lg"
            >
              {signingIn ? (
                <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              {signingIn ? 'Signing in...' : 'Sign in with Google'}
            </Button>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-xs uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Guest play button */}
          <Button
            onClick={handleGuestPlay}
            className="w-full h-12 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-medium text-base rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg shadow-purple-500/20 cursor-pointer"
            size="lg"
          >
            <User className="w-5 h-5" />
            Play as Guest
          </Button>

          {/* Error message */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400/80 text-sm text-center bg-red-500/10 rounded-lg px-3 py-2"
            >
              {error}
            </motion.p>
          )}

          {/* Info text */}
          <p className="text-white/30 text-xs text-center">
            {isFirebaseConfigured
              ? 'Guest progress is saved locally. Sign in to save to the cloud.'
              : 'Playing as guest. Your progress is saved to your browser.'}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}