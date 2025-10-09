'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Board } from '@/lib/types';
import Card from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';

interface BoardCardProps {
  board: Board;
  onUpdate: (id: string, data: Partial<Board>) => void;
  onDelete: (id: string) => void;
}

export function BoardCard({ board, onUpdate, onDelete }: BoardCardProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [title, setTitle] = useState(board.title);
  const [description, setDescription] = useState(board.description || '');
  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditingTitle) {
      titleRef.current?.focus();
      titleRef.current?.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (isEditingDescription) {
      descriptionRef.current?.focus();
      descriptionRef.current?.select();
    }
  }, [isEditingDescription]);

  const handleTitleSave = () => {
    setIsEditingTitle(false);
    if (title.trim() && title !== board.title) {
      onUpdate(board.id, { title: title.trim() });
    } else {
      setTitle(board.title);
    }
  };

  const handleDescriptionSave = () => {
    setIsEditingDescription(false);
    if (description.trim() !== board.description) {
      onUpdate(board.id, { description: description.trim() });
    } else {
      setDescription(board.description || '');
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {isEditingTitle ? (
              <input
                ref={titleRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleTitleSave();
                  } else if (e.key === 'Escape') {
                    setTitle(board.title);
                    setIsEditingTitle(false);
                  }
                }}
                className="text-xl font-bold text-gray-900 dark:text-white bg-transparent border-b-2 border-blue-500 focus:outline-none w-full"
              />
            ) : (
              <Link href={`/boards/${board.id}`}>
                <h3
                  onClick={(e) => {
                    e.preventDefault();
                    setIsEditingTitle(true);
                  }}
                  className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors cursor-text hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-1 -mx-1"
                >
                  {board.title}
                </h3>
              </Link>
            )}

            {isEditingDescription ? (
              <textarea
                ref={descriptionRef}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleDescriptionSave}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setDescription(board.description || '');
                    setIsEditingDescription(false);
                  }
                }}
                placeholder="Add a description..."
                rows={2}
                className="w-full mt-2 text-gray-600 dark:text-gray-400 bg-transparent border-b-2 border-blue-500 focus:outline-none resize-none"
              />
            ) : (
              board.description || isEditingDescription ? (
                <p
                  onClick={() => setIsEditingDescription(true)}
                  className="text-gray-600 dark:text-gray-400 mt-2 line-clamp-2 cursor-text hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-1 -mx-1"
                >
                  {board.description || 'Add a description...'}
                </p>
              ) : (
                <button
                  onClick={() => setIsEditingDescription(true)}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mt-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-1 -mx-1"
                >
                  Add a description...
                </button>
              )
            )}
          </div>
          {board.color && (
            <div
              className="w-4 h-4 rounded-full ml-4 flex-shrink-0"
              style={{ backgroundColor: board.color }}
            />
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Created {formatDate(board.createdAt)}
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              if (confirm(`Are you sure you want to delete "${board.title}"? This will also delete all columns and tasks.`)) {
                onDelete(board.id);
              }
            }}
            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Delete board"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </Card>
  );
}
