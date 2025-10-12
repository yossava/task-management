'use client';

import { useState, useMemo } from 'react';
import type { TeamMember, UserStory, Sprint, Epic } from '@/lib/types/scrum';

interface WorkloadWidgetProps {
  members: TeamMember[];
  stories: UserStory[];
  sprints: Sprint[];
  epics: Epic[];
}

export default function WorkloadWidget({ members, stories, sprints, epics }: WorkloadWidgetProps) {
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [filterSprint, setFilterSprint] = useState<string>('all');
  const [filterEpic, setFilterEpic] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

  // Filter stories based on selections
  const filteredStories = useMemo(() => {
    return stories.filter(story => {
      // Filter by assignee
      if (filterAssignee !== 'all') {
        const assigneeName = story.assignee?.name;
        if (assigneeName !== filterAssignee) return false;
      }

      // Filter by sprint
      if (filterSprint !== 'all') {
        if (story.sprintId !== filterSprint) return false;
      }

      // Filter by epic
      if (filterEpic !== 'all') {
        if (story.epicId !== filterEpic) return false;
      }

      return true;
    });
  }, [stories, filterAssignee, filterSprint, filterEpic]);

  // Calculate workload per member
  const memberWorkloads = useMemo(() => {
    return members.map(member => {
      // Get all stories assigned to this member
      const memberStories = filteredStories.filter(story =>
        story.assignee?.name === member.name
      );

      // Calculate total points
      const totalPoints = memberStories.reduce((sum, story) =>
        sum + (story.storyPoints || 0), 0
      );

      // Calculate completed points
      const completedPoints = memberStories
        .filter(story => story.status === 'done')
        .reduce((sum, story) => sum + (story.storyPoints || 0), 0);

      // Calculate in-progress points
      const inProgressPoints = memberStories
        .filter(story => story.status === 'in-progress')
        .reduce((sum, story) => sum + (story.storyPoints || 0), 0);

      // Calculate pending points
      const pendingPoints = memberStories
        .filter(story => story.status === 'todo')
        .reduce((sum, story) => sum + (story.storyPoints || 0), 0);

      // Calculate effective capacity (considering availability)
      const effectiveCapacity = (member.capacity * member.availability) / 100;

      // Calculate utilization percentage
      const utilization = effectiveCapacity > 0
        ? Math.round((totalPoints / effectiveCapacity) * 100)
        : 0;

      return {
        member,
        totalPoints,
        completedPoints,
        inProgressPoints,
        pendingPoints,
        effectiveCapacity,
        utilization,
        storyCount: memberStories.length,
      };
    });
  }, [members, filteredStories]);

  // Sort by utilization (highest first)
  const sortedWorkloads = useMemo(() => {
    return [...memberWorkloads].sort((a, b) => b.utilization - a.utilization);
  }, [memberWorkloads]);

  // Calculate team totals
  const teamTotals = useMemo(() => {
    const total = memberWorkloads.reduce((sum, mw) => sum + mw.totalPoints, 0);
    const completed = memberWorkloads.reduce((sum, mw) => sum + mw.completedPoints, 0);
    const inProgress = memberWorkloads.reduce((sum, mw) => sum + mw.inProgressPoints, 0);
    const pending = memberWorkloads.reduce((sum, mw) => sum + mw.pendingPoints, 0);
    const capacity = memberWorkloads.reduce((sum, mw) => sum + mw.effectiveCapacity, 0);
    const avgUtilization = capacity > 0 ? Math.round((total / capacity) * 100) : 0;

    return { total, completed, inProgress, pending, capacity, avgUtilization };
  }, [memberWorkloads]);

  const getUtilizationColor = (utilization: number) => {
    if (utilization > 100) return { bg: 'bg-red-600', text: 'text-red-600 dark:text-red-400', label: 'Over Capacity' };
    if (utilization > 90) return { bg: 'bg-orange-500', text: 'text-orange-600 dark:text-orange-400', label: 'Near Capacity' };
    if (utilization > 70) return { bg: 'bg-green-600', text: 'text-green-600 dark:text-green-400', label: 'Healthy' };
    return { bg: 'bg-blue-600', text: 'text-blue-600 dark:text-blue-400', label: 'Under Utilized' };
  };

  const activeSprints = sprints.filter(s => s.status === 'active' || s.status === 'planned');

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Team Workload
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Real-time capacity utilization across the team
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('chart')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'chart'
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              📊 Chart
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              📋 Table
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Assignee Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Team Member
            </label>
            <select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            >
              <option value="all">All Members</option>
              {members.map(member => (
                <option key={member.id} value={member.name}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sprint Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Sprint
            </label>
            <select
              value={filterSprint}
              onChange={(e) => setFilterSprint(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            >
              <option value="all">All Sprints</option>
              {activeSprints.map(sprint => (
                <option key={sprint.id} value={sprint.id}>
                  {sprint.name}
                </option>
              ))}
            </select>
          </div>

          {/* Epic Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Epic
            </label>
            <select
              value={filterEpic}
              onChange={(e) => setFilterEpic(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            >
              <option value="all">All Epics</option>
              {epics.map(epic => (
                <option key={epic.id} value={epic.id}>
                  {epic.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Team Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-6 bg-gray-50 dark:bg-gray-800/50">
        <div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Team Capacity</div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {Math.round(teamTotals.capacity)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500">story points</div>
        </div>
        <div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Workload</div>
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
            {teamTotals.total}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500">assigned</div>
        </div>
        <div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Completed</div>
          <div className="text-xl font-bold text-green-600 dark:text-green-400">
            {teamTotals.completed}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500">
            {teamTotals.total > 0 ? Math.round((teamTotals.completed / teamTotals.total) * 100) : 0}%
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">In Progress</div>
          <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
            {teamTotals.inProgress}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500">active</div>
        </div>
        <div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Utilization</div>
          <div className={`text-xl font-bold ${getUtilizationColor(teamTotals.avgUtilization).text}`}>
            {teamTotals.avgUtilization}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500">
            {getUtilizationColor(teamTotals.avgUtilization).label}
          </div>
        </div>
      </div>

      {/* Workload Visualization */}
      <div className="p-6">
        {viewMode === 'chart' ? (
          <div className="space-y-4">
            {sortedWorkloads.length > 0 ? (
              sortedWorkloads.map(({ member, totalPoints, completedPoints, inProgressPoints, pendingPoints, effectiveCapacity, utilization, storyCount }) => {
                const colors = getUtilizationColor(utilization);
                const completedPct = totalPoints > 0 ? (completedPoints / totalPoints) * 100 : 0;
                const inProgressPct = totalPoints > 0 ? (inProgressPoints / totalPoints) * 100 : 0;
                const pendingPct = totalPoints > 0 ? (pendingPoints / totalPoints) * 100 : 0;

                return (
                  <div key={member.id} className="space-y-2">
                    {/* Member Info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {member.name}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              member.role === 'product-owner' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' :
                              member.role === 'scrum-master' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                              member.role === 'developer' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                              'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                            }`}>
                              {member.role === 'product-owner' ? 'PO' :
                               member.role === 'scrum-master' ? 'SM' :
                               member.role === 'developer' ? 'Dev' : 'QA'}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {storyCount} {storyCount === 1 ? 'story' : 'stories'} • {Math.round(effectiveCapacity)} pts capacity
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${colors.text}`}>
                          {utilization}%
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {totalPoints} / {Math.round(effectiveCapacity)} pts
                        </div>
                      </div>
                    </div>

                    {/* Workload Bar */}
                    <div className="space-y-1">
                      {/* Capacity Utilization Bar */}
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${colors.bg} transition-all duration-300`}
                          style={{ width: `${Math.min(utilization, 100)}%` }}
                        />
                      </div>

                      {/* Status Breakdown Bar */}
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
                        {completedPoints > 0 && (
                          <div
                            className="h-full bg-green-600"
                            style={{ width: `${completedPct}%` }}
                            title={`${completedPoints} completed`}
                          />
                        )}
                        {inProgressPoints > 0 && (
                          <div
                            className="h-full bg-orange-500"
                            style={{ width: `${inProgressPct}%` }}
                            title={`${inProgressPoints} in progress`}
                          />
                        )}
                        {pendingPoints > 0 && (
                          <div
                            className="h-full bg-gray-400 dark:bg-gray-600"
                            style={{ width: `${pendingPct}%` }}
                            title={`${pendingPoints} pending`}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-500">
                No workload data available for the selected filters
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">Member</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">Stories</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">Total</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">Completed</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">In Progress</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">Pending</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">Capacity</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">Utilization</th>
                </tr>
              </thead>
              <tbody>
                {sortedWorkloads.map(({ member, totalPoints, completedPoints, inProgressPoints, pendingPoints, effectiveCapacity, utilization, storyCount }) => {
                  const colors = getUtilizationColor(utilization);
                  return (
                    <tr key={member.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {member.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white">{storyCount}</td>
                      <td className="py-3 px-4 text-right text-sm font-medium text-gray-900 dark:text-white">{totalPoints}</td>
                      <td className="py-3 px-4 text-right text-sm text-green-600 dark:text-green-400">{completedPoints}</td>
                      <td className="py-3 px-4 text-right text-sm text-orange-600 dark:text-orange-400">{inProgressPoints}</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-600 dark:text-gray-400">{pendingPoints}</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-600 dark:text-gray-400">{Math.round(effectiveCapacity)}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`text-sm font-bold ${colors.text}`}>
                          {utilization}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <span className="font-medium text-gray-700 dark:text-gray-300">Status Legend:</span>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-600 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-400 dark:bg-gray-600 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Pending</span>
          </div>
          <span className="ml-4 font-medium text-gray-700 dark:text-gray-300">Utilization:</span>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-600 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">&lt;70%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-600 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">70-90%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">90-100%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-600 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">&gt;100%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
