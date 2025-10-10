import { BoardTask, TimeLog, ActiveTimer } from '@/lib/types';
import { BoardService } from './boardService';
import { StorageService } from '@/lib/storage';
import { ActivityService } from './activityService';

const ACTIVE_TIMERS_KEY = 'active_timers';

export class TimeTrackingService {
  /**
   * Start a timer for a task
   */
  static startTimer(boardId: string, taskId: string, userId?: string): ActiveTimer | null {
    const board = BoardService.getById(boardId);
    if (!board) return null;

    const task = board.tasks.find((t) => t.id === taskId);
    if (!task) return null;

    // Stop any existing timer for this task
    this.stopTimer(boardId, taskId);

    const timer: ActiveTimer = {
      taskId,
      boardId,
      startTime: Date.now(),
      userId,
    };

    // Save to storage
    const timers = this.getActiveTimers();
    timers.push(timer);
    StorageService.set(ACTIVE_TIMERS_KEY, timers);

    // Update task with active timer
    const updatedTasks = board.tasks.map((t) =>
      t.id === taskId ? { ...t, activeTimer: timer } : t
    );

    BoardService.update(boardId, { tasks: updatedTasks });

    ActivityService.log(
      'task_updated',
      boardId,
      board.title,
      {
        taskId,
        taskText: task.text,
        changes: [{ field: 'timer', oldValue: null, newValue: 'started' }],
      }
    );

    return timer;
  }

  /**
   * Stop a timer and create a time log
   */
  static stopTimer(boardId: string, taskId: string, note?: string): TimeLog | null {
    const board = BoardService.getById(boardId);
    if (!board) return null;

    const task = board.tasks.find((t) => t.id === taskId);
    if (!task || !task.activeTimer) return null;

    const endTime = Date.now();
    const duration = Math.round((endTime - task.activeTimer.startTime) / 1000 / 60); // Convert to minutes

    const timeLog: TimeLog = {
      id: `log-${Date.now()}`,
      taskId,
      boardId,
      startTime: task.activeTimer.startTime,
      endTime,
      duration,
      note,
      userId: task.activeTimer.userId,
    };

    // Update task
    const updatedTask = {
      ...task,
      activeTimer: undefined,
      timeLogs: [...(task.timeLogs || []), timeLog],
      actualTime: (task.actualTime || 0) + duration,
    };

    const updatedTasks = board.tasks.map((t) => (t.id === taskId ? updatedTask : t));

    BoardService.update(boardId, { tasks: updatedTasks });

    // Remove from active timers
    const timers = this.getActiveTimers().filter(
      (t) => !(t.taskId === taskId && t.boardId === boardId)
    );
    StorageService.set(ACTIVE_TIMERS_KEY, timers);

    ActivityService.log(
      'task_updated',
      boardId,
      board.title,
      {
        taskId,
        taskText: task.text,
        changes: [{ field: 'timer', oldValue: 'running', newValue: `stopped (${duration}m)` }],
      }
    );

    return timeLog;
  }

  /**
   * Get active timers
   */
  static getActiveTimers(): ActiveTimer[] {
    return StorageService.get<ActiveTimer[]>(ACTIVE_TIMERS_KEY, []);
  }

  /**
   * Get active timer for a task
   */
  static getActiveTimer(boardId: string, taskId: string): ActiveTimer | null {
    const board = BoardService.getById(boardId);
    if (!board) return null;

    const task = board.tasks.find((t) => t.id === taskId);
    return task?.activeTimer || null;
  }

  /**
   * Get elapsed time for active timer (in minutes)
   */
  static getElapsedTime(timer: ActiveTimer): number {
    return Math.round((Date.now() - timer.startTime) / 1000 / 60);
  }

  /**
   * Set estimated time for a task
   */
  static setEstimatedTime(boardId: string, taskId: string, minutes: number): boolean {
    const board = BoardService.getById(boardId);
    if (!board) return false;

    const updatedTasks = board.tasks.map((t) =>
      t.id === taskId ? { ...t, estimatedTime: minutes } : t
    );

    BoardService.update(boardId, { tasks: updatedTasks });
    return true;
  }

  /**
   * Get time logs for a task
   */
  static getTimeLogs(boardId: string, taskId: string): TimeLog[] {
    const board = BoardService.getById(boardId);
    if (!board) return [];

    const task = board.tasks.find((t) => t.id === taskId);
    return task?.timeLogs || [];
  }

  /**
   * Delete a time log
   */
  static deleteTimeLog(boardId: string, taskId: string, logId: string): boolean {
    const board = BoardService.getById(boardId);
    if (!board) return false;

    const task = board.tasks.find((t) => t.id === taskId);
    if (!task || !task.timeLogs) return false;

    const logToDelete = task.timeLogs.find((l) => l.id === logId);
    if (!logToDelete) return false;

    const updatedTimeLogs = task.timeLogs.filter((l) => l.id !== logId);
    const updatedActualTime = (task.actualTime || 0) - logToDelete.duration;

    const updatedTasks = board.tasks.map((t) =>
      t.id === taskId
        ? { ...t, timeLogs: updatedTimeLogs, actualTime: Math.max(0, updatedActualTime) }
        : t
    );

    BoardService.update(boardId, { tasks: updatedTasks });
    return true;
  }

  /**
   * Get total tracked time for a board (in minutes)
   */
  static getTotalTimeForBoard(boardId: string): number {
    const board = BoardService.getById(boardId);
    if (!board) return 0;

    return board.tasks.reduce((total, task) => total + (task.actualTime || 0), 0);
  }

  /**
   * Get time tracking statistics
   */
  static getStatistics(boardId: string) {
    const board = BoardService.getById(boardId);
    if (!board) {
      return {
        totalEstimated: 0,
        totalActual: 0,
        totalRemaining: 0,
        tasksWithTime: 0,
        completionRate: 0,
      };
    }

    const tasksWithTime = board.tasks.filter((t) => t.estimatedTime || t.actualTime);
    const totalEstimated = board.tasks.reduce((sum, t) => sum + (t.estimatedTime || 0), 0);
    const totalActual = board.tasks.reduce((sum, t) => sum + (t.actualTime || 0), 0);
    const totalRemaining = Math.max(0, totalEstimated - totalActual);
    const completionRate =
      totalEstimated > 0 ? Math.min(100, (totalActual / totalEstimated) * 100) : 0;

    return {
      totalEstimated,
      totalActual,
      totalRemaining,
      tasksWithTime: tasksWithTime.length,
      completionRate: Math.round(completionRate),
    };
  }

  /**
   * Format duration in minutes to human-readable string
   */
  static formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}m`;
    }

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (mins === 0) {
      return `${hours}h`;
    }

    return `${hours}h ${mins}m`;
  }
}
