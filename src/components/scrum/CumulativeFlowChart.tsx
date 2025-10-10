'use client';

import type { Sprint, UserStory } from '@/lib/types/scrum';

interface CumulativeFlowChartProps {
  sprint: Sprint;
  stories: UserStory[];
}

export default function CumulativeFlowChart({ sprint, stories }: CumulativeFlowChartProps) {
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

  // Generate CFD data
  const cfdData = Array.from({ length: daysElapsed + 1 }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    // Simulate story flow through states
    // In real app, this would come from actual historical data
    const progress = i / totalDays;
    const totalStories = stories.length;

    return {
      day: i,
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      done: Math.floor(totalStories * progress * 0.7),
      testing: Math.floor(totalStories * progress * 0.15),
      review: Math.floor(totalStories * progress * 0.1),
      inProgress: Math.floor(totalStories * Math.max(0, (1 - progress) * 0.3)),
      todo: Math.floor(totalStories * Math.max(0, (1 - progress) * 0.5)),
      backlog: Math.floor(totalStories * Math.max(0, (1 - progress) * 0.2)),
    };
  });

  const statuses = [
    { key: 'done', label: 'Done', color: '#10B981' },
    { key: 'testing', label: 'Testing', color: '#EC4899' },
    { key: 'review', label: 'Review', color: '#8B5CF6' },
    { key: 'inProgress', label: 'In Progress', color: '#F59E0B' },
    { key: 'todo', label: 'To Do', color: '#3B82F6' },
    { key: 'backlog', label: 'Backlog', color: '#6B7280' },
  ];

  const maxStories = Math.max(...cfdData.map(d =>
    d.done + d.testing + d.review + d.inProgress + d.todo + d.backlog
  ));

  // Calculate stacked heights for each day
  const getStackedData = () => {
    return cfdData.map(day => {
      let cumulative = 0;
      return statuses.map(status => {
        const value = day[status.key as keyof typeof day] as number;
        const bottom = cumulative;
        cumulative += value;
        return {
          status: status.key,
          value,
          bottom,
          top: cumulative,
        };
      });
    });
  };

  const stackedData = getStackedData();

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Cumulative Flow Diagram
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {sprint.name} - Work distribution over time
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-600 dark:text-gray-400">Total Stories</div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {stories.length}
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="relative h-80 border-l-2 border-b-2 border-gray-300 dark:border-gray-700">
        {/* Y-axis labels */}
        <div className="absolute -left-12 top-0 h-full flex flex-col justify-between text-xs text-gray-600 dark:text-gray-400">
          <span>{maxStories}</span>
          <span>{Math.round(maxStories * 0.75)}</span>
          <span>{Math.round(maxStories * 0.5)}</span>
          <span>{Math.round(maxStories * 0.25)}</span>
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

        {/* SVG for stacked area chart */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {statuses.map((status, statusIndex) => {
            const points = stackedData.map((day, dayIndex) => {
              const statusData = day.find(s => s.status === status.key);
              if (!statusData) return null;

              const x = (dayIndex / Math.max(daysElapsed, 1)) * 100;
              const yBottom = (1 - statusData.bottom / maxStories) * 100;
              const yTop = (1 - statusData.top / maxStories) * 100;

              return { x, yBottom, yTop };
            }).filter(Boolean) as { x: number; yBottom: number; yTop: number }[];

            // Create path for area
            const pathData = [
              `M 0 100`, // Start at bottom left
              ...points.map((p) => `L ${p.x} ${p.yBottom}`), // Bottom line
              ...points.slice().reverse().map((p) => `L ${p.x} ${p.yTop}`), // Top line (reversed)
              `Z`, // Close path
            ].join(' ');

            return (
              <path
                key={status.key}
                d={pathData}
                fill={status.color}
                fillOpacity={0.8}
                stroke={status.color}
                strokeWidth="0.2"
              />
            );
          })}
        </svg>

        {/* X-axis labels */}
        <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-gray-600 dark:text-gray-400">
          {cfdData.length > 0 && (
            <>
              <span>{cfdData[0].date}</span>
              {cfdData.length > 2 && (
                <span>{cfdData[Math.floor(cfdData.length / 2)].date}</span>
              )}
              <span>{cfdData[cfdData.length - 1].date}</span>
            </>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 flex flex-wrap items-center gap-4 text-sm">
        {statuses.map((status) => (
          <div key={status.key} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: status.color }}
            />
            <span className="text-gray-600 dark:text-gray-400">{status.label}</span>
          </div>
        ))}
      </div>

      {/* Insights */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Flow Insights
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-gray-600 dark:text-gray-400">Current Done</div>
            <div className="text-lg font-semibold text-green-600 dark:text-green-400">
              {cfdData[cfdData.length - 1]?.done || 0} stories
            </div>
          </div>
          <div>
            <div className="text-gray-600 dark:text-gray-400">In Progress</div>
            <div className="text-lg font-semibold text-orange-600 dark:text-orange-400">
              {(cfdData[cfdData.length - 1]?.inProgress || 0) +
               (cfdData[cfdData.length - 1]?.review || 0) +
               (cfdData[cfdData.length - 1]?.testing || 0)} stories
            </div>
          </div>
          <div>
            <div className="text-gray-600 dark:text-gray-400">Remaining</div>
            <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
              {(cfdData[cfdData.length - 1]?.todo || 0) +
               (cfdData[cfdData.length - 1]?.backlog || 0)} stories
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
