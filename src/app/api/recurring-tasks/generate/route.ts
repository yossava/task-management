import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getGuestId } from '@/lib/utils/guest';

// Helper function to calculate next due date based on pattern
function calculateNextDueDate(fromDate: Date, pattern: any): Date {
  const date = new Date(fromDate);

  switch (pattern.frequency) {
    case 'daily':
      date.setDate(date.getDate() + pattern.interval);
      break;

    case 'weekly':
      if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
        // Find next occurrence of specified days
        let daysToAdd = 1;
        const currentDay = date.getDay();

        // Sort days of week
        const sortedDays = [...pattern.daysOfWeek].sort((a: number, b: number) => a - b);

        // Find next day
        const nextDay = sortedDays.find((d: number) => d > currentDay);

        if (nextDay !== undefined) {
          daysToAdd = nextDay - currentDay;
        } else {
          // Wrap to next week
          daysToAdd = 7 - currentDay + sortedDays[0];
        }

        date.setDate(date.getDate() + daysToAdd);
      } else {
        date.setDate(date.getDate() + 7 * pattern.interval);
      }
      break;

    case 'monthly':
      if (pattern.dayOfMonth) {
        date.setMonth(date.getMonth() + pattern.interval);
        const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
        date.setDate(Math.min(pattern.dayOfMonth, daysInMonth));
      } else {
        date.setMonth(date.getMonth() + pattern.interval);
      }
      break;

    case 'yearly':
      date.setFullYear(date.getFullYear() + pattern.interval);
      break;

    case 'custom':
      // Custom patterns use days
      date.setDate(date.getDate() + pattern.interval);
      break;
  }

  // Check if past end date
  if (pattern.endDate && date.getTime() > new Date(pattern.endDate).getTime()) {
    return new Date(pattern.endDate);
  }

  return date;
}

// POST /api/recurring-tasks/generate - Generate due recurring tasks
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

    const now = new Date();

    // Find all active recurring tasks that are due
    const dueRecurringTasks = await prisma.recurringTask.findMany({
      where: {
        isActive: true,
        nextDueDate: {
          lte: now,
        },
        ...(session?.user?.id ? { userId: session.user.id } : { guestId }),
      },
      include: {
        task: true,
        board: true,
      },
    });

    let generatedCount = 0;
    const generatedTasks = [];

    for (const recurringTask of dueRecurringTasks) {
      try {
        // Create a new task instance based on the template task
        const newTask = await prisma.task.create({
          data: {
            text: recurringTask.task.text,
            completed: false,
            boardId: recurringTask.boardId,
            order: 0,
            description: recurringTask.task.description,
            color: recurringTask.task.color,
            showGradient: recurringTask.task.showGradient,
            dueDate: recurringTask.nextDueDate,
            progress: 0,
            priority: recurringTask.task.priority,
            subtasks: recurringTask.task.subtasks || [],
            dependencies: [],
            comments: [],
            timeLogs: [],
          },
        });

        generatedTasks.push(newTask);
        generatedCount++;

        // Calculate next due date
        const nextDueDate = calculateNextDueDate(
          recurringTask.nextDueDate,
          recurringTask.pattern
        );

        // Update the recurring task with new next due date
        await prisma.recurringTask.update({
          where: { id: recurringTask.id },
          data: {
            nextDueDate,
            lastGenerated: now,
          },
        });
      } catch (error) {
        console.error(`Error generating task for recurring task ${recurringTask.id}:`, error);
        // Continue with other recurring tasks even if one fails
      }
    }

    return NextResponse.json({
      generatedCount,
      generatedTasks,
    });
  } catch (error) {
    console.error('Error generating recurring tasks:', error);
    return NextResponse.json(
      { error: 'Failed to generate recurring tasks' },
      { status: 500 }
    );
  }
}
