import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/utils/session';
import { getOrCreateGuestId } from '@/lib/utils/guest';
import { z } from 'zod';

const reorderBoardsSchema = z.object({
  boards: z.array(z.object({
    id: z.string(),
    order: z.number(),
  })),
});

// POST /api/boards/reorder - Reorder boards
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = reorderBoardsSchema.parse(body);

    console.log('=== REORDER START ===');

    // Check fingerprint header FIRST
    const headersList = await headers();
    const fingerprintHeader = headersList.get('x-guest-fingerprint');
    console.log('[REORDER] Fingerprint header FROM HEADERS():', fingerprintHeader);

    const userId = await getCurrentUserId();
    console.log('[REORDER] User ID:', userId);

    // Always get guestId for guest users
    let guestId: string | undefined = undefined;
    if (!userId) {
      guestId = await getOrCreateGuestId();
      console.log('[REORDER] Guest ID retrieved from getOrCreateGuestId():', guestId);
    }

    console.log('Reordering boards:', validatedData.boards);
    console.log('userId:', userId, 'guestId:', guestId);

    // Build where clause based on authentication status
    const authFilter = userId
      ? { userId: userId }
      : { guestId: guestId };

    // Update each board's order individually
    for (const board of validatedData.boards) {
      const result = await prisma.board.updateMany({
        where: {
          id: board.id,
          ...authFilter,
        },
        data: {
          order: board.order,
        },
      });
      console.log(`Updated board ${board.id} to order ${board.order}, matched ${result.count} records`);
    }

    return NextResponse.json({ message: 'Boards reordered successfully' });
  } catch (error) {
    console.error('Error reordering boards:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to reorder boards' },
      { status: 500 }
    );
  }
}
