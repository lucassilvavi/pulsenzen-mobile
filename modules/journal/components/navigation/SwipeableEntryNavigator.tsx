import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    Extrapolate,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { useJournalNavigation } from '../../navigation/JournalNavigation';
import { JournalEntry } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

interface SwipeableEntryNavigatorProps {
  currentEntry: JournalEntry;
  entries: JournalEntry[];
  onEntryChange: (entry: JournalEntry) => void;
  children: React.ReactNode;
}

/**
 * Swipeable navigator for journal entries with visual indicators
 */
export const SwipeableEntryNavigator: React.FC<SwipeableEntryNavigatorProps> = ({
  currentEntry,
  entries,
  onEntryChange,
  children
}) => {
  const navigation = useJournalNavigation();
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  const currentIndex = entries.findIndex(entry => entry.id === currentEntry.id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < entries.length - 1;

  const navigateToEntry = (direction: 'previous' | 'next') => {
    const newIndex = direction === 'previous' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex >= 0 && newIndex < entries.length) {
      const newEntry = entries[newIndex];
      onEntryChange(newEntry);
      navigation.handleEntrySwipe(currentEntry.id, entries, direction === 'next' ? 'left' : 'right');
    }
  };

  const swipeGesture = Gesture.Pan()
    .onUpdate((event) => {
      const { translationX } = event;
      
      // Limit swipe distance
      const maxTranslation = SCREEN_WIDTH * 0.8;
      const clampedTranslation = Math.max(
        -maxTranslation,
        Math.min(maxTranslation, translationX)
      );
      
      translateX.value = clampedTranslation;
      
      // Scale effect
      const scaleValue = interpolate(
        Math.abs(clampedTranslation),
        [0, SWIPE_THRESHOLD],
        [1, 0.95],
        Extrapolate.CLAMP
      );
      scale.value = scaleValue;
      
      // Opacity effect
      const opacityValue = interpolate(
        Math.abs(clampedTranslation),
        [0, SWIPE_THRESHOLD],
        [1, 0.8],
        Extrapolate.CLAMP
      );
      opacity.value = opacityValue;
    })
    .onEnd((event) => {
      const { translationX, velocityX } = event;
      
      // Determine if swipe was strong enough
      const shouldNavigate = Math.abs(translationX) > SWIPE_THRESHOLD || Math.abs(velocityX) > 500;
      
      if (shouldNavigate) {
        if (translationX > 0 && hasPrevious) {
          // Swipe right - go to previous entry
          runOnJS(navigateToEntry)('previous');
        } else if (translationX < 0 && hasNext) {
          // Swipe left - go to next entry
          runOnJS(navigateToEntry)('next');
        }
      }
      
      // Reset animations
      translateX.value = withTiming(0);
      scale.value = withTiming(1);
      opacity.value = withTiming(1);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scale: scale.value }
    ],
    opacity: opacity.value,
  }));

  const leftIndicatorStyle = useAnimatedStyle(() => {
    const translateValue = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [-50, 0],
      Extrapolate.CLAMP
    );
    const opacityValue = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD * 0.5],
      [0, 1],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateX: translateValue }],
      opacity: opacityValue,
    };
  });

  const rightIndicatorStyle = useAnimatedStyle(() => {
    const translateValue = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [0, 50],
      Extrapolate.CLAMP
    );
    const opacityValue = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD * 0.5, 0],
      [1, 0],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateX: translateValue }],
      opacity: opacityValue,
    };
  });

  return (
    <View style={styles.container}>
      <GestureDetector gesture={swipeGesture}>
        <Animated.View style={[styles.content, animatedStyle]}>
          {children}
        </Animated.View>
      </GestureDetector>

      {/* Previous Entry Indicator */}
      {hasPrevious && (
        <Animated.View style={[styles.leftIndicator, leftIndicatorStyle]}>
          <BlurView intensity={20} style={styles.indicatorContainer}>
            <Ionicons name="chevron-back" size={24} color="#007AFF" />
            <Text style={styles.indicatorText}>Anterior</Text>
          </BlurView>
        </Animated.View>
      )}

      {/* Next Entry Indicator */}
      {hasNext && (
        <Animated.View style={[styles.rightIndicator, rightIndicatorStyle]}>
          <BlurView intensity={20} style={styles.indicatorContainer}>
            <Ionicons name="chevron-forward" size={24} color="#007AFF" />
            <Text style={styles.indicatorText}>Próxima</Text>
          </BlurView>
        </Animated.View>
      )}

      {/* Navigation Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { width: `${((currentIndex + 1) / entries.length) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {currentIndex + 1} de {entries.length}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  content: {
    flex: 1,
  },
  leftIndicator: {
    position: 'absolute',
    left: 20,
    top: '50%',
    zIndex: 10,
    transform: [{ translateY: -25 }],
  },
  rightIndicator: {
    position: 'absolute',
    right: 20,
    top: '50%',
    zIndex: 10,
    transform: [{ translateY: -25 }],
  },
  indicatorContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  indicatorText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
    marginTop: 4,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 8,
    fontWeight: '500',
  },
});
