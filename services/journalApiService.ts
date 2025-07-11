import { API_CONFIG } from '../config/api';
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
  currentStreak: number
  longestStreak: number
  totalWords: number
  averageWordsPerEntry: number
  entriesThisWeek: number
  entriesThisMonth: number
  favoriteCategory: string
  mostUsedMoodTags: Array<{
    id: string
    emoji: string
    label: string
    count: number
  }>
  moodTrends: Array<{
    date: string
    averageMood: number
    entries: number
  }>
  writingPatterns: {
    hourOfDay: { [hour: string]: number }
    dayOfWeek: { [day: string]: number }
    wordsPerDay: { [date: string]: number }
  }
}

export interface CreateJournalEntryData {
  title?: string
  content: string
  category?: string
  moodTagIds?: string[]
  metadata?: any
}

export interface UpdateJournalEntryData {
  title?: string
  content?: string
  category?: string
  moodTagIds?: string[]
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
      console.error(`Erro na requisição para ${endpoint}:`, error)
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
  async searchJournalEntries(query: string, filters: any = {}): Promise<JournalEntry[]> {
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

  // ===== MÉTODOS PARA PROMPTS =====

  /**
   * Busca prompts para o journal
   */
  async getJournalPrompts(filters: any = {}): Promise<JournalPrompt[]> {
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
      // Test with the health endpoint which doesn't require auth
      const response = await fetch(`${API_BASE_URL.replace('/api/v1', '')}/health`)
      return response.ok
    } catch (error) {
      console.error('Erro ao testar conexão:', error)
      return false
    }
  }
}

// Exporta uma instância singleton
export const journalApiService = new JournalApiService()
export default journalApiService
