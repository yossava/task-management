'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSearch } from '@/hooks/useSearch';
import { SearchService } from '@/lib/services/searchService';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#ef4444', '#6366f1', '#14b8a6',
];

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    filters,
    results,
    isSearching,
    suggestions,
    updateFilters,
    resetFilters,
    getSuggestions,
  } = useSearch();

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setRecentSearches(SearchService.getRecentSearches().slice(0, 5));
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Update suggestions as user types
  useEffect(() => {
    if (query.trim()) {
      getSuggestions(query);
    }
  }, [query, getSuggestions]);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    updateFilters({ query: searchQuery });
  };

  const handleResultClick = (boardId: string, taskId: string) => {
    // Close the modal
    onClose();

    // Find the board element and scroll to it
    setTimeout(() => {
      const boardElement = document.querySelector(`[data-board-id="${boardId}"]`);
      if (boardElement) {
        boardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Find and highlight the task
        const taskElement = boardElement.querySelector(`[data-task-id="${taskId}"]`);
        if (taskElement) {
          // Add highlight animation
          taskElement.classList.add('highlight-task');
          setTimeout(() => {
            taskElement.classList.remove('highlight-task');
          }, 2000);
        }
      }
    }, 100);
  };

  const handleRecentSearchClick = (recentQuery: string) => {
    handleSearch(recentQuery);
  };

  const handleColorFilterToggle = (color: string) => {
    const currentColors = filters.colors || [];
    const newColors = currentColors.includes(color)
      ? currentColors.filter((c) => c !== color)
      : [...currentColors, color];

    updateFilters({ colors: newColors.length > 0 ? newColors : undefined });
  };

  const handleClearFilters = () => {
    resetFilters();
    setQuery('');
    setShowFilters(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative min-h-screen flex items-start justify-center pt-20 pb-20"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-3xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search tasks..."
                className="flex-1 text-lg bg-transparent border-none focus:outline-none text-gray-900 dark:text-white placeholder-gray-400"
              />
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  showFilters
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </button>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="mt-4 space-y-4">
                {/* Color Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Colors
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => handleColorFilterToggle(color)}
                        className={`w-8 h-8 rounded-lg transition-all ${
                          filters.colors?.includes(color)
                            ? 'ring-2 ring-offset-2 ring-blue-500 scale-110'
                            : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                        aria-label={`Filter by color ${color}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Status Filters */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => updateFilters({ hasDate: !filters.hasDate })}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      filters.hasDate
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    Has due date
                  </button>
                  <button
                    onClick={() => updateFilters({ isOverdue: !filters.isOverdue })}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      filters.isOverdue
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    Overdue
                  </button>
                  <button
                    onClick={() => updateFilters({ isCompleted: filters.isCompleted === undefined ? true : undefined })}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      filters.isCompleted
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    Completed
                  </button>
                  {(filters.colors?.length || filters.hasDate || filters.isOverdue || filters.isCompleted !== undefined) && (
                    <button
                      onClick={handleClearFilters}
                      className="px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Results / Suggestions / Recent */}
          <div className="max-h-96 overflow-y-auto">
            {isSearching ? (
              <div className="p-8 text-center text-gray-500">
                <div className="animate-pulse">Searching...</div>
              </div>
            ) : query && results.length > 0 ? (
              <div>
                <div className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400">
                  {results.length} {results.length === 1 ? 'result' : 'results'}
                </div>
                {results.map((result, index) => (
                  <button
                    key={`${result.boardId}-${result.task.id}-${index}`}
                    onClick={() => handleResultClick(result.boardId, result.task.id)}
                    className="w-full px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left flex items-start gap-4"
                  >
                    {result.task.color && (
                      <div
                        className="w-1 h-full rounded-full flex-shrink-0"
                        style={{ backgroundColor: result.task.color }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        {result.task.text}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>{result.boardTitle}</span>
                        {result.task.dueDate && (
                          <>
                            <span>•</span>
                            <span>
                              {new Date(result.task.dueDate).toLocaleDateString()}
                            </span>
                          </>
                        )}
                        {result.task.completed && (
                          <>
                            <span>•</span>
                            <span className="text-green-600 dark:text-green-400">Completed</span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : query && results.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No results found for "{query}"
              </div>
            ) : recentSearches.length > 0 ? (
              <div>
                <div className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400">
                  Recent searches
                </div>
                {recentSearches.map((recent, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentSearchClick(recent)}
                    className="w-full px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left flex items-center gap-3"
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{recent}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                Type to search across all boards and tasks
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">↑↓</kbd>
                <span>Navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Enter</kbd>
                <span>Open</span>
              </span>
            </div>
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">ESC</kbd>
              <span>Close</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
