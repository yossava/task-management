'use client';

import { useState, useRef, useEffect } from 'react';
import { Task } from '@/lib/types';

interface InlineTaskFormProps {
  onSubmit: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'tags' | 'assigneeIds'>) => void;
  onCancel: () => void;
  columnId: string;
  boardId: string;
}

export function InlineTaskForm({ onSubmit, onCancel, columnId, boardId }: InlineTaskFormProps) {
  const [title, setTitle] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    if (!title.trim()) {
      onCancel();
      return;
    }

    onSubmit({
      title: title.trim(),
      description: '',
      priority: 'medium',
      status: '',
      columnId,
      boardId,
    });

    setTitle(''); // Clear for next task
    textareaRef.current?.focus(); // Keep focus for quick adding
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  const handleBlur = () => {
    // Small delay to allow clicking buttons
    setTimeout(() => {
      if (title.trim()) {
        handleSubmit();
      } else {
        onCancel();
      }
    }, 150);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3">
      <textarea
        ref={textareaRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder="Enter a title for this card..."
        rows={3}
        className="w-full px-0 py-0 bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900 dark:text-white placeholder:text-gray-400 resize-none"
      />
      <div className="flex items-center gap-2 mt-2">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()} // Prevent blur
          onClick={handleSubmit}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
        >
          Add card
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()} // Prevent blur
          onClick={onCancel}
          className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          aria-label="Cancel"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        Press Enter to save • Shift+Enter for new line • ESC to cancel
      </div>
    </div>
  );
}
