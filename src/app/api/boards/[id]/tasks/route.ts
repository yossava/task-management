import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/utils/session';
import { getGuestId } from '@/lib/utils/guest';
import { z } from 'zod';

const createTaskSchema = z.object({
  text: z.string().min(1, 'Task text is required'),
  description: z.string().optional(),
  color: z.string().optional(),
  showGradient: z.boolean().optional().default(true),
  dueDate: z.string().optional(),
  progress: z.number().min(0).max(100).optional().default(0),
  subtasks: z.array(z.object({
    id: z.string(),
    text: z.string(),
    completed: z.boolean(),
  })).optional().default([]),
});

// POST /api/boards/[id]/tasks - Create a new task
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const validatedData = createTaskSchema.parse(body);

    const userId = await getCurrentUserId();
    const guestId = await getGuestId();

    // Verify board ownership
    const board = await prisma.board.findFirst({
      where: {
        id: id,
        OR: [
          { userId: userId || undefined },
          { guestId: guestId || undefined },
        ],
      },
      include: {
        tasks: {
          orderBy: { order: 'desc' },
          take: 1,
        },
      },
    });

    if (!board) {
      return NextResponse.json(
        { error: 'Board not found or unauthorized' },
        { status: 404 }
      );
    }

    // Check task limit for guest users
    if (!userId && guestId) {
      const taskCount = await prisma.task.count({
        where: { boardId: id },
      });

      if (taskCount >= 20) {
        return NextResponse.json(
          {
            error: 'Guest users can only create 20 tasks per board. Please register to create more tasks.',
            requiresAuth: true,
          },
          { status: 403 }
        );
      }
    }

    // Get next order value
    const nextOrder = board.tasks.length > 0 ? board.tasks[0].order + 1 : 0;

    const task = await prisma.task.create({
      data: {
        text: validatedData.text,
        description: validatedData.description,
        color: validatedData.color,
        showGradient: validatedData.showGradient,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        progress: validatedData.progress,
        subtasks: validatedData.subtasks,
        boardId: id,
        order: nextOrder,
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}

// GET /api/boards/[id]/tasks - Get all tasks for a board
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const userId = await getCurrentUserId();
    const guestId = await getGuestId();

    // Verify board ownership
    const board = await prisma.board.findFirst({
      where: {
        id: id,
        OR: [
          { userId: userId || undefined },
          { guestId: guestId || undefined },
        ],
      },
    });

    if (!board) {
      return NextResponse.json(
        { error: 'Board not found or unauthorized' },
        { status: 404 }
      );
    }

    const tasks = await prisma.task.findMany({
      where: { boardId: id },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}
