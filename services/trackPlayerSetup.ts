// Configuração do TrackPlayer para ser usada quando necessário
import TrackPlayer, { Capability } from 'react-native-track-player';

export const setupTrackPlayer = async () => {
  try {
    await TrackPlayer.setupPlayer({
      maxCacheSize: 1024 * 10, // 10 MB
    });

    await TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.SeekTo,
      ],
      
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
      ],

      notificationCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
      ],

      stoppingAppPausesPlayback: false,
    });

    console.log('TrackPlayer setup complete');
  } catch (error) {
    console.error('TrackPlayer setup failed:', error);
  }
};

export const registerPlaybackService = () => {
  TrackPlayer.registerPlaybackService(() => require('./playbackService'));
};
