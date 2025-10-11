import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/utils/session';
import { getGuestId } from '@/lib/utils/guest';
import { z } from 'zod';

const updateBoardSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  color: z.string().optional(),
});

// GET /api/boards/[id] - Get a single board
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getCurrentUserId();
    const guestId = getGuestId();

    const board = await prisma.board.findFirst({
      where: {
        id: params.id,
        OR: [
          { userId: userId || undefined },
          { guestId: guestId || undefined },
        ],
      },
      include: {
        tasks: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!board) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    return NextResponse.json({ board });
  } catch (error) {
    console.error('Error fetching board:', error);
    return NextResponse.json(
      { error: 'Failed to fetch board' },
      { status: 500 }
    );
  }
}

// PATCH /api/boards/[id] - Update a board
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = updateBoardSchema.parse(body);

    const userId = await getCurrentUserId();
    const guestId = getGuestId();

    // Verify ownership
    const existingBoard = await prisma.board.findFirst({
      where: {
        id: params.id,
        OR: [
          { userId: userId || undefined },
          { guestId: guestId || undefined },
        ],
      },
    });

    if (!existingBoard) {
      return NextResponse.json(
        { error: 'Board not found or unauthorized' },
        { status: 404 }
      );
    }

    const board = await prisma.board.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        tasks: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return NextResponse.json({ board });
  } catch (error) {
    console.error('Error updating board:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update board' },
      { status: 500 }
    );
  }
}

// DELETE /api/boards/[id] - Delete a board
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getCurrentUserId();
    const guestId = getGuestId();

    // Verify ownership
    const existingBoard = await prisma.board.findFirst({
      where: {
        id: params.id,
        OR: [
          { userId: userId || undefined },
          { guestId: guestId || undefined },
        ],
      },
    });

    if (!existingBoard) {
      return NextResponse.json(
        { error: 'Board not found or unauthorized' },
        { status: 404 }
      );
    }

    await prisma.board.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Board deleted successfully' });
  } catch (error) {
    console.error('Error deleting board:', error);
    return NextResponse.json(
      { error: 'Failed to delete board' },
      { status: 500 }
    );
  }
}
