export interface CopingStrategy {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  steps: string[];
  icon: string;
  category: 'breathing' | 'grounding' | 'relaxation' | 'physical';
}

export interface EmergencyContact {
  name: string;
  number: string;
  description: string;
  type: 'crisis' | 'medical' | 'general';
}

export interface SOSSession {
  id: string;
  strategyId: string;
  startTime: Date;
  endTime?: Date;
  completed: boolean;
  rating?: number; // 1-5 scale
  notes?: string;
}

export interface SOSStats {
  totalSessions: number;
  completedSessions: number;
  favoriteStrategy?: string;
  averageRating: number;
  lastUsed?: Date;
}
