import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/clicker/premium?userId=xxx
// Returns list of owned premium item IDs for the user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 });
    }

    const purchases = await db.premiumPurchase.findMany({
      where: { userId },
      select: { itemId: true },
    });

    const ownedItems = purchases.map(p => p.itemId);

    return NextResponse.json({ success: true, ownedItems });
  } catch (error) {
    console.error('Premium load error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load premium items' }, { status: 500 });
  }
}

// POST /api/clicker/premium
// Purchase a premium item (simulated — no real payment)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, itemId } = body;

    if (!userId || !itemId) {
      return NextResponse.json({ success: false, error: 'userId and itemId are required' }, { status: 400 });
    }

    // Validate itemId exists in our catalog
    const { PREMIUM_ITEMS } = await import('@/lib/premium-items');
    const item = PREMIUM_ITEMS.find(i => i.id === itemId);
    if (!item) {
      return NextResponse.json({ success: false, error: 'Invalid item ID' }, { status: 400 });
    }

    // Check if already owned
    const existing = await db.premiumPurchase.findUnique({
      where: { userId_itemId: { userId, itemId } },
    });

    if (existing) {
      return NextResponse.json({ success: false, error: 'Already owned', alreadyOwned: true });
    }

    // Create purchase record (simulated payment)
    await db.premiumPurchase.create({
      data: { userId, itemId },
    });

    return NextResponse.json({
      success: true,
      itemId,
      itemName: item.name,
      price: item.price,
    });
  } catch (error) {
    console.error('Premium purchase error:', error);
    return NextResponse.json({ success: false, error: 'Failed to purchase' }, { status: 500 });
  }
}
