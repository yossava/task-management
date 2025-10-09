'use client';

import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';
import Button from '@/components/ui/Button';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center space-x-3 group"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-indigo-600 rounded-xl blur-md opacity-75 group-hover:opacity-100 transition-opacity" />
            <svg
              className="relative w-10 h-10 text-white bg-gradient-to-r from-primary-600 to-indigo-600 p-2 rounded-xl shadow-lg transform group-hover:scale-110 transition-transform"
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
          <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            {APP_NAME}
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center space-x-8">
          <Link
            href="/boards"
            className="relative text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-semibold transition-colors group"
          >
            <span>Boards</span>
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-600 to-indigo-600 group-hover:w-full transition-all duration-300" />
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
  );
}
