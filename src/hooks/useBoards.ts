import { useState, useEffect } from 'react';
import { Board } from '@/lib/types';
import { BoardService } from '@/lib/services/boardService';
import { ColumnService } from '@/lib/services/columnService';
import { TaskService } from '@/lib/services/taskService';

export function useBoards() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBoards();
  }, []);

  const loadBoards = () => {
    const data = BoardService.getAll();
    setBoards(data);
    setLoading(false);
  };

  const createBoard = (data: Omit<Board, 'id' | 'createdAt' | 'updatedAt' | 'columns'>) => {
    const newBoard = BoardService.create(data);
    setBoards(prev => [...prev, newBoard]);
    return newBoard;
  };

  const updateBoard = (id: string, updates: Partial<Omit<Board, 'id' | 'createdAt'>>) => {
    const updated = BoardService.update(id, updates);
    if (updated) {
      setBoards(prev => prev.map(b => b.id === id ? updated : b));
    }
    return updated;
  };

  const deleteBoard = (id: string) => {
    // Delete associated data
    ColumnService.deleteByBoardId(id);
    TaskService.deleteByBoardId(id);

    const success = BoardService.delete(id);
    if (success) {
      setBoards(prev => prev.filter(b => b.id !== id));
    }
    return success;
  };

  const reorderBoards = (newBoards: Board[]) => {
    BoardService.reorder(newBoards.map(b => b.id));
    setBoards(newBoards);
  };

  return {
    boards,
    loading,
    createBoard,
    updateBoard,
    deleteBoard,
    reorderBoards,
    refresh: loadBoards,
  };
}
