import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 });
    }

    const save = await db.clickerSave.findUnique({ where: { userId } });
    if (!save) return NextResponse.json({ success: true, data: null });
    return NextResponse.json({
      success: true,
      data: {
        crystals: save.crystals, totalClicks: save.totalClicks, totalEarned: save.totalEarned,
        clickPower: save.clickPower, multiplier: save.multiplier, autoRate: save.autoRate,
        prestige: save.prestige, prestigePoints: save.prestigePoints,
        upgrades: JSON.parse(save.upgrades), achievements: JSON.parse(save.achievements),
        goldenClicks: save.goldenClicks, maxCombo: save.maxCombo,
        lastOnlineTime: save.lastOnlineTime, totalEvents: save.totalEvents,
      },
    });
  } catch (error) {
    console.error('Load error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load' }, { status: 500 });
  }
}