export interface BoardTask {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export interface Board {
  id: string;
  title: string;
  description?: string;
  columns: Column[];
  tasks: BoardTask[];
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
export type ViewMode = 'board' | 'list' | 'calendar';

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  defaultView: ViewMode;
  compactMode: boolean;
}
