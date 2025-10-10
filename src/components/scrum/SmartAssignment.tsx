'use client';

import { useState, useMemo } from 'react';
import type { UserStory, TeamMember, Sprint } from '@/lib/types/scrum';

interface SmartAssignmentProps {
  sprint: Sprint;
  stories: UserStory[];
  teamMembers: TeamMember[];
  onAssign: (storyId: string, assignees: string[]) => void;
  onClose: () => void;
}

interface AssignmentSuggestion {
  storyId: string;
  member: TeamMember;
  score: number;
  reasons: string[];
}

export default function SmartAssignment({
  sprint,
  stories,
  teamMembers,
  onAssign,
  onClose,
}: SmartAssignmentProps) {
  const [selectedSuggestions, setSelectedSuggestions] = useState<Record<string, string>>({});
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');

  // Calculate current workload per team member
  const memberWorkloads = useMemo(() => {
    return teamMembers.map((member) => {
      const assignedStories = stories.filter((s) =>
        s.assignees.includes(member.name) && s.sprintId === sprint.id
      );
      const totalPoints = assignedStories.reduce(
        (sum, s) => sum + (s.storyPoints || 0),
        0
      );
      const effectiveCapacity = (member.capacity * member.availability) / 100;
      const utilization = effectiveCapacity > 0
        ? Math.round((totalPoints / effectiveCapacity) * 100)
        : 0;

      return {
        member,
        assignedStories,
        totalPoints,
        effectiveCapacity,
        utilization,
        remainingCapacity: Math.max(0, effectiveCapacity - totalPoints),
      };
    });
  }, [teamMembers, stories, sprint.id]);

  // Get unassigned stories in this sprint
  const unassignedStories = useMemo(() => {
    return stories.filter(
      (s) => s.sprintId === sprint.id && s.assignees.length === 0
    );
  }, [stories, sprint.id]);

  // Calculate assignment suggestions
  const suggestions = useMemo(() => {
    const allSuggestions: Record<string, AssignmentSuggestion[]> = {};

    unassignedStories.forEach((story) => {
      const storySuggestions: AssignmentSuggestion[] = [];

      memberWorkloads.forEach((workload) => {
        let score = 100;
        const reasons: string[] = [];

        // Factor 1: Capacity availability (40% weight)
        const capacityScore = workload.remainingCapacity > 0
          ? Math.min(100, (workload.remainingCapacity / (story.storyPoints || 1)) * 100)
          : 0;
        score = score * 0.4 + capacityScore * 0.4;

        if (workload.utilization < 50) {
          reasons.push('🟢 Low workload');
        } else if (workload.utilization < 80) {
          reasons.push('🟡 Moderate workload');
        } else if (workload.utilization < 100) {
          reasons.push('🟠 High workload');
        } else {
          reasons.push('🔴 Over capacity');
          score *= 0.3; // Heavily penalize over-capacity
        }

        // Factor 2: Skills match (30% weight)
        const memberSkills = workload.member.skills || [];
        const storyLabels = story.labels || [];
        const matchingSkills = memberSkills.filter((skill) =>
          storyLabels.some((label) => label.toLowerCase().includes(skill.toLowerCase()))
        );

        const skillScore = memberSkills.length > 0
          ? (matchingSkills.length / memberSkills.length) * 100
          : 50; // Neutral if no skills defined
        score = score * 0.7 + skillScore * 0.3;

        if (matchingSkills.length > 0) {
          reasons.push(`✅ Skills: ${matchingSkills.join(', ')}`);
        }

        // Factor 3: Role match (20% weight)
        let roleScore = 50; // Neutral
        if (story.type === 'bug' && workload.member.role === 'developer') {
          roleScore = 80;
          reasons.push('🔧 Developer for bug fix');
        } else if (story.type === 'feature' && workload.member.role === 'developer') {
          roleScore = 70;
        } else if (story.type === 'technical' && workload.member.role === 'developer') {
          roleScore = 90;
          reasons.push('⚙️ Technical story match');
        }
        score = score * 0.8 + roleScore * 0.2;

        // Factor 4: Story point size vs capacity (10% weight)
        const storyPoints = story.storyPoints || 0;
        const sizeScore = storyPoints > 0 && workload.remainingCapacity >= storyPoints
          ? 100
          : storyPoints === 0
          ? 50
          : 20;
        score = score * 0.9 + sizeScore * 0.1;

        if (storyPoints > 0 && workload.remainingCapacity >= storyPoints) {
          reasons.push(`💪 Can fit ${storyPoints} points`);
        } else if (storyPoints > workload.remainingCapacity) {
          reasons.push(`⚠️ Story too large for capacity`);
        }

        storySuggestions.push({
          storyId: story.id,
          member: workload.member,
          score: Math.round(score),
          reasons,
        });
      });

      // Sort by score descending
      storySuggestions.sort((a, b) => b.score - a.score);
      allSuggestions[story.id] = storySuggestions;
    });

    return allSuggestions;
  }, [unassignedStories, memberWorkloads]);

  // Auto-select best suggestions
  const autoAssignments = useMemo(() => {
    const assignments: Record<string, string> = {};
    const tempWorkloads = { ...memberWorkloads };

    unassignedStories.forEach((story) => {
      const storySuggestions = suggestions[story.id] || [];
      const bestSuggestion = storySuggestions[0];

      if (bestSuggestion && bestSuggestion.score >= 50) {
        assignments[story.id] = bestSuggestion.member.id;
      }
    });

    return assignments;
  }, [unassignedStories, suggestions, memberWorkloads]);

  // Handle apply assignments
  const handleApplyAssignments = () => {
    const assignmentsToApply = mode === 'auto' ? autoAssignments : selectedSuggestions;

    Object.entries(assignmentsToApply).forEach(([storyId, memberId]) => {
      const member = teamMembers.find((m) => m.id === memberId);
      if (member) {
        onAssign(storyId, [member.name]);
      }
    });

    onClose();
  };

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  // Get utilization color
  const getUtilizationColor = (utilization: number) => {
    if (utilization < 50) return 'bg-green-500';
    if (utilization < 80) return 'bg-yellow-500';
    if (utilization < 100) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Smart Story Assignment
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                AI-powered assignment suggestions based on workload, skills, and capacity
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Mode Selector */}
          <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setMode('auto')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                mode === 'auto'
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Auto Assignment (Recommended)
            </button>
            <button
              onClick={() => setMode('manual')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                mode === 'manual'
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Manual Selection
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Team Workload Overview */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
              Team Workload Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {memberWorkloads.map(({ member, totalPoints, effectiveCapacity, utilization, remainingCapacity }) => (
                <div
                  key={member.id}
                  className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-300">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {member.name}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{member.role}</p>
                      </div>
                    </div>
                    <span className={`text-lg font-bold ${getScoreColor(100 - utilization)}`}>
                      {utilization}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden mb-2">
                    <div
                      className={`h-full transition-all ${getUtilizationColor(utilization)}`}
                      style={{ width: `${Math.min(utilization, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>{totalPoints} / {effectiveCapacity} points</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {remainingCapacity} remaining
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Assignment Suggestions */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
              Assignment Suggestions ({unassignedStories.length} unassigned stories)
            </h3>

            {unassignedStories.length > 0 ? (
              <div className="space-y-4">
                {unassignedStories.map((story) => {
                  const storySuggestions = suggestions[story.id] || [];
                  const topSuggestion = storySuggestions[0];
                  const selectedMemberId =
                    mode === 'auto'
                      ? autoAssignments[story.id]
                      : selectedSuggestions[story.id];

                  return (
                    <div
                      key={story.id}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                            {story.title}
                          </h4>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                              {story.type}
                            </span>
                            {story.storyPoints && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                                {story.storyPoints} points
                              </span>
                            )}
                            {story.labels.map((label) => (
                              <span
                                key={label}
                                className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                              >
                                {label}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {mode === 'auto' && topSuggestion && (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-green-900 dark:text-green-300 text-sm">
                                Recommended: {topSuggestion.member.name}
                              </span>
                              <span className={`text-sm font-bold ${getScoreColor(topSuggestion.score)}`}>
                                {topSuggestion.score}% match
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {topSuggestion.reasons.map((reason, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded"
                              >
                                {reason}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {mode === 'manual' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {storySuggestions.slice(0, 6).map((suggestion) => (
                            <button
                              key={suggestion.member.id}
                              onClick={() =>
                                setSelectedSuggestions({
                                  ...selectedSuggestions,
                                  [story.id]:
                                    selectedSuggestions[story.id] === suggestion.member.id
                                      ? ''
                                      : suggestion.member.id,
                                })
                              }
                              className={`p-3 rounded-lg border-2 text-left transition-all ${
                                selectedMemberId === suggestion.member.id
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-sm text-gray-900 dark:text-white">
                                  {suggestion.member.name}
                                </span>
                                <span className={`text-xs font-bold ${getScoreColor(suggestion.score)}`}>
                                  {suggestion.score}%
                                </span>
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
                                {suggestion.reasons.slice(0, 2).map((reason, idx) => (
                                  <div key={idx}>{reason}</div>
                                ))}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl">✅</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  All stories in this sprint are assigned!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {mode === 'auto'
                ? `${Object.keys(autoAssignments).length} stories will be assigned automatically`
                : `${Object.keys(selectedSuggestions).length} stories selected for assignment`}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyAssignments}
                disabled={
                  mode === 'auto'
                    ? Object.keys(autoAssignments).length === 0
                    : Object.keys(selectedSuggestions).length === 0
                }
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Apply Assignments
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
