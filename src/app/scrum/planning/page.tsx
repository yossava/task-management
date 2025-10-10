'use client';

import { useState } from 'react';
import { useScrum } from '@/lib/hooks/useScrum';
import SprintList from '@/components/scrum/SprintList';
import Link from 'next/link';

export default function PlanningPage() {
  const { sprints, stories, loading } = useScrum();
  const [view, setView] = useState<'sprints' | 'planning'>('sprints');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Sprint Planning
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  Plan and manage your sprints
                </p>
              </div>

              <nav className="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setView('sprints')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    view === 'sprints'
                      ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  🚀 Sprints
                </button>
                <button
                  onClick={() => setView('planning')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    view === 'planning'
                      ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  📋 Plan Sprint
                </button>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/scrum"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'sprints' ? (
          <SprintList
            sprints={sprints.sprints}
            stories={stories.stories}
            onCreateSprint={sprints.createSprint}
            onUpdateSprint={sprints.updateSprint}
            onDeleteSprint={sprints.deleteSprint}
            onStartSprint={sprints.startSprint}
            onCompleteSprint={sprints.completeSprint}
          />
        ) : (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📋</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Sprint Planning Tool Coming Soon
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Drag-and-drop sprint planning interface will be available in the next update
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              For now, manage your sprints from the Sprints view and assign stories from the board
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
