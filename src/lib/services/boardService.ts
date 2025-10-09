import { Board, BoardTask } from '@/lib/types';
import { StorageService, STORAGE_KEYS } from '@/lib/storage';

export class BoardService {
  static getAll(): Board[] {
    return StorageService.get<Board[]>(STORAGE_KEYS.BOARDS, []);
  }

  static getById(id: string): Board | undefined {
    const boards = this.getAll();
    return boards.find(b => b.id === id);
  }

  static create(data: Omit<Board, 'id' | 'createdAt' | 'updatedAt' | 'columns' | 'tasks'>): Board {
    const boards = this.getAll();
    const newBoard: Board = {
      ...data,
      id: crypto.randomUUID(),
      columns: [],
      tasks: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    boards.push(newBoard);
    StorageService.set(STORAGE_KEYS.BOARDS, boards);
    return newBoard;
  }

  static update(id: string, updates: Partial<Omit<Board, 'id' | 'createdAt'>>): Board | null {
    const boards = this.getAll();
    const index = boards.findIndex(b => b.id === id);
    if (index === -1) return null;

    boards[index] = {
      ...boards[index],
      ...updates,
      id: boards[index].id, // Preserve ID
      createdAt: boards[index].createdAt, // Preserve creation date
      updatedAt: Date.now(),
    };
    StorageService.set(STORAGE_KEYS.BOARDS, boards);
    return boards[index];
  }

  static delete(id: string): boolean {
    const boards = this.getAll();
    const filtered = boards.filter(b => b.id !== id);
    if (filtered.length === boards.length) return false;

    StorageService.set(STORAGE_KEYS.BOARDS, filtered);
    return true;
  }

  static reorder(boardIds: string[]): void {
    const boards = this.getAll();
    const boardMap = new Map(boards.map(b => [b.id, b]));

    const reorderedBoards = boardIds
      .map(id => boardMap.get(id))
      .filter((b): b is Board => b !== undefined);

    StorageService.set(STORAGE_KEYS.BOARDS, reorderedBoards);
  }

  static addTask(boardId: string, text: string): BoardTask | null {
    const board = this.getById(boardId);
    if (!board) return null;

    const newTask: BoardTask = {
      id: crypto.randomUUID(),
      text: text.trim(),
      completed: false,
      createdAt: Date.now(),
    };

    board.tasks = [...(board.tasks || []), newTask];
    this.update(boardId, { tasks: board.tasks });
    return newTask;
  }

  static updateTask(boardId: string, taskId: string, updates: Partial<Omit<BoardTask, 'id' | 'createdAt'>>): BoardTask | null {
    const board = this.getById(boardId);
    if (!board) return null;

    const taskIndex = board.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return null;

    board.tasks[taskIndex] = {
      ...board.tasks[taskIndex],
      ...updates,
    };

    this.update(boardId, { tasks: board.tasks });
    return board.tasks[taskIndex];
  }

  static deleteTask(boardId: string, taskId: string): boolean {
    const board = this.getById(boardId);
    if (!board) return false;

    board.tasks = board.tasks.filter(t => t.id !== taskId);
    this.update(boardId, { tasks: board.tasks });
    return true;
  }
}
