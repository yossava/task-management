'use client';

import { useState } from 'react';
import type { UserStory, Epic } from '@/lib/types/scrum';
import StoryCard from './StoryCard';
import StoryModal from './StoryModal';

interface StoryListProps {
  stories: UserStory[];
  epics: Epic[];
  onCreateStory: (data: Omit<UserStory, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateStory: (id: string, data: Partial<UserStory>) => void;
  onDeleteStory: (id: string) => void;
}

export default function StoryList({
  stories,
  epics,
  onCreateStory,
  onUpdateStory,
  onDeleteStory,
}: StoryListProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingStory, setEditingStory] = useState<UserStory | null>(null);
  const [filters, setFilters] = useState({
    status: 'all' as 'all' | UserStory['status'],
    priority: 'all' as 'all' | UserStory['priority'],
    epicId: 'all' as string,
  });

  const filteredStories = stories.filter((story) => {
    if (filters.status !== 'all' && story.status !== filters.status) return false;
    if (filters.priority !== 'all' && story.priority !== filters.priority) return false;
    if (filters.epicId !== 'all' && story.epicId !== filters.epicId) return false;
    return true;
  });

  const handleEdit = (story: UserStory) => {
    setEditingStory(story);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingStory(null);
  };

  const statusCounts = {
    all: stories.length,
    backlog: stories.filter((s) => s.status === 'backlog').length,
    todo: stories.filter((s) => s.status === 'todo').length,
    'in-progress': stories.filter((s) => s.status === 'in-progress').length,
    review: stories.filter((s) => s.status === 'review').length,
    done: stories.filter((s) => s.status === 'done').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Stories</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage your user stories and track progress
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Create Story
        </button>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        {/* Status Filter */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
            Filter by Status
          </label>
          <div className="flex flex-wrap gap-2">
            {(['all', 'backlog', 'todo', 'in-progress', 'review', 'done'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilters({ ...filters, status })}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filters.status === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {status === 'all'
                  ? 'All'
                  : status === 'todo'
                  ? 'To Do'
                  : status === 'in-progress'
                  ? 'In Progress'
                  : status.charAt(0).toUpperCase() + status.slice(1)}
                <span className="ml-1.5 text-xs opacity-75">
                  ({status === 'all' ? statusCounts.all : statusCounts[status]})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Priority & Epic Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Priority Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Priority
            </label>
            <select
              value={filters.priority}
              onChange={(e) =>
                setFilters({ ...filters, priority: e.target.value as typeof filters.priority })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="critical">🔴 Critical</option>
              <option value="high">🟠 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🔵 Low</option>
            </select>
          </div>

          {/* Epic Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Epic
            </label>
            <select
              value={filters.epicId}
              onChange={(e) => setFilters({ ...filters, epicId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            >
              <option value="all">All Epics</option>
              <option value="">No Epic</option>
              {epics.map((epic) => (
                <option key={epic.id} value={epic.id}>
                  🎯 {epic.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Story Grid */}
      {filteredStories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStories.map((story) => {
            const epic = story.epicId ? epics.find((e) => e.id === story.epicId) : undefined;
            return (
              <StoryCard
                key={story.id}
                story={story}
                epic={epic}
                onEdit={handleEdit}
                onDelete={onDeleteStory}
              />
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">📝</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Stories Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {filters.status !== 'all' || filters.priority !== 'all' || filters.epicId !== 'all'
              ? 'No stories match your current filters'
              : 'Create your first user story to get started'}
          </p>
          {filters.status === 'all' && filters.priority === 'all' && filters.epicId === 'all' && (
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Create First Story
            </button>
          )}
        </div>
      )}

      {/* Story Modal */}
      {showModal && (
        <StoryModal
          story={editingStory}
          epics={epics}
          onSave={(data) => {
            if (editingStory) {
              onUpdateStory(editingStory.id, data);
            } else {
              onCreateStory(data);
            }
            handleCloseModal();
          }}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
