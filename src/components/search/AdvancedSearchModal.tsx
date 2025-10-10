'use client';

import React, { useState, useMemo } from 'react';
import { SearchQuery, Priority, SavedSearch } from '@/lib/types';
import { AdvancedSearchService } from '@/lib/services/advancedSearchService';
import { UserService } from '@/lib/services/userService';
import UserPicker from '@/components/user/UserPicker';
import PriorityBadge from '@/components/ui/PriorityBadge';

interface AdvancedSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableTags: { id: string; name: string; color: string }[];
  availableBoards: { id: string; title: string }[];
}

export default function AdvancedSearchModal({
  isOpen,
  onClose,
  availableTags,
  availableBoards,
}: AdvancedSearchModalProps) {
  const [query, setQuery] = useState<SearchQuery>({
    text: '',
    priorities: [],
    tags: [],
    assignees: [],
    dateRange: {},
    hasSubtasks: undefined,
    hasDependencies: undefined,
    isRecurring: undefined,
    estimatedTimeRange: {},
    boardIds: [],
  });

  const [searchName, setSearchName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'saved' | 'history'>('search');

  const savedSearches = AdvancedSearchService.getSavedSearches();
  const searchHistory = AdvancedSearchService.getSearchHistory();
  const results = useMemo(() => {
    if (!query.text && !query.priorities?.length && !query.tags?.length && !query.assignees?.length) {
      return [];
    }
    return AdvancedSearchService.search(query);
  }, [query]);

  const handleSearch = () => {
    const results = AdvancedSearchService.search(query);
    AdvancedSearchService.addToHistory(query.text || 'Advanced search', results.length);
    // Results are already computed in useMemo
  };

  const handleSaveSearch = () => {
    if (searchName.trim()) {
      AdvancedSearchService.saveSearch(searchName.trim(), query);
      setSearchName('');
      setShowSaveDialog(false);
      setActiveTab('saved');
    }
  };

  const handleLoadSearch = (search: SavedSearch) => {
    setQuery(search.query);
    AdvancedSearchService.updateLastUsed(search.id);
    setActiveTab('search');
  };

  const handleDeleteSavedSearch = (id: string) => {
    AdvancedSearchService.deleteSavedSearch(id);
    // Force re-render
    setActiveTab('saved');
  };

  const togglePriority = (priority: Priority) => {
    const priorities = query.priorities || [];
    if (priorities.includes(priority)) {
      setQuery({ ...query, priorities: priorities.filter(p => p !== priority) });
    } else {
      setQuery({ ...query, priorities: [...priorities, priority] });
    }
  };

  const toggleTag = (tagId: string) => {
    const tags = query.tags || [];
    if (tags.includes(tagId)) {
      setQuery({ ...query, tags: tags.filter(t => t !== tagId) });
    } else {
      setQuery({ ...query, tags: [...tags, tagId] });
    }
  };

  const toggleBoard = (boardId: string) => {
    const boardIds = query.boardIds || [];
    if (boardIds.includes(boardId)) {
      setQuery({ ...query, boardIds: boardIds.filter(b => b !== boardId) });
    } else {
      setQuery({ ...query, boardIds: [...boardIds, boardId] });
    }
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
      <div className="relative min-h-screen flex items-start justify-center pt-10 pb-10">
        <div
          className="relative w-full max-w-5xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Advanced Search
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mt-4">
              <button
                onClick={() => setActiveTab('search')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'search'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Search
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'saved'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Saved Searches ({savedSearches.length})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'history'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                History ({searchHistory.length})
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[calc(100vh-250px)] overflow-y-auto">
            {/* Search Tab */}
            {activeTab === 'search' && (
              <div className="space-y-6">
                {/* Text Search */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Search Text
                  </label>
                  <input
                    type="text"
                    value={query.text || ''}
                    onChange={(e) => setQuery({ ...query, text: e.target.value })}
                    placeholder="Search in title and description..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Priorities */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Priority
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {(['low', 'medium', 'high', 'urgent'] as Priority[]).map((priority) => (
                      <button
                        key={priority}
                        onClick={() => togglePriority(priority)}
                        className={`transition-all ${
                          query.priorities?.includes(priority)
                            ? 'ring-2 ring-blue-500 scale-105'
                            : 'opacity-50 hover:opacity-100'
                        }`}
                      >
                        <PriorityBadge priority={priority} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                {availableTags.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Tags
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {availableTags.map((tag) => (
                        <button
                          key={tag.id}
                          onClick={() => toggleTag(tag.id)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                            query.tags?.includes(tag.id)
                              ? 'ring-2 ring-blue-500 scale-105'
                              : 'opacity-50 hover:opacity-100'
                          }`}
                          style={{
                            backgroundColor: tag.color,
                            color: '#fff',
                          }}
                        >
                          {tag.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Assignees */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Assignees
                  </label>
                  <UserPicker
                    selectedUserIds={query.assignees || []}
                    onSelectionChange={(userIds) => setQuery({ ...query, assignees: userIds })}
                    multiple={true}
                    placeholder="Filter by assignees..."
                  />
                </div>

                {/* Boards */}
                {availableBoards.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Boards
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {availableBoards.map((board) => (
                        <button
                          key={board.id}
                          onClick={() => toggleBoard(board.id)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                            query.boardIds?.includes(board.id)
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {board.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Date Range */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Due Date Range
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        From
                      </label>
                      <input
                        type="date"
                        value={query.dateRange?.start ? new Date(query.dateRange.start).toISOString().split('T')[0] : ''}
                        onChange={(e) => setQuery({
                          ...query,
                          dateRange: {
                            ...query.dateRange,
                            start: e.target.value ? new Date(e.target.value).getTime() : undefined
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        To
                      </label>
                      <input
                        type="date"
                        value={query.dateRange?.end ? new Date(query.dateRange.end).toISOString().split('T')[0] : ''}
                        onChange={(e) => setQuery({
                          ...query,
                          dateRange: {
                            ...query.dateRange,
                            end: e.target.value ? new Date(e.target.value).getTime() : undefined
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={query.hasSubtasks === true}
                      onChange={(e) => setQuery({
                        ...query,
                        hasSubtasks: e.target.checked ? true : undefined
                      })}
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Has subtasks
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={query.hasDependencies === true}
                      onChange={(e) => setQuery({
                        ...query,
                        hasDependencies: e.target.checked ? true : undefined
                      })}
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Has dependencies
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={query.isRecurring === true}
                      onChange={(e) => setQuery({
                        ...query,
                        isRecurring: e.target.checked ? true : undefined
                      })}
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Is recurring
                    </span>
                  </label>
                </div>

                {/* Results */}
                {results.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Results ({results.length})
                    </h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {results.map(({ board, task }) => (
                        <div
                          key={`${board.id}-${task.id}`}
                          className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {task.text}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                in {board.title}
                              </div>
                            </div>
                            {task.priority && (
                              <PriorityBadge priority={task.priority} size="xs" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Saved Searches Tab */}
            {activeTab === 'saved' && (
              <div className="space-y-4">
                {savedSearches.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    <p className="text-gray-500 dark:text-gray-400">
                      No saved searches yet
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                      Save your searches to quickly access them later
                    </p>
                  </div>
                ) : (
                  savedSearches.map((search) => (
                    <div
                      key={search.id}
                      className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {search.name}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Created {new Date(search.createdAt).toLocaleDateString()}
                            {search.lastUsed && ` • Last used ${new Date(search.lastUsed).toLocaleDateString()}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleLoadSearch(search)}
                            className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                          >
                            Load
                          </button>
                          <button
                            onClick={() => handleDeleteSavedSearch(search.id)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                {searchHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-500 dark:text-gray-400">
                      No search history yet
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Recent Searches
                      </h3>
                      <button
                        onClick={() => {
                          AdvancedSearchService.clearHistory();
                          setActiveTab('history');
                        }}
                        className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                      >
                        Clear History
                      </button>
                    </div>
                    {searchHistory.map((history) => (
                      <div
                        key={history.id}
                        className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {history.query}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {history.resultsCount} results • {new Date(history.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {activeTab === 'search' && (
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center gap-4">
              {showSaveDialog ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    placeholder="Enter search name..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveSearch}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setShowSaveDialog(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setShowSaveDialog(true)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium"
                  >
                    Save Search
                  </button>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setQuery({
                          text: '',
                          priorities: [],
                          tags: [],
                          assignees: [],
                          dateRange: {},
                          boardIds: [],
                        });
                      }}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 rounded-lg transition-colors"
                    >
                      Clear
                    </button>
                    <button
                      onClick={handleSearch}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                    >
                      Search
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
