import renderer, { act } from 'react-test-renderer';
import { usePrediction } from '../../modules/prediction/context/PredictionContext';
import { PredictionState } from '../../modules/prediction/types';

// Mocks antes de importar o componente alvo
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top:0, bottom:0, left:0, right:0 }) }));
jest.mock('../../modules/prediction/components/InterventionsCarousel', () => ({ InterventionsCarousel: () => null }));
jest.mock('../../modules/prediction/context/PredictionContext', () => {
  return {
    usePrediction: jest.fn(() => ({
      current: { id:'mock', score:0.42, level:'medium', label:'Atenção leve', confidence:0.77, generatedAt: 1700000000000 },
      history: [],
      factors: [
        { id:'f1', label:'Sono', weight:0.2, category:'sleep', description:'Desc', suggestion:'Dica', },
        { id:'f2', label:'Stress', weight:0.3, category:'stress', description:'Desc', suggestion:'Dica', },
      ],
      interventions: [],
      loading:false,
      lastUpdated: 1700000005000,
      onboardingSeen:true,
      refresh: jest.fn(),
      markInterventionCompleted: jest.fn(),
      markOnboardingSeen: jest.fn(),
    })),
  };
});
jest.mock('react-native/Libraries/Components/Touchable/TouchableOpacity', () => {
  const React = require('react');
  const { View } = require('react-native');
  return (props: any) => <View accessibilityRole={props.accessibilityRole} accessibilityLabel={props.accessibilityLabel} style={props.style}>{props.children}</View>;
});

// We mock the hook to supply stable data
jest.mock('../../modules/prediction/context/PredictionContext', () => {
  const actual = jest.requireActual('../../modules/prediction/context/PredictionContext');
  return {
    ...actual,
    usePrediction: jest.fn(),
  };
});

const mockState: PredictionState = {
  current: { id:'1', score:0.55, level:'medium', label:'Atenção leve', confidence:0.8, generatedAt: Date.now() },
  history: [],
  factors: [
    { id:'mood_volatility', category:'Humor', label:'Variação de humor recente', weight:0.25, description:'Oscilações nos últimos dias', suggestion:'Registrar gatilhos' },
    { id:'negative_language', category:'Escrita', label:'Linguagem negativa', weight:0.18, description:'Termos autocríticos', suggestion:'Reestruturação cognitiva' },
  ],
  interventions: [],
  loading: false,
  lastUpdated: Date.now(),
  onboardingSeen: true,
};

// Import após mocks (import direto do componente)
const { PredictionDashboardScreen } = require('../../modules/prediction/components/PredictionDashboardScreen');

describe('PredictionDashboardScreen snapshot', () => {
  const FIXED_NOW = 1700000000000; // deterministic timestamp
  beforeAll(() => {
    jest.spyOn(Date, 'now').mockImplementation(() => FIXED_NOW);
  });
  afterAll(() => {
    (Date.now as jest.Mock).mockRestore();
  });
  beforeEach(() => {
    (usePrediction as jest.Mock).mockReturnValue({ ...mockState, refresh: jest.fn(), markInterventionCompleted: jest.fn(), markOnboardingSeen: jest.fn() });
  });

  it('matches snapshot (structure non-null)', () => {
    let root: any;
    act(() => { root = renderer.create(<PredictionDashboardScreen />); });
    const json = root.toJSON();
    expect(json).not.toBeNull();
    expect(json).toMatchSnapshot();
  });
});
