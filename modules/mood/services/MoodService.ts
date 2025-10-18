import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthService from '../../../services/authService';
import { logger } from '../../../utils/secureLogger';
import { PERIOD_HOURS, PERIOD_LABELS, STORAGE_KEYS } from '../constants';
import { MoodEntry, MoodLevel, MoodPeriod, MoodResponse, MoodStats } from '../types';
import { CreateMoodEntryRequest, moodApiClient } from './MoodApiClient';

/**
 * Error types for mood operations
 */
export interface MoodError {
  type: 'network' | 'validation' | 'rate_limit' | 'server' | 'storage';
  message: string;
  code?: string;
  details?: any;
}

/**
 * Mood Service - Enhanced with dedicated API client
 * Handles business logic, offline support, and caching with clean separation of concerns
 */
class MoodService {
  private readonly STORAGE_KEY = STORAGE_KEYS.MOOD_ENTRIES;
  private readonly LAST_RESPONSE_KEY = STORAGE_KEYS.LAST_RESPONSE;
  private readonly OFFLINE_QUEUE_KEY = 'mood_offline_queue';

  /**
   * Determina o período atual do dia baseado nas constantes
   */
  getCurrentPeriod(): MoodPeriod {
    const hour = new Date().getHours();
    
    // Manhã: 05:00 - 11:59
    if (hour >= PERIOD_HOURS.manha.start && hour < PERIOD_HOURS.manha.end) {
      return 'manha';
    } 
    // Tarde: 12:00 - 17:59
    else if (hour >= PERIOD_HOURS.tarde.start && hour < PERIOD_HOURS.tarde.end) {
      return 'tarde';
    } 
    // Noite: 18:00 - 23:59 E 00:00 - 04:59
    else {
      return 'noite';
    }
  }

  /**
   * Verifica se o usuário já respondeu no período atual - INTEGRAÇÃO API
   * ⚡ OTIMIZAÇÃO: Só faz request se usuário estiver autenticado
   */
  async hasAnsweredCurrentPeriod(): Promise<boolean> {
    try {
      // 🔒 Guard: Verifica autenticação ANTES de fazer request
      const isAuth = await AuthService.isAuthenticated();
      if (!isAuth) {
        console.log('[MoodService] Usuário não autenticado, assumindo não respondeu');
        return false;
      }

      const today = new Date().toISOString().split('T')[0];
      const currentPeriod = this.getCurrentPeriod();
      
      const response = await moodApiClient.validatePeriod(currentPeriod, today);
      console.log('response.data.current_period_validation', response);
      return response.success && response.data ? !response.data.can_create : false;
    } catch (error) {
      console.warn('[MoodService] Erro ao verificar período atual:', error);
      return false;
    }
  }

  /**
   * @deprecated Use hasAnsweredCurrentPeriod() instead
   * Mantido para compatibilidade
   */
  async hasAnsweredToday(): Promise<boolean> {
    return this.hasAnsweredCurrentPeriod();
  }

  /**
   * Salva a resposta de humor - INTEGRAÇÃO API REAL
   */
  async saveMoodResponse(mood: MoodLevel, additionalData?: Partial<MoodEntry>): Promise<MoodResponse> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const currentPeriod = this.getCurrentPeriod();
      
      const entryData: CreateMoodEntryRequest = {
        mood_level: mood,
        period: currentPeriod,
        date: today,
        notes: additionalData?.notes || '',
        activities: additionalData?.activities || [],
        emotions: additionalData?.emotions || []
      };

      // Tenta salvar na API primeiro
      let apiSuccess = false;
      let serverEntry: any = null;
      
      try {
        const response = await moodApiClient.createMoodEntry(entryData);
        
        if (response.success && response.data) {
          apiSuccess = true;
          serverEntry = response.data;
          logger.info('MoodService', 'Mood salvo na API com sucesso', { entryId: serverEntry.id });
        }
      } catch (apiError: any) {
        // Se é rate limit, não adiciona à fila para evitar spam
        const isRateLimit = apiError.message?.includes('Rate limit') || apiError.message?.includes('Too many requests');
        
        if (isRateLimit) {
          logger.warn('MoodService', 'Rate limit detectado - não adicionando à fila de retry', { 
            error: apiError.message 
          });
        } else {
          logger.warn('MoodService', 'Falha ao salvar na API, salvando offline', { 
            error: apiError.message,
            willRetryLater: true 
          });
          
          // Só adiciona à fila offline para retry se NÃO for rate limit
          await this.addToOfflineQueue(entryData);
        }
      }

      // Cria entrada local (sincronizada com servidor ou offline)
      const localEntry: MoodEntry = {
        id: serverEntry?.id || `${today}-${currentPeriod}-${Date.now()}`,
        mood,
        period: currentPeriod,
        date: today,
        timestamp: Date.now(),
        serverSynced: apiSuccess,
        ...additionalData
      };

      // Salva localmente (cache + offline support)
      await this.saveLocalEntry(localEntry);

      // Marca que respondeu hoje
      await AsyncStorage.setItem(this.LAST_RESPONSE_KEY, JSON.stringify({
        date: today,
        period: currentPeriod,
        timestamp: Date.now(),
        synced: apiSuccess
      }));

      return { 
        success: true, 
        message: apiSuccess ? 'Humor registrado com sucesso!' : 'Humor salvo localmente. Será sincronizado quando possível.',
        data: localEntry
      };
    } catch (error) {
      logger.error('MoodService', 'Erro ao salvar humor', error instanceof Error ? error : new Error(String(error)));
      return { 
        success: false, 
        message: 'Erro ao registrar humor. Tente novamente.' 
      };
    }
  }

  /**
   * Salva entrada localmente
   */
  private async saveLocalEntry(entry: MoodEntry): Promise<void> {
    const entries = await this.getMoodEntries();
    const updatedEntries = entries.filter(e => e.id !== entry.id);
    updatedEntries.push(entry);
    await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedEntries));
  }

  /**
   * Adiciona à fila offline para sincronização posterior
   */
  private async addToOfflineQueue(entryData: any): Promise<void> {
    try {
      const queue = await this.getOfflineQueue();
      queue.push({
        ...entryData,
        timestamp: Date.now(),
        retryCount: 0
      });
      await AsyncStorage.setItem(this.OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      logger.error('MoodService', 'Erro ao adicionar à fila offline', error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Recupera fila offline
   */
  private async getOfflineQueue(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(this.OFFLINE_QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      logger.error('MoodService', 'Erro ao recuperar fila offline', error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  /**
   * Tenta sincronizar entradas offline com a API
   */
  async syncOfflineEntries(): Promise<{ success: number; failed: number }> {
    const queue = await this.getOfflineQueue();
    let success = 0;
    let failed = 0;
    const remainingQueue: any[] = [];

    for (const entry of queue) {
      try {
        const response = await moodApiClient.createMoodEntry(entry);
        if (response.success) {
          success++;
          logger.info('MoodService', 'Entrada offline sincronizada', { timestamp: entry.timestamp });
        } else {
          throw new Error('API response not successful');
        }
      } catch (error) {
        failed++;
        entry.retryCount = (entry.retryCount || 0) + 1;
        
        // Manter na fila se menos de 3 tentativas
        if (entry.retryCount < 3) {
          remainingQueue.push(entry);
        } else {
          logger.warn('MoodService', 'Entrada offline descartada após 3 tentativas', { timestamp: entry.timestamp });
        }
      }
    }

    // Atualiza fila com entradas que ainda precisam ser sincronizadas
    await AsyncStorage.setItem(this.OFFLINE_QUEUE_KEY, JSON.stringify(remainingQueue));
    
    if (success > 0) {
      logger.info('MoodService', 'Sincronização offline concluída', { success, failed });
    }

    return { success, failed };
  }

  /**
   * Recupera todas as entradas de humor - INTEGRAÇÃO API
   */
  async getMoodEntries(): Promise<MoodEntry[]> {
    try {
      // Tenta buscar da API primeiro
      try {
        const response = await moodApiClient.getMoodEntries();
        if (response.success && response.data?.entries) {
          const serverEntries = response.data.entries.map((entry: any) => ({
            id: entry.id,
            mood: entry.mood_level,
            period: entry.period,
            date: entry.date,
            timestamp: new Date(entry.created_at).getTime(),
            notes: entry.notes,
            activities: entry.activities || [],
            emotions: entry.emotions || [],
            serverSynced: true
          }));
          
          // Atualiza cache local
          await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(serverEntries));
          return serverEntries;
        }
      } catch (apiError) {
        logger.debug('MoodService', 'API fetch failed, using local cache', apiError);
      }
      
      // Fallback para dados locais
      const data = await AsyncStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      logger.error('MoodService', 'Erro ao recuperar entradas de humor', error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  /**
   * Recupera entradas de humor por data
   */
  async getMoodEntriesForDate(date: string): Promise<MoodEntry[]> {
    const entries = await this.getMoodEntries();
    return entries.filter(entry => entry.date === date);
  }

  /**
   * Recupera entradas de humor por período
   */
  async getMoodEntriesForPeriod(period: MoodPeriod, days: number = 7): Promise<MoodEntry[]> {
    const entries = await this.getMoodEntries();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return entries.filter(entry => 
      entry.period === period && new Date(entry.date) >= cutoffDate
    );
  }

  /**
   * Recupera estatísticas de humor - INTEGRAÇÃO API
   */
  async getMoodStats(days: number = 7): Promise<MoodStats> {
    try {
      // Tenta buscar estatísticas da API primeiro
      try {
        const response = await moodApiClient.getMoodStats(days);
        if (response.success && response.data) {
          const serverStats = response.data;
          
          // Converte formato do servidor para formato local
          const distribution: Record<MoodLevel, number> = {
            'excelente': serverStats.mood_counts?.excelente || 0,
            'bem': serverStats.mood_counts?.bem || 0,
            'neutro': serverStats.mood_counts?.neutro || 0,
            'mal': serverStats.mood_counts?.mal || 0,
            'pessimo': serverStats.mood_counts?.pessimo || 0
          };

          return {
            averageMood: serverStats.average_mood || 0,
            totalEntries: serverStats.total_entries || 0,
            moodDistribution: distribution,
            streak: await this.calculateMoodStreak(), // Calcula localmente por enquanto
            lastEntry: undefined // TODO: implementar no backend
          };
        }
      } catch (apiError) {
        logger.debug('MoodService', 'API stats failed, calculating locally', apiError);
      }
      
      // Fallback para cálculo local
      return this.calculateLocalStats(days);
    } catch (error) {
      logger.error('MoodService', 'Erro ao recuperar estatísticas', error instanceof Error ? error : new Error(String(error)));
      return this.calculateLocalStats(days);
    }
  }

  /**
   * Calcula estatísticas localmente (fallback)
   */
  private async calculateLocalStats(days: number): Promise<MoodStats> {
    const entries = await this.getMoodEntries();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentEntries = entries.filter(entry => 
      new Date(entry.date) >= cutoffDate
    );

    const moodValues: Record<MoodLevel, number> = {
      'excelente': 5,
      'bem': 4,
      'neutro': 3,
      'mal': 2,
      'pessimo': 1
    };

    const distribution: Record<MoodLevel, number> = {
      'excelente': 0,
      'bem': 0,
      'neutro': 0,
      'mal': 0,
      'pessimo': 0
    };

    let totalValue = 0;
    recentEntries.forEach(entry => {
      distribution[entry.mood]++;
      totalValue += moodValues[entry.mood];
    });

    // Calcula streak (dias consecutivos com respostas)
    const streak = await this.calculateMoodStreak();

    // Última entrada
    const lastEntry = entries.length > 0 
      ? entries.sort((a, b) => b.timestamp - a.timestamp)[0] 
      : undefined;

    return {
      averageMood: recentEntries.length > 0 ? totalValue / recentEntries.length : 0,
      totalEntries: recentEntries.length,
      moodDistribution: distribution,
      streak,
      lastEntry
    };
  }

  /**
   * Calcula streak de dias consecutivos com registros
   */
  private async calculateMoodStreak(): Promise<number> {
    const entries = await this.getMoodEntries();
    if (entries.length === 0) return 0;

    const sortedEntries = entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const today = new Date().toISOString().split('T')[0];
    
    let streak = 0;
    let currentDate = new Date(today);
    
    for (const entry of sortedEntries) {
      const entryDate = entry.date;
      const currentDateStr = currentDate.toISOString().split('T')[0];
      
      if (entryDate === currentDateStr) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  }

  /**
   * Obtém o rótulo do período em português
   */
  getPeriodLabel(period: MoodPeriod): string {
    return PERIOD_LABELS[period];
  }

  /**
   * Obtém dados de tendência de humor - INTEGRAÇÃO API
   */
  async getMoodTrend(days: number = 30): Promise<{ date: string; mood: number }[]> {
    try {
      // Tenta buscar tendências da API primeiro
      try {
        const response = await moodApiClient.getMoodTrend(days);
        if (response.success && response.data) {
          return response.data.map((item: any) => ({
            date: item.date,
            mood: item.mood
          }));
        }
      } catch (apiError) {
        logger.debug('MoodService', 'API trend failed, calculating locally', apiError);
      }
      
      // Fallback para cálculo local
      return this.calculateLocalTrend(days);
    } catch (error) {
      logger.error('MoodService', 'Erro ao obter tendência', error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  /**
   * Calcula tendência localmente (fallback)
   */
  private async calculateLocalTrend(days: number): Promise<{ date: string; mood: number }[]> {
    const entries = await this.getMoodEntries();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const moodValues: Record<MoodLevel, number> = {
      'excelente': 5,
      'bem': 4,
      'neutro': 3,
      'mal': 2,
      'pessimo': 1
    };

    const recentEntries = entries.filter(entry => 
      new Date(entry.date) >= cutoffDate
    );

    // Agrupa por data e calcula média
    const dailyMoods: Record<string, number[]> = {};
    
    recentEntries.forEach(entry => {
      if (!dailyMoods[entry.date]) {
        dailyMoods[entry.date] = [];
      }
      dailyMoods[entry.date].push(moodValues[entry.mood]);
    });

    return Object.entries(dailyMoods).map(([date, moods]) => ({
      date,
      mood: moods.reduce((sum, mood) => sum + mood, 0) / moods.length
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  /**
   * Força a exibição do selector (para testes)
   */
  async resetTodayResponse(): Promise<void> {
    await AsyncStorage.removeItem(this.LAST_RESPONSE_KEY);
  }

  /**
   * Limpa todos os dados de humor (cuidado!)
   */
  async clearAllData(): Promise<void> {
    await AsyncStorage.multiRemove([this.STORAGE_KEY, this.LAST_RESPONSE_KEY, this.OFFLINE_QUEUE_KEY]);
  }

  // ============ NOVOS MÉTODOS ANALYTICS ============

  /**
   * Obtém sequência de humor positivo
   */
  async getPositiveMoodStreak(): Promise<any> {
    try {
      const response = await moodApiClient.getPositiveMoodStreak();
      if (response.success) {
        return response.data;
      }
      throw new Error('API response not successful');
    } catch (error) {
      logger.warn('MoodService', 'Falha ao obter streak positivo da API, calculando localmente', error);
      
      // Fallback local
      const entries = await this.getMoodEntries();
      const positiveEntries = entries.filter(entry => 
        entry.mood === 'bem' || entry.mood === 'excelente'
      );
      
      // Cálculo simples local
      let currentStreak = 0;
      let longestStreak = 0;
      // ... implementar lógica local se necessário
      
      return {
        currentStreak,
        longestStreak,
        isActive: false
      };
    }
  }

  /**
   * Obtém padrões por período do dia
   */
  async getPeriodPatterns(days: number = 30): Promise<any> {
    try {
      const response = await moodApiClient.getPeriodPatterns(days);
      if (response.success) {
        return response.data;
      }
      throw new Error('API response not successful');
    } catch (error) {
      logger.warn('MoodService', 'Falha ao obter padrões de período da API', error);
      return {
        bestPeriod: 'manha',
        worstPeriod: 'noite',
        periodAverages: { manha: 0, tarde: 0, noite: 0 },
        consistency: 0
      };
    }
  }

  /**
   * Obtém tendências semanais
   */
  async getWeeklyTrends(weeks: number = 8): Promise<any> {
    try {
      const response = await moodApiClient.getWeeklyTrends(weeks);
      if (response.success) {
        return response.data;
      }
      throw new Error('API response not successful');
    } catch (error) {
      logger.warn('MoodService', 'Falha ao obter tendências semanais da API', error);
      return {
        weeklyAverages: [],
        trendDirection: 'stable',
        volatility: 0
      };
    }
  }

  /**
   * Obtém insights personalizados
   */
  async getPersonalizedInsights(): Promise<any> {
    try {
      const response = await moodApiClient.getInsights();
      if (response.success) {
        return response.data;
      }
      throw new Error('API response not successful');
    } catch (error) {
      logger.warn('MoodService', 'Falha ao obter insights da API', error);
      return [];
    }
  }

  /**
   * Obtém dashboard completo de analytics
   */
  async getAnalyticsDashboard(days: number = 30, weeks: number = 8): Promise<any> {
    try {
      const response = await moodApiClient.getAnalyticsDashboard(days, weeks);
      if (response.success) {
        return response.data;
      }
      throw new Error('API response not successful');
    } catch (error) {
      logger.warn('MoodService', 'Falha ao obter dashboard da API, retornando dados básicos', error);
      
      // Fallback com dados básicos
      return {
        positiveStreak: await this.getPositiveMoodStreak(),
        periodPatterns: await this.getPeriodPatterns(days),
        weeklyTrends: await this.getWeeklyTrends(weeks),
        insights: [],
        correlations: []
      };
    }
  }

  /**
   * Inicializa sincronização automática
   * Deve ser chamado no início da aplicação
   */
  async initializeAutoSync(): Promise<void> {
    // Tenta sincronizar entradas offline
    const result = await this.syncOfflineEntries();
    
    if (result.success > 0) {
      logger.info('MoodService', `Sincronizadas ${result.success} entradas offline`);
    }
    
    if (result.failed > 0) {
      logger.warn('MoodService', `Falha ao sincronizar ${result.failed} entradas`);
    }
  }

  /**
   * Obtém status de sincronização
   */
  async getSyncStatus(): Promise<{ offlineCount: number; pendingSync: boolean }> {
    const queue = await this.getOfflineQueue();
    return {
      offlineCount: queue.length,
      pendingSync: queue.length > 0
    };
  }
}

export const moodService = new MoodService();
export default moodService;
