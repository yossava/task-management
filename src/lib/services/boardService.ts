import { Board, BoardTask, Tag } from '@/lib/types';
import { StorageService, STORAGE_KEYS } from '@/lib/storage';
import { ActivityService } from './activityService';

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

    // Log activity
    ActivityService.log('board_created', newBoard.id, newBoard.title);

    return newBoard;
  }

  static update(id: string, updates: Partial<Omit<Board, 'id' | 'createdAt'>>): Board | null {
    const boards = this.getAll();
    const index = boards.findIndex(b => b.id === id);
    if (index === -1) return null;

    const oldBoard = boards[index];
    boards[index] = {
      ...boards[index],
      ...updates,
      id: boards[index].id, // Preserve ID
      createdAt: boards[index].createdAt, // Preserve creation date
      updatedAt: Date.now(),
    };
    StorageService.set(STORAGE_KEYS.BOARDS, boards);

    // Log activity if title or description changed
    const changes: { field: string; oldValue: any; newValue: any }[] = [];
    if (updates.title && updates.title !== oldBoard.title) {
      changes.push({ field: 'title', oldValue: oldBoard.title, newValue: updates.title });
    }
    if (updates.description !== undefined && updates.description !== oldBoard.description) {
      changes.push({ field: 'description', oldValue: oldBoard.description, newValue: updates.description });
    }
    if (changes.length > 0) {
      ActivityService.log('board_updated', boards[index].id, boards[index].title, { changes });
    }

    return boards[index];
  }

  static delete(id: string): boolean {
    const boards = this.getAll();
    const board = boards.find(b => b.id === id);
    const filtered = boards.filter(b => b.id !== id);
    if (filtered.length === boards.length) return false;

    StorageService.set(STORAGE_KEYS.BOARDS, filtered);

    // Log activity
    if (board) {
      ActivityService.log('board_deleted', id, board.title);
      ActivityService.clearBoard(id); // Clean up board's activity logs
    }

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

    // Log activity
    ActivityService.log('task_created', boardId, board.title, {
      taskId: newTask.id,
      taskText: newTask.text,
    });

    return newTask;
  }

  static updateTask(boardId: string, taskId: string, updates: Partial<Omit<BoardTask, 'id' | 'createdAt'>>): BoardTask | null {
    const board = this.getById(boardId);
    if (!board) return null;

    const taskIndex = board.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return null;

    const oldTask = board.tasks[taskIndex];
    board.tasks[taskIndex] = {
      ...board.tasks[taskIndex],
      ...updates,
    };

    this.update(boardId, { tasks: board.tasks });

    // Log activity
    if (updates.completed !== undefined && updates.completed !== oldTask.completed && updates.completed) {
      ActivityService.log('task_completed', boardId, board.title, {
        taskId,
        taskText: board.tasks[taskIndex].text,
      });
    } else {
      const changes: { field: string; oldValue: any; newValue: any }[] = [];
      if (updates.text && updates.text !== oldTask.text) {
        changes.push({ field: 'text', oldValue: oldTask.text, newValue: updates.text });
      }
      if (updates.priority && updates.priority !== oldTask.priority) {
        changes.push({ field: 'priority', oldValue: oldTask.priority, newValue: updates.priority });
      }
      if (changes.length > 0) {
        ActivityService.log('task_updated', boardId, board.title, {
          taskId,
          taskText: board.tasks[taskIndex].text,
          changes,
        });
      }
    }

    return board.tasks[taskIndex];
  }

  static deleteTask(boardId: string, taskId: string): boolean {
    const board = this.getById(boardId);
    if (!board) return false;

    const task = board.tasks.find(t => t.id === taskId);
    board.tasks = board.tasks.filter(t => t.id !== taskId);
    this.update(boardId, { tasks: board.tasks });

    // Log activity
    if (task) {
      ActivityService.log('task_deleted', boardId, board.title, {
        taskId,
        taskText: task.text,
      });
    }

    return true;
  }

  // Tag Management
  static createTag(boardId: string, name: string, color: string): Tag | null {
    const board = this.getById(boardId);
    if (!board) return null;

    const newTag: Tag = {
      id: crypto.randomUUID(),
      name,
      color,
      createdAt: Date.now(),
    };

    board.tags = [...(board.tags || []), newTag];
    this.update(boardId, { tags: board.tags });
    return newTag;
  }

  static updateTag(boardId: string, tagId: string, name: string, color: string): Tag | null {
    const board = this.getById(boardId);
    if (!board) return null;

    const tagIndex = board.tags?.findIndex(t => t.id === tagId);
    if (tagIndex === undefined || tagIndex === -1) return null;

    board.tags![tagIndex] = {
      ...board.tags![tagIndex],
      name,
      color,
    };

    this.update(boardId, { tags: board.tags });
    return board.tags![tagIndex];
  }

  static deleteTag(boardId: string, tagId: string): boolean {
    const board = this.getById(boardId);
    if (!board) return false;

    // Remove tag from board
    board.tags = (board.tags || []).filter(t => t.id !== tagId);

    // Remove tag from all tasks
    board.tasks = board.tasks.map(task => ({
      ...task,
      tags: (task.tags || []).filter(tid => tid !== tagId),
    }));

    this.update(boardId, { tags: board.tags, tasks: board.tasks });
    return true;
  }
}
