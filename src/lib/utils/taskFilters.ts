import { BoardTask, TaskFilters, TaskSort, Priority } from '@/lib/types';

// Priority ranking for sorting
const PRIORITY_RANK: Record<Priority, number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
};

/**
 * Check if a date is within today
 */
function isToday(timestamp: number): boolean {
  const today = new Date();
  const date = new Date(timestamp);
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if a date is within this week
 */
function isThisWeek(timestamp: number): boolean {
  const today = new Date();
  const date = new Date(timestamp);
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  return date >= weekStart && date < weekEnd;
}

/**
 * Check if a date is within this month
 */
function isThisMonth(timestamp: number): boolean {
  const today = new Date();
  const date = new Date(timestamp);
  return (
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if a task is overdue
 */
function isOverdue(timestamp: number): boolean {
  return Date.now() > timestamp;
}

/**
 * Filter tasks based on provided filters
 */
export function filterTasks(tasks: BoardTask[], filters: TaskFilters): BoardTask[] {
  return tasks.filter(task => {
    // Completion status filter
    if (!filters.showCompleted && task.completed) {
      return false;
    }

    // Search query filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const textMatch = task.text.toLowerCase().includes(query);
      const descMatch = task.description?.toLowerCase().includes(query);
      const checklistMatch = task.checklist?.some(item =>
        item.text.toLowerCase().includes(query)
      );

      if (!textMatch && !descMatch && !checklistMatch) {
        return false;
      }
    }

    // Priority filter
    if (filters.priorities.length > 0) {
      if (!task.priority || !filters.priorities.includes(task.priority)) {
        return false;
      }
    }

    // Tag filter
    if (filters.tags.length > 0) {
      if (!task.tags || !filters.tags.some(tagId => task.tags?.includes(tagId))) {
        return false;
      }
    }

    // Date filter
    if (filters.dateFilter !== 'all') {
      switch (filters.dateFilter) {
        case 'overdue':
          if (!task.dueDate || !isOverdue(task.dueDate) || task.completed) {
            return false;
          }
          break;
        case 'today':
          if (!task.dueDate || !isToday(task.dueDate)) {
            return false;
          }
          break;
        case 'week':
          if (!task.dueDate || !isThisWeek(task.dueDate)) {
            return false;
          }
          break;
        case 'month':
          if (!task.dueDate || !isThisMonth(task.dueDate)) {
            return false;
          }
          break;
        case 'noDate':
          if (task.dueDate) {
            return false;
          }
          break;
      }
    }

    // Custom date range filter
    if (filters.customDateRange && task.dueDate) {
      const { start, end } = filters.customDateRange;
      if (task.dueDate < start || task.dueDate > end) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Sort tasks based on provided sort option
 */
export function sortTasks(tasks: BoardTask[], sort: TaskSort): BoardTask[] {
  const sorted = [...tasks].sort((a, b) => {
    let comparison = 0;

    switch (sort.option) {
      case 'priority': {
        const aPriority = a.priority ? PRIORITY_RANK[a.priority] : 0;
        const bPriority = b.priority ? PRIORITY_RANK[b.priority] : 0;
        comparison = bPriority - aPriority; // Higher priority first
        break;
      }
      case 'dueDate': {
        const aDate = a.dueDate || Infinity;
        const bDate = b.dueDate || Infinity;
        comparison = aDate - bDate; // Earlier dates first
        break;
      }
      case 'createdAt': {
        comparison = a.createdAt - b.createdAt; // Older tasks first
        break;
      }
      case 'progress': {
        const aProgress = a.progress || 0;
        const bProgress = b.progress || 0;
        comparison = bProgress - aProgress; // Higher progress first
        break;
      }
      case 'alphabetical': {
        comparison = a.text.localeCompare(b.text);
        break;
      }
    }

    return sort.direction === 'asc' ? comparison : -comparison;
  });

  return sorted;
}

/**
 * Filter and sort tasks in one operation
 */
export function filterAndSortTasks(
  tasks: BoardTask[],
  filters: TaskFilters,
  sort: TaskSort
): BoardTask[] {
  const filtered = filterTasks(tasks, filters);
  return sortTasks(filtered, sort);
}
