import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PredictionProvider, usePrediction } from '@/modules/prediction/context/PredictionContext';
import { ToastProvider } from '@/modules/ui/toast/ToastContext';

// Mock data source to control fetch counts
jest.mock('@/modules/prediction/services/PredictionMock', () => {
  const detail = {
    id: 'fixed-id', score: 0.5, level: 'medium', label: 'Atenção leve', confidence: 0.8, generatedAt: 1700000000000,
    factors: [], interventions: []
  };
  return {
    PredictionMockService: {
      fetchLatest: jest.fn().mockResolvedValue(detail),
      generateMockPrediction: () => detail,
    },
  };
});

const TestConsumer = () => {
  const { current, loading } = usePrediction();
  return <>{loading ? 'loading' : (current ? current.id : 'empty')}</>;
};

describe('PredictionProvider TTL behavior', () => {
  const OLD = Date.now() - 4 * 60 * 60 * 1000; // 4h ago (older than 3h TTL)
  const FRESH = Date.now() - 60 * 1000; // 1 min ago
  const basePersisted = (lastUpdated: number) => JSON.stringify({
    current: { id:'persisted', score:0.3, level:'low', label:'Equilibrado', confidence:0.7, generatedAt: lastUpdated },
    history: [], factors: [], interventions: [], loading:false, lastUpdated, onboardingSeen:false,
  });

  beforeEach(() => {
    jest.useFakeTimers();
    (AsyncStorage.getItem as jest.Mock).mockReset();
    (AsyncStorage.setItem as jest.Mock).mockReset();
  });
  afterEach(() => { jest.useRealTimers(); });

  it('triggers fetch when persisted state is stale (older than TTL)', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(basePersisted(OLD));
    const { PredictionMockService } = require('@/modules/prediction/services/PredictionMock');
    const fetchMock = PredictionMockService.fetchLatest as jest.Mock;
  const { getByText } = render(<ToastProvider><PredictionProvider><TestConsumer /></PredictionProvider></ToastProvider>);
  await waitFor(() => getByText('loading'));
    // Fast-forward initial 400ms delay
    jest.advanceTimersByTime(450);
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
  });

  it('does NOT trigger fetch when persisted state still fresh', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(basePersisted(FRESH));
    const { PredictionMockService } = require('@/modules/prediction/services/PredictionMock');
    const fetchMock = PredictionMockService.fetchLatest as jest.Mock;
  render(<ToastProvider><PredictionProvider><TestConsumer /></PredictionProvider></ToastProvider>);
    // Allow microtasks
    await Promise.resolve();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
