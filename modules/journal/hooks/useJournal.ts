import { useEffect } from 'react';
import {
  useJournalActions,
  useJournalSelectors,
  useJournalStore
} from '../store/journalStore';
import { JournalEntry, JournalPrompt, MoodTag } from '../types';

/**
 * Main hook for Journal functionality
 * Provides a clean API for components to interact with journal data
 */
export function useJournal() {
  const store = useJournalStore();
  const selectors = useJournalSelectors();
  const actions = useJournalActions();

  // Auto-load data on first use
  useEffect(() => {
    if (store.entries.length === 0 && !store.isLoading) {
      actions.loadEntries();
    }
    if (store.prompts.length === 0) {
      actions.loadPrompts();
    }
  }, []);

  return {
    // Data
    entries: store.entries,
    prompts: store.prompts,
    stats: store.stats,
    selectedEntry: store.selectedEntry,
    currentPrompt: store.currentPrompt,
    
    // Derived data
    filteredEntries: selectors.filteredEntries,
    recentEntries: selectors.recentEntries,
    favoriteEntries: selectors.favoriteEntries,
    uniqueMoodTags: selectors.uniqueMoodTags,
    moodCategoryStats: selectors.moodCategoryStats,
    currentStreak: selectors.currentStreak,
    
    // UI State
    isLoading: store.isLoading,
    error: store.error,
    
    // Search & Filters
    searchQuery: store.searchQuery,
    selectedMoodFilter: store.selectedMoodFilter,
    dateRange: store.dateRange,
    
    // Actions
    ...actions,
  };
}

/**
 * Hook for entry management operations
 */
const useJournalEntries = () => {
  const actions = useJournalActions();
  const store = useJournalStore();

  const createEntry = async (content: string, options?: {
    promptCategory?: string;
    moodTags?: MoodTag[];
    privacy?: 'private' | 'shared';
  }) => {
    const entry: JournalEntry = {
      id: `entry-${Date.now()}`,
      content,
      promptCategory: options?.promptCategory || 'Reflexão',
      moodTags: options?.moodTags || [],
      createdAt: new Date().toISOString(),
      privacy: options?.privacy || 'private',
      wordCount: content.trim().split(/\s+/).length,
    };

    await actions.saveEntry(entry);
    return entry;
  };

  const updateEntry = async (id: string, updates: Partial<JournalEntry>) => {
    return actions.updateEntry(id, updates);
  };

  const deleteEntry = async (id: string) => {
    return actions.deleteEntry(id);
  };

  const duplicateEntry = async (id: string) => {
    return actions.duplicateEntry(id);
  };

  const toggleFavorite = async (id: string) => {
    const entry = store.entries.find(e => e.id === id);
    if (entry) {
      await actions.updateEntry(id, { isFavorite: !entry.isFavorite });
    }
  };

  return {
    createEntry,
    updateEntry,
    deleteEntry,
    duplicateEntry,
    toggleFavorite,
    entries: store.entries,
    isLoading: store.isLoading,
    error: store.error,
  };
};

/**
 * Hook for search and filtering functionality
 */
const useJournalSearch = () => {
  const store = useJournalStore();
  const actions = useJournalActions();
  const selectors = useJournalSelectors();

  const search = (query: string) => {
    actions.setSearchQuery(query);
  };

  const filterByMood = (moodLabels: string[]) => {
    actions.setMoodFilter(moodLabels);
  };

  const filterByDateRange = (start: Date | null, end: Date | null) => {
    actions.setDateRange({ start, end });
  };

  const clearAllFilters = () => {
    actions.clearFilters();
  };

  // Quick filter presets
  const filterRecent = () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    filterByDateRange(sevenDaysAgo, new Date());
  };

  const filterThisMonth = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    filterByDateRange(start, end);
  };

  const filterPositiveMoods = () => {
    const positiveTags = selectors.uniqueMoodTags
      .filter(tag => tag.category === 'positive')
      .map(tag => tag.label);
    filterByMood(positiveTags);
  };

  return {
    // Current state
    searchQuery: store.searchQuery,
    selectedMoodFilter: store.selectedMoodFilter,
    dateRange: store.dateRange,
    filteredEntries: selectors.filteredEntries,
    uniqueMoodTags: selectors.uniqueMoodTags,
    
    // Actions
    search,
    filterByMood,
    filterByDateRange,
    clearAllFilters,
    
    // Quick presets
    filterRecent,
    filterThisMonth,
    filterPositiveMoods,
  };
};

/**
 * Hook for prompts functionality
 */
const useJournalPrompts = () => {
  const store = useJournalStore();
  const actions = useJournalActions();

  useEffect(() => {
    if (store.prompts.length === 0) {
      actions.loadPrompts();
    }
  }, []);

  const getRandomPrompt = async () => {
    return actions.getRandomPrompt();
  };

  const setCurrentPrompt = (prompt: JournalPrompt | null) => {
    actions.setCurrentPrompt(prompt);
  };

  return {
    prompts: store.prompts,
    currentPrompt: store.currentPrompt,
    getRandomPrompt,
    setCurrentPrompt,
    isLoading: store.isLoading,
  };
};

/**
 * Hook for statistics and analytics
 */
const useJournalStats = () => {
  const store = useJournalStore();
  const selectors = useJournalSelectors();
  const actions = useJournalActions();

  useEffect(() => {
    if (store.entries.length > 0 && !store.stats) {
      actions.refreshStats();
    }
  }, [store.entries.length]);

  const refreshStats = () => {
    actions.refreshStats();
  };

  return {
    stats: store.stats,
    currentStreak: selectors.currentStreak,
    moodCategoryStats: selectors.moodCategoryStats,
    refreshStats,
    isLoading: store.isLoading,
  };
};

/**
 * Hook for managing user preferences
 */
const useJournalPreferences = () => {
  const store = useJournalStore();

  const toggleAutoSave = () => {
    // This would be implemented in the store
    console.log('Toggle auto-save');
  };

  const toggleNotifications = () => {
    // This would be implemented in the store
    console.log('Toggle notifications');
  };

  return {
    autoSave: store.autoSave,
    notificationsEnabled: store.notificationsEnabled,
    toggleAutoSave,
    toggleNotifications,
  };
};

// Export additional hooks
export {
  useJournalActions, useJournalEntries, useJournalPreferences, useJournalPrompts, useJournalSearch, useJournalSelectors, useJournalStats, useJournalStore
};

