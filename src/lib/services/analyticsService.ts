import { Board, BoardTask, Priority } from '@/lib/types';

export interface TaskStats {
  total: number;
  completed: number;
  inProgress: number;
  overdue: number;
  dueSoon: number;
  noDueDate: number;
  completionRate: number;
}

export interface PriorityStats {
  urgent: number;
  high: number;
  medium: number;
  low: number;
  none: number;
}

export interface TimeSeriesDataPoint {
  date: string;
  completed: number;
  created: number;
}

export interface BoardStats {
  id: string;
  title: string;
  taskCount: number;
  completedCount: number;
  completionRate: number;
  color?: string;
}

export interface ProductivityStreak {
  currentStreak: number;
  longestStreak: number;
  lastCompletionDate: number | null;
}

export interface UpcomingDeadline {
  taskId: string;
  taskText: string;
  dueDate: number;
  priority?: Priority;
  boardId: string;
  boardTitle: string;
  boardColor?: string;
  daysUntilDue: number;
}

export interface TagStats {
  tagId: string;
  tagName: string;
  color: string;
  taskCount: number;
  completedCount: number;
}

export interface AnalyticsSummary {
  taskStats: TaskStats;
  priorityStats: PriorityStats;
  boardStats: BoardStats[];
  upcomingDeadlines: UpcomingDeadline[];
  productivityStreak: ProductivityStreak;
  timeSeriesData: TimeSeriesDataPoint[];
  tagStats: TagStats[];
}

export class AnalyticsService {
  /**
   * Get comprehensive analytics summary from all boards
   */
  static getAnalyticsSummary(boards: Board[], daysBack: number = 30): AnalyticsSummary {
    const allTasks = this.getAllTasks(boards);

    return {
      taskStats: this.getTaskStats(allTasks),
      priorityStats: this.getPriorityStats(allTasks),
      boardStats: this.getBoardStats(boards),
      upcomingDeadlines: this.getUpcomingDeadlines(boards, 14), // Next 14 days
      productivityStreak: this.getProductivityStreak(allTasks),
      timeSeriesData: this.getTimeSeriesData(allTasks, daysBack),
      tagStats: this.getTagStats(boards),
    };
  }

  /**
   * Get all tasks from all boards
   */
  private static getAllTasks(boards: Board[]): Array<BoardTask & { boardId: string; boardTitle: string; boardColor?: string }> {
    const tasks: Array<BoardTask & { boardId: string; boardTitle: string; boardColor?: string }> = [];

    boards.forEach(board => {
      board.tasks?.forEach(task => {
        tasks.push({
          ...task,
          boardId: board.id,
          boardTitle: board.title,
          boardColor: board.color,
        });
      });
    });

    return tasks;
  }

  /**
   * Calculate task statistics
   */
  static getTaskStats(tasks: BoardTask[]): TaskStats {
    const now = Date.now();
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const inProgress = tasks.filter(t => !t.completed && (t.progress ?? 0) > 0).length;

    const overdue = tasks.filter(t => {
      return !t.completed && t.dueDate && t.dueDate < now;
    }).length;

    const dueSoon = tasks.filter(t => {
      if (t.completed || !t.dueDate) return false;
      const daysUntilDue = (t.dueDate - now) / (1000 * 60 * 60 * 24);
      return daysUntilDue > 0 && daysUntilDue <= 7;
    }).length;

    const noDueDate = tasks.filter(t => !t.completed && !t.dueDate).length;

    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    return {
      total,
      completed,
      inProgress,
      overdue,
      dueSoon,
      noDueDate,
      completionRate,
    };
  }

  /**
   * Calculate priority distribution
   */
  static getPriorityStats(tasks: BoardTask[]): PriorityStats {
    const incompleteTasks = tasks.filter(t => !t.completed);

    return {
      urgent: incompleteTasks.filter(t => t.priority === 'urgent').length,
      high: incompleteTasks.filter(t => t.priority === 'high').length,
      medium: incompleteTasks.filter(t => t.priority === 'medium').length,
      low: incompleteTasks.filter(t => t.priority === 'low').length,
      none: incompleteTasks.filter(t => !t.priority).length,
    };
  }

  /**
   * Calculate stats per board
   */
  static getBoardStats(boards: Board[]): BoardStats[] {
    return boards.map(board => {
      const tasks = board.tasks || [];
      const completed = tasks.filter(t => t.completed).length;
      const total = tasks.length;

      return {
        id: board.id,
        title: board.title,
        taskCount: total,
        completedCount: completed,
        completionRate: total > 0 ? (completed / total) * 100 : 0,
        color: board.color,
      };
    }).sort((a, b) => b.taskCount - a.taskCount);
  }

  /**
   * Get upcoming deadlines within specified days
   */
  static getUpcomingDeadlines(boards: Board[], daysAhead: number = 14): UpcomingDeadline[] {
    const now = Date.now();
    const cutoffDate = now + (daysAhead * 24 * 60 * 60 * 1000);
    const deadlines: UpcomingDeadline[] = [];

    boards.forEach(board => {
      board.tasks?.forEach(task => {
        if (!task.completed && task.dueDate && task.dueDate >= now && task.dueDate <= cutoffDate) {
          const daysUntilDue = (task.dueDate - now) / (1000 * 60 * 60 * 24);

          deadlines.push({
            taskId: task.id,
            taskText: task.text,
            dueDate: task.dueDate,
            priority: task.priority,
            boardId: board.id,
            boardTitle: board.title,
            boardColor: board.color,
            daysUntilDue: Math.ceil(daysUntilDue),
          });
        }
      });
    });

    return deadlines.sort((a, b) => a.dueDate - b.dueDate);
  }

  /**
   * Calculate productivity streak
   */
  static getProductivityStreak(tasks: BoardTask[]): ProductivityStreak {
    const completedTasks = tasks
      .filter(t => t.completed)
      .sort((a, b) => b.createdAt - a.createdAt);

    if (completedTasks.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastCompletionDate: null,
      };
    }

    // Get unique completion dates
    const completionDates = Array.from(
      new Set(
        completedTasks.map(t => {
          const date = new Date(t.createdAt);
          return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
        })
      )
    ).sort((a, b) => b - a);

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const yesterdayDate = todayDate - (24 * 60 * 60 * 1000);

    // Calculate current streak
    if (completionDates[0] === todayDate || completionDates[0] === yesterdayDate) {
      currentStreak = 1;

      for (let i = 1; i < completionDates.length; i++) {
        const expectedDate = completionDates[i - 1] - (24 * 60 * 60 * 1000);
        if (completionDates[i] === expectedDate) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    for (let i = 1; i < completionDates.length; i++) {
      const expectedDate = completionDates[i - 1] - (24 * 60 * 60 * 1000);
      if (completionDates[i] === expectedDate) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }

    longestStreak = Math.max(longestStreak, currentStreak, 1);

    return {
      currentStreak,
      longestStreak,
      lastCompletionDate: completedTasks[0]?.createdAt || null,
    };
  }

  /**
   * Get time series data for task completion and creation
   */
  static getTimeSeriesData(tasks: BoardTask[], daysBack: number = 30): TimeSeriesDataPoint[] {
    const now = Date.now();
    const startDate = now - (daysBack * 24 * 60 * 60 * 1000);

    // Initialize data points for each day
    const dataPoints = new Map<string, TimeSeriesDataPoint>();

    for (let i = 0; i < daysBack; i++) {
      const date = new Date(startDate + (i * 24 * 60 * 60 * 1000));
      const dateKey = date.toISOString().split('T')[0];
      dataPoints.set(dateKey, {
        date: dateKey,
        completed: 0,
        created: 0,
      });
    }

    // Count completed tasks per day (assuming completion date = creation date for completed tasks)
    tasks.forEach(task => {
      const createdDate = new Date(task.createdAt);
      const createdDateKey = createdDate.toISOString().split('T')[0];

      if (task.createdAt >= startDate) {
        const dataPoint = dataPoints.get(createdDateKey);
        if (dataPoint) {
          dataPoint.created++;
          if (task.completed) {
            dataPoint.completed++;
          }
        }
      }
    });

    return Array.from(dataPoints.values()).sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Get tag usage statistics
   */
  static getTagStats(boards: Board[]): TagStats[] {
    const tagStatsMap = new Map<string, TagStats>();

    boards.forEach(board => {
      // Build tag lookup
      const tagLookup = new Map<string, { name: string; color: string }>();
      board.tags?.forEach(tag => {
        tagLookup.set(tag.id, { name: tag.name, color: tag.color });
      });

      // Count tag usage
      board.tasks?.forEach(task => {
        task.tags?.forEach(tagId => {
          const tagInfo = tagLookup.get(tagId);
          if (tagInfo) {
            if (!tagStatsMap.has(tagId)) {
              tagStatsMap.set(tagId, {
                tagId,
                tagName: tagInfo.name,
                color: tagInfo.color,
                taskCount: 0,
                completedCount: 0,
              });
            }

            const stats = tagStatsMap.get(tagId)!;
            stats.taskCount++;
            if (task.completed) {
              stats.completedCount++;
            }
          }
        });
      });
    });

    return Array.from(tagStatsMap.values()).sort((a, b) => b.taskCount - a.taskCount);
  }

  /**
   * Get average task completion time (in days)
   */
  static getAverageCompletionTime(tasks: BoardTask[]): number {
    const completedTasks = tasks.filter(t => t.completed && t.dueDate);

    if (completedTasks.length === 0) return 0;

    const totalTime = completedTasks.reduce((sum, task) => {
      if (!task.dueDate) return sum;
      const completionTime = Math.abs(task.createdAt - task.dueDate) / (1000 * 60 * 60 * 24);
      return sum + completionTime;
    }, 0);

    return totalTime / completedTasks.length;
  }
}
