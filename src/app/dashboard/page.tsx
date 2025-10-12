'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Board } from '@/lib/types';
import { AnalyticsService, AnalyticsSummary } from '@/lib/services/analyticsService';
import { useBoardsOptimized } from '@/hooks/useBoardsOptimized';
import StatCard from '@/components/dashboard/StatCard';
import TaskCompletionChart from '@/components/dashboard/TaskCompletionChart';
import PriorityDistributionChart from '@/components/dashboard/PriorityDistributionChart';
import UpcomingDeadlines from '@/components/dashboard/UpcomingDeadlines';
import ProductivityStreak from '@/components/dashboard/ProductivityStreak';

export default function DashboardPage() {
  const { boards, isLoading: boardsLoading } = useBoardsOptimized();

  // Use useMemo to avoid recalculating analytics on every render
  const analytics = useMemo(() => {
    if (boardsLoading) return null;

    try {
      return AnalyticsService.getAnalyticsSummary(boards);
    } catch (error) {
      console.error('Error calculating analytics:', error);
      return null;
    }
  }, [boards, boardsLoading]);

  if (boardsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Failed to load analytics data</p>
        </div>
      </div>
    );
  }

  const { taskStats, priorityStats, boardStats, upcomingDeadlines, productivityStreak, timeSeriesData } = analytics;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Overview of your tasks and productivity
            </p>
          </div>
          <Link
            href="/boards"
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg font-medium"
          >
            View Boards
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Tasks"
            value={taskStats.total}
            subtitle={`${taskStats.completed} completed`}
            color="blue"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          />

          <StatCard
            title="Completion Rate"
            value={`${taskStats.completionRate.toFixed(1)}%`}
            subtitle={`${taskStats.total - taskStats.completed} remaining`}
            color="green"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />

          <StatCard
            title="Overdue"
            value={taskStats.overdue}
            subtitle="Need attention"
            color="red"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />

          <StatCard
            title="Due Soon"
            value={taskStats.dueSoon}
            subtitle="Next 7 days"
            color="yellow"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TaskCompletionChart data={timeSeriesData} />
          <PriorityDistributionChart data={priorityStats} />
        </div>

        {/* Deadlines and Streak Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UpcomingDeadlines deadlines={upcomingDeadlines} />
          <ProductivityStreak streak={productivityStreak} />
        </div>

        {/* Boards Overview */}
        {boardStats.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Boards Overview</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Task distribution across boards</p>
              </div>
            </div>

            <div className="space-y-3">
              {boardStats.slice(0, 5).map((board) => (
                <div
                  key={board.id}
                  className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
                >
                  <div
                    className="w-1 h-12 rounded-full flex-shrink-0"
                    style={{ backgroundColor: board.color || '#3B82F6' }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 dark:text-white truncate">
                      {board.title}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {board.completedCount} of {board.taskCount} tasks completed
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {board.completionRate.toFixed(0)}%
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        completion
                      </div>
                    </div>
                    <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all"
                        style={{ width: `${board.completionRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {boardStats.length > 5 && (
              <div className="mt-4 text-center">
                <Link
                  href="/boards"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  View all {boardStats.length} boards →
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {boards.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No boards yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first board to start tracking tasks and see analytics
            </p>
            <Link
              href="/boards"
              className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg font-medium"
            >
              Create Board
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
