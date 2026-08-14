// Server-side Firestore via REST API with service account OAuth
// Uses google-auth-library to get a proper access token

import { JWT } from 'google-auth-library';
import { readFileSync } from 'fs';
import { join } from 'path';

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'crystal-clicker-7d4a2';
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

let jwtClient: JWT | null = null;
let tokenCache: { token: string; expires: number } | null = null;

function getServiceAccount(): Record<string, string> | null {
  // Check environment variables first (for Vercel / deployed environments)
  if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    return {
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
  }

  // Fallback: read from file (local dev)
  const paths = [
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
    join(process.cwd(), 'firebase-service-account.json'),
    join(process.cwd(), '..', 'firebase-service-account.json'),
  ].filter(Boolean) as string[];

  for (const p of paths) {
    try {
      const raw = readFileSync(p, 'utf-8');
      return JSON.parse(raw);
    } catch {
      continue;
    }
  }
  return null;
}

async function getAccessToken(): Promise<string | null> {
  if (tokenCache && Date.now() < tokenCache.expires) {
    return tokenCache.token;
  }

  if (!jwtClient) {
    const sa = getServiceAccount();
    if (!sa) return null;
    jwtClient = new JWT({
      email: sa.client_email,
      key: sa.private_key,
      scopes: ['https://www.googleapis.com/auth/datastore', 'https://www.googleapis.com/auth/cloud-platform'],
    });
  }

  try {
    const credentials = await jwtClient.authorize();
    tokenCache = {
      token: credentials.access_token!,
      expires: Date.now() + (credentials.expiry_date! - Date.now()) - 60000, // refresh 1 min early
    };
    return tokenCache.token;
  } catch (e) {
    console.error('Failed to get access token:', e);
    return null;
  }
}

interface FirestoreValue {
  integerValue?: string;
  stringValue?: string;
  doubleValue?: number;
  booleanValue?: boolean;
  arrayValue?: { values: FirestoreValue[] };
  mapValue?: { fields: Record<string, FirestoreValue> };
  nullValue?: null;
}

function toFS(val: unknown): FirestoreValue {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'number') return { doubleValue: val };
  if (typeof val === 'string') return { stringValue: val };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (Array.isArray(val)) return { arrayValue: { values: val.map(toFS) } };
  if (typeof val === 'object') return { mapValue: { fields: Object.fromEntries(Object.entries(val as Record<string, unknown>).map(([k, v]) => [k, toFS(v)])) } };
  return { stringValue: String(val) };
}

function fromFS(v: FirestoreValue): unknown {
  if (v.nullValue !== undefined) return null;
  if (v.integerValue !== undefined) return Number(v.integerValue);
  if (v.doubleValue !== undefined) return v.doubleValue;
  if (v.stringValue !== undefined) return v.stringValue;
  if (v.booleanValue !== undefined) return v.booleanValue;
  if (v.arrayValue) return v.arrayValue.values?.map(fromFS) ?? [];
  if (v.mapValue) {
    const obj: Record<string, unknown> = {};
    for (const [k, fv] of Object.entries(v.mapValue.fields ?? {})) {
      obj[k] = fromFS(fv);
    }
    return obj;
  }
  return null;
}

export async function firestoreSave(userId: string, data: Record<string, unknown>): Promise<boolean> {
  const token = await getAccessToken();
  if (!token) return false;
  try {
    const fields: Record<string, FirestoreValue> = {};
    for (const [k, v] of Object.entries(data)) {
      fields[k] = toFS(v);
    }
    const mask = Object.keys(data).map(k => `updateMask.fieldPaths=${k}`).join('&');
    const res = await fetch(`${BASE_URL}/saves/${userId}?${mask}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ fields }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error('Firestore save failed:', res.status, text);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Firestore save error:', e);
    return false;
  }
}

export async function firestoreLoad(userId: string): Promise<Record<string, unknown> | null> {
  const token = await getAccessToken();
  if (!token) return null;
  try {
    const res = await fetch(`${BASE_URL}/saves/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (res.status === 404) return null;
    if (!res.ok) {
      const text = await res.text();
      console.error('Firestore load failed:', res.status, text);
      return null;
    }
    const doc = await res.json() as { fields: Record<string, FirestoreValue> };
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(doc.fields)) {
      result[k] = fromFS(v);
    }
    return result;
  } catch (e) {
    console.error('Firestore load error:', e);
    return null;
  }
}

export const isFirestoreConfigured = true;
