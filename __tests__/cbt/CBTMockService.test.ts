import { CBTMockService } from '../../modules/cbt/services/CBTMockService';

describe('CBTMockService.analyze', () => {
  it('detecta catastrofização', () => {
    const text = 'Isso vai ser um desastre horrivel, nunca vai dar certo';
    const result = CBTMockService.analyze(text);
    expect(result.distortions.find(d => d.id === 'catastrofizacao')).toBeTruthy();
    expect(result.distortions.length).toBeGreaterThan(0);
  });

  it('gera fallback quando nenhuma heurística casa', () => {
    const text = 'Hoje foi um dia comum e tranquilo, caminhei no parque.';
    const result = CBTMockService.analyze(text);
    expect(result.distortions.length).toBe(1);
  });

  it('retorna perguntas socráticas', () => {
    const result = CBTMockService.analyze('Texto neutro para perguntas');
    expect(result.questions.length).toBe(3);
  });
});
