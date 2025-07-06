import { useEffect, useState } from 'react';
import { moodService } from '../services/MoodService';
import { MoodEntry, MoodLevel, MoodPeriod, MoodResponse, MoodStats, UseMoodReturn } from '../types';

/**
 * Hook modular para gerenciar estado e ações relacionadas ao humor
 * Centraliza toda a lógica de negócio do módulo mood
 */
export function useMood(): UseMoodReturn {
  const [currentPeriod, setCurrentPeriod] = useState<MoodPeriod>('manha');
  const [hasAnsweredToday, setHasAnsweredToday] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [todayEntries, setTodayEntries] = useState<MoodEntry[]>([]);
  const [recentStats, setRecentStats] = useState<{
    averageMood: number;
    totalEntries: number;
    moodDistribution: Record<MoodLevel, number>;
  } | null>(null);

  // Inicialização
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const period = moodService.getCurrentPeriod();
        setCurrentPeriod(period);
        
        await loadInitialData();
      } catch (err) {
        setError('Erro ao inicializar estado do humor');
        console.error('Erro na inicialização do mood:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    initialize();
  }, []);

  // Verifica mudança de período a cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      const newPeriod = moodService.getCurrentPeriod();
      if (newPeriod !== currentPeriod) {
        setCurrentPeriod(newPeriod);
        checkTodayResponse(); // Recheck porque mudou o período
      }
    }, 60000); // 1 minuto

    return () => clearInterval(interval);
  }, [currentPeriod]);

  /**
   * Carrega dados iniciais
   */
  const loadInitialData = async () => {
    // Carrega entradas de hoje
    const entries = await moodService.getMoodEntries();
    const today = new Date().toISOString().split('T')[0];
    const todaysEntries = entries.filter(entry => entry.date === today);
    setTodayEntries(todaysEntries);
    
    // Carrega estatísticas recentes
    const stats = await moodService.getMoodStats(30); // últimos 30 dias
    setRecentStats({
      averageMood: stats.averageMood,
      totalEntries: stats.totalEntries,
      moodDistribution: stats.moodDistribution
    });
    
    await checkTodayResponse();
  };

  /**
   * Inicializa o estado do mood
   */
  const initializeMoodState = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const period = moodService.getCurrentPeriod();
      setCurrentPeriod(period);
      
      await refreshStatus();
    } catch (err) {
      setError('Erro ao inicializar estado do humor');
      console.error('Erro na inicialização do mood:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Verifica se já respondeu hoje no período atual
   */
  const checkTodayResponse = async () => {
    try {
      const answered = await moodService.hasAnsweredToday();
      setHasAnsweredToday(answered);
    } catch (err) {
      console.error('Erro ao verificar resposta de hoje:', err);
      setHasAnsweredToday(false);
    }
  };

  /**
   * Submete uma resposta de humor
   */
  const submitMood = async (mood: MoodLevel, additionalData?: Partial<MoodEntry>): Promise<MoodResponse> => {
    try {
      setError(null);
      
      const response = await moodService.saveMoodResponse(mood, additionalData);
      
      if (response.success) {
        setHasAnsweredToday(true);
      } else {
        setError(response.message || 'Erro ao salvar humor');
      }
      
      return response;
    } catch (err) {
      const errorMessage = 'Erro inesperado ao salvar humor';
      setError(errorMessage);
      console.error('Erro no submitMood:', err);
      
      return {
        success: false,
        message: errorMessage
      };
    }
  };

  /**
   * Recupera entradas de humor
   */
  const getMoodEntries = async (): Promise<MoodEntry[]> => {
    try {
      setError(null);
      return await moodService.getMoodEntries();
    } catch (err) {
      setError('Erro ao recuperar entradas de humor');
      console.error('Erro no getMoodEntries:', err);
      return [];
    }
  };

  /**
   * Recupera estatísticas de humor
   */
  const getMoodStats = async (days: number = 7): Promise<MoodStats> => {
    try {
      setError(null);
      return await moodService.getMoodStats(days);
    } catch (err) {
      setError('Erro ao recuperar estatísticas de humor');
      console.error('Erro no getMoodStats:', err);
      
      // Retorna estatísticas vazias em caso de erro
      return {
        averageMood: 0,
        totalEntries: 0,
        moodDistribution: {
          'excelente': 0,
          'bem': 0,
          'neutro': 0,
          'mal': 0,
          'pessimo': 0
        },
        streak: 0
      };
    }
  };

  /**
   * Atualiza dados do dia e estatísticas
   */
  const refreshStatus = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      await loadInitialData();
    } catch (err) {
      setError('Erro ao atualizar dados');
      console.error('Erro no refreshStatus:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Reset para teste (força nova resposta)
   */
  const resetTodayResponse = async (): Promise<void> => {
    try {
      setError(null);
      await moodService.resetTodayResponse();
      setHasAnsweredToday(false);
    } catch (err) {
      setError('Erro ao resetar resposta de hoje');
      console.error('Erro no resetTodayResponse:', err);
    }
  };

  return {
    currentPeriod,
    hasAnsweredToday,
    isLoading,
    error,
    todayEntries,
    recentStats,
    submitMood,
    getMoodEntries,
    getMoodStats,
    resetTodayResponse,
    refreshStatus
  };
}

export default useMood;
