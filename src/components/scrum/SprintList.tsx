'use client';

import { useState } from 'react';
import type { Sprint, UserStory } from '@/lib/types/scrum';
import SprintCard from './SprintCard';

interface SprintListProps {
  sprints: Sprint[];
  stories: UserStory[];
  onCreateSprint: (data: Omit<Sprint, 'id' | 'createdAt' | 'updatedAt' | 'velocity'>) => void;
  onUpdateSprint: (id: string, data: Partial<Sprint>) => void;
  onDeleteSprint: (id: string) => void;
  onStartSprint?: (id: string) => void;
  onCompleteSprint?: (id: string) => void;
}

export default function SprintList({
  sprints,
  stories,
  onCreateSprint,
  onUpdateSprint,
  onDeleteSprint,
  onStartSprint,
  onCompleteSprint,
}: SprintListProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);
  const [filter, setFilter] = useState<'all' | 'planned' | 'active' | 'completed'>('all');

  const filteredSprints =
    filter === 'all' ? sprints : sprints.filter((s) => s.status === filter);

  const handleEdit = (sprint: Sprint) => {
    setEditingSprint(sprint);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSprint(null);
  };

  const getSprintStats = (sprintId: string) => {
    const sprintStories = stories.filter((s) => s.sprintId === sprintId);
    const completedStories = sprintStories.filter((s) => s.status === 'done').length;
    return {
      total: sprintStories.length,
      completed: completedStories,
    };
  };

  const statusCounts = {
    all: sprints.length,
    planned: sprints.filter((s) => s.status === 'planned').length,
    active: sprints.filter((s) => s.status === 'active').length,
    completed: sprints.filter((s) => s.status === 'completed').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sprints</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Plan and manage your sprints
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
          Create Sprint
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'planned', 'active', 'completed'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {status === 'all'
              ? 'All Sprints'
              : status.charAt(0).toUpperCase() + status.slice(1)}
            <span className="ml-2 text-xs opacity-75">({statusCounts[status]})</span>
          </button>
        ))}
      </div>

      {/* Sprint Grid */}
      {filteredSprints.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSprints.map((sprint) => {
            const stats = getSprintStats(sprint.id);
            return (
              <SprintCard
                key={sprint.id}
                sprint={sprint}
                storyCount={stats.total}
                completedStories={stats.completed}
                onEdit={handleEdit}
                onDelete={onDeleteSprint}
                onStart={onStartSprint}
                onComplete={onCompleteSprint}
              />
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🚀</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {filter === 'all' ? 'No Sprints Yet' : `No ${filter} Sprints`}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {filter === 'all'
              ? 'Create your first sprint to start planning'
              : `There are no ${filter} sprints at the moment`}
          </p>
          {filter === 'all' && (
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Create First Sprint
            </button>
          )}
        </div>
      )}

      {/* Sprint Modal */}
      {showModal && (
        <SprintModal
          sprint={editingSprint}
          onSave={(data) => {
            if (editingSprint) {
              onUpdateSprint(editingSprint.id, data);
            } else {
              onCreateSprint(data);
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
// Sprint Modal Component
// ============================================================================

interface SprintModalProps {
  sprint: Sprint | null;
  onSave: (data: Omit<Sprint, 'id' | 'createdAt' | 'updatedAt' | 'velocity'>) => void;
  onClose: () => void;
}

function SprintModal({ sprint, onSave, onClose }: SprintModalProps) {
  const [formData, setFormData] = useState<{
    name: string;
    goal: string;
    startDate: string;
    endDate: string;
    status: Sprint['status'];
    capacity: number;
    commitment: number;
    teamId: string;
  }>({
    name: sprint?.name || '',
    goal: sprint?.goal || '',
    startDate: sprint?.startDate || '',
    endDate: sprint?.endDate || '',
    status: sprint?.status || 'planned',
    capacity: sprint?.capacity || 0,
    commitment: sprint?.commitment || 0,
    teamId: sprint?.teamId || 'default-team',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: formData.name,
      goal: formData.goal,
      startDate: formData.startDate,
      endDate: formData.endDate,
      status: formData.status,
      capacity: formData.capacity,
      commitment: formData.commitment,
      teamId: formData.teamId,
    });
  };

  // Calculate sprint duration in weeks
  const getDuration = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      const weeks = Math.round(days / 7);
      return weeks > 0 ? `${weeks} week${weeks !== 1 ? 's' : ''}` : `${days} day${days !== 1 ? 's' : ''}`;
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {sprint ? 'Edit Sprint' : 'Create Sprint'}
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
            {/* Sprint Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sprint Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="Sprint 1"
              />
            </div>

            {/* Sprint Goal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sprint Goal *
              </label>
              <textarea
                required
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="Describe the sprint goal..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
            </div>

            {/* Duration Display */}
            {getDuration() && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Sprint Duration: {getDuration()}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Capacity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Team Capacity (Story Points) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="40"
                />
              </div>

              {/* Commitment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Commitment (Story Points)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.commitment}
                  onChange={(e) =>
                    setFormData({ ...formData, commitment: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="35"
                />
              </div>
            </div>

            {/* Status */}
            {sprint && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as Sprint['status'] })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                >
                  <option value="planned">Planned</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            )}

            {/* Capacity Warning */}
            {formData.commitment > formData.capacity && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <div className="flex items-start gap-2 text-sm text-yellow-700 dark:text-yellow-300">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>
                    Commitment exceeds capacity by {formData.commitment - formData.capacity} points. Consider adjusting your sprint scope.
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                {sprint ? 'Update Sprint' : 'Create Sprint'}
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
