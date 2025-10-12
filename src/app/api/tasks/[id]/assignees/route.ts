import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/utils/session';
import { getOrCreateGuestId } from '@/lib/utils/guest';
import { z } from 'zod';

const assigneeSchema = z.object({
  assigneeId: z.string().min(1),
});

// POST /api/tasks/[id]/assignees - Add assignee to task
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await context.params;
    const body = await request.json();
    const { assigneeId } = assigneeSchema.parse(body);

    const userId = await getCurrentUserId();
    const guestId = userId ? undefined : await getOrCreateGuestId();

    // Get task with board to verify ownership
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { board: true },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Verify ownership
    const hasAccess =
      (userId && task.board.userId === userId) ||
      (guestId && task.board.guestId === guestId);

    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if assignee already exists
    const currentAssignees = task.assigneeIds || [];
    if (currentAssignees.includes(assigneeId)) {
      return NextResponse.json({ error: 'Assignee already added' }, { status: 400 });
    }

    // Add assignee
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        assigneeIds: [...currentAssignees, assigneeId],
      },
    });

    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    console.error('Error adding assignee:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to add assignee' },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id]/assignees?assigneeId=xxx - Remove assignee from task
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await context.params;
    const { searchParams } = new URL(request.url);
    const assigneeId = searchParams.get('assigneeId');

    if (!assigneeId) {
      return NextResponse.json({ error: 'assigneeId is required' }, { status: 400 });
    }

    const userId = await getCurrentUserId();
    const guestId = userId ? undefined : await getOrCreateGuestId();

    // Get task with board to verify ownership
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { board: true },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Verify ownership
    const hasAccess =
      (userId && task.board.userId === userId) ||
      (guestId && task.board.guestId === guestId);

    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Remove assignee
    const updatedAssignees = (task.assigneeIds || []).filter(id => id !== assigneeId);
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        assigneeIds: updatedAssignees,
      },
    });

    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    console.error('Error removing assignee:', error);
    return NextResponse.json(
      { error: 'Failed to remove assignee' },
      { status: 500 }
    );
  }
}
