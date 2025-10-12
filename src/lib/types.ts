export interface SubtaskItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: number;
}

export interface TaskComment {
  id: string;
  taskId: string;
  boardId: string;
  content: string;
  author: string;
  createdAt: number;
  updatedAt: number;
}

export interface TaskDependency {
  id: string;
  taskId: string;
  dependsOnTaskId: string;
  boardId: string;
  type: 'blocks' | 'blocked_by';
  createdAt: number;
}

export interface RecurringTask {
  id: string;
  boardId: string;
  templateTaskId: string;
  pattern: RecurringPattern;
  nextDueDate: number;
  lastGenerated?: number;
  isActive: boolean;
  createdAt: number;
}

export type RecurringPattern = {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  interval: number; // Every N days/weeks/months
  daysOfWeek?: number[]; // 0-6 for weekly patterns
  dayOfMonth?: number; // 1-31 for monthly patterns
  endDate?: number; // Optional end date
};

export interface BoardTask {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  dueDate?: number;
  color?: string;
  showGradient?: boolean;
  description?: string; // Markdown content
  progress?: number; // 0-100
  subtasks?: SubtaskItem[];
  priority?: Priority;
  tags?: string[]; // Array of tag IDs
  comments?: TaskComment[];
  dependencies?: string[]; // Array of dependency IDs
  recurringTaskId?: string; // Link to recurring task template
  completedAt?: number; // When task was completed

  // Feature 2: Team Collaboration
  assigneeIds?: string[]; // Assigned user IDs

  // Feature 4: Time Tracking
  estimatedTime?: number; // Estimated minutes
  actualTime?: number; // Tracked minutes
  timeLogs?: TimeLog[]; // Detailed time entries
  activeTimer?: ActiveTimer; // Currently running timer
}

export interface Board {
  id: string;
  title: string;
  description?: string;
  columns: Column[];
  tasks: BoardTask[];
  tags?: Tag[]; // Board-level tag definitions
  createdAt: number;
  updatedAt: number;
  color?: string;
  isFavorite?: boolean;
}

export interface Column {
  id: string;
  title: string;
  boardId: string;
  taskIds: string[];
  order: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  boardId: string;
  priority: Priority;
  status: string;
  assigneeIds: string[];
  tags: string[];
  dueDate?: number;
  createdAt: number;
  updatedAt: number;
  comments: Comment[];
  estimatedTime?: number;
  actualTime?: number;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  color: string;
}

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type SortOption = 'priority' | 'dueDate' | 'createdAt' | 'progress' | 'alphabetical';
export type SortDirection = 'asc' | 'desc';

export type DateFilterOption = 'all' | 'overdue' | 'today' | 'week' | 'month' | 'noDate';

export interface TaskFilters {
  priorities: Priority[];
  tags: string[];
  dateFilter: DateFilterOption;
  customDateRange?: { start: number; end: number };
  showCompleted: boolean;
  searchQuery: string;
}

export interface TaskSort {
  option: SortOption;
  direction: SortDirection;
}
export type ViewMode = 'board' | 'list' | 'calendar';

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  defaultView: ViewMode;
  compactMode: boolean;
}

export interface BoardTemplate {
  id: string;
  name: string;
  description: string;
  category: 'productivity' | 'development' | 'marketing' | 'personal' | 'business';
  icon: string;
  color: string;
  tags?: Omit<Tag, 'createdAt'>[];
  sampleTasks?: Omit<BoardTask, 'id' | 'createdAt'>[];
  isCustom: boolean;
  createdAt: number;
}

export type ActivityType =
  | 'board_created'
  | 'board_updated'
  | 'board_deleted'
  | 'task_created'
  | 'task_updated'
  | 'task_completed'
  | 'task_deleted'
  | 'task_moved'
  | 'tag_created'
  | 'tag_updated'
  | 'tag_deleted';

export interface ActivityLog {
  id: string;
  type: ActivityType;
  boardId: string;
  boardTitle: string;
  taskId?: string;
  taskText?: string;
  tagId?: string;
  tagName?: string;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  timestamp: number;
}

export type NotificationType = 'due_soon' | 'overdue' | 'task_completed' | 'board_created' | 'task_assigned';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  boardId?: string;
  taskId?: string;
  read: boolean;
  timestamp: number;
  actionUrl?: string;
}

// Feature 4: Time Tracking Types
export interface TimeLog {
  id: string;
  taskId: string;
  boardId: string;
  startTime: number;
  endTime: number;
  duration: number; // Minutes
  note?: string;
  userId?: string;
}

export interface ActiveTimer {
  taskId: string;
  boardId: string;
  startTime: number;
  userId?: string;
}

// Feature 3: Advanced Search Types
export interface SavedSearch {
  id: string;
  name: string;
  query: SearchQuery;
  createdAt: number;
  lastUsed?: number;
}

export interface SearchQuery {
  text?: string;
  priorities?: Priority[];
  tags?: string[];
  assignees?: string[];
  dateRange?: { start?: number; end?: number };
  hasSubtasks?: boolean;
  hasDependencies?: boolean;
  isRecurring?: boolean;
  estimatedTimeRange?: { min?: number; max?: number };
  boardIds?: string[];
}

export interface SearchHistory {
  id: string;
  query: string;
  timestamp: number;
  resultsCount: number;
}
