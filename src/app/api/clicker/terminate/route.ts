import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/clicker/terminate
// Terminates an account: compacts data, blocks re-login, archives original data
export async function POST(req: NextRequest) {
  try {
    const { userId, reason } = await req.json();

    if (!userId || !reason) {
      return NextResponse.json({ error: 'userId and reason are required' }, { status: 400 });
    }

    // Find the user's save data
    const save = await db.clickerSave.findUnique({ where: { userId } });

    if (!save) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    if (save.status === 'terminated') {
      return NextResponse.json({ error: 'Account already terminated' }, { status: 409 });
    }

    // Build compacted summary (minimal data for legal retention)
    const compactedData = JSON.stringify({
      originalUserId: save.userId,
      displayName: null, // Would come from Firebase; not stored here
      lastActivityTimestamp: save.lastOnlineTime,
      totalEarned: save.totalEarned,
      totalClicks: save.totalClicks,
      prestige: save.prestige,
      prestigePoints: save.prestigePoints,
      totalEvents: save.totalEvents,
      compactedAt: Date.now(),
      areasUnlocked: null, // Would be derived from upgrades data
    });

    // Archive the full original data before termination
    await db.accountArchive.create({
      data: {
        userId: save.userId,
        originalData: JSON.stringify({
          crystals: save.crystals,
          totalClicks: save.totalClicks,
          totalEarned: save.totalEarned,
          clickPower: save.clickPower,
          multiplier: save.multiplier,
          autoRate: save.autoRate,
          prestige: save.prestige,
          prestigePoints: save.prestigePoints,
          upgrades: save.upgrades,
          achievements: save.achievements,
          goldenClicks: save.goldenClicks,
          maxCombo: save.maxCombo,
          lastOnlineTime: save.lastOnlineTime,
          totalEvents: save.totalEvents,
        }),
        archiveReason: 'termination',
        // No expiry for termination archives - retained indefinitely per TOS
        expiresAt: null,
      },
    });

    // Update the save: compact data, zero out game state, mark terminated
    await db.clickerSave.update({
      where: { userId },
      data: {
        status: 'terminated',
        terminatedReason: reason,
        terminatedAt: new Date(),
        compactedData,
        crystals: 0,
        totalClicks: 0,
        totalEarned: 0,
        clickPower: 1,
        multiplier: 1,
        autoRate: 0,
        prestige: 0,
        prestigePoints: 0,
        upgrades: '{}',
        achievements: '[]',
        goldenClicks: 0,
        maxCombo: 0,
        totalEvents: 0,
      },
    });

    return NextResponse.json({ success: true, message: 'Account terminated' });
  } catch (error) {
    console.error('Terminate error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}