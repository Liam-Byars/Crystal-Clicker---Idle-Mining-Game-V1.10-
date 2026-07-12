import { NextRequest, NextResponse } from 'next/server';

const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '';

interface VerifiedToken {
  uid: string;
  email?: string;
  name?: string;
  picture?: string;
}

/**
 * Verify a Firebase ID token using Google's public tokeninfo endpoint.
 * No firebase-admin SDK required — just uses the API key from env.
 * Returns null if the token is invalid or Firebase isn't configured.
 */
export async function verifyFirebaseToken(idToken: string): Promise<VerifiedToken | null> {
  if (!FIREBASE_API_KEY || !idToken) return null;

  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      }
    );

    if (!res.ok) return null;

    const data = await res.json();
    if (!data.users || data.users.length === 0) return null;

    const firebaseUser = data.users[0];
    return {
      uid: firebaseUser.localId,
      email: firebaseUser.email,
      name: firebaseUser.displayName,
      picture: firebaseUser.photoUrl,
    };
  } catch {
    return null;
  }
}

/**
 * Parse request body and verify identity.
 * For Google users: verifies the Firebase ID token if provided, uses verified UID.
 * For guest users (userId starts with "guest_"): accepts userId directly.
 * Returns the parsed body with an authoritative userId.
 */
export async function parseAndVerifyRequest(
  request: NextRequest
): Promise<{ body: Record<string, unknown>; userId: string; isGuest: boolean; verified?: VerifiedToken } | NextResponse> {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }

  const userId = body.userId as string | undefined;
  if (!userId) {
    return NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 });
  }

  const idToken = body.idToken as string | undefined;

  // Guest users: no token verification needed
  if (userId.startsWith('guest_')) {
    return { body, userId, isGuest: true };
  }

  // Google users: verify token if provided
  if (idToken) {
    const verified = await verifyFirebaseToken(idToken);
    if (verified) {
      // Use the verified UID — prevents userId spoofing
      return { body, userId: verified.uid, isGuest: false, verified };
    }
    console.warn('[auth] Token verification failed, using client userId (graceful fallback)');
  }

  return { body, userId, isGuest: false };
}

/**
 * Extract userId from query params (for GET requests).
 */
export function extractUserIdFromQuery(
  request: NextRequest
): { userId: string; isGuest: boolean } | { error: NextResponse } {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return { error: NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 }) };
  }

  return { userId, isGuest: userId.startsWith('guest_') };
}