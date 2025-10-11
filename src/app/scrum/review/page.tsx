'use client';

import { useState } from 'react';
import { useScrum } from '@/lib/hooks/useScrum';
import ScrumLayout from '@/components/scrum/ScrumLayout';
import SprintReviewBoard from '@/components/scrum/SprintReviewBoard';
import Link from 'next/link';

export default function SprintReviewPage() {
  const { sprints, loading } = useScrum();
  const [selectedSprintId, setSelectedSprintId] = useState<string>('');

  if (loading) {
    return (
      <ScrumLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
          <div className="flex items-center justify-center h-screen">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </ScrumLayout>
    );
  }

  const completedSprints = sprints.sprints.filter((s) => s.status === 'completed').slice(-5);
  const activeSprints = sprints.sprints.filter((s) => s.status === 'active');
  const allReviewableSprints = [...activeSprints, ...completedSprints];

  const selectedSprint = selectedSprintId
    ? sprints.sprints.find((s) => s.id === selectedSprintId)
    : allReviewableSprints[0];

  return (
    <ScrumLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Sprint Review
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                Review and accept completed work
              </p>
            </div>

            <div className="flex items-center gap-3">
              {allReviewableSprints.length > 0 && (
                <select
                  value={selectedSprintId || allReviewableSprints[0]?.id || ''}
                  onChange={(e) => setSelectedSprintId(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                >
                  {activeSprints.length > 0 && (
                    <optgroup label="Active">
                      {activeSprints.map((sprint) => (
                        <option key={sprint.id} value={sprint.id}>
                          {sprint.name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {completedSprints.length > 0 && (
                    <optgroup label="Recently Completed">
                      {completedSprints.map((sprint) => (
                        <option key={sprint.id} value={sprint.id}>
                          {sprint.name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              )}
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
        {selectedSprint ? (
          <SprintReviewBoard sprintId={selectedSprint.id} sprintName={selectedSprint.name} />
        ) : (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📋</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Sprints to Review
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create and start a sprint to hold a review
            </p>
            <Link
              href="/scrum/planning"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Go to Planning
            </Link>
          </div>
        )}
      </main>
      </div>
    </ScrumLayout>
  );
}
