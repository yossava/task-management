import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getGuestId } from '@/lib/utils/guest';
import { z } from 'zod';

const recurringPatternSchema = z.object({
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly', 'custom']),
  interval: z.number().min(1),
  daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
  dayOfMonth: z.number().min(1).max(31).optional(),
  endDate: z.string().optional(),
});

const createRecurringTaskSchema = z.object({
  boardId: z.string(),
  taskId: z.string(),
  pattern: recurringPatternSchema,
  nextDueDate: z.string(),
});

// GET /api/recurring-tasks - Get all recurring tasks for user/guest
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const guestId = getGuestId(request);

    if (!session?.user?.id && !guestId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const where = session?.user?.id
      ? { userId: session.user.id }
      : { guestId };

    const recurringTasks = await prisma.recurringTask.findMany({
      where,
      include: {
        board: {
          select: {
            id: true,
            title: true,
          },
        },
        task: {
          select: {
            id: true,
            text: true,
            description: true,
            priority: true,
            subtasks: true,
            tags: true,
          },
        },
      },
      orderBy: {
        nextDueDate: 'asc',
      },
    });

    return NextResponse.json({ recurringTasks });
  } catch (error) {
    console.error('Error fetching recurring tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recurring tasks' },
      { status: 500 }
    );
  }
}

// POST /api/recurring-tasks - Create a new recurring task
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const guestId = getGuestId(request);

    if (!session?.user?.id && !guestId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createRecurringTaskSchema.parse(body);

    // Verify the board and task belong to the user/guest
    const board = await prisma.board.findFirst({
      where: {
        id: validatedData.boardId,
        ...(session?.user?.id ? { userId: session.user.id } : { guestId }),
      },
    });

    if (!board) {
      return NextResponse.json(
        { error: 'Board not found' },
        { status: 404 }
      );
    }

    const task = await prisma.task.findFirst({
      where: {
        id: validatedData.taskId,
        boardId: validatedData.boardId,
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Create the recurring task
    const recurringTask = await prisma.recurringTask.create({
      data: {
        boardId: validatedData.boardId,
        taskId: validatedData.taskId,
        pattern: {
          frequency: validatedData.pattern.frequency,
          interval: validatedData.pattern.interval,
          daysOfWeek: validatedData.pattern.daysOfWeek || [],
          dayOfMonth: validatedData.pattern.dayOfMonth,
          endDate: validatedData.pattern.endDate ? new Date(validatedData.pattern.endDate) : undefined,
        },
        nextDueDate: new Date(validatedData.nextDueDate),
        ...(session?.user?.id ? { userId: session.user.id } : { guestId }),
      },
      include: {
        board: {
          select: {
            id: true,
            title: true,
          },
        },
        task: {
          select: {
            id: true,
            text: true,
          },
        },
      },
    });

    return NextResponse.json({ recurringTask }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating recurring task:', error);
    return NextResponse.json(
      { error: 'Failed to create recurring task' },
      { status: 500 }
    );
  }
}
