import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

const { width, height } = Dimensions.get('window');

interface ConfettiParticle {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  rotation: Animated.Value;
  emoji: string;
  duration: number;
}

interface CelebrationEffectProps {
  trigger: boolean;
  mood: 'positive' | 'neutral' | 'negative';
  onComplete?: () => void;
}

const positiveEmojis = ['✨', '🌟', '💫', '⭐', '🎉', '💖', '🌈'];
const neutralEmojis = ['💙', '🤍', '💚', '🌸'];
const negativeEmojis = ['💜', '🤗', '🌷', '🕯️'];

export default function CelebrationEffect({ trigger, mood, onComplete }: CelebrationEffectProps) {
  const particles = useRef<ConfettiParticle[]>([]);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  const getEmojisForMood = () => {
    switch (mood) {
      case 'positive':
        return positiveEmojis;
      case 'neutral':
        return neutralEmojis;
      case 'negative':
        return negativeEmojis;
      default:
        return positiveEmojis;
    }
  };

  const createParticles = () => {
    const emojis = getEmojisForMood();
    const particleCount = mood === 'positive' ? 12 : 6;
    
    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: new Animated.Value(width / 2 - 20),
      y: new Animated.Value(height / 2),
      rotation: new Animated.Value(0),
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      duration: 1500 + Math.random() * 1000,
    }));
  };

  const runAnimation = () => {
    particles.current = createParticles();
    
    const animations = particles.current.map((particle, index) => {
      const angle = (index / particles.current.length) * Math.PI * 2;
      const radius = 80 + Math.random() * 60;
      const targetX = width / 2 + Math.cos(angle) * radius;
      const targetY = height / 2 + Math.sin(angle) * radius - 100;

      return Animated.parallel([
        Animated.timing(particle.x, {
          toValue: targetX,
          duration: particle.duration,
          useNativeDriver: true,
        }),
        Animated.timing(particle.y, {
          toValue: targetY,
          duration: particle.duration,
          useNativeDriver: true,
        }),
        Animated.timing(particle.rotation, {
          toValue: 360 * (2 + Math.random()),
          duration: particle.duration,
          useNativeDriver: true,
        }),
      ]);
    });

    animationRef.current = Animated.parallel(animations);
    animationRef.current.start(() => {
      onComplete?.();
    });
  };

  useEffect(() => {
    if (trigger) {
      runAnimation();
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [trigger]);

  if (!trigger) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.current.map((particle) => (
        <Animated.Text
          key={particle.id}
          style={[
            styles.particle,
            {
              transform: [
                { translateX: particle.x },
                { translateY: particle.y },
                {
                  rotate: particle.rotation.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        >
          {particle.emoji}
        </Animated.Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  particle: {
    position: 'absolute',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
