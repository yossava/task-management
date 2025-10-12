import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { boardsApi, ApiError } from '@/lib/api/client';
import { Board } from '@/lib/types';

export function useBoardsOptimized() {
  const queryClient = useQueryClient();
  const router = useRouter();

  // Fetch boards with React Query
  const {
    data: boards = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['boards'],
    queryFn: async () => {
      const response = await boardsApi.getAll();
      return response.boards;
    },
    staleTime: 0, // Data is immediately stale - always fetch fresh
    gcTime: 0, // Don't keep in cache at all
    refetchOnWindowFocus: true, // Refetch on window focus to get fresh data
    refetchOnMount: true, // Always refetch on mount to get fresh data
  });

  // Create board mutation
  const createBoardMutation = useMutation({
    mutationFn: async (data: Omit<Board, 'id' | 'createdAt' | 'updatedAt' | 'columns'>) => {
      const response = await boardsApi.create({
        title: data.title,
        description: data.description,
        color: data.color,
      });
      return response.board;
    },
    onMutate: async (data) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['boards'] });

      // Snapshot previous value
      const previousBoards = queryClient.getQueryData<Board[]>(['boards']);

      // Create optimistic board
      const optimisticBoard: Board = {
        id: `temp-${Date.now()}`,
        title: data.title,
        description: data.description,
        color: data.color || '#3b82f6',
        tasks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Optimistically update
      queryClient.setQueryData<Board[]>(['boards'], (old = []) => [...old, optimisticBoard]);

      toast.loading('Creating board...', { id: 'create-board' });

      return { previousBoards, optimisticBoard };
    },
    onSuccess: (newBoard, _, context) => {
      // Don't update the cache again - just dismiss the loading toast
      toast.success('Board created successfully!', { id: 'create-board' });

      // Update only the ID in the background without triggering re-render
      setTimeout(() => {
        queryClient.setQueryData<Board[]>(['boards'], (old = []) =>
          old.map((board) =>
            board.id === context?.optimisticBoard.id
              ? { ...board, id: newBoard.id }
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
        toast.error(error.message || 'Guest users can only create 2 boards. Please register!', { id: 'create-board' });
        setTimeout(() => router.push('/register'), 2000);
      } else {
        toast.error(`Failed to create board: ${error.message}`, { id: 'create-board' });
      }
    },
  });

  // Update board mutation
  const updateBoardMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Board> }) => {
      const response = await boardsApi.update(id, {
        title: updates.title,
        description: updates.description,
        color: updates.color,
      });
      return response.board;
    },
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['boards'] });

      // Snapshot previous value
      const previousBoards = queryClient.getQueryData<Board[]>(['boards']);

      // Optimistically update
      queryClient.setQueryData<Board[]>(['boards'], (old = []) =>
        old.map((board) => (board.id === id ? { ...board, ...updates } : board))
      );

      return { previousBoards, boardId: id };
    },
    onSuccess: (updatedBoard, { id }) => {
      // Replace optimistic update with server response
      setTimeout(() => {
        queryClient.setQueryData<Board[]>(['boards'], (old = []) =>
          old.map((board) => (board.id === id ? updatedBoard : board))
        );
      }, 0);
      toast.success('Board updated!');
    },
    onError: (err, _, context) => {
      // Rollback on error
      if (context?.previousBoards) {
        queryClient.setQueryData(['boards'], context.previousBoards);
      }
      toast.error(`Failed to update: ${(err as ApiError).message}`);
    },
  });

  // Delete board mutation
  const deleteBoardMutation = useMutation({
    mutationFn: async (id: string) => {
      await boardsApi.delete(id);
      return id;
    },
    onMutate: async (id) => {
      toast.loading('Deleting board...', { id: 'delete-board' });

      await queryClient.cancelQueries({ queryKey: ['boards'] });
      const previousBoards = queryClient.getQueryData<Board[]>(['boards']);

      // Optimistically remove
      queryClient.setQueryData<Board[]>(['boards'], (old = []) =>
        old.filter((board) => board.id !== id)
      );

      return { previousBoards };
    },
    onSuccess: () => {
      toast.success('Board deleted!', { id: 'delete-board' });
    },
    onError: (err, _, context) => {
      if (context?.previousBoards) {
        queryClient.setQueryData(['boards'], context.previousBoards);
      }
      toast.error(`Failed to delete: ${(err as ApiError).message}`, { id: 'delete-board' });
    },
  });

  // Reorder boards mutation
  const reorderBoardsMutation = useMutation({
    mutationFn: async (newBoards: Board[]) => {
      console.log('Sending reorder request:', newBoards.map((b, i) => ({ id: b.id, order: i })));
      await boardsApi.reorder(
        newBoards.map((board, index) => ({ id: board.id, order: index }))
      );
      return newBoards;
    },
    onMutate: async (newBoards) => {
      await queryClient.cancelQueries({ queryKey: ['boards'] });
      const previousBoards = queryClient.getQueryData<Board[]>(['boards']);

      console.log('Optimistically updating boards order');

      // Optimistically update order with order property
      const boardsWithOrder = newBoards.map((board, index) => ({
        ...board,
        order: index,
      }));
      queryClient.setQueryData<Board[]>(['boards'], boardsWithOrder);

      return { previousBoards };
    },
    onSuccess: async () => {
      console.log('Reorder successful');
      // Wait 1 second for visual feedback, then refetch to ensure consistency
      await new Promise(resolve => setTimeout(resolve, 1000));
      await queryClient.refetchQueries({ queryKey: ['boards'] });
    },
    onError: (err, _, context) => {
      console.error('Reorder failed:', err);
      if (context?.previousBoards) {
        queryClient.setQueryData(['boards'], context.previousBoards);
      }
      toast.error('Failed to reorder boards');
    },
  });

  return {
    boards,
    loading,
    error: error?.message || null,
    createBoard: (data: Omit<Board, 'id' | 'createdAt' | 'updatedAt' | 'columns' | 'tasks'>) =>
      createBoardMutation.mutateAsync({ ...data, tasks: [] } as any),
    updateBoard: (id: string, updates: Partial<Board>) =>
      updateBoardMutation.mutateAsync({ id, updates }),
    deleteBoard: (id: string) => deleteBoardMutation.mutateAsync(id),
    reorderBoards: (newBoards: Board[]) => reorderBoardsMutation.mutateAsync(newBoards),
    refresh: refetch,
    isCreating: createBoardMutation.isPending,
    isUpdating: updateBoardMutation.isPending,
    isDeleting: deleteBoardMutation.isPending,
  };
}
