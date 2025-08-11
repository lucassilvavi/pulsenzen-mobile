import { useToast } from '@/modules/ui/toast/ToastContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { PredictionDataSource } from '../services/PredictionDataSource';
import { PredictionMockService } from '../services/PredictionMock';
import { track } from '../services/Telemetry';
import { PredictionState, PredictionSummary } from '../types';

interface PredictionContextValue extends PredictionState {
  refresh: () => Promise<void>;
  markInterventionCompleted: (id: string) => void;
  markOnboardingSeen: () => void;
}

const PredictionContext = createContext<PredictionContextValue | undefined>(undefined);

export const PredictionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PredictionState>({
    current: null,
    history: [],
    factors: [],
    interventions: [],
    loading: false,
    lastUpdated: null,
    onboardingSeen: false,
  });

  const STORAGE_KEY = 'prediction_state_v1';
  const TTL_MS = 3 * 60 * 60 * 1000; // 3h

  const toast = useToast();
  const dataSource: PredictionDataSource = PredictionMockService;
  const generate = useCallback(async () => {
    setState(s => ({ ...s, loading: true }));
    await new Promise(r => setTimeout(r, 400));
    const detail = await dataSource.fetchLatest();
    const summary: PredictionSummary = { id: detail.id, score: detail.score, level: detail.level, label: detail.label, confidence: detail.confidence, generatedAt: detail.generatedAt };
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
      } as PredictionState;
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState)).catch(()=>{});
      if (previousLevel && previousLevel !== summary.level) {
        track('prediction_risk_level_change', { from: previousLevel, to: summary.level });
        toast.show(`Nível mudou: ${previousLevel} → ${summary.level}`, { type: 'info', duration: 4000 });
      }
      return newState;
    });
  }, [dataSource, toast]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const persisted: PredictionState = JSON.parse(raw);
          const isFresh = persisted.lastUpdated && (Date.now() - persisted.lastUpdated) < TTL_MS;
          setState({ ...persisted, onboardingSeen: (persisted as any).onboardingSeen || false });
          if (!isFresh) {
            generate();
          }
        } else {
          generate();
        }
      } catch {
        generate();
      }
    })();
  }, [generate]);

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

  return <PredictionContext.Provider value={{ ...state, refresh, markInterventionCompleted, markOnboardingSeen }}>{children}</PredictionContext.Provider>;
};

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
