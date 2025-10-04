/**
 * Suggestion API Service
 * Service for communicating with suggestions API
 */

import { API_CONFIG } from '@/config/api'
import AuthService from '@/services/authService'
import { logger } from '@/utils/secureLogger'
import {
    ApiDailySuggestionsResponse,
    ApiMarkAsReadResponse,
    ApiRateSuggestionResponse,
    ApiSuggestionDetailResponse,
    ApiSuggestionStatsResponse,
    DailySuggestions,
    Suggestion,
    SuggestionDetail,
    SuggestionStats
} from '../types'

class SuggestionApiService {
  private baseUrl: string = `${API_CONFIG.BASE_URL}/suggestions`

  /**
   * Make authenticated API request
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      // ✅ GUARD: Verificar autenticação completa antes da API
      const isAuthenticated = await AuthService.isAuthenticated()
      if (!isAuthenticated) {
        throw new Error('User not authenticated or token expired')
      }

      const token = await AuthService.getToken()
      
      if (!token) {
        throw new Error('No authentication token available')
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      // ✅ Não logar erro se for questão de autenticação
      if (error instanceof Error && 
          (error.message.includes('not authenticated') || 
           error.message.includes('token expired'))) {
        // Propagar o erro silenciosamente para tratamento específico
        throw error
      }
      
      logger.error('SuggestionApiService', `Request failed for ${endpoint}`, error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }

  /**
   * Get daily suggestions for user
   */
  async getDailySuggestions(date?: string): Promise<DailySuggestions> {
    try {
      const queryParams = date ? `?date=${date}` : ''
      const response = await this.makeRequest<ApiDailySuggestionsResponse>(
        `/daily${queryParams}`
      )

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch daily suggestions')
      }

      return {
        suggestions: response.data.suggestions.map(this.mapApiSuggestion),
        date: response.data.date
      }
    } catch (error) {
      // ✅ Não logar erro se for questão de autenticação
      if (error instanceof Error && 
          (error.message.includes('not authenticated') || 
           error.message.includes('token expired'))) {
        // Silenciosamente usar fallback quando não autenticado
        return this.getFallbackSuggestions()
      }
      
      logger.error('SuggestionApiService', 'Failed to fetch daily suggestions', error instanceof Error ? error : new Error(String(error)))
      
      // Return fallback mock data for development
      return this.getFallbackSuggestions()
    }
  }

  /**
   * Get specific suggestion by ID
   */
  async getSuggestionById(suggestionId: string): Promise<SuggestionDetail> {
    try {
      const response = await this.makeRequest<ApiSuggestionDetailResponse>(
        `/${suggestionId}`
      )

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch suggestion')
      }

      return this.mapApiSuggestionDetail(response.data)
    } catch (error) {
      logger.error('SuggestionApiService', 'Failed to fetch suggestion', error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }

  /**
   * Mark suggestion as read
   */
  async markAsRead(userSuggestionId: string): Promise<void> {
    try {
      const response = await this.makeRequest<ApiMarkAsReadResponse>(
        `/${userSuggestionId}/read`,
        { method: 'POST' }
      )

      if (!response.success) {
        throw new Error(response.message || 'Failed to mark suggestion as read')
      }
    } catch (error) {
      logger.error('SuggestionApiService', 'Failed to mark suggestion as read', error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }

  /**
   * Rate a suggestion
   */
  async rateSuggestion(userSuggestionId: string, rating: number): Promise<void> {
    try {
      const response = await this.makeRequest<ApiRateSuggestionResponse>(
        `/${userSuggestionId}/rate`,
        {
          method: 'POST',
          body: JSON.stringify({ rating })
        }
      )

      if (!response.success) {
        throw new Error(response.message || 'Failed to rate suggestion')
      }
    } catch (error) {
      logger.error('SuggestionApiService', 'Failed to rate suggestion', error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }

  /**
   * Get user suggestion statistics
   */
  async getUserStats(): Promise<SuggestionStats> {
    try {
      const response = await this.makeRequest<ApiSuggestionStatsResponse>('/stats')

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch suggestion stats')
      }

      return response.data
    } catch (error) {
      logger.error('SuggestionApiService', 'Failed to fetch suggestion stats', error instanceof Error ? error : new Error(String(error)))
      
      // Return fallback stats
      return {
        totalAssigned: 0,
        totalRead: 0,
        averageRating: 0,
        readingStreak: 0,
        favoriteCategory: null
      }
    }
  }

  /**
   * Map API suggestion to domain model
   */
  private mapApiSuggestion(apiSuggestion: any): Suggestion {
    return {
      id: apiSuggestion.id,
      title: apiSuggestion.title,
      summary: apiSuggestion.summary,
      category: apiSuggestion.category,
      estimatedReadTime: apiSuggestion.estimatedReadTime,
      imageUrl: apiSuggestion.imageUrl,
      isRead: apiSuggestion.isRead,
      userSuggestionId: apiSuggestion.userSuggestionId
    }
  }

  /**
   * Map API suggestion detail to domain model
   */
  private mapApiSuggestionDetail(apiSuggestion: any): SuggestionDetail {
    return {
      id: apiSuggestion.id,
      title: apiSuggestion.title,
      content: apiSuggestion.content,
      summary: apiSuggestion.summary,
      category: apiSuggestion.category,
      estimatedReadTime: apiSuggestion.estimatedReadTime,
      imageUrl: apiSuggestion.imageUrl,
      isRead: apiSuggestion.isRead,
      userSuggestionId: apiSuggestion.userSuggestionId,
      rating: apiSuggestion.rating
    }
  }

  /**
   * Fallback suggestions for development/offline mode
   */
  private getFallbackSuggestions(): DailySuggestions {
    const today = new Date().toISOString().split('T')[0]
    
    return {
      date: today,
      suggestions: [
        {
          id: 'fallback-1',
          title: 'Técnica de Respiração 4-7-8',
          summary: 'Uma técnica simples e eficaz para reduzir a ansiedade e promover o relaxamento.',
          category: 'anxiety',
          estimatedReadTime: 3,
          imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
          isRead: false,
          userSuggestionId: 'user-fallback-1'
        },
        {
          id: 'fallback-2',
          title: 'Gratidão: O Poder de Reconhecer o Bom',
          summary: 'Descubra como a prática da gratidão pode transformar sua perspectiva e bem-estar.',
          category: 'mindfulness',
          estimatedReadTime: 5,
          imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7',
          isRead: false,
          userSuggestionId: 'user-fallback-2'
        },
        {
          id: 'fallback-3',
          title: 'Autocuidado sem Culpa',
          summary: 'Descubra como praticar o autocuidado de forma saudável e sem sentimentos de culpa.',
          category: 'self-care',
          estimatedReadTime: 7,
          imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
          isRead: false,
          userSuggestionId: 'user-fallback-3'
        },
        {
          id: 'fallback-4',
          title: 'Mindfulness no Cotidiano',
          summary: 'Aprenda a incorporar a atenção plena em atividades simples do dia a dia.',
          category: 'mindfulness',
          estimatedReadTime: 6,
          imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b',
          isRead: false,
          userSuggestionId: 'user-fallback-4'
        }
      ]
    }
  }
}

// Export singleton instance
export const suggestionApiService = new SuggestionApiService()
export default suggestionApiService