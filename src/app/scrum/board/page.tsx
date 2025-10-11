'use client';
import ScrumLayout from '@/components/scrum/ScrumLayout';

import { useState } from 'react';
import { useScrum } from '@/lib/hooks/useScrum';
import ScrumBoardView from '@/components/scrum/ScrumBoardView';
import StoryList from '@/components/scrum/StoryList';
import SprintCapacityWidget from '@/components/scrum/SprintCapacityWidget';
import BlockerTracker from '@/components/scrum/BlockerTracker';
import SprintHealthDashboard from '@/components/scrum/SprintHealthDashboard';
import PredictiveCompletion from '@/components/scrum/PredictiveCompletion';
import Link from 'next/link';

export default function BoardPage() {
  const { sprints, stories, epics, team, loading } = useScrum();
  const [selectedSprintId, setSelectedSprintId] = useState<string>('all');
  const [editingStory, setEditingStory] = useState<any>(null);
  const [showStoryModal, setShowStoryModal] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const activeSprints = sprints.sprints.filter((s) => s.status === 'active');
  const selectedSprint =
    selectedSprintId === 'all'
      ? undefined
      : sprints.sprints.find((s) => s.id === selectedSprintId);

  const handleEditStory = (story: any) => {
    setEditingStory(story);
    setShowStoryModal(true);
  };

  const handleCloseModal = () => {
    setShowStoryModal(false);
    setEditingStory(null);
  };

  return (
    <ScrumLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Scrum Board
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  Manage your sprint workflow
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Sprint Selector */}
              <select
                value={selectedSprintId}
                onChange={(e) => setSelectedSprintId(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              >
                <option value="all">All Stories</option>
                {activeSprints.length > 0 && (
                  <optgroup label="Active Sprints">
                    {activeSprints.map((sprint) => (
                      <option key={sprint.id} value={sprint.id}>
                        {sprint.name}
                      </option>
                    ))}
                  </optgroup>
                )}
                {sprints.sprints.filter((s) => s.status === 'planned').length > 0 && (
                  <optgroup label="Planned Sprints">
                    {sprints.sprints
                      .filter((s) => s.status === 'planned')
                      .map((sprint) => (
                        <option key={sprint.id} value={sprint.id}>
                          {sprint.name}
                        </option>
                      ))}
                  </optgroup>
                )}
              </select>

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
        {/* Sprint Health Dashboard */}
        {selectedSprint && (
          <SprintHealthDashboard
            sprint={selectedSprint}
            stories={stories.stories}
          />
        )}

        {/* Predictive Completion */}
        {selectedSprint && selectedSprint.status === 'active' && (
          <PredictiveCompletion
            sprint={selectedSprint}
            stories={stories.stories}
            historicalSprints={sprints.sprints.filter(s => s.status === 'completed')}
            historicalStories={stories.stories}
          />
        )}

        {/* Sprint Capacity Widget */}
        {selectedSprint && (
          <SprintCapacityWidget
            sprint={selectedSprint}
            stories={stories.stories}
            teamMembers={team.members}
          />
        )}

        {/* Blocker Tracker */}
        <BlockerTracker
          stories={stories.stories}
          sprint={selectedSprint}
          onUpdateStory={stories.updateStory}
        />

        {stories.stories.length > 0 ? (
          <ScrumBoardView
            stories={stories.stories}
            epics={epics.epics}
            sprint={selectedSprint}
            onUpdateStory={stories.updateStory}
            onEditStory={handleEditStory}
          />
        ) : (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📋</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Stories Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first user story to get started with the board
            </p>
            <Link
              href="/scrum/backlog"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Go to Backlog
            </Link>
          </div>
        )}
      </main>

      {/* Story Edit Modal */}
      {showStoryModal && editingStory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Edit Story
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <svg
                    className="w-6 h-6 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {editingStory.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    {editingStory.description}
                  </p>
                </div>
                <div className="pt-4">
                  <Link
                    href="/scrum/backlog"
                    onClick={handleCloseModal}
                    className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Edit in Backlog
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
          </div>
    </ScrumLayout>
  );
}
