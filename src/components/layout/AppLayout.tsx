'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  // Determine if sidebar should be shown based on route
  const showSidebar = pathname?.startsWith('/boards') || pathname?.startsWith('/dashboard');

  // Load sidebar state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebar_open');
    if (saved !== null) {
      setSidebarOpen(saved === 'true');
    }
  }, []);

  // Save sidebar state to localStorage
  const handleToggle = () => {
    setSidebarOpen((prev) => {
      const newState = !prev;
      localStorage.setItem('sidebar_open', String(newState));
      return newState;
    });
  };

  // Keyboard shortcut: Ctrl/Cmd + B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        handleToggle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {showSidebar && <Sidebar isOpen={sidebarOpen} onToggle={handleToggle} />}

      {/* Main content area */}
      <div
        className={`flex-1 transition-all duration-300 ${
          showSidebar && sidebarOpen ? 'lg:ml-64' : showSidebar ? 'lg:ml-20' : ''
        }`}
      >
        {/* Mobile menu button - only show when sidebar is enabled */}
        {showSidebar && (
          <button
            onClick={handleToggle}
            className="lg:hidden fixed top-4 left-4 z-30 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        {children}
      </div>
    </div>
  );
}
