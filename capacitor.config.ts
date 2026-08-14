import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.crystalclicker.app',
  appName: 'Crystal Clicker',
  webDir: 'public', // placeholder — we use server url
  server: {
    url: 'https://crystal-clicker-idle-mining-game-v1.vercel.app',
    cleartext: false,
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
