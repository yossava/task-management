'use client';

import { useState } from 'react';
import { Column as ColumnType } from '@/lib/types';
import Card from '@/components/ui/Card';

interface ColumnProps {
  column: ColumnType;
  boardId: string;
  onUpdateColumn: (id: string, data: Partial<ColumnType>) => void;
  onDeleteColumn: (id: string) => void;
}

export function Column({ column, onUpdateColumn, onDeleteColumn }: ColumnProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(column.title);

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (title.trim() && title !== column.title) {
      onUpdateColumn(column.id, { title: title.trim() });
    } else {
      setTitle(column.title);
    }
  };

  return (
    <div className="flex-shrink-0 w-80">
      <Card className="h-full flex flex-col">
        {/* Column Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            {isEditingTitle ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTitleBlur();
                  if (e.key === 'Escape') {
                    setTitle(column.title);
                    setIsEditingTitle(false);
                  }
                }}
                autoFocus
                className="font-semibold text-lg text-gray-900 dark:text-white bg-transparent border-b-2 border-blue-500 focus:outline-none flex-1"
              />
            ) : (
              <h3
                className="font-semibold text-lg text-gray-900 dark:text-white cursor-pointer flex-1"
                onClick={() => setIsEditingTitle(true)}
              >
                {column.title}
              </h3>
            )}
            <button
              onClick={() => {
                if (confirm(`Are you sure you want to delete "${column.title}"?`)) {
                  onDeleteColumn(column.id);
                }
              }}
              className="text-gray-400 hover:text-red-500 transition-colors ml-2"
              aria-label="Delete column"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Empty state */}
        <div className="flex-1 p-4 flex items-center justify-center">
          <div className="text-center text-gray-400 dark:text-gray-500">
            <p className="text-sm">Column created</p>
            <p className="text-xs mt-1">Manage tasks on the board page</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
