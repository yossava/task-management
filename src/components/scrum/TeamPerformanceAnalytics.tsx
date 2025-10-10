'use client';

import { useMemo, useState } from 'react';
import type { UserStory, TeamMember, Sprint } from '@/lib/types/scrum';

interface TeamPerformanceAnalyticsProps {
  stories: UserStory[];
  teamMembers: TeamMember[];
  sprints: Sprint[];
}

interface MemberPerformance {
  member: TeamMember;
  totalStories: number;
  completedStories: number;
  totalPoints: number;
  completedPoints: number;
  completionRate: number;
  velocity: number;
  avgStoryPoints: number;
  activeSprints: number;
  trend: 'up' | 'down' | 'stable';
}

export default function TeamPerformanceAnalytics({
  stories,
  teamMembers,
  sprints,
}: TeamPerformanceAnalyticsProps) {
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'all' | 'recent' | 'current'>('recent');

  // Filter sprints by time range
  const filteredSprints = useMemo(() => {
    if (timeRange === 'current') {
      return sprints.filter(s => s.status === 'active');
    } else if (timeRange === 'recent') {
      // Last 3 sprints
      return sprints
        .filter(s => s.status === 'completed' || s.status === 'active')
        .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
        .slice(0, 3);
    }
    return sprints;
  }, [sprints, timeRange]);

  const filteredSprintIds = filteredSprints.map(s => s.id);

  // Calculate member performance
  const memberPerformance = useMemo((): MemberPerformance[] => {
    return teamMembers.map((member) => {
      // Get member's stories in filtered sprints
      const memberStories = stories.filter(
        s => s.assignees.includes(member.name) &&
        s.sprintId &&
        filteredSprintIds.includes(s.sprintId)
      );

      const completedStories = memberStories.filter(s => s.status === 'done');
      const totalPoints = memberStories.reduce((sum, s) => sum + (s.storyPoints || 0), 0);
      const completedPoints = completedStories.reduce((sum, s) => sum + (s.storyPoints || 0), 0);

      const completionRate = memberStories.length > 0
        ? (completedStories.length / memberStories.length) * 100
        : 0;

      // Calculate velocity (points per sprint)
      const sprintsWorked = new Set(memberStories.map(s => s.sprintId)).size;
      const velocity = sprintsWorked > 0 ? completedPoints / sprintsWorked : 0;

      // Average story points
      const avgStoryPoints = completedStories.length > 0
        ? completedPoints / completedStories.length
        : 0;

      // Trend calculation (comparing last 2 sprints)
      const recentSprints = filteredSprints.slice(0, 2);
      let trend: 'up' | 'down' | 'stable' = 'stable';

      if (recentSprints.length === 2) {
        const lastSprintPoints = stories.filter(
          s => s.assignees.includes(member.name) &&
          s.sprintId === recentSprints[0].id &&
          s.status === 'done'
        ).reduce((sum, s) => sum + (s.storyPoints || 0), 0);

        const prevSprintPoints = stories.filter(
          s => s.assignees.includes(member.name) &&
          s.sprintId === recentSprints[1].id &&
          s.status === 'done'
        ).reduce((sum, s) => sum + (s.storyPoints || 0), 0);

        if (lastSprintPoints > prevSprintPoints * 1.1) trend = 'up';
        else if (lastSprintPoints < prevSprintPoints * 0.9) trend = 'down';
      }

      return {
        member,
        totalStories: memberStories.length,
        completedStories: completedStories.length,
        totalPoints,
        completedPoints,
        completionRate,
        velocity,
        avgStoryPoints,
        activeSprints: sprintsWorked,
        trend,
      };
    });
  }, [teamMembers, stories, filteredSprints, filteredSprintIds]);

  // Team aggregates
  const teamStats = useMemo(() => {
    const totalStories = memberPerformance.reduce((sum, m) => sum + m.totalStories, 0);
    const totalCompleted = memberPerformance.reduce((sum, m) => sum + m.completedStories, 0);
    const totalPoints = memberPerformance.reduce((sum, m) => sum + m.totalPoints, 0);
    const completedPoints = memberPerformance.reduce((sum, m) => sum + m.completedPoints, 0);

    return {
      totalStories,
      totalCompleted,
      totalPoints,
      completedPoints,
      avgCompletionRate: totalStories > 0 ? (totalCompleted / totalStories) * 100 : 0,
      avgVelocity: teamMembers.length > 0
        ? memberPerformance.reduce((sum, m) => sum + m.velocity, 0) / teamMembers.length
        : 0,
    };
  }, [memberPerformance, teamMembers.length]);

  // Top performers
  const topPerformers = useMemo(() => {
    return [...memberPerformance]
      .sort((a, b) => b.completedPoints - a.completedPoints)
      .slice(0, 3);
  }, [memberPerformance]);

  // Selected member details
  const selectedPerformance = selectedMemberId
    ? memberPerformance.find(m => m.member.id === selectedMemberId)
    : null;

  // Get trend icon and color
  const getTrendIndicator = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return { icon: '📈', color: 'text-green-600 dark:text-green-400', label: 'Improving' };
      case 'down':
        return { icon: '📉', color: 'text-red-600 dark:text-red-400', label: 'Declining' };
      default:
        return { icon: '➡️', color: 'text-gray-600 dark:text-gray-400', label: 'Stable' };
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              Team Performance Analytics
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Individual and team productivity metrics
            </p>
          </div>

          {/* Time Range Filter */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          >
            <option value="current">Current Sprint</option>
            <option value="recent">Last 3 Sprints</option>
            <option value="all">All Time</option>
          </select>
        </div>

        {/* Team Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">Total Stories</div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-300">
              {teamStats.totalStories}
            </div>
            <div className="text-xs text-blue-700 dark:text-blue-400 mt-1">
              {teamStats.totalCompleted} completed
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="text-xs text-green-600 dark:text-green-400 mb-1">Completion Rate</div>
            <div className="text-2xl font-bold text-green-900 dark:text-green-300">
              {Math.round(teamStats.avgCompletionRate)}%
            </div>
            <div className="text-xs text-green-700 dark:text-green-400 mt-1">
              team average
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <div className="text-xs text-purple-600 dark:text-purple-400 mb-1">Story Points</div>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-300">
              {teamStats.completedPoints}
            </div>
            <div className="text-xs text-purple-700 dark:text-purple-400 mt-1">
              of {teamStats.totalPoints}
            </div>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
            <div className="text-xs text-orange-600 dark:text-orange-400 mb-1">Avg Velocity</div>
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-300">
              {Math.round(teamStats.avgVelocity)}
            </div>
            <div className="text-xs text-orange-700 dark:text-orange-400 mt-1">
              points/sprint
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Top Performers */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            🏆 Top Performers
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topPerformers.map((perf, idx) => (
              <div
                key={perf.member.id}
                className={`border-2 rounded-lg p-4 ${
                  idx === 0
                    ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10'
                    : idx === 1
                    ? 'border-gray-400 bg-gray-50 dark:bg-gray-800'
                    : 'border-orange-500 bg-orange-50 dark:bg-orange-900/10'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-3xl">
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {perf.member.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {perf.member.role}
                    </p>
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Completed:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {perf.completedStories} stories
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Points:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {perf.completedPoints}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Velocity:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {Math.round(perf.velocity)}/sprint
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Member Performance Table */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
            Team Member Performance
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Member
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Stories
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Completion
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Points
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Velocity
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Avg Points
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Trend
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {memberPerformance.map((perf) => {
                  const trendInfo = getTrendIndicator(perf.trend);
                  return (
                    <tr
                      key={perf.member.id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300">
                            {perf.member.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white text-sm">
                              {perf.member.name}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {perf.member.role}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white">
                        {perf.completedStories}/{perf.totalStories}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`text-sm font-medium ${
                            perf.completionRate >= 80
                              ? 'text-green-600 dark:text-green-400'
                              : perf.completionRate >= 60
                              ? 'text-yellow-600 dark:text-yellow-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {Math.round(perf.completionRate)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white">
                        {perf.completedPoints}/{perf.totalPoints}
                      </td>
                      <td className="py-3 px-4 text-right text-sm font-medium text-gray-900 dark:text-white">
                        {Math.round(perf.velocity)}
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-gray-600 dark:text-gray-400">
                        {perf.avgStoryPoints > 0 ? perf.avgStoryPoints.toFixed(1) : '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 text-xs ${trendInfo.color}`}>
                          <span>{trendInfo.icon}</span>
                          <span>{trendInfo.label}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() =>
                            setSelectedMemberId(
                              selectedMemberId === perf.member.id ? null : perf.member.id
                            )
                          }
                          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                        >
                          {selectedMemberId === perf.member.id ? 'Hide' : 'Details'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Member Details Panel */}
        {selectedPerformance && (
          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-blue-900 dark:text-blue-300">
                {selectedPerformance.member.name} - Detailed Performance
              </h3>
              <button
                onClick={() => setSelectedMemberId(null)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-blue-700 dark:text-blue-400 mb-1">Total Stories</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                  {selectedPerformance.totalStories}
                </p>
              </div>
              <div>
                <p className="text-xs text-blue-700 dark:text-blue-400 mb-1">Completed</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                  {selectedPerformance.completedStories}
                </p>
              </div>
              <div>
                <p className="text-xs text-blue-700 dark:text-blue-400 mb-1">Story Points</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                  {selectedPerformance.completedPoints}
                </p>
              </div>
              <div>
                <p className="text-xs text-blue-700 dark:text-blue-400 mb-1">Sprints Active</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                  {selectedPerformance.activeSprints}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Completion Rate</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${selectedPerformance.completionRate}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {Math.round(selectedPerformance.completionRate)}%
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Velocity</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {Math.round(selectedPerformance.velocity)} pts/sprint
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Avg Story Size</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {selectedPerformance.avgStoryPoints.toFixed(1)} points
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
