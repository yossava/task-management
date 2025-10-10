import { TaskComment, Board } from '@/lib/types';
import { StorageService, STORAGE_KEYS } from '@/lib/storage';
import { ActivityService } from './activityService';

export class CommentService {
  /**
   * Get all comments for a specific task
   */
  static getTaskComments(boardId: string, taskId: string): TaskComment[] {
    const boards = StorageService.get<Board[]>(STORAGE_KEYS.BOARDS, []);
    const board = boards.find(b => b.id === boardId);
    if (!board) return [];

    const task = board.tasks?.find(t => t.id === taskId);
    return task?.comments || [];
  }

  /**
   * Add a comment to a task
   */
  static addComment(
    boardId: string,
    taskId: string,
    content: string,
    author: string = 'User'
  ): TaskComment | null {
    const boards = StorageService.get<Board[]>(STORAGE_KEYS.BOARDS, []);
    const boardIndex = boards.findIndex(b => b.id === boardId);

    if (boardIndex === -1) return null;

    const board = boards[boardIndex];
    const taskIndex = board.tasks?.findIndex(t => t.id === taskId) ?? -1;

    if (taskIndex === -1) return null;

    const task = board.tasks![taskIndex];

    const newComment: TaskComment = {
      id: crypto.randomUUID(),
      taskId,
      boardId,
      content,
      author,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Initialize comments array if it doesn't exist
    if (!task.comments) {
      task.comments = [];
    }

    task.comments.push(newComment);
    board.updatedAt = Date.now();

    StorageService.set(STORAGE_KEYS.BOARDS, boards);

    // Log activity
    ActivityService.log('task_updated', boardId, board.title, {
      taskId,
      taskText: task.text,
      changes: [
        {
          field: 'comment_added',
          oldValue: null,
          newValue: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
        },
      ],
    });

    return newComment;
  }

  /**
   * Update a comment
   */
  static updateComment(
    boardId: string,
    taskId: string,
    commentId: string,
    content: string
  ): boolean {
    const boards = StorageService.get<Board[]>(STORAGE_KEYS.BOARDS, []);
    const boardIndex = boards.findIndex(b => b.id === boardId);

    if (boardIndex === -1) return false;

    const board = boards[boardIndex];
    const task = board.tasks?.find(t => t.id === taskId);

    if (!task || !task.comments) return false;

    const commentIndex = task.comments.findIndex(c => c.id === commentId);
    if (commentIndex === -1) return false;

    task.comments[commentIndex].content = content;
    task.comments[commentIndex].updatedAt = Date.now();
    board.updatedAt = Date.now();

    StorageService.set(STORAGE_KEYS.BOARDS, boards);

    // Log activity
    ActivityService.log('task_updated', boardId, board.title, {
      taskId,
      taskText: task.text,
      changes: [
        {
          field: 'comment_updated',
          oldValue: null,
          newValue: commentId,
        },
      ],
    });

    return true;
  }

  /**
   * Delete a comment
   */
  static deleteComment(
    boardId: string,
    taskId: string,
    commentId: string
  ): boolean {
    const boards = StorageService.get<Board[]>(STORAGE_KEYS.BOARDS, []);
    const boardIndex = boards.findIndex(b => b.id === boardId);

    if (boardIndex === -1) return false;

    const board = boards[boardIndex];
    const task = board.tasks?.find(t => t.id === taskId);

    if (!task || !task.comments) return false;

    const initialLength = task.comments.length;
    task.comments = task.comments.filter(c => c.id !== commentId);

    if (task.comments.length === initialLength) return false;

    board.updatedAt = Date.now();
    StorageService.set(STORAGE_KEYS.BOARDS, boards);

    // Log activity
    ActivityService.log('task_updated', boardId, board.title, {
      taskId,
      taskText: task.text,
      changes: [
        {
          field: 'comment_deleted',
          oldValue: commentId,
          newValue: null,
        },
      ],
    });

    return true;
  }

  /**
   * Get comment count for a task
   */
  static getCommentCount(boardId: string, taskId: string): number {
    return this.getTaskComments(boardId, taskId).length;
  }

  /**
   * Get all comments across all boards (for activity feed)
   */
  static getAllComments(limit?: number): (TaskComment & { boardTitle: string; taskText: string })[] {
    const boards = StorageService.get<Board[]>(STORAGE_KEYS.BOARDS, []);
    const allComments: (TaskComment & { boardTitle: string; taskText: string })[] = [];

    boards.forEach(board => {
      board.tasks?.forEach(task => {
        task.comments?.forEach(comment => {
          allComments.push({
            ...comment,
            boardTitle: board.title,
            taskText: task.text,
          });
        });
      });
    });

    // Sort by creation date, newest first
    allComments.sort((a, b) => b.createdAt - a.createdAt);

    return limit ? allComments.slice(0, limit) : allComments;
  }
}
