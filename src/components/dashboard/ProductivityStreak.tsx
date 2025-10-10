'use client';

import { ProductivityStreak as StreakData } from '@/lib/services/analyticsService';

interface ProductivityStreakProps {
  streak: StreakData;
}

export default function ProductivityStreak({ streak }: ProductivityStreakProps) {
  const { currentStreak, longestStreak, lastCompletionDate } = streak;

  const getStreakEmoji = (days: number) => {
    if (days === 0) return '😴';
    if (days < 3) return '🔥';
    if (days < 7) return '💪';
    if (days < 14) return '🚀';
    if (days < 30) return '⭐';
    return '🏆';
  };

  const getStreakMessage = (days: number) => {
    if (days === 0) return 'Start your streak!';
    if (days === 1) return 'Great start!';
    if (days < 7) return 'Keep it up!';
    if (days < 14) return 'Amazing momentum!';
    if (days < 30) return 'Unstoppable!';
    return 'Legendary streak!';
  };

  const formatLastCompletion = (timestamp: number | null) => {
    if (!timestamp) return 'Never';

    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Productivity Streak</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Consecutive days completing tasks</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Current Streak */}
        <div className="text-center p-6 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl text-white">
          <div className="text-5xl mb-2">
            {getStreakEmoji(currentStreak)}
          </div>
          <div className="text-4xl font-bold mb-2">
            {currentStreak}
          </div>
          <div className="text-sm opacity-90 mb-1">
            Current Streak
          </div>
          <div className="text-xs opacity-75">
            {getStreakMessage(currentStreak)}
          </div>
        </div>

        {/* Longest Streak */}
        <div className="text-center p-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl text-white">
          <div className="text-5xl mb-2">
            🏆
          </div>
          <div className="text-4xl font-bold mb-2">
            {longestStreak}
          </div>
          <div className="text-sm opacity-90 mb-1">
            Longest Streak
          </div>
          <div className="text-xs opacity-75">
            Personal best
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Last completion:</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {formatLastCompletion(lastCompletionDate)}
          </span>
        </div>
      </div>

      {/* Streak Tips */}
      {currentStreak === 0 && (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💡 <strong>Tip:</strong> Complete at least one task today to start your streak!
          </p>
        </div>
      )}

      {currentStreak > 0 && currentStreak < longestStreak && (
        <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <p className="text-sm text-purple-800 dark:text-purple-200">
            🎯 <strong>Goal:</strong> {longestStreak - currentStreak} more {longestStreak - currentStreak === 1 ? 'day' : 'days'} to match your best!
          </p>
        </div>
      )}

      {currentStreak > 0 && currentStreak === longestStreak && longestStreak > 1 && (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-800 dark:text-green-200">
            🌟 <strong>Amazing!</strong> You're at your personal best. Keep going!
          </p>
        </div>
      )}
    </div>
  );
}
