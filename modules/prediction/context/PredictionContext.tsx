import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
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
    console.log('[PredictionContext] 🚀 Gerando predição...');
    setState(s => ({ ...s, loading: true }));
    await new Promise(r => setTimeout(r, 400));
    
    try {
      // 🔒 Guard: Verifica autenticação ANTES de fazer request
      const isAuth = await AuthService.isAuthenticated();
      if (!isAuth) {
        console.log('[PredictionContext] ⚠️ Usuário não autenticado, aguardando login');
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

      console.log('[PredictionContext] 📡 Fazendo fetch com dataSource...');
      const result = await dataSource.fetchLatest();
      console.log('[PredictionContext] ✅ Resultado recebido:', result);
      
      // Verificar se é dados insuficientes
      if ('type' in result && result.type === 'insufficient_data') {
        console.log('[PredictionContext] ⚠️ Dados insuficientes para análise');
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
      
      console.log('[PredictionContext] 🎯 Estado atualizado com predição');
    } catch (error) {
      console.error('[PredictionContext] ❌ Erro ao gerar predição:', error);
    }
  }, [dataSource, toast]);

  useEffect(() => {
    console.log('[PredictionContext] 🏁 Inicializando PredictionProvider...');
    (async () => {
      try {
        // 🔒 Guard: Verifica autenticação ANTES de carregar dados
        const isAuth = await AuthService.isAuthenticated();
        if (!isAuth) {
          console.log('[PredictionContext] ⚠️ Usuário não autenticado, aguardando login para carregar predições');
          return;
        }

        // 🎯 Task 7: Só carrega cache, NÃO faz fetch automático
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          console.log('[PredictionContext] 💾 Dados em cache encontrados, carregando sem fetch automático (Task 7)');
          const persisted: PredictionState = JSON.parse(raw);
          setState({ ...persisted, onboardingSeen: (persisted as any).onboardingSeen || false });
        } else {
          console.log('[PredictionContext] 🆕 Nenhum cache encontrado, aguardando lazy loading (Task 7)');
        }
      } catch {
        console.log('[PredictionContext] ❌ Erro ao carregar cache, aguardando lazy loading (Task 7)');
      }
    })();
  }, []); // Array vazio para executar apenas uma vez

  // 🎯 Task 7: Nova função para inicialização sob demanda
  const initializeIfNeeded = useCallback(async () => {
    // Guard: Se já está inicializando, evita duplicação
    if (isInitializingRef.current) {
      console.log('[PredictionContext] 🚫 Já está inicializando, ignorando chamada duplicada (Task 7)');
      return;
    }

    // Se já tem dados válidos, não precisa fazer fetch
    if (state.current && state.lastUpdated && (Date.now() - state.lastUpdated) < TTL_MS) {
      console.log('[PredictionContext] ✅ Dados já válidos, não precisa inicializar (Task 7)');
      return;
    }

    // Se já está carregando, não duplicar
    if (state.loading) {
      console.log('[PredictionContext] ⏳ Já está carregando, aguardando... (Task 7)');
      return;
    }

    // Marca como inicializando
    isInitializingRef.current = true;
    console.log('[PredictionContext] 🚀 Inicializando sob demanda (Task 7)');
    
    try {
      // Verifica autenticação
      const isAuth = await AuthService.isAuthenticated();
      if (!isAuth) {
        console.log('[PredictionContext] ⚠️ Não autenticado para lazy loading (Task 7)');
        return;
      }

      // Verifica cache novamente (pode ter mudado)
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const persisted: PredictionState = JSON.parse(raw);
        const isFresh = persisted.lastUpdated && (Date.now() - persisted.lastUpdated) < TTL_MS;
        if (isFresh) {
          console.log('[PredictionContext] ✅ Cache ainda válido durante lazy loading (Task 7)');
          setState({ ...persisted, onboardingSeen: (persisted as any).onboardingSeen || false });
          return;
        }
      }

      // Faz fetch apenas se necessário
      console.log('[PredictionContext] 📡 Fazendo fetch durante lazy loading (Task 7)');
      await generate();
    } catch (error) {
      console.error('[PredictionContext] ❌ Erro durante lazy loading (Task 7):', error);
    } finally {
      // Sempre limpa o flag no final
      isInitializingRef.current = false;
    }
  }, [state.current, state.lastUpdated, state.loading, generate, STORAGE_KEY, TTL_MS]);

  const refresh = useCallback(async () => { if(!state.loading) await generate(); }, [state.loading, generate]);
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

  return <PredictionContext.Provider value={{ ...state, refresh, initializeIfNeeded, markInterventionCompleted, markOnboardingSeen }}>{children}</PredictionContext.Provider>;
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
