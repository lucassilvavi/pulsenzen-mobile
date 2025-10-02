import { PredictionResult } from '../types';

// Abstração de fonte de dados para previsões
// Permite trocar mock por API real.
export interface PredictionDataSource {
  fetchLatest(): Promise<PredictionResult>;
}
