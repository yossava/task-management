'use client';

import { useState, useMemo } from 'react';
import type { UserStory, StoryBlocker, Sprint } from '@/lib/types/scrum';

interface BlockerTrackerProps {
  stories: UserStory[];
  sprint?: Sprint;
  onUpdateStory?: (id: string, data: Partial<UserStory>) => void;
}

export default function BlockerTracker({ stories, sprint, onUpdateStory }: BlockerTrackerProps) {
  const [filterStatus, setFilterStatus] = useState<StoryBlocker['status'] | 'all'>('all');
  const [filterSeverity, setFilterSeverity] = useState<StoryBlocker['severity'] | 'all'>('all');
  const [selectedStory, setSelectedStory] = useState<UserStory | null>(null);
  const [showBlockerModal, setShowBlockerModal] = useState(false);

  // Get stories with blockers
  const blockedStories = useMemo(() => {
    let filtered = stories.filter(story => story.blocker);

    // Apply sprint filter if provided
    if (sprint) {
      filtered = filtered.filter(story => story.sprintId === sprint.id);
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(story => story.blocker?.status === filterStatus);
    }

    // Apply severity filter
    if (filterSeverity !== 'all') {
      filtered = filtered.filter(story => story.blocker?.severity === filterSeverity);
    }

    return filtered;
  }, [stories, sprint, filterStatus, filterSeverity]);

  // Calculate blocker statistics
  const stats = useMemo(() => {
    const allBlockers = stories.filter(s => s.blocker);
    const totalBlockers = allBlockers.length;
    const openBlockers = allBlockers.filter(s => s.blocker?.status === 'open').length;
    const inProgressBlockers = allBlockers.filter(s => s.blocker?.status === 'in-progress').length;
    const criticalBlockers = allBlockers.filter(s => s.blocker?.severity === 'critical').length;

    // Calculate average blocker age
    const now = new Date().getTime();
    const blockerAges = allBlockers
      .filter(s => s.blocker?.status !== 'resolved')
      .map(s => {
        const createdAt = new Date(s.blocker!.createdAt).getTime();
        return Math.floor((now - createdAt) / (1000 * 60 * 60 * 24)); // days
      });
    const avgAge = blockerAges.length > 0
      ? Math.round(blockerAges.reduce((sum, age) => sum + age, 0) / blockerAges.length)
      : 0;

    return {
      total: totalBlockers,
      open: openBlockers,
      inProgress: inProgressBlockers,
      critical: criticalBlockers,
      avgAge,
    };
  }, [stories]);

  const getSeverityColor = (severity: StoryBlocker['severity']) => {
    switch (severity) {
      case 'critical': return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', border: 'border-red-300 dark:border-red-700' };
      case 'high': return { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-300 dark:border-orange-700' };
      case 'medium': return { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', border: 'border-yellow-300 dark:border-yellow-700' };
      case 'low': return { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-300 dark:border-blue-700' };
    }
  };

  const getStatusColor = (status: StoryBlocker['status']) => {
    switch (status) {
      case 'open': return 'text-red-600 dark:text-red-400';
      case 'in-progress': return 'text-orange-600 dark:text-orange-400';
      case 'resolved': return 'text-green-600 dark:text-green-400';
    }
  };

  const getBlockerAge = (createdAt: string) => {
    const now = new Date().getTime();
    const created = new Date(createdAt).getTime();
    const days = Math.floor((now - created) / (1000 * 60 * 60 * 24));
    return days;
  };

  const handleResolveBlocker = (story: UserStory) => {
    if (!story.blocker || !onUpdateStory) return;

    const updatedBlocker: StoryBlocker = {
      ...story.blocker,
      status: 'resolved',
      resolvedAt: new Date().toISOString(),
    };

    onUpdateStory(story.id, {
      blocker: updatedBlocker,
    });
  };

  const handleUpdateBlockerStatus = (story: UserStory, status: StoryBlocker['status']) => {
    if (!story.blocker || !onUpdateStory) return;

    const updatedBlocker: StoryBlocker = {
      ...story.blocker,
      status,
      ...(status === 'resolved' && { resolvedAt: new Date().toISOString() }),
    };

    onUpdateStory(story.id, {
      blocker: updatedBlocker,
    });
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              🚨 Blocker Tracker
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Track and manage blockers affecting your sprint
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Blockers</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Open</div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.open}</div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">In Progress</div>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.inProgress}</div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Critical</div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.critical}</div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Avg Age</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.avgAge}<span className="text-sm ml-1">d</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mt-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Severity
            </label>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value as any)}
              className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            >
              <option value="all">All Severity</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Blocker List */}
      <div className="p-6">
        {blockedStories.length > 0 ? (
          <div className="space-y-3">
            {blockedStories.map(story => {
              const blocker = story.blocker!;
              const severityColors = getSeverityColor(blocker.severity);
              const age = getBlockerAge(blocker.createdAt);

              return (
                <div
                  key={story.id}
                  className={`border ${severityColors.border} rounded-lg p-4 ${severityColors.bg}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Story Title */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {story.title}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${severityColors.bg} ${severityColors.text} font-medium`}>
                          {blocker.severity.toUpperCase()}
                        </span>
                      </div>

                      {/* Blocker Description */}
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                        {blocker.description}
                      </p>

                      {/* Metadata */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <span>Status:</span>
                          <span className={`font-medium ${getStatusColor(blocker.status)}`}>
                            {blocker.status === 'open' ? '🔴 Open' :
                             blocker.status === 'in-progress' ? '🟡 In Progress' :
                             '🟢 Resolved'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>Age:</span>
                          <span className="font-medium">
                            {age} {age === 1 ? 'day' : 'days'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>Reported by:</span>
                          <span className="font-medium">{blocker.reportedBy}</span>
                        </div>
                        {blocker.assignedTo && (
                          <div className="flex items-center gap-1">
                            <span>Assigned to:</span>
                            <span className="font-medium">{blocker.assignedTo}</span>
                          </div>
                        )}
                      </div>

                      {/* Resolution (if resolved) */}
                      {blocker.status === 'resolved' && blocker.resolution && (
                        <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-xs text-green-800 dark:text-green-300">
                          <span className="font-medium">Resolution:</span> {blocker.resolution}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {onUpdateStory && blocker.status !== 'resolved' && (
                      <div className="flex gap-2">
                        {blocker.status === 'open' && (
                          <button
                            onClick={() => handleUpdateBlockerStatus(story, 'in-progress')}
                            className="px-3 py-1.5 text-xs bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                          >
                            Start Work
                          </button>
                        )}
                        <button
                          onClick={() => handleResolveBlocker(story)}
                          className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Resolve
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Blockers Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filterStatus !== 'all' || filterSeverity !== 'all'
                ? 'No blockers match the selected filters'
                : 'All clear! No stories are currently blocked'}
            </p>
          </div>
        )}
      </div>

      {/* Health Indicator */}
      {stats.total > 0 && (
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              Sprint Health:
            </span>
            <div className="flex items-center gap-2">
              {stats.critical > 0 ? (
                <span className="text-red-600 dark:text-red-400 font-bold flex items-center gap-1">
                  🚨 Critical Blockers Present
                </span>
              ) : stats.open > 3 ? (
                <span className="text-orange-600 dark:text-orange-400 font-bold flex items-center gap-1">
                  ⚠️ Multiple Open Blockers
                </span>
              ) : stats.open > 0 ? (
                <span className="text-yellow-600 dark:text-yellow-400 font-bold flex items-center gap-1">
                  ⚡ Some Blockers to Address
                </span>
              ) : (
                <span className="text-green-600 dark:text-green-400 font-bold flex items-center gap-1">
                  ✅ All Blockers Resolved
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
