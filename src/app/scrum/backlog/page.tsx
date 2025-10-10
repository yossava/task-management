'use client';

import { useState } from 'react';
import { useScrum } from '@/lib/hooks/useScrum';
import EpicList from '@/components/scrum/EpicList';
import StoryList from '@/components/scrum/StoryList';
import QuickFilters from '@/components/scrum/QuickFilters';
import Link from 'next/link';
import type { UserStory } from '@/lib/types/scrum';

export default function BacklogPage() {
  const { epics, stories, labels, loading } = useScrum();
  const [view, setView] = useState<'epics' | 'stories'>('epics');
  const [filteredStories, setFilteredStories] = useState<UserStory[]>(stories.stories);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

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
                  Product Backlog
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  Manage epics and user stories
                </p>
              </div>

              <nav className="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setView('epics')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    view === 'epics'
                      ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  🎯 Epics
                </button>
                <button
                  onClick={() => setView('stories')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    view === 'stories'
                      ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  📝 Stories
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Quick Filters - Only show in stories view */}
        {view === 'stories' && (
          <QuickFilters
            stories={stories.stories}
            epics={epics.epics}
            labels={labels.labels}
            onFilterChange={(filtered, filters) => {
              setFilteredStories(filtered);
              setActiveFilters(filters);
            }}
          />
        )}

        {view === 'epics' ? (
          <EpicList
            epics={epics.epics}
            stories={stories.stories}
            onCreateEpic={epics.createEpic}
            onUpdateEpic={epics.updateEpic}
            onDeleteEpic={epics.deleteEpic}
          />
        ) : (
          <StoryList
            stories={activeFilters.length > 0 ? filteredStories : stories.stories}
            epics={epics.epics}
            onCreateStory={stories.createStory}
            onUpdateStory={stories.updateStory}
            onDeleteStory={stories.deleteStory}
          />
        )}
      </main>
    </div>
  );
}
