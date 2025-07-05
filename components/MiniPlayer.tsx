import { colors } from '@/constants/theme';
import { usePlayback } from '@/hooks';
import musicService from '@/services/musicService';
import { fontSize, spacing } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function MiniPlayer() {
  const { playbackState, handleNext, handlePrevious } = usePlayback();
  const insets = useSafeAreaInsets();

  // Lógica de visibilidade do mini-player:
  // - Mostrar se há uma música carregada E:
  //   - A música está tocando OU
  //   - A música foi pausada do mini-player (pausedFrom === 'miniPlayer')
  const shouldShowMiniPlayer = playbackState.currentTrack && (
    playbackState.isPlaying || 
    playbackState.pausedFrom === 'miniPlayer'
  );

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
        // Pausar do mini-player
        await musicService.pauseTrack('miniPlayer');
      } else {
        if (playbackState.currentTrack) {
          await musicService.resumeTrack();
        }
      }
    } catch (error) {
      console.error('Error toggling playback from mini-player:', error);
    }
  };

  const handleMiniPlayerNext = async (e?: any) => {
    try {
      if (e) e.stopPropagation();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await musicService.playNext();
    } catch (error) {
      console.error('Error playing next from mini-player:', error);
    }
  };

  const handleMiniPlayerPrevious = async (e?: any) => {
    try {
      if (e) e.stopPropagation();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await musicService.playPrevious();
    } catch (error) {
      console.error('Error playing previous from mini-player:', error);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { bottom: insets.bottom + 80 }]} // 80px acima da tab bar
      onPress={handleMiniPlayerPress}
      activeOpacity={0.9}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.trackIcon}>{safeIcon}</Text>
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.titleText} numberOfLines={1}>
          {safeTitle}
        </Text>
        <Text style={styles.artistText} numberOfLines={1}>
          {safeArtist}
        </Text>
      </View>
      
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={handleMiniPlayerPrevious}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="play-back" size={22} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.playPauseButton}
          onPress={handleMiniPlayerPlayPause}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={playbackState.isPlaying ? 'pause' : 'play'}
            size={22}
            color="white"
            style={playbackState.isPlaying ? {} : { marginLeft: 2 }}
          />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.controlButton}
          onPress={handleMiniPlayerNext}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="play-forward" size={22} color="white" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: width - spacing.md * 2,
    height: 60,
    backgroundColor: colors.sleep.primary,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginHorizontal: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 999,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  trackIcon: {
    fontSize: 24,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleText: {
    color: 'white',
    fontSize: fontSize.md,
    fontFamily: 'Inter-SemiBold',
  },
  artistText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Regular',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 110,
  },
  controlButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
});
