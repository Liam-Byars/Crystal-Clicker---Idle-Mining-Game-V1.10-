'use client';

import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyAFH8ANO2iIxhNHqTcmmPsHOjlq1MVwGno',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'crystal-clicker-7d4a2.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'crystal-clicker-7d4a2',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'crystal-clicker-7d4a2.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '335849247057',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:335849247057:web:264db1e72a1178a7054370',
};

const isFirebaseConfigured = !!(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId
);

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = isFirebaseConfigured ? getAuth(app) : null;
const googleProvider = isFirebaseConfigured ? new GoogleAuthProvider() : null;

export { app, auth, googleProvider, signInWithPopup, signOut, isFirebaseConfigured };
export type { User };