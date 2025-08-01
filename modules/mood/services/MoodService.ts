import AsyncStorage from '@react-native-async-storage/async-storage';
import { PERIOD_HOURS, PERIOD_LABELS, STORAGE_KEYS } from '../constants';
import { MoodEntry, MoodLevel, MoodPeriod, MoodResponse, MoodStats } from '../types';
import { logger } from '../../../utils/secureLogger';

/**
 * Mood Service - Modular implementation
 * Handles all mood-related business logic and data persistence
 */
class MoodService {
  private readonly STORAGE_KEY = STORAGE_KEYS.MOOD_ENTRIES;
  private readonly LAST_RESPONSE_KEY = STORAGE_KEYS.LAST_RESPONSE;

  /**
   * Determina o período atual do dia baseado nas constantes
   */
  getCurrentPeriod(): MoodPeriod {
    const hour = new Date().getHours();
    
    if (hour >= PERIOD_HOURS.manha.start && hour < PERIOD_HOURS.manha.end) {
      return 'manha';
    } else if (hour >= PERIOD_HOURS.tarde.start && hour < PERIOD_HOURS.tarde.end) {
      return 'tarde';
    } else {
      return 'noite';
    }
  }

  /**
   * Verifica se o usuário já respondeu no período atual
   */
  async hasAnsweredToday(): Promise<boolean> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const currentPeriod = this.getCurrentPeriod();
      
      const entries = await this.getMoodEntries();
      
      return entries.some(entry => 
        entry.date === today && entry.period === currentPeriod
      );
    } catch (error) {
      logger.error('MoodService', 'Erro ao verificar resposta do dia', error instanceof Error ? error : new Error(String(error)));
      return false;
    }
  }

  /**
   * Salva a resposta de humor
   */
  async saveMoodResponse(mood: MoodLevel, additionalData?: Partial<MoodEntry>): Promise<MoodResponse> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const currentPeriod = this.getCurrentPeriod();
      
      const entry: MoodEntry = {
        id: `${today}-${currentPeriod}`,
        mood,
        period: currentPeriod,
        date: today,
        timestamp: Date.now(),
        ...additionalData
      };

      // Simula requisição para o backend
      await this.simulateBackendRequest(entry);

      // Salva localmente
      const entries = await this.getMoodEntries();
      const updatedEntries = entries.filter(e => e.id !== entry.id);
      updatedEntries.push(entry);

      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedEntries));

      // Marca que respondeu hoje
      await AsyncStorage.setItem(this.LAST_RESPONSE_KEY, JSON.stringify({
        date: today,
        period: currentPeriod,
        timestamp: Date.now()
      }));

      return { 
        success: true, 
        message: 'Humor registrado com sucesso!',
        data: entry
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
   * Simula requisição para o backend
   */
  private async simulateBackendRequest(entry: MoodEntry): Promise<void> {
    // Simula delay de rede
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500));
    
    // Simula chance de erro (2%)
    if (Math.random() < 0.02) {
      throw new Error('Erro de conexão com o servidor');
    }
    
    logger.debug('MoodService', 'Mood enviado para o backend', { entryId: entry.id, timestamp: entry.timestamp });
  }

  /**
   * Recupera todas as entradas de humor
   */
  async getMoodEntries(): Promise<MoodEntry[]> {
    try {
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
   * Recupera estatísticas de humor
   */
  async getMoodStats(days: number = 7): Promise<MoodStats> {
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
    const streak = this.calculateMoodStreak(entries);

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
  private calculateMoodStreak(entries: MoodEntry[]): number {
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
   * Obtém dados de tendência de humor
   */
  async getMoodTrend(days: number = 30): Promise<{ date: string; mood: number }[]> {
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
    await AsyncStorage.multiRemove([this.STORAGE_KEY, this.LAST_RESPONSE_KEY]);
  }
}

export const moodService = new MoodService();
export default moodService;
