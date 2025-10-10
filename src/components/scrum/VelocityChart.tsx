'use client';

import type { Sprint, UserStory } from '@/lib/types/scrum';

interface VelocityChartProps {
  sprints: Sprint[];
  stories: UserStory[];
}

export default function VelocityChart({ sprints, stories }: VelocityChartProps) {
  // Get completed sprints
  const completedSprints = sprints
    .filter((s) => s.status === 'completed')
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(-6); // Last 6 sprints

  const getSprintVelocity = (sprintId: string) => {
    const sprintStories = stories.filter(
      (s) => s.sprintId === sprintId && s.status === 'done'
    );
    return sprintStories.reduce((sum, s) => sum + (s.storyPoints || 0), 0);
  };

  const velocities = completedSprints.map((sprint) => ({
    sprint,
    velocity: getSprintVelocity(sprint.id),
    commitment: sprint.commitment,
  }));

  const averageVelocity =
    velocities.length > 0
      ? Math.round(velocities.reduce((sum, v) => sum + v.velocity, 0) / velocities.length)
      : 0;

  const maxValue = Math.max(
    ...velocities.map((v) => Math.max(v.velocity, v.commitment)),
    10
  );

  if (completedSprints.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">📊</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No Velocity Data Yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Complete at least one sprint to see velocity trends
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Velocity Trend
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Last {completedSprints.length} completed sprints
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600 dark:text-gray-400">Average Velocity</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {averageVelocity}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="space-y-4">
        {velocities.map(({ sprint, velocity, commitment }) => (
          <div key={sprint.id}>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium text-gray-900 dark:text-white">
                {sprint.name}
              </span>
              <div className="flex items-center gap-4">
                <span className="text-gray-600 dark:text-gray-400">
                  Commitment: {commitment}
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  Velocity: {velocity}
                </span>
              </div>
            </div>
            <div className="relative h-8 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
              {/* Commitment bar (background) */}
              <div
                className="absolute top-0 left-0 h-full bg-blue-200 dark:bg-blue-900/40 transition-all"
                style={{ width: `${(commitment / maxValue) * 100}%` }}
              />
              {/* Velocity bar (foreground) */}
              <div
                className={`absolute top-0 left-0 h-full transition-all ${
                  velocity >= commitment
                    ? 'bg-green-500'
                    : 'bg-yellow-500'
                }`}
                style={{ width: `${(velocity / maxValue) * 100}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-semibold text-gray-900 dark:text-white">
                  {velocity} / {commitment}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-200 dark:bg-blue-900/40 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">Commitment</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">Velocity (Met/Exceeded)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">Velocity (Under)</span>
        </div>
      </div>
    </div>
  );
}
