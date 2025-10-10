'use client';

import { useState } from 'react';
import type { UserStory, Epic } from '@/lib/types/scrum';

interface BoardStoryCardProps {
  story: UserStory;
  epic?: Epic;
  onEdit: (story: UserStory) => void;
  onClick?: (story: UserStory) => void;
}

export default function BoardStoryCard({ story, epic, onEdit, onClick }: BoardStoryCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const getPriorityIcon = () => {
    switch (story.priority) {
      case 'critical':
        return '🔴';
      case 'high':
        return '🟠';
      case 'medium':
        return '🟡';
      case 'low':
        return '🔵';
    }
  };

  return (
    <div
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-md transition-all cursor-pointer group"
      onClick={() => onClick?.(story)}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('storyId', story.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-sm flex-shrink-0">{getPriorityIcon()}</span>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 flex-1">
            {story.title}
          </h4>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-all flex-shrink-0"
        >
          <svg
            className="w-4 h-4 text-gray-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>

        {showMenu && (
          <div
            className="absolute right-0 mt-6 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                onEdit(story);
                setShowMenu(false);
              }}
              className="w-full px-3 py-1.5 text-left text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Edit
            </button>
          </div>
        )}
      </div>

      {/* Epic Tag */}
      {epic && (
        <div className="mb-2">
          <div
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium text-white"
            style={{ backgroundColor: epic.color }}
          >
            <span className="text-[10px]">🎯</span>
            <span className="truncate max-w-[120px]">{epic.title}</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          {story.storyPoints && (
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>{story.storyPoints}</span>
            </div>
          )}
          {story.acceptanceCriteria && story.acceptanceCriteria.length > 0 && (
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{story.acceptanceCriteria.length}</span>
            </div>
          )}
        </div>
        {story.assignees && story.assignees.length > 0 && (
          <div className="flex items-center -space-x-1">
            {story.assignees.slice(0, 2).map((assignee, index) => (
              <div
                key={index}
                className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-semibold border-2 border-white dark:border-gray-800"
                title={assignee}
              >
                {assignee.charAt(0).toUpperCase()}
              </div>
            ))}
            {story.assignees.length > 2 && (
              <div className="w-5 h-5 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-[10px] font-semibold border-2 border-white dark:border-gray-800">
                +{story.assignees.length - 2}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
