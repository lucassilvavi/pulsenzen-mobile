// Teste agora foca no componente puro sem Modal para estabilidade
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('@/modules/prediction/context/PredictionContext', () => ({
  usePrediction: () => ({
    current: { id:'1', score:0.72, level:'medium', label:'Moderado', confidence:0.83 },
    factors: [
      { id:'f1', label:'Sono', weight:0.3, description:'Qualidade de sono moderada', suggestion:'Tentar rotina', group:'', score:0.5 },
      { id:'f2', label:'Exercício', weight:0.25, description:'Atividade reduzida', suggestion:'Caminhada leve', group:'', score:0.4 },
      { id:'f3', label:'Estresse', weight:0.2, description:'Estresse controlado', suggestion:'Respiração', group:'', score:0.6 },
      { id:'f4', label:'Hidratação', weight:0.15, description:'Ingestão ok', suggestion:'Água', group:'', score:0.7 },
    ],
    interventions: [
      { id:'i1', title:'Respiração', emoji:'🫁' },
      { id:'i2', title:'Alongar', emoji:'🤸' },
      { id:'i3', title:'Jornal', emoji:'📝' },
    ],
  }),
}));

import React from 'react';
import { render } from '@testing-library/react-native';
import { PredictionDetailContent } from '@/modules/prediction/components/PredictionDetailContent';

describe('PredictionDetailContent', () => {
  it('renderiza seção de sugestões e intervenções', () => {
    const { getByText, getByLabelText } = render(<PredictionDetailContent />);
    expect(getByText('Sugestões')).toBeTruthy();
    expect(getByLabelText('Intervenção Respiração')).toBeTruthy();
    expect(getByLabelText('Intervenção Alongar')).toBeTruthy();
    expect(getByLabelText('Intervenção Jornal')).toBeTruthy();
  });
});
