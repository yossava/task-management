import { TaskFilters, TaskSort } from '@/lib/types';

export interface FilterPreset {
  id: string;
  name: string;
  description?: string;
  filters: TaskFilters;
  sort: TaskSort;
  createdAt: number;
  isDefault?: boolean;
}

const STORAGE_KEY = 'filter_presets';

export class FilterPresetService {
  static getAll(): FilterPreset[] {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return this.getDefaultPresets();

      const presets = JSON.parse(stored) as FilterPreset[];
      return [...this.getDefaultPresets(), ...presets];
    } catch (error) {
      console.error('Error loading filter presets:', error);
      return this.getDefaultPresets();
    }
  }

  static getById(id: string): FilterPreset | undefined {
    return this.getAll().find(preset => preset.id === id);
  }

  static save(preset: Omit<FilterPreset, 'id' | 'createdAt'>): FilterPreset {
    const presets = this.getAll().filter(p => !p.isDefault);

    const newPreset: FilterPreset = {
      ...preset,
      id: `preset-${Date.now()}`,
      createdAt: Date.now(),
    };

    presets.push(newPreset);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
    } catch (error) {
      console.error('Error saving filter preset:', error);
    }

    return newPreset;
  }

  static update(id: string, updates: Partial<Omit<FilterPreset, 'id' | 'createdAt'>>): FilterPreset | null {
    const presets = this.getAll().filter(p => !p.isDefault);
    const index = presets.findIndex(p => p.id === id);

    if (index === -1) return null;

    presets[index] = { ...presets[index], ...updates };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
    } catch (error) {
      console.error('Error updating filter preset:', error);
      return null;
    }

    return presets[index];
  }

  static delete(id: string): boolean {
    const presets = this.getAll().filter(p => !p.isDefault && p.id !== id);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
      return true;
    } catch (error) {
      console.error('Error deleting filter preset:', error);
      return false;
    }
  }

  static getDefaultPresets(): FilterPreset[] {
    return [
      {
        id: 'all-tasks',
        name: 'All Tasks',
        description: 'Show all tasks',
        filters: {
          priorities: [],
          tags: [],
          dateFilter: 'all',
          showCompleted: true,
          searchQuery: '',
        },
        sort: {
          option: 'priority',
          direction: 'desc',
        },
        createdAt: 0,
        isDefault: true,
      },
      {
        id: 'urgent',
        name: 'Urgent',
        description: 'High priority and urgent tasks',
        filters: {
          priorities: ['urgent', 'high'],
          tags: [],
          dateFilter: 'all',
          showCompleted: false,
          searchQuery: '',
        },
        sort: {
          option: 'priority',
          direction: 'desc',
        },
        createdAt: 0,
        isDefault: true,
      },
      {
        id: 'due-soon',
        name: 'Due Soon',
        description: 'Tasks due this week',
        filters: {
          priorities: [],
          tags: [],
          dateFilter: 'week',
          showCompleted: false,
          searchQuery: '',
        },
        sort: {
          option: 'dueDate',
          direction: 'asc',
        },
        createdAt: 0,
        isDefault: true,
      },
      {
        id: 'overdue',
        name: 'Overdue',
        description: 'Tasks past their due date',
        filters: {
          priorities: [],
          tags: [],
          dateFilter: 'overdue',
          showCompleted: false,
          searchQuery: '',
        },
        sort: {
          option: 'dueDate',
          direction: 'asc',
        },
        createdAt: 0,
        isDefault: true,
      },
      {
        id: 'today',
        name: 'Today',
        description: 'Tasks due today',
        filters: {
          priorities: [],
          tags: [],
          dateFilter: 'today',
          showCompleted: false,
          searchQuery: '',
        },
        sort: {
          option: 'priority',
          direction: 'desc',
        },
        createdAt: 0,
        isDefault: true,
      },
      {
        id: 'incomplete',
        name: 'Incomplete',
        description: 'All unfinished tasks',
        filters: {
          priorities: [],
          tags: [],
          dateFilter: 'all',
          showCompleted: false,
          searchQuery: '',
        },
        sort: {
          option: 'dueDate',
          direction: 'asc',
        },
        createdAt: 0,
        isDefault: true,
      },
    ];
  }
}
