import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist, subscribeWithSelector } from 'zustand/middleware';
import { JournalServiceProvider } from '../services/JournalServiceProvider';
import { JournalStatsService } from '../services/JournalStatsService';
import { JournalEntry, JournalPrompt, JournalStats, MoodTag } from '../types';

// Store State Interface
interface JournalState {
  // Data State
  entries: JournalEntry[];
  prompts: JournalPrompt[];
  stats: JournalStats | null;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  selectedEntry: JournalEntry | null;
  currentPrompt: JournalPrompt | null;
  
  // Filters & Search
  searchQuery: string;
  selectedMoodFilter: string[];
  dateRange: { start: Date | null; end: Date | null };
  
  // Preferences
  autoSave: boolean;
  notificationsEnabled: boolean;
  
  // Actions
  // Entry Management
  loadEntries: () => Promise<void>;
  saveEntry: (entry: JournalEntry) => Promise<void>;
  updateEntry: (id: string, updates: Partial<JournalEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  duplicateEntry: (id: string) => Promise<JournalEntry>;
  
  // Entry Selection
  selectEntry: (entry: JournalEntry | null) => void;
  clearSelection: () => void;
  
  // Prompt Management
  loadPrompts: () => Promise<void>;
  getRandomPrompt: () => Promise<JournalPrompt | null>;
  setCurrentPrompt: (prompt: JournalPrompt | null) => void;
  
  // Search & Filter
  setSearchQuery: (query: string) => void;
  setMoodFilter: (moods: string[]) => void;
  setDateRange: (range: { start: Date | null; end: Date | null }) => void;
  clearFilters: () => void;
  
  // Statistics
  refreshStats: () => void;
  
  // Utility
  clearError: () => void;
  reset: () => void;
}

// Default State
const defaultState = {
  entries: [],
  prompts: [],
  stats: null,
  isLoading: false,
  error: null,
  selectedEntry: null,
  currentPrompt: null,
  searchQuery: '',
  selectedMoodFilter: [],
  dateRange: { start: null, end: null },
  autoSave: true,
  notificationsEnabled: true,
};

// Zustand Store with Persistence
export const useJournalStore = create<JournalState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        ...defaultState,

        // Entry Management Actions
        loadEntries: async () => {
          set({ isLoading: true, error: null });
          try {
            const service = await JournalServiceProvider.getService();
            const entries = await service.getEntries();
            
            set({ 
              entries: entries.sort((a, b) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              ),
              isLoading: false 
            });
            
            // Auto-refresh stats when entries change
            get().refreshStats();
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to load entries',
              isLoading: false 
            });
          }
        },

        saveEntry: async (entry: JournalEntry) => {
          set({ isLoading: true, error: null });
          try {
            const service = await JournalServiceProvider.getService();
            await service.saveEntry(entry);
            
            // Update local state
            const { entries } = get();
            const existingIndex = entries.findIndex(e => e.id === entry.id);
            
            let updatedEntries: JournalEntry[];
            if (existingIndex >= 0) {
              // Update existing entry
              updatedEntries = [...entries];
              updatedEntries[existingIndex] = entry;
            } else {
              // Add new entry
              updatedEntries = [entry, ...entries];
            }
            
            set({ 
              entries: updatedEntries.sort((a, b) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              ),
              isLoading: false 
            });
            
            get().refreshStats();
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to save entry',
              isLoading: false 
            });
          }
        },

        updateEntry: async (id: string, updates: Partial<JournalEntry>) => {
          const { entries } = get();
          const entry = entries.find(e => e.id === id);
          if (!entry) {
            set({ error: 'Entry not found' });
            return;
          }
          
          const updatedEntry = { ...entry, ...updates };
          await get().saveEntry(updatedEntry);
        },

        deleteEntry: async (id: string) => {
          set({ isLoading: true, error: null });
          try {
            const service = await JournalServiceProvider.getService();
            await service.deleteEntry(id);
            
            const { entries, selectedEntry } = get();
            const updatedEntries = entries.filter(e => e.id !== id);
            
            set({ 
              entries: updatedEntries,
              selectedEntry: selectedEntry?.id === id ? null : selectedEntry,
              isLoading: false 
            });
            
            get().refreshStats();
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to delete entry',
              isLoading: false 
            });
          }
        },

        duplicateEntry: async (id: string) => {
          const { entries } = get();
          const originalEntry = entries.find(e => e.id === id);
          if (!originalEntry) {
            set({ error: 'Entry not found' });
            throw new Error('Entry not found');
          }
          
          const duplicatedEntry: JournalEntry = {
            ...originalEntry,
            id: `${originalEntry.id}-copy-${Date.now()}`,
            createdAt: new Date().toISOString(),
          };
          
          await get().saveEntry(duplicatedEntry);
          return duplicatedEntry;
        },

        // Entry Selection Actions
        selectEntry: (entry: JournalEntry | null) => {
          set({ selectedEntry: entry });
        },

        clearSelection: () => {
          set({ selectedEntry: null });
        },

        // Prompt Management Actions
        loadPrompts: async () => {
          try {
            const service = await JournalServiceProvider.getService();
            const prompts = await service.getPrompts();
            set({ prompts });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to load prompts'
            });
          }
        },

        getRandomPrompt: async () => {
          try {
            const service = await JournalServiceProvider.getService();
            const prompt = await service.getRandomPrompt();
            if (prompt) {
              set({ currentPrompt: prompt });
            }
            return prompt;
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to get random prompt'
            });
            return null;
          }
        },

        setCurrentPrompt: (prompt: JournalPrompt | null) => {
          set({ currentPrompt: prompt });
        },

        // Search & Filter Actions
        setSearchQuery: (query: string) => {
          set({ searchQuery: query });
        },

        setMoodFilter: (moods: string[]) => {
          set({ selectedMoodFilter: moods });
        },

        setDateRange: (range: { start: Date | null; end: Date | null }) => {
          set({ dateRange: range });
        },

        clearFilters: () => {
          set({ 
            searchQuery: '',
            selectedMoodFilter: [],
            dateRange: { start: null, end: null }
          });
        },

        // Statistics Actions
        refreshStats: () => {
          const { entries } = get();
          const stats = JournalStatsService.calculateStats(entries);
          set({ stats });
        },

        // Utility Actions
        clearError: () => {
          set({ error: null });
        },

        reset: () => {
          set(defaultState);
        },
      }),
      {
        name: 'journal-store',
        storage: createJSONStorage(() => AsyncStorage),
        // Only persist certain fields, not UI state
        partialize: (state) => ({
          autoSave: state.autoSave,
          notificationsEnabled: state.notificationsEnabled,
        }),
      }
    )
  )
);

// Selectors for derived state
export const useJournalSelectors = () => {
  const store = useJournalStore();
  
  return {
    // Filtered entries based on search and filters
    filteredEntries: useJournalStore((state) => {
      let filtered = state.entries;
      
      // Search filter
      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        filtered = filtered.filter(entry => 
          entry.content.toLowerCase().includes(query) ||
          entry.promptCategory?.toLowerCase().includes(query) ||
          entry.moodTags.some(tag => 
            tag.label.toLowerCase().includes(query)
          )
        );
      }
      
      // Mood filter
      if (state.selectedMoodFilter.length > 0) {
        filtered = filtered.filter(entry =>
          entry.moodTags.some(tag =>
            state.selectedMoodFilter.includes(tag.label)
          )
        );
      }
      
      // Date range filter
      if (state.dateRange.start || state.dateRange.end) {
        filtered = filtered.filter(entry => {
          const entryDate = new Date(entry.createdAt);
          const start = state.dateRange.start;
          const end = state.dateRange.end;
          
          if (start && entryDate < start) return false;
          if (end && entryDate > end) return false;
          return true;
        });
      }
      
      return filtered;
    }),
    
    // Recent entries (last 7 days)
    recentEntries: useJournalStore((state) => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      return state.entries.filter(entry => 
        new Date(entry.createdAt) >= sevenDaysAgo
      );
    }),
    
    // Favorite entries
    favoriteEntries: useJournalStore((state) => 
      state.entries.filter(entry => entry.isFavorite)
    ),
    
    // Unique mood tags from all entries
    uniqueMoodTags: useJournalStore((state) => {
      const tagMap = new Map<string, MoodTag>();
      
      state.entries.forEach(entry => {
        entry.moodTags.forEach(tag => {
          tagMap.set(tag.id, tag);
        });
      });
      
      return Array.from(tagMap.values());
    }),
    
    // Entry count by mood category
    moodCategoryStats: useJournalStore((state) => {
      const stats = { positive: 0, negative: 0, neutral: 0 };
      
      state.entries.forEach(entry => {
        entry.moodTags.forEach(tag => {
          stats[tag.category]++;
        });
      });
      
      return stats;
    }),
    
    // Streak calculation
    currentStreak: useJournalStore((state) => {
      if (state.entries.length === 0) return 0;
      
      const today = new Date();
      const sortedEntries = [...state.entries].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      let streak = 0;
      let currentDate = new Date(today);
      
      for (const entry of sortedEntries) {
        const entryDate = new Date(entry.createdAt);
        entryDate.setHours(0, 0, 0, 0);
        currentDate.setHours(0, 0, 0, 0);
        
        const diffDays = Math.floor(
          (currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (diffDays === streak || (streak === 0 && diffDays <= 1)) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }
      
      return streak;
    }),
  };
};

// Action hooks for cleaner component usage
export const useJournalActions = () => {
  const store = useJournalStore();
  
  return {
    // Entry actions
    loadEntries: store.loadEntries,
    saveEntry: store.saveEntry,
    updateEntry: store.updateEntry,
    deleteEntry: store.deleteEntry,
    duplicateEntry: store.duplicateEntry,
    selectEntry: store.selectEntry,
    clearSelection: store.clearSelection,
    
    // Prompt actions
    loadPrompts: store.loadPrompts,
    getRandomPrompt: store.getRandomPrompt,
    setCurrentPrompt: store.setCurrentPrompt,
    
    // Filter actions
    setSearchQuery: store.setSearchQuery,
    setMoodFilter: store.setMoodFilter,
    setDateRange: store.setDateRange,
    clearFilters: store.clearFilters,
    
    // Utility actions
    refreshStats: store.refreshStats,
    clearError: store.clearError,
    reset: store.reset,
  };
};
