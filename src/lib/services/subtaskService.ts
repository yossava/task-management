import { BoardTask, Board } from '@/lib/types';
import { ActivityService } from './activityService';

export class SubtaskService {
  /**
   * Add a subtask to a parent task
   */
  static async addSubtask(
    board: Board,
    parentTaskId: string,
    subtaskData: Omit<BoardTask, 'id' | 'createdAt' | 'parentTaskId' | 'isSubtask'>,
    updateBoard: (boardId: string, updates: Partial<Board>) => Promise<void>
  ): Promise<BoardTask | null> {
    const parentTask = board.tasks.find((t) => t.id === parentTaskId);
    if (!parentTask) return null;

    const newSubtask: BoardTask = {
      ...subtaskData,
      id: `subtask-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      parentTaskId,
      isSubtask: true,
      completed: false,
    };

    // Add subtask to parent's subtasks array
    const updatedParent = {
      ...parentTask,
      subtasks: [...(parentTask.subtasks || []), newSubtask],
    };

    // Update board with modified parent task
    const updatedTasks = board.tasks.map((t) => (t.id === parentTaskId ? updatedParent : t));

    await updateBoard(board.id, { tasks: updatedTasks });

    ActivityService.log(
      'task_created',
      board.id,
      board.title,
      {
        taskId: newSubtask.id,
        taskText: newSubtask.text,
      }
    );

    return newSubtask;
  }

  /**
   * Update a subtask
   */
  static async updateSubtask(
    board: Board,
    parentTaskId: string,
    subtaskId: string,
    updates: Partial<BoardTask>,
    updateBoard: (boardId: string, updates: Partial<Board>) => Promise<void>
  ): Promise<boolean> {
    const parentTask = board.tasks.find((t) => t.id === parentTaskId);
    if (!parentTask || !parentTask.subtasks) return false;

    const updatedSubtasks = parentTask.subtasks.map((subtask) =>
      subtask.id === subtaskId ? { ...subtask, ...updates } : subtask
    );

    const updatedParent = {
      ...parentTask,
      subtasks: updatedSubtasks,
    };

    // Recalculate parent progress based on subtasks
    const progress = this.calculateProgressFromSubtasks(updatedParent);
    updatedParent.progress = progress;

    const updatedTasks = board.tasks.map((t) => (t.id === parentTaskId ? updatedParent : t));

    await updateBoard(board.id, { tasks: updatedTasks });

    ActivityService.log(
      'task_updated',
      board.id,
      board.title,
      {
        taskId: subtaskId,
        taskText: updatedSubtasks.find((s) => s.id === subtaskId)?.text,
      }
    );

    return true;
  }

  /**
   * Delete a subtask
   */
  static async deleteSubtask(
    board: Board,
    parentTaskId: string,
    subtaskId: string,
    updateBoard: (boardId: string, updates: Partial<Board>) => Promise<void>
  ): Promise<boolean> {
    const parentTask = board.tasks.find((t) => t.id === parentTaskId);
    if (!parentTask || !parentTask.subtasks) return false;

    const updatedSubtasks = parentTask.subtasks.filter((subtask) => subtask.id !== subtaskId);

    const updatedParent = {
      ...parentTask,
      subtasks: updatedSubtasks,
    };

    // Recalculate parent progress
    const progress = this.calculateProgressFromSubtasks(updatedParent);
    updatedParent.progress = progress;

    const updatedTasks = board.tasks.map((t) => (t.id === parentTaskId ? updatedParent : t));

    await updateBoard(board.id, { tasks: updatedTasks });

    ActivityService.log(
      'task_deleted',
      board.id,
      board.title,
      {
        taskId: subtaskId,
      }
    );

    return true;
  }

  /**
   * Promote a subtask to a standalone task
   */
  static async promoteToTask(
    board: Board,
    parentTaskId: string,
    subtaskId: string,
    updateBoard: (boardId: string, updates: Partial<Board>) => Promise<void>
  ): Promise<BoardTask | null> {
    const parentTask = board.tasks.find((t) => t.id === parentTaskId);
    if (!parentTask || !parentTask.subtasks) return null;

    const subtask = parentTask.subtasks.find((s) => s.id === subtaskId);
    if (!subtask) return null;

    // Remove from parent's subtasks
    const updatedSubtasks = parentTask.subtasks.filter((s) => s.id !== subtaskId);
    const updatedParent = {
      ...parentTask,
      subtasks: updatedSubtasks,
    };

    // Recalculate parent progress
    const progress = this.calculateProgressFromSubtasks(updatedParent);
    updatedParent.progress = progress;

    // Create new standalone task
    const newTask: BoardTask = {
      ...subtask,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      parentTaskId: undefined,
      isSubtask: false,
      createdAt: Date.now(),
    };

    // Update board
    const updatedTasks = board.tasks.map((t) => (t.id === parentTaskId ? updatedParent : t));
    updatedTasks.push(newTask);

    await updateBoard(board.id, { tasks: updatedTasks });

    ActivityService.log(
      'task_created',
      board.id,
      board.title,
      {
        taskId: newTask.id,
        taskText: newTask.text,
      }
    );

    return newTask;
  }

  /**
   * Calculate progress based on subtask completion
   */
  static calculateProgressFromSubtasks(task: BoardTask): number {
    if (!task.subtasks || task.subtasks.length === 0) {
      return task.progress || 0;
    }

    const completedCount = task.subtasks.filter((s) => s.completed).length;
    return Math.round((completedCount / task.subtasks.length) * 100);
  }

  /**
   * Get all subtasks for a task
   */
  static getSubtasks(board: Board, taskId: string): BoardTask[] {
    const task = board.tasks.find((t) => t.id === taskId);
    return task?.subtasks || [];
  }

  /**
   * Get subtask by ID
   */
  static getSubtask(board: Board, parentTaskId: string, subtaskId: string): BoardTask | null {
    const parentTask = board.tasks.find((t) => t.id === parentTaskId);
    if (!parentTask || !parentTask.subtasks) return null;

    return parentTask.subtasks.find((s) => s.id === subtaskId) || null;
  }

  /**
   * Count total subtasks across all tasks in a board
   */
  static countSubtasks(board: Board): number {
    return board.tasks.reduce((count, task) => {
      return count + (task.subtasks?.length || 0);
    }, 0);
  }

  /**
   * Get tasks with subtasks
   */
  static getTasksWithSubtasks(board: Board): BoardTask[] {
    return board.tasks.filter((task) => task.subtasks && task.subtasks.length > 0);
  }
}
