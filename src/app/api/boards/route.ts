import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/utils/session';
import { getOrCreateGuestId } from '@/lib/utils/guest';
import { z } from 'zod';

const createBoardSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  color: z.string().default('#3b82f6'),
});

// GET /api/boards - List all boards for current user/guest
export async function GET() {
  try {
    const userId = await getCurrentUserId();

    let boards;
    if (userId) {
      // Fetch user's boards
      boards = await prisma.board.findMany({
        where: { userId },
        include: {
          tasks: {
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      // Fetch guest's boards
      const guestId = await getOrCreateGuestId();
      boards = await prisma.board.findMany({
        where: { guestId },
        include: {
          tasks: {
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json({ boards });
  } catch (error) {
    console.error('Error fetching boards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch boards' },
      { status: 500 }
    );
  }
}

// POST /api/boards - Create a new board
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = createBoardSchema.parse(body);

    const userId = await getCurrentUserId();

    if (!userId) {
      // Guest user - check board limit
      const guestId = await getOrCreateGuestId();
      const boardCount = await prisma.board.count({
        where: { guestId },
      });

      if (boardCount >= 2) {
        return NextResponse.json(
          {
            error: 'Guest users can only create 2 boards. Please register to create more boards.',
            requiresAuth: true,
          },
          { status: 403 }
        );
      }

      // Create board for guest
      const board = await prisma.board.create({
        data: {
          title: validatedData.title,
          description: validatedData.description,
          color: validatedData.color,
          guestId,
        },
        include: {
          tasks: true,
        },
      });

      return NextResponse.json({ board }, { status: 201 });
    }

    // Create board for authenticated user
    const board = await prisma.board.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        color: validatedData.color,
        userId,
      },
      include: {
        tasks: true,
      },
    });

    return NextResponse.json({ board }, { status: 201 });
  } catch (error) {
    console.error('Error creating board:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create board' },
      { status: 500 }
    );
  }
}
