/**
 * API Client utilities for frontend
 */

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.error || 'An error occurred',
      response.status,
      errorData.details
    );
  }
  return response.json();
}

// Board API
export const boardsApi = {
  async getAll() {
    const response = await fetch('/api/boards');
    return handleResponse<{ boards: any[] }>(response);
  },

  async getOne(id: string) {
    const response = await fetch(`/api/boards/${id}`);
    return handleResponse<{ board: any }>(response);
  },

  async create(data: { title: string; description?: string; color?: string }) {
    const response = await fetch('/api/boards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<{ board: any }>(response);
  },

  async update(id: string, data: { title?: string; description?: string; color?: string }) {
    const response = await fetch(`/api/boards/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<{ board: any }>(response);
  },

  async delete(id: string) {
    const response = await fetch(`/api/boards/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<{ message: string }>(response);
  },

  async reorder(boards: { id: string; order: number }[]) {
    const response = await fetch('/api/boards/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ boards }),
    });
    return handleResponse<{ message: string }>(response);
  },
};

// Task API
export const tasksApi = {
  async getByBoard(boardId: string) {
    const response = await fetch(`/api/boards/${boardId}/tasks`);
    return handleResponse<{ tasks: any[] }>(response);
  },

  async create(boardId: string, data: { text: string; order?: number }) {
    const response = await fetch(`/api/boards/${boardId}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<{ task: any }>(response);
  },

  async update(id: string, data: {
    text?: string;
    completed?: boolean;
    description?: string;
    color?: string;
    showGradient?: boolean;
    dueDate?: string | null;
    progress?: number;
    checklist?: any[];
    boardId?: string;
    order?: number;
  }) {
    const response = await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<{ task: any }>(response);
  },

  async delete(id: string) {
    const response = await fetch(`/api/tasks/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<{ message: string }>(response);
  },

  async reorder(tasks: { id: string; order: number; boardId?: string }[]) {
    const response = await fetch('/api/tasks/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tasks }),
    });
    return handleResponse<{ message: string }>(response);
  },
};

// Settings API
export const settingsApi = {
  async getHeader() {
    const response = await fetch('/api/settings/header');
    return handleResponse<{ header: any }>(response);
  },

  async updateHeader(data: { title: string; subtitle: string }) {
    const response = await fetch('/api/settings/header', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<{ header: any }>(response);
  },
};

// Auth API
export const authApi = {
  async register(data: { name?: string; email: string; password: string }) {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<{ message: string; user: any }>(response);
  },

  async migrateGuest() {
    const response = await fetch('/api/auth/migrate-guest', {
      method: 'POST',
    });
    return handleResponse<{ message: string; migratedBoards: number }>(response);
  },
};
