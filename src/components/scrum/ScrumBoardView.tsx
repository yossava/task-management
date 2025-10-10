'use client';

import { useState } from 'react';
import type { UserStory, Epic, Sprint } from '@/lib/types/scrum';
import BoardStoryCard from './BoardStoryCard';
import StoryDetailsModal from './StoryDetailsModal';

interface BoardColumn {
  id: string;
  title: string;
  status: UserStory['status'];
  color: string;
  wipLimit?: number;
}

const DEFAULT_COLUMNS: BoardColumn[] = [
  { id: 'backlog', title: 'Backlog', status: 'backlog', color: 'bg-gray-100 dark:bg-gray-800' },
  { id: 'todo', title: 'To Do', status: 'todo', color: 'bg-blue-100 dark:bg-blue-900/30' },
  { id: 'in-progress', title: 'In Progress', status: 'in-progress', color: 'bg-yellow-100 dark:bg-yellow-900/30', wipLimit: 5 },
  { id: 'review', title: 'Review', status: 'review', color: 'bg-purple-100 dark:bg-purple-900/30', wipLimit: 3 },
  { id: 'done', title: 'Done', status: 'done', color: 'bg-green-100 dark:bg-green-900/30' },
];

interface ScrumBoardViewProps {
  stories: UserStory[];
  epics: Epic[];
  sprint?: Sprint;
  onUpdateStory: (id: string, data: Partial<UserStory>) => void;
  onEditStory: (story: UserStory) => void;
}

export default function ScrumBoardView({
  stories,
  epics,
  sprint,
  onUpdateStory,
  onEditStory,
}: ScrumBoardViewProps) {
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [selectedStory, setSelectedStory] = useState<UserStory | null>(null);
  const [filters, setFilters] = useState({
    epic: 'all' as string,
    priority: 'all' as 'all' | UserStory['priority'],
    assignee: 'all' as string,
  });

  // Filter stories by sprint if provided
  const sprintStories = sprint
    ? stories.filter((s) => s.sprintId === sprint.id)
    : stories;

  // Apply additional filters
  const filteredStories = sprintStories.filter((story) => {
    if (filters.epic !== 'all' && story.epicId !== filters.epic) return false;
    if (filters.priority !== 'all' && story.priority !== filters.priority) return false;
    if (filters.assignee !== 'all' && !story.assignees?.includes(filters.assignee)) return false;
    return true;
  });

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, status: UserStory['status']) => {
    e.preventDefault();
    const storyId = e.dataTransfer.getData('storyId');
    if (storyId) {
      onUpdateStory(storyId, { status });
    }
    setDragOverColumn(null);
  };

  const getColumnStories = (status: UserStory['status']) => {
    return filteredStories.filter((s) => s.status === status);
  };

  const getStoryPoints = (status: UserStory['status']) => {
    return getColumnStories(status).reduce((sum, s) => sum + (s.storyPoints || 0), 0);
  };

  const uniqueAssignees = Array.from(
    new Set(sprintStories.flatMap((s) => s.assignees || []))
  );

  return (
    <div className="space-y-6">
      {/* Sprint Info */}
      {sprint && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {sprint.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {sprint.goal}
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="text-right">
                <div className="text-gray-600 dark:text-gray-400">Stories</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {filteredStories.length}
                </div>
              </div>
              <div className="text-right">
                <div className="text-gray-600 dark:text-gray-400">Points</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {filteredStories.reduce((sum, s) => sum + (s.storyPoints || 0), 0)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Epic Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter by Epic
            </label>
            <select
              value={filters.epic}
              onChange={(e) => setFilters({ ...filters, epic: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            >
              <option value="all">All Epics ({sprintStories.length})</option>
              {epics.map((epic) => {
                const count = sprintStories.filter((s) => s.epicId === epic.id).length;
                return (
                  <option key={epic.id} value={epic.id}>
                    🎯 {epic.title} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter by Priority
            </label>
            <select
              value={filters.priority}
              onChange={(e) =>
                setFilters({ ...filters, priority: e.target.value as typeof filters.priority })
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="critical">🔴 Critical</option>
              <option value="high">🟠 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🔵 Low</option>
            </select>
          </div>

          {/* Assignee Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter by Assignee
            </label>
            <select
              value={filters.assignee}
              onChange={(e) => setFilters({ ...filters, assignee: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            >
              <option value="all">All Assignees</option>
              {uniqueAssignees.map((assignee) => (
                <option key={assignee} value={assignee}>
                  {assignee}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Board Columns */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {DEFAULT_COLUMNS.map((column) => {
          const columnStories = getColumnStories(column.status);
          const storyPoints = getStoryPoints(column.status);
          const isOverLimit = column.wipLimit && columnStories.length > column.wipLimit;
          const isDragOver = dragOverColumn === column.id;

          return (
            <div
              key={column.id}
              className="flex-shrink-0 w-80"
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.status)}
            >
              {/* Column Header */}
              <div
                className={`${column.color} rounded-t-lg p-3 border-b-2 ${
                  isDragOver ? 'border-blue-500' : 'border-transparent'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {column.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {columnStories.length}
                    </span>
                    {column.wipLimit && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          isOverLimit
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        Limit: {column.wipLimit}
                      </span>
                    )}
                  </div>
                </div>
                {storyPoints > 0 && (
                  <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span>{storyPoints} points</span>
                  </div>
                )}
              </div>

              {/* Column Content */}
              <div
                className={`bg-gray-50 dark:bg-gray-900/50 rounded-b-lg p-3 min-h-[400px] space-y-3 border-2 ${
                  isDragOver
                    ? 'border-blue-500 border-dashed'
                    : 'border-gray-200 dark:border-gray-800'
                }`}
              >
                {columnStories.length > 0 ? (
                  columnStories.map((story) => {
                    const epic = story.epicId
                      ? epics.find((e) => e.id === story.epicId)
                      : undefined;
                    return (
                      <BoardStoryCard
                        key={story.id}
                        story={story}
                        epic={epic}
                        onEdit={onEditStory}
                        onClick={(story) => setSelectedStory(story)}
                      />
                    );
                  })
                ) : (
                  <div className="flex items-center justify-center h-32 text-sm text-gray-400 dark:text-gray-600">
                    Drop stories here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Story Details Modal */}
      {selectedStory && (
        <StoryDetailsModal
          story={selectedStory}
          isOpen={!!selectedStory}
          onClose={() => setSelectedStory(null)}
          onUpdate={(updatedStory) => {
            onUpdateStory(updatedStory.id, updatedStory);
            setSelectedStory(updatedStory);
          }}
        />
      )}
    </div>
  );
}
