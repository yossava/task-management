import { Board } from '@/lib/types';
import { StorageService, STORAGE_KEYS } from '@/lib/storage';

export class BoardService {
  static getAll(): Board[] {
    return StorageService.get<Board[]>(STORAGE_KEYS.BOARDS, []);
  }

  static getById(id: string): Board | undefined {
    const boards = this.getAll();
    return boards.find(b => b.id === id);
  }

  static create(data: Omit<Board, 'id' | 'createdAt' | 'updatedAt' | 'columns'>): Board {
    const boards = this.getAll();
    const newBoard: Board = {
      ...data,
      id: crypto.randomUUID(),
      columns: [],
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
}
