'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Board, BoardTask } from '@/lib/types';
import { useRouter } from 'next/navigation';
import AdvancedSearchModal from './AdvancedSearchModal';

interface SearchResult {
  type: 'board' | 'task';
  board: Board;
  task?: BoardTask;
  matchType: 'title' | 'description' | 'tag' | 'subtask';
  matchText: string;
}

interface GlobalSearchProps {
  boards: Board[];
}

export default function GlobalSearch({ boards }: GlobalSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Get all unique tags from all boards
  const allTags = useMemo(() => {
    const tagMap = new Map();
    boards.forEach(board => {
      board.tags?.forEach(tag => {
        if (!tagMap.has(tag.id)) {
          tagMap.set(tag.id, tag);
        }
      });
    });
    return Array.from(tagMap.values());
  }, [boards]);

  // Keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Search logic
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchResults: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    boards.forEach(board => {
      // Search in board title and description
      if (board.title.toLowerCase().includes(lowerQuery)) {
        searchResults.push({
          type: 'board',
          board,
          matchType: 'title',
          matchText: board.title,
        });
      } else if (board.description?.toLowerCase().includes(lowerQuery)) {
        searchResults.push({
          type: 'board',
          board,
          matchType: 'description',
          matchText: board.description,
        });
      }

      // Search in tasks
      board.tasks?.forEach(task => {
        if (task.text.toLowerCase().includes(lowerQuery)) {
          searchResults.push({
            type: 'task',
            board,
            task,
            matchType: 'title',
            matchText: task.text,
          });
        } else if (task.description?.toLowerCase().includes(lowerQuery)) {
          searchResults.push({
            type: 'task',
            board,
            task,
            matchType: 'description',
            matchText: task.description,
          });
        } else if (task.subtasks?.some(item => item.text.toLowerCase().includes(lowerQuery))) {
          const matchItem = task.subtasks.find(item => item.text.toLowerCase().includes(lowerQuery));
          searchResults.push({
            type: 'task',
            board,
            task,
            matchType: 'subtask',
            matchText: matchItem?.text || '',
          });
        } else if (task.tags?.length) {
          const matchingTag = board.tags?.find(tag =>
            task.tags?.includes(tag.id) && tag.name.toLowerCase().includes(lowerQuery)
          );
          if (matchingTag) {
            searchResults.push({
              type: 'task',
              board,
              task,
              matchType: 'tag',
              matchText: matchingTag.name,
            });
          }
        }
      });
    });

    setResults(searchResults.slice(0, 10)); // Limit to 10 results
  }, [query, boards]);

  const handleResultClick = () => {
    setIsOpen(false);
    setQuery('');
    // Navigate to boards page - tasks will be visible there
    router.push('/boards');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span>Search</span>
        <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-xs font-semibold text-gray-500 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
          ⌘K
        </kbd>
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={() => setIsOpen(false)}
      />

      {/* Search Modal */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 px-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search boards and tasks..."
              className="flex-1 text-lg bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400"
            />
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-2 py-1 rounded bg-gray-100 dark:bg-gray-700"
            >
              ESC
            </button>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {results.length === 0 && query && (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>No results found for &quot;{query}&quot;</p>
              </div>
            )}

            {results.length === 0 && !query && (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p>Start typing to search...</p>
              </div>
            )}

            {results.map((result, index) => (
              <button
                key={index}
                onClick={handleResultClick}
                className="w-full px-4 py-3 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0"
              >
                {/* Icon */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  result.type === 'board'
                    ? 'bg-blue-100 dark:bg-blue-900'
                    : 'bg-green-100 dark:bg-green-900'
                }`}>
                  {result.type === 'board' ? (
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 dark:text-white truncate">
                      {result.type === 'task' ? result.task?.text : result.board.title}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                      {result.matchType}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {result.type === 'task' && `in ${result.board.title} • `}
                    {result.matchText}
                  </div>
                </div>

                {/* Arrow */}
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            {results.length > 0 ? (
              <>
                <span>{results.length} result{results.length !== 1 ? 's' : ''}</span>
                <div className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded">↑↓</kbd>
                  <span>to navigate</span>
                  <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded">↵</kbd>
                  <span>to select</span>
                </div>
              </>
            ) : (
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowAdvanced(true);
                }}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Advanced Search
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Search Modal */}
      <AdvancedSearchModal
        isOpen={showAdvanced}
        onClose={() => setShowAdvanced(false)}
        availableTags={allTags}
        availableBoards={boards.map(b => ({ id: b.id, title: b.title }))}
      />
    </>
  );
}
