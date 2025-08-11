import { InterventionSuggestion, PredictionDetail, PredictionSummary, RiskFactor } from '../types';
import { PredictionDataSource } from './PredictionDataSource';

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function deriveLevel(score: number) {
  if (score < 0.4) return { level: 'low' as const, label: 'Equilibrado' };
  if (score < 0.7) return { level: 'medium' as const, label: 'Atenção leve' };
  return { level: 'high' as const, label: 'Sinal de atenção' };
}

export const PredictionMockService: PredictionDataSource & { generateMockPrediction(): PredictionDetail } = {
  fetchLatest(): Promise<PredictionDetail> { return Promise.resolve(this.generateMockPrediction()); },
  generateMockPrediction(): PredictionDetail {
    const baseScore = randomBetween(0.2, 0.85);
    const jitter = (Math.random() - 0.5) * 0.05;
    const score = Math.min(0.95, Math.max(0.05, baseScore + jitter));
    const { level, label } = deriveLevel(score);
    const confidence = randomBetween(0.55, 0.95);

    const factors: RiskFactor[] = [
      {
        id: 'mood_volatility',
        category: 'Humor',
        label: 'Variação de humor recente',
        weight: randomBetween(0.15, 0.3),
        description: 'Oscilações significativas nos últimos 3 dias',
        suggestion: 'Registrar gatilhos após registrar humor',
      },
      {
        id: 'negative_language',
        category: 'Escrita',
        label: 'Linguagem negativa no diário',
        weight: randomBetween(0.1, 0.25),
        description: 'Aumento de termos autocríticos',
        suggestion: 'Fazer exercício de reestruturação cognitiva',
      },
      {
        id: 'reduced_entries',
        category: 'Comportamento',
        label: 'Queda de frequência de registros',
        weight: randomBetween(0.05, 0.2),
        description: 'Menos registros comparado à semana anterior',
        suggestion: 'Definir lembrete suave diário',
      },
      {
        id: 'late_night_usage',
        category: 'Rotina',
        label: 'Uso tarde da noite',
        weight: randomBetween(0.05, 0.15),
        description: 'Acessos após 00:00 aumentaram',
        suggestion: 'Praticar respiração guiada antes de dormir',
      },
    ].sort((a, b) => b.weight - a.weight);

    const interventions: InterventionSuggestion[] = [
      {
        id: 'breathing_box',
        title: 'Respiração Caixa 4x4',
        emoji: '🫁',
        benefit: 'Reduz ativação fisiológica e ansiedade leve',
        estimatedMinutes: 3,
        type: 'breathing',
      },
      {
        id: 'cognitive_reframe',
        title: 'Reestruturação Cognitiva',
        emoji: '🧠',
        benefit: 'Desafiar pensamento autocrítico recente',
        estimatedMinutes: 5,
        type: 'reframe',
      },
      {
        id: 'gratitude_mini',
        title: 'Mini Gratidão',
        emoji: '🙏',
        benefit: 'Equilibrar foco atencional em aspectos positivos',
        estimatedMinutes: 2,
        type: 'journal',
      },
    ];

    const detail: PredictionDetail = {
      id: Date.now().toString(),
      score,
      level,
      label,
      confidence,
      generatedAt: Date.now(),
      factors,
      interventions,
    };

    return detail;
  },
};
