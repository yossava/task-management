'use client';

import { useState, useMemo } from 'react';
import { BoardTask, Board } from '@/lib/types';
import { DependencyService } from '@/lib/services/dependencyService';

interface TaskDependenciesProps {
  board: Board;
  taskId: string;
  currentTask: BoardTask;
  onUpdate: (boardId: string, updates: Partial<Board>) => Promise<void>;
}

export default function TaskDependencies({ board, taskId, currentTask, onUpdate }: TaskDependenciesProps) {
  const [isAddingDependency, setIsAddingDependency] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [circularWarning, setCircularWarning] = useState('');

  // Get dependencies and blocking tasks
  const dependencies = useMemo(
    () => DependencyService.getTaskDependencies(board, taskId) || [],
    [board, taskId]
  );

  const blockingTasks = useMemo(
    () => DependencyService.getBlockingTasks(board, taskId) || [],
    [board, taskId]
  );

  const canStart = useMemo(
    () => DependencyService.canStartTask(board, taskId),
    [board, taskId]
  );

  // Get all tasks from board for selection
  const availableTasks = useMemo(() => {
    return board.tasks.filter(
      (t) =>
        t.id !== taskId &&
        !dependencies.some((dep) => dep.id === t.id) &&
        !t.completed
    );
  }, [board, taskId, dependencies]);

  const handleAddDependency = async () => {
    if (!selectedTaskId) return;

    // Check for circular dependency
    if (DependencyService.wouldCreateCircularDependency(board, taskId, selectedTaskId)) {
      setCircularWarning('Adding this dependency would create a circular dependency!');
      return;
    }

    await DependencyService.addDependency(board, taskId, selectedTaskId, onUpdate);
    setSelectedTaskId('');
    setCircularWarning('');
    setIsAddingDependency(false);
  };

  const handleRemoveDependency = async (dependencyTaskId: string) => {
    await DependencyService.removeDependency(board, taskId, dependencyTaskId, onUpdate);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-gray-500 dark:text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Dependencies
          </h3>
        </div>

        {/* Can Start Indicator */}
        <div
          className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${
            canStart
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
              : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
          }`}
        >
          <div className={`w-1.5 h-1.5 rounded-full ${canStart ? 'bg-green-500' : 'bg-orange-500'}`} />
          {canStart ? 'Can Start' : 'Blocked'}
        </div>
      </div>

      {/* This Task Depends On */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            This Task Depends On
          </h4>
          {!isAddingDependency && (
            <button
              onClick={() => setIsAddingDependency(true)}
              className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              + Add Dependency
            </button>
          )}
        </div>

        {dependencies.length === 0 && !isAddingDependency && (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-xs bg-gray-50 dark:bg-gray-900 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
            No dependencies. This task can be started anytime.
          </div>
        )}

        {dependencies.length > 0 && (
          <div className="space-y-2">
            {dependencies.map((dep) => (
              <div
                key={dep.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      dep.completed ? 'bg-green-500' : 'bg-orange-500'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-sm ${
                        dep.completed
                          ? 'line-through text-gray-500 dark:text-gray-400'
                          : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {dep.text}
                    </div>
                    {dep.completed && (
                      <div className="text-xs text-green-600 dark:text-green-400">Completed</div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveDependency(dep.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors flex-shrink-0"
                  title="Remove dependency"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add Dependency Form */}
        {isAddingDependency && (
          <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
            {circularWarning && (
              <div className="mb-2 p-2 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded text-xs text-red-700 dark:text-red-300">
                {circularWarning}
              </div>
            )}
            <select
              value={selectedTaskId}
              onChange={(e) => {
                setSelectedTaskId(e.target.value);
                setCircularWarning('');
              }}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white mb-2"
            >
              <option value="">Select a task...</option>
              {availableTasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.text}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={handleAddDependency}
                disabled={!selectedTaskId}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setIsAddingDependency(false);
                  setSelectedTaskId('');
                  setCircularWarning('');
                }}
                className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tasks Blocked By This */}
      {blockingTasks.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
            Tasks Blocked By This
          </h4>
          <div className="space-y-2">
            {blockingTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800"
              >
                <svg
                  className="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-900 dark:text-white">{task.text}</div>
                  <div className="text-xs text-orange-600 dark:text-orange-400">
                    Waiting for this task to complete
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <svg
            className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Dependencies help you manage task order. A task can only be started when all its
            dependencies are completed. This prevents circular dependencies automatically.
          </div>
        </div>
      </div>
    </div>
  );
}
