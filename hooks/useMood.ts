import moodService, { MoodEntry, MoodLevel, MoodPeriod } from '@/services/moodService';
import { useCallback, useEffect, useState } from 'react';

interface UseMoodResult {
  // Estado
  currentPeriod: MoodPeriod;
  hasAnsweredToday: boolean;
  isLoading: boolean;
  
  // Ações
  submitMood: (mood: MoodLevel) => Promise<{ success: boolean; message?: string }>;
  refreshStatus: () => Promise<void>;
  
  // Dados
  todayEntries: MoodEntry[];
  recentStats: {
    averageMood: number;
    totalEntries: number;
    moodDistribution: Record<MoodLevel, number>;
  } | null;
}

export function useMood(): UseMoodResult {
  const [currentPeriod, setCurrentPeriod] = useState<MoodPeriod>('manha');
  const [hasAnsweredToday, setHasAnsweredToday] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [todayEntries, setTodayEntries] = useState<MoodEntry[]>([]);
  const [recentStats, setRecentStats] = useState<UseMoodResult['recentStats']>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Carrega dados em paralelo
      const [hasAnswered, entries, stats] = await Promise.all([
        moodService.hasAnsweredToday(),
        moodService.getMoodEntriesForDate(new Date().toISOString().split('T')[0]),
        moodService.getMoodStats(7)
      ]);

      setCurrentPeriod(moodService.getCurrentPeriod());
      setHasAnsweredToday(hasAnswered);
      setTodayEntries(entries);
      setRecentStats(stats);
    } catch (error) {
      console.error('Erro ao carregar dados de humor:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const submitMood = useCallback(async (mood: MoodLevel) => {
    try {
      const response = await moodService.saveMoodResponse(mood);
      
      if (response.success) {
        // Atualiza o status local
        setHasAnsweredToday(true);
        
        // Recarrega os dados
        await loadData();
      }
      
      return response;
    } catch (error) {
      console.error('Erro ao enviar humor:', error);
      return { success: false, message: 'Erro inesperado' };
    }
  }, [loadData]);

  const refreshStatus = useCallback(async () => {
    await loadData();
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Atualiza o período a cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      const newPeriod = moodService.getCurrentPeriod();
      if (newPeriod !== currentPeriod) {
        setCurrentPeriod(newPeriod);
        // Recheck if answered today for new period
        loadData();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [currentPeriod, loadData]);

  return {
    currentPeriod,
    hasAnsweredToday,
    isLoading,
    submitMood,
    refreshStatus,
    todayEntries,
    recentStats,
  };
}

export default useMood;
