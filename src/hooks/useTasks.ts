import { useState, useEffect } from 'react';
import { Task } from '@/lib/types';
import { TaskService } from '@/lib/services/taskService';

export function useTasks(columnId?: string, boardId?: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnId, boardId]);

  const loadTasks = () => {
    let data: Task[];
    if (columnId) {
      data = TaskService.getByColumnId(columnId);
    } else if (boardId) {
      data = TaskService.getByBoardId(boardId);
    } else {
      data = TaskService.getAll();
    }
    setTasks(data);
    setLoading(false);
  };

  const createTask = (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'tags' | 'assigneeIds'>) => {
    const newTask = TaskService.create(data);
    setTasks(prev => [...prev, newTask]);
    return newTask;
  };

  const updateTask = (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
    const updated = TaskService.update(id, updates);
    if (updated) {
      setTasks(prev => prev.map(t => t.id === id ? updated : t));
    }
    return updated;
  };

  const deleteTask = (id: string) => {
    const success = TaskService.delete(id);
    if (success) {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
    return success;
  };

  const moveTask = (taskId: string, newColumnId: string, newIndex?: number) => {
    const updated = TaskService.moveTask(taskId, newColumnId, newIndex);
    if (updated) {
      loadTasks(); // Reload to reflect new state
    }
    return updated;
  };

  return {
    tasks,
    loading,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    refresh: loadTasks,
  };
}
