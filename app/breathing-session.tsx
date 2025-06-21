import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Animated as RNAnimated, StyleSheet, View } from 'react-native';

import Button from '@/components/base/Button';
import ScreenContainer from '@/components/base/ScreenContainer';
import { ThemedText } from '@/components/ThemedText';
import { colors } from '@/constants/theme';
import Svg, { Circle } from 'react-native-svg';

const { height } = Dimensions.get('window');

type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'pause';

interface BreathingTechnique {
  id: string;
  name: string;
  description: string;
  inhaleTime: number;
  holdTime: number;
  exhaleTime: number;
  cycles: number;
}

export default function BreathingSessionScreen() {
  const router = useRouter();
  const { technique } = useLocalSearchParams();
  const progressAnim = useRef(new RNAnimated.Value(1)).current;
  const RNAnimatedCircle = RNAnimated.createAnimatedComponent(Circle);

  const selectedTechnique: BreathingTechnique = technique
    ? JSON.parse(technique as string)
    : {
        id: '',
        name: '',
        description: '',
        inhaleTime: 0,
        holdTime: 0,
        exhaleTime: 0,
        cycles: 0,
      };

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<BreathingPhase>('pause');
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Animation values
  const circleScale = useRef(new Animated.Value(0.8)).current;
  const circleOpacity = useRef(new Animated.Value(0.6)).current;

  // Timer ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const currentPhaseRef = useRef<BreathingPhase>(currentPhase);

  useEffect(() => {
    currentPhaseRef.current = currentPhase;
  }, [currentPhase]);

  const startBreathingCycle = () => {
    setIsPlaying(true);
    setCurrentCycle(0);
    setCurrentPhase('inhale');
    setTimeRemaining(selectedTechnique.inhaleTime);
    executeBreathingPhase('inhale', selectedTechnique.inhaleTime);
  };

  const stopBreathingCycle = () => {
    setIsPlaying(false);
    setCurrentPhase('pause');
    setTimeRemaining(0);

    if (timerRef.current) clearInterval(timerRef.current);

    // Reset animation
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
  setCurrentPhase(phase);
  setTimeRemaining(duration);

  // Haptic feedback for phase changes
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  // Reset and animate progress
  progressAnim.setValue(1);
  RNAnimated.timing(progressAnim, {
    toValue: 0,
    duration: duration * 1000,
    useNativeDriver: false,
  }).start();

  animateBreathing(phase);

  // Countdown timer
  let remaining = duration;
  if (timerRef.current) clearInterval(timerRef.current);
  timerRef.current = setInterval(() => {
    remaining -= 1;
    setTimeRemaining(remaining);

    if (remaining <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      moveToNextPhase();
    }
  }, 1000);
};

  const moveToNextPhase = () => {
    const { inhaleTime, holdTime, exhaleTime, cycles } = selectedTechnique;

    switch (currentPhaseRef.current) {
      case 'inhale':
        if (holdTime > 0) {
          executeBreathingPhase('hold', holdTime);
        } else {
          executeBreathingPhase('exhale', exhaleTime);
        }
        break;

      case 'hold':
        executeBreathingPhase('exhale', exhaleTime);
        break;

      case 'exhale':
        setCurrentCycle((prevCycle) => {
          const nextCycle = prevCycle + 1;
          if (nextCycle >= cycles) {
            stopBreathingCycle();
            return prevCycle;
          } 
          executeBreathingPhase('inhale', inhaleTime);
          return prevCycle + 1;
        });
        break;
    }
  };

  const animateBreathing = (phase: BreathingPhase) => {
    const { inhaleTime, holdTime, exhaleTime } = selectedTechnique;

    switch (phase) {
      case 'inhale':
        Animated.parallel([
          Animated.timing(circleScale, {
            toValue: 1.2,
            duration: inhaleTime * 1000,
            useNativeDriver: true,
          }),
          Animated.timing(circleOpacity, {
            toValue: 0.9,
            duration: inhaleTime * 1000,
            useNativeDriver: true,
          }),
        ]).start();
        break;

      case 'hold':
        Animated.sequence([
          Animated.timing(circleScale, {
            toValue: 1.25,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(circleScale, {
            toValue: 1.2,
            duration: Math.max((holdTime * 1000) - 300, 0),
            useNativeDriver: true,
          }),
          Animated.timing(circleOpacity, {
            toValue: 0.95,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(circleOpacity, {
            toValue: 0.9,
            duration: Math.max((holdTime * 1000) - 300, 0),
            useNativeDriver: true,
          }),
        ]).start();
        break;

      case 'exhale':
        Animated.parallel([
          Animated.timing(circleScale, {
            toValue: 0.8,
            duration: exhaleTime * 1000,
            useNativeDriver: true,
          }),
          Animated.timing(circleOpacity, {
            toValue: 0.6,
            duration: exhaleTime * 1000,
            useNativeDriver: true,
          }),
        ]).start();
        break;
    }
  };

  const getPhaseText = () => {
    switch (currentPhase) {
      case 'inhale':
        return 'Inspire';
      case 'hold':
        return 'Segure';
      case 'exhale':
        return 'Expire';
      default:
        return 'Pronto para começar?';
    }
  };

  const getPhaseColor = () => {
    switch (currentPhase) {
      case 'inhale':
        return colors.breathing.accent;
      case 'hold':
        return colors.warning.main;
      case 'exhale':
        return colors.success.main;
      default:
        return colors.breathing.accent;
    }
  };

  return (
    <ScreenContainer
      gradientColors={colors.gradients.breathing}
      gradientHeight={height}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <ThemedText style={styles.techniqueTitle}>
              {selectedTechnique.name}
            </ThemedText>
            <ThemedText style={styles.techniqueDescription}>
              {selectedTechnique.description}
            </ThemedText>
          </View>
        </View>

        {/* Breathing Circle */}
     <View style={styles.breathingContainer}>
  <View style={{ position: 'absolute' }}>
    <Svg width={240} height={240}>
      <Circle
        cx={120}
        cy={120}
        r={110}
        stroke="#fff"
        strokeOpacity={0.18}
        strokeWidth={8}
        fill="none"
      />
      <RNAnimatedCircle
        cx={120}
        cy={120}
        r={110}
        stroke={getPhaseColor()}
        strokeWidth={8}
        fill="none"
        strokeDasharray={2 * Math.PI * 110}
        strokeDashoffset={progressAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 2 * Math.PI * 110],
        })}
        strokeLinecap="round"
      />
    </Svg>
  </View>
  <Animated.View
    style={[
      styles.breathingCircle,
      {
        transform: [{ scale: circleScale }],
        opacity: circleOpacity,
        backgroundColor: getPhaseColor(),
      },
    ]}
  >
    <View style={styles.innerCircle}>
      <ThemedText style={styles.phaseText}>
        {getPhaseText()}
      </ThemedText>
      {isPlaying && (
        <ThemedText style={styles.timerText}>
          {timeRemaining}
        </ThemedText>
      )}
    </View>
  </Animated.View>
</View>

        {/* Progress Info */}
        {isPlaying && (
          <View style={styles.progressContainer}>
            <ThemedText style={styles.cycleText}>
              Ciclo {Math.min(currentCycle + 1, selectedTechnique.cycles)} de {selectedTechnique.cycles}
            </ThemedText>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${((currentCycle) / selectedTechnique.cycles) * 100}%`,
                    backgroundColor: getPhaseColor(),
                  }
                ]}
              />
            </View>
          </View>
        )}

        {/* Controls */}
        <View style={styles.controlsContainer}>
          {!isPlaying ? (
            <Button
              label="Iniciar Sessão"
              variant="primary"
              size="large"
              fullWidth
              onPress={startBreathingCycle}
              style={styles.controlButton}
              labelStyle={{ color: colors.breathing.accent }}
            />
          ) : (
            <Button
              label="Parar Sessão"
              variant="secondary"
              size="large"
              fullWidth
              onPress={stopBreathingCycle}
              style={[styles.controlButton, { backgroundColor: colors.neutral.white }]}
              labelStyle={{ color: colors.error.main }}
            />
          )}
        </View>
      </View>
    </ScreenContainer>
  );
}

// Ajuste nos estilos para suavidade e centralização
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 16,
  },
  headerContent: {
    alignItems: 'center',
  },
  techniqueTitle: {
    fontSize: 30,
    fontFamily: 'Inter-Bold',
    color: colors.neutral.white,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  techniqueDescription: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: colors.neutral.white,
    textAlign: 'center',
    opacity: 0.7,
    marginTop: 8,
    lineHeight: 22,
  },
  breathingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  breathingCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 16,
  },
  innerCircle: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  phaseText: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: colors.neutral.text.primary,
    textAlign: 'center',
    opacity: 0.8,
  },
  timerText: {
    fontSize: 35,
    fontFamily: 'Inter-Bold',
    color: colors.neutral.text.primary,
    textAlign: 'center',
    marginTop: 4,
    opacity: 0.7,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  cycleText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: colors.neutral.white,
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(0,0,0,0.12)', 
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  progressBar: {
    width: '92%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  controlsContainer: {
    marginBottom: 0,
    paddingHorizontal: 0,
  },
  controlButton: {
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
    backgroundColor: colors.neutral.white,
  },
});