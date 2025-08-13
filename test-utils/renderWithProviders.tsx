import React from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { ToastProvider } from '@/modules/ui/toast/ToastContext';
import { PredictionProvider } from '@/modules/prediction/context/PredictionContext';

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
