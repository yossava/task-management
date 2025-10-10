'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';
import Button from '@/components/ui/Button';
import SearchModal from '@/components/search/SearchModal';

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Check dark mode state
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // Global keyboard shortcut for search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-3 group"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur-md opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative w-10 h-10 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/50 transform group-hover:scale-110 transition-all">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
              {APP_NAME}
            </span>
          </Link>

          {/* Center - Search Button */}
          <div className="flex-1 max-w-2xl mx-8">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-3 group"
            >
              <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="flex-1 text-left text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300">
                Search tasks...
              </span>
              <kbd className="hidden sm:inline-block px-2 py-1 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            <Link
              href="/boards"
              className="relative text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-semibold transition-colors group"
            >
              <span>Boards</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 group-hover:w-full transition-all duration-300" />
            </Link>
            <Button variant="primary" size="sm">
              <svg
                className="w-4 h-4 mr-2"
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
              New Board
            </Button>
          </nav>
        </div>
      </header>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
