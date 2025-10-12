'use client';

import { useState, useEffect } from 'react';
import { RecurringPattern, BoardTask } from '@/lib/types';
import { RecurringTaskService } from '@/lib/services/recurringTaskService';

interface RecurringTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
  taskId: string;
  currentTask: BoardTask;
  onUpdate: () => void;
}

const DAYS_OF_WEEK = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 0, label: 'Sun' },
];

export default function RecurringTaskModal({
  isOpen,
  onClose,
  boardId,
  taskId,
  currentTask,
  onUpdate,
}: RecurringTaskModalProps) {
  const [frequency, setFrequency] = useState<RecurringPattern['frequency']>('daily');
  const [interval, setInterval] = useState(1);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [hasEndDate, setHasEndDate] = useState(false);
  const [endDate, setEndDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [existingRecurring, setExistingRecurring] = useState<any>(null);
  const [isLoadingRecurring, setIsLoadingRecurring] = useState(false);

  // Fetch existing recurring task if any
  useEffect(() => {
    if (currentTask.recurringTaskId && isOpen) {
      setIsLoadingRecurring(true);
      fetch(`/api/recurring-tasks/${currentTask.recurringTaskId}`)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch recurring task');
          return res.json();
        })
        .then((data) => {
          setExistingRecurring(data.recurringTask);
        })
        .catch((error) => {
          console.error('Error fetching recurring task:', error);
        })
        .finally(() => {
          setIsLoadingRecurring(false);
        });
    } else if (!isOpen) {
      // Reset when modal closes
      setExistingRecurring(null);
    }
  }, [currentTask.recurringTaskId, isOpen]);

  // Populate form fields when existing recurring task is loaded
  useEffect(() => {
    if (existingRecurring) {
      setFrequency(existingRecurring.pattern.frequency);
      setInterval(existingRecurring.pattern.interval);
      setDaysOfWeek(existingRecurring.pattern.daysOfWeek || []);
      setDayOfMonth(existingRecurring.pattern.dayOfMonth || 1);
      if (existingRecurring.pattern.endDate) {
        setHasEndDate(true);
        setEndDate(new Date(existingRecurring.pattern.endDate).toISOString().split('T')[0]);
      }
    }
  }, [existingRecurring]);

  const handleDayOfWeekToggle = (day: number) => {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const buildPattern = (): RecurringPattern => {
    const pattern: RecurringPattern = {
      frequency,
      interval,
    };

    if (frequency === 'weekly' && daysOfWeek.length > 0) {
      pattern.daysOfWeek = daysOfWeek;
    }

    if (frequency === 'monthly') {
      pattern.dayOfMonth = dayOfMonth;
    }

    if (hasEndDate && endDate) {
      pattern.endDate = new Date(endDate).getTime();
    }

    return pattern;
  };

  const getPatternPreview = (): string => {
    const pattern = buildPattern();
    return RecurringTaskService.getPatternDescription(pattern);
  };

  const getNextOccurrence = (): string => {
    const pattern = buildPattern();
    const nextDate = RecurringTaskService.calculateNextDueDate(Date.now(), pattern);
    return new Date(nextDate).toLocaleDateString('default', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const pattern = buildPattern();
      const nextDueDate = RecurringTaskService.calculateNextDueDate(Date.now(), pattern);

      if (existingRecurring) {
        // Update existing recurring task
        const response = await fetch(`/api/recurring-tasks/${existingRecurring.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pattern: {
              frequency: pattern.frequency,
              interval: pattern.interval,
              daysOfWeek: pattern.daysOfWeek,
              dayOfMonth: pattern.dayOfMonth,
              endDate: pattern.endDate ? new Date(pattern.endDate).toISOString() : undefined,
            },
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update recurring task');
        }
      } else {
        // Create new recurring task
        const response = await fetch('/api/recurring-tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            boardId,
            taskId,
            pattern: {
              frequency: pattern.frequency,
              interval: pattern.interval,
              daysOfWeek: pattern.daysOfWeek,
              dayOfMonth: pattern.dayOfMonth,
              endDate: pattern.endDate ? new Date(pattern.endDate).toISOString() : undefined,
            },
            nextDueDate: new Date(nextDueDate).toISOString(),
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create recurring task');
        }
      }

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error saving recurring task:', error);
      alert('Failed to save recurring task. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!existingRecurring) return;
    if (!confirm('Delete this recurring task? Future instances will not be created.')) return;

    try {
      const response = await fetch(`/api/recurring-tasks/${existingRecurring.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete recurring task');
      }

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error deleting recurring task:', error);
      alert('Failed to delete recurring task. Please try again.');
    }
  };

  const handleToggleActive = async () => {
    if (!existingRecurring) return;

    try {
      const response = await fetch(`/api/recurring-tasks/${existingRecurring.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isActive: !existingRecurring.isActive,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle recurring task');
      }

      onUpdate();
    } catch (error) {
      console.error('Error toggling recurring task:', error);
      alert('Failed to toggle recurring task. Please try again.');
    }
  };

  if (!isOpen) return null;

  const isWeeklyValid = frequency !== 'weekly' || daysOfWeek.length > 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-br from-purple-600 to-pink-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {existingRecurring ? 'Edit Recurring Task' : 'Make Task Recurring'}
                </h2>
                <p className="text-sm text-white/80">Configure automatic task generation</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Task Preview */}
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Task</div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {currentTask.text}
            </div>
          </div>

          {/* Active Status Toggle (for existing recurring tasks) */}
          {existingRecurring && (
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  Recurring Task Active
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {existingRecurring.isActive
                    ? 'New instances will be created automatically'
                    : 'Paused - no new instances will be created'}
                </div>
              </div>
              <button
                onClick={handleToggleActive}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  existingRecurring.isActive ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    existingRecurring.isActive ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          )}

          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Frequency
            </label>
            <div className="grid grid-cols-5 gap-2">
              {(['daily', 'weekly', 'monthly', 'yearly', 'custom'] as const).map((freq) => (
                <button
                  key={freq}
                  onClick={() => setFrequency(freq)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    frequency === freq
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {freq.charAt(0).toUpperCase() + freq.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Interval */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Repeat Every
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max="365"
                value={interval}
                onChange={(e) => setInterval(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {frequency === 'daily' && `day${interval > 1 ? 's' : ''}`}
                {frequency === 'weekly' && `week${interval > 1 ? 's' : ''}`}
                {frequency === 'monthly' && `month${interval > 1 ? 's' : ''}`}
                {frequency === 'yearly' && `year${interval > 1 ? 's' : ''}`}
                {frequency === 'custom' && 'days'}
              </span>
            </div>
          </div>

          {/* Days of Week (for weekly) */}
          {frequency === 'weekly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                On Days
              </label>
              <div className="flex gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <button
                    key={day.value}
                    onClick={() => handleDayOfWeekToggle(day.value)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      daysOfWeek.includes(day.value)
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
              {daysOfWeek.length === 0 && (
                <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                  Please select at least one day
                </div>
              )}
            </div>
          )}

          {/* Day of Month (for monthly) */}
          {frequency === 'monthly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                On Day of Month
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(Math.max(1, Math.min(31, parseInt(e.target.value) || 1)))}
                className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                For months with fewer days, the last day of the month will be used
              </div>
            </div>
          )}

          {/* End Date */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                End Date (Optional)
              </label>
              <button
                onClick={() => setHasEndDate(!hasEndDate)}
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                {hasEndDate ? 'Remove' : 'Add End Date'}
              </button>
            </div>
            {hasEndDate && (
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            )}
          </div>

          {/* Preview */}
          <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">Preview</div>
            <div className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              {getPatternPreview()}
            </div>
            {isWeeklyValid && (
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Next occurrence: <span className="font-medium">{getNextOccurrence()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 p-4 rounded-b-2xl border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            {existingRecurring && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                Delete Recurring Task
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !isWeeklyValid}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              {isSaving ? 'Saving...' : existingRecurring ? 'Update' : 'Create Recurring Task'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
