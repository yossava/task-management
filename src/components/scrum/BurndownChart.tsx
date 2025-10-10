'use client';

import type { Sprint, UserStory } from '@/lib/types/scrum';

interface BurndownChartProps {
  sprint: Sprint;
  stories: UserStory[];
}

export default function BurndownChart({ sprint, stories }: BurndownChartProps) {
  const sprintStories = stories.filter((s) => s.sprintId === sprint.id);
  const totalPoints = sprintStories.reduce((sum, s) => sum + (s.storyPoints || 0), 0);
  const completedPoints = sprintStories
    .filter((s) => s.status === 'done')
    .reduce((sum, s) => sum + (s.storyPoints || 0), 0);
  const remainingPoints = totalPoints - completedPoints;

  const startDate = new Date(sprint.startDate);
  const endDate = new Date(sprint.endDate);
  const today = new Date();

  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysElapsed = Math.max(
    0,
    Math.min(
      totalDays,
      Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    )
  );

  // Generate ideal burndown line
  const idealBurndown = Array.from({ length: totalDays + 1 }, (_, i) => ({
    day: i,
    points: totalPoints - (totalPoints / totalDays) * i,
  }));

  // Simulate actual burndown (in real app, this would come from daily snapshots)
  const actualBurndown = Array.from({ length: daysElapsed + 1 }, (_, i) => ({
    day: i,
    points: totalPoints - (completedPoints / Math.max(daysElapsed, 1)) * i,
  }));

  const maxPoints = Math.max(totalPoints, 10);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Sprint Burndown
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {sprint.name} - Day {daysElapsed} of {totalDays}
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-xs text-gray-600 dark:text-gray-400">Remaining</div>
            <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
              {remainingPoints}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-600 dark:text-gray-400">Completed</div>
            <div className="text-xl font-bold text-green-600 dark:text-green-400">
              {completedPoints}
            </div>
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="relative h-64 border-l-2 border-b-2 border-gray-300 dark:border-gray-700">
        {/* Y-axis labels */}
        <div className="absolute -left-12 top-0 h-full flex flex-col justify-between text-xs text-gray-600 dark:text-gray-400">
          <span>{maxPoints}</span>
          <span>{Math.round(maxPoints * 0.75)}</span>
          <span>{Math.round(maxPoints * 0.5)}</span>
          <span>{Math.round(maxPoints * 0.25)}</span>
          <span>0</span>
        </div>

        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="border-t border-gray-200 dark:border-gray-800"
            />
          ))}
        </div>

        {/* Ideal burndown line */}
        <svg className="absolute inset-0 w-full h-full overflow-visible">
          <polyline
            fill="none"
            stroke="#9CA3AF"
            strokeWidth="2"
            strokeDasharray="4"
            points={idealBurndown
              .map(
                (point) =>
                  `${(point.day / totalDays) * 100}%,${
                    100 - (point.points / maxPoints) * 100
                  }%`
              )
              .join(' ')}
          />
        </svg>

        {/* Actual burndown line */}
        <svg className="absolute inset-0 w-full h-full overflow-visible">
          <polyline
            fill="none"
            stroke="#3B82F6"
            strokeWidth="3"
            points={actualBurndown
              .map(
                (point) =>
                  `${(point.day / totalDays) * 100}%,${
                    100 - (point.points / maxPoints) * 100
                  }%`
              )
              .join(' ')}
          />
          {/* Current point marker */}
          {daysElapsed > 0 && (
            <circle
              cx={`${(daysElapsed / totalDays) * 100}%`}
              cy={`${100 - (remainingPoints / maxPoints) * 100}%`}
              r="4"
              fill="#3B82F6"
            />
          )}
        </svg>

        {/* X-axis labels */}
        <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-gray-600 dark:text-gray-400">
          <span>Day 0</span>
          <span>Day {Math.round(totalDays / 2)}</span>
          <span>Day {totalDays}</span>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-gray-400 border-dashed"></div>
          <span className="text-gray-600 dark:text-gray-400">Ideal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-blue-600"></div>
          <span className="text-gray-600 dark:text-gray-400">Actual</span>
        </div>
      </div>

      {/* Status */}
      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-sm">
          {remainingPoints > idealBurndown[daysElapsed]?.points ? (
            <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Behind schedule - {Math.round(remainingPoints - idealBurndown[daysElapsed].points)} points above ideal</span>
            </div>
          ) : remainingPoints < idealBurndown[daysElapsed]?.points ? (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Ahead of schedule - {Math.round(idealBurndown[daysElapsed].points - remainingPoints)} points below ideal</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>On track - Following ideal burndown</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
