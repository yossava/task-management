import { TaskComment, Board } from '@/lib/types';
import { ActivityService } from './activityService';

export class CommentService {
  /**
   * Get all comments for a specific task
   */
  static getTaskComments(board: Board, taskId: string): TaskComment[] {
    const task = board.tasks?.find(t => t.id === taskId);
    return task?.comments || [];
  }

  /**
   * Add a comment to a task
   */
  static async addComment(
    board: Board,
    taskId: string,
    content: string,
    author: string = 'User',
    updateBoard: (boardId: string, updates: Partial<Board>) => Promise<void>
  ): Promise<TaskComment | null> {
    const task = board.tasks?.find(t => t.id === taskId);
    if (!task) return null;

    const newComment: TaskComment = {
      id: crypto.randomUUID(),
      taskId,
      boardId: board.id,
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

    const updatedTasks = board.tasks.map(t => t.id === taskId ? task : t);
    await updateBoard(board.id, { tasks: updatedTasks });

    // Log activity
    ActivityService.log('task_updated', board.id, board.title, {
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
  static async updateComment(
    board: Board,
    taskId: string,
    commentId: string,
    content: string,
    updateBoard: (boardId: string, updates: Partial<Board>) => Promise<void>
  ): Promise<boolean> {
    const task = board.tasks?.find(t => t.id === taskId);
    if (!task || !task.comments) return false;

    const commentIndex = task.comments.findIndex(c => c.id === commentId);
    if (commentIndex === -1) return false;

    task.comments[commentIndex].content = content;
    task.comments[commentIndex].updatedAt = Date.now();

    const updatedTasks = board.tasks.map(t => t.id === taskId ? task : t);
    await updateBoard(board.id, { tasks: updatedTasks });

    // Log activity
    ActivityService.log('task_updated', board.id, board.title, {
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
  static async deleteComment(
    board: Board,
    taskId: string,
    commentId: string,
    updateBoard: (boardId: string, updates: Partial<Board>) => Promise<void>
  ): Promise<boolean> {
    const task = board.tasks?.find(t => t.id === taskId);
    if (!task || !task.comments) return false;

    const initialLength = task.comments.length;
    task.comments = task.comments.filter(c => c.id !== commentId);

    if (task.comments.length === initialLength) return false;

    const updatedTasks = board.tasks.map(t => t.id === taskId ? task : t);
    await updateBoard(board.id, { tasks: updatedTasks });

    // Log activity
    ActivityService.log('task_updated', board.id, board.title, {
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
  static getCommentCount(board: Board, taskId: string): number {
    return this.getTaskComments(board, taskId).length;
  }

  /**
   * Get all comments across all boards (for activity feed)
   */
  static getAllComments(boards: Board[], limit?: number): (TaskComment & { boardTitle: string; taskText: string })[] {
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
