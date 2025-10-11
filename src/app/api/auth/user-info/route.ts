import { NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/utils/session';
import { getGuestId, GUEST_LIMITS } from '@/lib/utils/guest';
import { prisma } from '@/lib/prisma';

// GET /api/auth/user-info - Get current user info and limits
export async function GET() {
  try {
    const userId = await getCurrentUserId();
    const guestId = await getGuestId();

    if (userId) {
      // Authenticated user - no limits
      const boardCount = await prisma.board.count({
        where: { userId },
      });

      return NextResponse.json({
        isGuest: false,
        userId,
        limits: null,
        usage: {
          boards: boardCount,
        },
      });
    } else if (guestId) {
      // Guest user - has limits
      const boardCount = await prisma.board.count({
        where: { guestId },
      });

      return NextResponse.json({
        isGuest: true,
        guestId,
        limits: {
          maxBoards: GUEST_LIMITS.MAX_BOARDS,
          maxTasksPerBoard: GUEST_LIMITS.MAX_TASKS_PER_BOARD,
        },
        usage: {
          boards: boardCount,
        },
      });
    } else {
      // No user yet
      return NextResponse.json({
        isGuest: true,
        limits: {
          maxBoards: GUEST_LIMITS.MAX_BOARDS,
          maxTasksPerBoard: GUEST_LIMITS.MAX_TASKS_PER_BOARD,
        },
        usage: {
          boards: 0,
        },
      });
    }
  } catch (error) {
    console.error('Error fetching user info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user info' },
      { status: 500 }
    );
  }
}
