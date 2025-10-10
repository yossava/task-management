'use client';

import { useMemo } from 'react';
import type { Sprint, UserStory, SprintMetrics } from '@/lib/types/scrum';

interface SprintHealthDashboardProps {
  sprint: Sprint;
  stories: UserStory[];
  metrics?: SprintMetrics;
}

interface HealthIndicator {
  id: string;
  name: string;
  score: number; // 0-100
  status: 'healthy' | 'warning' | 'critical';
  message: string;
  recommendations: string[];
}

export default function SprintHealthDashboard({
  sprint,
  stories,
  metrics,
}: SprintHealthDashboardProps) {
  // Calculate sprint health indicators
  const healthIndicators = useMemo((): HealthIndicator[] => {
    const indicators: HealthIndicator[] = [];
    const sprintStories = stories.filter((s) => s.sprintId === sprint.id);

    // Get sprint dates
    const now = new Date().getTime();
    const startTime = new Date(sprint.startDate).getTime();
    const endTime = new Date(sprint.endDate).getTime();
    const totalDuration = endTime - startTime;
    const elapsed = now - startTime;
    const timeProgress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

    // 1. Velocity Health
    const committedPoints = sprintStories.reduce((sum, s) => sum + (s.storyPoints || 0), 0);
    const completedPoints = sprintStories
      .filter((s) => s.status === 'done')
      .reduce((sum, s) => sum + (s.storyPoints || 0), 0);
    const workProgress = committedPoints > 0 ? (completedPoints / committedPoints) * 100 : 0;

    const velocityDelta = workProgress - timeProgress;
    let velocityScore = 100;
    let velocityStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
    const velocityRecs: string[] = [];

    if (velocityDelta < -20) {
      velocityScore = 30;
      velocityStatus = 'critical';
      velocityRecs.push('Team is significantly behind schedule');
      velocityRecs.push('Consider removing lower-priority stories');
      velocityRecs.push('Identify and remove blockers immediately');
    } else if (velocityDelta < -10) {
      velocityScore = 60;
      velocityStatus = 'warning';
      velocityRecs.push('Team is slightly behind pace');
      velocityRecs.push('Monitor daily progress closely');
    } else if (velocityDelta > 20) {
      velocityScore = 95;
      velocityRecs.push('Team is ahead of schedule');
      velocityRecs.push('Consider pulling in additional stories');
    } else {
      velocityScore = 85;
      velocityRecs.push('Team is on track');
    }

    indicators.push({
      id: 'velocity',
      name: 'Velocity Health',
      score: velocityScore,
      status: velocityStatus,
      message: `${Math.round(workProgress)}% work done vs ${Math.round(timeProgress)}% time elapsed`,
      recommendations: velocityRecs,
    });

    // 2. Scope Creep
    const initialCommitment = sprint.commitment || committedPoints;
    const scopeChange = committedPoints - initialCommitment;
    const scopeChangePercent = initialCommitment > 0 ? (scopeChange / initialCommitment) * 100 : 0;

    let scopeScore = 100;
    let scopeStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
    const scopeRecs: string[] = [];

    if (scopeChangePercent > 20) {
      scopeScore = 40;
      scopeStatus = 'critical';
      scopeRecs.push('Significant scope creep detected');
      scopeRecs.push('Freeze scope and remove non-essential stories');
      scopeRecs.push('Discuss with Product Owner');
    } else if (scopeChangePercent > 10) {
      scopeScore = 70;
      scopeStatus = 'warning';
      scopeRecs.push('Moderate scope increase detected');
      scopeRecs.push('Monitor scope changes carefully');
    } else if (scopeChangePercent < -10) {
      scopeScore = 85;
      scopeRecs.push('Scope reduced - consider backfilling with priority items');
    } else {
      scopeScore = 100;
      scopeRecs.push('Scope is stable');
    }

    indicators.push({
      id: 'scope',
      name: 'Scope Stability',
      score: scopeScore,
      status: scopeStatus,
      message: scopeChange >= 0
        ? `+${scopeChange} points added (${Math.abs(Math.round(scopeChangePercent))}% increase)`
        : `${scopeChange} points removed (${Math.abs(Math.round(scopeChangePercent))}% decrease)`,
      recommendations: scopeRecs,
    });

    // 3. Blocker Risk
    const blockedStories = sprintStories.filter(
      (s) => s.blocker && s.blocker.status !== 'resolved'
    );
    const blockedPoints = blockedStories.reduce((sum, s) => sum + (s.storyPoints || 0), 0);
    const blockerImpact = committedPoints > 0 ? (blockedPoints / committedPoints) * 100 : 0;

    let blockerScore = 100;
    let blockerStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
    const blockerRecs: string[] = [];

    if (blockerImpact > 30) {
      blockerScore = 20;
      blockerStatus = 'critical';
      blockerRecs.push('High-impact blockers affecting sprint');
      blockerRecs.push('Escalate blockers immediately');
      blockerRecs.push('Consider moving blocked stories to backlog');
    } else if (blockerImpact > 15) {
      blockerScore = 60;
      blockerStatus = 'warning';
      blockerRecs.push('Some stories are blocked');
      blockerRecs.push('Focus on unblocking critical stories');
    } else if (blockedStories.length === 0) {
      blockerScore = 100;
      blockerRecs.push('No active blockers');
    } else {
      blockerScore = 85;
      blockerRecs.push('Minor blockers present');
    }

    indicators.push({
      id: 'blockers',
      name: 'Blocker Risk',
      score: blockerScore,
      status: blockerStatus,
      message: `${blockedStories.length} stories blocked (${Math.round(blockerImpact)}% of sprint)`,
      recommendations: blockerRecs,
    });

    // 4. Team Capacity
    const teamUtilization = sprint.capacity > 0 ? (committedPoints / sprint.capacity) * 100 : 0;

    let capacityScore = 100;
    let capacityStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
    const capacityRecs: string[] = [];

    if (teamUtilization > 110) {
      capacityScore = 30;
      capacityStatus = 'critical';
      capacityRecs.push('Team is significantly over capacity');
      capacityRecs.push('Remove stories to prevent burnout');
      capacityRecs.push('Review capacity assumptions');
    } else if (teamUtilization > 100) {
      capacityScore = 60;
      capacityStatus = 'warning';
      capacityRecs.push('Team is slightly over capacity');
      capacityRecs.push('Monitor for signs of overload');
    } else if (teamUtilization < 50) {
      capacityScore = 70;
      capacityStatus = 'warning';
      capacityRecs.push('Team capacity underutilized');
      capacityRecs.push('Consider adding more stories');
    } else if (teamUtilization >= 70 && teamUtilization <= 90) {
      capacityScore = 100;
      capacityRecs.push('Optimal capacity utilization');
    } else {
      capacityScore = 85;
      capacityRecs.push('Good capacity utilization');
    }

    indicators.push({
      id: 'capacity',
      name: 'Capacity Health',
      score: capacityScore,
      status: capacityStatus,
      message: `${Math.round(teamUtilization)}% of team capacity utilized`,
      recommendations: capacityRecs,
    });

    // 5. Story Distribution
    const inProgress = sprintStories.filter((s) => s.status === 'in-progress').length;
    const total = sprintStories.length;
    const wip = total > 0 ? (inProgress / total) * 100 : 0;

    let wipScore = 100;
    let wipStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
    const wipRecs: string[] = [];

    if (wip > 60) {
      wipScore = 50;
      wipStatus = 'warning';
      wipRecs.push('Too much work in progress');
      wipRecs.push('Focus on completing existing stories');
      wipRecs.push('Limit WIP to improve flow');
    } else if (wip < 20 && timeProgress > 30) {
      wipScore = 70;
      wipStatus = 'warning';
      wipRecs.push('Low WIP - team may need more work');
      wipRecs.push('Ensure stories are ready for development');
    } else {
      wipScore = 90;
      wipRecs.push('Healthy work distribution');
    }

    indicators.push({
      id: 'wip',
      name: 'Work In Progress',
      score: wipScore,
      status: wipStatus,
      message: `${inProgress} of ${total} stories in progress (${Math.round(wip)}%)`,
      recommendations: wipRecs,
    });

    return indicators;
  }, [sprint, stories, metrics]);

  // Calculate overall sprint health
  const overallHealth = useMemo(() => {
    const avgScore = healthIndicators.reduce((sum, ind) => sum + ind.score, 0) / healthIndicators.length;
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';

    if (avgScore < 50) status = 'critical';
    else if (avgScore < 75) status = 'warning';

    return {
      score: Math.round(avgScore),
      status,
    };
  }, [healthIndicators]);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
      case 'critical':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'critical':
        return '🚨';
      default:
        return '❓';
    }
  };

  // Get score color for progress bar
  const getScoreColor = (score: number) => {
    if (score >= 75) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              Sprint Health Dashboard
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Real-time health indicators and risk analysis for {sprint.name}
            </p>
          </div>
          <div className="text-center">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${getStatusColor(overallHealth.status)}`}>
              <span className="text-2xl">{getStatusIcon(overallHealth.status)}</span>
              <span className="text-3xl font-bold">{overallHealth.score}</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Overall Health</p>
          </div>
        </div>
      </div>

      {/* Health Indicators Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {healthIndicators.map((indicator) => (
            <div
              key={indicator.id}
              className={`border-2 rounded-xl p-4 transition-all ${
                indicator.status === 'critical'
                  ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10'
                  : indicator.status === 'warning'
                  ? 'border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/10'
                  : 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/10'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{getStatusIcon(indicator.status)}</span>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                    {indicator.name}
                  </h3>
                </div>
                <span className={`text-lg font-bold ${indicator.score >= 75 ? 'text-green-600 dark:text-green-400' : indicator.score >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                  {indicator.score}
                </span>
              </div>

              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
                <div
                  className={`h-full rounded-full transition-all ${getScoreColor(indicator.score)}`}
                  style={{ width: `${indicator.score}%` }}
                />
              </div>

              <p className="text-xs text-gray-700 dark:text-gray-300 mb-3">
                {indicator.message}
              </p>

              {indicator.recommendations.length > 0 && (
                <div className="space-y-1">
                  {indicator.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Critical Alerts */}
        {healthIndicators.some((i) => i.status === 'critical') && (
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">🚨</span>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-900 dark:text-red-300 mb-2">
                  Critical Issues Detected
                </h3>
                <div className="space-y-2">
                  {healthIndicators
                    .filter((i) => i.status === 'critical')
                    .map((indicator) => (
                      <div key={indicator.id} className="text-sm text-red-800 dark:text-red-200">
                        <span className="font-medium">{indicator.name}:</span> {indicator.message}
                      </div>
                    ))}
                </div>
                <div className="mt-3 text-sm text-red-900 dark:text-red-300 font-medium">
                  ⚡ Immediate action required to get sprint back on track
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
