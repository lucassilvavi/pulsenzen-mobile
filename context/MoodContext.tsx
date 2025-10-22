import { createContext, ReactNode, useCallback, useContext, useState, useEffect } from 'react';
import { MoodApiService } from '@/services/MoodApiService';
import AuthService from '@/services/authService';
import { useAuth } from './AuthContext';

export type MoodPeriod = 'manha' | 'tarde' | 'noite';

// Mapping de MoodLevel (string) para number e vice-versa
const MOOD_LEVEL_TO_NUMBER: Record<string, number> = {
  'pessimo': 1,
  'mal': 2,
  'neutro': 3,
  'bem': 4,
  'excelente': 5,
};

const NUMBER_TO_MOOD_LEVEL: Record<number, string> = {
  1: 'pessimo',
  2: 'mal',
  3: 'neutro',
  4: 'bem',
  5: 'excelente',
};

export interface MoodStatus {
  manha: boolean;
  tarde: boolean;
  noite: boolean;
}

export interface MoodResponse {
  mood: string; // MoodLevel como string ('excelente', 'bem', etc.)
  period: MoodPeriod;
  notes?: string;
}

interface MoodContextType {
  moodStatus: MoodStatus;
  setMoodStatus: (status: MoodStatus) => void;
  shouldShowMoodForPeriod: (period: MoodPeriod) => boolean;
  getCurrentPeriod: () => MoodPeriod;
  submitMood: (mood: string | number, metadata?: any) => Promise<{ success: boolean; message?: string }>;
  isSubmitting: boolean;
  // Simplified interface for component
  currentPeriod: MoodPeriod;
  shouldShowMoodSelector: boolean;
  hasAnsweredCurrentPeriod: boolean;
  isLoading: boolean;
  loadingStates: {
    submittingMood: boolean;
    loadingMoodStatus: boolean;
  };
  errorStates: {
    submission: string | null;
    network: string | null;
    validation: string | null;
    server: string | null;
    loadMoodStatus: string | null;
  };
  syncStatus: {
    isOnline: boolean;
    hasPendingOperations: boolean;
    isSyncing: boolean;
  };
  clearErrors: () => void;
  showError: (message: string, type?: 'submission' | 'network' | 'validation' | 'server' | 'loadMoodStatus') => void;
}

const MoodContext = createContext<MoodContextType | undefined>(undefined);

interface MoodProviderProps {
  children: ReactNode;
}

export function MoodProvider({ children }: MoodProviderProps) {
  const { isAuthenticated, user } = useAuth();
  const [moodStatus, setMoodStatus] = useState<MoodStatus>({
    manha: false,
    tarde: false,
    noite: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingMoodStatus, setIsLoadingMoodStatus] = useState(true);
  const [errors, setErrors] = useState({
    submission: null as string | null,
    network: null as string | null,
    validation: null as string | null,
    server: null as string | null,
    loadMoodStatus: null as string | null,
  });

  const clearErrors = useCallback(() => {
    setErrors({
      submission: null,
      network: null,
      validation: null,
      server: null,
      loadMoodStatus: null,
    });
  }, []);

  const showError = useCallback((message: string, type: 'submission' | 'network' | 'validation' | 'server' | 'loadMoodStatus' = 'server') => {
    setErrors(prev => ({
      ...prev,
      [type]: message,
    }));
  }, []);

  // Load mood status from JWT token on mount and when user logs in
  useEffect(() => {
    const loadMoodStatus = async () => {
      try {
        setIsLoadingMoodStatus(true);
        clearErrors(); // Limpar erros anteriores
        
        // Só carregar se o usuário estiver autenticado
        if (!isAuthenticated || !user) {
          setMoodStatus({ manha: false, tarde: false, noite: false });
          return;
        }
        
        const moodData = await AuthService.getMoodStatusFromToken();
        
        if (moodData) {
          setMoodStatus(moodData);
        } else {
          // Resetar para estado inicial se não há dados
          setMoodStatus({ manha: false, tarde: false, noite: false });
        }
      } catch (error) {
        console.error('🎯 MoodContext: Erro ao carregar mood status:', error);
        showError(
          'Não foi possível carregar o status do humor. Tente fazer login novamente.',
          'loadMoodStatus'
        );
        // Resetar em caso de erro
        setMoodStatus({ manha: false, tarde: false, noite: false });
      } finally {
        setIsLoadingMoodStatus(false);
      }
    };

    loadMoodStatus();
  }, [clearErrors, showError, isAuthenticated, user]); // Recarregar quando usuário faz login

  const getCurrentPeriod = useCallback((): MoodPeriod => {
    const hour = new Date().getHours();
    
    if (hour >= 6 && hour < 12) {
      return 'manha';
    } else if (hour >= 12 && hour < 18) {
      return 'tarde';
    } else {
      return 'noite';
    }
  }, []);

  const shouldShowMoodForPeriod = useCallback((period: MoodPeriod): boolean => {
    return !moodStatus[period];
  }, [moodStatus]);

  const submitMood = useCallback(async (mood: string | number, metadata?: any): Promise<{ success: boolean; message?: string }> => {
    setIsSubmitting(true);
    clearErrors(); // Limpar erros anteriores
    
    try {
      // Converter number para string se necessário (API espera string)
      const moodLevel = typeof mood === 'number' ? NUMBER_TO_MOOD_LEVEL[mood] : mood;
      
      if (!moodLevel) {
        const errorMsg = `Mood level inválido: ${mood}`;
        showError(errorMsg, 'validation');
        throw new Error(errorMsg);
      }
      const response: MoodResponse = {
        mood: moodLevel, // Agora enviamos como string
        period: getCurrentPeriod(),
        notes: metadata?.notes,
      };
      
      const result = await MoodApiService.submitMood(response);
      
      if (result.success) {
        // Se sucesso, usar o moodStatus retornado pela API
        if (result.moodStatus) {
          setMoodStatus(result.moodStatus);
        } else {
          // Fallback: atualizar status local
          setMoodStatus(prev => ({
            ...prev,
            [response.period]: true,
          }));
        }
        
        return result;
      } else {
        const errorMsg = result.message || 'Erro ao enviar mood';
        console.error('MoodContext: Erro ao enviar mood:', errorMsg);
        
        // Se o erro indica que já foi registrado, atualizar o status local
        if (errorMsg.includes('já registrou') || errorMsg.includes('already registered')) {
          setMoodStatus(prev => ({
            ...prev,
            [response.period]: true,
          }));
          // Retornar sucesso mesmo com erro, pois o mood já está registrado
          return { 
            success: true, 
            message: 'Humor já registrado para este período'
          };
        }
        
        showError(errorMsg, 'submission');
        
        // Reset visual states on error
        return result;
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Erro inesperado. Tente novamente.';
      console.error('MoodContext: Erro inesperado ao enviar mood:', error);
      
      // Categorizar o tipo de erro
      if (error.message?.includes('Network') || error.message?.includes('network')) {
        showError('Erro de conexão. Verifique sua internet e tente novamente.', 'network');
      } else {
        showError(errorMsg, 'submission');
      }
      
      return { 
        success: false, 
        message: errorMsg 
      };
    } finally {
      setIsSubmitting(false);
    }
  }, [clearErrors, showError]);

  const currentPeriod = getCurrentPeriod();
  const shouldShowMoodSelector = shouldShowMoodForPeriod(currentPeriod);
  const hasAnsweredCurrentPeriod = !shouldShowMoodSelector;

  const value = {
    moodStatus,
    setMoodStatus,
    shouldShowMoodForPeriod,
    getCurrentPeriod,
    submitMood,
    isSubmitting,
    currentPeriod,
    shouldShowMoodSelector,
    hasAnsweredCurrentPeriod,
    isLoading: isLoadingMoodStatus,
    loadingStates: {
      submittingMood: isSubmitting,
      loadingMoodStatus: isLoadingMoodStatus,
    },
    errorStates: errors,
    syncStatus: {
      isOnline: true, // Simplificado - assumimos sempre online
      hasPendingOperations: false,
      isSyncing: false,
    },
    clearErrors,
    showError,
  };

  return (
    <MoodContext.Provider value={value}>
      {children}
    </MoodContext.Provider>
  );
}

export function useMood(): MoodContextType {
  const context = useContext(MoodContext);
  if (context === undefined) {
    throw new Error('useMood must be used within a MoodProvider');
  }
  return context;
}