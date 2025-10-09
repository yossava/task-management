'use client';

import { Task } from '@/lib/types';
import { Card } from '@/components/ui/Card';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  onDelete: (id: string) => void;
}

const PRIORITY_COLORS = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export function TaskCard({ task, onClick, onDelete }: TaskCardProps) {
  return (
    <Card className="group cursor-pointer hover:shadow-lg transition-all" onClick={onClick}>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-semibold text-gray-900 dark:text-white flex-1 pr-2">
            {task.title}
          </h4>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Are you sure you want to delete this task?')) {
                onDelete(task.id);
              }
            }}
            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Delete task"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {task.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${PRIORITY_COLORS[task.priority]}`}>
            {task.priority}
          </span>

          {task.tags && task.tags.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {task.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                >
                  {tag}
                </span>
              ))}
              {task.tags.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{task.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
