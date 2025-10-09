import { Board, BoardTask } from '../types';
import { BoardService } from './boardService';

export interface SearchFilters {
  query?: string;
  colors?: string[];
  hasDate?: boolean;
  isOverdue?: boolean;
  isCompleted?: boolean;
  boardIds?: string[];
}

export interface SearchResult {
  boardId: string;
  boardTitle: string;
  boardColor?: string;
  task: BoardTask;
  matchedIn: 'title' | 'description';
}

export class SearchService {
  /**
   * Search across all boards and tasks
   */
  static search(filters: SearchFilters): SearchResult[] {
    const boards = BoardService.getAll();
    const results: SearchResult[] = [];

    boards.forEach((board) => {
      // Filter by boardIds if specified
      if (filters.boardIds && filters.boardIds.length > 0) {
        if (!filters.boardIds.includes(board.id)) {
          return;
        }
      }

      board.tasks?.forEach((task) => {
        if (this.matchesFilters(task, filters, board)) {
          results.push({
            boardId: board.id,
            boardTitle: board.title,
            boardColor: board.color,
            task,
            matchedIn: this.getMatchedField(task, filters.query),
          });
        }
      });
    });

    return results;
  }

  /**
   * Check if task matches all filters
   */
  private static matchesFilters(
    task: BoardTask,
    filters: SearchFilters,
    board: Board
  ): boolean {
    // Text search
    if (filters.query && filters.query.trim()) {
      const query = filters.query.toLowerCase();
      const taskText = task.text.toLowerCase();

      if (!taskText.includes(query)) {
        return false;
      }
    }

    // Color filter
    if (filters.colors && filters.colors.length > 0) {
      if (!task.color || !filters.colors.includes(task.color)) {
        return false;
      }
    }

    // Has date filter
    if (filters.hasDate !== undefined) {
      const hasDate = !!task.dueDate;
      if (hasDate !== filters.hasDate) {
        return false;
      }
    }

    // Overdue filter
    if (filters.isOverdue) {
      if (!task.dueDate || Date.now() <= task.dueDate || task.completed) {
        return false;
      }
    }

    // Completed filter
    if (filters.isCompleted !== undefined) {
      if (task.completed !== filters.isCompleted) {
        return false;
      }
    }

    return true;
  }

  /**
   * Determine which field matched the search query
   */
  private static getMatchedField(
    task: BoardTask,
    query?: string
  ): 'title' | 'description' {
    if (!query) return 'title';

    const lowerQuery = query.toLowerCase();
    const taskText = task.text.toLowerCase();

    if (taskText.includes(lowerQuery)) {
      return 'title';
    }

    return 'title';
  }

  /**
   * Get all unique colors from all tasks
   */
  static getAllColors(): string[] {
    const boards = BoardService.getAll();
    const colors = new Set<string>();

    boards.forEach((board) => {
      board.tasks?.forEach((task) => {
        if (task.color) {
          colors.add(task.color);
        }
      });
    });

    return Array.from(colors).sort();
  }

  /**
   * Get search suggestions based on partial query
   */
  static getSuggestions(query: string, limit = 5): string[] {
    if (!query.trim()) return [];

    const boards = BoardService.getAll();
    const suggestions = new Set<string>();
    const lowerQuery = query.toLowerCase();

    boards.forEach((board) => {
      // Add board title if matches
      if (board.title.toLowerCase().includes(lowerQuery)) {
        suggestions.add(board.title);
      }

      // Add task text if matches
      board.tasks?.forEach((task) => {
        if (task.text.toLowerCase().includes(lowerQuery)) {
          suggestions.add(task.text);
        }
      });
    });

    return Array.from(suggestions).slice(0, limit);
  }

  /**
   * Get recent searches from localStorage
   */
  static getRecentSearches(): string[] {
    try {
      const recent = localStorage.getItem('podotask_recent_searches');
      return recent ? JSON.parse(recent) : [];
    } catch {
      return [];
    }
  }

  /**
   * Save search query to recent searches
   */
  static saveRecentSearch(query: string): void {
    if (!query.trim()) return;

    try {
      const recent = this.getRecentSearches();
      const updated = [query, ...recent.filter((q) => q !== query)].slice(0, 10);
      localStorage.setItem('podotask_recent_searches', JSON.stringify(updated));
    } catch {
      // Ignore localStorage errors
    }
  }

  /**
   * Clear recent searches
   */
  static clearRecentSearches(): void {
    try {
      localStorage.removeItem('podotask_recent_searches');
    } catch {
      // Ignore localStorage errors
    }
  }
}
