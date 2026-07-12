import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/clicker/compact
// Checks if an account is terminated or compacted, returns appropriate response
export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const save = await db.clickerSave.findUnique({ where: { userId } });

    if (!save) {
      return NextResponse.json({ status: 'new_user' });
    }

    if (save.status === 'terminated') {
      return NextResponse.json({
        status: 'terminated',
        reason: save.terminatedReason,
        terminatedAt: save.terminatedAt,
      });
    }

    if (save.status === 'compacted') {
      return NextResponse.json({
        status: 'compacted',
        compactedData: save.compactedData,
        message: 'Your account was inactive for over 365 days. A fresh start has been created.',
      });
    }

    return NextResponse.json({ status: 'active' });
  } catch (error) {
    console.error('Compact check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/clicker/compact
// Admin endpoint to check account status
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'userId query param required' }, { status: 400 });
    }

    const save = await db.clickerSave.findUnique({ where: { userId } });

    if (!save) {
      return NextResponse.json({ status: 'not_found' });
    }

    return NextResponse.json({
      userId: save.userId,
      status: save.status,
      lastOnlineTime: save.lastOnlineTime,
      terminatedReason: save.terminatedReason,
      terminatedAt: save.terminatedAt,
      hasCompactedData: !!save.compactedData,
    });
  } catch (error) {
    console.error('Compact GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}