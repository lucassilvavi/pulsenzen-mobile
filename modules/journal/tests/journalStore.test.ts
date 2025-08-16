import { act, renderHook } from '@testing-library/react-native';
import { useJournalActions, useJournalSelectors, useJournalStore } from '../store/journalStore';
import { JournalEntry } from '../types';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock JournalServiceProvider
jest.mock('../services/JournalServiceProvider', () => ({
  JournalServiceProvider: {
    getService: jest.fn(),
  },
}));

describe('Journal Store', () => {
  beforeEach(() => {
    // Reset store before each test
    useJournalStore.getState().reset();
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useJournalStore());
      
      expect(result.current.entries).toEqual([]);
      expect(result.current.prompts).toEqual([]);
      expect(result.current.stats).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.selectedEntry).toBeNull();
      expect(result.current.currentPrompt).toBeNull();
      expect(result.current.searchQuery).toBe('');
      expect(result.current.selectedMoodFilter).toEqual([]);
      expect(result.current.dateRange).toEqual({ start: null, end: null });
      expect(result.current.autoSave).toBe(true);
      expect(result.current.notificationsEnabled).toBe(true);
    });
  });

  describe('Entry Management', () => {
    const mockEntry: JournalEntry = {
      id: 'test-entry-1',
      content: 'Test entry content',
      promptCategory: 'Reflexão',
      moodTags: [
        {
          id: 'happy',
          label: 'Feliz',
          emoji: '😊',
          category: 'positive',
          intensity: 4,
          hexColor: '#4CAF50'
        }
      ],
      createdAt: new Date().toISOString(),
      privacy: 'private',
      wordCount: 3,
    };

    it('should save entry and update store', async () => {
      const mockService = {
        saveEntry: jest.fn().mockResolvedValue(undefined),
        getEntries: jest.fn().mockResolvedValue([mockEntry]),
      };

      require('../services/JournalServiceProvider').JournalServiceProvider.getService.mockResolvedValue(mockService);

      const { result } = renderHook(() => useJournalActions());

      await act(async () => {
        await result.current.saveEntry(mockEntry);
      });

      expect(mockService.saveEntry).toHaveBeenCalledWith(mockEntry);
      
      const storeState = useJournalStore.getState();
      expect(storeState.entries).toContainEqual(mockEntry);
    });

    it('should update entry', async () => {
      const updatedContent = 'Updated content';
      const mockService = {
        updateEntry: jest.fn().mockResolvedValue({ ...mockEntry, content: updatedContent }),
      };

      require('../services/JournalServiceProvider').JournalServiceProvider.getService.mockResolvedValue(mockService);

      // First add entry to store
      useJournalStore.setState({ entries: [mockEntry] });

      const { result } = renderHook(() => useJournalActions());

      await act(async () => {
        await result.current.updateEntry(mockEntry.id, { content: updatedContent });
      });

      expect(mockService.updateEntry).toHaveBeenCalledWith(mockEntry.id, { content: updatedContent });
    });

    it('should delete entry', async () => {
      const mockService = {
        deleteEntry: jest.fn().mockResolvedValue(undefined),
      };

      require('../services/JournalServiceProvider').JournalServiceProvider.getService.mockResolvedValue(mockService);

      // First add entry to store
      useJournalStore.setState({ entries: [mockEntry] });

      const { result } = renderHook(() => useJournalActions());

      await act(async () => {
        await result.current.deleteEntry(mockEntry.id);
      });

      expect(mockService.deleteEntry).toHaveBeenCalledWith(mockEntry.id);
      
      const storeState = useJournalStore.getState();
      expect(storeState.entries).not.toContainEqual(mockEntry);
    });

    it('should duplicate entry', async () => {
      const duplicatedEntry = { ...mockEntry, id: 'duplicated-entry' };
      const mockService = {
        saveEntry: jest.fn().mockResolvedValue(undefined),
      };

      require('../services/JournalServiceProvider').JournalServiceProvider.getService.mockResolvedValue(mockService);

      // First add entry to store
      useJournalStore.setState({ entries: [mockEntry] });

      const { result } = renderHook(() => useJournalActions());

      let duplicatedResult: any;
      await act(async () => {
        duplicatedResult = await result.current.duplicateEntry(mockEntry.id);
      });

      expect(duplicatedResult).toBeDefined();
      expect(duplicatedResult!.content).toBe(mockEntry.content);
      expect(duplicatedResult!.id).toContain('copy');
    });
  });

  describe('Search and Filtering', () => {
    const mockEntries: JournalEntry[] = [
      {
        id: 'entry-1',
        content: 'Happy day today',
        promptCategory: 'Gratidão',
        moodTags: [
          {
            id: 'happy',
            label: 'Feliz',
            emoji: '😊',
            category: 'positive',
            intensity: 4,
            hexColor: '#4CAF50'
          }
        ],
        createdAt: '2024-01-01T10:00:00Z',
        privacy: 'private',
        wordCount: 3,
      },
      {
        id: 'entry-2',
        content: 'Challenging day',
        promptCategory: 'Desafios',
        moodTags: [
          {
            id: 'stressed',
            label: 'Estressado',
            emoji: '😰',
            category: 'negative',
            intensity: 3,
            hexColor: '#F44336'
          }
        ],
        createdAt: '2024-01-02T10:00:00Z',
        privacy: 'private',
        wordCount: 2,
      },
    ];

    beforeEach(() => {
      useJournalStore.setState({ entries: mockEntries });
    });

    it('should filter entries by search query', () => {
      const { result } = renderHook(() => useJournalSelectors());
      const { result: actionsResult } = renderHook(() => useJournalActions());

      act(() => {
        actionsResult.current.setSearchQuery('happy');
      });

      const filtered = result.current.filteredEntries;
      expect(filtered).toHaveLength(1);
      expect(filtered[0].content).toContain('Happy');
    });

    it('should filter entries by mood', () => {
      const { result } = renderHook(() => useJournalSelectors());
      const { result: actionsResult } = renderHook(() => useJournalActions());

      act(() => {
        actionsResult.current.setMoodFilter(['Feliz']);
      });

      const filtered = result.current.filteredEntries;
      expect(filtered).toHaveLength(1);
      expect(filtered[0].moodTags[0].label).toBe('Feliz');
    });

    it('should filter entries by date range', () => {
      const { result } = renderHook(() => useJournalSelectors());
      const { result: actionsResult } = renderHook(() => useJournalActions());

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-01');

      act(() => {
        actionsResult.current.setDateRange({ start: startDate, end: endDate });
      });

      const filtered = result.current.filteredEntries;
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('entry-1');
    });

    it('should clear all filters', () => {
      const { result: actionsResult } = renderHook(() => useJournalActions());

      act(() => {
        actionsResult.current.setSearchQuery('test');
        actionsResult.current.setMoodFilter(['happy']);
        actionsResult.current.setDateRange({ start: new Date(), end: new Date() });
      });

      act(() => {
        actionsResult.current.clearFilters();
      });

      const storeState = useJournalStore.getState();
      expect(storeState.searchQuery).toBe('');
      expect(storeState.selectedMoodFilter).toEqual([]);
      expect(storeState.dateRange).toEqual({ start: null, end: null });
    });
  });

  describe('Selectors', () => {
    const mockEntries: JournalEntry[] = [
      {
        id: 'entry-1',
        content: 'Recent entry',
        promptCategory: 'Reflexão',
        moodTags: [
          {
            id: 'happy',
            label: 'Feliz',
            emoji: '😊',
            category: 'positive',
            intensity: 4,
            hexColor: '#4CAF50'
          }
        ],
        createdAt: new Date().toISOString(), // Today
        privacy: 'private',
        wordCount: 2,
        isFavorite: true,
      },
      {
        id: 'entry-2',
        content: 'Old entry',
        promptCategory: 'Reflexão',
        moodTags: [
          {
            id: 'calm',
            label: 'Calmo',
            emoji: '😌',
            category: 'neutral',
            intensity: 3,
            hexColor: '#FF9800'
          }
        ],
        createdAt: '2023-01-01T10:00:00Z', // Old
        privacy: 'private',
        wordCount: 2,
        isFavorite: false,
      },
    ];

    beforeEach(() => {
      useJournalStore.setState({ entries: mockEntries });
    });

    it('should return recent entries', () => {
      const { result } = renderHook(() => useJournalSelectors());
      
      const recent = result.current.recentEntries;
      expect(recent).toHaveLength(1);
      expect(recent[0].content).toBe('Recent entry');
    });

    it('should return favorite entries', () => {
      const { result } = renderHook(() => useJournalSelectors());
      
      const favorites = result.current.favoriteEntries;
      expect(favorites).toHaveLength(1);
      expect(favorites[0].isFavorite).toBe(true);
    });

    it('should return unique mood tags', () => {
      const { result } = renderHook(() => useJournalSelectors());
      
      const uniqueTags = result.current.uniqueMoodTags;
      expect(uniqueTags).toHaveLength(2);
      expect(uniqueTags.map(tag => tag.label)).toContain('Feliz');
      expect(uniqueTags.map(tag => tag.label)).toContain('Calmo');
    });

    it('should return mood category stats', () => {
      const { result } = renderHook(() => useJournalSelectors());
      
      const stats = result.current.moodCategoryStats;
      expect(stats.positive).toBe(1);
      expect(stats.negative).toBe(0);
      expect(stats.neutral).toBe(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle save entry error', async () => {
      const mockService = {
        saveEntry: jest.fn().mockRejectedValue(new Error('Save failed')),
      };

      require('../services/JournalServiceProvider').JournalServiceProvider.getService.mockResolvedValue(mockService);

      const { result } = renderHook(() => useJournalActions());

      const mockEntry: JournalEntry = {
        id: 'test-entry',
        content: 'Test',
        promptCategory: 'Test',
        moodTags: [],
        createdAt: new Date().toISOString(),
        privacy: 'private',
        wordCount: 1,
      };

      await act(async () => {
        await result.current.saveEntry(mockEntry);
      });

      const storeState = useJournalStore.getState();
      expect(storeState.error).toBe('Failed to save entry');
      expect(storeState.isLoading).toBe(false);
    });

    it('should clear error', () => {
      useJournalStore.setState({ error: 'Some error' });

      const { result } = renderHook(() => useJournalActions());

      act(() => {
        result.current.clearError();
      });

      const storeState = useJournalStore.getState();
      expect(storeState.error).toBeNull();
    });
  });

  describe('Store Reset', () => {
    it('should reset store to initial state', () => {
      // Modify store state
      useJournalStore.setState({
        entries: [{ id: 'test' } as any],
        error: 'Some error',
        isLoading: true,
        searchQuery: 'test query',
      });

      const { result } = renderHook(() => useJournalActions());

      act(() => {
        result.current.reset();
      });

      const storeState = useJournalStore.getState();
      expect(storeState.entries).toEqual([]);
      expect(storeState.error).toBeNull();
      expect(storeState.isLoading).toBe(false);
      expect(storeState.searchQuery).toBe('');
    });
  });
});
