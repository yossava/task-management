import { RecurringTask, RecurringPattern, Board, BoardTask } from '@/lib/types';
import { StorageService, STORAGE_KEYS } from '@/lib/storage';
import { ActivityService } from './activityService';

const RECURRING_TASKS_KEY = 'pm_app_recurring_tasks';

export class RecurringTaskService {
  /**
   * Get all recurring tasks
   */
  static getAll(): RecurringTask[] {
    return StorageService.get<RecurringTask[]>(RECURRING_TASKS_KEY, []);
  }

  /**
   * Get recurring tasks for a specific board
   */
  static getByBoard(boardId: string): RecurringTask[] {
    return this.getAll().filter(rt => rt.boardId === boardId);
  }

  /**
   * Create a recurring task
   */
  static create(
    boardId: string,
    templateTask: Omit<BoardTask, 'id' | 'createdAt'>,
    pattern: RecurringPattern
  ): RecurringTask | null {
    const boards = StorageService.get<Board[]>(STORAGE_KEYS.BOARDS, []);
    const board = boards.find(b => b.id === boardId);

    if (!board) return null;

    // Create the template task
    const templateTaskId = crypto.randomUUID();
    const now = Date.now();

    const recurringTask: RecurringTask = {
      id: crypto.randomUUID(),
      boardId,
      templateTaskId,
      pattern,
      nextDueDate: this.calculateNextDueDate(now, pattern),
      isActive: true,
      createdAt: now,
    };

    const recurringTasks = this.getAll();
    recurringTasks.push(recurringTask);
    StorageService.set(RECURRING_TASKS_KEY, recurringTasks);

    // Generate the first instance immediately
    this.generateTaskInstance(recurringTask, templateTask);

    // Log activity
    ActivityService.log('task_created', boardId, board.title, {
      taskText: `Recurring: ${templateTask.text}`,
    });

    return recurringTask;
  }

  /**
   * Update a recurring task pattern
   */
  static update(
    recurringTaskId: string,
    updates: Partial<Omit<RecurringTask, 'id' | 'createdAt'>>
  ): boolean {
    const recurringTasks = this.getAll();
    const index = recurringTasks.findIndex(rt => rt.id === recurringTaskId);

    if (index === -1) return false;

    recurringTasks[index] = {
      ...recurringTasks[index],
      ...updates,
    };

    StorageService.set(RECURRING_TASKS_KEY, recurringTasks);
    return true;
  }

  /**
   * Delete a recurring task
   */
  static delete(recurringTaskId: string): boolean {
    const recurringTasks = this.getAll();
    const filtered = recurringTasks.filter(rt => rt.id !== recurringTaskId);

    if (filtered.length === recurringTasks.length) return false;

    StorageService.set(RECURRING_TASKS_KEY, filtered);
    return true;
  }

  /**
   * Toggle active status
   */
  static toggleActive(recurringTaskId: string): boolean {
    const recurringTasks = this.getAll();
    const recurringTask = recurringTasks.find(rt => rt.id === recurringTaskId);

    if (!recurringTask) return false;

    recurringTask.isActive = !recurringTask.isActive;
    StorageService.set(RECURRING_TASKS_KEY, recurringTasks);
    return true;
  }

  /**
   * Generate due tasks (should be called periodically)
   */
  static generateDueTasks(): number {
    const recurringTasks = this.getAll().filter(rt => rt.isActive);
    const now = Date.now();
    let generatedCount = 0;

    recurringTasks.forEach(recurringTask => {
      if (recurringTask.nextDueDate <= now) {
        // Get the template task
        const boards = StorageService.get<Board[]>(STORAGE_KEYS.BOARDS, []);
        const board = boards.find(b => b.id === recurringTask.boardId);

        if (board) {
          // Find a task with the same recurring ID to use as template
          const templateTask = board.tasks?.find(t => t.recurringTaskId === recurringTask.id);

          if (templateTask) {
            // Generate new instance
            const generated = this.generateTaskInstance(recurringTask, templateTask);

            if (generated) {
              generatedCount++;

              // Update next due date
              recurringTask.lastGenerated = now;
              recurringTask.nextDueDate = this.calculateNextDueDate(
                recurringTask.nextDueDate,
                recurringTask.pattern
              );
            }
          }
        }
      }
    });

    if (generatedCount > 0) {
      StorageService.set(RECURRING_TASKS_KEY, recurringTasks);
    }

    return generatedCount;
  }

  /**
   * Generate a task instance from a recurring task
   */
  private static generateTaskInstance(
    recurringTask: RecurringTask,
    templateTask: Partial<BoardTask>
  ): BoardTask | null {
    const boards = StorageService.get<Board[]>(STORAGE_KEYS.BOARDS, []);
    const boardIndex = boards.findIndex(b => b.id === recurringTask.boardId);

    if (boardIndex === -1) return null;

    const board = boards[boardIndex];
    const now = Date.now();

    const newTask: BoardTask = {
      id: crypto.randomUUID(),
      text: templateTask.text || '',
      completed: false,
      createdAt: now,
      dueDate: recurringTask.nextDueDate,
      color: templateTask.color,
      showGradient: templateTask.showGradient,
      description: templateTask.description,
      progress: 0,
      priority: templateTask.priority,
      tags: templateTask.tags || [],
      recurringTaskId: recurringTask.id,
      subtasks: templateTask.subtasks?.map(item => ({
        ...item,
        id: crypto.randomUUID(),
        completed: false,
      })),
    };

    if (!board.tasks) {
      board.tasks = [];
    }

    board.tasks.push(newTask);
    board.updatedAt = now;

    StorageService.set(STORAGE_KEYS.BOARDS, boards);

    // Log activity
    ActivityService.log('task_created', board.id, board.title, {
      taskId: newTask.id,
      taskText: newTask.text,
    });

    return newTask;
  }

  /**
   * Calculate next due date based on pattern
   */
  static calculateNextDueDate(fromDate: number, pattern: RecurringPattern): number {
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
          const sortedDays = [...pattern.daysOfWeek].sort((a, b) => a - b);

          // Find next day
          const nextDay = sortedDays.find(d => d > currentDay);

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
          date.setDate(Math.min(pattern.dayOfMonth, this.getDaysInMonth(date)));
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
    if (pattern.endDate && date.getTime() > pattern.endDate) {
      return pattern.endDate;
    }

    return date.getTime();
  }

  /**
   * Get days in month
   */
  private static getDaysInMonth(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }

  /**
   * Get human-readable pattern description
   */
  static getPatternDescription(pattern: RecurringPattern): string {
    const { frequency, interval, daysOfWeek, dayOfMonth } = pattern;

    switch (frequency) {
      case 'daily':
        return interval === 1 ? 'Daily' : `Every ${interval} days`;

      case 'weekly':
        if (daysOfWeek && daysOfWeek.length > 0) {
          const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const days = daysOfWeek.map(d => dayNames[d]).join(', ');
          return interval === 1
            ? `Weekly on ${days}`
            : `Every ${interval} weeks on ${days}`;
        }
        return interval === 1 ? 'Weekly' : `Every ${interval} weeks`;

      case 'monthly':
        if (dayOfMonth) {
          return interval === 1
            ? `Monthly on day ${dayOfMonth}`
            : `Every ${interval} months on day ${dayOfMonth}`;
        }
        return interval === 1 ? 'Monthly' : `Every ${interval} months`;

      case 'yearly':
        return interval === 1 ? 'Yearly' : `Every ${interval} years`;

      case 'custom':
        return `Every ${interval} days`;

      default:
        return 'Custom';
    }
  }
}
