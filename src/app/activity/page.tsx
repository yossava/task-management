'use client';

import { useState, useEffect } from 'react';
import { ActivityService } from '@/lib/services/activityService';
import type { ActivityLog } from '@/lib/types';

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [filter, setFilter] = useState<'all' | 'board_created' | 'board_updated' | 'task_created' | 'task_updated' | 'task_completed'>('all');

  useEffect(() => {
    loadActivities();
  }, [filter]);

  const loadActivities = () => {
    const allActivities = ActivityService.getRecent(100);
    if (filter === 'all') {
      setActivities(allActivities);
    } else {
      setActivities(allActivities.filter(a => a.type === filter));
    }
  };

  const getActivityIcon = (type: ActivityLog['type']) => {
    switch (type) {
      case 'board_created':
        return (
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
          </div>
        );
      case 'board_updated':
        return (
          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
            <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
        );
      case 'task_created':
        return (
          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'task_updated':
        return (
          <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
            <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
        );
      case 'task_completed':
        return (
          <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const getActivityTitle = (activity: ActivityLog) => {
    switch (activity.type) {
      case 'board_created':
        return 'Board created';
      case 'board_updated':
        return 'Board updated';
      case 'task_created':
        return 'Task created';
      case 'task_updated':
        return 'Task updated';
      case 'task_completed':
        return 'Task completed';
      default:
        return 'Activity';
    }
  };

  const getActivityDescription = (activity: ActivityLog) => {
    switch (activity.type) {
      case 'board_created':
      case 'board_updated':
        return `in ${activity.boardTitle}`;
      case 'task_created':
      case 'task_updated':
      case 'task_completed':
        return (
          <>
            <span className="font-medium text-gray-900 dark:text-white">{activity.taskText || 'Task'}</span>
            {' in '}
            <span className="text-gray-700 dark:text-gray-300">{activity.boardTitle}</span>
          </>
        );
      default:
        return activity.boardTitle;
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;

    return new Date(timestamp).toLocaleDateString();
  };

  const clearAllActivities = () => {
    if (confirm('Are you sure you want to clear all activity history?')) {
      ActivityService.clear();
      loadActivities();
    }
  };

  const filterOptions = [
    { value: 'all', label: 'All Activities', count: ActivityService.getRecent(100).length },
    { value: 'board_created', label: 'Boards Created', count: ActivityService.getRecent(100).filter(a => a.type === 'board_created').length },
    { value: 'task_created', label: 'Tasks Created', count: ActivityService.getRecent(100).filter(a => a.type === 'task_created').length },
    { value: 'task_updated', label: 'Tasks Updated', count: ActivityService.getRecent(100).filter(a => a.type === 'task_updated').length },
    { value: 'task_completed', label: 'Tasks Completed', count: ActivityService.getRecent(100).filter(a => a.type === 'task_completed').length },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Activity Feed</h1>
                <p className="text-gray-600 dark:text-gray-400">{activities.length} activities</p>
              </div>
            </div>

            {activities.length > 0 && (
              <button
                onClick={clearAllActivities}
                className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === option.value
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
              >
                {option.label}
                {option.count > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    filter === option.value
                      ? 'bg-white/20'
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    {option.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Activity List */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          {activities.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No activities yet</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {filter === 'all'
                  ? 'Start creating boards and tasks to see your activity here'
                  : `No ${filterOptions.find(f => f.value === filter)?.label.toLowerCase()} found`
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {getActivityIcon(activity.type)}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {getActivityTitle(activity)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {getActivityDescription(activity)}
                      </p>
                    </div>

                    <span className="text-xs text-gray-500 dark:text-gray-500 whitespace-nowrap">
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
    </div>
  );
}
