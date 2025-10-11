import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { tasksApi, ApiError } from '@/lib/api/client';
import { BoardTask, Priority } from '@/lib/types';

export function useTasksOptimized(boardId: string) {
  const queryClient = useQueryClient();

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await tasksApi.create(boardId, { text });
      return response.task;
    },
    onMutate: async (text: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['boards'] });

      // Snapshot previous value
      const previousBoards = queryClient.getQueryData<any[]>(['boards']);

      // Create optimistic task
      const optimisticTask: BoardTask = {
        id: `temp-${Date.now()}`,
        text,
        completed: false,
        boardId,
        order: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Optimistically update
      queryClient.setQueryData<any[]>(['boards'], (old = []) =>
        old.map((board) =>
          board.id === boardId
            ? { ...board, tasks: [...(board.tasks || []), optimisticTask] }
            : board
        )
      );

      toast.loading('Adding task...', { id: `create-task-${boardId}` });

      return { previousBoards, optimisticTask };
    },
    onSuccess: (newTask, _, context) => {
      // Don't update the cache again - just dismiss the loading toast
      toast.success('Task added!', { id: `create-task-${boardId}` });

      // Update only the ID in the background without triggering re-render
      setTimeout(() => {
        queryClient.setQueryData<any[]>(['boards'], (old = []) =>
          old.map((board) =>
            board.id === boardId
              ? {
                  ...board,
                  tasks: (board.tasks || []).map((task: BoardTask) =>
                    task.id === context?.optimisticTask.id
                      ? { ...task, id: newTask.id }
                      : task
                  ),
                }
              : board
          )
        );
      }, 0);
    },
    onError: (err, _, context) => {
      // Rollback on error
      if (context?.previousBoards) {
        queryClient.setQueryData(['boards'], context.previousBoards);
      }
      const error = err as ApiError;
      if (error.status === 403) {
        toast.error(error.message || 'Guest users can only create 20 tasks per board. Please register!', { id: `create-task-${boardId}` });
      } else {
        toast.error(`Failed to add task: ${error.message}`, { id: `create-task-${boardId}` });
      }
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: Partial<BoardTask> }) => {
      // Convert dueDate from number to ISO string if present
      const apiUpdates: any = { ...updates };
      if ('dueDate' in updates) {
        apiUpdates.dueDate = updates.dueDate ? new Date(updates.dueDate).toISOString() : null;
      }
      const response = await tasksApi.update(taskId, apiUpdates);
      return response.task;
    },
    onMutate: async ({ taskId, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['boards'] });

      // Snapshot previous value
      const previousBoards = queryClient.getQueryData<any[]>(['boards']);

      // Optimistically update task
      queryClient.setQueryData<any[]>(['boards'], (old = []) =>
        old.map((board) =>
          board.id === boardId
            ? {
                ...board,
                tasks: (board.tasks || []).map((task: BoardTask) =>
                  task.id === taskId ? { ...task, ...updates } : task
                ),
              }
            : board
        )
      );

      return { previousBoards };
    },
    onSuccess: (updatedTask, { taskId }) => {
      // Replace optimistic update with server response
      queryClient.setQueryData<any[]>(['boards'], (old = []) =>
        old.map((board) =>
          board.id === boardId
            ? {
                ...board,
                tasks: (board.tasks || []).map((task: BoardTask) =>
                  task.id === taskId ? updatedTask : task
                ),
              }
            : board
        )
      );
    },
    onError: (err, _, context) => {
      // Rollback on error
      if (context?.previousBoards) {
        queryClient.setQueryData(['boards'], context.previousBoards);
      }
      const error = err as ApiError;
      toast.error(`Failed to update task: ${error.message}`);
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      await tasksApi.delete(taskId);
      return taskId;
    },
    onMutate: async (taskId: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['boards'] });

      // Snapshot previous value
      const previousBoards = queryClient.getQueryData<any[]>(['boards']);

      // Optimistically remove task
      queryClient.setQueryData<any[]>(['boards'], (old = []) =>
        old.map((board) =>
          board.id === boardId
            ? {
                ...board,
                tasks: (board.tasks || []).filter((task: BoardTask) => task.id !== taskId),
              }
            : board
        )
      );

      toast.loading('Deleting task...', { id: `delete-task-${boardId}` });

      return { previousBoards };
    },
    onSuccess: () => {
      toast.success('Task deleted!', { id: `delete-task-${boardId}` });
    },
    onError: (err, _, context) => {
      // Rollback on error
      if (context?.previousBoards) {
        queryClient.setQueryData(['boards'], context.previousBoards);
      }
      const error = err as ApiError;
      toast.error(`Failed to delete task: ${error.message}`, { id: `delete-task-${boardId}` });
    },
  });

  // Reorder tasks mutation
  const reorderTasksMutation = useMutation({
    mutationFn: async (tasks: BoardTask[]) => {
      await tasksApi.reorder(
        tasks.map((task, index) => ({ id: task.id, order: index, boardId }))
      );
      return tasks;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['boards'] });
    },
    onError: () => {
      toast.error('Failed to reorder tasks');
      queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
  });

  // Toggle task completion
  const toggleTask = (task: BoardTask) => {
    updateTaskMutation.mutate({ taskId: task.id, updates: { completed: !task.completed } });
  };

  // Update task text
  const updateTaskText = (taskId: string, text: string) => {
    updateTaskMutation.mutate({ taskId, updates: { text } });
  };

  // Set task due date
  const setTaskDueDate = (taskId: string, dueDate: number | undefined) => {
    updateTaskMutation.mutate({ taskId, updates: { dueDate } });
  };

  // Set task color
  const setTaskColor = (taskId: string, color: string, showGradient?: boolean) => {
    updateTaskMutation.mutate({ taskId, updates: { color, showGradient } });
  };

  // Set task priority
  const setTaskPriority = (taskId: string, priority: Priority | undefined) => {
    updateTaskMutation.mutate({ taskId, updates: { priority } });
  };

  // Update task details (for modal)
  const updateTaskDetails = (taskId: string, updates: Partial<BoardTask>) => {
    updateTaskMutation.mutate({ taskId, updates });
  };

  return {
    createTask: (text: string) => createTaskMutation.mutateAsync(text),
    deleteTask: (taskId: string) => deleteTaskMutation.mutateAsync(taskId),
    reorderTasks: (tasks: BoardTask[]) => reorderTasksMutation.mutateAsync(tasks),
    toggleTask,
    updateTaskText,
    setTaskDueDate,
    setTaskColor,
    setTaskPriority,
    updateTaskDetails,
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
    isReordering: reorderTasksMutation.isPending,
  };
}
