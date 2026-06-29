import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const save = await db.clickerSave.findFirst();

    if (!save) {
      return NextResponse.json({ success: true, data: null });
    }

    return NextResponse.json({
      success: true,
      data: {
        crystals: save.crystals,
        totalClicks: save.totalClicks,
        totalEarned: save.totalEarned,
        clickPower: save.clickPower,
        multiplier: save.multiplier,
        autoRate: save.autoRate,
        prestige: save.prestige,
        prestigePoints: save.prestigePoints,
        upgrades: JSON.parse(save.upgrades),
        achievements: JSON.parse(save.achievements),
        goldenClicks: save.goldenClicks,
        maxCombo: save.maxCombo,
        lastOnlineTime: save.lastOnlineTime,
      },
    });
  } catch (error) {
    console.error('Load error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load' }, { status: 500 });
  }
}
