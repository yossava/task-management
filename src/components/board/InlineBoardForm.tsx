'use client';

import { useState, useRef, useEffect } from 'react';
import { Board } from '@/lib/types';
import Card from '@/components/ui/Card';

interface InlineBoardFormProps {
  onSubmit: (data: Omit<Board, 'id' | 'createdAt' | 'updatedAt' | 'columns'>) => void;
  onCancel: () => void;
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

export function InlineBoardForm({ onSubmit, onCancel }: InlineBoardFormProps) {
  const [title, setTitle] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    if (!title.trim()) {
      onCancel();
      return;
    }

    onSubmit({
      title: title.trim(),
      description: '',
      color,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <Card className="p-4">
      <input
        ref={inputRef}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleSubmit}
        placeholder="Enter board title..."
        className="w-full px-3 py-2 mb-3 text-lg font-semibold bg-transparent border-b-2 border-blue-500 focus:outline-none text-gray-900 dark:text-white placeholder:text-gray-400"
      />

      <div className="flex gap-2">
        {PRESET_COLORS.map((presetColor) => (
          <button
            key={presetColor}
            type="button"
            onClick={() => setColor(presetColor)}
            onMouseDown={(e) => e.preventDefault()} // Prevent blur on click
            className={`w-8 h-8 rounded-lg transition-all ${
              color === presetColor
                ? 'ring-2 ring-offset-2 ring-blue-500 scale-110'
                : 'hover:scale-105'
            }`}
            style={{ backgroundColor: presetColor }}
            aria-label={`Select color ${presetColor}`}
          />
        ))}
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400 mt-3">
        Press Enter to save • ESC to cancel
      </div>
    </Card>
  );
}
