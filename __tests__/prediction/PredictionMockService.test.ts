import { PredictionMockService } from '../../modules/prediction/services/PredictionMock';

// Basic sanity tests for mock generator to ensure value ranges and shape

describe('PredictionMockService', () => {
  it('should generate a prediction detail with expected fields', () => {
    const detail = PredictionMockService.generateMockPrediction();
    expect(detail).toBeTruthy();
    expect(typeof detail.id).toBe('string');
    expect(detail.score).toBeGreaterThanOrEqual(0);
    expect(detail.score).toBeLessThanOrEqual(1);
    expect(['low','medium','high']).toContain(detail.level);
    expect(detail.factors.length).toBeGreaterThan(0);
    // Factors sorted desc by weight
    for (let i=1;i<detail.factors.length;i++) {
      expect(detail.factors[i-1].weight).toBeGreaterThanOrEqual(detail.factors[i].weight);
    }
    expect(detail.interventions.length).toBeGreaterThan(0);
  });

  it('fetchLatest should resolve a detail', async () => {
    const detail = await PredictionMockService.fetchLatest();
    expect(detail.factors).toBeDefined();
    expect(detail.interventions.length).toBeGreaterThan(0);
  });
});
