'use client';

import React, { useState, useEffect } from 'react';
import { BoardTask } from '@/lib/types';
import { TimeTrackingService } from '@/lib/services/timeTrackingService';

interface TimeTrackingSectionProps {
  boardId: string;
  task: BoardTask;
  onUpdate: () => void;
}

export default function TimeTrackingSection({
  boardId,
  task,
  onUpdate,
}: TimeTrackingSectionProps) {
  const [isEditingEstimate, setIsEditingEstimate] = useState(false);
  const [estimateInput, setEstimateInput] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showTimeLogs, setShowTimeLogs] = useState(false);

  const activeTimer = task.activeTimer;
  const timeLogs = task.timeLogs || [];
  const estimatedTime = task.estimatedTime || 0;
  const actualTime = task.actualTime || 0;

  // Update elapsed time every second when timer is active
  useEffect(() => {
    if (!activeTimer) return;

    const interval = setInterval(() => {
      setElapsedTime(TimeTrackingService.getElapsedTime(activeTimer));
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimer]);

  const handleStartTimer = () => {
    TimeTrackingService.startTimer(boardId, task.id);
    onUpdate();
  };

  const handleStopTimer = () => {
    const note = prompt('Add a note about this time entry (optional):');
    TimeTrackingService.stopTimer(boardId, task.id, note || undefined);
    onUpdate();
  };

  const handleSetEstimate = () => {
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

    if (minutes > 0) {
      TimeTrackingService.setEstimatedTime(boardId, task.id, minutes);
      onUpdate();
    }

    setIsEditingEstimate(false);
    setEstimateInput('');
  };

  const handleDeleteTimeLog = (logId: string) => {
    if (confirm('Delete this time log?')) {
      TimeTrackingService.deleteTimeLog(boardId, task.id, logId);
      onUpdate();
    }
  };

  const formatTime = (minutes: number): string => {
    return TimeTrackingService.formatDuration(minutes);
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
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
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
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
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
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
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
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
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
