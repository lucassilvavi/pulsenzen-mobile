// Types for prediction (mock)
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface PredictionSummary {
  id: string;
  score: number; // 0-1
  level: RiskLevel;
  label: string;
  confidence: number; // 0-1
  generatedAt: number;
}

export interface RiskFactor {
  id: string;
  category: string;
  label: string;
  weight: number; // contribution 0-1
  description: string;
  suggestion: string;
}

export interface InterventionSuggestion {
  id: string;
  title: string;
  emoji: string;
  benefit: string;
  estimatedMinutes: number;
  type: 'breathing' | 'reframe' | 'journal' | 'mindfulness';
  completed?: boolean;
}

export interface PredictionDetail extends PredictionSummary {
  factors: RiskFactor[];
  interventions: InterventionSuggestion[];
}

// Novo: Estado para quando não há dados suficientes
export interface InsufficientDataState {
  id: 'insufficient_data';
  type: 'insufficient_data';
  message: string;
  suggestions: string[];
  requiredActions: string[];
}

// União de tipos para resultado da API
export type PredictionResult = PredictionDetail | InsufficientDataState;

export interface PredictionState {
  current: PredictionSummary | null;
  history: PredictionSummary[];
  factors: RiskFactor[];
  interventions: InterventionSuggestion[];
  loading: boolean;
  lastUpdated: number | null;
  onboardingSeen?: boolean;
  // Novo: estado para dados insuficientes
  insufficientData?: InsufficientDataState;
}
