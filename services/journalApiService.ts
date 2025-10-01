import { API_CONFIG } from '../config/api';
import { logger } from '../utils/secureLogger';
import AuthService from './authService';

// Configuração da API
const API_BASE_URL = API_CONFIG.BASE_URL

// Tipos para o Journal
export interface JournalEntry {
  id: string
  title?: string
  content: string
  moodTags: Array<{
    id: string
    emoji: string
    label: string
    color: string
    category: string
    intensity: number
  }>
  category: string
  wordCount: number
  characterCount: number
  readingTime: number
  sentiment?: {
    score: number
    label: string
    confidence: number
  }
  emotions?: {
    joy: number
    sadness: number
    anger: number
    fear: number
    surprise: number
    disgust: number
  }
  keywords: string[]
  themes: string[]
  privacy: {
    level: string
    shareWithTherapist: boolean
  }
  createdAt: string
  updatedAt: string
}

export interface JournalPrompt {
  id: string
  question: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  type: 'standard' | 'guided' | 'creative' | 'therapeutic'
  estimatedTime: number
  benefits: string[]
  instructions?: string[]
  tags: string[]
  icon?: string
  isPremium: boolean
}

export interface JournalStats {
  totalEntries: number
  uniqueDays: number
  totalWords: number
  avgWordsPerEntry: number
  currentStreak: number
  longestStreak: number
  percentPositive: number
  moodDistribution: Array<{
    mood: string
    count: number
    percentage: number
  }>
  weeklyProgress: Array<{
    week: string
    entries: number
    startDate: string
    endDate: string
  }>
  moodTimeline: Array<{
    date: string
    mood: number
    emoji: string
    label: string
  }>
}

export interface CreateJournalEntryData {
  title?: string
  content: string
  category?: string
  moodTagIds?: string[]
  metadata?: Record<string, unknown>
}

export interface UpdateJournalEntryData {
  title?: string
  content?: string
  category?: string
  moodTagIds?: string[]
}

export interface SearchFilters {
  category?: string
  dateFrom?: string
  dateTo?: string
  moodTags?: string[]
  sentiment?: 'positive' | 'negative' | 'neutral'
  keywords?: string[]
}

export interface JournalPromptFilters {
  category?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  isActive?: boolean
}

export interface StatsFilters {
  dateFrom?: string
  dateTo?: string
  category?: string
}

export interface UserRegistrationData {
  email: string
  password: string
  password_confirmation: string
  firstName: string
  lastName: string
  preferences?: {
    notifications?: boolean
    theme?: 'light' | 'dark'
    language?: string
  }
}

export interface GetEntriesFilters {
  limit?: number
  offset?: number
  page?: number
  startDate?: string
  endDate?: string
  category?: string
  search?: string
  moodTags?: string[]
}

class JournalApiService {
  
  // Helper method to get auth headers
  private async getAuthHeaders() {
    const authHeaders = await AuthService.getAuthHeader()
    return {
      'Content-Type': 'application/json',
      ...authHeaders,
    }
  }

  // Helper para fazer requisições HTTP
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    const headers = await this.getAuthHeaders()

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      })

      return await this.handleApiResponse(response)
    } catch (error) {
      logger.error('JournalApiService', `Erro na requisição para ${endpoint}`, error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }

  // Tratamento de erros da API
  private async handleApiResponse(response: Response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  }

  // ===== MÉTODOS PARA JOURNAL ENTRIES =====

  /**
   * Busca todas as entradas do journal
   */
  async getJournalEntries(filters: GetEntriesFilters = {}): Promise<{
    entries: JournalEntry[]
    total: number
    hasMore: boolean
  }> {
    const queryParams = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value))
      }
    })

    const queryString = queryParams.toString()
    const endpoint = `/journal${queryString ? `?${queryString}` : ''}`
    
    const response = await this.makeRequest(endpoint, {
      method: 'GET',
    })

    return response.data
  }

  /**
   * Busca uma entrada específica do journal
   */
  async getJournalEntry(id: string): Promise<JournalEntry> {
    const response = await this.makeRequest(`/journal/${id}`, {
      method: 'GET',
    })

    return response.data
  }

  /**
   * Cria uma nova entrada do journal
   */
  async createJournalEntry(entryData: CreateJournalEntryData): Promise<JournalEntry> {
    const response = await this.makeRequest('/journal', {
      method: 'POST',
      body: JSON.stringify(entryData),
    })

    return response.data
  }

  /**
   * Atualiza uma entrada do journal
   */
  async updateJournalEntry(id: string, entryData: UpdateJournalEntryData): Promise<JournalEntry> {
    const response = await this.makeRequest(`/journal/${id}`, {
      method: 'PUT',
      body: JSON.stringify(entryData),
    })

    return response.data
  }

  /**
   * Deleta uma entrada do journal
   */
  async deleteJournalEntry(id: string): Promise<boolean> {
    const response = await this.makeRequest(`/journal/${id}`, {
      method: 'DELETE',
    })

    return response.success
  }

  /**
   * Busca entradas do journal
   */
  async searchJournalEntries(query: string, filters: SearchFilters = {}): Promise<JournalEntry[]> {
    const queryParams = new URLSearchParams({ q: query })
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value))
      }
    })

    const response = await this.makeRequest(`/journal/search?${queryParams.toString()}`, {
      method: 'GET',
    })

    return response.data
  }

  /**
   * Busca estatísticas do journal
   */
  async getJournalStats(): Promise<JournalStats> {
    const response = await this.makeRequest('/journal/stats', {
      method: 'GET',
    })

    return response.data
  }

  /**
   * Busca analytics completos do journal
   */
  async getJournalAnalytics() {
    const response = await this.makeRequest('/journal/analytics', {
      method: 'GET',
    })

    return response.data
  }

  /**
   * Busca dados da timeline do journal
   */
  async getTimelineData(days: number = 7) {
    const response = await this.makeRequest(`/journal/analytics/timeline?days=${days}`, {
      method: 'GET',
    })

    return response.data
  }

  /**
   * Busca distribuição de humores
   */
  async getMoodDistribution() {
    const response = await this.makeRequest('/journal/analytics/mood-distribution', {
      method: 'GET',
    })

    return response.data
  }

  /**
   * Busca dados de streak
   */
  async getStreakData() {
    const response = await this.makeRequest('/journal/analytics/streak', {
      method: 'GET',
    })

    return response.data
  }

  // ===== MÉTODOS PARA PROMPTS =====

  /**
   * Busca prompts de journal disponíveis
   */
  async getJournalPrompts(filters: JournalPromptFilters = {}): Promise<JournalPrompt[]> {
    const queryParams = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value))
      }
    })

    const queryString = queryParams.toString()
    const endpoint = `/journal/prompts${queryString ? `?${queryString}` : ''}`
    
    const response = await this.makeRequest(endpoint, {
      method: 'GET',
    })

    return response.data
  }



  // ===== MÉTODOS DE UTILIDADE =====

  /**
   * Verifica se o usuário está autenticado
   */
  async isAuthenticated(): Promise<boolean> {
    return await AuthService.isAuthenticated()
  }

  /**
   * Faz logout do usuário
   */
  async logout(): Promise<void> {
    await AuthService.logout()
  }

  /**
   * Testa a conexão com a API
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.makeRequest('/health')
      return response.success
    } catch (error) {
      logger.error('JournalApiService', 'Erro ao testar conexão', error instanceof Error ? error : new Error(String(error)))
      return false
    }
  }

  // Alias methods for compatibility with useJournalApi hook
  async getEntries(page: number = 1, limit: number = 10, filters: GetEntriesFilters = {}): Promise<{
    success: boolean;
    data: { entries: JournalEntry[]; total: number; };
    message?: string;
  }> {
    try {
      const paginatedFilters = { ...filters, page, limit };
      const result = await this.getJournalEntries(paginatedFilters);
      return {
        success: true,
        data: {
          entries: result.entries,
          total: result.total
        }
      };
    } catch (error) {
      return {
        success: false,
        data: { entries: [], total: 0 },
        message: error instanceof Error ? error.message : 'Failed to get entries'
      };
    }
  }

  async createEntry(entryData: CreateJournalEntryData): Promise<JournalEntry> {
    return this.createJournalEntry(entryData);
  }

  async updateEntry(id: string, entryData: UpdateJournalEntryData): Promise<JournalEntry> {
    return this.updateJournalEntry(id, entryData);
  }

  async deleteEntry(id: string): Promise<boolean> {
    return this.deleteJournalEntry(id);
  }

  async getPrompts(category?: string): Promise<JournalPrompt[]> {
    return this.getJournalPrompts(category ? { category } : {});
  }

  async getStats(filters?: StatsFilters): Promise<JournalStats> {
    return this.getJournalStats();
  }

  async searchEntries(query: string, filters: SearchFilters = {}): Promise<JournalEntry[]> {
    return this.searchJournalEntries(query, filters);
  }

  async login(email: string, password: string): Promise<{ success: boolean; message: string }> {
    try {
      const result = await AuthService.login({ email, password });
      return { success: result.success, message: result.message };
    } catch (error) {
      return { success: false, message: 'Login failed' };
    }
  }

  async register(userData: UserRegistrationData): Promise<{ success: boolean; message: string }> {
    try {
      const result = await AuthService.register(userData);
      return { success: result.success, message: result.message };
    } catch (error) {
      return { success: false, message: 'Registration failed' };
    }
  }
}

// Exporta uma instância singleton
export const journalApiService = new JournalApiService()
export default journalApiService
