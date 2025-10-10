'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { BoardService } from '@/lib/services/boardService';

interface Command {
  id: string;
  name: string;
  description: string;
  icon: string;
  action: () => void;
  shortcut?: string;
  category: 'navigation' | 'boards' | 'tasks' | 'search' | 'view';
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNewBoard?: () => void;
  onNewTask?: () => void;
  onSearch?: () => void;
  onViewMode?: (mode: 'board' | 'list' | 'calendar') => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  onNewBoard,
  onNewTask,
  onSearch,
  onViewMode,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const boards = BoardService.getAll();

  const commands: Command[] = [
    // Navigation
    {
      id: 'goto-home',
      name: 'Go to Home',
      description: 'Navigate to home page',
      icon: '🏠',
      action: () => {
        router.push('/');
        onClose();
      },
      category: 'navigation',
    },
    {
      id: 'goto-boards',
      name: 'Go to Boards',
      description: 'Navigate to boards page',
      icon: '📋',
      action: () => {
        router.push('/boards');
        onClose();
      },
      category: 'navigation',
    },
    {
      id: 'goto-dashboard',
      name: 'Go to Dashboard',
      description: 'Navigate to dashboard',
      icon: '📊',
      action: () => {
        router.push('/dashboard');
        onClose();
      },
      category: 'navigation',
    },
    // Boards
    ...boards.map((board) => ({
      id: `board-${board.id}`,
      name: `Open: ${board.title}`,
      description: `${board.tasks.length} tasks`,
      icon: '📁',
      action: () => {
        router.push(`/boards#${board.id}`);
        onClose();
      },
      category: 'boards' as const,
    })),
    // Actions
    {
      id: 'new-board',
      name: 'New Board',
      description: 'Create a new board',
      icon: '➕',
      action: () => {
        onNewBoard?.();
        onClose();
      },
      shortcut: 'N',
      category: 'boards',
    },
    {
      id: 'new-task',
      name: 'New Task',
      description: 'Create a new task',
      icon: '✅',
      action: () => {
        onNewTask?.();
        onClose();
      },
      shortcut: 'T',
      category: 'tasks',
    },
    {
      id: 'search',
      name: 'Search Tasks',
      description: 'Search across all tasks',
      icon: '🔍',
      action: () => {
        onSearch?.();
        onClose();
      },
      shortcut: '/',
      category: 'search',
    },
    // View modes
    {
      id: 'view-board',
      name: 'Board View',
      description: 'Switch to board view',
      icon: '📋',
      action: () => {
        onViewMode?.('board');
        onClose();
      },
      shortcut: '1',
      category: 'view',
    },
    {
      id: 'view-list',
      name: 'List View',
      description: 'Switch to list view',
      icon: '📝',
      action: () => {
        onViewMode?.('list');
        onClose();
      },
      shortcut: '2',
      category: 'view',
    },
    {
      id: 'view-calendar',
      name: 'Calendar View',
      description: 'Switch to calendar view',
      icon: '📅',
      action: () => {
        onViewMode?.('calendar');
        onClose();
      },
      shortcut: '3',
      category: 'view',
    },
  ];

  const filteredCommands = commands.filter(
    (cmd) =>
      cmd.name.toLowerCase().includes(query.toLowerCase()) ||
      cmd.description.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setSelectedIndex(0);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Command Palette */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a command or search..."
              className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none text-lg"
            />
            <div className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              ESC
            </div>
          </div>

          {/* Commands List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredCommands.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No commands found
              </div>
            ) : (
              <div className="p-2">
                {filteredCommands.map((cmd, index) => (
                  <button
                    key={cmd.id}
                    onClick={() => cmd.action()}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      index === selectedIndex
                        ? 'bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <span className="text-2xl">{cmd.icon}</span>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {cmd.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {cmd.description}
                      </div>
                    </div>
                    {cmd.shortcut && (
                      <div className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono">
                        {cmd.shortcut}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">↑</kbd>
                  <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">↵</kbd>
                  Select
                </span>
              </div>
              <span>Cmd+K to open</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
