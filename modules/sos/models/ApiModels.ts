/**
 * SOS Module Models
 * Modelos de dados para integração com API
 */

import { CopingStrategy, EmergencyContact, SOSSession, SOSStats } from '../types';

// API Response Models
export interface ApiSOSResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}

export interface ApiCopingStrategy {
  id: string;
  title: string;
  description: string;
  duration: number;
  steps: string[];
  icon: string;
  category: 'breathing' | 'grounding' | 'relaxation' | 'physical';
  created_at: string;
  updated_at: string;
}

export interface ApiEmergencyContact {
  id: string;
  name: string;
  number: string;
  description: string;
  type: 'crisis' | 'medical' | 'general';
  country_code?: string;
  available_hours?: string;
  created_at: string;
  updated_at: string;
}

export interface ApiSOSSession {
  id: string;
  user_id: string;
  strategy_id: string;
  start_time: string;
  end_time?: string;
  completed: boolean;
  rating?: number;
  notes?: string;
  device_info?: {
    platform: string;
    version: string;
  };
  created_at: string;
  updated_at: string;
}

export interface ApiSOSStats {
  user_id: string;
  total_sessions: number;
  completed_sessions: number;
  favorite_strategy?: string;
  average_rating: number;
  last_used?: string;
  weekly_usage: number;
  monthly_usage: number;
  streak_days: number;
  improvement_score: number;
  created_at: string;
  updated_at: string;
}

// Request Models
export interface CreateSOSSessionRequest {
  strategy_id: string;
  device_info?: {
    platform: string;
    version: string;
  };
}

export interface CompleteSOSSessionRequest {
  rating?: number;
  notes?: string;
  actual_duration?: number;
}

export interface SOSSessionsQuery {
  page?: number;
  limit?: number;
  strategy_id?: string;
  completed?: boolean;
  date_from?: string;
  date_to?: string;
  sort_by?: 'created_at' | 'start_time' | 'rating';
  order?: 'asc' | 'desc';
}

// Model Mappers
export class SOSModelMapper {
  static apiCopingStrategyToCopingStrategy(apiStrategy: ApiCopingStrategy): CopingStrategy {
    return {
      id: apiStrategy.id,
      title: apiStrategy.title,
      description: apiStrategy.description,
      duration: apiStrategy.duration,
      steps: apiStrategy.steps,
      icon: apiStrategy.icon,
      category: apiStrategy.category,
    };
  }

  static apiEmergencyContactToEmergencyContact(apiContact: ApiEmergencyContact): EmergencyContact {
    return {
      name: apiContact.name,
      number: apiContact.number,
      description: apiContact.description,
      type: apiContact.type,
    };
  }

  static apiSessionToSOSSession(apiSession: ApiSOSSession): SOSSession {
    return {
      id: apiSession.id,
      strategyId: apiSession.strategy_id,
      startTime: new Date(apiSession.start_time),
      endTime: apiSession.end_time ? new Date(apiSession.end_time) : undefined,
      completed: apiSession.completed,
      rating: apiSession.rating,
      notes: apiSession.notes,
    };
  }

  static apiStatsToSOSStats(apiStats: ApiSOSStats): SOSStats {
    return {
      totalSessions: apiStats.total_sessions,
      completedSessions: apiStats.completed_sessions,
      favoriteStrategy: apiStats.favorite_strategy,
      averageRating: apiStats.average_rating,
      lastUsed: apiStats.last_used ? new Date(apiStats.last_used) : undefined,
    };
  }

  static sosSessionToCreateRequest(strategyId: string): CreateSOSSessionRequest {
    return {
      strategy_id: strategyId,
      device_info: {
        platform: 'mobile',
        version: '1.0.0',
      },
    };
  }

  static completeSessionToRequest(rating?: number, notes?: string): CompleteSOSSessionRequest {
    return {
      rating,
      notes,
    };
  }
}

// Validation Models
export interface SOSValidationRules {
  strategy: {
    id: { required: true; minLength: 1 };
    title: { required: true; minLength: 3; maxLength: 100 };
    description: { required: true; minLength: 10; maxLength: 500 };
    duration: { required: true; min: 1; max: 60 };
    steps: { required: true; minItems: 1; maxItems: 10 };
  };
  session: {
    rating: { min: 1; max: 5 };
    notes: { maxLength: 1000 };
  };
}

export class SOSValidator {
  static validateStrategy(strategy: Partial<CopingStrategy>): string[] {
    const errors: string[] = [];

    if (!strategy.id || strategy.id.length < 1) {
      errors.push('ID da estratégia é obrigatório');
    }

    if (!strategy.title || strategy.title.length < 3) {
      errors.push('Título deve ter pelo menos 3 caracteres');
    }

    if (!strategy.description || strategy.description.length < 10) {
      errors.push('Descrição deve ter pelo menos 10 caracteres');
    }

    if (!strategy.duration || strategy.duration < 1 || strategy.duration > 60) {
      errors.push('Duração deve ser entre 1 e 60 minutos');
    }

    if (!strategy.steps || strategy.steps.length < 1) {
      errors.push('Pelo menos um passo é obrigatório');
    }

    return errors;
  }

  static validateSessionRating(rating?: number): string[] {
    const errors: string[] = [];

    if (rating !== undefined && (rating < 1 || rating > 5)) {
      errors.push('Avaliação deve ser entre 1 e 5');
    }

    return errors;
  }

  static validateSessionNotes(notes?: string): string[] {
    const errors: string[] = [];

    if (notes && notes.length > 1000) {
      errors.push('Notas não podem exceder 1000 caracteres');
    }

    return errors;
  }
}

// Error Models
export interface SOSError {
  code: string;
  message: string;
  details?: any;
}

export class SOSErrorHandler {
  static handleApiError(error: any): SOSError {
    if (error.response) {
      return {
        code: `API_${error.response.status}`,
        message: error.response.data?.message || 'Erro na API',
        details: error.response.data,
      };
    }

    if (error.request) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Erro de conexão. Verifique sua internet.',
        details: error.request,
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'Erro desconhecido',
      details: error,
    };
  }

  static isRetryableError(error: SOSError): boolean {
    return ['NETWORK_ERROR', 'API_500', 'API_502', 'API_503', 'API_504'].includes(error.code);
  }
}
