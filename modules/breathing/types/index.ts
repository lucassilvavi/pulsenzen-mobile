// Types for Breathing exercises and sessions
export interface BreathingTechnique {
  id?: string;
  key: string;
  icon: { name: string; color: string; bg: string };
  title: string;
  duration: string;
  description: string;
  inhaleTime: number;
  holdTime: number;
  exhaleTime: number;
  cycles: number;
}

export type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'pause';

export interface BreathingSession {
  id: string;
  techniqueId: string;
  duration: number;
  completedCycles: number;
  date: string;
  notes?: string;
}

export interface BreathingStats {
  totalSessions: number;
  totalMinutes: number;
  favorTechnique: string;
  streak: number;
}
