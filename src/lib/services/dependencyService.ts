import { TaskDependency, Board } from '@/lib/types';
import { ActivityService } from './activityService';

export class DependencyService {
  /**
   * Add a dependency between two tasks
   */
  static async addDependency(
    board: Board,
    taskId: string,
    dependsOnTaskId: string,
    updateBoard: (boardId: string, updates: Partial<Board>) => Promise<void>
  ): Promise<TaskDependency | null> {
    const task = board.tasks?.find(t => t.id === taskId);
    const dependsOnTask = board.tasks?.find(t => t.id === dependsOnTaskId);

    if (!task || !dependsOnTask) return null;

    // Prevent circular dependencies
    if (this.wouldCreateCircularDependency(board, taskId, dependsOnTaskId)) {
      console.warn('Cannot create circular dependency');
      return null;
    }

    // Check if dependency already exists
    if (task.dependencies?.includes(dependsOnTaskId)) {
      return null; // Already exists
    }

    const newDependency: TaskDependency = {
      id: crypto.randomUUID(),
      taskId,
      dependsOnTaskId,
      boardId: board.id,
      type: 'blocked_by',
      createdAt: Date.now(),
    };

    // Initialize dependencies array if needed
    if (!task.dependencies) {
      task.dependencies = [];
    }

    task.dependencies.push(dependsOnTaskId);

    const updatedTasks = board.tasks.map(t => t.id === taskId ? task : t);
    await updateBoard(board.id, { tasks: updatedTasks });

    // Log activity
    ActivityService.log('task_updated', board.id, board.title, {
      taskId,
      taskText: task.text,
      changes: [
        {
          field: 'dependency_added',
          oldValue: null,
          newValue: dependsOnTask.text,
        },
      ],
    });

    return newDependency;
  }

  /**
   * Remove a dependency
   */
  static async removeDependency(
    board: Board,
    taskId: string,
    dependsOnTaskId: string,
    updateBoard: (boardId: string, updates: Partial<Board>) => Promise<void>
  ): Promise<boolean> {
    const task = board.tasks?.find(t => t.id === taskId);

    if (!task || !task.dependencies) return false;

    const initialLength = task.dependencies.length;
    task.dependencies = task.dependencies.filter(id => id !== dependsOnTaskId);

    if (task.dependencies.length === initialLength) return false;

    const updatedTasks = board.tasks.map(t => t.id === taskId ? task : t);
    await updateBoard(board.id, { tasks: updatedTasks });

    // Log activity
    ActivityService.log('task_updated', board.id, board.title, {
      taskId,
      taskText: task.text,
      changes: [
        {
          field: 'dependency_removed',
          oldValue: dependsOnTaskId,
          newValue: null,
        },
      ],
    });

    return true;
  }

  /**
   * Get all dependencies for a task (tasks that this task depends on)
   */
  static getTaskDependencies(board: Board, taskId: string): Board['tasks'] {
    const task = board.tasks?.find(t => t.id === taskId);
    if (!task || !task.dependencies) return [];

    return board.tasks.filter(t => task.dependencies?.includes(t.id)) || [];
  }

  /**
   * Get all tasks that depend on this task (blockers)
   */
  static getBlockingTasks(board: Board, taskId: string): Board['tasks'] {
    return board.tasks.filter(t => t.dependencies?.includes(taskId)) || [];
  }

  /**
   * Check if a task can be started (all dependencies are completed)
   */
  static canStartTask(board: Board, taskId: string): boolean {
    const dependencies = this.getTaskDependencies(board, taskId);
    return dependencies.every(dep => dep.completed);
  }

  /**
   * Check if removing/creating a dependency would create a circular dependency
   */
  static wouldCreateCircularDependency(
    board: Board,
    taskId: string,
    dependsOnTaskId: string
  ): boolean {
    // Check if dependsOnTaskId (directly or indirectly) depends on taskId
    const visited = new Set<string>();
    const queue: string[] = [dependsOnTaskId];

    while (queue.length > 0) {
      const currentId = queue.shift()!;

      if (currentId === taskId) {
        return true; // Circular dependency detected
      }

      if (visited.has(currentId)) continue;
      visited.add(currentId);

      const deps = this.getTaskDependencies(board, currentId);
      deps.forEach(dep => queue.push(dep.id));
    }

    return false;
  }

  /**
   * Get dependency chain for visualization
   */
  static getDependencyChain(board: Board, taskId: string): {
    task: Board['tasks'][0];
    dependencies: Board['tasks'];
    blockers: Board['tasks'];
  } | null {
    const task = board.tasks?.find(t => t.id === taskId);
    if (!task) return null;

    return {
      task,
      dependencies: this.getTaskDependencies(board, taskId),
      blockers: this.getBlockingTasks(board, taskId),
    };
  }

  /**
   * Get all blocked tasks across all boards
   */
  static getAllBlockedTasks(boards: Board[]): Array<{
    boardId: string;
    boardTitle: string;
    task: Board['tasks'][0];
    blockedBy: Board['tasks'];
  }> {
    const blockedTasks: Array<{
      boardId: string;
      boardTitle: string;
      task: Board['tasks'][0];
      blockedBy: Board['tasks'];
    }> = [];

    boards.forEach(board => {
      board.tasks?.forEach(task => {
        if (task.dependencies && task.dependencies.length > 0 && !task.completed) {
          const blockedBy = board.tasks.filter(
            t => task.dependencies?.includes(t.id) && !t.completed
          );

          if (blockedBy.length > 0) {
            blockedTasks.push({
              boardId: board.id,
              boardTitle: board.title,
              task,
              blockedBy,
            });
          }
        }
      });
    });

    return blockedTasks;
  }
}
