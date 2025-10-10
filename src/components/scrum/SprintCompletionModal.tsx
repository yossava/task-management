'use client';

import { useState, useMemo } from 'react';
import type { UserStory, Sprint } from '@/lib/types/scrum';

interface SprintCompletionModalProps {
  sprint: Sprint;
  stories: UserStory[];
  availableSprints: Sprint[];
  onComplete: (incompleteStoryActions: { storyId: string; targetSprintId: string | null }[]) => void;
  onCancel: () => void;
}

export default function SprintCompletionModal({
  sprint,
  stories,
  availableSprints,
  onComplete,
  onCancel,
}: SprintCompletionModalProps) {
  // Get incomplete stories for this sprint
  const incompleteStories = useMemo(() => {
    return stories.filter(
      story => story.sprintId === sprint.id && story.status !== 'done'
    );
  }, [stories, sprint.id]);

  // Initialize selections: auto-select next sprint or backlog for all incomplete stories
  const nextSprint = availableSprints
    .filter(s => s.status === 'planned')
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0];

  const [storySelections, setStorySelections] = useState<Record<string, string | null>>(
    incompleteStories.reduce((acc, story) => {
      acc[story.id] = nextSprint?.id || null; // null = backlog
      return acc;
    }, {} as Record<string, string | null>)
  );

  const [selectAll, setSelectAll] = useState(true);

  // Calculate sprint metrics
  const completedStories = stories.filter(
    story => story.sprintId === sprint.id && story.status === 'done'
  );
  const completedPoints = completedStories.reduce(
    (sum, s) => sum + (s.storyPoints || 0), 0
  );
  const incompletePoints = incompleteStories.reduce(
    (sum, s) => sum + (s.storyPoints || 0), 0
  );
  const totalPoints = completedPoints + incompletePoints;
  const completionRate = totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 100;

  const handleToggleAll = () => {
    if (selectAll) {
      // Deselect all - move to backlog
      const newSelections: Record<string, string | null> = {};
      incompleteStories.forEach(story => {
        newSelections[story.id] = null;
      });
      setStorySelections(newSelections);
    } else {
      // Select all - move to next sprint or backlog
      const newSelections: Record<string, string | null> = {};
      incompleteStories.forEach(story => {
        newSelections[story.id] = nextSprint?.id || null;
      });
      setStorySelections(newSelections);
    }
    setSelectAll(!selectAll);
  };

  const handleStorySelection = (storyId: string, targetSprintId: string | null) => {
    setStorySelections(prev => ({
      ...prev,
      [storyId]: targetSprintId,
    }));
  };

  const handleComplete = () => {
    const actions = Object.entries(storySelections).map(([storyId, targetSprintId]) => ({
      storyId,
      targetSprintId,
    }));
    onComplete(actions);
  };

  // Count stories by destination
  const destinationCounts = useMemo(() => {
    const counts: Record<string, number> = { backlog: 0 };
    Object.values(storySelections).forEach(targetId => {
      if (targetId === null) {
        counts.backlog++;
      } else {
        counts[targetId] = (counts[targetId] || 0) + 1;
      }
    });
    return counts;
  }, [storySelections]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Complete Sprint: {sprint.name}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Review sprint results and move incomplete stories
              </p>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Sprint Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Completed Stories</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {completedStories.length}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Incomplete Stories</div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {incompleteStories.length}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Velocity</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {completedPoints}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">of {totalPoints} pts</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Completion Rate</div>
              <div className={`text-2xl font-bold ${
                completionRate >= 90 ? 'text-green-600 dark:text-green-400' :
                completionRate >= 70 ? 'text-yellow-600 dark:text-yellow-400' :
                'text-orange-600 dark:text-orange-400'
              }`}>
                {completionRate}%
              </div>
            </div>
          </div>
        </div>

        {/* Incomplete Stories */}
        {incompleteStories.length > 0 ? (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Incomplete Stories ({incompleteStories.length})
              </h3>
              <button
                onClick={handleToggleAll}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                {selectAll ? 'Move All to Next Sprint' : 'Move All to Backlog'}
              </button>
            </div>

            <div className="space-y-3 mb-6">
              {incompleteStories.map(story => (
                <div
                  key={story.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {story.title}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          story.priority === 'critical' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                          story.priority === 'high' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' :
                          story.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                          'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        }`}>
                          {story.priority}
                        </span>
                        {story.storyPoints && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                            {story.storyPoints} pts
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                        <span>Status: <span className="font-medium">{story.status}</span></span>
                        {story.assignees.length > 0 && (
                          <span>Assignees: <span className="font-medium">{story.assignees.join(', ')}</span></span>
                        )}
                      </div>
                    </div>

                    {/* Destination Selection */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Move to:</span>
                      <select
                        value={storySelections[story.id] || ''}
                        onChange={(e) => handleStorySelection(story.id, e.target.value || null)}
                        className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      >
                        <option value="">Backlog</option>
                        {availableSprints
                          .filter(s => s.status === 'planned' || s.status === 'active')
                          .map(s => (
                            <option key={s.id} value={s.id}>
                              {s.name} {s.status === 'active' ? '(Active)' : ''}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Movement Summary */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                Movement Summary:
              </h4>
              <div className="flex flex-wrap gap-3 text-xs text-blue-800 dark:text-blue-400">
                {destinationCounts.backlog > 0 && (
                  <span>
                    <span className="font-medium">{destinationCounts.backlog}</span> to Backlog
                  </span>
                )}
                {availableSprints
                  .filter(s => destinationCounts[s.id] > 0)
                  .map(s => (
                    <span key={s.id}>
                      <span className="font-medium">{destinationCounts[s.id]}</span> to {s.name}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🎉</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              All Stories Completed!
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Great job! Every story in this sprint was completed successfully.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex gap-3">
          <button
            onClick={handleComplete}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Complete Sprint
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
