'use client';

import Link from 'next/link';
import { Board } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';

interface BoardCardProps {
  board: Board;
  onEdit: (board: Board) => void;
  onDelete: (id: string) => void;
}

export function BoardCard({ board, onEdit, onDelete }: BoardCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <Link href={`/boards/${board.id}`} className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {board.title}
            </h3>
            {board.description && (
              <p className="text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                {board.description}
              </p>
            )}
          </Link>
          {board.color && (
            <div
              className="w-4 h-4 rounded-full ml-4 flex-shrink-0"
              style={{ backgroundColor: board.color }}
            />
          )}
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Created {formatDate(board.createdAt)}
        </div>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              onEdit(board);
            }}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              if (confirm(`Are you sure you want to delete "${board.title}"? This will also delete all columns and tasks.`)) {
                onDelete(board.id);
              }
            }}
          >
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
}
