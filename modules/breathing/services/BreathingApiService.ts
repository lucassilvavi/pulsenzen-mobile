// Enhanced API Service for Breathing Module
import AsyncStorage from '@react-native-async-storage/async-storage';
import { breathingTechniques } from '../constants';
import {
    ApiResponse,
    BreathingErrorType,
    BreathingSessionAPI,
    BreathingStatsAPI,
    BreathingTechniqueAPI,
    CustomTechniqueAPI,
    PaginatedResponse,
    SessionFilters,
    TechniqueFilters,
    UserPreferencesAPI
} from '../models';
import { BreathingTechnique } from '../types';

// Base API configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://pulsezen-api-production.up.railway.app/api';
const API_VERSION = 'v1';
const BREATHING_ENDPOINT = `${API_BASE_URL}/${API_VERSION}/breathing`;

// Cache keys
const CACHE_KEYS = {
  TECHNIQUES: 'breathing_techniques',
  USER_SESSIONS: 'breathing_sessions',
  USER_STATS: 'breathing_stats',
  USER_PREFERENCES: 'breathing_preferences',
  CUSTOM_TECHNIQUES: 'breathing_custom_techniques',
  OFFLINE_SESSIONS: 'breathing_offline_sessions',
} as const;

// Cache durations (in minutes)
const CACHE_DURATION = {
  TECHNIQUES: 60 * 24, // 24 hours
  STATS: 60, // 1 hour
  PREFERENCES: 60 * 24 * 7, // 1 week
} as const;

class BreathingApiError extends Error {
  constructor(
    public type: BreathingErrorType,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'BreathingApiError';
  }
}

export class BreathingApiService {
  private static authToken: string | null = null;
  private static isOffline: boolean = false;

  // Authentication
  static setAuthToken(token: string): void {
    this.authToken = token;
  }

  static setOfflineMode(offline: boolean): void {
    this.isOffline = offline;
  }

  // Helper methods
  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    if (this.isOffline) {
      throw new BreathingApiError('NETWORK_ERROR', 'App is in offline mode');
    }

    const url = `${BREATHING_ENDPOINT}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new BreathingApiError(
          this.mapHttpStatusToErrorType(response.status),
          `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof BreathingApiError) {
        throw error;
      }
      throw new BreathingApiError('NETWORK_ERROR', 'Failed to connect to server', error);
    }
  }

  private static mapHttpStatusToErrorType(status: number): BreathingErrorType {
    switch (status) {
      case 401: return 'AUTHENTICATION_ERROR';
      case 400: return 'VALIDATION_ERROR';
      case 404: return 'NOT_FOUND';
      case 429: return 'RATE_LIMIT';
      case 500: return 'SERVER_ERROR';
      default: return 'UNKNOWN_ERROR';
    }
  }

  private static async getFromCache<T>(key: string): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(key);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();
      const cacheAge = (now - timestamp) / (1000 * 60); // in minutes

      // Check if cache is still valid based on type
      const maxAge = this.getCacheMaxAge(key);
      if (cacheAge > maxAge) {
        await AsyncStorage.removeItem(key);
        return null;
      }

      return data;
    } catch (error) {
      console.error(`Failed to get from cache: ${key}`, error);
      return null;
    }
  }

  private static async setCache<T>(key: string, data: T): Promise<void> {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
      console.error(`Failed to set cache: ${key}`, error);
    }
  }

  private static getCacheMaxAge(key: string): number {
    if (key.includes('techniques')) return CACHE_DURATION.TECHNIQUES;
    if (key.includes('stats')) return CACHE_DURATION.STATS;
    if (key.includes('preferences')) return CACHE_DURATION.PREFERENCES;
    return 60; // default 1 hour
  }

  // Technique management
  static async getTechniques(filters?: TechniqueFilters): Promise<BreathingTechniqueAPI[]> {
    const cacheKey = `${CACHE_KEYS.TECHNIQUES}_${JSON.stringify(filters || {})}`;
    
    // Try cache first
    const cached = await this.getFromCache<BreathingTechniqueAPI[]>(cacheKey);
    if (cached) return cached;

    try {
      const queryParams = filters ? `?${new URLSearchParams(filters as any).toString()}` : '';
      const response = await this.makeRequest<BreathingTechniqueAPI[]>(`/techniques${queryParams}`);
      
      await this.setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      // Fallback to mock data if API fails
      console.warn('API failed, using mock data:', error);
      return this.convertMockToApiFormat(breathingTechniques);
    }
  }

  static async getTechniqueById(id: string): Promise<BreathingTechniqueAPI> {
    try {
      const response = await this.makeRequest<BreathingTechniqueAPI>(`/techniques/${id}`);
      return response.data;
    } catch (error) {
      // Fallback to mock data
      const mockTechnique = breathingTechniques.find(t => t.key === id);
      if (mockTechnique) {
        return this.convertMockTechniqueToApi(mockTechnique);
      }
      throw error;
    }
  }

  static async getFeaturedTechniques(): Promise<BreathingTechniqueAPI[]> {
    const cacheKey = `${CACHE_KEYS.TECHNIQUES}_featured`;
    const cached = await this.getFromCache<BreathingTechniqueAPI[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeRequest<BreathingTechniqueAPI[]>('/techniques/featured');
      await this.setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      // Return first 2 techniques as featured
      return this.convertMockToApiFormat(breathingTechniques.slice(0, 2));
    }
  }

  static async searchTechniques(query: string): Promise<BreathingTechniqueAPI[]> {
    try {
      const response = await this.makeRequest<BreathingTechniqueAPI[]>(`/techniques/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      // Local search in mock data
      const filtered = breathingTechniques.filter(t => 
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        t.description.toLowerCase().includes(query.toLowerCase())
      );
      return this.convertMockToApiFormat(filtered);
    }
  }

  // Session management
  static async startSession(techniqueId: string): Promise<BreathingSessionAPI> {
    const sessionData = {
      techniqueId,
      startTime: new Date().toISOString(),
      status: 'started' as const,
      progress: {
        completedCycles: 0,
        totalCycles: 4, // default
        currentPhase: 'pause' as const,
        elapsedTime: 0,
        remainingTime: 0,
      },
      settings: await this.getUserSessionSettings(),
    };

    try {
      const response = await this.makeRequest<BreathingSessionAPI>('/sessions', {
        method: 'POST',
        body: JSON.stringify(sessionData),
      });
      return response.data;
    } catch (error) {
      // Create offline session
      const userSettings = await this.getUserSessionSettings();
      const offlineSession: BreathingSessionAPI = {
        id: `offline_${Date.now()}`,
        userId: 'offline_user',
        ...sessionData,
        settings: {
          hapticEnabled: userSettings.hapticEnabled,
          audioEnabled: userSettings.audioEnabled,
          visualStyle: userSettings.visualStyle as any,
          animationSpeed: 1.0,
        },
        environment: {
          deviceType: 'phone',
          appVersion: '1.0.0',
        },
      };
      
      await this.saveOfflineSession(offlineSession);
      return offlineSession;
    }
  }

  static async updateSession(sessionId: string, updates: Partial<BreathingSessionAPI>): Promise<void> {
    try {
      await this.makeRequest(`/sessions/${sessionId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    } catch (error) {
      // Update offline session
      await this.updateOfflineSession(sessionId, updates);
    }
  }

  static async completeSession(sessionId: string, finalData: Partial<BreathingSessionAPI>): Promise<void> {
    const completionData = {
      ...finalData,
      endTime: new Date().toISOString(),
      status: 'completed' as const,
    };

    try {
      await this.makeRequest(`/sessions/${sessionId}/complete`, {
        method: 'POST',
        body: JSON.stringify(completionData),
      });
    } catch (error) {
      await this.updateOfflineSession(sessionId, completionData);
    }
  }

  static async getUserSessions(filters?: SessionFilters): Promise<PaginatedResponse<BreathingSessionAPI>> {
    try {
      const queryParams = filters ? `?${new URLSearchParams(filters as any).toString()}` : '';
      const response = await this.makeRequest<BreathingSessionAPI[]>(`/sessions${queryParams}`);
      
      // Assuming API returns paginated data
      return {
        data: response.data,
        pagination: {
          page: 1,
          limit: 20,
          total: response.data.length,
          totalPages: 1,
        },
        status: 'success',
      };
    } catch (error) {
      // Return offline sessions
      const offlineSessions = await this.getOfflineSessions();
      return {
        data: offlineSessions,
        pagination: {
          page: 1,
          limit: 20,
          total: offlineSessions.length,
          totalPages: 1,
        },
        status: 'success',
      };
    }
  }

  // Statistics
  static async getUserStats(timeframe?: string): Promise<BreathingStatsAPI> {
    const cacheKey = `${CACHE_KEYS.USER_STATS}_${timeframe || 'all'}`;
    const cached = await this.getFromCache<BreathingStatsAPI>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeRequest<BreathingStatsAPI>(`/stats?timeframe=${timeframe || 'all'}`);
      await this.setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      // Return mock stats
      const mockStats: BreathingStatsAPI = {
        totalSessions: 0,
        totalMinutes: 0,
        currentStreak: 0,
        longestStreak: 0,
        favoriteCategory: 'relaxation',
        favoriteTechnique: '4-7-8',
        averageRating: 0,
        completionRate: 0,
        weeklyGoal: 30,
        weeklyProgress: 0,
        monthlyStats: {
          sessions: 0,
          minutes: 0,
          averageRating: 0,
        },
        achievements: [],
        trends: {
          sessionsOverTime: [],
          averageRatingOverTime: [],
          favoriteTimeOfDay: 'morning',
          improvementMetrics: {
            stressReduction: 0,
            focusImprovement: 0,
            sleepQuality: 0,
          },
        },
      };
      return mockStats;
    }
  }

  // User preferences
  static async getUserPreferences(): Promise<UserPreferencesAPI> {
    const cached = await this.getFromCache<UserPreferencesAPI>(CACHE_KEYS.USER_PREFERENCES);
    if (cached) return cached;

    try {
      const response = await this.makeRequest<UserPreferencesAPI>('/preferences');
      await this.setCache(CACHE_KEYS.USER_PREFERENCES, response.data);
      return response.data;
    } catch (error) {
      // Return default preferences
      const defaultPrefs: UserPreferencesAPI = {
        reminderSettings: {
          enabled: false,
          times: ['08:00', '20:00'],
          frequency: 'daily',
        },
        sessionSettings: {
          defaultDuration: 5,
          autoStart: false,
          showProgress: true,
          hapticEnabled: true,
          audioEnabled: false,
          visualStyle: 'default',
        },
        goals: {
          weeklyMinutes: 30,
          weeklyDays: 3,
          streakTarget: 7,
        },
        privacy: {
          shareStats: false,
          anonymousAnalytics: true,
          locationTracking: false,
        },
      };
      return defaultPrefs;
    }
  }

  static async updateUserPreferences(preferences: Partial<UserPreferencesAPI>): Promise<void> {
    try {
      await this.makeRequest('/preferences', {
        method: 'PATCH',
        body: JSON.stringify(preferences),
      });
      
      // Update cache
      const current = await this.getUserPreferences();
      const updated = { ...current, ...preferences };
      await this.setCache(CACHE_KEYS.USER_PREFERENCES, updated);
    } catch (error) {
      // Save locally
      const current = await this.getUserPreferences();
      const updated = { ...current, ...preferences };
      await this.setCache(CACHE_KEYS.USER_PREFERENCES, updated);
    }
  }

  // Custom techniques
  static async createCustomTechnique(technique: CustomTechniqueAPI): Promise<BreathingTechniqueAPI> {
    try {
      const response = await this.makeRequest<BreathingTechniqueAPI>('/techniques/custom', {
        method: 'POST',
        body: JSON.stringify(technique),
      });
      return response.data;
    } catch (error) {
      // Save as local custom technique
      const customTechnique: BreathingTechniqueAPI = {
        id: `custom_${Date.now()}`,
        key: technique.name.toLowerCase().replace(/\s+/g, '-'),
        title: technique.name,
        description: technique.description,
        category: technique.category as any,
        difficulty: 'beginner',
        timing: technique.timing,
        cycles: technique.cycles,
        estimatedDuration: (technique.timing.inhaleTime + technique.timing.holdTime + technique.timing.exhaleTime) * technique.cycles,
        benefits: [],
        instructions: [],
        media: {
          icon: {
            name: 'wind',
            color: '#2196F3',
            bg: '#E3F2FD',
          },
        },
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'user',
          isActive: true,
          isPremium: false,
          tags: ['custom'],
        },
      };

      await this.saveCustomTechnique(customTechnique);
      return customTechnique;
    }
  }

  // Offline data management
  private static async saveOfflineSession(session: BreathingSessionAPI): Promise<void> {
    try {
      const existing = await this.getOfflineSessions();
      existing.push(session);
      await AsyncStorage.setItem(CACHE_KEYS.OFFLINE_SESSIONS, JSON.stringify(existing));
    } catch (error) {
      console.error('Failed to save offline session:', error);
    }
  }

  private static async updateOfflineSession(sessionId: string, updates: Partial<BreathingSessionAPI>): Promise<void> {
    try {
      const sessions = await this.getOfflineSessions();
      const index = sessions.findIndex(s => s.id === sessionId);
      if (index >= 0) {
        sessions[index] = { ...sessions[index], ...updates };
        await AsyncStorage.setItem(CACHE_KEYS.OFFLINE_SESSIONS, JSON.stringify(sessions));
      }
    } catch (error) {
      console.error('Failed to update offline session:', error);
    }
  }

  private static async getOfflineSessions(): Promise<BreathingSessionAPI[]> {
    try {
      const sessions = await AsyncStorage.getItem(CACHE_KEYS.OFFLINE_SESSIONS);
      return sessions ? JSON.parse(sessions) : [];
    } catch (error) {
      console.error('Failed to get offline sessions:', error);
      return [];
    }
  }

  private static async saveCustomTechnique(technique: BreathingTechniqueAPI): Promise<void> {
    try {
      const existing = await this.getCustomTechniques();
      existing.push(technique);
      await AsyncStorage.setItem(CACHE_KEYS.CUSTOM_TECHNIQUES, JSON.stringify(existing));
    } catch (error) {
      console.error('Failed to save custom technique:', error);
    }
  }

  private static async getCustomTechniques(): Promise<BreathingTechniqueAPI[]> {
    try {
      const techniques = await AsyncStorage.getItem(CACHE_KEYS.CUSTOM_TECHNIQUES);
      return techniques ? JSON.parse(techniques) : [];
    } catch (error) {
      console.error('Failed to get custom techniques:', error);
      return [];
    }
  }

  // Sync offline data
  static async syncOfflineData(): Promise<void> {
    if (this.isOffline) return;

    try {
      const offlineSessions = await this.getOfflineSessions();
      for (const session of offlineSessions) {
        if (session.id.startsWith('offline_')) {
          // Create new session on server
          await this.makeRequest('/sessions', {
            method: 'POST',
            body: JSON.stringify({ ...session, id: undefined }),
          });
        }
      }

      // Clear offline sessions after successful sync
      await AsyncStorage.removeItem(CACHE_KEYS.OFFLINE_SESSIONS);
    } catch (error) {
      console.error('Failed to sync offline data:', error);
    }
  }

  // Utility methods
  private static async getUserSessionSettings() {
    const prefs = await this.getUserPreferences();
    return prefs.sessionSettings;
  }

  private static convertMockToApiFormat(techniques: BreathingTechnique[]): BreathingTechniqueAPI[] {
    return techniques.map(this.convertMockTechniqueToApi);
  }

  private static convertMockTechniqueToApi(technique: BreathingTechnique): BreathingTechniqueAPI {
    return {
      id: technique.key,
      key: technique.key,
      title: technique.title,
      description: technique.description,
      category: 'relaxation',
      difficulty: 'beginner',
      timing: {
        inhaleTime: technique.inhaleTime,
        holdTime: technique.holdTime,
        exhaleTime: technique.exhaleTime,
      },
      cycles: technique.cycles,
      estimatedDuration: (technique.inhaleTime + technique.holdTime + technique.exhaleTime) * technique.cycles,
      benefits: [],
      instructions: [],
      media: {
        icon: technique.icon,
      },
      metadata: {
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        createdBy: 'system',
        isActive: true,
        isPremium: false,
        tags: [],
      },
    };
  }

  // Clear all cache
  static async clearCache(): Promise<void> {
    try {
      await Promise.all(
        Object.values(CACHE_KEYS).map(key => AsyncStorage.removeItem(key))
      );
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }
}
