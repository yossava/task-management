'use client';

import { useState, useEffect } from 'react';
import { SettingsService } from '@/lib/services/scrumService';
import type { ScrumSettings } from '@/lib/types/scrum';

export default function SettingsConfig() {
  const [settings, setSettings] = useState<ScrumSettings | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const currentSettings = SettingsService.get();
    setSettings(currentSettings);
  }, []);

  const handleChange = (field: keyof ScrumSettings, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
    setHasChanges(true);
  };

  const handleToggleDay = (day: number) => {
    if (!settings) return;
    const workingDays = settings.workingDays.includes(day)
      ? settings.workingDays.filter(d => d !== day)
      : [...settings.workingDays, day].sort();

    setSettings({ ...settings, workingDays });
    setHasChanges(true);
  };

  const handleToggleNotification = (key: keyof ScrumSettings['notifications']) => {
    if (!settings) return;
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: !settings.notifications[key],
      },
    });
    setHasChanges(true);
  };

  const handleSave = () => {
    if (!settings) return;
    SettingsService.update(settings);
    setHasChanges(false);
  };

  const handleReset = () => {
    const currentSettings = SettingsService.get();
    setSettings(currentSettings);
    setHasChanges(false);
  };

  if (!settings) {
    return <div className="text-center py-8">Loading...</div>;
  }

  const daysOfWeek = [
    { value: 0, label: 'Sun' },
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' },
  ];

  const storyPointScales = [
    { name: 'Fibonacci', values: [1, 2, 3, 5, 8, 13, 21] },
    { name: 'Linear', values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
    { name: 'T-Shirt', values: [1, 2, 4, 8, 16] },
    { name: 'Powers of 2', values: [1, 2, 4, 8, 16, 32] },
  ];

  const isScaleSelected = (scale: number[]) => {
    return JSON.stringify(settings.storyPointScale.sort()) === JSON.stringify(scale.sort());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            General Settings
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Configure your scrum board preferences
          </p>
        </div>
        {hasChanges && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Sprint Configuration */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Sprint Configuration
        </h3>

        <div className="space-y-4">
          {/* Sprint Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Default Sprint Duration (weeks)
            </label>
            <select
              value={settings.defaultSprintDuration}
              onChange={(e) => handleChange('defaultSprintDuration', parseInt(e.target.value))}
              className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            >
              <option value={1}>1 week</option>
              <option value={2}>2 weeks</option>
              <option value={3}>3 weeks</option>
              <option value={4}>4 weeks</option>
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              New sprints will default to this duration
            </p>
          </div>

          {/* Daily Capacity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Daily Capacity (hours)
            </label>
            <input
              type="number"
              min={1}
              max={24}
              value={settings.dailyCapacity}
              onChange={(e) => handleChange('dailyCapacity', parseInt(e.target.value))}
              className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Average working hours per team member per day
            </p>
          </div>

          {/* Working Days */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Working Days
            </label>
            <div className="flex gap-2">
              {daysOfWeek.map((day) => (
                <button
                  key={day.value}
                  onClick={() => handleToggleDay(day.value)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    settings.workingDays.includes(day.value)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Select the days your team works
            </p>
          </div>
        </div>
      </div>

      {/* Story Points */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Story Points Scale
        </h3>

        <div className="space-y-3">
          {storyPointScales.map((scale) => (
            <button
              key={scale.name}
              onClick={() => handleChange('storyPointScale', scale.values)}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                isScaleSelected(scale.values)
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white mb-1">
                    {scale.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {scale.values.join(', ')}
                  </div>
                </div>
                {isScaleSelected(scale.values) && (
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">
          Choose the scale for estimating story points
        </p>
      </div>

      {/* Notifications */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Notifications
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                Email Notifications
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Receive updates via email
              </div>
            </div>
            <button
              onClick={() => handleToggleNotification('email')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.notifications.email ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.notifications.email ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                Push Notifications
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Browser push notifications
              </div>
            </div>
            <button
              onClick={() => handleToggleNotification('push')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.notifications.push ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.notifications.push ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                Mentions
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                When someone mentions you
              </div>
            </div>
            <button
              onClick={() => handleToggleNotification('mentions')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.notifications.mentions ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.notifications.mentions ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                Assignments
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                When a story is assigned to you
              </div>
            </div>
            <button
              onClick={() => handleToggleNotification('assignments')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.notifications.assignments ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.notifications.assignments ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
