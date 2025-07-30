import { Colors } from '@/constants/Colors';
import { fontSize, spacing } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import {
    Animated,
    Dimensions,
    GestureResponderEvent,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import {
    PanGestureHandler,
    PanGestureHandlerStateChangeEvent,
    State
} from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { logger } from '../../../utils/logger';
import { usePlaybackControls, usePlaybackState } from '../context/MusicContext';

const { width } = Dimensions.get('window');

/**
 * MiniPlayerV2 - Refactored mini player using new context architecture
 * 
 * Key improvements:
 * - Uses new context for state management
 * - Better performance with memoization
 * - Improved gesture handling
 * - Enhanced error handling and logging
 * - Cleaner component structure
 */
const MiniPlayerV2 = React.memo(() => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // State from context
  const playbackState = usePlaybackState();
  const controls = usePlaybackControls();

  // Animation values
  const translateX = React.useRef(new Animated.Value(0)).current;
  const opacity = React.useRef(new Animated.Value(1)).current;

  // Memoized safe values to prevent crashes
  const safeValues = useMemo(() => {
    const track = playbackState.currentTrack;
    return {
      title: track?.title || 'Música desconhecida',
      artist: track?.artist || 'Artista desconhecido',
      icon: track?.category?.startsWith('sleep') ? '🌙' : '🎵',
    };
  }, [playbackState.currentTrack]);

  // Don't render if no track is loaded
  if (!playbackState.currentTrack) {
    return null;
  }

  // Event handlers with error handling
  const handleMiniPlayerPress = async () => {
    try {
      router.push('/music-player');
      logger.trackEvent('mini_player_opened', {
        trackId: playbackState.currentTrack?.id,
        source: 'mini_player_tap',
      });
    } catch (error) {
      logger.error('MiniPlayerV2', 'Error navigating to music player', error instanceof Error ? error : undefined);
    }
  };

  const handlePlayPause = async (e?: GestureResponderEvent) => {
    try {
      if (e) e.stopPropagation();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      if (playbackState.isPlaying) {
        await controls.pause();
      } else {
        await controls.resume();
      }
    } catch (error) {
      logger.error('MiniPlayerV2', 'Error toggling play/pause in mini-player', error instanceof Error ? error : undefined);
    }
  };

  const handleNext = async (e?: GestureResponderEvent) => {
    try {
      if (e) e.stopPropagation();
      if (!playbackState.canGoNext) return;
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await controls.next();
    } catch (error) {
      logger.error('MiniPlayerV2', 'Error playing next in mini-player', error instanceof Error ? error : undefined);
    }
  };

  const handlePrevious = async (e?: GestureResponderEvent) => {
    try {
      if (e) e.stopPropagation();
      if (!playbackState.canGoPrevious) return;
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await controls.previous();
    } catch (error) {
      logger.error('MiniPlayerV2', 'Error playing previous in mini-player', error instanceof Error ? error : undefined);
    }
  };

  // Gesture handlers for swipe-to-dismiss
  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: PanGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX: translation, velocityX } = event.nativeEvent;

      // Only allow dismissal when music is paused
      if (playbackState.isPlaying) {
        // Reset position if music is playing
        Animated.parallel([
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }),
          Animated.spring(opacity, {
            toValue: 1,
            useNativeDriver: true,
          }),
        ]).start();
        return;
      }

      // Determine if user wants to dismiss
      const shouldDismiss = Math.abs(translation) > width * 0.3 || Math.abs(velocityX) > 1000;
      
      if (shouldDismiss) {
        // Animate out and stop music
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: translation > 0 ? width : -width,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(async () => {
          try {
            // Stop and clear music after animation
            await controls.stop();
            
            // Reset animation values for next time
            translateX.setValue(0);
            opacity.setValue(1);
            
            logger.trackEvent('mini_player_dismissed', {
              trackId: playbackState.currentTrack?.id,
              dismissDirection: translation > 0 ? 'right' : 'left',
            });
          } catch (error) {
            logger.error('MiniPlayerV2', 'Error during swipe dismiss', error instanceof Error ? error : undefined);
          }
        });
      } else {
        // Reset position
        Animated.parallel([
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }),
          Animated.spring(opacity, {
            toValue: 1,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  };

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
      enabled={!playbackState.isPlaying} // Only allow swiping when paused
    >
      <Animated.View 
        style={[
          styles.container, 
          { 
            paddingBottom: insets.bottom + spacing.sm,
            transform: [{ translateX }],
            opacity,
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.touchable}
          onPress={handleMiniPlayerPress}
          activeOpacity={0.8}
        >
          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <View 
              style={[
                styles.progressBar, 
                { width: `${Math.max(0, Math.min(100, playbackState.progressPercentage))}%` }
              ]} 
            />
          </View>
          
          {/* Content */}
          <View style={styles.content}>
            {/* Track info */}
            <View style={styles.trackInfo}>
              <Text style={styles.trackIcon}>{safeValues.icon}</Text>
              <View style={styles.trackDetails}>
                <Text style={styles.trackTitle} numberOfLines={1}>
                  {safeValues.title}
                </Text>
                <Text style={styles.trackArtist} numberOfLines={1}>
                  {safeValues.artist}
                </Text>
              </View>
            </View>
            
            {/* Controls */}
            <View style={styles.controls}>
              <TouchableOpacity 
                style={[
                  styles.controlButton,
                  !playbackState.canGoPrevious && styles.controlButtonDisabled
                ]}
                onPress={handlePrevious}
                disabled={!playbackState.canGoPrevious}
              >
                <Ionicons 
                  name="play-skip-back" 
                  size={fontSize.lg} 
                  color={playbackState.canGoPrevious ? Colors.gray[800] : Colors.gray[400]} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.playButton}
                onPress={handlePlayPause}
                disabled={playbackState.isLoading}
              >
                {playbackState.isLoading ? (
                  <Ionicons 
                    name="hourglass" 
                    size={fontSize.lg} 
                    color={Colors.gray[800]} 
                  />
                ) : (
                  <Ionicons 
                    name={playbackState.isPlaying ? "pause" : "play"} 
                    size={fontSize.lg} 
                    color={Colors.gray[800]} 
                  />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.controlButton,
                  !playbackState.canGoNext && styles.controlButtonDisabled
                ]}
                onPress={handleNext}
                disabled={!playbackState.canGoNext}
              >
                <Ionicons 
                  name="play-skip-forward" 
                  size={fontSize.lg} 
                  color={playbackState.canGoNext ? Colors.gray[800] : Colors.gray[400]} 
                />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </PanGestureHandler>
  );
});

MiniPlayerV2.displayName = 'MiniPlayerV2';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
    zIndex: 1000,
    elevation: 8, // Android shadow
    shadowColor: Colors.gray[800], // iOS shadow
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  touchable: {
    flex: 1,
  },
  progressContainer: {
    height: 3,
    backgroundColor: Colors.gray[200],
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary[600],
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  trackInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackIcon: {
    fontSize: fontSize.xl,
    marginRight: spacing.sm,
  },
  trackDetails: {
    flex: 1,
  },
  trackTitle: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: Colors.gray[800],
    marginBottom: 2,
  },
  trackArtist: {
    fontSize: fontSize.sm,
    color: Colors.gray[600],
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    padding: spacing.xs,
    marginHorizontal: spacing.xs,
  },
  controlButtonDisabled: {
    opacity: 0.5,
  },
  playButton: {
    backgroundColor: Colors.primary[100],
    borderRadius: 20,
    padding: spacing.sm,
    marginHorizontal: spacing.xs,
  },
});

export default MiniPlayerV2;
