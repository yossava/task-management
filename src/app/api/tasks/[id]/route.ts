import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/utils/session';
import { getOrCreateGuestId } from '@/lib/utils/guest';
import { z } from 'zod';

const updateTaskSchema = z.object({
  text: z.string().min(1).optional(),
  completed: z.boolean().optional(),
  description: z.string().optional(),
  color: z.string().optional(),
  showGradient: z.boolean().optional(),
  dueDate: z.string().nullable().optional(),
  progress: z.number().min(0).max(100).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).nullable().optional(),
  subtasks: z.array(z.object({
    id: z.string(),
    text: z.string(),
    completed: z.boolean(),
  })).optional(),
  boardId: z.string().optional(), // For moving tasks between boards
  order: z.number().optional(),
  dependencies: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

// PATCH /api/tasks/[id] - Update a task
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const validatedData = updateTaskSchema.parse(body);

    const userId = await getCurrentUserId();
    const guestId = userId ? undefined : await getOrCreateGuestId();

    // Get task with board to verify ownership
    const task = await prisma.task.findUnique({
      where: { id: id },
      include: { board: true },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Verify ownership through board
    const hasAccess =
      (userId && task.board.userId === userId) ||
      (guestId && task.board.guestId === guestId);

    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // If moving to a different board, verify target board ownership
    if (validatedData.boardId && validatedData.boardId !== task.boardId) {
      const targetBoard = await prisma.board.findFirst({
        where: {
          id: validatedData.boardId,
          OR: [
            { userId: userId || undefined },
            { guestId: guestId || undefined },
          ],
        },
      });

      if (!targetBoard) {
        return NextResponse.json(
          { error: 'Target board not found or unauthorized' },
          { status: 404 }
        );
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id: id },
      data: {
        ...(validatedData.text !== undefined && { text: validatedData.text }),
        ...(validatedData.completed !== undefined && { completed: validatedData.completed }),
        ...(validatedData.description !== undefined && { description: validatedData.description }),
        ...(validatedData.color !== undefined && { color: validatedData.color }),
        ...(validatedData.showGradient !== undefined && { showGradient: validatedData.showGradient }),
        ...(validatedData.dueDate !== undefined && {
          dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        }),
        ...(validatedData.progress !== undefined && { progress: validatedData.progress }),
        ...(validatedData.priority !== undefined && { priority: validatedData.priority }),
        ...(validatedData.subtasks !== undefined && { subtasks: validatedData.subtasks }),
        ...(validatedData.boardId !== undefined && { boardId: validatedData.boardId }),
        ...(validatedData.order !== undefined && { order: validatedData.order }),
        ...(validatedData.dependencies !== undefined && { dependencies: validatedData.dependencies }),
        ...(validatedData.tags !== undefined && { tags: validatedData.tags }),
      },
    });

    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    console.error('Error updating task:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id] - Delete a task
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const userId = await getCurrentUserId();
    const guestId = userId ? undefined : await getOrCreateGuestId();

    // Get task with board to verify ownership
    const task = await prisma.task.findUnique({
      where: { id: id },
      include: { board: true },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Verify ownership through board
    const hasAccess =
      (userId && task.board.userId === userId) ||
      (guestId && task.board.guestId === guestId);

    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await prisma.task.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}
