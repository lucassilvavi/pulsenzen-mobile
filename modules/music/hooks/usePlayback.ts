import { useCallback } from 'react';
import { logger } from '../../../utils/logger';
import { usePlaybackControls, usePlaybackState } from '../context/MusicContext';

/**
 * Enhanced usePlayback hook using the new context-based architecture
 * 
 * This hook provides a simplified interface for playback controls while
 * leveraging the new AudioEngine and PlaylistManager services under the hood.
 */
export default function usePlayback() {
  const playbackState = usePlaybackState();
  const controls = usePlaybackControls();

  const handlePlayPause = useCallback(async () => {
    try {
      if (playbackState.isPlaying) {
        await controls.pause();
        logger.trackEvent('music_paused', {
          trackId: playbackState.currentTrack?.id,
          position: playbackState.position,
        });
      } else if (playbackState.currentTrack) {
        await controls.resume();
        logger.trackEvent('music_resumed', {
          trackId: playbackState.currentTrack.id,
          position: playbackState.position,
        });
      }
    } catch (error) {
      logger.error('usePlayback', 'Error toggling playback', error instanceof Error ? error : undefined);
    }
  }, [playbackState.isPlaying, playbackState.currentTrack, controls]);

  const handleNext = useCallback(async () => {
    try {
      if (playbackState.canGoNext) {
        await controls.next();
        logger.trackEvent('music_next', {
          fromTrackId: playbackState.currentTrack?.id,
          shuffleEnabled: playbackState.shuffleEnabled,
          repeatMode: playbackState.repeatMode,
        });
      }
    } catch (error) {
      logger.error('usePlayback', 'Error playing next track', error instanceof Error ? error : undefined);
    }
  }, [playbackState.canGoNext, playbackState.currentTrack, playbackState.shuffleEnabled, playbackState.repeatMode, controls]);

  const handlePrevious = useCallback(async () => {
    try {
      if (playbackState.canGoPrevious) {
        await controls.previous();
        logger.trackEvent('music_previous', {
          fromTrackId: playbackState.currentTrack?.id,
          shuffleEnabled: playbackState.shuffleEnabled,
          repeatMode: playbackState.repeatMode,
        });
      }
    } catch (error) {
      logger.error('usePlayback', 'Error playing previous track', error instanceof Error ? error : undefined);
    }
  }, [playbackState.canGoPrevious, playbackState.currentTrack, playbackState.shuffleEnabled, playbackState.repeatMode, controls]);

  const handleSeek = useCallback(async (positionSeconds: number) => {
    try {
      await controls.seek(positionSeconds);
      logger.trackEvent('music_seek', {
        trackId: playbackState.currentTrack?.id,
        fromPosition: playbackState.position,
        toPosition: positionSeconds,
      });
    } catch (error) {
      logger.error('usePlayback', 'Error seeking', error instanceof Error ? error : undefined);
    }
  }, [playbackState.currentTrack, playbackState.position, controls]);

  const handleToggleShuffle = useCallback(async () => {
    try {
      controls.toggleShuffle();
      logger.trackEvent('music_shuffle_toggled', {
        enabled: !playbackState.shuffleEnabled,
        playlistLength: playbackState.currentTrack ? 1 : 0, // Will be updated by context
      });
    } catch (error) {
      logger.error('usePlayback', 'Error toggling shuffle', error instanceof Error ? error : undefined);
    }
  }, [playbackState.shuffleEnabled, controls]);

  const handleToggleRepeat = useCallback(async () => {
    try {
      controls.toggleRepeat();
      logger.trackEvent('music_repeat_toggled', {
        previousMode: playbackState.repeatMode,
        // New mode will be logged by the context
      });
    } catch (error) {
      logger.error('usePlayback', 'Error toggling repeat', error instanceof Error ? error : undefined);
    }
  }, [playbackState.repeatMode, controls]);

  return {
    // State (derived from context)
    playbackState,
    
    // Actions (optimized with useCallback)
    handlePlayPause,
    handleNext,
    handlePrevious,
    handleSeek,
    handleToggleShuffle,
    handleToggleRepeat,
    
    // Legacy compatibility (for existing components)
    handlePlay: handlePlayPause, // Alias for backward compatibility
  };
}
