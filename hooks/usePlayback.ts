import { useState, useEffect, useCallback } from 'react';
import musicService from '@/services/musicService';
import { PlaybackState } from '@/types/music';

export default function usePlayback() {
  const [playbackState, setPlaybackState] = useState<PlaybackState>(
    musicService.getPlaybackState()
  );

  useEffect(() => {
    const unsubscribe = musicService.addPlaybackListener(setPlaybackState);
    return unsubscribe;
  }, []);

  const handlePlayPause = useCallback(async () => {
    try {
      if (playbackState.isPlaying) {
        await musicService.pauseTrack();
      } else {
        if (playbackState.currentTrack) {
          await musicService.resumeTrack();
        }
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  }, [playbackState.isPlaying, playbackState.currentTrack]);

  const handleNext = useCallback(async () => {
    try {
      await musicService.playNext();
    } catch (error) {
      console.error('Error playing next track:', error);
    }
  }, []);

  const handlePrevious = useCallback(async () => {
    try {
      await musicService.playPrevious();
    } catch (error) {
      console.error('Error playing previous track:', error);
    }
  }, []);

  return {
    playbackState,
    handlePlayPause,
    handleNext,
    handlePrevious
  };
}
