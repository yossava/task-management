import { Task } from '@/lib/types';
import { StorageService, STORAGE_KEYS } from '@/lib/storage';
import { ColumnService } from './columnService';

export class TaskService {
  static getAll(): Task[] {
    return StorageService.get<Task[]>(STORAGE_KEYS.TASKS, []);
  }

  static getById(id: string): Task | undefined {
    return this.getAll().find(t => t.id === id);
  }

  static getByColumnId(columnId: string): Task[] {
    return this.getAll().filter(t => t.columnId === columnId);
  }

  static getByBoardId(boardId: string): Task[] {
    return this.getAll().filter(t => t.boardId === boardId);
  }

  static create(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'tags' | 'assigneeIds'>): Task {
    const tasks = this.getAll();
    const newTask: Task = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      comments: [],
      tags: [],
      assigneeIds: [],
    };
    tasks.push(newTask);
    StorageService.set(STORAGE_KEYS.TASKS, tasks);

    // Update column's taskIds
    ColumnService.addTaskToColumn(data.columnId, newTask.id);
    return newTask;
  }

  static update(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Task | null {
    const tasks = this.getAll();
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) return null;

    tasks[index] = {
      ...tasks[index],
      ...updates,
      id: tasks[index].id, // Preserve ID
      createdAt: tasks[index].createdAt, // Preserve creation date
      updatedAt: Date.now(),
    };
    StorageService.set(STORAGE_KEYS.TASKS, tasks);
    return tasks[index];
  }

  static delete(id: string): boolean {
    const task = this.getById(id);
    if (!task) return false;

    const tasks = this.getAll();
    const filtered = tasks.filter(t => t.id !== id);
    StorageService.set(STORAGE_KEYS.TASKS, filtered);

    // Remove from column's taskIds
    ColumnService.removeTaskFromColumn(task.columnId, id);
    return true;
  }

  static deleteByColumnId(columnId: string): void {
    const tasks = this.getAll();
    const filtered = tasks.filter(t => t.columnId !== columnId);
    StorageService.set(STORAGE_KEYS.TASKS, filtered);
  }

  static deleteByBoardId(boardId: string): void {
    const tasks = this.getAll();
    const filtered = tasks.filter(t => t.boardId !== boardId);
    StorageService.set(STORAGE_KEYS.TASKS, filtered);
  }

  static moveTask(taskId: string, newColumnId: string, newIndex?: number): Task | null {
    const task = this.getById(taskId);
    if (!task) return null;

    const oldColumnId = task.columnId;

    // Remove from old column
    if (oldColumnId !== newColumnId) {
      ColumnService.removeTaskFromColumn(oldColumnId, taskId);
    } else {
      // If moving within same column, remove first
      ColumnService.removeTaskFromColumn(oldColumnId, taskId);
    }

    // Update task
    const updatedTask = this.update(taskId, { columnId: newColumnId });

    // Add to new column at position
    ColumnService.addTaskToColumn(newColumnId, taskId, newIndex);

    return updatedTask;
  }
}
