import { Audio } from 'expo-av';
import { logger } from '../../../utils/logger';
import { MusicTrack } from '../types';

export enum AudioState {
  IDLE = 'idle',
  LOADING = 'loading',
  LOADED = 'loaded',
  PLAYING = 'playing',
  PAUSED = 'paused',
  STOPPED = 'stopped',
  ERROR = 'error',
}

export interface AudioStatus {
  state: AudioState;
  position: number; // in seconds
  duration: number; // in seconds
  isBuffering: boolean;
}

export interface IAudioEngine {
  load(track: MusicTrack): Promise<void>;
  play(): Promise<void>;
  pause(): Promise<void>;
  stop(): Promise<void>;
  seek(positionSeconds: number): Promise<void>;
  getStatus(): AudioStatus;
  setOnStatusUpdate(callback: (status: AudioStatus) => void): void;
  cleanup(): Promise<void>;
}

export type StatusUpdateCallback = (status: AudioStatus) => void;

/**
 * AudioEngine - Specialized service for audio playback management
 * 
 * Responsibilities:
 * - Audio loading and unloading
 * - Playback controls (play, pause, stop, seek)
 * - Status monitoring and callbacks
 * - Resource cleanup
 * - Error handling for audio operations
 */
export class AudioEngine implements IAudioEngine {
  private sound: Audio.Sound | null = null;
  private currentTrack: MusicTrack | null = null;
  private statusCallback?: StatusUpdateCallback;
  private statusUpdateInterval?: number;
  private internalStatus: AudioStatus = {
    state: AudioState.IDLE,
    position: 0,
    duration: 0,
    isBuffering: false,
  };

  constructor() {
    this.initializeAudio();
  }

  private async initializeAudio(): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      
      logger.info('AudioEngine', 'Audio mode configured successfully');
    } catch (error) {
      logger.error('AudioEngine', 'Failed to setup audio mode', error instanceof Error ? error : undefined);
    }
  }

  async load(track: MusicTrack): Promise<void> {
    logger.info('AudioEngine', 'Loading track', { trackId: track.id, title: track.title });
    
    try {
      // Always cleanup previous audio first
      await this.cleanup();
      
      this.setState(AudioState.LOADING);
      this.currentTrack = track;

      const { sound } = await Audio.Sound.createAsync(
        track.uri,
        {
          shouldPlay: false,
          isLooping: false,
          progressUpdateIntervalMillis: 500,
        }
      );

      if (!sound) {
        throw new Error('Failed to create audio sound object');
      }

      this.sound = sound;

      // Set up status update callback
      this.sound.setOnPlaybackStatusUpdate(this.handleStatusUpdate.bind(this));

      // Get initial status to set duration
      const initialStatus = await this.sound.getStatusAsync();
      if (initialStatus.isLoaded && initialStatus.durationMillis) {
        this.internalStatus.duration = Math.floor(initialStatus.durationMillis / 1000);
      }

      this.setState(AudioState.LOADED);
      
      logger.info('AudioEngine', 'Track loaded successfully', {
        trackId: track.id,
        duration: this.internalStatus.duration,
      });

    } catch (error) {
      this.setState(AudioState.ERROR);
      logger.error('AudioEngine', 'Failed to load track', error instanceof Error ? error : undefined, { trackId: track.id });
      throw error;
    }
  }

  async play(): Promise<void> {
    if (!this.sound || this.internalStatus.state === AudioState.ERROR) {
      throw new Error('No audio loaded or audio in error state');
    }

    try {
      logger.debug('AudioEngine', 'Starting playback');
      
      await this.sound.playAsync();
      this.setState(AudioState.PLAYING);
      this.startStatusUpdates();
      
      logger.info('AudioEngine', 'Playback started', { trackId: this.currentTrack?.id });
    } catch (error) {
      this.setState(AudioState.ERROR);
      logger.error('AudioEngine', 'Failed to start playback', error instanceof Error ? error : undefined);
      throw error;
    }
  }

  async pause(): Promise<void> {
    if (!this.sound) return;

    try {
      logger.debug('AudioEngine', 'Pausing playback');
      
      await this.sound.pauseAsync();
      this.setState(AudioState.PAUSED);
      this.stopStatusUpdates();
      
      logger.info('AudioEngine', 'Playback paused', { trackId: this.currentTrack?.id });
    } catch (error) {
      logger.error('AudioEngine', 'Failed to pause playback', error instanceof Error ? error : undefined);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.sound) return;

    try {
      logger.debug('AudioEngine', 'Stopping playback');
      
      await this.sound.stopAsync();
      this.setState(AudioState.STOPPED);
      this.stopStatusUpdates();
      this.internalStatus.position = 0;
      
      logger.info('AudioEngine', 'Playback stopped', { trackId: this.currentTrack?.id });
    } catch (error) {
      logger.error('AudioEngine', 'Failed to stop playback', error instanceof Error ? error : undefined);
      throw error;
    }
  }

  async seek(positionSeconds: number): Promise<void> {
    if (!this.sound) {
      throw new Error('No audio loaded');
    }

    try {
      logger.debug('AudioEngine', 'Seeking to position', { position: positionSeconds });
      
      const positionMillis = positionSeconds * 1000;
      await this.sound.setPositionAsync(positionMillis);
      
      this.internalStatus.position = positionSeconds;
      this.notifyStatusUpdate();
      
      logger.info('AudioEngine', 'Seek completed', { 
        trackId: this.currentTrack?.id,
        position: positionSeconds 
      });
    } catch (error) {
      logger.error('AudioEngine', 'Failed to seek', error instanceof Error ? error : undefined, { position: positionSeconds });
      throw error;
    }
  }

  getStatus(): AudioStatus {
    return { ...this.internalStatus };
  }

  setOnStatusUpdate(callback: StatusUpdateCallback): void {
    this.statusCallback = callback;
  }

  private setState(state: AudioState): void {
    const previousState = this.internalStatus.state;
    this.internalStatus.state = state;
    
    if (previousState !== state) {
      logger.debug('AudioEngine', 'State changed', { 
        from: previousState, 
        to: state,
        trackId: this.currentTrack?.id 
      });
      this.notifyStatusUpdate();
    }
  }

  private handleStatusUpdate(status: any): void {
    if (!status || !this.sound) return;

    try {
      if (status.isLoaded) {
        const position = Math.floor((status.positionMillis || 0) / 1000);
        const duration = Math.floor((status.durationMillis || 0) / 1000);
        const isBuffering = status.isBuffering || false;

        // Only update if there are significant changes
        const hasChanges = 
          position !== this.internalStatus.position ||
          duration !== this.internalStatus.duration ||
          isBuffering !== this.internalStatus.isBuffering;

        if (hasChanges) {
          this.internalStatus.position = position;
          this.internalStatus.duration = duration;
          this.internalStatus.isBuffering = isBuffering;
          this.notifyStatusUpdate();
        }

        // Handle track completion
        if (status.didJustFinish && this.internalStatus.state === AudioState.PLAYING) {
          this.setState(AudioState.STOPPED);
          logger.info('AudioEngine', 'Track finished', { trackId: this.currentTrack?.id });
        }
      } else if (status.error) {
        this.setState(AudioState.ERROR);
        logger.error('AudioEngine', 'Audio playback error', new Error(status.error));
      }
    } catch (error) {
      logger.error('AudioEngine', 'Error handling status update', error instanceof Error ? error : undefined);
    }
  }

  private startStatusUpdates(): void {
    this.stopStatusUpdates(); // Prevent multiple intervals
    
    this.statusUpdateInterval = setInterval(async () => {
      if (this.sound && this.internalStatus.state === AudioState.PLAYING) {
        try {
          const status = await this.sound.getStatusAsync();
          this.handleStatusUpdate(status);
        } catch (error) {
          logger.error('AudioEngine', 'Error getting status in interval', error instanceof Error ? error : undefined);
        }
      }
    }, 1000) as unknown as number;
  }

  private stopStatusUpdates(): void {
    if (this.statusUpdateInterval) {
      clearInterval(this.statusUpdateInterval);
      this.statusUpdateInterval = undefined;
    }
  }

  private notifyStatusUpdate(): void {
    if (this.statusCallback) {
      try {
        this.statusCallback(this.getStatus());
      } catch (error) {
        logger.error('AudioEngine', 'Error in status callback', error instanceof Error ? error : undefined);
      }
    }
  }

  async cleanup(): Promise<void> {
    logger.debug('AudioEngine', 'Cleaning up audio resources');
    
    try {
      this.stopStatusUpdates();
      
      if (this.sound) {
        // Remove callback first to prevent additional events
        this.sound.setOnPlaybackStatusUpdate(null);
        
        // Unload the sound
        await this.sound.unloadAsync();
        this.sound = null;
      }
      
      this.currentTrack = null;
      this.statusCallback = undefined;
      this.internalStatus = {
        state: AudioState.IDLE,
        position: 0,
        duration: 0,
        isBuffering: false,
      };
      
      logger.info('AudioEngine', 'Audio cleanup completed');
    } catch (error) {
      logger.error('AudioEngine', 'Error during cleanup', error instanceof Error ? error : undefined);
      // Don't throw on cleanup errors, just log them
    }
  }
}

export default AudioEngine;
