'use client';

import { useState } from 'react';
import type { UserStory, Epic } from '@/lib/types/scrum';
import StoryCard from './StoryCard';

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

// ============================================================================
// Story Modal Component
// ============================================================================

interface StoryModalProps {
  story: UserStory | null;
  epics: Epic[];
  onSave: (data: Omit<UserStory, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

function StoryModal({ story, epics, onSave, onClose }: StoryModalProps) {
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    status: UserStory['status'];
    priority: UserStory['priority'];
    storyPoints: number | undefined;
    epicId: string;
    assignees: string[];
    labels: string[];
    acceptanceCriteria: string[];
  }>({
    title: story?.title || '',
    description: story?.description || '',
    status: story?.status || 'backlog',
    priority: story?.priority || 'medium',
    storyPoints: story?.storyPoints,
    epicId: story?.epicId || '',
    assignees: story?.assignees || [],
    labels: story?.labels || [],
    acceptanceCriteria: story?.acceptanceCriteria || [],
  });

  const [newAC, setNewAC] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newAssignee, setNewAssignee] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title: formData.title,
      description: formData.description,
      status: formData.status,
      priority: formData.priority,
      type: 'feature', // Default type
      storyPoints: formData.storyPoints,
      epicId: formData.epicId || undefined,
      assignees: formData.assignees,
      labels: formData.labels,
      acceptanceCriteria: formData.acceptanceCriteria,
      dependencies: [],
      blockedBy: [],
      estimation: { method: 'fibonacci' },
      customFields: {},
      attachments: [],
      comments: [],
      createdBy: 'Current User', // TODO: Get from auth context
    });
  };

  const addAcceptanceCriteria = () => {
    if (newAC.trim()) {
      setFormData({
        ...formData,
        acceptanceCriteria: [...formData.acceptanceCriteria, newAC.trim()],
      });
      setNewAC('');
    }
  };

  const removeAcceptanceCriteria = (index: number) => {
    setFormData({
      ...formData,
      acceptanceCriteria: formData.acceptanceCriteria.filter((_, i) => i !== index),
    });
  };

  const addLabel = () => {
    if (newLabel.trim() && !formData.labels.includes(newLabel.trim())) {
      setFormData({
        ...formData,
        labels: [...formData.labels, newLabel.trim()],
      });
      setNewLabel('');
    }
  };

  const removeLabel = (label: string) => {
    setFormData({
      ...formData,
      labels: formData.labels.filter((l) => l !== label),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {story ? 'Edit Story' : 'Create Story'}
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <svg
                className="w-6 h-6 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Story Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="As a user, I want to..."
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="Describe the user story..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as UserStory['status'] })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                >
                  <option value="backlog">Backlog</option>
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority *
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value as UserStory['priority'] })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                >
                  <option value="critical">🔴 Critical</option>
                  <option value="high">🟠 High</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="low">🔵 Low</option>
                </select>
              </div>

              {/* Story Points */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Story Points
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.storyPoints || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      storyPoints: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="1, 2, 3, 5, 8, 13..."
                />
              </div>

              {/* Epic */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Epic
                </label>
                <select
                  value={formData.epicId}
                  onChange={(e) => setFormData({ ...formData, epicId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                >
                  <option value="">No Epic</option>
                  {epics.map((epic) => (
                    <option key={epic.id} value={epic.id}>
                      🎯 {epic.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Assignees */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Assignees
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newAssignee}
                  onChange={(e) => setNewAssignee(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (newAssignee.trim() && !formData.assignees.includes(newAssignee.trim())) {
                        setFormData({
                          ...formData,
                          assignees: [...formData.assignees, newAssignee.trim()],
                        });
                        setNewAssignee('');
                      }
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="Add assignee..."
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newAssignee.trim() && !formData.assignees.includes(newAssignee.trim())) {
                      setFormData({
                        ...formData,
                        assignees: [...formData.assignees, newAssignee.trim()],
                      });
                      setNewAssignee('');
                    }
                  }}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Add
                </button>
              </div>
              {formData.assignees.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.assignees.map((assignee) => (
                    <span
                      key={assignee}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm"
                    >
                      {assignee}
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            assignees: formData.assignees.filter((a) => a !== assignee),
                          })
                        }
                        className="hover:text-purple-900 dark:hover:text-purple-100"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Labels */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Labels
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLabel())}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="Add label..."
                />
                <button
                  type="button"
                  onClick={addLabel}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Add
                </button>
              </div>
              {formData.labels.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.labels.map((label) => (
                    <span
                      key={label}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                    >
                      {label}
                      <button
                        type="button"
                        onClick={() => removeLabel(label)}
                        className="hover:text-blue-900 dark:hover:text-blue-100"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Acceptance Criteria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Acceptance Criteria
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newAC}
                  onChange={(e) => setNewAC(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === 'Enter' && (e.preventDefault(), addAcceptanceCriteria())
                  }
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="Add acceptance criteria..."
                />
                <button
                  type="button"
                  onClick={addAcceptanceCriteria}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Add
                </button>
              </div>
              {formData.acceptanceCriteria.length > 0 && (
                <div className="space-y-2">
                  {formData.acceptanceCriteria.map((ac, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                        {ac}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeAcceptanceCriteria(index)}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                {story ? 'Update Story' : 'Create Story'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
