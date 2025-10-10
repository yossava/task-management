'use client';

import { useState } from 'react';
import { TaskFilters, TaskSort, Priority, Tag, SortOption, DateFilterOption } from '@/lib/types';
import PriorityBadge from './PriorityBadge';

interface FilterPanelProps {
  filters: TaskFilters;
  sort: TaskSort;
  availableTags: Tag[];
  onFiltersChange: (filters: TaskFilters) => void;
  onSortChange: (sort: TaskSort) => void;
  taskCount: number;
  filteredCount: number;
}

const PRIORITY_OPTIONS: Priority[] = ['urgent', 'high', 'medium', 'low'];

const DATE_FILTER_OPTIONS: { value: DateFilterOption; label: string }[] = [
  { value: 'all', label: 'All dates' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
  { value: 'noDate', label: 'No date' },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'priority', label: 'Priority' },
  { value: 'dueDate', label: 'Due date' },
  { value: 'createdAt', label: 'Created date' },
  { value: 'progress', label: 'Progress' },
  { value: 'alphabetical', label: 'Alphabetical' },
];

export default function FilterPanel({
  filters,
  sort,
  availableTags,
  onFiltersChange,
  onSortChange,
  taskCount,
  filteredCount,
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [renderKey, setRenderKey] = useState(0);

  const togglePriority = (priority: Priority) => {
    const newPriorities = filters.priorities.includes(priority)
      ? filters.priorities.filter(p => p !== priority)
      : [...filters.priorities, priority];

    // Trigger re-render immediately
    setRenderKey(prev => prev + 1);

    // Update parent state
    onFiltersChange({ ...filters, priorities: newPriorities });
  };

  const toggleTag = (tagId: string) => {
    const newTags = filters.tags.includes(tagId)
      ? filters.tags.filter(t => t !== tagId)
      : [...filters.tags, tagId];

    // Trigger re-render immediately
    setRenderKey(prev => prev + 1);

    // Update parent state
    onFiltersChange({ ...filters, tags: newTags });
  };

  const clearFilters = () => {
    setRenderKey(prev => prev + 1);
    onFiltersChange({
      priorities: [],
      tags: [],
      dateFilter: 'all',
      showCompleted: true,
      searchQuery: '',
    });
  };

  const hasActiveFilters =
    filters.priorities.length > 0 ||
    filters.tags.length > 0 ||
    filters.dateFilter !== 'all' ||
    !filters.showCompleted ||
    filters.searchQuery !== '';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors border-b border-gray-100 dark:border-gray-700"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">Filters & Sort</span>
                {hasActiveFilters && (
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-blue-500 text-white rounded">
                    {filters.priorities.length + filters.tags.length}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {filteredCount} of {taskCount} tasks
              </span>
            </div>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Filter Content */}
      {isExpanded && (
        <div className="p-5 space-y-6">
          {/* Priority Filter */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Priority
              </label>
              {filters.priorities.length > 0 && (
                <button
                  onClick={() => onFiltersChange({ ...filters, priorities: [] })}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2" key={`priority-${renderKey}`}>
              {PRIORITY_OPTIONS.map(priority => {
                const isSelected = filters.priorities.includes(priority);
                return (
                  <button
                    key={priority}
                    onClick={() => togglePriority(priority)}
                    className={`rounded-lg transition-all relative ${
                      isSelected
                        ? 'opacity-100 shadow-sm'
                        : 'opacity-50 hover:opacity-80'
                    }`}
                  >
                    <PriorityBadge priority={priority} size="sm" showIcon={true} />
                    {isSelected && (
                      <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full flex items-center justify-center shadow-sm">
                        <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tag Filter */}
          {availableTags.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tags
                </label>
                {filters.tags.length > 0 && (
                  <button
                    onClick={() => onFiltersChange({ ...filters, tags: [] })}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2" key={`tags-${renderKey}`}>
                {availableTags.map(tag => {
                  const isSelected = filters.tags.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all relative ${
                        isSelected
                          ? 'opacity-100 shadow-sm'
                          : 'opacity-50 hover:opacity-80'
                      }`}
                      style={{
                        backgroundColor: `${tag.color}20`,
                        color: tag.color,
                      }}
                    >
                      {tag.name}
                      {isSelected && (
                        <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full flex items-center justify-center shadow-sm">
                          <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Date Filter & Show Completed */}
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Due Date
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <select
                  value={filters.dateFilter}
                  onChange={(e) => onFiltersChange({ ...filters, dateFilter: e.target.value as DateFilterOption })}
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all hover:border-gray-400 dark:hover:border-gray-500"
                >
                  {DATE_FILTER_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Status
              </label>
              <label className={`flex items-center gap-2.5 px-3 py-2.5 cursor-pointer rounded-lg border-2 transition-all ${
                filters.showCompleted
                  ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-700'
              }`}>
                <input
                  type="checkbox"
                  checked={filters.showCompleted}
                  onChange={(e) => onFiltersChange({ ...filters, showCompleted: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Show completed
                </span>
              </label>
            </div>
          </div>

          {/* Sort Options */}
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Sort By
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                </svg>
                <select
                  value={sort.option}
                  onChange={(e) => onSortChange({ ...sort, option: e.target.value as SortOption })}
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all hover:border-gray-400 dark:hover:border-gray-500"
                >
                  {SORT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => onSortChange({ ...sort, direction: sort.direction === 'asc' ? 'desc' : 'asc' })}
                className={`px-3.5 py-2.5 rounded-lg transition-all ${
                  sort.direction === 'asc'
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
                title={sort.direction === 'asc' ? 'Ascending' : 'Descending'}
              >
                <svg
                  className={`w-4 h-4 transition-transform ${
                    sort.direction === 'desc' ? 'rotate-180' : ''
                  } ${sort.direction === 'asc' ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2.5 text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
