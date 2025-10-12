import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { fetchWithFingerprint } from '@/lib/utils/fetchWithFingerprint';

interface ScrumTask {
  id: string;
  title: string;
  description?: string;
  storyId?: string;
  assigneeId?: string;
  status: string;
  estimatedHours?: number;
  actualHours?: number;
  labels: string[];
  story?: any;
  assignee?: any;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface CreateTaskData {
  title: string;
  description?: string;
  storyId?: string;
  assigneeId?: string;
  status?: string;
  estimatedHours?: number;
  actualHours?: number;
  labels?: string[];
}

interface UpdateTaskData {
  title?: string;
  description?: string;
  storyId?: string;
  assigneeId?: string;
  status?: string;
  estimatedHours?: number;
  actualHours?: number;
  labels?: string[];
}

interface TasksFilters {
  storyId?: string;
  status?: string;
}

export function useScrumTasksOptimized(filters?: TasksFilters) {
  const queryClient = useQueryClient();

  // Build query string
  const queryString = filters
    ? '?' + new URLSearchParams(
        Object.entries(filters)
          .filter(([_, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      ).toString()
    : '';

  // Fetch all tasks with optional filters
  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: ['scrumTasks', filters],
    queryFn: async () => {
      const response = await fetchWithFingerprint(`/api/scrum/tasks${queryString}`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      return data.tasks as ScrumTask[];
    },
  });

  // Fetch single task
  const useTask = (id: string) => {
    return useQuery({
      queryKey: ['scrumTasks', id],
      queryFn: async () => {
        const response = await fetchWithFingerprint(`/api/scrum/tasks/${id}`);
        if (!response.ok) throw new Error('Failed to fetch task');
        const data = await response.json();
        return data.task as ScrumTask;
      },
      enabled: !!id,
    });
  };

  // Create task
  const createMutation = useMutation({
    mutationFn: async (newTask: CreateTaskData) => {
      const response = await fetchWithFingerprint('/api/scrum/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });
      if (!response.ok) throw new Error('Failed to create task');
      const data = await response.json();
      return data.task as ScrumTask;
    },
    onMutate: async (newTask) => {
      await queryClient.cancelQueries({ queryKey: ['scrumTasks'] });
      const previousTasks = queryClient.getQueryData<ScrumTask[]>(['scrumTasks', filters]);

      const optimisticTask: ScrumTask = {
        id: `temp-${Date.now()}`,
        ...newTask,
        status: newTask.status || 'todo',
        labels: newTask.labels || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      queryClient.setQueryData<ScrumTask[]>(['scrumTasks', filters], (old = []) => [
        optimisticTask,
        ...old,
      ]);

      return { previousTasks };
    },
    onError: (error, _, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['scrumTasks', filters], context.previousTasks);
      }
      toast.error('Failed to create task');
    },
    onSuccess: () => {
      toast.success('Task created successfully');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['scrumTasks'] });
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
  });

  // Update task
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTaskData }) => {
      const response = await fetchWithFingerprint(`/api/scrum/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update task');
      const result = await response.json();
      return result.task as ScrumTask;
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['scrumTasks'] });
      await queryClient.cancelQueries({ queryKey: ['scrumTasks', id] });

      const previousTasks = queryClient.getQueryData<ScrumTask[]>(['scrumTasks', filters]);
      const previousTask = queryClient.getQueryData<ScrumTask>(['scrumTasks', id]);

      queryClient.setQueryData<ScrumTask[]>(['scrumTasks', filters], (old = []) =>
        old.map((task) =>
          task.id === id ? { ...task, ...data } : task
        )
      );

      if (previousTask) {
        queryClient.setQueryData<ScrumTask>(['scrumTasks', id], {
          ...previousTask,
          ...data,
        });
      }

      return { previousTasks, previousTask };
    },
    onError: (error, { id }, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['scrumTasks', filters], context.previousTasks);
      }
      if (context?.previousTask) {
        queryClient.setQueryData(['scrumTasks', id], context.previousTask);
      }
      toast.error('Failed to update task');
    },
    onSuccess: () => {
      toast.success('Task updated successfully');
    },
    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['scrumTasks'] });
      queryClient.invalidateQueries({ queryKey: ['scrumTasks', id] });
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
  });

  // Delete task
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetchWithFingerprint(`/api/scrum/tasks/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete task');
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['scrumTasks'] });
      const previousTasks = queryClient.getQueryData<ScrumTask[]>(['scrumTasks', filters]);

      queryClient.setQueryData<ScrumTask[]>(['scrumTasks', filters], (old = []) =>
        old.filter((task) => task.id !== id)
      );

      return { previousTasks };
    },
    onError: (error, _, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['scrumTasks', filters], context.previousTasks);
      }
      toast.error('Failed to delete task');
    },
    onSuccess: () => {
      toast.success('Task deleted successfully');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['scrumTasks'] });
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
  });

  return {
    tasks,
    isLoading,
    error,
    useTask,
    createTask: createMutation.mutate,
    updateTask: updateMutation.mutate,
    deleteTask: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
