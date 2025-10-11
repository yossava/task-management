import { useState, useEffect } from 'react';
import { Board } from '@/lib/types';
import { boardsApi, ApiError } from '@/lib/api/client';
import { useRouter } from 'next/navigation';

export function useBoards() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadBoards();
  }, []);

  const loadBoards = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await boardsApi.getAll();
      setBoards(response.boards);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.status === 401) {
          // Unauthorized - continue as guest
          console.log('Using guest mode');
        }
      } else {
        setError('Failed to load boards');
      }
      setBoards([]);
    } finally {
      setLoading(false);
    }
  };

  const createBoard = async (data: Omit<Board, 'id' | 'createdAt' | 'updatedAt' | 'columns'>) => {
    try {
      setError(null);
      const response = await boardsApi.create({
        title: data.title,
        description: data.description,
        color: data.color,
      });
      setBoards(prev => [...prev, response.board]);
      return response.board;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        // Check if guest limit reached
        if (err.status === 403 && (err as any).requiresAuth) {
          // Show message to user to register
          alert('Guest users can only create 1 board. Please register to create more boards.');
          router.push('/register');
        }
      } else {
        setError('Failed to create board');
      }
      throw err;
    }
  };

  const updateBoard = async (id: string, updates: Partial<Omit<Board, 'id' | 'createdAt'>>) => {
    try {
      setError(null);
      const response = await boardsApi.update(id, {
        title: updates.title,
        description: updates.description,
        color: updates.color,
      });
      setBoards(prev => prev.map(b => b.id === id ? response.board : b));
      return response.board;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to update board');
      }
      throw err;
    }
  };

  const deleteBoard = async (id: string) => {
    try {
      setError(null);
      await boardsApi.delete(id);
      setBoards(prev => prev.filter(b => b.id !== id));
      return true;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to delete board');
      }
      return false;
    }
  };

  const reorderBoards = async (newBoards: Board[]) => {
    // Optimistically update UI
    setBoards(newBoards);

    try {
      setError(null);
      await boardsApi.reorder(
        newBoards.map((board, index) => ({ id: board.id, order: index }))
      );
    } catch (err) {
      // Revert on error
      await loadBoards();
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to reorder boards');
      }
    }
  };

  return {
    boards,
    loading,
    error,
    createBoard,
    updateBoard,
    deleteBoard,
    reorderBoards,
    refresh: loadBoards,
  };
}
