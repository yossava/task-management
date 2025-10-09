import { Column } from '@/lib/types';
import { StorageService, STORAGE_KEYS } from '@/lib/storage';

export class ColumnService {
  static getAll(): Column[] {
    return StorageService.get<Column[]>(STORAGE_KEYS.COLUMNS, []);
  }

  static getByBoardId(boardId: string): Column[] {
    return this.getAll()
      .filter(c => c.boardId === boardId)
      .sort((a, b) => a.order - b.order);
  }

  static create(data: Omit<Column, 'id' | 'taskIds'>): Column {
    const columns = this.getAll();
    const newColumn: Column = {
      ...data,
      id: crypto.randomUUID(),
      taskIds: [],
    };
    columns.push(newColumn);
    StorageService.set(STORAGE_KEYS.COLUMNS, columns);
    return newColumn;
  }

  static update(id: string, updates: Partial<Omit<Column, 'id'>>): Column | null {
    const columns = this.getAll();
    const index = columns.findIndex(c => c.id === id);
    if (index === -1) return null;

    columns[index] = {
      ...columns[index],
      ...updates,
      id: columns[index].id, // Preserve ID
    };
    StorageService.set(STORAGE_KEYS.COLUMNS, columns);
    return columns[index];
  }

  static delete(id: string): boolean {
    const columns = this.getAll();
    const filtered = columns.filter(c => c.id !== id);
    if (filtered.length === columns.length) return false;

    StorageService.set(STORAGE_KEYS.COLUMNS, filtered);
    return true;
  }

  static deleteByBoardId(boardId: string): void {
    const columns = this.getAll();
    const filtered = columns.filter(c => c.boardId !== boardId);
    StorageService.set(STORAGE_KEYS.COLUMNS, filtered);
  }

  static reorder(boardId: string, columnIds: string[]): void {
    const columns = this.getAll();
    columnIds.forEach((colId, index) => {
      const col = columns.find(c => c.id === colId && c.boardId === boardId);
      if (col) col.order = index;
    });
    StorageService.set(STORAGE_KEYS.COLUMNS, columns);
  }

  static addTaskToColumn(columnId: string, taskId: string, index?: number): boolean {
    const columns = this.getAll();
    const column = columns.find(c => c.id === columnId);
    if (!column) return false;

    // Remove taskId if it already exists
    column.taskIds = column.taskIds.filter(id => id !== taskId);

    // Add at specified index or end
    if (index !== undefined && index >= 0 && index <= column.taskIds.length) {
      column.taskIds.splice(index, 0, taskId);
    } else {
      column.taskIds.push(taskId);
    }

    StorageService.set(STORAGE_KEYS.COLUMNS, columns);
    return true;
  }

  static removeTaskFromColumn(columnId: string, taskId: string): boolean {
    const columns = this.getAll();
    const column = columns.find(c => c.id === columnId);
    if (!column) return false;

    column.taskIds = column.taskIds.filter(id => id !== taskId);
    StorageService.set(STORAGE_KEYS.COLUMNS, columns);
    return true;
  }
}
