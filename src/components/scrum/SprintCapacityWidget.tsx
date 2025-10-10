'use client';

import { useState, useEffect } from 'react';
import type { Sprint, UserStory, TeamMember, ScrumSettings } from '@/lib/types/scrum';
import { SettingsService } from '@/lib/services/scrumService';

interface SprintCapacityWidgetProps {
  sprint: Sprint;
  stories: UserStory[];
  teamMembers?: TeamMember[];
}

export default function SprintCapacityWidget({ sprint, stories, teamMembers = [] }: SprintCapacityWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [settings, setSettings] = useState<ScrumSettings | null>(null);

  useEffect(() => {
    const currentSettings = SettingsService.get();
    setSettings(currentSettings);
  }, []);

  if (!settings) return null;

  // Calculate sprint duration in working days
  const startDate = new Date(sprint.startDate);
  const endDate = new Date(sprint.endDate);
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  // Count working days
  let workingDays = 0;
  for (let i = 0; i <= totalDays; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    if (settings.workingDays.includes(date.getDay())) {
      workingDays++;
    }
  }

  // Calculate team capacity
  const teamSize = teamMembers.length || 3; // Default to 3 if no team members
  const avgMemberCapacity = teamMembers.length > 0
    ? teamMembers.reduce((sum, m) => sum + (m.capacity || 0), 0) / teamMembers.length
    : 8; // Default 8 points per member per sprint

  const totalCapacity = teamSize * avgMemberCapacity * (workingDays / 5); // Normalized to weeks

  // Calculate committed points
  const sprintStories = stories.filter(s => s.sprintId === sprint.id);
  const committedPoints = sprintStories.reduce((sum, s) => sum + (s.storyPoints || 0), 0);

  // Calculate completed points
  const completedPoints = sprintStories
    .filter(s => s.status === 'done')
    .reduce((sum, s) => sum + (s.storyPoints || 0), 0);

  // Calculate utilization
  const utilizationPercent = totalCapacity > 0 ? Math.round((committedPoints / totalCapacity) * 100) : 0;
  const completionPercent = committedPoints > 0 ? Math.round((completedPoints / committedPoints) * 100) : 0;

  // Determine capacity status
  const getCapacityStatus = () => {
    if (utilizationPercent > 100) return { color: 'red', label: 'Over Capacity', icon: '⚠️' };
    if (utilizationPercent > 90) return { color: 'orange', label: 'Near Capacity', icon: '⚡' };
    if (utilizationPercent > 70) return { color: 'green', label: 'Good', icon: '✅' };
    return { color: 'blue', label: 'Under Capacity', icon: 'ℹ️' };
  };

  const status = getCapacityStatus();

  const getUtilizationColor = () => {
    if (utilizationPercent > 100) return 'bg-red-600';
    if (utilizationPercent > 90) return 'bg-orange-500';
    if (utilizationPercent > 70) return 'bg-green-600';
    return 'bg-blue-600';
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
      {/* Compact Header View */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-4 flex-1">
          {/* Capacity Icon */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <span className="text-xl">{status.icon}</span>
            </div>
          </div>

          {/* Capacity Bar */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Sprint Capacity
              </span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                status.color === 'red' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                status.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300' :
                status.color === 'green' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
              }`}>
                {status.label}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`absolute left-0 top-0 h-full ${getUtilizationColor()} transition-all duration-300`}
                style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
              />
              {utilizationPercent > 100 && (
                <div
                  className="absolute left-0 top-0 h-full bg-red-600/30 border-l-2 border-red-600"
                  style={{ left: '100%', width: `${Math.min(utilizationPercent - 100, 50)}%` }}
                />
              )}
            </div>

            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {committedPoints} / {Math.round(totalCapacity)} pts
              </span>
              <span className={`text-xs font-semibold ${
                utilizationPercent > 100 ? 'text-red-600 dark:text-red-400' :
                utilizationPercent > 90 ? 'text-orange-600 dark:text-orange-400' :
                'text-gray-700 dark:text-gray-300'
              }`}>
                {utilizationPercent}%
              </span>
            </div>
          </div>

          {/* Expand Icon */}
          <div className="flex-shrink-0">
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-800 p-4 space-y-4">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Team Size</div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">{teamSize}</div>
              <div className="text-xs text-gray-500 dark:text-gray-500">members</div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Working Days</div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">{workingDays}</div>
              <div className="text-xs text-gray-500 dark:text-gray-500">days</div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Completed</div>
              <div className="text-xl font-bold text-green-600 dark:text-green-400">{completedPoints}</div>
              <div className="text-xs text-gray-500 dark:text-gray-500">{completionPercent}% done</div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Remaining</div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {committedPoints - completedPoints}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">points</div>
            </div>
          </div>

          {/* Team Member Breakdown */}
          {teamMembers.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Team Capacity Breakdown
              </h4>
              <div className="space-y-2">
                {teamMembers.map(member => {
                  const memberStories = sprintStories.filter(s => s.assignees.includes(member.name));
                  const memberPoints = memberStories.reduce((sum, s) => sum + (s.storyPoints || 0), 0);
                  const memberCapacity = member.capacity * (workingDays / 5);
                  const memberUtilization = memberCapacity > 0 ? Math.round((memberPoints / memberCapacity) * 100) : 0;

                  return (
                    <div key={member.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {member.name}
                          </span>
                          <span className="text-xs text-gray-600 dark:text-gray-400 ml-2">
                            {memberPoints} / {Math.round(memberCapacity)} pts
                          </span>
                        </div>
                        <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              memberUtilization > 100 ? 'bg-red-600' :
                              memberUtilization > 90 ? 'bg-orange-500' :
                              'bg-green-600'
                            }`}
                            style={{ width: `${Math.min(memberUtilization, 100)}%` }}
                          />
                        </div>
                      </div>
                      <span className={`text-xs font-medium flex-shrink-0 ${
                        memberUtilization > 100 ? 'text-red-600 dark:text-red-400' :
                        memberUtilization > 90 ? 'text-orange-600 dark:text-orange-400' :
                        'text-green-600 dark:text-green-400'
                      }`}>
                        {memberUtilization}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {utilizationPercent > 100 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <span className="text-red-600 dark:text-red-400 mt-0.5">⚠️</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-red-900 dark:text-red-300 mb-1">
                    Sprint Over-Committed
                  </div>
                  <p className="text-xs text-red-800 dark:text-red-400">
                    The team has committed {committedPoints - Math.round(totalCapacity)} points beyond capacity.
                    Consider moving some stories back to the backlog or extending the sprint.
                  </p>
                </div>
              </div>
            </div>
          )}

          {utilizationPercent < 70 && sprint.status === 'active' && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">ℹ️</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
                    Capacity Available
                  </div>
                  <p className="text-xs text-blue-800 dark:text-blue-400">
                    The team has {Math.round(totalCapacity - committedPoints)} story points of available capacity.
                    Consider pulling more stories from the backlog.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
