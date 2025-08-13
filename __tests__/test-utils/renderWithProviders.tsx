// Placeholder para evitar falha de suíte vazia caso este caminho seja recriado por tooling.
test('placeholder renderWithProviders util suite', () => {
  expect(true).toBe(true);
});
import React from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { ToastProvider } from '@/modules/ui/toast/ToastContext';
import { PredictionProvider } from '@/modules/prediction/context/PredictionContext';

// Wrapper combinando providers principais. Permite override parcial futuro.
export function renderWithProviders(ui: React.ReactElement, options?: RenderOptions){
  return render(
    <ToastProvider>
      <PredictionProvider>
        {ui}
      </PredictionProvider>
    </ToastProvider>,
    options
  );
}

export * from '@testing-library/react-native';
