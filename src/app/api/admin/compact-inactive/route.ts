import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/admin/compact-inactive
// Cron job endpoint: compacts accounts inactive for 365+ days
// Call this periodically (e.g., daily) to manage storage
export async function POST() {
  try {
    const INACTIVE_THRESHOLD_MS = 365 * 24 * 60 * 60 * 1000; // 365 days
    const now = Date.now();

    // Find all active accounts that haven't been online for 365+ days
    const inactiveAccounts = await db.clickerSave.findMany({
      where: {
        status: 'active',
        lastOnlineTime: { lt: (now - INACTIVE_THRESHOLD_MS) / 1000 },
      },
    });

    if (inactiveAccounts.length === 0) {
      return NextResponse.json({ message: 'No inactive accounts to compact', compacted: 0 });
    }

    let compacted = 0;

    for (const save of inactiveAccounts) {
      // Build compacted summary
      let areasUnlocked = 1; // Default: first area always unlocked
      try {
        const upgrades = JSON.parse(save.upgrades);
        if (Array.isArray(upgrades) && upgrades.length > 0) {
          // Count unique area prefixes if available
          const areaSet = new Set();
          for (const u of upgrades) {
            if (u.id) {
              // Derive area from upgrade ID patterns
              areaSet.add('default');
            }
          }
          areasUnlocked = Math.max(areaSet.size, 1);
        }
      } catch {}

      const compactedData = JSON.stringify({
        originalUserId: save.userId,
        lastActivityTimestamp: save.lastOnlineTime,
        totalEarned: save.totalEarned,
        totalClicks: save.totalClicks,
        prestige: save.prestige,
        prestigePoints: save.prestigePoints,
        totalEvents: save.totalEvents,
        areasUnlocked,
        compactedAt: now,
      });

      // Archive the full data before compaction (retained for 90 days for legal access)
      const archiveExpiry = new Date(now + 90 * 24 * 60 * 60 * 1000); // 90 days from now

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
          archiveReason: 'inactivity_compaction',
          expiresAt: archiveExpiry,
        },
      });

      // Compact the save data
      await db.clickerSave.update({
        where: { userId: save.userId },
        data: {
          status: 'compacted',
          compactedData,
          crystals: 0,
          totalClicks: 0,
          totalEarned: 0,
          clickPower: 1,
          multiplier: 1,
          autoRate: 0,
          upgrades: '{}',
          achievements: '[]',
          goldenClicks: 0,
          maxCombo: 0,
          totalEvents: 0,
        },
      });

      compacted++;
    }

    // Clean up expired archives (older than 90 days, inactivity only)
    const expiredArchives = await db.accountArchive.findMany({
      where: {
        archiveReason: 'inactivity_compaction',
        expiresAt: { lt: new Date() },
      },
    });

    if (expiredArchives.length > 0) {
      const ids = expiredArchives.map(a => a.id);
      await db.accountArchive.deleteMany({ where: { id: { in: ids } } });
    }

    return NextResponse.json({
      message: `Compacted ${compacted} inactive accounts`,
      compacted,
      archivesCleaned: expiredArchives.length,
    });
  } catch (error) {
    console.error('Compact inactive error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}