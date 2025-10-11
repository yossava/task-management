'use client';

import { useState } from 'react';
import { useScrum } from '@/lib/hooks/useScrum';
import ScrumLayout from '@/components/scrum/ScrumLayout';
import EpicList from '@/components/scrum/EpicList';
import StoryList from '@/components/scrum/StoryList';
import QuickFilters from '@/components/scrum/QuickFilters';
import PlanningPoker from '@/components/scrum/PlanningPoker';
import DependencyVisualizer from '@/components/scrum/DependencyVisualizer';
import Link from 'next/link';
import type { UserStory, EstimationVote } from '@/lib/types/scrum';

export default function BacklogPage() {
  const { epics, stories, sprints, team, labels, loading } = useScrum();
  const [view, setView] = useState<'epics' | 'stories'>('epics');
  const [filteredStories, setFilteredStories] = useState<UserStory[]>(stories.stories);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [estimatingStory, setEstimatingStory] = useState<UserStory | null>(null);
  const [showDependencies, setShowDependencies] = useState(false);

  // Handle estimation complete
  const handleEstimateComplete = (storyId: string, storyPoints: number, votes: EstimationVote[]) => {
    stories.updateStory(storyId, {
      storyPoints,
      estimation: {
        method: 'planning-poker',
        value: storyPoints,
        votes,
        finalizedAt: new Date().toISOString(),
        finalizedBy: 'Current User', // TODO: Use actual user
      },
    });
    setEstimatingStory(null);
  };

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
              {view === 'stories' && (
                <>
                  <button
                    onClick={() => setShowDependencies(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    View Dependencies
                  </button>
                  <button
                    onClick={() => {
                      // Find first unestimated story
                      const unestimated = stories.stories.find(s => !s.storyPoints || s.storyPoints === 0);
                      if (unestimated) {
                        setEstimatingStory(unestimated);
                      } else {
                        alert('All stories are estimated!');
                      }
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                    </svg>
                    Start Estimation
                  </button>
                </>
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

        {/* Planning Poker Modal */}
        {estimatingStory && (
          <PlanningPoker
            story={estimatingStory}
            teamMembers={team.members}
            onEstimateComplete={handleEstimateComplete}
            onClose={() => setEstimatingStory(null)}
          />
        )}

        {/* Dependency Visualizer Modal */}
        {showDependencies && (
          <DependencyVisualizer
            stories={stories.stories}
            sprints={sprints.sprints}
            epics={epics.epics}
            onClose={() => setShowDependencies(false)}
          />
        )}
      </main>
          </div>
    </ScrumLayout>
  );
}
