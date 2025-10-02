/**
 * Suggestion Types
 * Types and interfaces for suggestion system
 */

export type SuggestionCategory = 'mindfulness' | 'anxiety' | 'depression' | 'self-care' | 'productivity' | 'relationships'
export type SuggestionType = 'reading' | 'exercise' | 'meditation' | 'reflection'

export interface Suggestion {
  id: string
  title: string
  summary: string
  category: SuggestionCategory
  estimatedReadTime: number
  imageUrl: string | null
  isRead: boolean
  userSuggestionId: string
}

export interface SuggestionDetail extends Suggestion {
  content: string
  rating?: number
}

export interface DailySuggestions {
  suggestions: Suggestion[]
  date: string
}

export interface SuggestionStats {
  totalAssigned: number
  totalRead: number
  averageRating: number
  readingStreak: number
  favoriteCategory: SuggestionCategory | null
}

// API Response types
export interface ApiSuggestion {
  id: string
  title: string
  summary: string
  category: SuggestionCategory
  estimatedReadTime: number
  imageUrl: string | null
  isRead: boolean
  userSuggestionId: string
}

export interface ApiSuggestionDetail extends ApiSuggestion {
  content: string
  rating?: number
}

export interface ApiDailySuggestionsResponse {
  success: boolean
  data?: {
    suggestions: ApiSuggestion[]
    date: string
  }
  message?: string
}

export interface ApiSuggestionDetailResponse {
  success: boolean
  data?: ApiSuggestionDetail
  message?: string
}

export interface ApiSuggestionStatsResponse {
  success: boolean
  data?: {
    totalAssigned: number
    totalRead: number
    averageRating: number
    readingStreak: number
    favoriteCategory: SuggestionCategory | null
  }
  message?: string
}

export interface ApiMarkAsReadResponse {
  success: boolean
  message?: string
}

export interface ApiRateSuggestionResponse {
  success: boolean
  message?: string
}

// Category metadata for UI
export interface SuggestionCategoryMeta {
  label: string
  icon: string
  color: string
  description: string
}

export const SUGGESTION_CATEGORIES: Record<SuggestionCategory, SuggestionCategoryMeta> = {
  mindfulness: {
    label: 'Mindfulness',
    icon: '🧘',
    color: '#6B73FF',
    description: 'Práticas de atenção plena e presença'
  },
  anxiety: {
    label: 'Ansiedade',
    icon: '😌',
    color: '#FF6B6B',
    description: 'Técnicas para lidar com ansiedade'
  },
  depression: {
    label: 'Depressão',
    icon: '🌈',
    color: '#4ECDC4',
    description: 'Estratégias para melhorar o humor'
  },
  'self-care': {
    label: 'Autocuidado',
    icon: '💆',
    color: '#FFB347',
    description: 'Práticas de cuidado pessoal'
  },
  productivity: {
    label: 'Produtividade',
    icon: '✨',
    color: '#95A5A6',
    description: 'Dicas para ser mais produtivo'
  },
  relationships: {
    label: 'Relacionamentos',
    icon: '💝',
    color: '#E74C3C',
    description: 'Melhorando conexões pessoais'
  }
}

export const SUGGESTION_TYPES: Record<SuggestionType, { label: string; icon: string }> = {
  reading: {
    label: 'Leitura',
    icon: '📖'
  },
  exercise: {
    label: 'Exercício',
    icon: '🏃'
  },
  meditation: {
    label: 'Meditação',
    icon: '🧘'
  },
  reflection: {
    label: 'Reflexão',
    icon: '💭'
  }
}