import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/utils/session';
import { getGuestId, clearGuestId } from '@/lib/utils/guest';

// POST /api/auth/migrate-guest - Migrate guest data to authenticated user
export async function POST() {
  try {
    const userId = await getCurrentUserId();
    const guestId = await getGuestId();

    if (!userId) {
      return NextResponse.json(
        { error: 'User must be authenticated' },
        { status: 401 }
      );
    }

    if (!guestId) {
      return NextResponse.json(
        { message: 'No guest data to migrate' },
        { status: 200 }
      );
    }

    // Migrate boards from guest to user
    const migratedBoards = await prisma.board.updateMany({
      where: { guestId },
      data: {
        userId,
        guestId: null,
      },
    });

    // Migrate page header from guest to user (if exists)
    await prisma.pageHeader.updateMany({
      where: { guestId },
      data: {
        userId,
        guestId: null,
      },
    });

    // Clear guest cookie
    await clearGuestId();

    return NextResponse.json({
      message: 'Guest data migrated successfully',
      migratedBoards: migratedBoards.count,
    });
  } catch (error) {
    console.error('Error migrating guest data:', error);
    return NextResponse.json(
      { error: 'Failed to migrate guest data' },
      { status: 500 }
    );
  }
}
