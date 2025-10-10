'use client';

import { useState, useMemo } from 'react';
import { useScrum } from '@/lib/hooks/useScrum';
import SprintList from '@/components/scrum/SprintList';
import SprintPlanningTool from '@/components/scrum/SprintPlanningTool';
import Link from 'next/link';

export default function PlanningPage() {
  const { sprints, stories, team, loading } = useScrum();
  const [view, setView] = useState<'sprints' | 'planning'>('sprints');
  const [selectedSprintId, setSelectedSprintId] = useState<string>('');

  // Get sprints available for planning (planned or active)
  const plannableSprints = useMemo(() => {
    return sprints.sprints.filter(s => s.status === 'planned' || s.status === 'active');
  }, [sprints.sprints]);

  // Auto-select first plannable sprint if not selected
  const currentSprint = useMemo(() => {
    if (selectedSprintId) {
      return plannableSprints.find(s => s.id === selectedSprintId);
    }
    return plannableSprints[0];
  }, [plannableSprints, selectedSprintId]);

  // Filter stories into backlog and sprint
  const backlogStories = useMemo(() => {
    return stories.stories.filter(s => !s.sprintId);
  }, [stories.stories]);

  const sprintStories = useMemo(() => {
    if (!currentSprint) return [];
    return stories.stories.filter(s => s.sprintId === currentSprint.id);
  }, [stories.stories, currentSprint]);

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
          <>
            {/* Sprint Selector */}
            {plannableSprints.length > 1 && (
              <div className="mb-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Sprint to Plan
                </label>
                <select
                  value={selectedSprintId || (currentSprint?.id || '')}
                  onChange={(e) => setSelectedSprintId(e.target.value)}
                  className="w-full md:w-96 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                >
                  {plannableSprints.map((sprint) => (
                    <option key={sprint.id} value={sprint.id}>
                      {sprint.name} ({sprint.status})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sprint Planning Tool */}
            {currentSprint ? (
              <SprintPlanningTool
                sprint={currentSprint}
                backlogStories={backlogStories}
                sprintStories={sprintStories}
                teamMembers={team.members}
                onMoveToSprint={stories.moveToSprint}
                onUpdateSprint={sprints.updateSprint}
              />
            ) : (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">📋</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No Sprints Available for Planning
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Create a sprint to start planning your iteration
                </p>
                <button
                  onClick={() => setView('sprints')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Go to Sprints
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
