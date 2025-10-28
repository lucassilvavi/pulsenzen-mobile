import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useMemoizedContextValue } from '../../../hooks/usePerformanceOptimization';
import AuthService from '../../../services/authService';
import { useToast } from '../../ui/toast/ToastContext';
import { CrisisPredictionApiClient } from '../services/CrisisPredictionApiClient';
import { PredictionDataSource } from '../services/PredictionDataSource';
import { PredictionMockService } from '../services/PredictionMock';
import { track } from '../services/Telemetry';
import { PredictionDetail, PredictionState, PredictionSummary } from '../types';

interface PredictionContextValue extends PredictionState {
  refresh: () => Promise<void>;
  markInterventionCompleted: (id: string) => void;
  markOnboardingSeen: () => void;
  initializeIfNeeded: () => Promise<void>; // 🎯 Task 7: Nova função para lazy loading
}

const PredictionContext = createContext<PredictionContextValue | undefined>(undefined);

export const PredictionProvider: React.FC<{ children: React.ReactNode }> = memo(({ children }) => {
  const [state, setState] = useState<PredictionState>({
    current: null,
    history: [],
    factors: [],
    interventions: [],
    loading: false,
    lastUpdated: null,
    onboardingSeen: false,
    insufficientData: undefined,
  });
  const isInitializingRef = useRef(false); // 🎯 Task 7: Flag para evitar múltiplas inicializações

  const STORAGE_KEY = 'prediction_state_v2';
  const TTL_MS = 3 * 60 * 60 * 1000; // 3h

  const toast = useToast();
  
  // Use API client for testing integration (temporarily force API usage)
  const dataSource: PredictionDataSource = useMemo(() => {
    return false // Config.isDev 
      ? PredictionMockService
      : new CrisisPredictionApiClient(); // Force API client for testing
  }, []);
  const generate = useCallback(async () => {
    setState(s => ({ ...s, loading: true }));
    await new Promise(r => setTimeout(r, 400));
    
    try {
      // 🔒 Guard: Verifica autenticação ANTES de fazer request
      const isAuth = await AuthService.isAuthenticated();
      if (!isAuth) {
        setState(s => ({
          ...s,
          loading: false,
          current: null,
          factors: [],
          interventions: [],
          insufficientData: undefined,
          lastUpdated: null
        }));
        return;
      }

      const result = await dataSource.fetchLatest();
      
      // Verificar se é dados insuficientes
      if ('type' in result && result.type === 'insufficient_data') {
        setState(s => ({
          ...s,
          loading: false,
          current: null,
          factors: [],
          interventions: [],
          insufficientData: result,
          lastUpdated: Date.now()
        }));
        return;
      }
      
      // É uma predição válida
      const detail = result as PredictionDetail;
      const summary: PredictionSummary = { 
        id: detail.id, 
        score: detail.score, 
        level: detail.level, 
        label: detail.label, 
        confidence: detail.confidence, 
        generatedAt: detail.generatedAt 
      };
      setState(s => {
        const previousLevel = s.current?.level;
        const newState = {
          current: summary,
          history: [summary, ...s.history].slice(0, 20),
          factors: detail.factors,
          interventions: detail.interventions,
          loading: false,
          lastUpdated: Date.now(),
          onboardingSeen: s.onboardingSeen || false,
          insufficientData: undefined, // Limpar dados insuficientes quando há predição válida
        } as PredictionState;
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState)).catch(()=>{});
        if (previousLevel && previousLevel !== summary.level) {
          track('prediction_risk_level_change', { from: previousLevel, to: summary.level });
          toast.show(`Nível mudou: ${previousLevel} → ${summary.level}`, { type: 'info', duration: 4000 });
        }
        return newState;
      });
    } catch (error) {
      // Error handled silently
    }
  }, [dataSource, toast]);

  useEffect(() => {
    // 🔥 REMOVIDO: Não carrega mais cache no mount
    // Predições são sempre em tempo real via lazy loading no banner
  }, []); // Array vazio para executar apenas uma vez

  // 🎯 Task 7: Nova função para inicialização sob demanda
  const initializeIfNeeded = useCallback(async () => {
    // Guard: Se já está inicializando, evita duplicação
    if (isInitializingRef.current) {
      return;
    }

    // 🔥 MUDANÇA: Sempre busca dados frescos, sem verificar cache
    // Predições devem ser sempre em tempo real após login

    // Se já está carregando, não duplicar
    if (state.loading) {
      return;
    }

    // Marca como inicializando
    isInitializingRef.current = true;
    
    try {
      // Verifica autenticação
      const isAuth = await AuthService.isAuthenticated();
      if (!isAuth) {
        return;
      }

      // 🔥 Sempre faz fetch em tempo real, ignorando cache
      await generate();
    } catch (error) {
      // Error handled silently
    } finally {
      // Sempre limpa o flag no final
      isInitializingRef.current = false;
    }
  }, [state.loading, generate]);

  const refresh = useCallback(async () => { 
    if (!state.loading) {
      // 🔥 Força fetch em tempo real, ignorando cache
      await generate(); 
    }
  }, [state.loading, generate]);
  const markInterventionCompleted = useCallback((id: string) => {
    setState(s => {
      const updated = s.interventions.map(i => i.id === id ? { ...i, completed: true } : i);
      const newState = { ...s, interventions: updated };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState)).catch(()=>{});
      return newState;
    });
    track('prediction_intervention_complete', { id });
  }, []);
  const markOnboardingSeen = useCallback(() => {
    setState(s => { const newState = { ...s, onboardingSeen: true }; AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState)).catch(()=>{}); return newState; });
  }, []);

  // 🎯 Task 5: Memoizar valor do contexto para otimizar re-renders
  const contextValue = useMemoizedContextValue({ 
    ...state, 
    refresh, 
    initializeIfNeeded, 
    markInterventionCompleted, 
    markOnboardingSeen 
  });

  return <PredictionContext.Provider value={contextValue}>{children}</PredictionContext.Provider>;
});

PredictionProvider.displayName = 'PredictionProvider';

export function usePrediction() {
  const ctx = useContext(PredictionContext);
  if (!ctx) throw new Error('usePrediction must be used within PredictionProvider');
  return ctx;
}

function newStateBase(state: any) {
  return {
    current: state.current,
    history: state.history,
    factors: state.factors,
    interventions: state.interventions,
    loading: state.loading,
    lastUpdated: state.lastUpdated,
  };
}
