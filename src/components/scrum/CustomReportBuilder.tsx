'use client';

import { useState, useMemo } from 'react';
import type { Sprint, UserStory, TeamMember } from '@/lib/types/scrum';

interface CustomReportBuilderProps {
  sprints: Sprint[];
  stories: UserStory[];
  teamMembers: TeamMember[];
}

type ReportType = 'velocity' | 'burndown' | 'team-performance' | 'health' | 'comprehensive';
type ExportFormat = 'csv' | 'json' | 'pdf';
type DateRangeType = 'last-sprint' | 'last-3-sprints' | 'last-6-sprints' | 'all' | 'custom';

interface MetricConfig {
  id: string;
  name: string;
  category: 'sprint' | 'team' | 'story' | 'quality';
  enabled: boolean;
}

interface ReportData {
  title: string;
  generatedAt: string;
  dateRange: { start: string; end: string };
  metrics: { [key: string]: any };
}

export default function CustomReportBuilder({
  sprints,
  stories,
  teamMembers,
}: CustomReportBuilderProps) {
  // Report configuration
  const [reportType, setReportType] = useState<ReportType>('comprehensive');
  const [dateRange, setDateRange] = useState<DateRangeType>('last-3-sprints');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('json');
  const [showPreview, setShowPreview] = useState(false);

  // Available metrics by category
  const [availableMetrics, setAvailableMetrics] = useState<MetricConfig[]>([
    // Sprint Metrics
    { id: 'velocity', name: 'Sprint Velocity', category: 'sprint', enabled: true },
    { id: 'commitment', name: 'Sprint Commitment', category: 'sprint', enabled: true },
    { id: 'completion-rate', name: 'Completion Rate', category: 'sprint', enabled: true },
    { id: 'scope-change', name: 'Scope Change', category: 'sprint', enabled: true },
    { id: 'burndown', name: 'Burndown Data', category: 'sprint', enabled: false },

    // Team Metrics
    { id: 'team-velocity', name: 'Team Velocity', category: 'team', enabled: true },
    { id: 'member-performance', name: 'Member Performance', category: 'team', enabled: true },
    { id: 'capacity-utilization', name: 'Capacity Utilization', category: 'team', enabled: true },
    { id: 'workload-distribution', name: 'Workload Distribution', category: 'team', enabled: false },

    // Story Metrics
    { id: 'story-count', name: 'Story Count', category: 'story', enabled: true },
    { id: 'points-delivered', name: 'Points Delivered', category: 'story', enabled: true },
    { id: 'cycle-time', name: 'Cycle Time', category: 'story', enabled: false },
    { id: 'lead-time', name: 'Lead Time', category: 'story', enabled: false },

    // Quality Metrics
    { id: 'blocker-rate', name: 'Blocker Rate', category: 'quality', enabled: true },
    { id: 'sprint-health', name: 'Sprint Health Score', category: 'quality', enabled: true },
    { id: 'estimation-accuracy', name: 'Estimation Accuracy', category: 'quality', enabled: false },
  ]);

  // Toggle metric
  const toggleMetric = (id: string) => {
    setAvailableMetrics((prev) =>
      prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m))
    );
  };

  // Get filtered sprints based on date range
  const filteredSprints = useMemo(() => {
    let filtered = [...sprints];

    switch (dateRange) {
      case 'last-sprint':
        filtered = filtered.slice(-1);
        break;
      case 'last-3-sprints':
        filtered = filtered.slice(-3);
        break;
      case 'last-6-sprints':
        filtered = filtered.slice(-6);
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          const start = new Date(customStartDate).getTime();
          const end = new Date(customEndDate).getTime();
          filtered = filtered.filter((s) => {
            const sprintStart = new Date(s.startDate).getTime();
            const sprintEnd = new Date(s.endDate).getTime();
            return sprintEnd >= start && sprintStart <= end;
          });
        }
        break;
      // 'all' - no filtering
    }

    return filtered;
  }, [sprints, dateRange, customStartDate, customEndDate]);

  // Generate report data
  const reportData = useMemo((): ReportData => {
    const sprintIds = filteredSprints.map((s) => s.id);
    const filteredStories = stories.filter((s) => sprintIds.includes(s.sprintId || ''));

    const metrics: { [key: string]: any } = {};
    const enabledMetrics = availableMetrics.filter((m) => m.enabled);

    // Sprint Metrics
    if (enabledMetrics.some((m) => m.id === 'velocity')) {
      metrics.velocity = filteredSprints.map((sprint) => {
        const sprintStories = stories.filter((s) => s.sprintId === sprint.id);
        const completed = sprintStories.filter((s) => s.status === 'done');
        const points = completed.reduce((sum, s) => sum + (s.storyPoints || 0), 0);
        return { sprint: sprint.name, velocity: points };
      });
    }

    if (enabledMetrics.some((m) => m.id === 'commitment')) {
      metrics.commitment = filteredSprints.map((sprint) => {
        const sprintStories = stories.filter((s) => s.sprintId === sprint.id);
        const committed = sprintStories.reduce((sum, s) => sum + (s.storyPoints || 0), 0);
        return { sprint: sprint.name, committed, capacity: sprint.capacity };
      });
    }

    if (enabledMetrics.some((m) => m.id === 'completion-rate')) {
      metrics.completionRate = filteredSprints.map((sprint) => {
        const sprintStories = stories.filter((s) => s.sprintId === sprint.id);
        const total = sprintStories.length;
        const completed = sprintStories.filter((s) => s.status === 'done').length;
        const rate = total > 0 ? (completed / total) * 100 : 0;
        return { sprint: sprint.name, total, completed, rate: Math.round(rate) };
      });
    }

    if (enabledMetrics.some((m) => m.id === 'scope-change')) {
      metrics.scopeChange = filteredSprints.map((sprint) => {
        const sprintStories = stories.filter((s) => s.sprintId === sprint.id);
        const currentCommitment = sprintStories.reduce((sum, s) => sum + (s.storyPoints || 0), 0);
        const initialCommitment = sprint.commitment || currentCommitment;
        const change = currentCommitment - initialCommitment;
        const changePercent = initialCommitment > 0 ? (change / initialCommitment) * 100 : 0;
        return {
          sprint: sprint.name,
          initial: initialCommitment,
          current: currentCommitment,
          change,
          changePercent: Math.round(changePercent),
        };
      });
    }

    if (enabledMetrics.some((m) => m.id === 'burndown')) {
      metrics.burndown = filteredSprints.map((sprint) => {
        const sprintStories = stories.filter((s) => s.sprintId === sprint.id);
        const totalPoints = sprintStories.reduce((sum, s) => sum + (s.storyPoints || 0), 0);
        const completedPoints = sprintStories
          .filter((s) => s.status === 'done')
          .reduce((sum, s) => sum + (s.storyPoints || 0), 0);
        const remainingPoints = totalPoints - completedPoints;
        return { sprint: sprint.name, total: totalPoints, completed: completedPoints, remaining: remainingPoints };
      });
    }

    // Team Metrics
    if (enabledMetrics.some((m) => m.id === 'team-velocity')) {
      const totalVelocity = filteredSprints.reduce((sum, sprint) => {
        const sprintStories = stories.filter((s) => s.sprintId === sprint.id && s.status === 'done');
        const points = sprintStories.reduce((pSum, s) => pSum + (s.storyPoints || 0), 0);
        return sum + points;
      }, 0);
      const avgVelocity = filteredSprints.length > 0 ? totalVelocity / filteredSprints.length : 0;
      metrics.teamVelocity = {
        total: totalVelocity,
        average: Math.round(avgVelocity * 10) / 10,
        sprints: filteredSprints.length,
      };
    }

    if (enabledMetrics.some((m) => m.id === 'member-performance')) {
      metrics.memberPerformance = teamMembers.map((member) => {
        const memberStories = filteredStories.filter((s) => s.assignees.includes(member.name));
        const completed = memberStories.filter((s) => s.status === 'done');
        const points = completed.reduce((sum, s) => sum + (s.storyPoints || 0), 0);
        const completionRate = memberStories.length > 0 ? (completed.length / memberStories.length) * 100 : 0;
        return {
          member: member.name,
          role: member.role,
          storiesAssigned: memberStories.length,
          storiesCompleted: completed.length,
          pointsDelivered: points,
          completionRate: Math.round(completionRate),
        };
      });
    }

    if (enabledMetrics.some((m) => m.id === 'capacity-utilization')) {
      metrics.capacityUtilization = filteredSprints.map((sprint) => {
        const sprintStories = stories.filter((s) => s.sprintId === sprint.id);
        const committed = sprintStories.reduce((sum, s) => sum + (s.storyPoints || 0), 0);
        const utilization = sprint.capacity > 0 ? (committed / sprint.capacity) * 100 : 0;
        return {
          sprint: sprint.name,
          capacity: sprint.capacity,
          committed,
          utilization: Math.round(utilization),
        };
      });
    }

    if (enabledMetrics.some((m) => m.id === 'workload-distribution')) {
      const totalStories = filteredStories.length;
      metrics.workloadDistribution = teamMembers.map((member) => {
        const memberStories = filteredStories.filter((s) => s.assignees.includes(member.name));
        const percentage = totalStories > 0 ? (memberStories.length / totalStories) * 100 : 0;
        return {
          member: member.name,
          stories: memberStories.length,
          percentage: Math.round(percentage),
        };
      });
    }

    // Story Metrics
    if (enabledMetrics.some((m) => m.id === 'story-count')) {
      metrics.storyCount = {
        total: filteredStories.length,
        completed: filteredStories.filter((s) => s.status === 'done').length,
        inProgress: filteredStories.filter((s) => s.status === 'in-progress').length,
        todo: filteredStories.filter((s) => s.status === 'todo').length,
        blocked: filteredStories.filter((s) => s.blocker && s.blocker.status !== 'resolved').length,
      };
    }

    if (enabledMetrics.some((m) => m.id === 'points-delivered')) {
      metrics.pointsDelivered = {
        total: filteredStories.reduce((sum, s) => sum + (s.storyPoints || 0), 0),
        completed: filteredStories
          .filter((s) => s.status === 'done')
          .reduce((sum, s) => sum + (s.storyPoints || 0), 0),
        remaining: filteredStories
          .filter((s) => s.status !== 'done')
          .reduce((sum, s) => sum + (s.storyPoints || 0), 0),
      };
    }

    if (enabledMetrics.some((m) => m.id === 'cycle-time')) {
      const completedStories = filteredStories.filter((s) => s.status === 'done');
      const cycleTimes = completedStories
        .filter((s) => s.createdAt && s.updatedAt)
        .map((s) => {
          const created = new Date(s.createdAt!).getTime();
          const updated = new Date(s.updatedAt!).getTime();
          return (updated - created) / (1000 * 60 * 60 * 24); // days
        });
      const avgCycleTime = cycleTimes.length > 0 ? cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length : 0;
      metrics.cycleTime = {
        average: Math.round(avgCycleTime * 10) / 10,
        min: cycleTimes.length > 0 ? Math.round(Math.min(...cycleTimes) * 10) / 10 : 0,
        max: cycleTimes.length > 0 ? Math.round(Math.max(...cycleTimes) * 10) / 10 : 0,
        samples: cycleTimes.length,
      };
    }

    if (enabledMetrics.some((m) => m.id === 'lead-time')) {
      const completedStories = filteredStories.filter((s) => s.status === 'done');
      const leadTimes = completedStories
        .filter((s) => s.createdAt && s.updatedAt)
        .map((s) => {
          const created = new Date(s.createdAt!).getTime();
          const updated = new Date(s.updatedAt!).getTime();
          return (updated - created) / (1000 * 60 * 60 * 24); // days
        });
      const avgLeadTime = leadTimes.length > 0 ? leadTimes.reduce((a, b) => a + b, 0) / leadTimes.length : 0;
      metrics.leadTime = {
        average: Math.round(avgLeadTime * 10) / 10,
        min: leadTimes.length > 0 ? Math.round(Math.min(...leadTimes) * 10) / 10 : 0,
        max: leadTimes.length > 0 ? Math.round(Math.max(...leadTimes) * 10) / 10 : 0,
        samples: leadTimes.length,
      };
    }

    // Quality Metrics
    if (enabledMetrics.some((m) => m.id === 'blocker-rate')) {
      const blockedStories = filteredStories.filter((s) => s.blocker && s.blocker.status !== 'resolved');
      const blockerRate = filteredStories.length > 0 ? (blockedStories.length / filteredStories.length) * 100 : 0;
      metrics.blockerRate = {
        total: filteredStories.length,
        blocked: blockedStories.length,
        rate: Math.round(blockerRate),
      };
    }

    if (enabledMetrics.some((m) => m.id === 'sprint-health')) {
      metrics.sprintHealth = filteredSprints.map((sprint) => {
        const sprintStories = stories.filter((s) => s.sprintId === sprint.id);
        const committed = sprintStories.reduce((sum, s) => sum + (s.storyPoints || 0), 0);
        const completed = sprintStories
          .filter((s) => s.status === 'done')
          .reduce((sum, s) => sum + (s.storyPoints || 0), 0);
        const blocked = sprintStories.filter((s) => s.blocker && s.blocker.status !== 'resolved').length;

        // Simple health score (0-100)
        let healthScore = 50;
        const completionRate = committed > 0 ? (completed / committed) * 100 : 0;
        if (completionRate >= 90) healthScore = 95;
        else if (completionRate >= 70) healthScore = 80;
        else if (completionRate >= 50) healthScore = 60;
        else healthScore = 40;

        if (blocked > sprintStories.length * 0.2) healthScore -= 20;

        return {
          sprint: sprint.name,
          healthScore: Math.max(0, Math.min(100, healthScore)),
          completionRate: Math.round(completionRate),
          blockedStories: blocked,
        };
      });
    }

    if (enabledMetrics.some((m) => m.id === 'estimation-accuracy')) {
      metrics.estimationAccuracy = filteredSprints.map((sprint) => {
        const sprintStories = stories.filter((s) => s.sprintId === sprint.id);
        const committed = sprintStories.reduce((sum, s) => sum + (s.storyPoints || 0), 0);
        const completed = sprintStories
          .filter((s) => s.status === 'done')
          .reduce((sum, s) => sum + (s.storyPoints || 0), 0);
        const accuracy = sprint.commitment > 0 ? (completed / sprint.commitment) * 100 : 0;
        return {
          sprint: sprint.name,
          committed: sprint.commitment || committed,
          completed,
          accuracy: Math.round(accuracy),
        };
      });
    }

    // Determine date range
    let dateRangeDisplay = { start: '', end: '' };
    if (filteredSprints.length > 0) {
      const sortedSprints = [...filteredSprints].sort(
        (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );
      dateRangeDisplay.start = sortedSprints[0].startDate;
      dateRangeDisplay.end = sortedSprints[sortedSprints.length - 1].endDate;
    }

    return {
      title: `${reportType.charAt(0).toUpperCase() + reportType.slice(1).replace('-', ' ')} Report`,
      generatedAt: new Date().toISOString(),
      dateRange: dateRangeDisplay,
      metrics,
    };
  }, [filteredSprints, stories, teamMembers, availableMetrics, reportType]);

  // Export report
  const exportReport = () => {
    if (exportFormat === 'json') {
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scrum-report-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (exportFormat === 'csv') {
      // Simple CSV export - flatten metrics
      let csv = 'Metric,Value\n';
      csv += `Report Type,${reportData.title}\n`;
      csv += `Generated At,${new Date(reportData.generatedAt).toLocaleString()}\n`;
      csv += `Date Range Start,${reportData.dateRange.start}\n`;
      csv += `Date Range End,${reportData.dateRange.end}\n`;
      csv += '\n';

      Object.entries(reportData.metrics).forEach(([key, value]) => {
        csv += `\n${key.toUpperCase()}\n`;
        if (Array.isArray(value)) {
          // Array metrics - create table
          if (value.length > 0 && typeof value[0] === 'object') {
            const headers = Object.keys(value[0]);
            csv += headers.join(',') + '\n';
            value.forEach((item) => {
              csv += headers.map((h) => item[h] ?? '').join(',') + '\n';
            });
          }
        } else if (typeof value === 'object') {
          // Object metrics
          Object.entries(value).forEach(([k, v]) => {
            csv += `${k},${v}\n`;
          });
        }
      });

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scrum-report-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (exportFormat === 'pdf') {
      // PDF export - create printable HTML
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${reportData.title}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { color: #1e3a8a; }
                h2 { color: #2563eb; margin-top: 20px; }
                table { border-collapse: collapse; width: 100%; margin: 10px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #3b82f6; color: white; }
                .metadata { color: #666; font-size: 14px; margin-bottom: 20px; }
              </style>
            </head>
            <body>
              <h1>${reportData.title}</h1>
              <div class="metadata">
                <p><strong>Generated:</strong> ${new Date(reportData.generatedAt).toLocaleString()}</p>
                <p><strong>Date Range:</strong> ${reportData.dateRange.start} to ${reportData.dateRange.end}</p>
              </div>
              ${Object.entries(reportData.metrics)
                .map(([key, value]) => {
                  let content = `<h2>${key.replace(/-/g, ' ').toUpperCase()}</h2>`;
                  if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
                    const headers = Object.keys(value[0]);
                    content += '<table><thead><tr>';
                    headers.forEach((h) => (content += `<th>${h}</th>`));
                    content += '</tr></thead><tbody>';
                    value.forEach((item) => {
                      content += '<tr>';
                      headers.forEach((h) => (content += `<td>${item[h] ?? ''}</td>`));
                      content += '</tr>';
                    });
                    content += '</tbody></table>';
                  } else if (typeof value === 'object') {
                    content += '<table><tbody>';
                    Object.entries(value).forEach(([k, v]) => {
                      content += `<tr><td><strong>${k}</strong></td><td>${v}</td></tr>`;
                    });
                    content += '</tbody></table>';
                  }
                  return content;
                })
                .join('')}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  // Get metrics by category
  const metricsByCategory = useMemo(() => {
    const categories: { [key: string]: MetricConfig[] } = {
      sprint: [],
      team: [],
      story: [],
      quality: [],
    };
    availableMetrics.forEach((m) => {
      categories[m.category].push(m);
    });
    return categories;
  }, [availableMetrics]);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Custom Report Builder</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Configure and generate custom reports with selected metrics
        </p>
      </div>

      {/* Configuration */}
      <div className="p-6 space-y-6">
        {/* Report Type */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Report Type
          </label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as ReportType)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          >
            <option value="velocity">Velocity Report</option>
            <option value="burndown">Burndown Report</option>
            <option value="team-performance">Team Performance Report</option>
            <option value="health">Sprint Health Report</option>
            <option value="comprehensive">Comprehensive Report</option>
          </select>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Date Range
          </label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as DateRangeType)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          >
            <option value="last-sprint">Last Sprint</option>
            <option value="last-3-sprints">Last 3 Sprints</option>
            <option value="last-6-sprints">Last 6 Sprints</option>
            <option value="all">All Sprints</option>
            <option value="custom">Custom Range</option>
          </select>

          {dateRange === 'custom' && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Start Date</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">End Date</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Metrics Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
            Metrics to Include
          </label>
          <div className="space-y-4">
            {Object.entries(metricsByCategory).map(([category, metrics]) => (
              <div key={category}>
                <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-2">
                  {category} Metrics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {metrics.map((metric) => (
                    <label
                      key={metric.id}
                      className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={metric.enabled}
                        onChange={() => toggleMetric(metric.id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-600"
                      />
                      <span className="text-sm text-gray-900 dark:text-white">{metric.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Export Format */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Export Format
          </label>
          <div className="flex gap-3">
            {(['json', 'csv', 'pdf'] as ExportFormat[]).map((format) => (
              <label
                key={format}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <input
                  type="radio"
                  name="export-format"
                  value={format}
                  checked={exportFormat === format}
                  onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-900 dark:text-white font-medium">
                  {format.toUpperCase()}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex-1 px-6 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {showPreview ? 'Hide Preview' : 'Preview Report'}
          </button>
          <button
            onClick={exportReport}
            className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Export Report
          </button>
        </div>
      </div>

      {/* Preview */}
      {showPreview && (
        <div className="border-t border-gray-200 dark:border-gray-800 p-6 bg-gray-50 dark:bg-gray-950">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Report Preview</h3>

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 mb-4">
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{reportData.title}</h4>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p>
                <strong>Generated:</strong> {new Date(reportData.generatedAt).toLocaleString()}
              </p>
              <p>
                <strong>Date Range:</strong>{' '}
                {reportData.dateRange.start ? (
                  <>
                    {new Date(reportData.dateRange.start).toLocaleDateString()} -{' '}
                    {new Date(reportData.dateRange.end).toLocaleDateString()}
                  </>
                ) : (
                  'No data available'
                )}
              </p>
              <p>
                <strong>Sprints Included:</strong> {filteredSprints.length}
              </p>
            </div>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {Object.entries(reportData.metrics).map(([key, value]) => (
              <div
                key={key}
                className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4"
              >
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2 uppercase">
                  {key.replace(/-/g, ' ')}
                </h4>
                <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">
                  {JSON.stringify(value, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
