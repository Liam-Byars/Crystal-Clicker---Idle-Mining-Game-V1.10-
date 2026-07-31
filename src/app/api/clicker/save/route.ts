import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { firestoreSave, isFirestoreConfigured } from '@/lib/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = body.userId;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 });
    }

    // Build the full save data object
    const saveData = {
      crystals: body.crystals,
      crystalsExp: body.crystalsExp ?? 0,
      totalClicks: body.totalClicks,
      totalEarned: body.totalEarned,
      totalEarnedExp: body.totalEarnedExp ?? 0,
      clickPower: body.clickPower,
      multiplier: body.multiplier,
      autoRate: body.autoRate,
      prestige: body.prestige,
      prestigePoints: body.prestigePoints,
      upgrades: body.upgrades,
      achievements: body.achievements,
      goldenClicks: body.goldenClicks,
      totalCrits: body.totalCrits ?? 0,
      maxCombo: body.maxCombo,
      lastOnlineTime: body.lastOnlineTime ?? Date.now(),
      totalEvents: body.totalEvents ?? 0,
      currentArea: body.currentArea ?? 'naica',
      unlockedAreas: body.unlockedAreas ?? ['naica'],
    };

    // Sanitize numeric fields — NaN must never be written to DB
    const safe = (v: unknown, fallback: number) => {
      const n = typeof v === 'number' ? v : Number(v);
      return isFinite(n) ? n : fallback;
    };

    // Write to SQLite (local server database)
    const sqliteData = {
      crystals: safe(saveData.crystals, 0),
      crystalsExp: safe(saveData.crystalsExp, 0),
      totalClicks: safe(saveData.totalClicks, 0),
      totalEarned: safe(saveData.totalEarned, 0),
      totalEarnedExp: safe(saveData.totalEarnedExp, 0),
      clickPower: safe(saveData.clickPower, 1),
      multiplier: safe(saveData.multiplier, 1),
      autoRate: safe(saveData.autoRate, 0),
      prestige: safe(saveData.prestige, 0),
      prestigePoints: safe(saveData.prestigePoints, 0),
      upgrades: JSON.stringify(saveData.upgrades),
      achievements: JSON.stringify(saveData.achievements),
      goldenClicks: safe(saveData.goldenClicks, 0),
      totalCrits: safe(saveData.totalCrits, 0),
      maxCombo: safe(saveData.maxCombo, 0),
      lastOnlineTime: safe(saveData.lastOnlineTime, Date.now()),
      totalEvents: safe(saveData.totalEvents, 0),
      currentArea: saveData.currentArea ?? 'naica',
      unlockedAreas: JSON.stringify(saveData.unlockedAreas ?? ['naica']),
    };

    const existing = await db.clickerSave.findUnique({ where: { userId } });
    if (existing) {
      await db.clickerSave.update({ where: { userId }, data: sqliteData });
    } else {
      await db.clickerSave.create({ data: { ...sqliteData, userId } });
    }

    // Write to Firestore (cloud database) — fire and forget, don't block response
    if (isFirestoreConfigured) {
      firestoreSave(userId, saveData).catch((e) => {
        console.error('Firestore save background error:', e);
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save' }, { status: 500 });
  }
}
