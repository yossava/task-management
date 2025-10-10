import { BoardTask, Board, SearchQuery, SavedSearch, SearchHistory } from '@/lib/types';
import { BoardService } from './boardService';
import { StorageService } from '@/lib/storage';

const SAVED_SEARCHES_KEY = 'saved_searches';
const SEARCH_HISTORY_KEY = 'search_history';

export class AdvancedSearchService {
  /**
   * Perform advanced search across all boards
   */
  static search(query: SearchQuery): { board: Board; task: BoardTask }[] {
    const boards = BoardService.getAll();
    const results: { board: Board; task: BoardTask }[] = [];

    boards.forEach((board) => {
      // Filter by board IDs if specified
      if (query.boardIds && query.boardIds.length > 0) {
        if (!query.boardIds.includes(board.id)) return;
      }

      board.tasks.forEach((task) => {
        if (this.matchesQuery(task, query)) {
          results.push({ board, task });
        }
      });
    });

    return results;
  }

  /**
   * Check if a task matches the search query
   */
  static matchesQuery(task: BoardTask, query: SearchQuery): boolean {
    // Text search
    if (query.text) {
      const searchText = query.text.toLowerCase();
      const taskText = task.text.toLowerCase();
      const description = (task.description || '').toLowerCase();

      if (!taskText.includes(searchText) && !description.includes(searchText)) {
        return false;
      }
    }

    // Priority filter
    if (query.priorities && query.priorities.length > 0) {
      if (!task.priority || !query.priorities.includes(task.priority)) {
        return false;
      }
    }

    // Tags filter
    if (query.tags && query.tags.length > 0) {
      if (!task.tags || !query.tags.some((tag) => task.tags?.includes(tag))) {
        return false;
      }
    }

    // Assignees filter
    if (query.assignees && query.assignees.length > 0) {
      if (!task.assigneeIds || !query.assignees.some((assignee) => task.assigneeIds?.includes(assignee))) {
        return false;
      }
    }

    // Date range filter
    if (query.dateRange) {
      if (!task.dueDate) return false;

      if (query.dateRange.start && task.dueDate < query.dateRange.start) {
        return false;
      }
      if (query.dateRange.end && task.dueDate > query.dateRange.end) {
        return false;
      }
    }

    // Has subtasks filter
    if (query.hasSubtasks !== undefined) {
      const hasSubtasks = task.subtasks && task.subtasks.length > 0;
      if (query.hasSubtasks !== hasSubtasks) {
        return false;
      }
    }

    // Has dependencies filter
    if (query.hasDependencies !== undefined) {
      const hasDependencies = task.dependencies && task.dependencies.length > 0;
      if (query.hasDependencies !== hasDependencies) {
        return false;
      }
    }

    // Is recurring filter
    if (query.isRecurring !== undefined) {
      const isRecurring = !!task.recurringTaskId;
      if (query.isRecurring !== isRecurring) {
        return false;
      }
    }

    // Estimated time range filter
    if (query.estimatedTimeRange) {
      if (!task.estimatedTime) return false;

      if (query.estimatedTimeRange.min && task.estimatedTime < query.estimatedTimeRange.min) {
        return false;
      }
      if (query.estimatedTimeRange.max && task.estimatedTime > query.estimatedTimeRange.max) {
        return false;
      }
    }

    return true;
  }

  /**
   * Save a search query
   */
  static saveSearch(name: string, query: SearchQuery): SavedSearch {
    const searches = this.getSavedSearches();
    const newSearch: SavedSearch = {
      id: `search-${Date.now()}`,
      name,
      query,
      createdAt: Date.now(),
    };

    searches.push(newSearch);
    StorageService.set(SAVED_SEARCHES_KEY, searches);

    return newSearch;
  }

  /**
   * Get all saved searches
   */
  static getSavedSearches(): SavedSearch[] {
    return StorageService.get<SavedSearch[]>(SAVED_SEARCHES_KEY, []);
  }

  /**
   * Delete a saved search
   */
  static deleteSavedSearch(id: string): boolean {
    const searches = this.getSavedSearches();
    const filtered = searches.filter((s) => s.id !== id);

    if (filtered.length === searches.length) return false;

    StorageService.set(SAVED_SEARCHES_KEY, filtered);
    return true;
  }

  /**
   * Update last used timestamp for a saved search
   */
  static updateLastUsed(id: string): boolean {
    const searches = this.getSavedSearches();
    const search = searches.find((s) => s.id === id);

    if (!search) return false;

    search.lastUsed = Date.now();
    StorageService.set(SAVED_SEARCHES_KEY, searches);

    return true;
  }

  /**
   * Add to search history
   */
  static addToHistory(query: string, resultsCount: number): void {
    const history = this.getSearchHistory();
    const newEntry: SearchHistory = {
      id: `history-${Date.now()}`,
      query,
      timestamp: Date.now(),
      resultsCount,
    };

    // Keep only last 50 searches
    history.unshift(newEntry);
    if (history.length > 50) {
      history.pop();
    }

    StorageService.set(SEARCH_HISTORY_KEY, history);
  }

  /**
   * Get search history
   */
  static getSearchHistory(): SearchHistory[] {
    return StorageService.get<SearchHistory[]>(SEARCH_HISTORY_KEY, []);
  }

  /**
   * Clear search history
   */
  static clearHistory(): void {
    StorageService.set(SEARCH_HISTORY_KEY, []);
  }

  /**
   * Get search suggestions based on history
   */
  static getSuggestions(query: string, limit: number = 5): string[] {
    const history = this.getSearchHistory();
    const lowerQuery = query.toLowerCase();

    const suggestions = history
      .filter((h) => h.query.toLowerCase().includes(lowerQuery))
      .map((h) => h.query)
      .filter((value, index, self) => self.indexOf(value) === index) // Unique
      .slice(0, limit);

    return suggestions;
  }
}
