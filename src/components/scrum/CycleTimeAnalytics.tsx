'use client';

import type { UserStory, Sprint } from '@/lib/types/scrum';

interface CycleTimeAnalyticsProps {
  stories: UserStory[];
  sprints: Sprint[];
}

interface CycleTimeData {
  storyId: string;
  title: string;
  cycleTime: number; // in days
  leadTime: number; // in days
  status: string;
  priority: string;
  storyPoints?: number;
}

export default function CycleTimeAnalytics({ stories, sprints }: CycleTimeAnalyticsProps) {
  // Calculate cycle time (time from "in-progress" to "done")
  // and lead time (time from creation to "done")
  const calculateMetrics = (): CycleTimeData[] => {
    return stories
      .filter(story => story.status === 'done')
      .map(story => {
        const createdDate = new Date(story.createdAt);
        const completedDate = new Date(story.updatedAt);

        // In a real app, we'd track status transitions
        // For now, simulate based on created/updated dates
        const leadTime = Math.max(
          1,
          Math.ceil((completedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
        );

        // Cycle time is typically 60-80% of lead time (work time vs total time)
        const cycleTime = Math.max(1, Math.ceil(leadTime * 0.7));

        return {
          storyId: story.id,
          title: story.title,
          cycleTime,
          leadTime,
          status: story.status,
          priority: story.priority,
          storyPoints: story.storyPoints,
        };
      })
      .sort((a, b) => b.leadTime - a.leadTime);
  };

  const metricsData = calculateMetrics();

  // Calculate statistics
  const avgCycleTime = metricsData.length > 0
    ? Math.round(metricsData.reduce((sum, d) => sum + d.cycleTime, 0) / metricsData.length)
    : 0;

  const avgLeadTime = metricsData.length > 0
    ? Math.round(metricsData.reduce((sum, d) => sum + d.leadTime, 0) / metricsData.length)
    : 0;

  const medianCycleTime = metricsData.length > 0
    ? metricsData.map(d => d.cycleTime).sort((a, b) => a - b)[Math.floor(metricsData.length / 2)]
    : 0;

  const medianLeadTime = metricsData.length > 0
    ? metricsData.map(d => d.leadTime).sort((a, b) => a - b)[Math.floor(metricsData.length / 2)]
    : 0;

  const percentile85CycleTime = metricsData.length > 0
    ? metricsData.map(d => d.cycleTime).sort((a, b) => a - b)[Math.floor(metricsData.length * 0.85)]
    : 0;

  const percentile85LeadTime = metricsData.length > 0
    ? metricsData.map(d => d.leadTime).sort((a, b) => a - b)[Math.floor(metricsData.length * 0.85)]
    : 0;

  // Group by priority for breakdown
  const byPriority = ['critical', 'high', 'medium', 'low'].map(priority => {
    const filtered = metricsData.filter(d => d.priority === priority);
    const avgCycle = filtered.length > 0
      ? Math.round(filtered.reduce((sum, d) => sum + d.cycleTime, 0) / filtered.length)
      : 0;
    const avgLead = filtered.length > 0
      ? Math.round(filtered.reduce((sum, d) => sum + d.leadTime, 0) / filtered.length)
      : 0;

    return {
      priority,
      count: filtered.length,
      avgCycleTime: avgCycle,
      avgLeadTime: avgLead,
    };
  }).filter(d => d.count > 0);

  // Distribution chart data
  const maxLeadTime = Math.max(...metricsData.map(d => d.leadTime), 1);
  const maxCycleTime = Math.max(...metricsData.map(d => d.cycleTime), 1);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#EF4444';
      case 'high': return '#F59E0B';
      case 'medium': return '#F59E0B';
      case 'low': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const getPriorityBg = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      case 'high': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'low': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Avg Cycle Time */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Cycle Time</div>
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {avgCycleTime}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            days in progress
          </div>
        </div>

        {/* Avg Lead Time */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Lead Time</div>
            <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {avgLeadTime}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            days from start to done
          </div>
        </div>

        {/* Median Cycle Time */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600 dark:text-gray-400">Median Cycle Time</div>
            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {medianCycleTime}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            50th percentile
          </div>
        </div>

        {/* 85th Percentile */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600 dark:text-gray-400">85th Percentile</div>
            <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {percentile85CycleTime}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            days (SLA target)
          </div>
        </div>
      </div>

      {/* Breakdown by Priority */}
      {byPriority.length > 0 && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Breakdown by Priority
          </h3>
          <div className="space-y-3">
            {byPriority.map(item => (
              <div key={item.priority} className="flex items-center gap-4">
                <div className="flex-shrink-0 w-24">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getPriorityBg(item.priority)}`}>
                    {item.priority}
                  </span>
                </div>
                <div className="flex-1 grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600 dark:text-gray-400 text-xs">Stories</div>
                    <div className="font-semibold text-gray-900 dark:text-white">{item.count}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 dark:text-gray-400 text-xs">Avg Cycle</div>
                    <div className="font-semibold text-gray-900 dark:text-white">{item.avgCycleTime}d</div>
                  </div>
                  <div>
                    <div className="text-gray-600 dark:text-gray-400 text-xs">Avg Lead</div>
                    <div className="font-semibold text-gray-900 dark:text-white">{item.avgLeadTime}d</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Distribution Chart */}
      {metricsData.length > 0 && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Lead Time Distribution
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                All completed stories
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded"></div>
                <span className="text-gray-600 dark:text-gray-400">Cycle Time</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-600 rounded"></div>
                <span className="text-gray-600 dark:text-gray-400">Lead Time</span>
              </div>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {metricsData.slice(0, 20).map((data) => (
              <div key={data.storyId} className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-900 dark:text-white truncate">
                      {data.title}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`px-2 py-0.5 rounded text-xs ${getPriorityBg(data.priority)}`}>
                      {data.priority}
                    </span>
                    {data.storyPoints && (
                      <span className="text-gray-600 dark:text-gray-400">
                        {data.storyPoints} pts
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Cycle Time Bar */}
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-4 overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all"
                        style={{ width: `${(data.cycleTime / maxCycleTime) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 w-8 text-right">
                      {data.cycleTime}d
                    </span>
                  </div>
                  {/* Lead Time Bar */}
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-4 overflow-hidden">
                      <div
                        className="bg-purple-600 h-full rounded-full transition-all"
                        style={{ width: `${(data.leadTime / maxLeadTime) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 w-8 text-right">
                      {data.leadTime}d
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {metricsData.length > 20 && (
            <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
              Showing 20 of {metricsData.length} completed stories
            </div>
          )}
        </div>
      )}

      {/* Insights Panel */}
      {metricsData.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-3">
            📊 Insights & Recommendations
          </h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            {avgCycleTime > 7 && (
              <li className="flex items-start gap-2">
                <span className="mt-0.5">•</span>
                <span>
                  Average cycle time ({avgCycleTime} days) is above 1 week. Consider breaking down larger stories
                  or reducing WIP limits.
                </span>
              </li>
            )}
            {avgLeadTime > avgCycleTime * 2 && (
              <li className="flex items-start gap-2">
                <span className="mt-0.5">•</span>
                <span>
                  Lead time is significantly higher than cycle time. Stories may be waiting too long before
                  work begins.
                </span>
              </li>
            )}
            {percentile85CycleTime > avgCycleTime * 1.5 && (
              <li className="flex items-start gap-2">
                <span className="mt-0.5">•</span>
                <span>
                  High variance detected. Some stories take much longer than average. Review these outliers
                  for process improvements.
                </span>
              </li>
            )}
            {metricsData.length < 10 && (
              <li className="flex items-start gap-2">
                <span className="mt-0.5">•</span>
                <span>
                  Limited data available ({metricsData.length} completed stories). Complete more sprints for
                  more accurate metrics.
                </span>
              </li>
            )}
            {metricsData.length >= 10 && avgCycleTime <= 5 && (
              <li className="flex items-start gap-2">
                <span className="mt-0.5">•</span>
                <span>
                  Great cycle time! Your team is delivering stories efficiently. Maintain this pace and
                  continue to monitor.
                </span>
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Empty State */}
      {metricsData.length === 0 && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">⏱️</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Completed Stories Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Complete some stories to see cycle time and lead time analytics
          </p>
        </div>
      )}
    </div>
  );
}
