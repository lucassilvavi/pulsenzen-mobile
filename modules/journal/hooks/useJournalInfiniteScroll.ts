import { useCallback, useEffect, useState } from 'react';
import { JournalServiceProvider } from '../services';
import { JournalEntry } from '../types';

interface JournalFilters {
  search?: string;
  category?: string;
  isFavorite?: boolean;
  privacyLevel?: string;
  moodTags?: string[];
  startDate?: string;
  endDate?: string;
  minWords?: number;
  maxWords?: number;
}

interface UseJournalInfiniteScrollResult {
  entries: JournalEntry[];
  loading: boolean;
  refreshing: boolean;
  hasMore: boolean;
  error: string | null;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  applyFilters: (filters: JournalFilters) => Promise<void>;
  clearFilters: () => Promise<void>;
}

const ENTRIES_PER_PAGE = 20;

export const useJournalInfiniteScroll = (): UseJournalInfiniteScrollResult => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentFilters, setCurrentFilters] = useState<JournalFilters>({});

  const loadEntries = useCallback(async (
    page: number = 1, 
    isRefresh: boolean = false,
    filters: JournalFilters = {}
  ) => {
    try {
      setError(null);
      
      if (isRefresh) {
        setRefreshing(true);
      } else if (page === 1) {
        setLoading(true);
      }

      const journalService = await JournalServiceProvider.getInstance();
      
      // Check if we're using the new API service with pagination
      if ('getEntriesPaginated' in journalService) {
        const result = await (journalService as any).getEntriesPaginated({
          page,
          limit: ENTRIES_PER_PAGE,
          ...filters
        });

        if (page === 1 || isRefresh) {
          setEntries(result.entries);
        } else {
          setEntries(prev => [...prev, ...result.entries]);
        }

        setHasMore(result.pagination.hasMore);
        setCurrentPage(page);
      } else {
        // Fallback to legacy method for backward compatibility
        const allEntries = await journalService.getEntries();
        
        // Apply client-side filtering if needed
        let filteredEntries = allEntries;
        
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          filteredEntries = filteredEntries.filter(entry =>
            entry.content.toLowerCase().includes(searchTerm) ||
            entry.moodTags?.some((tag: any) => tag.label?.toLowerCase().includes(searchTerm)) ||
            entry.promptCategory?.toLowerCase().includes(searchTerm)
          );
        }

        if (filters.isFavorite !== undefined) {
          filteredEntries = filteredEntries.filter(entry => entry.isFavorite === filters.isFavorite);
        }

        // Simulate pagination for legacy service
        const startIndex = (page - 1) * ENTRIES_PER_PAGE;
        const endIndex = startIndex + ENTRIES_PER_PAGE;
        const pageEntries = filteredEntries.slice(startIndex, endIndex);

        if (page === 1 || isRefresh) {
          setEntries(pageEntries);
        } else {
          setEntries(prev => [...prev, ...pageEntries]);
        }

        setHasMore(endIndex < filteredEntries.length);
        setCurrentPage(page);
      }

    } catch (err) {
      console.error('Error loading journal entries:', err);
      setError(err instanceof Error ? err.message : 'Failed to load entries');
      
      // If it's the first page, we still want to show something
      if (page === 1) {
        setEntries([]);
        setHasMore(false);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (loading || refreshing || !hasMore) return;
    
    await loadEntries(currentPage + 1, false, currentFilters);
  }, [loading, refreshing, hasMore, currentPage, currentFilters, loadEntries]);

  const refresh = useCallback(async () => {
    setCurrentPage(1);
    setHasMore(true);
    await loadEntries(1, true, currentFilters);
  }, [currentFilters, loadEntries]);

  const applyFilters = useCallback(async (filters: JournalFilters) => {
    setCurrentFilters(filters);
    setCurrentPage(1);
    setHasMore(true);
    await loadEntries(1, false, filters);
  }, [loadEntries]);

  const clearFilters = useCallback(async () => {
    setCurrentFilters({});
    setCurrentPage(1);
    setHasMore(true);
    await loadEntries(1, false, {});
  }, [loadEntries]);

  // Load initial data
  useEffect(() => {
    loadEntries(1, false, {});
  }, [loadEntries]);

  return {
    entries,
    loading,
    refreshing,
    hasMore,
    error,
    loadMore,
    refresh,
    applyFilters,
    clearFilters
  };
};

export default useJournalInfiniteScroll;