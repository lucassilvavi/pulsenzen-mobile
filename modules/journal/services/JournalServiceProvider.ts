// Service Provider Pattern for Journal Module
// Centralized service management with environment-based switching
import AsyncStorage from '@react-native-async-storage/async-storage';
import { JournalEntry, JournalEntryFilters, JournalPrompt, JournalStats } from '../types';

// Interface that both Mock and API services must implement
export interface IJournalService {
  // Prompts
  getPrompts(filters?: any): Promise<JournalPrompt[]>;
  getRandomPrompt(): Promise<JournalPrompt | null>;
  
  // Entries
  getEntries(filters?: JournalEntryFilters): Promise<JournalEntry[]>;
  getEntryById(id: string): Promise<JournalEntry | null>;
  createEntry(entry: Partial<JournalEntry>): Promise<JournalEntry>;
  updateEntry(id: string, updates: Partial<JournalEntry>): Promise<JournalEntry>;
  deleteEntry(id: string): Promise<void>;
  saveEntry(entry: JournalEntry): Promise<void>; // For backward compatibility
  
  // Search & Analytics
  searchEntries(query: string): Promise<JournalEntry[]>;
  getStatistics(): Promise<JournalStats>;
}

/**
 * Centralized Service Provider for Journal Module
 * Automatically switches between Mock and API services based on environment
 */
export class JournalServiceProvider {
  private static instance: IJournalService | null = null;
  private static currentEnvironment: 'mock' | 'api' | null = null;

  /**
   * Get singleton instance of the appropriate service
   */
  static async getInstance(): Promise<IJournalService> {
    const environment = await this.determineEnvironment();
    
    // Re-create instance if environment changed
    if (!this.instance || this.currentEnvironment !== environment) {
      this.instance = await this.createServiceInstance(environment);
      this.currentEnvironment = environment;
      
      console.log(`🔧 JournalServiceProvider: Using ${environment} service`);
    }
    
    return this.instance;
  }

  /**
   * Determine which service to use based on environment and settings
   */
  private static async determineEnvironment(): Promise<'mock' | 'api'> {
    // 1. Check if user has forced a specific service
    const userPreference = await AsyncStorage.getItem('journal_service_preference');
    if (userPreference === 'mock' || userPreference === 'api') {
      return userPreference;
    }

    // 2. Check environment variables
    if (process.env.EXPO_PUBLIC_USE_REAL_API === 'true') {
      return 'api';
    }

    // 3. Development mode defaults to mock unless explicitly set
    if (process.env.NODE_ENV === 'development' && !process.env.EXPO_PUBLIC_USE_REAL_API) {
      return 'mock';
    }

    // 4. Production defaults to API
    return 'api';
  }

  /**
   * Create appropriate service instance
   */
  private static async createServiceInstance(environment: 'mock' | 'api'): Promise<IJournalService> {
    if (environment === 'api') {
      // Test API connectivity first
      const isApiAvailable = await this.testApiConnectivity();
      
      if (isApiAvailable) {
        const { JournalApiService } = await import('./JournalApiService');
        return new JournalApiServiceAdapter();
      } else {
        console.warn('⚠️ API unavailable, falling back to Mock service');
        const { JournalService } = await import('./JournalService');
        return new JournalMockServiceAdapter();
      }
    } else {
      const { JournalService } = await import('./JournalService');
      return new JournalMockServiceAdapter();
    }
  }

  /**
   * Test API connectivity
   */
  private static async testApiConnectivity(): Promise<boolean> {
    try {
      const { JournalApiService } = await import('./JournalApiService');
      await (JournalApiService as any).isOnline?.();
      return true;
    } catch (error) {
      console.log('API connectivity test failed:', error);
      return false;
    }
  }

  // === Public API Methods ===
  
  /**
   * Get service instance (alias for getInstance for backward compatibility)
   */
  static async getService(): Promise<IJournalService> {
    return this.getInstance();
  }
  
  static async getPrompts(filters?: any): Promise<JournalPrompt[]> {
    const service = await this.getInstance();
    return service.getPrompts(filters);
  }

  static async getRandomPrompt(): Promise<JournalPrompt | null> {
    const service = await this.getInstance();
    return service.getRandomPrompt();
  }

  static async getEntries(filters?: JournalEntryFilters): Promise<JournalEntry[]> {
    const service = await this.getInstance();
    return service.getEntries(filters);
  }

  static async getEntryById(id: string): Promise<JournalEntry | null> {
    const service = await this.getInstance();
    return service.getEntryById(id);
  }

  static async createEntry(entry: Partial<JournalEntry>): Promise<JournalEntry> {
    const service = await this.getInstance();
    return service.createEntry(entry);
  }

  static async updateEntry(id: string, updates: Partial<JournalEntry>): Promise<JournalEntry> {
    const service = await this.getInstance();
    return service.updateEntry(id, updates);
  }

  static async deleteEntry(id: string): Promise<void> {
    const service = await this.getInstance();
    return service.deleteEntry(id);
  }

  static async searchEntries(query: string): Promise<JournalEntry[]> {
    const service = await this.getInstance();
    return service.searchEntries(query);
  }

  static async getStatistics(): Promise<JournalStats> {
    const service = await this.getInstance();
    return service.getStatistics();
  }

  // === Service Management ===
  
  /**
   * Force service type (useful for testing)
   */
  static async setServiceType(type: 'mock' | 'api' | 'auto'): Promise<void> {
    if (type === 'auto') {
      await AsyncStorage.removeItem('journal_service_preference');
    } else {
      await AsyncStorage.setItem('journal_service_preference', type);
    }
    
    // Reset instance to force recreation
    this.instance = null;
    this.currentEnvironment = null;
  }

  /**
   * Get current service type
   */
  static getCurrentServiceType(): 'mock' | 'api' | null {
    return this.currentEnvironment;
  }

  /**
   * Check if API is available
   */
  static async isApiAvailable(): Promise<boolean> {
    return await this.testApiConnectivity();
  }

  /**
   * Force refresh of service instance
   */
  static refresh(): void {
    this.instance = null;
    this.currentEnvironment = null;
  }
}

// === Service Adapters ===

/**
 * Adapter for JournalApiService to implement IJournalService interface
 */
class JournalApiServiceAdapter implements IJournalService {
  private async getApiService() {
    const { JournalApiService } = await import('./JournalApiService');
    return JournalApiService;
  }

  async getPrompts(filters?: any): Promise<JournalPrompt[]> {
    const api = await this.getApiService();
    return api.getPrompts(filters);
  }

  async getRandomPrompt(): Promise<JournalPrompt | null> {
    const api = await this.getApiService();
    return api.getRandomPrompt();
  }

  async getEntries(filters?: JournalEntryFilters): Promise<JournalEntry[]> {
    const api = await this.getApiService();
    return api.getEntries(filters as any);
  }

  async getEntryById(id: string): Promise<JournalEntry | null> {
    const api = await this.getApiService();
    return api.getEntryById(id);
  }

  async createEntry(entry: Partial<JournalEntry>): Promise<JournalEntry> {
    const api = await this.getApiService();
    return api.createEntry(entry);
  }

  async updateEntry(id: string, updates: Partial<JournalEntry>): Promise<JournalEntry> {
    const api = await this.getApiService();
    return api.updateEntry(id, updates);
  }

  async deleteEntry(id: string): Promise<void> {
    const api = await this.getApiService();
    return api.deleteEntry(id);
  }

  async saveEntry(entry: JournalEntry): Promise<void> {
    const api = await this.getApiService();
    await api.createEntry(entry);
  }

  async searchEntries(query: string): Promise<JournalEntry[]> {
    const api = await this.getApiService();
    return api.searchEntries(query);
  }

  async getStatistics(): Promise<JournalStats> {
    const api = await this.getApiService();
    return api.getStatistics();
  }
}

/**
 * Adapter for JournalService (Mock) to implement IJournalService interface
 */
class JournalMockServiceAdapter implements IJournalService {
  private async getMockService() {
    const { JournalService } = await import('./JournalService');
    return JournalService;
  }

  async getPrompts(filters?: any): Promise<JournalPrompt[]> {
    const mock = await this.getMockService();
    return mock.getPrompts();
  }

  async getRandomPrompt(): Promise<JournalPrompt | null> {
    const mock = await this.getMockService();
    return mock.getRandomPrompt();
  }

  async getEntries(filters?: JournalEntryFilters): Promise<JournalEntry[]> {
    const mock = await this.getMockService();
    return mock.getEntries();
  }

  async getEntryById(id: string): Promise<JournalEntry | null> {
    const mock = await this.getMockService();
    return mock.getEntryById(id);
  }

  async createEntry(entry: Partial<JournalEntry>): Promise<JournalEntry> {
    const mock = await this.getMockService();
    return mock.createEntry(entry);
  }

  async updateEntry(id: string, updates: Partial<JournalEntry>): Promise<JournalEntry> {
    const mock = await this.getMockService();
    return mock.updateEntry(id, updates);
  }

  async deleteEntry(id: string): Promise<void> {
    const mock = await this.getMockService();
    return mock.deleteEntry(id);
  }

  async saveEntry(entry: JournalEntry): Promise<void> {
    const mock = await this.getMockService();
    return mock.saveEntry(entry);
  }

  async searchEntries(query: string): Promise<JournalEntry[]> {
    const mock = await this.getMockService();
    return mock.searchEntries(query);
  }

  async getStatistics(): Promise<JournalStats> {
    const mock = await this.getMockService();
    return mock.getStatistics();
  }
}

export default JournalServiceProvider;
