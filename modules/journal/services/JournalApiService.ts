// Real API Service for Journal Module - Ready for Production
import AuthService from '../../../services/authService';
import { JournalEntryAPI, JournalPromptAPI, MoodTagAPI } from '../models/ApiModels';
import { JournalEntry, JournalPrompt, JournalStats } from '../types';

/**
 * Production-ready Journal API Service
 * This service handles all API communication for journal functionality
 */
export class JournalApiService {
  private static readonly BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.pulsezen.com';
  private static readonly API_VERSION = 'v1';
  
  // Authentication headers
  private static async getHeaders(): Promise<HeadersInit> {
    // Get auth token from AuthService
    const authToken = await AuthService.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': authToken ? `Bearer ${authToken}` : '',
      'X-App-Version': '1.0.0',
    };
  }

  // Generic API request handler
  private static async apiRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.BASE_URL}/${this.API_VERSION}${endpoint}`;
    
    try {
      const headers = await this.getHeaders();
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`❌ API Request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Journal Prompts API
  static async getPrompts(filters?: {
    category?: string;
    difficulty?: string;
    type?: string;
    language?: string;
  }): Promise<JournalPrompt[]> {
    const queryParams = new URLSearchParams(filters as Record<string, string>);
    const endpoint = `/journal/prompts${queryParams.toString() ? `?${queryParams}` : ''}`;
    
    const apiPrompts = await this.apiRequest<JournalPromptAPI[]>(endpoint);
    return this.mapApiPromptsToLocal(apiPrompts);
  }

  static async getPromptById(id: string): Promise<JournalPrompt | null> {
    try {
      const apiPrompt = await this.apiRequest<JournalPromptAPI>(`/journal/prompts/${id}`);
      return this.mapApiPromptToLocal(apiPrompt);
    } catch (error) {
      console.error(`Failed to get prompt ${id}:`, error);
      return null;
    }
  }

  static async getRandomPrompt(filters?: {
    category?: string;
    excludeUsed?: boolean;
  }): Promise<JournalPrompt | null> {
    try {
      const queryParams = new URLSearchParams(filters as Record<string, string>);
      const endpoint = `/journal/prompts/random${queryParams.toString() ? `?${queryParams}` : ''}`;
      
      const apiPrompt = await this.apiRequest<JournalPromptAPI>(endpoint);
      return this.mapApiPromptToLocal(apiPrompt);
    } catch (error) {
      console.error('Failed to get random prompt:', error);
      return null;
    }
  }

  // Journal Entries API
  static async getEntries(filters?: {
    page?: number;
    limit?: number;
    offset?: number;
    startDate?: string;
    endDate?: string;
    category?: string;
    search?: string;
    isFavorite?: boolean;
    privacyLevel?: string;
    moodTags?: string[];
    minWords?: number;
    maxWords?: number;
  }): Promise<{
    entries: JournalEntry[];
    pagination: {
      page: number;
      limit: number;
      hasMore: boolean;
      totalInPage: number;
    };
  }> {
    // Convert parameters to URL query string
    const queryParams = new URLSearchParams();
    
    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());
    if (filters?.offset) queryParams.append('offset', filters.offset.toString());
    if (filters?.startDate) queryParams.append('startDate', filters.startDate);
    if (filters?.endDate) queryParams.append('endDate', filters.endDate);
    if (filters?.category) queryParams.append('category', filters.category);
    if (filters?.search) queryParams.append('search', filters.search);
    if (filters?.isFavorite !== undefined) queryParams.append('isFavorite', filters.isFavorite.toString());
    if (filters?.privacyLevel) queryParams.append('privacyLevel', filters.privacyLevel);
    if (filters?.moodTags && filters.moodTags.length > 0) {
      filters.moodTags.forEach(tag => queryParams.append('moodTags', tag));
    }
    if (filters?.minWords) queryParams.append('minWords', filters.minWords.toString());
    if (filters?.maxWords) queryParams.append('maxWords', filters.maxWords.toString());
    
    const endpoint = `/journal${queryParams.toString() ? `?${queryParams}` : ''}`;
    
    const response = await this.apiRequest<{
      data: JournalEntryAPI[];
      pagination: {
        page: number;
        limit: number;
        hasMore: boolean;
        totalInPage: number;
      };
    }>(endpoint);
    
    return {
      entries: this.mapApiEntriesToLocal(response.data),
      pagination: response.pagination
    };
  }

  static async getEntryById(id: string): Promise<JournalEntry | null> {
    try {
      const apiEntry = await this.apiRequest<JournalEntryAPI>(`/journal/${id}`);
      return this.mapApiEntryToLocal(apiEntry);
    } catch (error) {
      console.error(`Failed to get entry ${id}:`, error);
      return null;
    }
  }

  static async createEntry(entry: Partial<JournalEntry>): Promise<JournalEntry> {
    const apiEntryData = this.mapLocalEntryToApi(entry);
    
    const createdEntry = await this.apiRequest<any>('/journal', {
      method: 'POST',
      body: JSON.stringify(apiEntryData),
    });

    const localEntry = this.mapApiEntryToLocal(createdEntry);
    return localEntry;
  }

  static async updateEntry(id: string, updates: Partial<JournalEntry>): Promise<JournalEntry> {
    const apiUpdateData = this.mapLocalEntryToApi(updates);
    
    const updatedEntry = await this.apiRequest<JournalEntryAPI>(`/journal/${id}`, {
      method: 'PUT',
      body: JSON.stringify(apiUpdateData),
    });

    return this.mapApiEntryToLocal(updatedEntry);
  }

  static async deleteEntry(id: string): Promise<void> {
    await this.apiRequest(`/journal/${id}`, {
      method: 'DELETE',
    });
  }

  // Search and Analytics
  static async searchEntries(query: string, filters?: {
    category?: string;
    dateRange?: { start: string; end: string };
    moodTags?: string[];
  }): Promise<JournalEntry[]> {
    const searchData = {
      query,
      ...filters,
    };

    const apiEntries = await this.apiRequest<JournalEntryAPI[]>('/journal/search', {
      method: 'POST',
      body: JSON.stringify(searchData),
    });

    return this.mapApiEntriesToLocal(apiEntries);
  }

  static async getStatistics(timeRange?: {
    start: string;
    end: string;
  }): Promise<JournalStats> {
    const queryParams = timeRange ? new URLSearchParams({
      start: timeRange.start,
      end: timeRange.end,
    }) : '';
    
    const endpoint = `/journal/statistics${queryParams.toString() ? `?${queryParams}` : ''}`;
    
    interface ApiStatsResponse {
      totalEntries: number;
      uniqueDays: number;
      averageWordsPerEntry: number;
      mostActiveDay: string;
      favoriteCategories: { category: string; count: number }[];
      moodDistribution: { mood: string; percentage: number }[];
      sentimentTrends: { date: string; sentiment: number }[];
      writingStreaks: {
        current: number;
        longest: number;
      };
    }

    const apiStats = await this.apiRequest<ApiStatsResponse>(endpoint);
    
    // Map to local stats format
    return {
      totalEntries: apiStats.totalEntries,
      uniqueDays: apiStats.uniqueDays,
      percentPositive: apiStats.sentimentTrends.length > 0 
        ? Math.round(apiStats.sentimentTrends.filter(t => t.sentiment > 0).length / apiStats.sentimentTrends.length * 100)
        : 0,
    };
  }

  // Mood Tags API
  static async getMoodTags(category?: string): Promise<MoodTagAPI[]> {
    const queryParams = category ? new URLSearchParams({ category }) : '';
    const endpoint = `/journal/mood-tags${queryParams.toString() ? `?${queryParams}` : ''}`;
    
    return await this.apiRequest<MoodTagAPI[]>(endpoint);
  }

  // Data Mapping Functions
  private static mapApiPromptToLocal(apiPrompt: JournalPromptAPI): JournalPrompt {
    return {
      id: apiPrompt.id,
      question: apiPrompt.question,
      category: apiPrompt.category,
      icon: apiPrompt.icon,
      difficulty: 'intermediate',
      tags: []
    };
  }

  private static mapApiPromptsToLocal(apiPrompts: JournalPromptAPI[]): JournalPrompt[] {
    return apiPrompts.map(this.mapApiPromptToLocal);
  }

  private static mapApiEntryToLocal(apiEntry: any): JournalEntry {
    // The API is returning a different structure, map based on actual response
    return {
      id: apiEntry.id,
      content: apiEntry.content,
      promptCategory: apiEntry.promptCategory || 'Geral',
      moodTags: (apiEntry.moodTags || []).map((tag: any) => ({
        id: tag.id || `tag-${Math.random()}`,
        label: tag.label || tag.name || '',
        emoji: tag.emoji || '😐',
        category: tag.category || 'neutral' as const,
        intensity: tag.intensity || 3 as const,
        hexColor: tag.color || tag.hexColor || '#666666',
      })),
      createdAt: apiEntry.createdAt || new Date().toISOString(),
      updatedAt: apiEntry.updatedAt || new Date().toISOString(), 
      wordCount: apiEntry.wordCount || 0,
      readingTimeMinutes: apiEntry.readingTimeMinutes || 1,
      isFavorite: apiEntry.isFavorite || false,
      privacy: apiEntry.privacyLevel || 'private',
      selectedPrompt: (apiEntry.customPrompt || apiEntry.metadata?.title) ? {
        id: apiEntry.promptId || 'custom',
        question: apiEntry.customPrompt || apiEntry.metadata?.title || '',
        category: apiEntry.promptCategory || 'Geral',
        icon: 'help-circle',
        difficulty: 'beginner' as const,
        tags: [],
      } : undefined,
    };
  }

  private static mapApiEntriesToLocal(apiEntries: any[]): JournalEntry[] {
    return apiEntries.map(this.mapApiEntryToLocal);
  }

  private static mapLocalEntryToApi(localEntry: Partial<JournalEntry>): any {
    // Map to the format expected by the API controller
    return {
      content: localEntry.content || '',
      title: localEntry.selectedPrompt?.question || (localEntry as any).prompt || 'Entrada sem título',
      promptCategory: localEntry.promptCategory || 'general',
      customPrompt: localEntry.selectedPrompt?.question || (localEntry as any).prompt || null,
      moodTags: (localEntry.moodTags || []).map(tag => ({
        id: tag.id,
        label: tag.label,
        emoji: tag.emoji,
        category: tag.category,
        intensity: tag.intensity,
        hexColor: tag.hexColor
      })),
      privacyLevel: localEntry.privacy || 'private',
      isFavorite: localEntry.isFavorite || false,
      metadata: {
        createdAt: localEntry.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        deviceType: 'phone',
        appVersion: '1.0.0',
        writingSession: {
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          pauseCount: 0,
          revisionCount: 0,
        },
      },
    };
  }

  // Utility Functions
  private static extractKeywords(text: string): string[] {
    // Simple keyword extraction - could be enhanced with NLP
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .slice(0, 10); // Limit to 10 keywords
  }

  // Error Handling and Offline Support
  static async isOnline(): Promise<boolean> {
    try {
      // Use the API root endpoint for health check
      await this.apiRequest('/');
      return true;
    } catch {
      return false;
    }
  }

  // Backup fallback to mock service when API is unavailable
  static async getPromptsWithFallback(): Promise<JournalPrompt[]> {
    try {
      return await this.getPrompts();
    } catch (error) {
      console.warn('API unavailable, falling back to mock data');
      const { JournalService } = await import('../services/JournalService');
      return await JournalService.getPrompts();
    }
  }

  static async getEntriesWithFallback(): Promise<JournalEntry[]> {
    try {
      const result = await this.getEntries();
      return result.entries;
    } catch (error) {
      console.warn('API unavailable, falling back to mock data');
      const { JournalService } = await import('../services/JournalService');
      return await JournalService.getEntries();
    }
  }

  static async getEntriesPaginated(filters?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    isFavorite?: boolean;
  }) {
    return await this.getEntries(filters);
  }
}

export default JournalApiService;
