import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      crystals,
      totalClicks,
      totalEarned,
      clickPower,
      multiplier,
      autoRate,
      prestige,
      prestigePoints,
      upgrades,
      achievements,
      goldenClicks,
      maxCombo,
    } = body;

    const existing = await db.clickerSave.findFirst();

    if (existing) {
      await db.clickerSave.update({
        where: { id: existing.id },
        data: {
          crystals,
          totalClicks,
          totalEarned,
          clickPower,
          multiplier,
          autoRate,
          prestige,
          prestigePoints,
          upgrades: JSON.stringify(upgrades),
          achievements: JSON.stringify(achievements),
          goldenClicks,
          maxCombo,
        },
      });
    } else {
      await db.clickerSave.create({
        data: {
          crystals,
          totalClicks,
          totalEarned,
          clickPower,
          multiplier,
          autoRate,
          prestige,
          prestigePoints,
          upgrades: JSON.stringify(upgrades),
          achievements: JSON.stringify(achievements),
          goldenClicks,
          maxCombo,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save' }, { status: 500 });
  }
}