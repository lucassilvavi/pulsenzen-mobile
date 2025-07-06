import * as Haptics from 'expo-haptics';
import React from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import Button from '@/components/base/Button';
import ScreenContainer from '@/components/base/ScreenContainer';
import { ThemedText } from '@/components/ThemedText';
import { colors } from '@/constants/theme';
import { breathingColors, breathingGradients } from '../constants';
import { useBreathingSession } from '../hooks';
import { BreathingPhase, BreathingTechnique } from '../types';

const { height } = Dimensions.get('window');

interface BreathingSessionScreenProps {
  technique: BreathingTechnique;
  onComplete?: () => void;
  onBack?: () => void;
}

const RNAnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function BreathingSessionScreen({ 
  technique, 
  onComplete, 
  onBack 
}: BreathingSessionScreenProps) {
  const {
    isPlaying,
    currentCycle,
    currentPhase,
    timeRemaining,
    totalCycles,
    circleScale,
    circleOpacity,
    progressAnim,
    startSession,
    stopSession,
  } = useBreathingSession({
    technique,
    onSessionComplete: onComplete,
    onPhaseChange: (phase: BreathingPhase) => {
      // Add haptic feedback for phase changes
      if (phase === 'inhale') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else if (phase === 'exhale') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    },
  });

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
        return breathingColors.accent;
      case 'hold':
        return colors.warning.main;
      case 'exhale':
        return colors.success.main;
      default:
        return breathingColors.accent;
    }
  };

  return (
    <ScreenContainer
      gradientColors={breathingGradients.primary}
      gradientHeight={height}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <ThemedText style={styles.techniqueTitle}>
              {technique.title}
            </ThemedText>
            <ThemedText style={styles.techniqueDescription}>
              {technique.description}
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
              Ciclo {Math.min(currentCycle + 1, totalCycles)} de {totalCycles}
            </ThemedText>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${(currentCycle / totalCycles) * 100}%`,
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
              onPress={startSession}
              style={styles.controlButton}
              labelStyle={{ color: breathingColors.accent }}
            />
          ) : (
            <Button
              label="Parar Sessão"
              variant="secondary"
              size="large"
              fullWidth
              onPress={stopSession}
              style={StyleSheet.flatten([styles.controlButton, { backgroundColor: colors.neutral.white }])}
              labelStyle={{ color: colors.error.main }}
            />
          )}
        </View>
      </View>
    </ScreenContainer>
  );
}

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
