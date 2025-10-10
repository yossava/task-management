export interface ChecklistItem {
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
  checklist?: ChecklistItem[];
  priority?: Priority;
  tags?: string[]; // Array of tag IDs
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
