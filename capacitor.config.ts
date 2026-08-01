import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.crystalclicker.app',
  appName: 'Crystal Clicker',
  webDir: 'public', // placeholder — we use server url
  server: {
    // ⚠️ CHANGE THIS to your deployed Next.js URL when ready to build
    // e.g. "https://crystal-clicker.vercel.app"
    url: 'http://localhost:3000',
    cleartext: true, // allows HTTP for local dev; set false in production with HTTPS
    androidScheme: 'https',
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0a0a1a',
    },
  },
  ios: {
    contentInset: 'automatic',
  },
  android: {
    backgroundColor: '#0a0a1a',
    allowMixedContent: true,
  },
};

export default config;
