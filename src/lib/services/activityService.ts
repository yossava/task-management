import { ActivityLog, ActivityType } from '@/lib/types';
import { StorageService, STORAGE_KEYS } from '@/lib/storage';

const MAX_ACTIVITY_LOGS = 1000; // Keep last 1000 activities

export class ActivityService {
  static getAll(): ActivityLog[] {
    return StorageService.get<ActivityLog[]>(STORAGE_KEYS.ACTIVITY, []);
  }

  static getByBoard(boardId: string): ActivityLog[] {
    return this.getAll().filter(log => log.boardId === boardId);
  }

  static getRecent(limit: number = 50): ActivityLog[] {
    return this.getAll()
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  static log(
    type: ActivityType,
    boardId: string,
    boardTitle: string,
    options?: {
      taskId?: string;
      taskText?: string;
      tagId?: string;
      tagName?: string;
      changes?: { field: string; oldValue: any; newValue: any }[];
    }
  ): ActivityLog {
    const activities = this.getAll();

    const newLog: ActivityLog = {
      id: crypto.randomUUID(),
      type,
      boardId,
      boardTitle,
      timestamp: Date.now(),
      ...options,
    };

    // Add new log and trim to max size
    activities.unshift(newLog);
    const trimmed = activities.slice(0, MAX_ACTIVITY_LOGS);

    StorageService.set(STORAGE_KEYS.ACTIVITY, trimmed);
    return newLog;
  }

  static clear(): void {
    StorageService.set(STORAGE_KEYS.ACTIVITY, []);
  }

  static clearBoard(boardId: string): void {
    const activities = this.getAll().filter(log => log.boardId !== boardId);
    StorageService.set(STORAGE_KEYS.ACTIVITY, activities);
  }

  static getStats() {
    const activities = this.getAll();
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    return {
      total: activities.length,
      today: activities.filter(a => now - a.timestamp < dayMs).length,
      thisWeek: activities.filter(a => now - a.timestamp < 7 * dayMs).length,
      byType: activities.reduce((acc, activity) => {
        acc[activity.type] = (acc[activity.type] || 0) + 1;
        return acc;
      }, {} as Record<ActivityType, number>),
    };
  }
}
