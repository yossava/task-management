import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface Sprint {
  id: string;
  name: string;
  goal?: string;
  startDate: Date | string;
  endDate: Date | string;
  status: string;
  commitment: number;
  velocity: number;
  stories?: any[];
  retrospectives?: any[];
  reviews?: any[];
  standups?: any[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface CreateSprintData {
  name: string;
  goal?: string;
  startDate: Date | string;
  endDate: Date | string;
  commitment?: number;
  status?: string;
}

interface UpdateSprintData {
  name?: string;
  goal?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  status?: string;
  commitment?: number;
  velocity?: number;
}

export function useSprintsOptimized() {
  const queryClient = useQueryClient();

  // Fetch all sprints
  const { data: sprints = [], isLoading, error } = useQuery({
    queryKey: ['sprints'],
    queryFn: async () => {
      const response = await fetch('/api/scrum/sprints');
      if (!response.ok) throw new Error('Failed to fetch sprints');
      const data = await response.json();
      return data.sprints as Sprint[];
    },
  });

  // Fetch single sprint
  const useSprint = (id: string) => {
    return useQuery({
      queryKey: ['sprints', id],
      queryFn: async () => {
        const response = await fetch(`/api/scrum/sprints/${id}`);
        if (!response.ok) throw new Error('Failed to fetch sprint');
        const data = await response.json();
        return data.sprint as Sprint;
      },
      enabled: !!id,
    });
  };

  // Create sprint
  const createMutation = useMutation({
    mutationFn: async (newSprint: CreateSprintData) => {
      const response = await fetch('/api/scrum/sprints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSprint),
      });
      if (!response.ok) throw new Error('Failed to create sprint');
      const data = await response.json();
      return data.sprint as Sprint;
    },
    onMutate: async (newSprint) => {
      await queryClient.cancelQueries({ queryKey: ['sprints'] });
      const previousSprints = queryClient.getQueryData<Sprint[]>(['sprints']);

      const optimisticSprint: Sprint = {
        id: `temp-${Date.now()}`,
        ...newSprint,
        status: newSprint.status || 'planning',
        commitment: newSprint.commitment || 0,
        velocity: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      queryClient.setQueryData<Sprint[]>(['sprints'], (old = []) => [
        optimisticSprint,
        ...old,
      ]);

      return { previousSprints };
    },
    onError: (error, _, context) => {
      if (context?.previousSprints) {
        queryClient.setQueryData(['sprints'], context.previousSprints);
      }
      toast.error('Failed to create sprint');
    },
    onSuccess: () => {
      toast.success('Sprint created successfully');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
    },
  });

  // Update sprint
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateSprintData }) => {
      const response = await fetch(`/api/scrum/sprints/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update sprint');
      const result = await response.json();
      return result.sprint as Sprint;
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['sprints'] });
      await queryClient.cancelQueries({ queryKey: ['sprints', id] });

      const previousSprints = queryClient.getQueryData<Sprint[]>(['sprints']);
      const previousSprint = queryClient.getQueryData<Sprint>(['sprints', id]);

      queryClient.setQueryData<Sprint[]>(['sprints'], (old = []) =>
        old.map((sprint) =>
          sprint.id === id ? { ...sprint, ...data } : sprint
        )
      );

      if (previousSprint) {
        queryClient.setQueryData<Sprint>(['sprints', id], {
          ...previousSprint,
          ...data,
        });
      }

      return { previousSprints, previousSprint };
    },
    onError: (error, { id }, context) => {
      if (context?.previousSprints) {
        queryClient.setQueryData(['sprints'], context.previousSprints);
      }
      if (context?.previousSprint) {
        queryClient.setQueryData(['sprints', id], context.previousSprint);
      }
      toast.error('Failed to update sprint');
    },
    onSuccess: () => {
      toast.success('Sprint updated successfully');
    },
    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      queryClient.invalidateQueries({ queryKey: ['sprints', id] });
    },
  });

  // Delete sprint
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/scrum/sprints/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete sprint');
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['sprints'] });
      const previousSprints = queryClient.getQueryData<Sprint[]>(['sprints']);

      queryClient.setQueryData<Sprint[]>(['sprints'], (old = []) =>
        old.filter((sprint) => sprint.id !== id)
      );

      return { previousSprints };
    },
    onError: (error, _, context) => {
      if (context?.previousSprints) {
        queryClient.setQueryData(['sprints'], context.previousSprints);
      }
      toast.error('Failed to delete sprint');
    },
    onSuccess: () => {
      toast.success('Sprint deleted successfully');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
    },
  });

  return {
    sprints,
    isLoading,
    error,
    useSprint,
    createSprint: createMutation.mutate,
    updateSprint: updateMutation.mutate,
    deleteSprint: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
