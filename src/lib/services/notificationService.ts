import { Notification, NotificationType, Board, BoardTask } from '@/lib/types';
import { StorageService, STORAGE_KEYS } from '@/lib/storage';

const MAX_NOTIFICATIONS = 100;

export class NotificationService {
  static getAll(): Notification[] {
    return StorageService.get<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
  }

  static getUnread(): Notification[] {
    return this.getAll().filter(n => !n.read);
  }

  static getRecent(limit: number = 20): Notification[] {
    return this.getAll()
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  static create(
    type: NotificationType,
    title: string,
    message: string,
    options?: {
      boardId?: string;
      taskId?: string;
      actionUrl?: string;
    }
  ): Notification {
    const notifications = this.getAll();

    const newNotification: Notification = {
      id: crypto.randomUUID(),
      type,
      title,
      message,
      read: false,
      timestamp: Date.now(),
      ...options,
    };

    notifications.unshift(newNotification);
    const trimmed = notifications.slice(0, MAX_NOTIFICATIONS);

    StorageService.set(STORAGE_KEYS.NOTIFICATIONS, trimmed);
    return newNotification;
  }

  static markAsRead(id: string): boolean {
    const notifications = this.getAll();
    const notification = notifications.find(n => n.id === id);

    if (!notification) return false;

    notification.read = true;
    StorageService.set(STORAGE_KEYS.NOTIFICATIONS, notifications);
    return true;
  }

  static markAllAsRead(): void {
    const notifications = this.getAll().map(n => ({ ...n, read: true }));
    StorageService.set(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }

  static delete(id: string): boolean {
    const notifications = this.getAll();
    const filtered = notifications.filter(n => n.id !== id);

    if (filtered.length === notifications.length) return false;

    StorageService.set(STORAGE_KEYS.NOTIFICATIONS, filtered);
    return true;
  }

  static clear(): void {
    StorageService.set(STORAGE_KEYS.NOTIFICATIONS, []);
  }

  /**
   * Check for due date notifications
   */
  static checkDueDates(boards: Board[]): Notification[] {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const newNotifications: Notification[] = [];

    boards.forEach(board => {
      board.tasks?.forEach(task => {
        if (!task.dueDate || task.completed) return;

        const timeUntilDue = task.dueDate - now;

        // Overdue
        if (timeUntilDue < 0) {
          const daysOverdue = Math.floor(Math.abs(timeUntilDue) / oneDayMs);
          const notification = this.create(
            'overdue',
            '⚠️ Task Overdue',
            `"${task.text}" in ${board.title} is ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} overdue`,
            {
              boardId: board.id,
              taskId: task.id,
              actionUrl: `/boards`,
            }
          );
          newNotifications.push(notification);
        }
        // Due soon (within 24 hours)
        else if (timeUntilDue < oneDayMs && timeUntilDue > 0) {
          const hoursUntilDue = Math.floor(timeUntilDue / (60 * 60 * 1000));
          const notification = this.create(
            'due_soon',
            '🔔 Task Due Soon',
            `"${task.text}" in ${board.title} is due in ${hoursUntilDue} hour${hoursUntilDue !== 1 ? 's' : ''}`,
            {
              boardId: board.id,
              taskId: task.id,
              actionUrl: `/boards`,
            }
          );
          newNotifications.push(notification);
        }
      });
    });

    return newNotifications;
  }

  /**
   * Notify task completion
   */
  static notifyTaskCompleted(boardTitle: string, taskText: string, boardId: string, taskId: string): Notification {
    return this.create(
      'task_completed',
      '✅ Task Completed',
      `"${taskText}" in ${boardTitle} has been completed!`,
      {
        boardId,
        taskId,
        actionUrl: `/boards`,
      }
    );
  }

  /**
   * Notify board created
   */
  static notifyBoardCreated(boardTitle: string, boardId: string): Notification {
    return this.create(
      'board_created',
      '📋 Board Created',
      `New board "${boardTitle}" has been created`,
      {
        boardId,
        actionUrl: `/boards`,
      }
    );
  }

  /**
   * Get notification stats
   */
  static getStats() {
    const notifications = this.getAll();
    const unread = notifications.filter(n => !n.read);

    return {
      total: notifications.length,
      unread: unread.length,
      byType: notifications.reduce((acc, notification) => {
        acc[notification.type] = (acc[notification.type] || 0) + 1;
        return acc;
      }, {} as Record<NotificationType, number>),
    };
  }
}
