import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface UserStory {
  id: string;
  title: string;
  description?: string;
  acceptanceCriteria?: string;
  storyPoints?: number;
  priority: string;
  status: string;
  sprintId?: string;
  epicId?: string;
  assigneeId?: string;
  labels: string[];
  sprint?: any;
  epic?: any;
  assignee?: any;
  tasks?: any[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface CreateStoryData {
  title: string;
  description?: string;
  acceptanceCriteria?: string;
  storyPoints?: number;
  priority?: string;
  status?: string;
  sprintId?: string;
  epicId?: string;
  assigneeId?: string;
  labels?: string[];
}

interface UpdateStoryData {
  title?: string;
  description?: string;
  acceptanceCriteria?: string;
  storyPoints?: number;
  priority?: string;
  status?: string;
  sprintId?: string;
  epicId?: string;
  assigneeId?: string;
  labels?: string[];
}

interface StoriesFilters {
  sprintId?: string;
  epicId?: string;
  status?: string;
}

export function useStoriesOptimized(filters?: StoriesFilters) {
  const queryClient = useQueryClient();

  // Build query string
  const queryString = filters
    ? '?' + new URLSearchParams(
        Object.entries(filters)
          .filter(([_, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      ).toString()
    : '';

  // Fetch all stories with optional filters
  const { data: stories = [], isLoading, error } = useQuery({
    queryKey: ['stories', filters],
    queryFn: async () => {
      const response = await fetch(`/api/scrum/stories${queryString}`);
      if (!response.ok) throw new Error('Failed to fetch stories');
      const data = await response.json();
      return data.stories as UserStory[];
    },
  });

  // Fetch single story
  const useStory = (id: string) => {
    return useQuery({
      queryKey: ['stories', id],
      queryFn: async () => {
        const response = await fetch(`/api/scrum/stories/${id}`);
        if (!response.ok) throw new Error('Failed to fetch story');
        const data = await response.json();
        return data.story as UserStory;
      },
      enabled: !!id,
    });
  };

  // Create story
  const createMutation = useMutation({
    mutationFn: async (newStory: CreateStoryData) => {
      const response = await fetch('/api/scrum/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStory),
      });
      if (!response.ok) throw new Error('Failed to create story');
      const data = await response.json();
      return data.story as UserStory;
    },
    onMutate: async (newStory) => {
      await queryClient.cancelQueries({ queryKey: ['stories'] });
      const previousStories = queryClient.getQueryData<UserStory[]>(['stories', filters]);

      const optimisticStory: UserStory = {
        id: `temp-${Date.now()}`,
        ...newStory,
        priority: newStory.priority || 'medium',
        status: newStory.status || 'backlog',
        labels: newStory.labels || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      queryClient.setQueryData<UserStory[]>(['stories', filters], (old = []) => [
        optimisticStory,
        ...old,
      ]);

      return { previousStories };
    },
    onError: (error, _, context) => {
      if (context?.previousStories) {
        queryClient.setQueryData(['stories', filters], context.previousStories);
      }
      toast.error('Failed to create story');
    },
    onSuccess: () => {
      toast.success('Story created successfully');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
  });

  // Update story
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateStoryData }) => {
      const response = await fetch(`/api/scrum/stories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update story');
      const result = await response.json();
      return result.story as UserStory;
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['stories'] });
      await queryClient.cancelQueries({ queryKey: ['stories', id] });

      const previousStories = queryClient.getQueryData<UserStory[]>(['stories', filters]);
      const previousStory = queryClient.getQueryData<UserStory>(['stories', id]);

      queryClient.setQueryData<UserStory[]>(['stories', filters], (old = []) =>
        old.map((story) =>
          story.id === id ? { ...story, ...data } : story
        )
      );

      if (previousStory) {
        queryClient.setQueryData<UserStory>(['stories', id], {
          ...previousStory,
          ...data,
        });
      }

      return { previousStories, previousStory };
    },
    onError: (error, { id }, context) => {
      if (context?.previousStories) {
        queryClient.setQueryData(['stories', filters], context.previousStories);
      }
      if (context?.previousStory) {
        queryClient.setQueryData(['stories', id], context.previousStory);
      }
      toast.error('Failed to update story');
    },
    onSuccess: () => {
      toast.success('Story updated successfully');
    },
    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      queryClient.invalidateQueries({ queryKey: ['stories', id] });
    },
  });

  // Delete story
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/scrum/stories/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete story');
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['stories'] });
      const previousStories = queryClient.getQueryData<UserStory[]>(['stories', filters]);

      queryClient.setQueryData<UserStory[]>(['stories', filters], (old = []) =>
        old.filter((story) => story.id !== id)
      );

      return { previousStories };
    },
    onError: (error, _, context) => {
      if (context?.previousStories) {
        queryClient.setQueryData(['stories', filters], context.previousStories);
      }
      toast.error('Failed to delete story');
    },
    onSuccess: () => {
      toast.success('Story deleted successfully');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
  });

  return {
    stories,
    isLoading,
    error,
    useStory,
    createStory: createMutation.mutate,
    updateStory: updateMutation.mutate,
    deleteStory: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
