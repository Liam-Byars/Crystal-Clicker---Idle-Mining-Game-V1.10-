import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { firestoreLoad, isFirestoreConfigured } from '@/lib/firestore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 });
    }

    // Try to load from both sources in parallel
    const [sqliteSave, firestoreData] = await Promise.all([
      db.clickerSave.findUnique({ where: { userId } }).catch(() => null),
      isFirestoreConfigured ? firestoreLoad(userId).catch(() => null) : Promise.resolve(null),
    ]);

    // Parse SQLite save
    const sqliteData = sqliteSave ? {
      crystals: sqliteSave.crystals,
      totalClicks: sqliteSave.totalClicks,
      totalEarned: sqliteSave.totalEarned,
      clickPower: sqliteSave.clickPower,
      multiplier: sqliteSave.multiplier,
      autoRate: sqliteSave.autoRate,
      prestige: sqliteSave.prestige,
      prestigePoints: sqliteSave.prestigePoints,
      upgrades: JSON.parse(sqliteSave.upgrades || '[]'),
      achievements: JSON.parse(sqliteSave.achievements || '[]'),
      goldenClicks: sqliteSave.goldenClicks,
      totalCrits: sqliteSave.totalCrits ?? 0,
      maxCombo: sqliteSave.maxCombo,
      lastOnlineTime: sqliteSave.lastOnlineTime,
      totalEvents: sqliteSave.totalEvents ?? 0,
      currentArea: sqliteSave.currentArea || 'naica',
      unlockedAreas: JSON.parse(sqliteSave.unlockedAreas || '["naica"]'),
    } : null;

    // Pick the most recent save by lastOnlineTime
    let data: Record<string, unknown> | null = null;
    const sqlTime = (sqliteData?.lastOnlineTime as number) || 0;
    const fsTime = (firestoreData?.lastOnlineTime as number) || 0;

    if (!sqliteData && !firestoreData) {
      // No save anywhere
      return NextResponse.json({ success: true, data: null });
    } else if (!sqliteData) {
      data = firestoreData!;
    } else if (!firestoreData) {
      data = sqliteData;
    } else {
      // Both exist — use whichever is newer
      data = fsTime > sqlTime ? firestoreData : sqliteData;
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Load error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load' }, { status: 500 });
  }
}
