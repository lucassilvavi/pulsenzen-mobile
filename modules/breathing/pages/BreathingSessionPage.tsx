import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { BreathingTechnique } from '../types';
import BreathingSessionScreen from './BreathingSessionScreen';

export default function BreathingSessionPage() {
  const router = useRouter();
  const { technique } = useLocalSearchParams();

  const selectedTechnique: BreathingTechnique = technique
    ? JSON.parse(technique as string)
    : {
        key: 'default',
        icon: { name: 'wind', color: '#2196F3', bg: '#E3F2FD' },
        title: 'Respiração Padrão',
        duration: '4 minutos',
        description: 'Técnica de respiração padrão',
        inhaleTime: 4,
        holdTime: 4,
        exhaleTime: 4,
        cycles: 4,
      };

  return (
    <BreathingSessionScreen
      technique={selectedTechnique}
      onComplete={() => {
        // Handle session completion
        router.back();
      }}
      onBack={() => {
        router.back();
      }}
    />
  );
}
