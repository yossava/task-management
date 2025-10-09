import { useState, useEffect } from 'react';
import { Column } from '@/lib/types';
import { ColumnService } from '@/lib/services/columnService';
import { TaskService } from '@/lib/services/taskService';

export function useColumns(boardId: string) {
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadColumns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId]);

  const loadColumns = () => {
    const data = ColumnService.getByBoardId(boardId);
    setColumns(data);
    setLoading(false);
  };

  const createColumn = (data: Omit<Column, 'id' | 'taskIds'>) => {
    const newColumn = ColumnService.create(data);
    setColumns(prev => [...prev, newColumn]);
    return newColumn;
  };

  const updateColumn = (id: string, updates: Partial<Omit<Column, 'id'>>) => {
    const updated = ColumnService.update(id, updates);
    if (updated) {
      setColumns(prev => prev.map(c => c.id === id ? updated : c));
    }
    return updated;
  };

  const deleteColumn = (id: string) => {
    // Delete associated tasks
    TaskService.deleteByColumnId(id);

    const success = ColumnService.delete(id);
    if (success) {
      setColumns(prev => prev.filter(c => c.id !== id));
    }
    return success;
  };

  const reorderColumns = (columnIds: string[]) => {
    ColumnService.reorder(boardId, columnIds);
    loadColumns(); // Reload to reflect new order
  };

  return {
    columns,
    loading,
    createColumn,
    updateColumn,
    deleteColumn,
    reorderColumns,
    refresh: loadColumns,
  };
}
