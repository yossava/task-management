'use client';

import { useState, useEffect } from 'react';
import { Board } from '@/lib/types';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface CreateBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: Omit<Board, 'id' | 'createdAt' | 'updatedAt' | 'columns'>) => void;
  onUpdate?: (id: string, data: Partial<Board>) => void;
  editingBoard?: Board | null;
}

const PRESET_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
  '#ef4444', // red
  '#6366f1', // indigo
  '#14b8a6', // teal
];

export function CreateBoardModal({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  editingBoard
}: CreateBoardModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [errors, setErrors] = useState<{ title?: string }>({});

  useEffect(() => {
    if (editingBoard) {
      setTitle(editingBoard.title);
      setDescription(editingBoard.description || '');
      setColor(editingBoard.color || PRESET_COLORS[0]);
    } else {
      setTitle('');
      setDescription('');
      setColor(PRESET_COLORS[0]);
    }
    setErrors({});
  }, [editingBoard, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: { title?: string } = {};
    if (!title.trim()) {
      newErrors.title = 'Board title is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Sanitize input
    const sanitizedTitle = title.trim();
    const sanitizedDescription = description.trim();

    if (editingBoard && onUpdate) {
      onUpdate(editingBoard.id, {
        title: sanitizedTitle,
        description: sanitizedDescription,
        color,
      });
    } else {
      onCreate({
        title: sanitizedTitle,
        description: sanitizedDescription,
        color,
      });
    }

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {editingBoard ? 'Edit Board' : 'Create New Board'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Board Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter board title"
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
              placeholder="Enter board description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Board Color
            </label>
            <div className="grid grid-cols-8 gap-2">
              {PRESET_COLORS.map((presetColor) => (
                <button
                  key={presetColor}
                  type="button"
                  onClick={() => setColor(presetColor)}
                  className={`w-10 h-10 rounded-lg transition-all ${
                    color === presetColor
                      ? 'ring-2 ring-offset-2 ring-blue-500 scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: presetColor }}
                  aria-label={`Select color ${presetColor}`}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingBoard ? 'Update Board' : 'Create Board'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
