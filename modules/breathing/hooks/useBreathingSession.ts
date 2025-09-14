import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';
import { BreathingPhase, BreathingTechnique } from '../types';

interface UseBreathingSessionProps {
  technique: BreathingTechnique;
  onSessionComplete?: () => void;
  onPhaseChange?: (phase: BreathingPhase) => void;
}

export function useBreathingSession({ 
  technique, 
  onSessionComplete, 
  onPhaseChange 
}: UseBreathingSessionProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<BreathingPhase>('pause');
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Animation values
  const circleScale = useRef(new Animated.Value(0.8)).current;
  const circleOpacity = useRef(new Animated.Value(0.6)).current;
  const progressAnim = useRef(new Animated.Value(1)).current;

  // Timer ref
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentPhaseRef = useRef<BreathingPhase>(currentPhase);
  const currentCycleRef = useRef<number>(currentCycle); // Nova ref para currentCycle
  const isExecutingPhaseRef = useRef<boolean>(false); // Proteção contra execuções múltiplas

  useEffect(() => {
    currentPhaseRef.current = currentPhase;
    onPhaseChange?.(currentPhase);
  }, [currentPhase, onPhaseChange]);

  useEffect(() => {
    currentCycleRef.current = currentCycle; // Sync ref with state
  }, [currentCycle]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startSession = () => {
    setIsPlaying(true);
    setCurrentCycle(0);
    setCurrentPhase('inhale');
    setTimeRemaining(technique.inhaleTime);
    executeBreathingPhase('inhale', technique.inhaleTime);
  };

  const stopSession = () => {
    setIsPlaying(false);
    setCurrentPhase('pause');
    setTimeRemaining(0);
    isExecutingPhaseRef.current = false; // Reset protection

    if (timerRef.current) clearInterval(timerRef.current);

    // Reset animations
    Animated.parallel([
      Animated.timing(circleScale, {
        toValue: 0.8,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(circleOpacity, {
        toValue: 0.6,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const executeBreathingPhase = (phase: BreathingPhase, duration: number) => {
    if (isExecutingPhaseRef.current) {
      console.log('⚠️ Execution already in progress, skipping...');
      return; // Evita execuções múltiplas
    }
    
    isExecutingPhaseRef.current = true;
    console.log('🚀 Executing phase:', phase, 'for', duration, 'seconds');
    
    setCurrentPhase(phase);
    setTimeRemaining(duration);

    // Haptic feedback
    if (phase === 'inhale') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else if (phase === 'exhale') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Animation based on phase
    const animationConfig = getAnimationConfig(phase, duration);
    if (animationConfig) {
      Animated.parallel(animationConfig).start();
    }

    // Progress animation
    progressAnim.setValue(1);
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: duration * 1000,
      useNativeDriver: false,
    }).start();

    // Timer for phase countdown
    if (timerRef.current) clearInterval(timerRef.current);
    
    let remainingTime = duration;
    timerRef.current = setInterval(() => {
      remainingTime -= 1;
      setTimeRemaining(remainingTime);

      if (remainingTime <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        isExecutingPhaseRef.current = false; // Libera para próxima execução
        moveToNextPhase();
      }
    }, 1000);
  };

  const getAnimationConfig = (phase: BreathingPhase, duration: number) => {
    const animDuration = duration * 1000;

    switch (phase) {
      case 'inhale':
        return [
          Animated.timing(circleScale, {
            toValue: 1.2,
            duration: animDuration,
            useNativeDriver: true,
          }),
          Animated.timing(circleOpacity, {
            toValue: 1,
            duration: animDuration,
            useNativeDriver: true,
          }),
        ];
      case 'exhale':
        return [
          Animated.timing(circleScale, {
            toValue: 0.8,
            duration: animDuration,
            useNativeDriver: true,
          }),
          Animated.timing(circleOpacity, {
            toValue: 0.6,
            duration: animDuration,
            useNativeDriver: true,
          }),
        ];
      case 'hold':
        return null; // No animation for hold phases
      default:
        return null;
    }
  };

  const moveToNextPhase = () => {
    const currentPhaseValue = currentPhaseRef.current;
    const currentCycleValue = currentCycleRef.current; // Use ref para valor atual

    switch (currentPhaseValue) {
      case 'inhale':
        if (technique.holdTime > 0) {
          executeBreathingPhase('hold', technique.holdTime);
        } else {
          executeBreathingPhase('exhale', technique.exhaleTime);
        }
        break;
      case 'hold':
        executeBreathingPhase('exhale', technique.exhaleTime);
        break;
      case 'exhale':
        // Check if we need to complete more cycles
        const nextCycle = currentCycleValue + 1;
        console.log('🔄 Ciclo Hook:', { currentCycle: currentCycleValue, nextCycle, totalCycles: technique.cycles });
        if (nextCycle < technique.cycles) {
          setCurrentCycle(nextCycle);
          executeBreathingPhase('inhale', technique.inhaleTime);
        } else {
          // Session complete - mas primeiro atualiza o ciclo final
          setCurrentCycle(nextCycle);
          setTimeout(() => {
            console.log('🎯 Sessão completa!');
            setIsPlaying(false);
            setCurrentPhase('pause');
            setTimeRemaining(0);
            onSessionComplete?.();
          }, 500); // Pequeno delay para mostrar o ciclo final
        }
        break;
    }
  };

  const resetSession = () => {
    stopSession();
    setCurrentCycle(0);
  };

  return {
    isPlaying,
    currentCycle,
    currentPhase,
    timeRemaining,
    totalCycles: technique.cycles,
    circleScale,
    circleOpacity,
    progressAnim,
    startSession,
    stopSession,
    resetSession,
  };
}
