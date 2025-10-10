'use client';

import { useState, useMemo } from 'react';
import type { Sprint, Epic, UserStory } from '@/lib/types/scrum';

interface ReleasePlanningProps {
  sprints: Sprint[];
  epics: Epic[];
  stories: UserStory[];
}

interface Release {
  id: string;
  name: string;
  version: string;
  description: string;
  startDate: string;
  targetDate: string;
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  sprintIds: string[];
  epicIds: string[];
  goals: string[];
  progress: number;
}

interface Milestone {
  id: string;
  releaseId: string;
  name: string;
  description: string;
  date: string;
  status: 'upcoming' | 'in-progress' | 'completed';
  epicIds: string[];
}

export default function ReleasePlanning({
  sprints,
  epics,
  stories,
}: ReleasePlanningProps) {
  // Sample releases and milestones (in real app, these would come from props/service)
  const [releases, setReleases] = useState<Release[]>([
    {
      id: 'release-1',
      name: 'v1.0 - MVP Launch',
      version: '1.0.0',
      description: 'Initial product launch with core features',
      startDate: '2024-01-01',
      targetDate: '2024-03-31',
      status: 'in-progress',
      sprintIds: sprints.slice(0, 6).map(s => s.id),
      epicIds: epics.slice(0, 2).map(e => e.id),
      goals: ['Launch core product', 'Achieve 1000 users', 'Stable performance'],
      progress: 65,
    },
    {
      id: 'release-2',
      name: 'v2.0 - Feature Expansion',
      version: '2.0.0',
      description: 'Major feature additions and improvements',
      startDate: '2024-04-01',
      targetDate: '2024-06-30',
      status: 'planned',
      sprintIds: sprints.slice(6, 12).map(s => s.id),
      epicIds: epics.slice(2, 4).map(e => e.id),
      goals: ['Add advanced features', 'Improve UX', 'Scale to 10K users'],
      progress: 0,
    },
  ]);

  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      id: 'milestone-1',
      releaseId: 'release-1',
      name: 'Beta Release',
      description: 'Internal beta testing',
      date: '2024-02-15',
      status: 'completed',
      epicIds: epics.slice(0, 1).map(e => e.id),
    },
    {
      id: 'milestone-2',
      releaseId: 'release-1',
      name: 'Public Launch',
      description: 'Go live to public',
      date: '2024-03-31',
      status: 'in-progress',
      epicIds: epics.slice(0, 2).map(e => e.id),
    },
    {
      id: 'milestone-3',
      releaseId: 'release-2',
      name: 'v2.0 Feature Complete',
      description: 'All features implemented',
      date: '2024-06-15',
      status: 'upcoming',
      epicIds: epics.slice(2, 4).map(e => e.id),
    },
  ]);

  const [selectedReleaseId, setSelectedReleaseId] = useState<string>(releases[0]?.id || '');
  const [showNewReleaseForm, setShowNewReleaseForm] = useState(false);
  const [showNewMilestoneForm, setShowNewMilestoneForm] = useState(false);

  // New release form
  const [newReleaseName, setNewReleaseName] = useState('');
  const [newReleaseVersion, setNewReleaseVersion] = useState('');
  const [newReleaseDescription, setNewReleaseDescription] = useState('');
  const [newReleaseStartDate, setNewReleaseStartDate] = useState('');
  const [newReleaseTargetDate, setNewReleaseTargetDate] = useState('');

  // New milestone form
  const [newMilestoneName, setNewMilestoneName] = useState('');
  const [newMilestoneDescription, setNewMilestoneDescription] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState('');

  const selectedRelease = releases.find((r) => r.id === selectedReleaseId);

  // Calculate release metrics
  const releaseMetrics = useMemo(() => {
    if (!selectedRelease) return null;

    const releaseStories = stories.filter((s) =>
      selectedRelease.sprintIds.includes(s.sprintId || '')
    );
    const totalStories = releaseStories.length;
    const completedStories = releaseStories.filter((s) => s.status === 'done').length;
    const totalPoints = releaseStories.reduce((sum, s) => sum + (s.storyPoints || 0), 0);
    const completedPoints = releaseStories
      .filter((s) => s.status === 'done')
      .reduce((sum, s) => sum + (s.storyPoints || 0), 0);

    const daysTotal = Math.ceil(
      (new Date(selectedRelease.targetDate).getTime() -
        new Date(selectedRelease.startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const daysElapsed = Math.max(
      0,
      Math.ceil(
        (Date.now() - new Date(selectedRelease.startDate).getTime()) / (1000 * 60 * 60 * 24)
      )
    );
    const daysRemaining = Math.max(0, daysTotal - daysElapsed);
    const timeProgress = Math.min(100, (daysElapsed / daysTotal) * 100);

    const releaseMilestones = milestones.filter((m) => m.releaseId === selectedRelease.id);
    const completedMilestones = releaseMilestones.filter((m) => m.status === 'completed').length;

    return {
      totalStories,
      completedStories,
      totalPoints,
      completedPoints,
      completionRate: totalStories > 0 ? (completedStories / totalStories) * 100 : 0,
      pointsRate: totalPoints > 0 ? (completedPoints / totalPoints) * 100 : 0,
      daysTotal,
      daysElapsed,
      daysRemaining,
      timeProgress,
      totalMilestones: releaseMilestones.length,
      completedMilestones,
      milestonesRate:
        releaseMilestones.length > 0 ? (completedMilestones / releaseMilestones.length) * 100 : 0,
    };
  }, [selectedRelease, stories, milestones]);

  // Get status color
  const getStatusColor = (status: Release['status'] | Milestone['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      case 'in-progress':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
      case 'planned':
      case 'upcoming':
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800';
      case 'cancelled':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800';
    }
  };

  // Add new release
  const addRelease = () => {
    if (newReleaseName && newReleaseVersion) {
      const newRelease: Release = {
        id: `release-${Date.now()}`,
        name: newReleaseName,
        version: newReleaseVersion,
        description: newReleaseDescription,
        startDate: newReleaseStartDate || new Date().toISOString().split('T')[0],
        targetDate: newReleaseTargetDate || new Date().toISOString().split('T')[0],
        status: 'planned',
        sprintIds: [],
        epicIds: [],
        goals: [],
        progress: 0,
      };
      setReleases((prev) => [...prev, newRelease]);
      setSelectedReleaseId(newRelease.id);
      setShowNewReleaseForm(false);
      // Reset form
      setNewReleaseName('');
      setNewReleaseVersion('');
      setNewReleaseDescription('');
      setNewReleaseStartDate('');
      setNewReleaseTargetDate('');
    }
  };

  // Add new milestone
  const addMilestone = () => {
    if (newMilestoneName && newMilestoneDate && selectedReleaseId) {
      const newMilestone: Milestone = {
        id: `milestone-${Date.now()}`,
        releaseId: selectedReleaseId,
        name: newMilestoneName,
        description: newMilestoneDescription,
        date: newMilestoneDate,
        status: 'upcoming',
        epicIds: [],
      };
      setMilestones((prev) => [...prev, newMilestone]);
      setShowNewMilestoneForm(false);
      // Reset form
      setNewMilestoneName('');
      setNewMilestoneDescription('');
      setNewMilestoneDate('');
    }
  };

  // Update release status
  const updateReleaseStatus = (releaseId: string, status: Release['status']) => {
    setReleases((prev) =>
      prev.map((r) => (r.id === releaseId ? { ...r, status } : r))
    );
  };

  // Update milestone status
  const updateMilestoneStatus = (milestoneId: string, status: Milestone['status']) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === milestoneId ? { ...m, status } : m))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              Release Planning
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Plan and track product releases
            </p>
          </div>

          <button
            onClick={() => setShowNewReleaseForm(!showNewReleaseForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            + New Release
          </button>
        </div>

        {/* Release Selector */}
        <div className="flex items-center gap-4">
          <select
            value={selectedReleaseId}
            onChange={(e) => setSelectedReleaseId(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          >
            {releases.map((release) => (
              <option key={release.id} value={release.id}>
                {release.name} ({release.version}) - {release.status}
              </option>
            ))}
          </select>

          {selectedRelease && (
            <select
              value={selectedRelease.status}
              onChange={(e) => updateReleaseStatus(selectedRelease.id, e.target.value as Release['status'])}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="planned">Planned</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          )}
        </div>

        {/* New Release Form */}
        {showNewReleaseForm && (
          <div className="mt-4 p-4 border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
              Create New Release
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                value={newReleaseName}
                onChange={(e) => setNewReleaseName(e.target.value)}
                placeholder="Release name (e.g., v3.0 - Major Update)"
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <input
                type="text"
                value={newReleaseVersion}
                onChange={(e) => setNewReleaseVersion(e.target.value)}
                placeholder="Version (e.g., 3.0.0)"
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <input
                type="date"
                value={newReleaseStartDate}
                onChange={(e) => setNewReleaseStartDate(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <input
                type="date"
                value={newReleaseTargetDate}
                onChange={(e) => setNewReleaseTargetDate(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <textarea
                value={newReleaseDescription}
                onChange={(e) => setNewReleaseDescription(e.target.value)}
                placeholder="Description..."
                rows={2}
                className="md:col-span-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
              />
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={addRelease}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
              >
                Create Release
              </button>
              <button
                onClick={() => setShowNewReleaseForm(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Release Details */}
      {selectedRelease && releaseMetrics && (
        <>
          {/* Metrics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Progress</div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {Math.round(releaseMetrics.completionRate)}%
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {releaseMetrics.completedStories}/{releaseMetrics.totalStories} stories
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all"
                  style={{ width: `${releaseMetrics.completionRate}%` }}
                />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Story Points</div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {releaseMetrics.completedPoints}/{releaseMetrics.totalPoints}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {Math.round(releaseMetrics.pointsRate)}% complete
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className="bg-green-600 h-full rounded-full transition-all"
                  style={{ width: `${releaseMetrics.pointsRate}%` }}
                />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Time Remaining</div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {releaseMetrics.daysRemaining}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                days (of {releaseMetrics.daysTotal})
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className={`h-full rounded-full transition-all ${
                    releaseMetrics.timeProgress > releaseMetrics.completionRate
                      ? 'bg-red-600'
                      : 'bg-yellow-600'
                  }`}
                  style={{ width: `${Math.min(100, releaseMetrics.timeProgress)}%` }}
                />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Milestones</div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {releaseMetrics.completedMilestones}/{releaseMetrics.totalMilestones}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {Math.round(releaseMetrics.milestonesRate)}% complete
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className="bg-purple-600 h-full rounded-full transition-all"
                  style={{ width: `${releaseMetrics.milestonesRate}%` }}
                />
              </div>
            </div>
          </div>

          {/* Release Info */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  {selectedRelease.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedRelease.description}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedRelease.status)}`}>
                {selectedRelease.status.charAt(0).toUpperCase() + selectedRelease.status.slice(1)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Version</div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {selectedRelease.version}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Timeline</div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {new Date(selectedRelease.startDate).toLocaleDateString()} -{' '}
                  {new Date(selectedRelease.targetDate).toLocaleDateString()}
                </div>
              </div>
            </div>

            {selectedRelease.goals.length > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Release Goals
                </div>
                <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  {selectedRelease.goals.map((goal, idx) => (
                    <li key={idx}>{goal}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Milestones */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Milestones</h3>
              <button
                onClick={() => setShowNewMilestoneForm(!showNewMilestoneForm)}
                className="px-3 py-1 bg-purple-600 text-white rounded-lg font-medium text-sm hover:bg-purple-700 transition-colors"
              >
                + Add Milestone
              </button>
            </div>

            {/* New Milestone Form */}
            {showNewMilestoneForm && (
              <div className="mb-4 p-4 border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                  Create New Milestone
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  <input
                    type="text"
                    value={newMilestoneName}
                    onChange={(e) => setNewMilestoneName(e.target.value)}
                    placeholder="Milestone name..."
                    className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  <input
                    type="date"
                    value={newMilestoneDate}
                    onChange={(e) => setNewMilestoneDate(e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  <textarea
                    value={newMilestoneDescription}
                    onChange={(e) => setNewMilestoneDescription(e.target.value)}
                    placeholder="Description..."
                    rows={2}
                    className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                  />
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={addMilestone}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors text-sm"
                  >
                    Create Milestone
                  </button>
                  <button
                    onClick={() => setShowNewMilestoneForm(false)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Milestones Timeline */}
            <div className="space-y-3">
              {milestones
                .filter((m) => m.releaseId === selectedReleaseId)
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((milestone, idx) => (
                  <div
                    key={milestone.id}
                    className="flex items-start gap-4 p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    {/* Timeline indicator */}
                    <div className="flex flex-col items-center pt-1">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          milestone.status === 'completed'
                            ? 'bg-green-600'
                            : milestone.status === 'in-progress'
                            ? 'bg-blue-600 animate-pulse'
                            : 'bg-gray-400'
                        }`}
                      />
                      {idx <
                        milestones.filter((m) => m.releaseId === selectedReleaseId).length - 1 && (
                        <div className="w-0.5 h-16 bg-gray-300 dark:bg-gray-700 mt-1" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {milestone.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {milestone.description}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            {new Date(milestone.date).toLocaleDateString()}
                          </p>
                        </div>
                        <select
                          value={milestone.status}
                          onChange={(e) =>
                            updateMilestoneStatus(milestone.id, e.target.value as Milestone['status'])
                          }
                          className={`px-2 py-1 text-xs rounded ${getStatusColor(milestone.status)} border-0`}
                        >
                          <option value="upcoming">Upcoming</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}

              {milestones.filter((m) => m.releaseId === selectedReleaseId).length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                  No milestones yet. Add your first milestone above.
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* No releases state */}
      {releases.length === 0 && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🚀</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Releases Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create your first release to start planning
          </p>
        </div>
      )}
    </div>
  );
}
