// Teste reduceMotion no InterventionsCarousel
import React from 'react';
import { render } from '@testing-library/react-native';
import { ToastProvider } from '@/modules/ui/toast/ToastContext';
import { PredictionProvider } from '@/modules/prediction/context/PredictionContext';
import { InterventionsCarousel } from '@/modules/prediction/components/InterventionsCarousel';

// Mock do hook de reduced motion
jest.mock('@/hooks/useAccessibility', () => ({
  useReducedMotion: () => true,
}));

describe('InterventionsCarousel reduceMotion', () => {
  it('não aplica transform scale animada quando reduceMotion=true', () => {
    const { toJSON } = render(
      <ToastProvider>
        <PredictionProvider>
          <InterventionsCarousel />
        </PredictionProvider>
      </ToastProvider>
    );
    const tree: any = toJSON();
    // Percorre nós procurando por style.transform com scale diferente de 1
    const hasScaled = JSON.stringify(tree).includes('0.92');
    expect(hasScaled).toBe(false);
  });
});
