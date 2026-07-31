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

    // Write to SQLite (local server database)
    const sqliteData = {
      crystals: saveData.crystals ?? 0,
      crystalsExp: saveData.crystalsExp,
      totalClicks: saveData.totalClicks ?? 0,
      totalEarned: saveData.totalEarned ?? 0,
      totalEarnedExp: saveData.totalEarnedExp,
      clickPower: saveData.clickPower ?? 1,
      multiplier: saveData.multiplier ?? 1,
      autoRate: saveData.autoRate ?? 0,
      prestige: saveData.prestige ?? 0,
      prestigePoints: saveData.prestigePoints ?? 0,
      upgrades: JSON.stringify(saveData.upgrades),
      achievements: JSON.stringify(saveData.achievements),
      goldenClicks: saveData.goldenClicks ?? 0,
      totalCrits: saveData.totalCrits,
      maxCombo: saveData.maxCombo ?? 0,
      lastOnlineTime: saveData.lastOnlineTime,
      totalEvents: saveData.totalEvents,
      currentArea: saveData.currentArea,
      unlockedAreas: JSON.stringify(saveData.unlockedAreas),
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
