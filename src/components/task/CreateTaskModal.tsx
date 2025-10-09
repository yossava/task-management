'use client';

import { useState, useEffect } from 'react';
import { Task } from '@/lib/types';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'tags' | 'assigneeIds'>) => void;
  onUpdate?: (id: string, data: Partial<Task>) => void;
  editingTask?: Task | null;
  columnId: string;
  boardId: string;
}

export function CreateTaskModal({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  editingTask,
  columnId,
  boardId,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [status, setStatus] = useState('');
  const [errors, setErrors] = useState<{ title?: string }>({});

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setPriority(editingTask.priority);
      setStatus(editingTask.status);
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setStatus('');
    }
    setErrors({});
  }, [editingTask, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: { title?: string } = {};
    if (!title.trim()) {
      newErrors.title = 'Task title is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Sanitize input
    const sanitizedTitle = title.trim();
    const sanitizedDescription = description.trim();

    if (editingTask && onUpdate) {
      onUpdate(editingTask.id, {
        title: sanitizedTitle,
        description: sanitizedDescription,
        priority,
        status,
      });
    } else {
      onCreate({
        title: sanitizedTitle,
        description: sanitizedDescription,
        priority,
        status,
        columnId,
        boardId,
      });
    }

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {editingTask ? 'Edit Task' : 'Create New Task'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title"
            error={errors.title}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high' | 'urgent')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <Input
            label="Status (optional)"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            placeholder="e.g., In Progress, Blocked"
          />

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingTask ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
