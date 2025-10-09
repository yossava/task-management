import type { Priority } from './types';

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string }> = {
  low: {
    label: 'Low',
    color: 'text-green-600',
    bg: 'bg-green-100 dark:bg-green-900/30',
  },
  medium: {
    label: 'Medium',
    color: 'text-yellow-600',
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
  },
  high: {
    label: 'High',
    color: 'text-orange-600',
    bg: 'bg-orange-100 dark:bg-orange-900/30',
  },
  urgent: {
    label: 'Urgent',
    color: 'text-red-600',
    bg: 'bg-red-100 dark:bg-red-900/30',
  },
};

export const DEFAULT_COLUMNS = [
  { title: 'To Do', order: 0 },
  { title: 'In Progress', order: 1 },
  { title: 'Review', order: 2 },
  { title: 'Done', order: 3 },
];

export const APP_NAME = 'TaskFlow';
export const APP_DESCRIPTION = 'Enterprise Project Management';
