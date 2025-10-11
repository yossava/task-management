import { NextResponse } from 'next/server';
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

    const userId = await getCurrentUserId();
    const guestId = userId ? undefined : await getOrCreateGuestId();

    // Update each board's order individually
    for (const board of validatedData.boards) {
      await prisma.board.updateMany({
        where: {
          id: board.id,
          OR: [
            { userId: userId || undefined },
            { guestId: guestId || undefined },
          ].filter(Boolean),
        },
        data: {
          order: board.order,
        },
      });
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
