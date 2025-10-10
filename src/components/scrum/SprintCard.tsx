'use client';

import { useState } from 'react';
import type { Sprint } from '@/lib/types/scrum';

interface SprintCardProps {
  sprint: Sprint;
  storyCount?: number;
  completedStories?: number;
  onEdit: (sprint: Sprint) => void;
  onDelete: (id: string) => void;
  onStart?: (id: string) => void;
  onComplete?: (id: string) => void;
  onClick?: (sprint: Sprint) => void;
}

export default function SprintCard({
  sprint,
  storyCount = 0,
  completedStories = 0,
  onEdit,
  onDelete,
  onStart,
  onComplete,
  onClick,
}: SprintCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const getStatusColor = () => {
    switch (sprint.status) {
      case 'planned':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
      case 'active':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      case 'completed':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
    }
  };

  const getStatusLabel = () => {
    switch (sprint.status) {
      case 'planned':
        return 'Planned';
      case 'active':
        return 'Active';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
    }
  };

  const getStatusIcon = () => {
    switch (sprint.status) {
      case 'planned':
        return '📋';
      case 'active':
        return '🚀';
      case 'completed':
        return '✅';
      case 'cancelled':
        return '❌';
    }
  };

  const startDate = new Date(sprint.startDate);
  const endDate = new Date(sprint.endDate);
  const today = new Date();
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysElapsed = Math.max(
    0,
    Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  );
  const daysRemaining = Math.max(
    0,
    Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  );
  const progressPercentage = sprint.status === 'active' ? (daysElapsed / totalDays) * 100 : 0;

  const completionRate = storyCount > 0 ? (completedStories / storyCount) * 100 : 0;
  const velocityPercentage = sprint.capacity > 0 ? (sprint.velocity / sprint.capacity) * 100 : 0;

  return (
    <div
      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 hover:shadow-lg transition-all relative cursor-pointer"
      onClick={() => onClick?.(sprint)}
    >
      {/* Menu Button */}
      <div className="absolute top-4 right-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <svg
            className="w-5 h-5 text-gray-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>

        {showMenu && (
          <div
            className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                onEdit(sprint);
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit Sprint
            </button>
            {sprint.status === 'planned' && onStart && (
              <button
                onClick={() => {
                  onStart(sprint.id);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950 flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Start Sprint
              </button>
            )}
            {sprint.status === 'active' && onComplete && (
              <button
                onClick={() => {
                  if (confirm(`Complete sprint "${sprint.name}"?`)) {
                    onComplete(sprint.id);
                  }
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Complete Sprint
              </button>
            )}
            <button
              onClick={() => {
                if (confirm(`Delete sprint "${sprint.name}"?`)) {
                  onDelete(sprint.id);
                }
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete Sprint
            </button>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="flex items-start gap-4 mb-4 pr-10">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl shadow-lg">
            {getStatusIcon()}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 truncate">
            {sprint.name}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor()}`}>
              {getStatusLabel()}
            </span>
            {sprint.status === 'active' && (
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Goal */}
      {sprint.goal && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          <span className="font-medium text-gray-700 dark:text-gray-300">Goal: </span>
          {sprint.goal}
        </p>
      )}

      {/* Timeline Progress (only for active sprints) */}
      {sprint.status === 'active' && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-gray-600 dark:text-gray-400">Timeline Progress</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              Day {daysElapsed}/{totalDays}
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Stories</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {completedStories}/{storyCount}
          </div>
          <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-500"
              style={{ width: `${Math.min(completionRate, 100)}%` }}
            ></div>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Velocity</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {sprint.velocity}/{sprint.capacity}
          </div>
          <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${Math.min(velocityPercentage, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Dates */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                clipRule="evenodd"
              />
            </svg>
            <span>{startDate.toLocaleDateString()}</span>
          </div>
          <span>→</span>
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            <span>{endDate.toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
