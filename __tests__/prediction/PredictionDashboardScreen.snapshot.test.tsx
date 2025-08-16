import renderer, { act } from 'react-test-renderer';
import { PredictionDashboardScreen } from '../../modules/prediction/components/PredictionDashboardScreen';

// Mocks específicos antes de qualquer importação
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 })
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => 'Ionicons'
}));

jest.mock('../../modules/prediction/components/InterventionsCarousel', () => ({
  InterventionsCarousel: () => 'InterventionsCarousel'
}));

jest.mock('../../modules/prediction/services/Telemetry', () => ({
  track: jest.fn()
}));

jest.mock('expo-router', () => ({
  router: {
    back: jest.fn()
  }
}));

jest.mock('react-native/Libraries/Components/Touchable/TouchableOpacity', () => {
  return 'TouchableOpacity';
});

// Mock do contexto com dados determinísticos
jest.mock('../../modules/prediction/context/PredictionContext', () => ({
  usePrediction: () => ({
    current: { 
      id: '1', 
      score: 0.55, 
      level: 'medium', 
      label: 'Atenção leve', 
      confidence: 0.8, 
      generatedAt: 1700000000000 
    },
    history: [],
    factors: [
      { 
        id: 'mood_volatility', 
        category: 'Humor', 
        label: 'Variação de humor recente', 
        weight: 0.25, 
        description: 'Oscilações nos últimos dias', 
        suggestion: 'Registrar gatilhos' 
      },
      { 
        id: 'negative_language', 
        category: 'Escrita', 
        label: 'Linguagem negativa', 
        weight: 0.18, 
        description: 'Termos autocríticos', 
        suggestion: 'Reestruturação cognitiva' 
      },
    ],
    interventions: [
      { id: 'i1', title: 'Respiração', emoji: '🫁' },
      { id: 'i2', title: 'Diário', emoji: '📝' }
    ],
    loading: false,
    lastUpdated: 1700000000000,
    onboardingSeen: true,
    refresh: jest.fn(),
    markInterventionCompleted: jest.fn(),
    markOnboardingSeen: jest.fn(),
  }),
}));

describe('PredictionDashboardScreen snapshot', () => {
  const FIXED_NOW = 1700000000000;
  
  beforeAll(() => {
    jest.spyOn(Date, 'now').mockImplementation(() => FIXED_NOW);
  });
  
  afterAll(() => {
    (Date.now as jest.Mock).mockRestore();
  });

  it('matches snapshot (structure non-null)', () => {
    let root: any;
    act(() => { 
      root = renderer.create(<PredictionDashboardScreen />); 
    });
    const json = root.toJSON();
    expect(json).not.toBeNull();
    expect(json).toMatchSnapshot();
  });
});
