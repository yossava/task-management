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

const updateRecurringTaskSchema = z.object({
  pattern: recurringPatternSchema.optional(),
  nextDueDate: z.string().optional(),
  isActive: z.boolean().optional(),
});

// GET /api/recurring-tasks/[id] - Get a specific recurring task
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const guestId = getGuestId(request);
    const { id } = params;

    if (!session?.user?.id && !guestId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const recurringTask = await prisma.recurringTask.findFirst({
      where: {
        id,
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
            description: true,
            priority: true,
            subtasks: true,
            tags: true,
          },
        },
      },
    });

    if (!recurringTask) {
      return NextResponse.json(
        { error: 'Recurring task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ recurringTask });
  } catch (error) {
    console.error('Error fetching recurring task:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recurring task' },
      { status: 500 }
    );
  }
}

// PATCH /api/recurring-tasks/[id] - Update a recurring task
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const guestId = getGuestId(request);
    const { id } = params;

    if (!session?.user?.id && !guestId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = updateRecurringTaskSchema.parse(body);

    // Verify ownership
    const existing = await prisma.recurringTask.findFirst({
      where: {
        id,
        ...(session?.user?.id ? { userId: session.user.id } : { guestId }),
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Recurring task not found' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: any = {};

    if (validatedData.pattern) {
      updateData.pattern = {
        frequency: validatedData.pattern.frequency,
        interval: validatedData.pattern.interval,
        daysOfWeek: validatedData.pattern.daysOfWeek || [],
        dayOfMonth: validatedData.pattern.dayOfMonth,
        endDate: validatedData.pattern.endDate ? new Date(validatedData.pattern.endDate) : undefined,
      };
    }

    if (validatedData.nextDueDate !== undefined) {
      updateData.nextDueDate = new Date(validatedData.nextDueDate);
    }

    if (validatedData.isActive !== undefined) {
      updateData.isActive = validatedData.isActive;
    }

    const recurringTask = await prisma.recurringTask.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json({ recurringTask });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating recurring task:', error);
    return NextResponse.json(
      { error: 'Failed to update recurring task' },
      { status: 500 }
    );
  }
}

// DELETE /api/recurring-tasks/[id] - Delete a recurring task
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const guestId = getGuestId(request);
    const { id } = params;

    if (!session?.user?.id && !guestId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify ownership
    const existing = await prisma.recurringTask.findFirst({
      where: {
        id,
        ...(session?.user?.id ? { userId: session.user.id } : { guestId }),
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Recurring task not found' },
        { status: 404 }
      );
    }

    await prisma.recurringTask.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting recurring task:', error);
    return NextResponse.json(
      { error: 'Failed to delete recurring task' },
      { status: 500 }
    );
  }
}
