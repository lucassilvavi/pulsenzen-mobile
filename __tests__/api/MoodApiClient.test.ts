import { MoodApiClient } from '../../modules/mood/api/MoodApiClient';
import { MoodLevel } from '../../modules/mood/types';

// Mock networkManager - Create a simple mock without importing
const mockNetworkManager = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};

// Mock the module
jest.mock('../../services/networkManager', () => ({
  networkManager: mockNetworkManager
}));

describe('MoodApiClient', () => {
  let apiClient: MoodApiClient;

  beforeEach(() => {
    jest.clearAllMocks();
    apiClient = new MoodApiClient();
    
    // Mock console methods to avoid noise in tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Mood Entries Operations', () => {
    describe('getMoodEntries', () => {
      it('should fetch mood entries successfully', async () => {
        const mockEntries = [
          {
            id: '1',
            mood: 'bem' as MoodLevel,
            period: 'manha' as const,
            date: '2025-01-03',
            timestamp: Date.now(),
            serverSynced: true
          }
        ];

        mockNetworkManager.get.mockResolvedValue({
          data: { entries: mockEntries },
          status: 200
        });

        const result = await apiClient.getMoodEntries();

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockEntries);
        expect(mockNetworkManager.get).toHaveBeenCalledWith('/mood/entries', {
          params: { limit: 50, offset: 0 }
        });
      });

      it('should handle getMoodEntries with custom parameters', async () => {
        const mockEntries: any[] = [];
        
        mockNetworkManager.get.mockResolvedValue({
          data: { entries: mockEntries },
          status: 200
        });

        await apiClient.getMoodEntries(100, 25);

        expect(mockNetworkManager.get).toHaveBeenCalledWith('/mood/entries', {
          params: { limit: 100, offset: 25 }
        });
      });

      it('should handle getMoodEntries network error', async () => {
        mockNetworkManager.get.mockRejectedValue(new Error('Network failed'));

        const result = await apiClient.getMoodEntries();

        expect(result.success).toBe(false);
        expect(result.error).toBe('Erro de rede ao buscar entradas de humor');
      });

      it('should handle getMoodEntries server error', async () => {
        mockNetworkManager.get.mockResolvedValue({
          data: { message: 'Server error' },
          status: 500
        });

        const result = await apiClient.getMoodEntries();

        expect(result.success).toBe(false);
        expect(result.error).toBe('Server error');
      });
    });

    describe('createMoodEntry', () => {
      it('should create mood entry successfully', async () => {
        const mockEntry = {
          id: '1',
          mood: 'bem' as MoodLevel,
          period: 'manha' as const,
          date: '2025-01-03',
          timestamp: Date.now(),
          serverSynced: true
        };

        mockNetworkManager.post.mockResolvedValue({
          data: { entry: mockEntry },
          status: 201
        });

        const entryData = {
          mood: 'bem' as MoodLevel,
          period: 'manha' as const,
          timestamp: Date.now(),
          activities: ['meditation'],
          emotions: ['calm']
        };

        const result = await apiClient.createMoodEntry(entryData);

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockEntry);
        expect(mockNetworkManager.post).toHaveBeenCalledWith('/mood/entries', entryData);
      });

      it('should handle createMoodEntry validation error', async () => {
        mockNetworkManager.post.mockResolvedValue({
          data: { message: 'Invalid mood level' },
          status: 400
        });

        const entryData = {
          mood: 'invalid' as MoodLevel,
          period: 'manha' as const,
          timestamp: Date.now(),
          activities: [],
          emotions: []
        };

        const result = await apiClient.createMoodEntry(entryData);

        expect(result.success).toBe(false);
        expect(result.error).toBe('Invalid mood level');
      });
    });

    describe('updateMoodEntry', () => {
      it('should update mood entry successfully', async () => {
        const mockEntry = {
          id: '1',
          mood: 'excelente' as MoodLevel,
          period: 'manha' as const,
          date: '2025-01-03',
          timestamp: Date.now(),
          serverSynced: true
        };

        mockNetworkManager.put.mockResolvedValue({
          data: { entry: mockEntry },
          status: 200
        });

        const updates = {
          mood: 'excelente' as MoodLevel,
          activities: ['exercise', 'meditation']
        };

        const result = await apiClient.updateMoodEntry('1', updates);

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockEntry);
        expect(mockNetworkManager.put).toHaveBeenCalledWith('/mood/entries/1', updates);
      });

      it('should handle updateMoodEntry not found error', async () => {
        mockNetworkManager.put.mockResolvedValue({
          data: { message: 'Entry not found' },
          status: 404
        });

        const result = await apiClient.updateMoodEntry('999', { mood: 'bem' });

        expect(result.success).toBe(false);
        expect(result.error).toBe('Entry not found');
      });
    });

    describe('deleteMoodEntry', () => {
      it('should delete mood entry successfully', async () => {
        mockNetworkManager.delete.mockResolvedValue({
          data: { message: 'Entry deleted successfully' },
          status: 200
        });

        const result = await apiClient.deleteMoodEntry('1');

        expect(result.success).toBe(true);
        expect(result.message).toBe('Entry deleted successfully');
        expect(mockNetworkManager.delete).toHaveBeenCalledWith('/mood/entries/1');
      });

      it('should handle deleteMoodEntry not found error', async () => {
        mockNetworkManager.delete.mockResolvedValue({
          data: { message: 'Entry not found' },
          status: 404
        });

        const result = await apiClient.deleteMoodEntry('999');

        expect(result.success).toBe(false);
        expect(result.error).toBe('Entry not found');
      });
    });
  });

  describe('Analytics Operations', () => {
    describe('getMoodStats', () => {
      it('should fetch mood stats successfully', async () => {
        const mockStats = {
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
        };

        mockNetworkManager.get.mockResolvedValue({
          data: { stats: mockStats },
          status: 200
        });

        const result = await apiClient.getMoodStats(30);

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockStats);
        expect(mockNetworkManager.get).toHaveBeenCalledWith('/mood/analytics/stats', {
          params: { days: 30 }
        });
      });

      it('should handle getMoodStats with default days', async () => {
        mockNetworkManager.get.mockResolvedValue({
          data: { stats: {} },
          status: 200
        });

        await apiClient.getMoodStats();

        expect(mockNetworkManager.get).toHaveBeenCalledWith('/mood/analytics/stats', {
          params: { days: 30 }
        });
      });
    });

    describe('getMoodTrends', () => {
      it('should fetch mood trends successfully', async () => {
        const mockTrends = {
          dailyAverages: [
            { date: '2025-01-01', average: 3.5 },
            { date: '2025-01-02', average: 4.0 }
          ],
          weeklyTrend: 'improving',
          monthlyTrend: 'stable'
        };

        mockNetworkManager.get.mockResolvedValue({
          data: { trends: mockTrends },
          status: 200
        });

        const result = await apiClient.getMoodTrends(7);

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockTrends);
        expect(mockNetworkManager.get).toHaveBeenCalledWith('/mood/analytics/trends', {
          params: { days: 7 }
        });
      });
    });

    describe('getMoodPatterns', () => {
      it('should fetch mood patterns successfully', async () => {
        const mockPatterns = {
          timeOfDayPatterns: {
            morning: 3.8,
            afternoon: 3.5,
            evening: 3.2
          },
          dayOfWeekPatterns: {
            monday: 3.0,
            friday: 4.2
          }
        };

        mockNetworkManager.get.mockResolvedValue({
          data: { patterns: mockPatterns },
          status: 200
        });

        const result = await apiClient.getMoodPatterns();

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockPatterns);
        expect(mockNetworkManager.get).toHaveBeenCalledWith('/mood/analytics/patterns');
      });
    });

    describe('getMoodInsights', () => {
      it('should fetch mood insights successfully', async () => {
        const mockInsights = {
          insights: [
            {
              type: 'pattern',
              message: 'You tend to feel better in the morning',
              confidence: 0.85
            }
          ],
          recommendations: [
            {
              type: 'activity',
              message: 'Try morning meditation to maintain good mood',
              priority: 'high'
            }
          ]
        };

        mockNetworkManager.get.mockResolvedValue({
          data: { insights: mockInsights },
          status: 200
        });

        const result = await apiClient.getMoodInsights();

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockInsights);
        expect(mockNetworkManager.get).toHaveBeenCalledWith('/mood/analytics/insights');
      });
    });

    describe('getMoodCorrelations', () => {
      it('should fetch mood correlations successfully', async () => {
        const mockCorrelations = {
          activityCorrelations: {
            'exercise': 0.7,
            'meditation': 0.6,
            'social': 0.4
          },
          contextCorrelations: {
            'weather': 0.3,
            'sleep': 0.8
          }
        };

        mockNetworkManager.get.mockResolvedValue({
          data: { correlations: mockCorrelations },
          status: 200
        });

        const result = await apiClient.getMoodCorrelations();

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockCorrelations);
        expect(mockNetworkManager.get).toHaveBeenCalledWith('/mood/analytics/correlations');
      });
    });

    describe('getMoodReport', () => {
      it('should fetch mood report successfully', async () => {
        const mockReport = {
          period: {
            start: '2025-01-01',
            end: '2025-01-31'
          },
          summary: {
            totalEntries: 25,
            averageMood: 3.6,
            bestDay: '2025-01-15',
            worstDay: '2025-01-08'
          },
          charts: [
            {
              type: 'line',
              data: [3.5, 3.8, 3.2, 4.0]
            }
          ]
        };

        mockNetworkManager.get.mockResolvedValue({
          data: { report: mockReport },
          status: 200
        });

        const result = await apiClient.getMoodReport('monthly');

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockReport);
        expect(mockNetworkManager.get).toHaveBeenCalledWith('/mood/analytics/report', {
          params: { period: 'monthly' }
        });
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network timeout errors', async () => {
      const timeoutError = new Error('timeout');
      timeoutError.name = 'TimeoutError';
      
      mockNetworkManager.get.mockRejectedValue(timeoutError);

      const result = await apiClient.getMoodEntries();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Erro de rede ao buscar entradas de humor');
    });

    it('should handle unexpected errors gracefully', async () => {
      mockNetworkManager.get.mockRejectedValue(new Error('Unexpected error'));

      const result = await apiClient.getMoodEntries();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Erro de rede ao buscar entradas de humor');
    });

    it('should handle malformed response data', async () => {
      mockNetworkManager.get.mockResolvedValue({
        data: null,
        status: 200
      });

      const result = await apiClient.getMoodEntries();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Resposta inválida do servidor');
    });

    it('should log errors appropriately', async () => {
      const consoleSpy = jest.spyOn(console, 'error');
      
      mockNetworkManager.get.mockRejectedValue(new Error('Test error'));

      await apiClient.getMoodEntries();

      expect(consoleSpy).toHaveBeenCalledWith(
        '[MoodApiClient] Error in getMoodEntries:',
        expect.any(Error)
      );
    });
  });

  describe('Response Normalization', () => {
    it('should normalize successful responses correctly', async () => {
      const mockData = { test: 'data' };
      
      mockNetworkManager.get.mockResolvedValue({
        data: { entries: mockData },
        status: 200
      });

      const result = await apiClient.getMoodEntries();

      expect(result).toEqual({
        success: true,
        data: mockData,
        timestamp: expect.any(Number)
      });
    });

    it('should normalize error responses correctly', async () => {
      mockNetworkManager.get.mockResolvedValue({
        data: { message: 'Custom error message' },
        status: 400
      });

      const result = await apiClient.getMoodEntries();

      expect(result).toEqual({
        success: false,
        error: 'Custom error message',
        timestamp: expect.any(Number)
      });
    });
  });

  describe('Endpoint Coverage', () => {
    it('should have all required CRUD endpoints', () => {
      expect(typeof apiClient.getMoodEntries).toBe('function');
      expect(typeof apiClient.createMoodEntry).toBe('function');
      expect(typeof apiClient.updateMoodEntry).toBe('function');
      expect(typeof apiClient.deleteMoodEntry).toBe('function');
    });

    it('should have all analytics endpoints', () => {
      expect(typeof apiClient.getMoodStats).toBe('function');
      expect(typeof apiClient.getMoodTrends).toBe('function');
      expect(typeof apiClient.getMoodPatterns).toBe('function');
      expect(typeof apiClient.getMoodInsights).toBe('function');
      expect(typeof apiClient.getMoodCorrelations).toBe('function');
      expect(typeof apiClient.getMoodReport).toBe('function');
    });
  });
});
