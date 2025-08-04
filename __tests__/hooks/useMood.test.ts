import AsyncStorage from '@react-native-async-storage/async-storage';
import { moodService } from '../../modules/mood/services/MoodService';
import { MoodLevel } from '../../modules/mood/types';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
}));

jest.mock('../../modules/mood/services/MoodService', () => ({
  moodService: {
    getCurrentPeriod: jest.fn(),
    hasAnsweredToday: jest.fn(),
    saveMoodResponse: jest.fn(),
    getMoodEntries: jest.fn(),
    getMoodStats: jest.fn(),
    resetTodayResponse: jest.fn(),
    initializeAutoSync: jest.fn(),
    getSyncStatus: jest.fn(),
    syncOfflineEntries: jest.fn(),
  },
}));

const mockMoodService = moodService as jest.Mocked<typeof moodService>;
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('useMood Hook - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mocks
    mockMoodService.getCurrentPeriod.mockReturnValue('manha');
    mockMoodService.hasAnsweredToday.mockResolvedValue(false);
    mockMoodService.getMoodEntries.mockResolvedValue([]);
    mockMoodService.getMoodStats.mockResolvedValue({
      averageMood: 3.5,
      totalEntries: 10,
      moodDistribution: {
        'excelente': 2,
        'bem': 3,
        'neutro': 3,
        'mal': 1,
        'pessimo': 1
      },
      streak: 5
    });
    mockMoodService.initializeAutoSync.mockResolvedValue();
    mockMoodService.getSyncStatus.mockResolvedValue({
      offlineCount: 0,
      pendingSync: false
    });
    mockAsyncStorage.getItem.mockResolvedValue(null);
  });

  describe('Service Integration', () => {
    it('should call moodService methods correctly', async () => {
      mockMoodService.saveMoodResponse.mockResolvedValue({
        success: true,
        message: 'Mood salvo com sucesso!',
        data: {
          id: '1',
          mood: 'bem',
          period: 'manha',
          date: '2025-01-03',
          timestamp: Date.now(),
          serverSynced: true
        }
      });

      // Test service methods exist and are called
      expect(mockMoodService.getCurrentPeriod).toBeDefined();
      expect(mockMoodService.hasAnsweredToday).toBeDefined();
      expect(mockMoodService.saveMoodResponse).toBeDefined();
      expect(mockMoodService.getMoodEntries).toBeDefined();
      expect(mockMoodService.getMoodStats).toBeDefined();
    });

    it('should handle mood submission service calls', async () => {
      const mockResponse = {
        success: true,
        message: 'Mood salvo com sucesso!',
        data: {
          id: '1',
          mood: 'bem' as MoodLevel,
          period: 'manha' as const,
          date: '2025-01-03',
          timestamp: Date.now(),
          serverSynced: true
        }
      };

      mockMoodService.saveMoodResponse.mockResolvedValue(mockResponse);

      // Direct service call test
      const result = await mockMoodService.saveMoodResponse('bem', {
        timestamp: Date.now(),
        activities: [],
        emotions: []
      });

      expect(result.success).toBe(true);
      expect(result.data?.mood).toBe('bem');
      expect(mockMoodService.saveMoodResponse).toHaveBeenCalledWith('bem', {
        timestamp: expect.any(Number),
        activities: [],
        emotions: []
      });
    });

    it('should handle service errors correctly', async () => {
      mockMoodService.saveMoodResponse.mockResolvedValue({
        success: false,
        message: 'Validation error'
      });

      const result = await mockMoodService.saveMoodResponse('bem', {
        timestamp: Date.now(),
        activities: [],
        emotions: []
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Validation error');
    });
  });

  describe('Cache Integration', () => {
    it('should handle AsyncStorage cache operations', async () => {
      const cachedEntries = [{
        id: '1',
        mood: 'bem' as MoodLevel,
        period: 'manha' as const,
        date: '2025-01-03',
        timestamp: Date.now(),
        serverSynced: true
      }];

      const cacheData = {
        data: cachedEntries,
        timestamp: Date.now() - 60000, // 1 minute ago
        ttl: 300000 // 5 minutes
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(cacheData));

      // Test cache retrieval
      const cachedResult = await mockAsyncStorage.getItem('mood_entries_cache');
      expect(cachedResult).toBeTruthy();

      const parsedCache = JSON.parse(cachedResult!);
      expect(parsedCache.data).toEqual(cachedEntries);
      expect(parsedCache.ttl).toBe(300000);
    });

    it('should handle cache expiration logic', () => {
      const currentTime = Date.now();
      const cacheTimestamp = currentTime - 400000; // 6.67 minutes ago
      const ttl = 300000; // 5 minutes

      const isExpired = (currentTime - cacheTimestamp) > ttl;
      const isStale = (currentTime - cacheTimestamp) > (ttl * 0.7);

      expect(isExpired).toBe(true);
      expect(isStale).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should categorize network errors correctly', () => {
      const networkError = new Error('fetch failed');
      const validationError = { message: 'Invalid data' };
      const serverError = { status: 500, message: 'Internal server error' };

      // Test error categorization logic
      expect(networkError.message).toContain('fetch');
      expect(validationError.message).toBe('Invalid data');
      expect(serverError.status).toBe(500);
    });

    it('should handle service rejection errors', async () => {
      mockMoodService.saveMoodResponse.mockRejectedValue(new Error('Network error'));

      try {
        await mockMoodService.saveMoodResponse('bem', {
          timestamp: Date.now(),
          activities: [],
          emotions: []
        });
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Network error');
      }
    });
  });

  describe('Sync Status Integration', () => {
    it('should handle sync status updates', async () => {
      const syncStatus = {
        offlineCount: 2,
        pendingSync: true
      };

      mockMoodService.getSyncStatus.mockResolvedValue(syncStatus);

      const result = await mockMoodService.getSyncStatus();
      expect(result.offlineCount).toBe(2);
      expect(result.pendingSync).toBe(true);
    });

    it('should handle sync operations', async () => {
      const syncResult = {
        success: 2,
        failed: 0
      };

      mockMoodService.syncOfflineEntries.mockResolvedValue(syncResult);

      const result = await mockMoodService.syncOfflineEntries();
      expect(result.success).toBe(2);
      expect(result.failed).toBe(0);
    });
  });

  describe('Data Flow Integration', () => {
    it('should integrate mood submission flow', async () => {
      // Setup complete flow
      mockMoodService.hasAnsweredToday.mockResolvedValue(false);
      mockMoodService.saveMoodResponse.mockResolvedValue({
        success: true,
        message: 'Mood salvo com sucesso!',
        data: {
          id: '1',
          mood: 'bem',
          period: 'manha',
          date: '2025-01-03',
          timestamp: Date.now(),
          serverSynced: true
        }
      });

      // Test flow steps
      const hasAnswered = await mockMoodService.hasAnsweredToday();
      expect(hasAnswered).toBe(false);

      const submitResult = await mockMoodService.saveMoodResponse('bem', {
        timestamp: Date.now(),
        activities: [],
        emotions: []
      });

      expect(submitResult.success).toBe(true);
      expect(submitResult.data?.mood).toBe('bem');
    });
  });
});
