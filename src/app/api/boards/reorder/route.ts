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

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// POST /api/boards/reorder - Reorder boards
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = reorderBoardsSchema.parse(body);

    console.log('=== REORDER START ===');

    const userId = await getCurrentUserId();
    console.log('[REORDER] User ID:', userId);

    // Always get guestId for guest users - MUST await properly
    let guestId: string | undefined = undefined;
    if (!userId) {
      guestId = await getOrCreateGuestId();
      console.log('[REORDER] Guest ID retrieved from getOrCreateGuestId():', guestId);

      // Verify guestId is not undefined
      if (!guestId) {
        console.error('[REORDER] ERROR: guestId is undefined after getOrCreateGuestId()!');
        return NextResponse.json(
          { error: 'Failed to get guest ID' },
          { status: 500 }
        );
      }
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

    const response = NextResponse.json({ message: 'Boards reordered successfully' });
    // Add cache control headers to prevent any caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
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
