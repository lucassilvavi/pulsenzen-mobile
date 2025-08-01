/**
 * SOS API Service
 * Serviço para comunicação com a API de SOS/Emergência
 */

import { CopingStrategy, EmergencyContact, SOSSession, SOSStats } from '../types';
import { logger } from '../../../utils/secureLogger';

// TODO: Criar models quando necessário
interface ApiSOSResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

interface ApiCopingStrategy {
  id: string;
  title: string;
  description: string;
  duration: number;
  steps: string[];
  icon: string;
  category: 'breathing' | 'grounding' | 'relaxation' | 'physical';
}

interface ApiEmergencyContact {
  name: string;
  number: string;
  description: string;
  type: 'crisis' | 'medical' | 'general';
}

interface ApiSOSSession {
  id: string;
  strategy_id: string;
  start_time: string;
  end_time?: string;
  completed: boolean;
  rating?: number;
  notes?: string;
}

interface ApiSOSStats {
  total_sessions: number;
  completed_sessions: number;
  favorite_strategy?: string;
  average_rating: number;
  last_used?: string;
}

class SOSApiService {
  private baseUrl: string = 'https://api.pulsezen.com/v1/sos';
  private apiKey: string = process.env.EXPO_PUBLIC_API_KEY || '';

  private async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          ...options?.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('SOSApiService', 'SOS API Request failed', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  // Mappers para conversão API -> Domain
  private mapApiCopingStrategy(apiStrategy: ApiCopingStrategy): CopingStrategy {
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

  private mapApiEmergencyContact(apiContact: ApiEmergencyContact): EmergencyContact {
    return {
      name: apiContact.name,
      number: apiContact.number,
      description: apiContact.description,
      type: apiContact.type,
    };
  }

  private mapApiSession(apiSession: ApiSOSSession): SOSSession {
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

  private mapApiStats(apiStats: ApiSOSStats): SOSStats {
    return {
      totalSessions: apiStats.total_sessions,
      completedSessions: apiStats.completed_sessions,
      favoriteStrategy: apiStats.favorite_strategy,
      averageRating: apiStats.average_rating,
      lastUsed: apiStats.last_used ? new Date(apiStats.last_used) : undefined,
    };
  }

  // Buscar estratégias de enfrentamento
  async getCopingStrategies(): Promise<CopingStrategy[]> {
    try {
      // TODO: Quando API estiver pronta:
      // const response = await this.makeRequest<ApiSOSResponse<ApiCopingStrategy[]>>('/strategies');
      // return response.data.map(strategy => this.mapApiCopingStrategy(strategy));

      // Fallback para service mock atual
      const SOSService = (await import('./SOSService')).default;
      return await SOSService.getCopingStrategies();
    } catch (error) {
      logger.error('SOSApiService', 'Failed to fetch coping strategies', error instanceof Error ? error : new Error(String(error)));
      // Fallback para service mock
      const SOSService = (await import('./SOSService')).default;
      return await SOSService.getCopingStrategies();
    }
  }

  // Buscar estratégia específica
  async getCopingStrategy(id: string): Promise<CopingStrategy | null> {
    try {
      // TODO: Quando API estiver pronta:
      // const response = await this.makeRequest<ApiSOSResponse<ApiCopingStrategy>>(`/strategies/${id}`);
      // return this.mapApiCopingStrategy(response.data);

      // Fallback para service mock atual
      const SOSService = (await import('./SOSService')).default;
      return await SOSService.getCopingStrategy(id);
    } catch (error) {
      logger.error('SOSApiService', 'Failed to fetch coping strategy', error instanceof Error ? error : new Error(String(error)));
      const SOSService = (await import('./SOSService')).default;
      return await SOSService.getCopingStrategy(id);
    }
  }

  // Buscar contatos de emergência
  async getEmergencyContacts(): Promise<EmergencyContact[]> {
    try {
      // TODO: Quando API estiver pronta:
      // const response = await this.makeRequest<ApiSOSResponse<ApiEmergencyContact[]>>('/emergency-contacts');
      // return response.data.map(contact => this.mapApiEmergencyContact(contact));

      // Fallback para service mock atual
      const SOSService = (await import('./SOSService')).default;
      return await SOSService.getEmergencyContacts();
    } catch (error) {
      logger.error('SOSApiService', 'Failed to fetch emergency contacts', error instanceof Error ? error : new Error(String(error)));
      const SOSService = (await import('./SOSService')).default;
      return await SOSService.getEmergencyContacts();
    }
  }

  // Iniciar sessão SOS
  async startSession(strategyId: string): Promise<SOSSession> {
    try {
      // TODO: Quando API estiver pronta:
      // const body = { strategy_id: strategyId };
      // const response = await this.makeRequest<ApiSOSResponse<ApiSOSSession>>('/sessions', {
      //   method: 'POST',
      //   body: JSON.stringify(body)
      // });
      // return this.mapApiSession(response.data);

      // Fallback para service mock atual
      const SOSService = (await import('./SOSService')).default;
      return await SOSService.startSession(strategyId);
    } catch (error) {
      logger.error('SOSApiService', 'Failed to start SOS session', error instanceof Error ? error : new Error(String(error)));
      const SOSService = (await import('./SOSService')).default;
      return await SOSService.startSession(strategyId);
    }
  }

  // Completar sessão SOS
  async completeSession(sessionId: string, rating?: number, notes?: string): Promise<SOSSession> {
    try {
      // TODO: Quando API estiver pronta:
      // const body = { rating, notes };
      // const response = await this.makeRequest<ApiSOSResponse<ApiSOSSession>>(`/sessions/${sessionId}/complete`, {
      //   method: 'PUT',
      //   body: JSON.stringify(body)
      // });
      // return this.mapApiSession(response.data);

      // Fallback para service mock atual
      const SOSService = (await import('./SOSService')).default;
      return await SOSService.completeSession(sessionId, rating, notes);
    } catch (error) {
      logger.error('SOSApiService', 'Failed to complete SOS session', error instanceof Error ? error : new Error(String(error)));
      const SOSService = (await import('./SOSService')).default;
      return await SOSService.completeSession(sessionId, rating, notes);
    }
  }

  // Buscar estatísticas SOS
  async getSOSStats(): Promise<SOSStats> {
    try {
      // TODO: Quando API estiver pronta:
      // const response = await this.makeRequest<ApiSOSResponse<ApiSOSStats>>('/stats');
      // return this.mapApiStats(response.data);

      // Fallback para service mock atual
      const SOSService = (await import('./SOSService')).default;
      return await SOSService.getSOSStats();
    } catch (error) {
      logger.error('SOSApiService', 'Failed to fetch SOS stats', error instanceof Error ? error : new Error(String(error)));
      const SOSService = (await import('./SOSService')).default;
      return await SOSService.getSOSStats();
    }
  }

  // Buscar sessões do usuário
  async getSessions(): Promise<SOSSession[]> {
    try {
      // TODO: Quando API estiver pronta:
      // const response = await this.makeRequest<ApiSOSResponse<ApiSOSSession[]>>('/sessions');
      // return response.data.map(session => this.mapApiSession(session));

      // Fallback para service mock atual
      const SOSService = (await import('./SOSService')).default;
      return await SOSService.getSessions();
    } catch (error) {
      logger.error('SOSApiService', 'Failed to fetch SOS sessions', error instanceof Error ? error : new Error(String(error)));
      const SOSService = (await import('./SOSService')).default;
      return await SOSService.getSessions();
    }
  }
}

// Singleton instance
export default new SOSApiService();
