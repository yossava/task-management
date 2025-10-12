'use client';

import { useState, useMemo } from 'react';
import type { Sprint, UserStory, TeamMember } from '@/lib/types/scrum';

interface SprintPlanningToolProps {
  sprint: Sprint;
  backlogStories: UserStory[];
  sprintStories: UserStory[];
  teamMembers: TeamMember[];
  onMoveToSprint: (storyId: string, sprintId: string | null) => void;
  onUpdateSprint: (sprintId: string, updates: Partial<Sprint>) => void;
}

export default function SprintPlanningTool({
  sprint,
  backlogStories,
  sprintStories,
  teamMembers,
  onMoveToSprint,
  onUpdateSprint,
}: SprintPlanningToolProps) {
  const [draggedStory, setDraggedStory] = useState<UserStory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [dragOverZone, setDragOverZone] = useState<'backlog' | 'sprint' | null>(null);

  // Calculate sprint capacity
  const sprintCapacity = useMemo(() => {
    const workingDays = Math.ceil(
      (new Date(sprint.endDate).getTime() - new Date(sprint.startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const teamSize = teamMembers.length || 3;
    const avgCapacity = teamMembers.length > 0
      ? teamMembers.reduce((sum, m) => sum + (m.capacity || 0), 0) / teamMembers.length
      : 8;
    return Math.round(teamSize * avgCapacity * (workingDays / 7));
  }, [sprint, teamMembers]);

  // Calculate committed points
  const committedPoints = useMemo(() => {
    return sprintStories.reduce((sum, story) => sum + (story.storyPoints || 0), 0);
  }, [sprintStories]);

  // Calculate utilization percentage
  const utilizationPercent = sprintCapacity > 0
    ? Math.round((committedPoints / sprintCapacity) * 100)
    : 0;

  // Get utilization color
  const getUtilizationColor = () => {
    if (utilizationPercent < 70) return 'bg-blue-600';
    if (utilizationPercent < 90) return 'bg-green-600';
    if (utilizationPercent < 100) return 'bg-orange-500';
    return 'bg-red-600';
  };

  // Filter backlog stories
  const filteredBacklogStories = useMemo(() => {
    return backlogStories.filter((story) => {
      const matchesSearch =
        searchTerm === '' ||
        story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority =
        filterPriority === 'all' || story.priority === filterPriority;
      return matchesSearch && matchesPriority;
    });
  }, [backlogStories, searchTerm, filterPriority]);

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, story: UserStory) => {
    setDraggedStory(story);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedStory(null);
    setDragOverZone(null);
  };

  const handleDragOver = (e: React.DragEvent, zone: 'backlog' | 'sprint') => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverZone(zone);
  };

  const handleDragLeave = () => {
    setDragOverZone(null);
  };

  const handleDrop = (e: React.DragEvent, targetZone: 'backlog' | 'sprint') => {
    e.preventDefault();
    if (!draggedStory) return;

    const targetSprintId = targetZone === 'sprint' ? sprint.id : null;

    // Don't move if already in target zone
    if (
      (targetZone === 'sprint' && draggedStory.sprintId === sprint.id) ||
      (targetZone === 'backlog' && !draggedStory.sprintId)
    ) {
      setDraggedStory(null);
      setDragOverZone(null);
      return;
    }

    onMoveToSprint(draggedStory.id, targetSprintId);
    setDraggedStory(null);
    setDragOverZone(null);
  };

  // Bulk operations
  const handleAddAll = () => {
    const storiesToAdd = filteredBacklogStories.slice(0, 10); // Add up to 10 stories
    storiesToAdd.forEach((story) => onMoveToSprint(story.id, sprint.id));
  };

  const handleClearSprint = () => {
    if (confirm(`Remove all ${sprintStories.length} stories from ${sprint.name}?`)) {
      sprintStories.forEach((story) => onMoveToSprint(story.id, null));
    }
  };

  // Get priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'high':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  // Render story card
  const renderStoryCard = (story: UserStory, zone: 'backlog' | 'sprint') => {
    const isDragging = draggedStory?.id === story.id;

    return (
      <div
        key={story.id}
        draggable
        onDragStart={(e) => handleDragStart(e, story)}
        onDragEnd={handleDragEnd}
        className={`bg-white dark:bg-gray-800 border-2 rounded-lg p-4 cursor-move transition-all ${
          isDragging
            ? 'opacity-50 border-blue-500 scale-95'
            : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600'
        }`}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">
              {story.title}
            </h4>
          </div>
          {story.storyPoints && (
            <span className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full flex items-center justify-center text-sm font-bold">
              {story.storyPoints}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPriorityColor(
              story.priority
            )}`}
          >
            {story.priority}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
            {story.type}
          </span>
          {story.assignee && (
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {story.assignee.name}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Sprint Header with Capacity */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {sprint.name}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {sprint.goal}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Capacity Utilization
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {utilizationPercent}%
            </div>
          </div>
        </div>

        {/* Capacity Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              {committedPoints} / {sprintCapacity} points
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              {sprintStories.length} stories
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all ${getUtilizationColor()}`}
              style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
            />
          </div>
          {utilizationPercent > 100 && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Sprint is over capacity by {committedPoints - sprintCapacity} points
            </p>
          )}
        </div>

        {/* Bulk Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleAddAll}
            disabled={filteredBacklogStories.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Add Top Stories ({Math.min(filteredBacklogStories.length, 10)})
          </button>
          <button
            onClick={handleClearSprint}
            disabled={sprintStories.length === 0}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Clear Sprint
          </button>
        </div>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Backlog Column */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
            {/* Backlog Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Product Backlog
                </h3>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredBacklogStories.length} stories
                </span>
              </div>

              {/* Search and Filters */}
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Search stories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                >
                  <option value="all">All Priorities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            {/* Backlog Drop Zone */}
            <div
              onDragOver={(e) => handleDragOver(e, 'backlog')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'backlog')}
              className={`p-4 min-h-[600px] max-h-[600px] overflow-y-auto space-y-3 transition-colors ${
                dragOverZone === 'backlog'
                  ? 'bg-blue-50 dark:bg-blue-900/10 border-2 border-dashed border-blue-500'
                  : ''
              }`}
            >
              {filteredBacklogStories.length > 0 ? (
                filteredBacklogStories.map((story) => renderStoryCard(story, 'backlog'))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                    <span className="text-3xl">📦</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchTerm || filterPriority !== 'all'
                      ? 'No stories match filters'
                      : 'No backlog stories available'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sprint Column */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
            {/* Sprint Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Sprint Plan
                </h3>
                <div className="text-right">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {sprintStories.length} stories
                  </span>
                  <span className="text-sm text-gray-400 dark:text-gray-500 mx-2">•</span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {committedPoints} points
                  </span>
                </div>
              </div>
            </div>

            {/* Sprint Drop Zone */}
            <div
              onDragOver={(e) => handleDragOver(e, 'sprint')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'sprint')}
              className={`p-4 min-h-[600px] max-h-[600px] overflow-y-auto space-y-3 transition-colors ${
                dragOverZone === 'sprint'
                  ? 'bg-green-50 dark:bg-green-900/10 border-2 border-dashed border-green-500'
                  : ''
              }`}
            >
              {sprintStories.length > 0 ? (
                sprintStories.map((story) => renderStoryCard(story, 'sprint'))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                    <span className="text-3xl">🎯</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    No stories in sprint yet
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Drag stories from backlog to plan your sprint
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-sm text-blue-900 dark:text-blue-200">
            <p className="font-medium mb-1">Sprint Planning Tips:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-300">
              <li>Drag stories between backlog and sprint to plan your iteration</li>
              <li>Monitor capacity utilization to avoid over-commitment</li>
              <li>Use filters to find high-priority stories quickly</li>
              <li>
                Aim for 70-90% capacity utilization for optimal sprint success
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
