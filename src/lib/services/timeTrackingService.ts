import { TimeLog, ActiveTimer, Board } from '@/lib/types';
import { StorageService } from '@/lib/storage';
import { ActivityService } from './activityService';

const ACTIVE_TIMERS_KEY = 'active_timers';

export class TimeTrackingService {
  /**
   * Start a timer for a task
   */
  static async startTimer(
    board: Board,
    taskId: string,
    userId: string | undefined,
    updateBoard: (boardId: string, updates: Partial<Board>) => Promise<void>
  ): Promise<ActiveTimer | null> {
    const task = board.tasks.find((t) => t.id === taskId);
    if (!task) return null;

    const timer: ActiveTimer = {
      taskId,
      boardId: board.id,
      startTime: Date.now(),
      userId,
    };

    // Save to storage
    const timers = this.getActiveTimers();
    // Remove any existing timer for this task
    const filteredTimers = timers.filter(
      (t) => !(t.taskId === taskId && t.boardId === board.id)
    );
    filteredTimers.push(timer);
    StorageService.set(ACTIVE_TIMERS_KEY, filteredTimers);

    // Update task with active timer
    const updatedTasks = board.tasks.map((t) =>
      t.id === taskId ? { ...t, activeTimer: timer } : t
    );

    await updateBoard(board.id, { tasks: updatedTasks });

    ActivityService.log(
      'task_updated',
      board.id,
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
  static async stopTimer(
    board: Board,
    taskId: string,
    updateBoard: (boardId: string, updates: Partial<Board>) => Promise<void>,
    note?: string
  ): Promise<TimeLog | null> {
    const task = board.tasks.find((t) => t.id === taskId);
    if (!task || !task.activeTimer) return null;

    const endTime = Date.now();
    const duration = Math.round((endTime - task.activeTimer.startTime) / 1000 / 60); // Convert to minutes

    const timeLog: TimeLog = {
      id: `log-${Date.now()}`,
      taskId,
      boardId: board.id,
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

    await updateBoard(board.id, { tasks: updatedTasks });

    // Remove from active timers
    const timers = this.getActiveTimers().filter(
      (t) => !(t.taskId === taskId && t.boardId === board.id)
    );
    StorageService.set(ACTIVE_TIMERS_KEY, timers);

    ActivityService.log(
      'task_updated',
      board.id,
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
  static getActiveTimer(board: Board, taskId: string): ActiveTimer | null {
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
  static async setEstimatedTime(
    board: Board,
    taskId: string,
    minutes: number,
    updateBoard: (boardId: string, updates: Partial<Board>) => Promise<void>
  ): Promise<boolean> {
    const updatedTasks = board.tasks.map((t) =>
      t.id === taskId ? { ...t, estimatedTime: minutes } : t
    );

    await updateBoard(board.id, { tasks: updatedTasks });
    return true;
  }

  /**
   * Get time logs for a task
   */
  static getTimeLogs(board: Board, taskId: string): TimeLog[] {
    const task = board.tasks.find((t) => t.id === taskId);
    return task?.timeLogs || [];
  }

  /**
   * Delete a time log
   */
  static async deleteTimeLog(
    board: Board,
    taskId: string,
    logId: string,
    updateBoard: (boardId: string, updates: Partial<Board>) => Promise<void>
  ): Promise<boolean> {
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

    await updateBoard(board.id, { tasks: updatedTasks });
    return true;
  }

  /**
   * Get total tracked time for a board (in minutes)
   */
  static getTotalTimeForBoard(board: Board): number {
    return board.tasks.reduce((total, task) => total + (task.actualTime || 0), 0);
  }

  /**
   * Get time tracking statistics
   */
  static getStatistics(board: Board) {
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
