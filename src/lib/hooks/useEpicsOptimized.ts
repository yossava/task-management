import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { fetchWithFingerprint } from '@/lib/utils/fetchWithFingerprint';

interface Epic {
  id: string;
  title: string;
  description?: string;
  color: string;
  status: string;
  progress: number;
  startDate?: Date | string | null;
  targetDate?: Date | string | null;
  stories?: any[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface CreateEpicData {
  title: string;
  description?: string;
  color?: string;
  status?: string;
  startDate?: Date | string;
  targetDate?: Date | string;
}

interface UpdateEpicData {
  title?: string;
  description?: string;
  color?: string;
  status?: string;
  progress?: number;
  startDate?: Date | string | null;
  targetDate?: Date | string | null;
}

export function useEpicsOptimized() {
  const queryClient = useQueryClient();

  // Fetch all epics
  const { data: epics = [], isLoading, error } = useQuery({
    queryKey: ['epics'],
    queryFn: async () => {
      const response = await fetchWithFingerprint('/api/scrum/epics');
      if (!response.ok) throw new Error('Failed to fetch epics');
      const data = await response.json();
      return data.epics as Epic[];
    },
  });

  // Fetch single epic
  const useEpic = (id: string) => {
    return useQuery({
      queryKey: ['epics', id],
      queryFn: async () => {
        const response = await fetchWithFingerprint(`/api/scrum/epics/${id}`);
        if (!response.ok) throw new Error('Failed to fetch epic');
        const data = await response.json();
        return data.epic as Epic;
      },
      enabled: !!id,
    });
  };

  // Create epic
  const createMutation = useMutation({
    mutationFn: async (newEpic: CreateEpicData) => {
      const response = await fetchWithFingerprint('/api/scrum/epics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEpic),
      });
      if (!response.ok) throw new Error('Failed to create epic');
      const data = await response.json();
      return data.epic as Epic;
    },
    onMutate: async (newEpic) => {
      await queryClient.cancelQueries({ queryKey: ['epics'] });
      const previousEpics = queryClient.getQueryData<Epic[]>(['epics']);

      const optimisticEpic: Epic = {
        id: `temp-${Date.now()}`,
        ...newEpic,
        color: newEpic.color || '#8b5cf6',
        status: newEpic.status || 'active',
        progress: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      queryClient.setQueryData<Epic[]>(['epics'], (old = []) => [
        optimisticEpic,
        ...old,
      ]);

      return { previousEpics };
    },
    onError: (error, _, context) => {
      if (context?.previousEpics) {
        queryClient.setQueryData(['epics'], context.previousEpics);
      }
      toast.error('Failed to create epic');
    },
    onSuccess: () => {
      toast.success('Epic created successfully');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['epics'] });
    },
  });

  // Update epic
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateEpicData }) => {
      const response = await fetchWithFingerprint(`/api/scrum/epics/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update epic');
      const result = await response.json();
      return result.epic as Epic;
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['epics'] });
      await queryClient.cancelQueries({ queryKey: ['epics', id] });

      const previousEpics = queryClient.getQueryData<Epic[]>(['epics']);
      const previousEpic = queryClient.getQueryData<Epic>(['epics', id]);

      queryClient.setQueryData<Epic[]>(['epics'], (old = []) =>
        old.map((epic) =>
          epic.id === id ? { ...epic, ...data } : epic
        )
      );

      if (previousEpic) {
        queryClient.setQueryData<Epic>(['epics', id], {
          ...previousEpic,
          ...data,
        });
      }

      return { previousEpics, previousEpic };
    },
    onError: (error, { id }, context) => {
      if (context?.previousEpics) {
        queryClient.setQueryData(['epics'], context.previousEpics);
      }
      if (context?.previousEpic) {
        queryClient.setQueryData(['epics', id], context.previousEpic);
      }
      toast.error('Failed to update epic');
    },
    onSuccess: () => {
      toast.success('Epic updated successfully');
    },
    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['epics'] });
      queryClient.invalidateQueries({ queryKey: ['epics', id] });
    },
  });

  // Delete epic
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetchWithFingerprint(`/api/scrum/epics/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete epic');
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['epics'] });
      const previousEpics = queryClient.getQueryData<Epic[]>(['epics']);

      queryClient.setQueryData<Epic[]>(['epics'], (old = []) =>
        old.filter((epic) => epic.id !== id)
      );

      return { previousEpics };
    },
    onError: (error, _, context) => {
      if (context?.previousEpics) {
        queryClient.setQueryData(['epics'], context.previousEpics);
      }
      toast.error('Failed to delete epic');
    },
    onSuccess: () => {
      toast.success('Epic deleted successfully');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['epics'] });
    },
  });

  return {
    epics,
    isLoading,
    error,
    useEpic,
    createEpic: createMutation.mutate,
    updateEpic: updateMutation.mutate,
    deleteEpic: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
