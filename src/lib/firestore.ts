// Server-side Firestore via REST API
// Firebase client SDK's Firestore doesn't work in Node.js, so we use REST

// Firebase config - env vars may not reach server modules in Turbopack, so hardcoded as fallback
const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'crystal-clicker-7d4a2';
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyAFH8ANO2iIxhNHqTcmmPsHOjlq1MVwGno';
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

const isConfigured = !!PROJECT_ID && !!API_KEY;

interface FirestoreDocument {
  fields: Record<string, { integerValue?: number; stringValue?: string; doubleValue?: number; booleanValue?: boolean; arrayValue?: { values: unknown[] }; mapValue?: { fields: Record<string, unknown> }; nullValue?: null }>;
}

function toFirestoreValue(val: unknown): FirestoreDocument['fields'][string] {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'number') return { doubleValue: val };
  if (typeof val === 'string') return { stringValue: val };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (Array.isArray(val)) return { arrayValue: { values: val.map(toFirestoreValue) } };
  if (typeof val === 'object') return { mapValue: { fields: Object.fromEntries(Object.entries(val as Record<string, unknown>).map(([k, v]) => [k, toFirestoreValue(v)])) } };
  return { stringValue: String(val) };
}

function fromFirestoreValue(val: FirestoreDocument['fields'][string]): unknown {
  if (val.integerValue !== undefined) return Number(val.integerValue);
  if (val.doubleValue !== undefined) return val.doubleValue;
  if (val.stringValue !== undefined) return val.stringValue;
  if (val.booleanValue !== undefined) return val.booleanValue;
  if (val.arrayValue) return val.arrayValue.values?.map(fromFirestoreValue) ?? [];
  if (val.mapValue) {
    const obj: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val.mapValue.fields ?? {})) {
      obj[k] = fromFirestoreValue(v as FirestoreDocument['fields'][string]);
    }
    return obj;
  }
  if (val.nullValue !== undefined) return null;
  return null;
}

export async function firestoreSave(userId: string, data: Record<string, unknown>): Promise<boolean> {
  if (!isConfigured) return false;
  try {
    const fields: FirestoreDocument['fields'] = {};
    for (const [k, v] of Object.entries(data)) {
      fields[k] = toFirestoreValue(v);
    }
    // Use PATCH with mask for partial update (merge behavior)
    const fieldMask = Object.keys(data).map(k => `updateMask.fieldPaths=${k}`).join('&');
    const url = `${BASE_URL}/saves/${userId}?${fieldMask}`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': API_KEY },
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
  if (!isConfigured) return null;
  try {
    const url = `${BASE_URL}/saves/${userId}?key=${API_KEY}`;
    const res = await fetch(url);
    if (res.status === 404) return null;
    if (!res.ok) {
      const text = await res.text();
      console.error('Firestore load failed:', res.status, text);
      return null;
    }
    const doc = await res.json() as FirestoreDocument;
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(doc.fields)) {
      result[k] = fromFirestoreValue(v);
    }
    return result;
  } catch (e) {
    console.error('Firestore load error:', e);
    return null;
  }
}

export { isConfigured as isFirestoreConfigured };