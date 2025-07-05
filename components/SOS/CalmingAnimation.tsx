import { ThemedText } from '@/components/ThemedText';
import { colors } from '@/constants/theme';
import { fontSize, spacing } from '@/utils/responsive';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface CalmingAnimationProps {
  isActive?: boolean;
  animationType?: 'pulse' | 'breathing';
  message?: string;
}

export default function CalmingAnimation({ 
  isActive = false, 
  animationType = 'pulse',
  message = 'Você está seguro'
}: CalmingAnimationProps) {
  const pulseAnimation = useRef(new Animated.Value(0)).current;
  const breathingAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animationType === 'pulse') {
      startPulseAnimation();
    } else if (animationType === 'breathing') {
      startBreathingAnimation();
    }
  }, [animationType]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startBreathingAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(breathingAnimation, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(breathingAnimation, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.pulseCircle,
          {
            opacity: pulseAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 0.7],
            }),
            transform: [{
              scale: pulseAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1.1],
              }),
            }],
          },
        ]}
      />
      
      {animationType === 'breathing' && (
        <Animated.View
          style={[
            styles.breathingGuide,
            {
              transform: [{
                scale: breathingAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.9, 1.3],
                }),
              }],
            },
          ]}
        />
      )}
      
      <View style={styles.centerContent}>
        <ThemedText style={styles.calmingText}>
          {isActive ? 'Respire' : message}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  pulseCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.error.light,
    position: 'absolute',
  },
  breathingGuide: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.error.main,
    position: 'absolute',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  calmingText: {
    fontSize: fontSize.lg,
    fontFamily: 'Inter-SemiBold',
    color: colors.error.main,
    textAlign: 'center',
  },
});
