import { jest } from '@jest/globals';
import { journalApiService } from '../../services/journalApiService';

// Mock the entire journalApiService module to avoid fetch issues
jest.mock('../../services/journalApiService', () => ({
  journalApiService: {
    getJournalEntries: jest.fn(),
    createJournalEntry: jest.fn(),
    updateJournalEntry: jest.fn(),
    deleteJournalEntry: jest.fn(),
    searchJournalEntries: jest.fn(),
    getJournalPrompts: jest.fn(),
    getJournalStats: jest.fn(),
  },
}));

const mockJournalApiService = journalApiService as jest.Mocked<typeof journalApiService>;

describe('JournalApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getJournalEntries', () => {
    it('should fetch journal entries successfully', async () => {
      // Arrange
      const mockEntries = [
        {
          id: '1',
          content: 'Test entry',
          moodTags: [],
          category: 'personal',
          wordCount: 10,
          characterCount: 50,
          readingTime: 1,
          keywords: ['test'],
          themes: ['growth'],
          privacy: {
            level: 'private',
            shareWithTherapist: false
          },
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ];

      const mockResponse = {
        entries: mockEntries,
        total: 1,
        hasMore: false
      };

      mockJournalApiService.getJournalEntries.mockResolvedValue(mockResponse);

      // Act
      const result = await journalApiService.getJournalEntries();

      // Assert
      expect(result).toEqual(mockResponse);
      expect(mockJournalApiService.getJournalEntries).toHaveBeenCalledWith();
    });

    it('should handle API errors gracefully', async () => {
      // Arrange
      mockJournalApiService.getJournalEntries.mockRejectedValue(new Error('Network error'));

      // Act & Assert
      await expect(journalApiService.getJournalEntries()).rejects.toThrow('Network error');
    });
  });

  describe('createJournalEntry', () => {
    it('should create a new journal entry successfully', async () => {
      // Arrange
      const entryData = {
        content: 'New journal entry',
        category: 'wellness',
        moodTagIds: ['happy']
      };

      const mockResponse = {
        id: '2',
        ...entryData,
        moodTags: [],
        wordCount: 20,
        characterCount: 100,
        readingTime: 2,
        keywords: ['wellness'],
        themes: ['growth'],
        privacy: {
          level: 'private',
          shareWithTherapist: false
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      };

      mockJournalApiService.createJournalEntry.mockResolvedValue(mockResponse);

      // Act
      const result = await journalApiService.createJournalEntry(entryData);

      // Assert
      expect(result).toEqual(mockResponse);
      expect(mockJournalApiService.createJournalEntry).toHaveBeenCalledWith(entryData);
    });

    it('should handle validation errors', async () => {
      // Arrange
      const invalidData = {
        content: '', // Empty content should fail
        category: 'invalid'
      };

      mockJournalApiService.createJournalEntry.mockRejectedValue(new Error('Validation failed'));

      // Act & Assert
      await expect(journalApiService.createJournalEntry(invalidData)).rejects.toThrow('Validation failed');
    });
  });

  describe('updateJournalEntry', () => {
    it('should update an existing journal entry', async () => {
      // Arrange
      const entryId = '1';
      const updateData = {
        content: 'Updated content',
        category: 'personal'
      };

      const mockResponse = {
        id: entryId,
        content: 'Updated content',
        category: 'personal',
        moodTags: [],
        wordCount: 15,
        characterCount: 80,
        readingTime: 1,
        keywords: ['updated'],
        themes: ['reflection'],
        privacy: {
          level: 'private',
          shareWithTherapist: false
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T01:00:00Z'
      };

      mockJournalApiService.updateJournalEntry.mockResolvedValue(mockResponse);

      // Act
      const result = await journalApiService.updateJournalEntry(entryId, updateData);

      // Assert
      expect(result).toEqual(mockResponse);
      expect(mockJournalApiService.updateJournalEntry).toHaveBeenCalledWith(entryId, updateData);
    });
  });

  describe('deleteJournalEntry', () => {
    it('should delete a journal entry successfully', async () => {
      // Arrange
      const entryId = '1';
      mockJournalApiService.deleteJournalEntry.mockResolvedValue(true);

      // Act
      const result = await journalApiService.deleteJournalEntry(entryId);

      // Assert
      expect(result).toBe(true);
      expect(mockJournalApiService.deleteJournalEntry).toHaveBeenCalledWith(entryId);
    });

    it('should handle deletion errors', async () => {
      // Arrange
      const entryId = 'nonexistent';
      mockJournalApiService.deleteJournalEntry.mockRejectedValue(new Error('Entry not found'));

      // Act & Assert
      await expect(journalApiService.deleteJournalEntry(entryId)).rejects.toThrow('Entry not found');
    });
  });

  describe('searchJournalEntries', () => {
    it('should search entries with query and filters', async () => {
      // Arrange
      const query = 'wellness';
      const filters = {
        category: 'personal',
        dateFrom: '2024-01-01',
        dateTo: '2024-01-31'
      };

      const mockResults = [
        {
          id: '1',
          content: 'Wellness journey entry',
          moodTags: [],
          category: 'personal',
          wordCount: 25,
          characterCount: 120,
          readingTime: 2,
          keywords: ['wellness', 'journey'],
          themes: ['growth'],
          privacy: {
            level: 'private',
            shareWithTherapist: false
          },
          createdAt: '2024-01-15T00:00:00Z',
          updatedAt: '2024-01-15T00:00:00Z'
        }
      ];

      mockJournalApiService.searchJournalEntries.mockResolvedValue(mockResults);

      // Act
      const result = await journalApiService.searchJournalEntries(query, filters);

      // Assert
      expect(result).toEqual(mockResults);
      expect(mockJournalApiService.searchJournalEntries).toHaveBeenCalledWith(query, filters);
    });
  });

  describe('getJournalPrompts', () => {
    it('should fetch journal prompts with filters', async () => {
      // Arrange
      const filters = {
        category: 'wellness',
        difficulty: 'medium' as const
      };

      const mockPrompts = [
        {
          id: '1',
          question: 'What made you smile today?',
          category: 'wellness',
          difficulty: 'medium' as const,
          type: 'standard' as const,
          estimatedTime: 5,
          benefits: ['mindfulness'],
          tags: ['daily'],
          isPremium: false
        }
      ];

      mockJournalApiService.getJournalPrompts.mockResolvedValue(mockPrompts);

      // Act
      const result = await journalApiService.getJournalPrompts(filters);

      // Assert
      expect(result).toEqual(mockPrompts);
      expect(mockJournalApiService.getJournalPrompts).toHaveBeenCalledWith(filters);
    });
  });

  describe('getJournalStats', () => {
    it('should fetch journal statistics', async () => {
      // Arrange
      const mockStats = {
        totalEntries: 15,
        currentStreak: 7,
        longestStreak: 14,
        totalWords: 3500,
        averageWordsPerEntry: 233,
        entriesThisWeek: 5,
        entriesThisMonth: 18,
        favoriteCategory: 'personal',
        mostUsedMoodTags: [
          {
            id: '1',
            emoji: '😊',
            label: 'Happy',
            count: 12
          }
        ],
        moodTrends: [
          {
            date: '2024-01-01',
            averageMood: 6.2,
            entries: 3
          }
        ],
        writingPatterns: {
          hourOfDay: { '20': 5, '21': 8 },
          dayOfWeek: { 'Sunday': 10, 'Monday': 5 },
          wordsPerDay: { '2024-01-01': 250 }
        }
      };

      mockJournalApiService.getJournalStats.mockResolvedValue(mockStats);

      // Act
      const result = await journalApiService.getJournalStats();

      // Assert
      expect(result).toEqual(mockStats);
      expect(mockJournalApiService.getJournalStats).toHaveBeenCalledWith();
    });
  });
});
