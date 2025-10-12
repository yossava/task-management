import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/utils/session';
import { getOrCreateGuestId } from '@/lib/utils/guest';
import { z } from 'zod';

const createCommentSchema = z.object({
  content: z.string().min(1).max(5000),
  author: z.string().min(1),
});

const updateCommentSchema = z.object({
  content: z.string().min(1).max(5000),
});

// POST /api/tasks/[id]/comments - Add comment to task
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await context.params;
    const body = await request.json();
    const { content, author } = createCommentSchema.parse(body);

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

    const now = new Date();
    const newComment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content,
      author,
      authorId: userId || guestId || undefined,
      createdAt: now,
      updatedAt: now,
    };

    const currentComments = task.comments || [];
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        comments: [...currentComments, newComment],
      },
    });

    return NextResponse.json({ task: updatedTask, comment: newComment });
  } catch (error) {
    console.error('Error adding comment:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    );
  }
}

// PATCH /api/tasks/[id]/comments?commentId=xxx - Update a comment
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await context.params;
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('commentId');

    if (!commentId) {
      return NextResponse.json({ error: 'commentId is required' }, { status: 400 });
    }

    const body = await request.json();
    const { content } = updateCommentSchema.parse(body);

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

    const currentComments = task.comments || [];
    const commentIndex = currentComments.findIndex(c => c.id === commentId);

    if (commentIndex === -1) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Verify comment ownership
    const comment = currentComments[commentIndex];
    const isCommentOwner = comment.authorId === (userId || guestId);

    if (!isCommentOwner) {
      return NextResponse.json({ error: 'You can only edit your own comments' }, { status: 403 });
    }

    // Update comment
    const updatedComments = [...currentComments];
    updatedComments[commentIndex] = {
      ...comment,
      content,
      updatedAt: new Date(),
    };

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        comments: updatedComments,
      },
    });

    return NextResponse.json({ task: updatedTask, comment: updatedComments[commentIndex] });
  } catch (error) {
    console.error('Error updating comment:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id]/comments?commentId=xxx - Delete a comment
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await context.params;
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('commentId');

    if (!commentId) {
      return NextResponse.json({ error: 'commentId is required' }, { status: 400 });
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

    const currentComments = task.comments || [];
    const comment = currentComments.find(c => c.id === commentId);

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Verify comment ownership
    const isCommentOwner = comment.authorId === (userId || guestId);

    if (!isCommentOwner) {
      return NextResponse.json({ error: 'You can only delete your own comments' }, { status: 403 });
    }

    const updatedComments = currentComments.filter(c => c.id !== commentId);
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        comments: updatedComments,
      },
    });

    return NextResponse.json({ task: updatedTask, message: 'Comment deleted' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}
