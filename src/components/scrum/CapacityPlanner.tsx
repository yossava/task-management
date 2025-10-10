'use client';

import type { TeamMember, Sprint } from '@/lib/types/scrum';

interface CapacityPlannerProps {
  members: TeamMember[];
  sprint?: Sprint;
}

export default function CapacityPlanner({ members, sprint }: CapacityPlannerProps) {
  // Calculate team capacity
  const totalCapacity = members.reduce(
    (sum, m) => sum + (m.capacity * m.availability) / 100,
    0
  );
  const maxCapacity = members.reduce((sum, m) => sum + m.capacity, 0);
  const averageAvailability = members.length > 0
    ? members.reduce((sum, m) => sum + m.availability, 0) / members.length
    : 0;

  // Sprint-specific calculations
  const sprintCommitment = sprint?.commitment || 0;
  const sprintCapacity = sprint?.capacity || totalCapacity;
  const utilizationRate = sprintCapacity > 0 ? (sprintCommitment / sprintCapacity) * 100 : 0;

  // Categorize members by availability
  const fullCapacityMembers = members.filter((m) => m.availability === 100);
  const reducedCapacityMembers = members.filter(
    (m) => m.availability < 100 && m.availability >= 50
  );
  const limitedCapacityMembers = members.filter((m) => m.availability < 50);

  // Role distribution
  const roleDistribution = members.reduce((acc, member) => {
    acc[member.role] = (acc[member.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getUtilizationColor = () => {
    if (utilizationRate > 100) return 'text-red-600 dark:text-red-400';
    if (utilizationRate > 90) return 'text-orange-600 dark:text-orange-400';
    if (utilizationRate > 70) return 'text-green-600 dark:text-green-400';
    return 'text-blue-600 dark:text-blue-400';
  };

  const getUtilizationStatus = () => {
    if (utilizationRate > 100) return 'Over Capacity ⚠️';
    if (utilizationRate > 90) return 'Near Capacity 🔔';
    if (utilizationRate > 70) return 'Healthy 💚';
    return 'Under Utilized 📊';
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Capacity */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Total Capacity
            </span>
            <span className="text-2xl">⚡</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {Math.round(totalCapacity)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500">
            of {maxCapacity} max points per sprint
          </div>
        </div>

        {/* Team Size */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Team Members
            </span>
            <span className="text-2xl">👥</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {members.length}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500">
            {Math.round(averageAvailability)}% average availability
          </div>
        </div>

        {/* Utilization */}
        {sprint && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Utilization
              </span>
              <span className="text-2xl">📈</span>
            </div>
            <div className={`text-3xl font-bold mb-1 ${getUtilizationColor()}`}>
              {Math.round(utilizationRate)}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500">
              {getUtilizationStatus()}
            </div>
          </div>
        )}
      </div>

      {/* Capacity Breakdown */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Capacity Distribution
        </h3>

        {/* Visual Breakdown */}
        <div className="space-y-4 mb-6">
          {members.map((member) => {
            const effectiveCapacity = (member.capacity * member.availability) / 100;
            const percentage = maxCapacity > 0 ? (effectiveCapacity / maxCapacity) * 100 : 0;

            return (
              <div key={member.id}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                      {member.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .substring(0, 2)}
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {member.name}
                    </span>
                    {member.availability < 100 && (
                      <span className="text-xs text-orange-600 dark:text-orange-400">
                        ({member.availability}%)
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {Math.round(effectiveCapacity)} pts
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Availability Categories */}
        {members.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                {fullCapacityMembers.length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Full Capacity (100%)
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                {reducedCapacityMembers.length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Reduced (50-99%)
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-1">
                {limitedCapacityMembers.length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Limited (&lt;50%)
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Role Distribution */}
      {Object.keys(roleDistribution).length > 0 && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Role Distribution
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(roleDistribution).map(([role, count]) => {
              const roleLabels = {
                'product-owner': 'Product Owners',
                'scrum-master': 'Scrum Masters',
                developer: 'Developers',
                tester: 'Testers',
              };
              const roleIcons = {
                'product-owner': '👔',
                'scrum-master': '🎯',
                developer: '💻',
                tester: '🧪',
              };

              return (
                <div
                  key={role}
                  className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center"
                >
                  <div className="text-2xl mb-2">
                    {roleIcons[role as keyof typeof roleIcons]}
                  </div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    {count}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {roleLabels[role as keyof typeof roleLabels]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sprint Planning Info */}
      {sprint && (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Sprint Capacity Planning
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Available Capacity
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(sprintCapacity)} pts
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Committed
              </div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {sprintCommitment} pts
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Remaining
              </div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {Math.max(0, Math.round(sprintCapacity - sprintCommitment))} pts
              </div>
            </div>
          </div>

          {/* Utilization Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Capacity Utilization
              </span>
              <span className={`text-sm font-bold ${getUtilizationColor()}`}>
                {Math.round(utilizationRate)}%
              </span>
            </div>
            <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  utilizationRate > 100
                    ? 'bg-gradient-to-r from-red-600 to-orange-600'
                    : utilizationRate > 90
                    ? 'bg-gradient-to-r from-orange-600 to-yellow-600'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600'
                }`}
                style={{ width: `${Math.min(100, utilizationRate)}%` }}
              ></div>
            </div>
            {utilizationRate > 100 && (
              <div className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Team is over capacity. Consider reducing commitment or adjusting availability.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {members.length === 0 && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">👥</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Team Members Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Add team members to see capacity planning and distribution
          </p>
        </div>
      )}
    </div>
  );
}
