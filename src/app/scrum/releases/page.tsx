'use client';
import ScrumLayout from '@/components/scrum/ScrumLayout';

import { useScrum } from '@/lib/hooks/useScrum';
import ReleasePlanning from '@/components/scrum/ReleasePlanning';
import Link from 'next/link';

export default function ReleasesPage() {
  const { sprints, epics, stories, loading } = useScrum();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <ScrumLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Release Planning
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                Plan and track product releases and milestones
              </p>
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
        <ReleasePlanning
          sprints={sprints.sprints}
          epics={epics.epics}
          stories={stories.stories}
        />
      </main>
          </div>
    </ScrumLayout>
  );
}
