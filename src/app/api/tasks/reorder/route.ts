import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/utils/session';
import { getGuestId } from '@/lib/utils/guest';
import { z } from 'zod';

const reorderTasksSchema = z.object({
  tasks: z.array(z.object({
    id: z.string(),
    order: z.number(),
    boardId: z.string().optional(),
  })),
});

// POST /api/tasks/reorder - Reorder tasks
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = reorderTasksSchema.parse(body);

    const userId = await getCurrentUserId();
    const guestId = getGuestId();

    // Update tasks in a transaction
    await prisma.$transaction(
      validatedData.tasks.map((task) =>
        prisma.task.updateMany({
          where: {
            id: task.id,
            board: {
              OR: [
                { userId: userId || undefined },
                { guestId: guestId || undefined },
              ],
            },
          },
          data: {
            order: task.order,
            ...(task.boardId && { boardId: task.boardId }),
          },
        })
      )
    );

    return NextResponse.json({ message: 'Tasks reordered successfully' });
  } catch (error) {
    console.error('Error reordering tasks:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to reorder tasks' },
      { status: 500 }
    );
  }
}
