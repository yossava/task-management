import { useState, useEffect, useCallback } from 'react';
import { SearchService, SearchFilters, SearchResult } from '@/lib/services/searchService';

export function useSearch(initialFilters: SearchFilters = {}) {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Perform search
  const search = useCallback((newFilters?: SearchFilters) => {
    setIsSearching(true);
    const searchFilters = newFilters || filters;

    // Small delay to debounce
    const timer = setTimeout(() => {
      const searchResults = SearchService.search(searchFilters);
      setResults(searchResults);
      setIsSearching(false);

      // Save to recent searches if there's a query
      if (searchFilters.query) {
        SearchService.saveRecentSearch(searchFilters.query);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [filters]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({});
    setResults([]);
  }, []);

  // Get suggestions
  const getSuggestions = useCallback((query: string) => {
    const newSuggestions = SearchService.getSuggestions(query);
    setSuggestions(newSuggestions);
  }, []);

  // Auto-search when filters change
  useEffect(() => {
    if (filters.query || Object.keys(filters).length > 0) {
      const cleanup = search();
      return cleanup;
    } else {
      setResults([]);
    }
  }, [filters, search]);

  return {
    filters,
    results,
    isSearching,
    suggestions,
    search,
    updateFilters,
    resetFilters,
    getSuggestions,
  };
}
