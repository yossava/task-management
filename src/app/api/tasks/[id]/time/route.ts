import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/utils/session';
import { getOrCreateGuestId } from '@/lib/utils/guest';
import { z } from 'zod';

const startTimerSchema = z.object({
  action: z.literal('start'),
});

const stopTimerSchema = z.object({
  action: z.literal('stop'),
  note: z.string().optional(),
});

const addTimeLogSchema = z.object({
  action: z.literal('log'),
  startTime: z.string(),
  endTime: z.string(),
  note: z.string().optional(),
});

const setEstimateSchema = z.object({
  action: z.literal('set_estimate'),
  estimatedTime: z.number().min(0), // minutes
});

// POST /api/tasks/[id]/time - Manage time tracking
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await context.params;
    const body = await request.json();

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

    // Handle different actions
    if (body.action === 'start') {
      startTimerSchema.parse(body);

      // Check if timer is already running
      if (task.activeTimer) {
        return NextResponse.json({ error: 'Timer already running' }, { status: 400 });
      }

      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: {
          activeTimer: {
            startTime: new Date(),
            userId: userId || guestId || undefined,
          },
        },
      });

      return NextResponse.json({ task: updatedTask, message: 'Timer started' });
    }

    if (body.action === 'stop') {
      const { note } = stopTimerSchema.parse(body);

      if (!task.activeTimer) {
        return NextResponse.json({ error: 'No active timer' }, { status: 400 });
      }

      const startTime = new Date(task.activeTimer.startTime);
      const endTime = new Date();
      const duration = Math.round((endTime.getTime() - startTime.getTime()) / 60000); // minutes

      const newTimeLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        startTime,
        endTime,
        duration,
        note: note || undefined,
        userId: userId || guestId || undefined,
      };

      const currentTimeLogs = task.timeLogs || [];
      const totalActualTime = currentTimeLogs.reduce((sum, log) => sum + (log.duration || 0), 0) + duration;

      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: {
          timeLogs: [...currentTimeLogs, newTimeLog],
          actualTime: totalActualTime,
          activeTimer: null,
        },
      });

      return NextResponse.json({ task: updatedTask, message: 'Timer stopped', duration });
    }

    if (body.action === 'log') {
      const { startTime, endTime, note } = addTimeLogSchema.parse(body);

      const start = new Date(startTime);
      const end = new Date(endTime);
      const duration = Math.round((end.getTime() - start.getTime()) / 60000);

      if (duration <= 0) {
        return NextResponse.json({ error: 'Invalid time range' }, { status: 400 });
      }

      const newTimeLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        startTime: start,
        endTime: end,
        duration,
        note: note || undefined,
        userId: userId || guestId || undefined,
      };

      const currentTimeLogs = task.timeLogs || [];
      const totalActualTime = currentTimeLogs.reduce((sum, log) => sum + (log.duration || 0), 0) + duration;

      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: {
          timeLogs: [...currentTimeLogs, newTimeLog],
          actualTime: totalActualTime,
        },
      });

      return NextResponse.json({ task: updatedTask, message: 'Time log added' });
    }

    if (body.action === 'set_estimate') {
      const { estimatedTime } = setEstimateSchema.parse(body);

      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: {
          estimatedTime,
        },
      });

      return NextResponse.json({ task: updatedTask, message: 'Estimate updated' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error managing time tracking:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to manage time tracking' },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id]/time?logId=xxx - Delete a time log
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await context.params;
    const { searchParams } = new URL(request.url);
    const logId = searchParams.get('logId');

    if (!logId) {
      return NextResponse.json({ error: 'logId is required' }, { status: 400 });
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

    const currentTimeLogs = task.timeLogs || [];
    const logToDelete = currentTimeLogs.find(log => log.id === logId);

    if (!logToDelete) {
      return NextResponse.json({ error: 'Time log not found' }, { status: 404 });
    }

    const updatedTimeLogs = currentTimeLogs.filter(log => log.id !== logId);
    const totalActualTime = updatedTimeLogs.reduce((sum, log) => sum + (log.duration || 0), 0);

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        timeLogs: updatedTimeLogs,
        actualTime: totalActualTime,
      },
    });

    return NextResponse.json({ task: updatedTask, message: 'Time log deleted' });
  } catch (error) {
    console.error('Error deleting time log:', error);
    return NextResponse.json(
      { error: 'Failed to delete time log' },
      { status: 500 }
    );
  }
}
