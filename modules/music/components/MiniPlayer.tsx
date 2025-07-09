import { colors } from '@/constants/theme';
import { fontSize, spacing } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import usePlayback from '../hooks/usePlayback';
import musicService from '../services/MusicService';

const { width } = Dimensions.get('window');

export default function MiniPlayer() {
  const { playbackState, handleNext, handlePrevious } = usePlayback();
  const insets = useSafeAreaInsets();
  
  // Animated values for swipe gesture
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  // Nova lógica de visibilidade:
  // - Mostrar sempre que há uma música carregada (seja tocando ou pausada)
  // - A única forma de esconder é arrastando para o lado quando pausada
  const shouldShowMiniPlayer = playbackState.currentTrack !== null;

  if (!shouldShowMiniPlayer) {
    return null;
  }

  // Removendo log para evitar spam
  const safeTitle = playbackState.currentTrack?.title || 'Sem título';
  const safeArtist = playbackState.currentTrack?.artist || 'PulseZen Sounds';
  const safeIcon = playbackState.currentTrack?.icon || '🎵';

  const handleMiniPlayerPress = () => {
    // Navegar para a tela do player sem parâmetros para não reiniciar a música
    // O player vai sincronizar automaticamente com o estado atual do musicService
    router.push({
      pathname: '/music-player',
      params: {} // Força parâmetros vazios
    });
  };

  const handleMiniPlayerPlayPause = async (e?: any) => {
    try {
      if (e) e.stopPropagation();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      if (playbackState.isPlaying) {
        await musicService.pauseTrack('miniPlayer'); // Marcamos que foi pausado pelo mini-player
      } else {
        await musicService.resumeTrack();
      }
    } catch (error) {
      console.error('Erro ao pausar/retomar música no mini-player:', error);
    }
  };

  const handleMiniPlayerNext = async (e?: any) => {
    try {
      if (e) e.stopPropagation();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await handleNext();
    } catch (error) {
      console.error('Erro ao pular música no mini-player:', error);
    }
  };

  const handleMiniPlayerPrevious = async (e?: any) => {
    try {
      if (e) e.stopPropagation();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await handlePrevious();
    } catch (error) {
      console.error('Erro ao voltar música no mini-player:', error);
    }
  };

  // Handle swipe gesture
  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX: translation, velocityX } = event.nativeEvent;
      
      // If music is playing, reset position (don't allow dismissal)
      if (playbackState.isPlaying) {
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

      // If music is paused, allow dismissal with swipe
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
        ]).start(() => {
          // Stop and clear music after animation
          musicService.stopAndClearMusic();
          // Reset animation values for next time
          translateX.setValue(0);
          opacity.setValue(1);
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
          <View style={styles.progressContainer}>
            <View 
              style={[
                styles.progressBar, 
                { width: `${(playbackState.position / Math.max(playbackState.duration, 1)) * 100}%` }
              ]} 
            />
          </View>
          <View style={styles.content}>
            <View style={styles.trackInfo}>
              <Text style={styles.trackIcon}>{safeIcon}</Text>
              <View style={styles.trackDetails}>
                <Text style={styles.trackTitle} numberOfLines={1}>
                  {safeTitle}
                </Text>
                <Text style={styles.trackArtist} numberOfLines={1}>
                  {safeArtist}
                </Text>
              </View>
            </View>
            <View style={styles.controls}>
              <TouchableOpacity 
                style={styles.controlButton}
                onPress={handleMiniPlayerPrevious}
              >
                <Ionicons 
                  name="play-skip-back" 
                  size={fontSize.lg} 
                  color={colors.neutral.text.primary} 
                />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.playButton}
                onPress={handleMiniPlayerPlayPause}
              >
                <Ionicons 
                  name={playbackState.isPlaying ? "pause" : "play"} 
                  size={fontSize.lg} 
                  color={colors.neutral.text.primary} 
                />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.controlButton}
                onPress={handleMiniPlayerNext}
              >
                <Ionicons 
                  name="play-skip-forward" 
                  size={fontSize.lg} 
                  color={colors.neutral.text.primary} 
                />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.neutral.card,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.divider,
    zIndex: 1000,
  },
  touchable: {
    flex: 1,
  },
  progressContainer: {
    height: 3,
    backgroundColor: colors.neutral.divider,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary.main,
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
    color: colors.neutral.text.primary,
    marginBottom: 2,
  },
  trackArtist: {
    fontSize: fontSize.sm,
    color: colors.neutral.text.secondary,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    padding: spacing.xs,
    marginHorizontal: spacing.xs,
  },
  playButton: {
    backgroundColor: colors.primary.light,
    borderRadius: 20,
    padding: spacing.sm,
    marginHorizontal: spacing.xs,
  },
});
