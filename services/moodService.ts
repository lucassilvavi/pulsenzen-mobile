import AsyncStorage from '@react-native-async-storage/async-storage';

export type MoodLevel = 'excelente' | 'bem' | 'neutro' | 'mal' | 'pessimo';
export type MoodPeriod = 'manha' | 'tarde' | 'noite';

export interface MoodEntry {
  id: string;
  mood: MoodLevel;
  period: MoodPeriod;
  date: string; // YYYY-MM-DD format
  timestamp: number;
}

export interface MoodResponse {
  success: boolean;
  message?: string;
}

class MoodService {
  private readonly STORAGE_KEY = '@mood_entries';
  private readonly LAST_RESPONSE_KEY = '@last_mood_response';

  /**
   * Determina o período atual do dia
   */
  getCurrentPeriod(): MoodPeriod {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      return 'manha';
    } else if (hour >= 12 && hour < 18) {
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
      console.error('Erro ao verificar resposta do dia:', error);
      return false;
    }
  }

  /**
   * Salva a resposta de humor
   */
  async saveMoodResponse(mood: MoodLevel): Promise<MoodResponse> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const currentPeriod = this.getCurrentPeriod();
      
      const entry: MoodEntry = {
        id: `${today}-${currentPeriod}`,
        mood,
        period: currentPeriod,
        date: today,
        timestamp: Date.now(),
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

      return { success: true, message: 'Humor registrado com sucesso!' };
    } catch (error) {
      console.error('Erro ao salvar humor:', error);
      return { success: false, message: 'Erro ao registrar humor. Tente novamente.' };
    }
  }

  /**
   * Simula requisição para o backend
   */
  private async simulateBackendRequest(entry: MoodEntry): Promise<void> {
    // Simula delay de rede
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simula chance de erro (5%)
    if (Math.random() < 0.05) {
      throw new Error('Erro de conexão com o servidor');
    }
    
    console.log('Mood enviado para o backend:', entry);
  }

  /**
   * Recupera todas as entradas de humor
   */
  async getMoodEntries(): Promise<MoodEntry[]> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao recuperar entradas de humor:', error);
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
   * Recupera estatísticas de humor
   */
  async getMoodStats(days: number = 7): Promise<{
    averageMood: number;
    totalEntries: number;
    moodDistribution: Record<MoodLevel, number>;
  }> {
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

    return {
      averageMood: recentEntries.length > 0 ? totalValue / recentEntries.length : 0,
      totalEntries: recentEntries.length,
      moodDistribution: distribution
    };
  }

  /**
   * Obtém o rótulo do período em português
   */
  getPeriodLabel(period: MoodPeriod): string {
    const labels = {
      'manha': 'manhã',
      'tarde': 'tarde',
      'noite': 'noite'
    };
    return labels[period];
  }

  /**
   * Força a exibição do selector (para testes)
   */
  async resetTodayResponse(): Promise<void> {
    await AsyncStorage.removeItem(this.LAST_RESPONSE_KEY);
  }
}

export const moodService = new MoodService();
export default moodService;
