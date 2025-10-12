import { useState, useEffect, useCallback } from 'react';

interface Board {
  id: string;
  title: string;
  description?: string;
  color?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Simple boards hook - no React Query, no caching, no optimistic updates
 * Just plain fetch, always get fresh data from server
 */
export function useBoardsSimple() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch boards from server
  const fetchBoards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/boards', {
        credentials: 'include', // Important: send cookies
        cache: 'no-store', // Force fresh data, no caching
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch boards: ${response.statusText}`);
      }

      const data = await response.json();
      setBoards(data.boards || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch boards');
      console.error('Error fetching boards:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new board
  const createBoard = useCallback(async (data: { title: string; description?: string; color?: string }) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create board');
      }

      // After creating, fetch fresh data
      await fetchBoards();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create board');
      console.error('Error creating board:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchBoards]);

  // Delete a board
  const deleteBoard = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/boards/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete board');
      }

      // After deleting, fetch fresh data
      await fetchBoards();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete board');
      console.error('Error deleting board:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchBoards]);

  // Reorder boards
  const reorderBoards = useCallback(async (newBoards: Board[]) => {
    try {
      setLoading(true);
      setError(null);

      // Prepare the reorder data
      const reorderData = newBoards.map((board, index) => ({
        id: board.id,
        order: index,
      }));

      const response = await fetch('/api/boards/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ boards: reorderData }),
      });

      if (!response.ok) {
        throw new Error('Failed to reorder boards');
      }

      // After reordering, fetch fresh data to confirm
      await fetchBoards();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder boards');
      console.error('Error reordering boards:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchBoards]);

  // Initial fetch on mount
  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  return {
    boards,
    loading,
    error,
    createBoard,
    deleteBoard,
    reorderBoards,
    refresh: fetchBoards,
  };
}
