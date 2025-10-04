import { API_CONFIG } from '../../../config/api';
import { logger } from '../../../utils/secureLogger';
import { networkManager } from '../../../utils/simpleNetworkManager';
import { MoodLevel, MoodPeriod } from '../types';

/**
 * Request/Response types for API
 */
export interface CreateMoodEntryRequest {
  mood_level: MoodLevel;
  period: MoodPeriod;
  date: string;
  notes?: string;
  activities?: string[];
  emotions?: string[];
}

export interface MoodEntryResponse {
  id: string;
  mood_level: MoodLevel;
  period: MoodPeriod;
  date: string;
  notes?: string;
  activities?: string[];
  emotions?: string[];
  created_at: string;
  updated_at: string;
}

export interface MoodStatsResponse {
  total_entries: number;
  average_mood: number;
  mood_counts: Record<MoodLevel, number>;
  most_common_mood: MoodLevel;
  mood_percentages: Record<MoodLevel, number>;
}

export interface MoodTrendResponse {
  date: string;
  mood: number;
}

export interface BaseApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * MoodApiClient - Centralized API client for mood operations
 * Handles all HTTP requests with proper error handling and logging
 */
export class MoodApiClient {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = `${API_CONFIG.BASE_URL}/mood`;
  }

  /**
   * Creates a new mood entry
   * POST /mood/entries
   */
  async createMoodEntry(data: CreateMoodEntryRequest): Promise<BaseApiResponse<MoodEntryResponse>> {
    try {
      logger.info('MoodApiClient', 'Creating mood entry', { 
        mood: data.mood_level, 
        period: data.period, 
        date: data.date 
      });

      console.log('dadosMoodApiClient', data);
      const response = await networkManager.post(`${this.baseUrl}/entries`, data);
      if (response.success) {
        logger.info('MoodApiClient', 'Mood entry created successfully', { 
          entryId: response.data?.id 
        });
      }
      return response;
    } catch (error) {
      return this.handleError('createMoodEntry', error);
    }
  }

  /**
   * Retrieves mood entries with optional filters
   * GET /mood/entries
   */
  async getMoodEntries(params?: {
    page?: number;
    limit?: number;
    period?: MoodPeriod;
    startDate?: string;
    endDate?: string;
  }): Promise<BaseApiResponse<{ entries: MoodEntryResponse[]; total: number; pages: number }>> {
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, String(value));
          }
        });
      }
      const url = `${this.baseUrl}/entries${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      logger.debug('MoodApiClient', 'Fetching mood entries', { params });
      const response = await networkManager.get(url);
      if (response.success) {
        logger.debug('MoodApiClient', 'Mood entries retrieved', { 
          count: response.data?.entries?.length || 0 
        });
      }
      return response;
    } catch (error) {
      return this.handleError('getMoodEntries', error);
    }
  }

  /**
   * Retrieves mood statistics
   * GET /mood/stats
   */
  async getMoodStats(days: number = 7): Promise<BaseApiResponse<MoodStatsResponse>> {
    try {
      logger.debug('MoodApiClient', 'Fetching mood stats', { days });
      const response = await networkManager.get(`${this.baseUrl}/stats?days=${days}`);
      if (response.success) {
        logger.debug('MoodApiClient', 'Mood stats retrieved', { 
          totalEntries: response.data?.total_entries 
        });
      }
      return response;
    } catch (error) {
      return this.handleError('getMoodStats', error);
    }
  }

  /**
   * Retrieves mood trend data
   * GET /mood/trend
   */
  async getMoodTrend(days: number = 30): Promise<BaseApiResponse<MoodTrendResponse[]>> {
    try {
      logger.debug('MoodApiClient', 'Fetching mood trend', { days });
      const response = await networkManager.get(`${this.baseUrl}/trend?days=${days}`);
      if (response.success) {
        logger.debug('MoodApiClient', 'Mood trend retrieved', { 
          dataPoints: response.data?.length || 0 
        });
      }
      return response;
    } catch (error) {
      return this.handleError('getMoodTrend', error);
    }
  }

  /**
   * Validates if user can create entry for specific period
   * GET /mood/validate/:period
   */
  async validatePeriod(period: MoodPeriod, date?: string): Promise<BaseApiResponse<{ can_create: boolean; canCreate?: boolean; reason?: string }>> {
    try {
      const queryParams = date ? `?date=${date}` : '';
      logger.debug('MoodApiClient', 'Validating period', { period, date });
      const response = await networkManager.get(`${this.baseUrl}/validate/${period}${queryParams}`);
      return response;
    } catch (error) {
      return this.handleError('validatePeriod', error);
    }
  }

  // ============ ANALYTICS ENDPOINTS ============

  /**
   * Gets positive mood streak analytics
   * GET /mood/analytics/positive-streak
   */
  async getPositiveMoodStreak(): Promise<BaseApiResponse<{
    currentStreak: number;
    longestStreak: number;
    isActive: boolean;
    lastPositiveDate?: string;
  }>> {
    try {
      logger.debug('MoodApiClient', 'Fetching positive mood streak');
      const response = await networkManager.get(`${this.baseUrl}/analytics/positive-streak`);
      return response;
    } catch (error) {
      return this.handleError('getPositiveMoodStreak', error);
    }
  }

  /**
   * Gets period patterns analytics
   * GET /mood/analytics/period-patterns
   */
  async getPeriodPatterns(days: number = 30): Promise<BaseApiResponse<{
    bestPeriod: MoodPeriod;
    worstPeriod: MoodPeriod;
    periodAverages: Record<MoodPeriod, number>;
    consistency: number;
  }>> {
    try {
      logger.debug('MoodApiClient', 'Fetching period patterns', { days });
      const response = await networkManager.get(`${this.baseUrl}/analytics/period-patterns?days=${days}`);
      return response;
    } catch (error) {
      return this.handleError('getPeriodPatterns', error);
    }
  }

  /**
   * Gets weekly trends analytics
   * GET /mood/analytics/weekly-trends
   */
  async getWeeklyTrends(weeks: number = 8): Promise<BaseApiResponse<{
    weeklyAverages: { week: string; average: number }[];
    trendDirection: 'improving' | 'stable' | 'declining';
    volatility: number;
  }>> {
    try {
      logger.debug('MoodApiClient', 'Fetching weekly trends', { weeks });
      const response = await networkManager.get(`${this.baseUrl}/analytics/weekly-trends?weeks=${weeks}`);
      return response;
    } catch (error) {
      return this.handleError('getWeeklyTrends', error);
    }
  }

  /**
   * Gets personalized insights
   * GET /mood/analytics/insights
   */
  async getInsights(): Promise<BaseApiResponse<Array<{
    id: string;
    type: 'pattern' | 'milestone' | 'improvement' | 'suggestion';
    title: string;
    description: string;
    relevance: number;
    actionable: boolean;
    metadata: {
      generatedAt: string;
      algorithm: string;
      confidence: number;
    };
  }>>> {
    try {
      logger.debug('MoodApiClient', 'Fetching personalized insights');
      const response = await networkManager.get(`${this.baseUrl}/analytics/insights`);
      return response;
    } catch (error) {
      return this.handleError('getInsights', error);
    }
  }

  /**
   * Gets mood correlations
   * GET /mood/analytics/correlations
   */
  async getCorrelations(): Promise<BaseApiResponse<Array<{
    factor: string;
    correlation: number;
    significance: number;
    description: string;
  }>>> {
    try {
      logger.debug('MoodApiClient', 'Fetching mood correlations');
      const response = await networkManager.get(`${this.baseUrl}/analytics/correlations`);
      return response;
    } catch (error) {
      return this.handleError('getCorrelations', error);
    }
  }

  /**
   * Gets complete analytics dashboard
   * GET /mood/analytics/dashboard
   */
  async getAnalyticsDashboard(days: number = 30, weeks: number = 8): Promise<BaseApiResponse<{
    positiveStreak: any;
    periodPatterns: any;
    weeklyTrends: any;
    insights: any[];
    correlations: any[];
    metadata: {
      generatedAt: string;
      parameters: { days: number; weeks: number };
    };
  }>> {
    try {
      logger.debug('MoodApiClient', 'Fetching analytics dashboard', { days, weeks });
      const response = await networkManager.get(`${this.baseUrl}/analytics/dashboard?days=${days}&weeks=${weeks}`);
      return response;
    } catch (error) {
      return this.handleError('getAnalyticsDashboard', error);
    }
  }

  // ============ PRIVATE METHODS ============

  /**
   * Handles API errors with proper logging and response format
   */
  private handleError(operation: string, error: any): BaseApiResponse {
    // Handle null/undefined errors properly
    const errorMessage = error instanceof Error 
      ? error.message 
      : error != null 
        ? String(error) 
        : 'Unknown error occurred';
    
    // Create a proper Error object for logging
    const errorForLogging = error instanceof Error 
      ? error 
      : new Error(errorMessage);
    
    logger.error('MoodApiClient', `Error in ${operation}`, errorForLogging);

    // Classify error type for better handling
    let errorType: 'network' | 'validation' | 'rate_limit' | 'server' | 'unknown' = 'unknown';
    
    if (errorMessage.includes('network') || errorMessage.includes('connection')) {
      errorType = 'network';
    } else if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
      errorType = 'rate_limit';
    } else if (errorMessage.includes('400') || errorMessage.includes('validation')) {
      errorType = 'validation';
    } else if (errorMessage.includes('500') || errorMessage.includes('server')) {
      errorType = 'server';
    }

    return {
      success: false,
      error: errorMessage,
      message: this.getErrorMessage(errorType)
    };
  }

  /**
   * Gets user-friendly error messages
   */
  private getErrorMessage(errorType: string): string {
    const messages = {
      network: 'Erro de conexão. Verifique sua internet e tente novamente.',
      rate_limit: 'Muitas tentativas. Aguarde um momento e tente novamente.',
      validation: 'Dados inválidos. Verifique as informações e tente novamente.',
      server: 'Erro interno do servidor. Tente novamente mais tarde.',
      unknown: 'Erro inesperado. Tente novamente.'
    };

    return messages[errorType as keyof typeof messages] || messages.unknown;
  }
}

// Export singleton instance
export const moodApiClient = new MoodApiClient();
export default moodApiClient;
