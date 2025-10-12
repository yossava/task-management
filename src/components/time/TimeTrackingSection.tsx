'use client';

import React, { useState, useEffect } from 'react';
import { BoardTask } from '@/lib/types';
import toast from 'react-hot-toast';

interface TimeTrackingSectionProps {
  taskId: string;
  task: BoardTask;
  onUpdate: () => void;
}

export default function TimeTrackingSection({
  taskId,
  task,
  onUpdate,
}: TimeTrackingSectionProps) {
  const [isEditingEstimate, setIsEditingEstimate] = useState(false);
  const [estimateInput, setEstimateInput] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showTimeLogs, setShowTimeLogs] = useState(false);
  const [loading, setLoading] = useState(false);

  // Optimistic UI state
  const [optimisticTimer, setOptimisticTimer] = useState<{ startTime: Date } | null>(null);
  const [optimisticEstimate, setOptimisticEstimate] = useState<number | null>(null);
  const [optimisticActualTime, setOptimisticActualTime] = useState<number | null>(null);

  const activeTimer = optimisticTimer || task.activeTimer;
  const timeLogs = task.timeLogs || [];
  const estimatedTime = optimisticEstimate ?? task.estimatedTime ?? 0;
  const actualTime = optimisticActualTime ?? task.actualTime ?? 0;

  // Update elapsed time every second when timer is active
  useEffect(() => {
    if (!activeTimer) return;

    const startTime = new Date(activeTimer.startTime).getTime();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 60000); // minutes
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimer]);

  const handleStartTimer = async () => {
    // Optimistic UI: immediately show timer as started
    const optimisticStart = { startTime: new Date() };
    setOptimisticTimer(optimisticStart);
    setLoading(true);

    try {
      const response = await fetch(`/api/tasks/${taskId}/time`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to start timer');
      }

      // Clear optimistic state - the parent will have updated task data
      setOptimisticTimer(null);
      onUpdate();
      toast.success('Timer started');
    } catch (error) {
      // Rollback optimistic update on error
      setOptimisticTimer(null);
      console.error('Error starting timer:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to start timer');
    } finally {
      setLoading(false);
    }
  };

  const handleStopTimer = async () => {
    const note = prompt('Add a note about this time entry (optional):');

    if (!activeTimer) return;

    // Calculate duration for optimistic update
    const startTime = new Date(activeTimer.startTime).getTime();
    const duration = Math.floor((Date.now() - startTime) / 60000); // minutes

    // Optimistic UI: immediately show timer as stopped and update actual time
    setOptimisticTimer(null);
    setOptimisticActualTime((actualTime || 0) + duration);
    setLoading(true);

    try {
      const response = await fetch(`/api/tasks/${taskId}/time`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop', note: note || undefined }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to stop timer');
      }

      const result = await response.json();
      // Clear optimistic state - the parent will have updated task data
      setOptimisticActualTime(null);
      onUpdate();
      toast.success(`Timer stopped - ${formatTime(result.duration)} logged`);
    } catch (error) {
      // Rollback optimistic update on error
      setOptimisticTimer(activeTimer);
      setOptimisticActualTime(null);
      console.error('Error stopping timer:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to stop timer');
    } finally {
      setLoading(false);
    }
  };

  const handleSetEstimate = async () => {
    const value = estimateInput.trim();
    if (!value) {
      setIsEditingEstimate(false);
      return;
    }

    // Parse input like "2h 30m" or "90" (minutes)
    let minutes = 0;
    const hoursMatch = value.match(/(\d+)\s*h/i);
    const minutesMatch = value.match(/(\d+)\s*m/i);
    const plainNumber = value.match(/^(\d+)$/);

    if (hoursMatch) {
      minutes += parseInt(hoursMatch[1]) * 60;
    }
    if (minutesMatch) {
      minutes += parseInt(minutesMatch[1]);
    }
    if (plainNumber && !hoursMatch && !minutesMatch) {
      minutes = parseInt(plainNumber[1]);
    }

    if (minutes <= 0) {
      toast.error('Please enter a valid time estimate');
      return;
    }

    // Optimistic UI: immediately show the new estimate
    setOptimisticEstimate(minutes);
    setIsEditingEstimate(false);
    setEstimateInput('');
    setLoading(true);

    try {
      const response = await fetch(`/api/tasks/${taskId}/time`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_estimate', estimatedTime: minutes }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to set estimate');
      }

      // Clear optimistic state - the parent will have updated task data
      setOptimisticEstimate(null);
      onUpdate();
      toast.success('Estimate updated');
    } catch (error) {
      // Rollback optimistic update on error
      setOptimisticEstimate(null);
      setIsEditingEstimate(true);
      setEstimateInput(value);
      console.error('Error setting estimate:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to set estimate');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTimeLog = async (logId: string) => {
    if (!confirm('Delete this time log?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}/time?logId=${logId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete time log');
      }

      onUpdate();
      toast.success('Time log deleted');
    } catch (error) {
      console.error('Error deleting time log:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete time log');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const getProgressColor = () => {
    if (estimatedTime === 0) return 'bg-gray-400';
    const percentage = (actualTime / estimatedTime) * 100;
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Time Tracking
        </h3>
      </div>

      {/* Timer Controls */}
      <div className="flex items-center gap-3">
        {activeTimer ? (
          <>
            <button
              onClick={handleStopTimer}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <rect x="6" y="6" width="8" height="8" />
              </svg>
              Stop Timer
            </button>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
                {formatTime(elapsedTime)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Elapsed
              </div>
            </div>
          </>
        ) : (
          <button
            onClick={handleStartTimer}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 4.3a1 1 0 011.4 0l6 6a1 1 0 010 1.4l-6 6a1 1 0 01-1.4-1.4L11.58 11 6.3 5.7a1 1 0 010-1.4z" />
            </svg>
            Start Timer
          </button>
        )}
      </div>

      {/* Time Estimate */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Estimated Time
          </label>
          {!isEditingEstimate && (
            <button
              onClick={() => {
                setEstimateInput(estimatedTime > 0 ? estimatedTime.toString() : '');
                setIsEditingEstimate(true);
              }}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              {estimatedTime > 0 ? 'Edit' : 'Set'}
            </button>
          )}
        </div>

        {isEditingEstimate ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={estimateInput}
              onChange={(e) => setEstimateInput(e.target.value)}
              placeholder="e.g., 2h 30m or 150"
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSetEstimate();
                } else if (e.key === 'Escape') {
                  setIsEditingEstimate(false);
                  setEstimateInput('');
                }
              }}
            />
            <button
              onClick={handleSetEstimate}
              disabled={loading}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              Save
            </button>
            <button
              onClick={() => {
                setIsEditingEstimate(false);
                setEstimateInput('');
              }}
              className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 text-sm"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {estimatedTime > 0 ? formatTime(estimatedTime) : 'Not set'}
          </div>
        )}
      </div>

      {/* Actual Time & Progress */}
      {(estimatedTime > 0 || actualTime > 0) && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>Actual Time</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatTime(actualTime)}
            </span>
          </div>

          {estimatedTime > 0 && (
            <>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${getProgressColor()}`}
                  style={{
                    width: `${Math.min((actualTime / estimatedTime) * 100, 100)}%`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400">
                  {estimatedTime > actualTime ? (
                    <>Remaining: {formatTime(estimatedTime - actualTime)}</>
                  ) : (
                    <>Over by: {formatTime(actualTime - estimatedTime)}</>
                  )}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {Math.round((actualTime / estimatedTime) * 100)}%
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Time Logs */}
      {timeLogs.length > 0 && (
        <div className="space-y-2">
          <button
            onClick={() => setShowTimeLogs(!showTimeLogs)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <svg
              className={`w-4 h-4 transition-transform ${showTimeLogs ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            Time Logs ({timeLogs.length})
          </button>

          {showTimeLogs && (
            <div className="space-y-2 pl-6">
              {timeLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatTime(log.duration)}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(log.startTime).toLocaleDateString()} •{' '}
                          {new Date(log.startTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      {log.note && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {log.note}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteTimeLog(log.id)}
                      disabled={loading}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
