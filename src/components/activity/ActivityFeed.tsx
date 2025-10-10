'use client';

import { useState, useEffect } from 'react';
import { ActivityLog, ActivityType } from '@/lib/types';
import { ActivityService } from '@/lib/services/activityService';

interface ActivityFeedProps {
  boardId?: string; // If provided, show only activities for this board
  limit?: number;
}

const ACTIVITY_ICONS: Record<ActivityType, string> = {
  board_created: '📋',
  board_updated: '✏️',
  board_deleted: '🗑️',
  task_created: '➕',
  task_updated: '📝',
  task_completed: '✅',
  task_deleted: '❌',
  task_moved: '🔄',
  tag_created: '🏷️',
  tag_updated: '🔖',
  tag_deleted: '🗑️',
};

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  board_created: 'Board created',
  board_updated: 'Board updated',
  board_deleted: 'Board deleted',
  task_created: 'Task created',
  task_updated: 'Task updated',
  task_completed: 'Task completed',
  task_deleted: 'Task deleted',
  task_moved: 'Task moved',
  tag_created: 'Tag created',
  tag_updated: 'Tag updated',
  tag_deleted: 'Tag deleted',
};

const ACTIVITY_COLORS: Record<ActivityType, string> = {
  board_created: 'from-blue-500 to-indigo-500',
  board_updated: 'from-purple-500 to-pink-500',
  board_deleted: 'from-red-500 to-orange-500',
  task_created: 'from-green-500 to-emerald-500',
  task_updated: 'from-amber-500 to-yellow-500',
  task_completed: 'from-green-600 to-teal-600',
  task_deleted: 'from-red-600 to-rose-600',
  task_moved: 'from-cyan-500 to-blue-500',
  tag_created: 'from-violet-500 to-purple-500',
  tag_updated: 'from-fuchsia-500 to-pink-500',
  tag_deleted: 'from-rose-500 to-red-500',
};

function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } else if (days > 0) {
    return `${days}d ago`;
  } else if (hours > 0) {
    return `${hours}h ago`;
  } else if (minutes > 0) {
    return `${minutes}m ago`;
  } else {
    return 'Just now';
  }
}

export default function ActivityFeed({ boardId, limit = 50 }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchActivities = () => {
      const logs = boardId
        ? ActivityService.getByBoard(boardId)
        : ActivityService.getRecent(limit);
      setActivities(logs);
    };

    fetchActivities();

    // Refresh every 30 seconds
    const interval = setInterval(fetchActivities, 30000);
    return () => clearInterval(interval);
  }, [boardId, limit]);

  if (activities.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">No activity yet</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
          {boardId ? 'Start working on this board to see activity' : 'Create boards and tasks to see activity'}
        </p>
      </div>
    );
  }

  const displayedActivities = isExpanded ? activities : activities.slice(0, 10);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Activity Feed</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
              </p>
            </div>
          </div>
          {activities.length > 10 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg transition-colors"
            >
              {isExpanded ? 'Show less' : `Show all ${activities.length}`}
            </button>
          )}
        </div>
      </div>

      {/* Activity List */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {displayedActivities.map((activity) => (
          <div
            key={activity.id}
            className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
          >
            <div className="flex gap-4">
              {/* Icon */}
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br ${ACTIVITY_COLORS[activity.type]} flex items-center justify-center text-xl shadow-sm`}
              >
                {ACTIVITY_ICONS[activity.type]}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {ACTIVITY_LABELS[activity.type]}
                    </span>
                    {!boardId && (
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                        in <span className="font-medium text-gray-700 dark:text-gray-300">{activity.boardTitle}</span>
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                    {formatTimestamp(activity.timestamp)}
                  </span>
                </div>

                {/* Task/Tag details */}
                {activity.taskText && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {activity.taskText}
                  </p>
                )}
                {activity.tagName && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Tag: <span className="font-medium">{activity.tagName}</span>
                  </p>
                )}

                {/* Changes */}
                {activity.changes && activity.changes.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {activity.changes.map((change, idx) => (
                      <div key={idx} className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <span className="font-medium text-gray-600 dark:text-gray-300 capitalize">
                          {change.field}:
                        </span>
                        <span className="line-through">{String(change.oldValue)}</span>
                        <span>→</span>
                        <span className="font-medium text-gray-700 dark:text-gray-200">
                          {String(change.newValue)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      {isExpanded && activities.length > 10 && (
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setIsExpanded(false)}
            className="w-full text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
          >
            Show less
          </button>
        </div>
      )}
    </div>
  );
}
