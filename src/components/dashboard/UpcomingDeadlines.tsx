'use client';

import { UpcomingDeadline } from '@/lib/services/analyticsService';

interface UpcomingDeadlinesProps {
  deadlines: UpcomingDeadline[];
}

const getPriorityColor = (priority?: string) => {
  switch (priority) {
    case 'urgent':
      return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700';
    case 'high':
      return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700';
    case 'medium':
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700';
    case 'low':
      return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700';
    default:
      return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700';
  }
};

const getDaysLabel = (days: number) => {
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `${days} days`;
};

export default function UpcomingDeadlines({ deadlines }: UpcomingDeadlinesProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Deadlines</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Tasks due in the next 14 days</p>
        </div>
        {deadlines.length > 0 && (
          <span className="px-2.5 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-sm font-medium rounded-full">
            {deadlines.length}
          </span>
        )}
      </div>

      {deadlines.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-medium">No upcoming deadlines</p>
          <p className="text-sm">All caught up!</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {deadlines.map((deadline) => (
            <div
              key={deadline.taskId}
              className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
            >
              {/* Board color indicator */}
              <div
                className="w-1 h-full rounded-full flex-shrink-0 mt-1"
                style={{ backgroundColor: deadline.boardColor || '#3B82F6', minHeight: '20px' }}
              />

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {deadline.taskText}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {deadline.boardTitle}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {deadline.priority && (
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityColor(deadline.priority)}`}>
                      {deadline.priority}
                    </span>
                  )}
                </div>
              </div>

              {/* Days until due */}
              <div className="flex-shrink-0 text-right">
                <div className={`text-sm font-semibold ${
                  deadline.daysUntilDue === 0
                    ? 'text-red-600 dark:text-red-400'
                    : deadline.daysUntilDue <= 3
                    ? 'text-orange-600 dark:text-orange-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {getDaysLabel(deadline.daysUntilDue)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {new Date(deadline.dueDate).toLocaleDateString('default', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
