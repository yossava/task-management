'use client';

import { useState, useEffect } from 'react';
import { TaskFilters, TaskSort } from '@/lib/types';
import { FilterPresetService, FilterPreset } from '@/lib/services/filterPresetService';

interface QuickFiltersProps {
  onApplyPreset: (filters: TaskFilters, sort: TaskSort) => void;
  currentFilters: TaskFilters;
  currentSort: TaskSort;
}

export default function QuickFilters({ onApplyPreset, currentFilters, currentSort }: QuickFiltersProps) {
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = () => {
    const allPresets = FilterPresetService.getAll();
    setPresets(allPresets.filter(p => p.isDefault));
  };

  const handlePresetClick = (preset: FilterPreset) => {
    setActivePresetId(preset.id);
    onApplyPreset(preset.filters, preset.sort);
  };

  // Check if a preset matches current filters
  const isPresetActive = (preset: FilterPreset): boolean => {
    return (
      preset.id === activePresetId ||
      (JSON.stringify(preset.filters) === JSON.stringify(currentFilters) &&
        JSON.stringify(preset.sort) === JSON.stringify(currentSort))
    );
  };

  const getPresetIcon = (presetId: string) => {
    switch (presetId) {
      case 'all-tasks':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        );
      case 'urgent':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'due-soon':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'overdue':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'today':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'incomplete':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        );
    }
  };

  const getPresetColor = (presetId: string): string => {
    switch (presetId) {
      case 'all-tasks':
        return 'from-gray-500 to-gray-600';
      case 'urgent':
        return 'from-red-500 to-red-600';
      case 'due-soon':
        return 'from-yellow-500 to-orange-500';
      case 'overdue':
        return 'from-red-600 to-red-700';
      case 'today':
        return 'from-blue-500 to-blue-600';
      case 'incomplete':
        return 'from-purple-500 to-purple-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Quick Filters</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {presets.map((preset) => {
          const isActive = isPresetActive(preset);
          return (
            <button
              key={preset.id}
              onClick={() => handlePresetClick(preset)}
              className={`relative flex flex-col items-center gap-2 p-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-gradient-to-br shadow-md ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-gray-900'
                  : 'bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700'
              } ${isActive ? getPresetColor(preset.id) : ''}`}
              title={preset.description}
            >
              <div className={`${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                {getPresetIcon(preset.id)}
              </div>
              <span className={`text-xs font-medium text-center leading-tight ${
                isActive ? 'text-white' : 'text-gray-700 dark:text-gray-300'
              }`}>
                {preset.name}
              </span>
              {isActive && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm">
                  <svg className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
