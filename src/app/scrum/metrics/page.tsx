'use client';
import ScrumLayout from '@/components/scrum/ScrumLayout';

import { useState } from 'react';
import { useScrum } from '@/lib/hooks/useScrum';
import VelocityChart from '@/components/scrum/VelocityChart';
import BurndownChart from '@/components/scrum/BurndownChart';
import CumulativeFlowChart from '@/components/scrum/CumulativeFlowChart';
import CycleTimeAnalytics from '@/components/scrum/CycleTimeAnalytics';
import TeamPerformanceAnalytics from '@/components/scrum/TeamPerformanceAnalytics';
import CustomReportBuilder from '@/components/scrum/CustomReportBuilder';
import Link from 'next/link';

export default function MetricsPage() {
  const { sprints, stories, team, loading } = useScrum();
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

  const activeSprints = sprints.sprints.filter((s) => s.status === 'active');
  const selectedSprint = selectedSprintId
    ? sprints.sprints.find((s) => s.id === selectedSprintId)
    : activeSprints[0];

  const completedSprints = sprints.sprints.filter((s) => s.status === 'completed');
  const totalStories = stories.stories.length;
  const completedStories = stories.stories.filter((s) => s.status === 'done').length;
  const totalPoints = stories.stories.reduce((sum, s) => sum + (s.storyPoints || 0), 0);
  const completedPoints = stories.stories
    .filter((s) => s.status === 'done')
    .reduce((sum, s) => sum + (s.storyPoints || 0), 0);

  return (
    <ScrumLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Metrics & Analytics
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                Track team performance and sprint progress
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
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Total Stories
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {totalStories}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {completedStories} completed
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Total Points
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {totalPoints}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {completedPoints} completed
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Completed Sprints
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {completedSprints.length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {activeSprints.length} active
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Completion Rate
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {totalStories > 0 ? Math.round((completedStories / totalStories) * 100) : 0}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              across all sprints
            </div>
          </div>
        </div>

        {/* Custom Report Builder */}
        <div className="mb-8">
          <CustomReportBuilder
            sprints={sprints.sprints}
            stories={stories.stories}
            teamMembers={team.members}
          />
        </div>

        {/* Team Performance Analytics */}
        <div className="mb-8">
          <TeamPerformanceAnalytics
            stories={stories.stories}
            teamMembers={team.members}
            sprints={sprints.sprints}
          />
        </div>

        {/* Velocity Chart */}
        <div className="mb-8">
          <VelocityChart sprints={sprints.sprints} stories={stories.stories} />
        </div>

        {/* Burndown Chart */}
        {selectedSprint && (
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Sprint Burndown
              </h2>
              <select
                value={selectedSprintId}
                onChange={(e) => setSelectedSprintId(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              >
                {activeSprints.map((sprint) => (
                  <option key={sprint.id} value={sprint.id}>
                    {sprint.name} (Active)
                  </option>
                ))}
                {completedSprints.slice(-3).map((sprint) => (
                  <option key={sprint.id} value={sprint.id}>
                    {sprint.name} (Completed)
                  </option>
                ))}
              </select>
            </div>
            <BurndownChart sprint={selectedSprint} stories={stories.stories} />
          </div>
        )}

        {/* Cumulative Flow Diagram */}
        {selectedSprint && (
          <div className="mb-8">
            <CumulativeFlowChart sprint={selectedSprint} stories={stories.stories.filter(s => s.sprintId === selectedSprint.id)} />
          </div>
        )}

        {/* Cycle Time & Lead Time Analytics */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Cycle Time & Lead Time Analytics
          </h2>
          <CycleTimeAnalytics stories={stories.stories} sprints={sprints.sprints} />
        </div>

        {!selectedSprint && completedSprints.length === 0 && activeSprints.length === 0 && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📊</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Sprint Data Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create and start a sprint to see burndown charts and analytics
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
