'use client';

import { useState } from 'react';
import type { UserStory, Epic, Label } from '@/lib/types/scrum';

export interface FilterPreset {
  id: string;
  name: string;
  icon: string;
  description: string;
  filter: (story: UserStory) => boolean;
  count?: number;
}

interface QuickFiltersProps {
  stories: UserStory[];
  epics: Epic[];
  labels: Label[];
  currentUser?: string;
  onFilterChange: (filteredStories: UserStory[], activeFilters: string[]) => void;
}

export default function QuickFilters({
  stories,
  epics,
  labels,
  currentUser = 'Current User',
  onFilterChange
}: QuickFiltersProps) {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showCustomFilters, setShowCustomFilters] = useState(false);

  // Define preset filters
  const presetFilters: FilterPreset[] = [
    {
      id: 'all',
      name: 'All Stories',
      icon: '📋',
      description: 'Show all stories',
      filter: () => true,
      count: stories.length,
    },
    {
      id: 'my-items',
      name: 'My Items',
      icon: '👤',
      description: 'Stories assigned to me',
      filter: (story) => story.assignee?.name === currentUser,
      count: stories.filter(s => s.assignee?.name === currentUser).length,
    },
    {
      id: 'unassigned',
      name: 'Unassigned',
      icon: '❓',
      description: 'Stories with no assignees',
      filter: (story) => !story.assignee,
      count: stories.filter(s => !s.assignee).length,
    },
    {
      id: 'high-priority',
      name: 'High Priority',
      icon: '🔥',
      description: 'Critical and high priority stories',
      filter: (story) => story.priority === 'critical' || story.priority === 'high',
      count: stories.filter(s => s.priority === 'critical' || s.priority === 'high').length,
    },
    {
      id: 'blocked',
      name: 'Blocked',
      icon: '🚨',
      description: 'Stories with active blockers',
      filter: (story) => story.blocker !== undefined && story.blocker.status !== 'resolved',
      count: stories.filter(s => s.blocker && s.blocker.status !== 'resolved').length,
    },
    {
      id: 'no-points',
      name: 'No Story Points',
      icon: '⚖️',
      description: 'Stories without estimation',
      filter: (story) => !story.storyPoints || story.storyPoints === 0,
      count: stories.filter(s => !s.storyPoints || s.storyPoints === 0).length,
    },
    {
      id: 'backlog',
      name: 'Backlog',
      icon: '📦',
      description: 'Stories in backlog',
      filter: (story) => story.status === 'backlog',
      count: stories.filter(s => s.status === 'backlog').length,
    },
    {
      id: 'in-progress',
      name: 'In Progress',
      icon: '⚡',
      description: 'Stories currently being worked on',
      filter: (story) => story.status === 'in-progress',
      count: stories.filter(s => s.status === 'in-progress').length,
    },
  ];

  // Apply active filters
  const applyFilters = (filterIds: string[]) => {
    if (filterIds.length === 0 || filterIds.includes('all')) {
      onFilterChange(stories, filterIds);
      return;
    }

    const activePresets = presetFilters.filter(p => filterIds.includes(p.id));
    const filtered = stories.filter(story =>
      activePresets.every(preset => preset.filter(story))
    );

    onFilterChange(filtered, filterIds);
  };

  const handleFilterClick = (filterId: string) => {
    let newActiveFilters: string[];

    if (filterId === 'all') {
      newActiveFilters = [];
    } else if (activeFilters.includes(filterId)) {
      // Remove filter
      newActiveFilters = activeFilters.filter(id => id !== filterId);
    } else {
      // Add filter (remove 'all' if present)
      newActiveFilters = [...activeFilters.filter(id => id !== 'all'), filterId];
    }

    setActiveFilters(newActiveFilters);
    applyFilters(newActiveFilters);
  };

  const clearFilters = () => {
    setActiveFilters([]);
    onFilterChange(stories, []);
  };

  const isFilterActive = (filterId: string) => {
    if (filterId === 'all') {
      return activeFilters.length === 0;
    }
    return activeFilters.includes(filterId);
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            🔍 Quick Filters
          </span>
          {activeFilters.length > 0 && (
            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
              {activeFilters.length} active
            </span>
          )}
        </div>
        {activeFilters.length > 0 && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Filter Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
          {presetFilters.map(filter => {
            const active = isFilterActive(filter.id);
            return (
              <button
                key={filter.id}
                onClick={() => handleFilterClick(filter.id)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  active
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                }`}
                title={filter.description}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl">{filter.icon}</span>
                  <span className={`text-xs font-medium text-center ${
                    active
                      ? 'text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {filter.name}
                  </span>
                  {filter.count !== undefined && filter.count > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      active
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {filter.count}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Epic Filters */}
        {epics.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setShowCustomFilters(!showCustomFilters)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors mb-2"
            >
              <span>Filter by Epic</span>
              <svg
                className={`w-4 h-4 transition-transform ${showCustomFilters ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showCustomFilters && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                {epics.map(epic => {
                  const epicStories = stories.filter(s => s.epicId === epic.id);
                  const epicFilterId = `epic-${epic.id}`;
                  const active = activeFilters.includes(epicFilterId);

                  return (
                    <button
                      key={epic.id}
                      onClick={() => {
                        let newFilters: string[];
                        if (active) {
                          newFilters = activeFilters.filter(id => id !== epicFilterId);
                        } else {
                          newFilters = [...activeFilters, epicFilterId];
                        }
                        setActiveFilters(newFilters);

                        // Apply epic filter
                        const epicFilters = newFilters.filter(id => id.startsWith('epic-'));
                        const otherFilters = newFilters.filter(id => !id.startsWith('epic-'));

                        let filtered = stories;

                        // Apply epic filters (OR logic)
                        if (epicFilters.length > 0) {
                          const epicIds = epicFilters.map(id => id.replace('epic-', ''));
                          filtered = filtered.filter(s => epicIds.includes(s.epicId || ''));
                        }

                        // Apply other filters (AND logic)
                        if (otherFilters.length > 0) {
                          const activePresets = presetFilters.filter(p => otherFilters.includes(p.id));
                          filtered = filtered.filter(s => activePresets.every(preset => preset.filter(s)));
                        }

                        onFilterChange(filtered, newFilters);
                      }}
                      className={`p-2 rounded-lg border transition-all text-left ${
                        active
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: epic.color }}
                        />
                        <span className={`text-xs font-medium truncate ${
                          active
                            ? 'text-blue-700 dark:text-blue-300'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {epic.title}
                        </span>
                        <span className={`text-xs px-1 py-0.5 rounded ${
                          active
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}>
                          {epicStories.length}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Active Filter Summary */}
        {activeFilters.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="text-xs font-medium text-blue-900 dark:text-blue-300 mb-2">
              Active Filters:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {activeFilters.map(filterId => {
                const preset = presetFilters.find(p => p.id === filterId);
                if (preset) {
                  return (
                    <span
                      key={filterId}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-xs rounded-full"
                    >
                      <span>{preset.icon}</span>
                      <span>{preset.name}</span>
                      <button
                        onClick={() => handleFilterClick(filterId)}
                        className="hover:bg-blue-700 rounded-full p-0.5"
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </span>
                  );
                }

                // Epic filter
                if (filterId.startsWith('epic-')) {
                  const epicId = filterId.replace('epic-', '');
                  const epic = epics.find(e => e.id === epicId);
                  if (epic) {
                    return (
                      <span
                        key={filterId}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-xs rounded-full"
                      >
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: epic.color }}
                        />
                        <span>{epic.title}</span>
                        <button
                          onClick={() => {
                            const newFilters = activeFilters.filter(id => id !== filterId);
                            setActiveFilters(newFilters);
                            applyFilters(newFilters);
                          }}
                          className="hover:bg-blue-700 rounded-full p-0.5"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </span>
                    );
                  }
                }

                return null;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
