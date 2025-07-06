import { CopingStrategy, EmergencyContact, SOSSession, SOSStats } from '../types';

const copingStrategies: CopingStrategy[] = [
  {
    id: '5-4-3-2-1',
    title: 'Técnica 5-4-3-2-1',
    description: 'Use seus sentidos para se reconectar com o presente',
    duration: 5,
    icon: '👁️',
    category: 'grounding',
    steps: [
      '5 coisas que você pode VER ao seu redor',
      '4 coisas que você pode TOCAR',
      '3 coisas que você pode OUVIR',
      '2 coisas que você pode CHEIRAR',
      '1 coisa que você pode SABOREAR'
    ],
  },
  {
    id: 'box-breathing',
    title: 'Respiração Quadrada',
    description: 'Inspire, segure, expire e segure novamente, cada etapa por 4 segundos. Excelente para melhorar a concentração e equilíbrio.',
    duration: 3,
    icon: '🫁',
    category: 'breathing',
    steps: [
      'Inspire por 4 segundos',
      'Segure a respiração por 4 segundos',
      'Expire por 4 segundos',
      'Pause por 4 segundos',
      'Repita o ciclo'
    ],
  },
  {
    id: 'progressive-relaxation',
    title: 'Relaxamento Progressivo',
    description: 'Relaxe cada parte do seu corpo sistematicamente',
    duration: 10,
    icon: '💆‍♀️',
    category: 'relaxation',
    steps: [
      'Comece pelos pés e tensione por 5 segundos',
      'Relaxe completamente e sinta a diferença',
      'Suba para as panturrilhas e repita',
      'Continue até chegar à cabeça',
      'Respire profundamente ao final'
    ],
  },
  {
    id: 'cold-water',
    title: 'Água Fria',
    description: 'Use água fria para ativar o nervo vago',
    duration: 2,
    icon: '💧',
    category: 'physical',
    steps: [
      'Molhe o rosto com água fria',
      'Ou coloque uma toalha fria no pescoço',
      'Respire profundamente',
      'Sinta a sensação refrescante',
      'Repita se necessário'
    ],
  },
];

const emergencyContacts: EmergencyContact[] = [
  { 
    name: 'CVV - Centro de Valorização da Vida', 
    number: '188', 
    description: '24h gratuito',
    type: 'crisis'
  },
  { 
    name: 'SAMU', 
    number: '192', 
    description: 'Emergências médicas',
    type: 'medical'
  },
  { 
    name: 'Bombeiros', 
    number: '193', 
    description: 'Emergências gerais',
    type: 'general'
  },
];

// Mock data for sessions
let mockSessions: SOSSession[] = [
  {
    id: '1',
    strategyId: 'box-breathing',
    startTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    endTime: new Date(Date.now() - 24 * 60 * 60 * 1000 + 3 * 60 * 1000), // 3 minutes later
    completed: true,
    rating: 4,
    notes: 'Me ajudou muito durante um momento de ansiedade'
  },
  {
    id: '2',
    strategyId: '5-4-3-2-1',
    startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    endTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000), // 5 minutes later
    completed: true,
    rating: 5,
  }
];

class SOSService {
  static async getCopingStrategies(): Promise<CopingStrategy[]> {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => resolve(copingStrategies), 300);
    });
  }

  static async getCopingStrategy(id: string): Promise<CopingStrategy | null> {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const strategy = copingStrategies.find(s => s.id === id);
        resolve(strategy || null);
      }, 200);
    });
  }

  static async getEmergencyContacts(): Promise<EmergencyContact[]> {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => resolve(emergencyContacts), 200);
    });
  }

  static async startSession(strategyId: string): Promise<SOSSession> {
    // Simulate API call
    return new Promise((resolve) => {
      const newSession: SOSSession = {
        id: Date.now().toString(),
        strategyId,
        startTime: new Date(),
        completed: false,
      };
      mockSessions.push(newSession);
      setTimeout(() => resolve(newSession), 200);
    });
  }

  static async completeSession(
    sessionId: string, 
    rating?: number, 
    notes?: string
  ): Promise<SOSSession> {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const sessionIndex = mockSessions.findIndex(s => s.id === sessionId);
        if (sessionIndex === -1) {
          reject(new Error('Session not found'));
          return;
        }

        mockSessions[sessionIndex] = {
          ...mockSessions[sessionIndex],
          endTime: new Date(),
          completed: true,
          rating,
          notes,
        };

        resolve(mockSessions[sessionIndex]);
      }, 200);
    });
  }

  static async getSOSStats(): Promise<SOSStats> {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const completedSessions = mockSessions.filter(s => s.completed);
        const ratings = completedSessions
          .map(s => s.rating)
          .filter(r => r !== undefined) as number[];

        // Find most used strategy
        const strategyCounts = completedSessions.reduce((acc, session) => {
          acc[session.strategyId] = (acc[session.strategyId] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const favoriteStrategy = Object.keys(strategyCounts).reduce((a, b) => 
          strategyCounts[a] > strategyCounts[b] ? a : b, 
          Object.keys(strategyCounts)[0]
        );

        const stats: SOSStats = {
          totalSessions: mockSessions.length,
          completedSessions: completedSessions.length,
          favoriteStrategy: favoriteStrategy || undefined,
          averageRating: ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0,
          lastUsed: mockSessions.length > 0 ? mockSessions[mockSessions.length - 1].startTime : undefined,
        };

        resolve(stats);
      }, 300);
    });
  }

  static async getSessions(): Promise<SOSSession[]> {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockSessions]), 200);
    });
  }
}

export default SOSService;
