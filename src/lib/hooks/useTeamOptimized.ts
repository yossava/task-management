import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { fetchWithFingerprint } from '@/lib/utils/fetchWithFingerprint';

interface TeamMember {
  id: string;
  name: string;
  email?: string;
  role?: string;
  avatar?: string;
  capacity: number;
  availability: number;
  stories?: any[];
  tasks?: any[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface CreateMemberData {
  name: string;
  email?: string;
  role?: string;
  avatar?: string;
  capacity?: number;
  availability?: number;
}

interface UpdateMemberData {
  name?: string;
  email?: string;
  role?: string;
  avatar?: string;
  capacity?: number;
  availability?: number;
}

export function useTeamOptimized() {
  const queryClient = useQueryClient();

  // Fetch all team members
  const { data: members = [], isLoading, error } = useQuery({
    queryKey: ['team'],
    queryFn: async () => {
      const response = await fetchWithFingerprint('/api/scrum/team');
      if (!response.ok) throw new Error('Failed to fetch team members');
      const data = await response.json();
      return data.members as TeamMember[];
    },
  });

  // Fetch single team member
  const useMember = (id: string) => {
    return useQuery({
      queryKey: ['team', id],
      queryFn: async () => {
        const response = await fetchWithFingerprint(`/api/scrum/team/${id}`);
        if (!response.ok) throw new Error('Failed to fetch team member');
        const data = await response.json();
        return data.member as TeamMember;
      },
      enabled: !!id,
    });
  };

  // Create team member
  const createMutation = useMutation({
    mutationFn: async (newMember: CreateMemberData) => {
      const response = await fetchWithFingerprint('/api/scrum/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMember),
      });
      if (!response.ok) throw new Error('Failed to create team member');
      const data = await response.json();
      return data.member as TeamMember;
    },
    onMutate: async (newMember) => {
      await queryClient.cancelQueries({ queryKey: ['team'] });
      const previousMembers = queryClient.getQueryData<TeamMember[]>(['team']);

      const optimisticMember: TeamMember = {
        id: `temp-${Date.now()}`,
        ...newMember,
        capacity: newMember.capacity || 40,
        availability: newMember.availability || 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      queryClient.setQueryData<TeamMember[]>(['team'], (old = []) => [
        ...old,
        optimisticMember,
      ]);

      return { previousMembers };
    },
    onError: (error, _, context) => {
      if (context?.previousMembers) {
        queryClient.setQueryData(['team'], context.previousMembers);
      }
      toast.error('Failed to create team member');
    },
    onSuccess: () => {
      toast.success('Team member added successfully');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
    },
  });

  // Update team member
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateMemberData }) => {
      const response = await fetchWithFingerprint(`/api/scrum/team/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update team member');
      const result = await response.json();
      return result.member as TeamMember;
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['team'] });
      await queryClient.cancelQueries({ queryKey: ['team', id] });

      const previousMembers = queryClient.getQueryData<TeamMember[]>(['team']);
      const previousMember = queryClient.getQueryData<TeamMember>(['team', id]);

      queryClient.setQueryData<TeamMember[]>(['team'], (old = []) =>
        old.map((member) =>
          member.id === id ? { ...member, ...data } : member
        )
      );

      if (previousMember) {
        queryClient.setQueryData<TeamMember>(['team', id], {
          ...previousMember,
          ...data,
        });
      }

      return { previousMembers, previousMember };
    },
    onError: (error, { id }, context) => {
      if (context?.previousMembers) {
        queryClient.setQueryData(['team'], context.previousMembers);
      }
      if (context?.previousMember) {
        queryClient.setQueryData(['team', id], context.previousMember);
      }
      toast.error('Failed to update team member');
    },
    onSuccess: () => {
      toast.success('Team member updated successfully');
    },
    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
      queryClient.invalidateQueries({ queryKey: ['team', id] });
    },
  });

  // Delete team member
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetchWithFingerprint(`/api/scrum/team/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete team member');
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['team'] });
      const previousMembers = queryClient.getQueryData<TeamMember[]>(['team']);

      queryClient.setQueryData<TeamMember[]>(['team'], (old = []) =>
        old.filter((member) => member.id !== id)
      );

      return { previousMembers };
    },
    onError: (error, _, context) => {
      if (context?.previousMembers) {
        queryClient.setQueryData(['team'], context.previousMembers);
      }
      toast.error('Failed to delete team member');
    },
    onSuccess: () => {
      toast.success('Team member removed successfully');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
    },
  });

  return {
    members,
    isLoading,
    error,
    useMember,
    createMember: createMutation.mutate,
    updateMember: updateMutation.mutate,
    deleteMember: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
