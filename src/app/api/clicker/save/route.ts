import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = body.userId;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 });
    }

    const data = {
      crystals: body.crystals, totalClicks: body.totalClicks, totalEarned: body.totalEarned,
      clickPower: body.clickPower, multiplier: body.multiplier, autoRate: body.autoRate,
      prestige: body.prestige, prestigePoints: body.prestigePoints,
      upgrades: JSON.stringify(body.upgrades), achievements: JSON.stringify(body.achievements),
      goldenClicks: body.goldenClicks, maxCombo: body.maxCombo,
      lastOnlineTime: body.lastOnlineTime ?? Date.now(), totalEvents: body.totalEvents ?? 0,
    };

    const existing = await db.clickerSave.findUnique({ where: { userId } });
    if (existing) {
      await db.clickerSave.update({ where: { userId }, data });
    } else {
      await db.clickerSave.create({ data: { ...data, userId } });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save' }, { status: 500 });
  }
}