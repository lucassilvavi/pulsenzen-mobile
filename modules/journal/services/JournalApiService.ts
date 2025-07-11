// Real API Service for Journal Module - Ready for Production
import { JournalEntryAPI, JournalPromptAPI, MoodTagAPI } from '../models/ApiModels';
import { JournalEntry, JournalPrompt, JournalStats } from '../types';

/**
 * Production-ready Journal API Service
 * This service handles all API communication for journal functionality
 */
export class JournalApiService {
  private static readonly BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.pulsezen.com';
  private static readonly API_VERSION = 'v1';
  
  // Authentication headers
  private static getHeaders(): HeadersInit {
    // Get auth token from secure storage (AsyncStorage in React Native)
    const authToken = (global as any)?.userToken || 
                     (typeof localStorage !== 'undefined' ? localStorage.getItem('authToken') : null);
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
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Request failed for ${endpoint}:`, error);
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
    limit?: number;
    offset?: number;
    startDate?: string;
    endDate?: string;
    category?: string;
    search?: string;
  }): Promise<JournalEntry[]> {
    const queryParams = new URLSearchParams(filters as Record<string, string>);
    const endpoint = `/journal/entries${queryParams.toString() ? `?${queryParams}` : ''}`;
    
    const apiEntries = await this.apiRequest<JournalEntryAPI[]>(endpoint);
    return this.mapApiEntriesToLocal(apiEntries);
  }

  static async getEntryById(id: string): Promise<JournalEntry | null> {
    try {
      const apiEntry = await this.apiRequest<JournalEntryAPI>(`/journal/entries/${id}`);
      return this.mapApiEntryToLocal(apiEntry);
    } catch (error) {
      console.error(`Failed to get entry ${id}:`, error);
      return null;
    }
  }

  static async createEntry(entry: Partial<JournalEntry>): Promise<JournalEntry> {
    const apiEntryData = this.mapLocalEntryToApi(entry);
    
    const createdEntry = await this.apiRequest<JournalEntryAPI>('/journal/entries', {
      method: 'POST',
      body: JSON.stringify(apiEntryData),
    });

    return this.mapApiEntryToLocal(createdEntry);
  }

  static async updateEntry(id: string, updates: Partial<JournalEntry>): Promise<JournalEntry> {
    const apiUpdateData = this.mapLocalEntryToApi(updates);
    
    const updatedEntry = await this.apiRequest<JournalEntryAPI>(`/journal/entries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(apiUpdateData),
    });

    return this.mapApiEntryToLocal(updatedEntry);
  }

  static async deleteEntry(id: string): Promise<void> {
    await this.apiRequest(`/journal/entries/${id}`, {
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
    };
  }

  private static mapApiPromptsToLocal(apiPrompts: JournalPromptAPI[]): JournalPrompt[] {
    return apiPrompts.map(this.mapApiPromptToLocal);
  }

  private static mapApiEntryToLocal(apiEntry: JournalEntryAPI): JournalEntry {
    return {
      id: apiEntry.id,
      text: apiEntry.content,
      prompt: apiEntry.customPrompt || '',
      promptCategory: apiEntry.category,
      moodTags: apiEntry.moodTags.map(tag => `${tag.emoji} ${tag.label}`),
      date: apiEntry.metadata.createdAt,
      wordCount: apiEntry.wordCount,
    };
  }

  private static mapApiEntriesToLocal(apiEntries: JournalEntryAPI[]): JournalEntry[] {
    return apiEntries.map(this.mapApiEntryToLocal);
  }

  private static mapLocalEntryToApi(localEntry: Partial<JournalEntry>): Partial<JournalEntryAPI> {
    return {
      content: localEntry.text || '',
      customPrompt: localEntry.prompt,
      category: localEntry.promptCategory || 'General',
      wordCount: localEntry.wordCount || 0,
      characterCount: localEntry.text?.length || 0,
      readingTime: Math.ceil((localEntry.wordCount || 0) / 200 * 60), // Rough estimate
      keywords: localEntry.text ? this.extractKeywords(localEntry.text) : [],
      metadata: {
        createdAt: localEntry.date || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        deviceType: 'phone', // Could be determined from user agent
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
      await this.apiRequest('/health');
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
      return await this.getEntries();
    } catch (error) {
      console.warn('API unavailable, falling back to mock data');
      const { JournalService } = await import('../services/JournalService');
      return await JournalService.getEntries();
    }
  }
}

export default JournalApiService;
