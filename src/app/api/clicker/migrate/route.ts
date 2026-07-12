import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { parseAndVerifyRequest } from '@/lib/verify-token';

/**
 * POST /api/clicker/migrate
 * Migrate a guest save to a Google user's account.
 * Body: { userId: googleUid, idToken: firebaseToken, guestUserId: string, saveData: object }
 *
 * Logic:
 * 1. Verify the Google user's identity via token
 * 2. Check if Google user already has save data
 * 3. If no existing Google save, write the guest save data under the Google userId
 * 4. If Google save exists, merge (keep the more progressed one)
 * 5. Delete the guest save (optional cleanup)
 */
export async function POST(request: NextRequest) {
  try {
    const result = await parseAndVerifyRequest(request);
    if (result instanceof NextResponse) return result;

    const { userId: googleUserId, isGuest, body } = result;
    if (isGuest) {
      return NextResponse.json({ success: false, error: 'Migration requires a Google account' }, { status: 400 });
    }

    const guestUserId = body.guestUserId as string;
    const saveData = body.saveData as Record<string, unknown> | undefined;

    if (!guestUserId || !saveData) {
      return NextResponse.json({ success: false, error: 'guestUserId and saveData are required' }, { status: 400 });
    }

    // Check if Google user already has a save
    const existingGoogleSave = await db.clickerSave.findUnique({ where: { userId: googleUserId } });

    // Check if guest has a server save too (in addition to the client-sent data)
    const existingGuestSave = await db.clickerSave.findUnique({ where: { userId: guestUserId } });

    let dataToSave: Record<string, unknown>;

    if (existingGoogleSave) {
      // Google user already has progress — merge: keep whichever has more totalEarned
      const googleEarned = Number(existingGoogleSave.totalEarned) || 0;
      const guestEarned = Number(saveData.totalEarned) || 0;

      if (guestEarned > googleEarned) {
        // Guest progress is better — use guest data
        dataToSave = {
          crystals: Math.max(Number(saveData.crystals) || 0, Number(existingGoogleSave.crystals) || 0),
          totalClicks: Math.max(Number(saveData.totalClicks) || 0, Number(existingGoogleSave.totalClicks) || 0),
          totalEarned: Math.max(guestEarned, googleEarned),
          clickPower: Number(saveData.clickPower) || Number(existingGoogleSave.clickPower) || 1,
          multiplier: Number(saveData.multiplier) || Number(existingGoogleSave.multiplier) || 1,
          autoRate: Number(saveData.autoRate) || Number(existingGoogleSave.autoRate) || 0,
          prestige: Math.max(Number(saveData.prestige) || 0, Number(existingGoogleSave.prestige) || 0),
          prestigePoints: Math.max(Number(saveData.prestigePoints) || 0, Number(existingGoogleSave.prestigePoints) || 0),
          upgrades: JSON.stringify(saveData.upgrades || JSON.parse(existingGoogleSave.upgrades)),
          achievements: JSON.stringify(saveData.achievements || JSON.parse(existingGoogleSave.achievements)),
          goldenClicks: Math.max(Number(saveData.goldenClicks) || 0, Number(existingGoogleSave.goldenClicks) || 0),
          maxCombo: Math.max(Number(saveData.maxCombo) || 0, Number(existingGoogleSave.maxCombo) || 0),
          lastOnlineTime: Date.now(),
          totalEvents: Math.max(Number(saveData.totalEvents) || 0, Number(existingGoogleSave.totalEvents) || 0),
        };
      } else {
        // Google progress is better — keep it, no changes needed
        return NextResponse.json({ success: true, migrated: false, message: 'Existing Google save has more progress — kept existing data.' });
      }
    } else {
      // No existing Google save — use guest data directly
      dataToSave = {
        crystals: Number(saveData.crystals) || 0,
        totalClicks: Number(saveData.totalClicks) || 0,
        totalEarned: Number(saveData.totalEarned) || 0,
        clickPower: Number(saveData.clickPower) || 1,
        multiplier: Number(saveData.multiplier) || 1,
        autoRate: Number(saveData.autoRate) || 0,
        prestige: Number(saveData.prestige) || 0,
        prestigePoints: Number(saveData.prestigePoints) || 0,
        upgrades: JSON.stringify(saveData.upgrades || []),
        achievements: JSON.stringify(saveData.achievements || []),
        goldenClicks: Number(saveData.goldenClicks) || 0,
        maxCombo: Number(saveData.maxCombo) || 0,
        lastOnlineTime: Date.now(),
        totalEvents: Number(saveData.totalEvents) || 0,
      };
    }

    // Write to Google user's save slot
    await db.clickerSave.upsert({
      where: { userId: googleUserId },
      update: dataToSave,
      create: { ...dataToSave, userId: googleUserId },
    });

    // Clean up guest save from server
    if (existingGuestSave) {
      try { await db.clickerSave.delete({ where: { userId: guestUserId } }); } catch { /* ignore */ }
    }

    return NextResponse.json({ success: true, migrated: true, message: 'Guest progress migrated to Google account!' });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ success: false, error: 'Failed to migrate' }, { status: 500 });
  }
}