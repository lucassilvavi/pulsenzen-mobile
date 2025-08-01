import { logger } from '../../../utils/logger';
import { MusicCategory, MusicTrack, Playlist } from '../types';
import AudioEngine, { AudioState } from './AudioEngine';
import MusicApiService from './MusicApiService';
import PlaylistManager, { RepeatMode } from './PlaylistManager';

/**
 * MusicService - Refactored music service using specialized components
 * 
 * This service acts as a facade over the AudioEngine and PlaylistManager,
 * providing a simplified interface for music operations.
 * 
 * Key improvements:
 * - Decomposed responsibilities
 * - Better error handling
 * - Proper resource cleanup
 * - Enhanced logging
 * - Performance optimizations
 */
export class MusicService {
  private audioEngine: AudioEngine;
  private playlistManager: PlaylistManager;
  private listeners = new Set<(state: any) => void>();
  private currentTrack: MusicTrack | null = null;
  private isInitialized = false;
  private isDestroyed = false; // Track if service has been destroyed
  private statusUpdateCallback: ((status: any) => void) | null = null;
  private cleanupPromise: Promise<void> | null = null;

  constructor() {
    this.audioEngine = new AudioEngine();
    this.playlistManager = new PlaylistManager();
    this.setupAudioEngineCallbacks();
    this.initialize();
  }

  private async initialize(): Promise<void> {
    if (this.isDestroyed) return;
    
    try {
      logger.info('MusicService', 'Initializing music service');
      this.isInitialized = true;
      logger.info('MusicService', 'Music service initialized successfully');
    } catch (error) {
      if (!this.isDestroyed) {
        logger.error('MusicService', 'Failed to initialize music service', error instanceof Error ? error : undefined);
      }
    }
  }

  private setupAudioEngineCallbacks(): void {
    // Store reference to callback for cleanup
    this.statusUpdateCallback = (status) => {
      if (this.isDestroyed) return; // Prevent callbacks after destruction
      
      // Notify all listeners with the current state
      this.notifyListeners();
      
      // Handle track completion
      if (status.state === AudioState.STOPPED && this.currentTrack) {
        this.handleTrackFinished();
      }
    };

    this.audioEngine.setOnStatusUpdate(this.statusUpdateCallback);
  }

  private async handleTrackFinished(): Promise<void> {
    if (this.isDestroyed) return; // Prevent operations after destruction
    
    logger.debug('MusicService', 'Track finished, handling repeat/next logic');
    
    const repeatMode = this.playlistManager.getRepeatMode();
    
    switch (repeatMode) {
      case 'one':
        // Repeat current track
        if (this.currentTrack && !this.isDestroyed) {
          await this.playTrack(this.currentTrack);
        }
        break;
      
      case 'all':
        // Go to next track or loop to beginning
        if (!this.isDestroyed && this.playlistManager.hasNext()) {
          await this.playNext();
        } else if (!this.isDestroyed && this.playlistManager.getPlaylist().length > 1) {
          // Loop to beginning
          const firstTrack = this.playlistManager.jumpToIndex(0);
          if (firstTrack && !this.isDestroyed) {
            await this.playTrack(firstTrack);
          }
        }
        break;
      
      case 'off':
      default:
        // Play next if available, otherwise stop
        if (!this.isDestroyed && this.playlistManager.hasNext()) {
          await this.playNext();
        } else if (!this.isDestroyed) {
          logger.info('MusicService', 'Reached end of playlist, stopping playback');
        }
        break;
    }
  }

  // Public API methods

  async playTrack(
    track: MusicTrack, 
    playlist?: MusicTrack[], 
    playlistName?: string, 
    playlistId?: string
  ): Promise<void> {
    if (this.isDestroyed) {
      throw new Error('MusicService has been destroyed');
    }

    logger.info('MusicService', 'Playing track', { 
      trackId: track.id, 
      title: track.title,
      hasPlaylist: !!playlist 
    });

    try {
      // Set up playlist if provided
      if (playlist && playlist.length > 0) {
        const trackIndex = playlist.findIndex(t => t.id === track.id);
        this.playlistManager.setPlaylist(playlist, Math.max(0, trackIndex));
      } else {
        // Single track playlist
        this.playlistManager.setPlaylist([track], 0);
      }

      // Check if still active before proceeding
      if (this.isDestroyed) {
        throw new Error('MusicService was destroyed during operation');
      }

      // Load and play the track
      await this.audioEngine.load(track);
      
      // Check again before playing
      if (this.isDestroyed) {
        throw new Error('MusicService was destroyed during operation');
      }
      
      await this.audioEngine.play();
      
      this.currentTrack = track;
      this.notifyListeners();
      
      logger.trackEvent('music_track_played', {
        trackId: track.id,
        title: track.title,
        artist: track.artist,
        playlistLength: playlist?.length || 1,
        playlistName,
        playlistId,
      });

    } catch (error) {
      if (!this.isDestroyed) {
        logger.error('MusicService', 'Failed to play track', error instanceof Error ? error : undefined, {
          trackId: track.id,
          title: track.title,
        });
      }
      throw error;
    }
  }

  async pauseTrack(from: 'player' | 'miniPlayer' = 'player'): Promise<void> {
    try {
      await this.audioEngine.pause();
      this.notifyListeners();
      
      logger.trackEvent('music_paused', {
        trackId: this.currentTrack?.id,
        from,
        position: this.audioEngine.getStatus().position,
      });
    } catch (error) {
      logger.error('MusicService', 'Failed to pause track', error instanceof Error ? error : undefined);
      throw error;
    }
  }

  async resumeTrack(): Promise<void> {
    try {
      await this.audioEngine.play();
      this.notifyListeners();
      
      logger.trackEvent('music_resumed', {
        trackId: this.currentTrack?.id,
        position: this.audioEngine.getStatus().position,
      });
    } catch (error) {
      logger.error('MusicService', 'Failed to resume track', error instanceof Error ? error : undefined);
      throw error;
    }
  }

  async stopTrack(): Promise<void> {
    try {
      await this.audioEngine.stop();
      this.notifyListeners();
      
      logger.trackEvent('music_stopped', {
        trackId: this.currentTrack?.id,
      });
    } catch (error) {
      logger.error('MusicService', 'Failed to stop track', error instanceof Error ? error : undefined);
      throw error;
    }
  }

  async seekTo(positionMillis: number): Promise<void> {
    try {
      const positionSeconds = Math.floor(positionMillis / 1000);
      await this.audioEngine.seek(positionSeconds);
      this.notifyListeners();
      
      logger.trackEvent('music_seek', {
        trackId: this.currentTrack?.id,
        position: positionSeconds,
      });
    } catch (error) {
      logger.error('MusicService', 'Failed to seek', error instanceof Error ? error : undefined);
      throw error;
    }
  }

  async playNext(): Promise<void> {
    try {
      const nextTrack = this.playlistManager.next();
      if (nextTrack) {
        await this.audioEngine.load(nextTrack);
        await this.audioEngine.play();
        this.currentTrack = nextTrack;
        this.notifyListeners();
        
        logger.trackEvent('music_next', {
          trackId: nextTrack.id,
          shuffleEnabled: this.playlistManager.isShuffleEnabled(),
          repeatMode: this.playlistManager.getRepeatMode(),
        });
      } else {
        logger.debug('MusicService', 'No next track available');
      }
    } catch (error) {
      logger.error('MusicService', 'Failed to play next track', error instanceof Error ? error : undefined);
      throw error;
    }
  }

  async playPrevious(): Promise<void> {
    try {
      const previousTrack = this.playlistManager.previous();
      if (previousTrack) {
        await this.audioEngine.load(previousTrack);
        await this.audioEngine.play();
        this.currentTrack = previousTrack;
        this.notifyListeners();
        
        logger.trackEvent('music_previous', {
          trackId: previousTrack.id,
          shuffleEnabled: this.playlistManager.isShuffleEnabled(),
          repeatMode: this.playlistManager.getRepeatMode(),
        });
      } else {
        logger.debug('MusicService', 'No previous track available');
      }
    } catch (error) {
      logger.error('MusicService', 'Failed to play previous track', error instanceof Error ? error : undefined);
      throw error;
    }
  }

  toggleShuffle(): boolean {
    const newState = !this.playlistManager.isShuffleEnabled();
    this.playlistManager.setShuffle(newState);
    this.notifyListeners();
    
    logger.trackEvent('music_shuffle_toggled', {
      enabled: newState,
      playlistLength: this.playlistManager.getPlaylist().length,
    });
    
    return newState;
  }

  toggleRepeat(): RepeatMode {
    const modes: RepeatMode[] = ['off', 'all', 'one'];
    const currentMode = this.playlistManager.getRepeatMode();
    const currentIndex = modes.indexOf(currentMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    
    this.playlistManager.setRepeatMode(nextMode);
    this.notifyListeners();
    
    logger.trackEvent('music_repeat_toggled', {
      previousMode: currentMode,
      newMode: nextMode,
    });
    
    return nextMode;
  }

  // State getters
  getPlaybackState(): any {
    const audioStatus = this.audioEngine.getStatus();
    const playlist = this.playlistManager.getPlaylist();
    
    return {
      isPlaying: audioStatus.state === AudioState.PLAYING,
      currentTrack: this.currentTrack,
      position: audioStatus.position,
      duration: audioStatus.duration,
      isLoading: audioStatus.state === AudioState.LOADING,
      repeatMode: this.playlistManager.getRepeatMode(),
      shuffleMode: this.playlistManager.isShuffleEnabled(),
      currentPlaylist: playlist,
      playlistName: undefined, // Will be managed by context
      playlistId: undefined,   // Will be managed by context
      pausedFrom: null,
      isBuffering: audioStatus.isBuffering,
    };
  }

  getCurrentTrack(): MusicTrack | null {
    return this.currentTrack;
  }

  getCurrentPlaylist(): MusicTrack[] {
    return this.playlistManager.getPlaylist();
  }

  // Listener management
  addPlaybackListener(listener: (state: any) => void): () => void {
    if (this.isDestroyed) {
      // Return no-op cleanup function if service is destroyed
      return () => {};
    }
    
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    if (this.isDestroyed) return; // Prevent notifications after destruction
    
    const state = this.getPlaybackState();
    
    // Create a copy of listeners set to avoid issues if listeners are modified during iteration
    const listenersCopy = Array.from(this.listeners);
    
    listenersCopy.forEach(listener => {
      try {
        listener(state);
      } catch (error) {
        logger.error('MusicService', 'Error in playback listener', error instanceof Error ? error : undefined);
        // Remove problematic listener to prevent future errors
        this.listeners.delete(listener);
      }
    });
  }

  // Data fetching (delegated to API service)
  async getAllTracks(): Promise<MusicTrack[]> {
    try {
      const result = await MusicApiService.searchTracks({});
      return result.tracks;
    } catch (error) {
      logger.error('MusicService', 'Failed to get all tracks', error instanceof Error ? error : undefined);
      throw error;
    }
  }

  async getTracksByCategory(categoryId: string): Promise<MusicTrack[]> {
    try {
      return await MusicApiService.getTracksByCategory(categoryId);
    } catch (error) {
      logger.error('MusicService', 'Failed to get tracks by category', error instanceof Error ? error : undefined);
      throw error;
    }
  }

  async getCategories(): Promise<MusicCategory[]> {
    try {
      return await MusicApiService.getCategories();
    } catch (error) {
      logger.error('MusicService', 'Failed to get categories', error instanceof Error ? error : undefined);
      throw error;
    }
  }

  async getPlaylists(): Promise<Playlist[]> {
    try {
      return await MusicApiService.getPlaylists();
    } catch (error) {
      logger.error('MusicService', 'Failed to get playlists', error instanceof Error ? error : undefined);
      throw error;
    }
  }

  async getPlaylist(playlistId: string): Promise<Playlist | null> {
    try {
      return await MusicApiService.getPlaylist(playlistId);
    } catch (error) {
      logger.error('MusicService', 'Failed to get playlist', error instanceof Error ? error : undefined);
      throw error;
    }
  }

  // Sharing functionality
  async shareCurrentTrack(): Promise<boolean> {
    if (!this.currentTrack) {
      logger.warn('MusicService', 'Cannot share: no current track');
      return false;
    }

    try {
      const Share = await import('react-native').then(rn => rn.Share);
      
      const shareContent = {
        message: `🎵 Escutando "${this.currentTrack.title}" ${this.currentTrack.artist ? `de ${this.currentTrack.artist}` : ''} no PulseZen\n\nBaixe o PulseZen e desfrute de músicas relaxantes para meditação, sono e bem-estar! 🧘‍♀️✨`,
        title: `${this.currentTrack.title} - PulseZen`
      };

      await Share.share(shareContent);
      
      logger.trackEvent('music_shared', {
        trackId: this.currentTrack.id,
        title: this.currentTrack.title,
        artist: this.currentTrack.artist,
      });
      
      return true;
    } catch (error) {
      logger.error('MusicService', 'Failed to share track', error instanceof Error ? error : undefined);
      return false;
    }
  }

  // Cleanup
  async stopAndClearMusic(): Promise<void> {
    try {
      await this.audioEngine.stop();
      this.playlistManager.clear();
      this.currentTrack = null;
      this.notifyListeners();
      
      logger.info('MusicService', 'Music stopped and cleared');
    } catch (error) {
      logger.error('MusicService', 'Failed to stop and clear music', error instanceof Error ? error : undefined);
    }
  }

  async cleanup(): Promise<void> {
    // Prevent multiple cleanup calls
    if (this.cleanupPromise) {
      return this.cleanupPromise;
    }

    this.cleanupPromise = this._performCleanup();
    return this.cleanupPromise;
  }

  private async _performCleanup(): Promise<void> {
    if (this.isDestroyed) {
      return; // Already cleaned up
    }

    try {
      logger.info('MusicService', 'Cleaning up music service');
      
      // Mark as destroyed to prevent further operations
      this.isDestroyed = true;
      
      // Stop audio playback first
      try {
        await this.audioEngine.stop();
      } catch (error) {
        logger.error('MusicService', 'Error stopping audio during cleanup', error instanceof Error ? error : undefined);
      }
      
      // Clean up audio engine
      try {
        await this.audioEngine.cleanup();
      } catch (error) {
        logger.error('MusicService', 'Error cleaning up audio engine', error instanceof Error ? error : undefined);
      }
      
      // Clear playlist manager
      try {
        this.playlistManager.clear();
      } catch (error) {
        logger.error('MusicService', 'Error clearing playlist manager', error instanceof Error ? error : undefined);
      }
      
      // Clear all listeners
      this.listeners.clear();
      
      // Clear callback reference
      this.statusUpdateCallback = null;
      
      // Clear current track reference
      this.currentTrack = null;
      
      // Mark as not initialized
      this.isInitialized = false;
      
      logger.info('MusicService', 'Music service cleanup completed');
    } catch (error) {
      logger.error('MusicService', 'Error during cleanup', error instanceof Error ? error : undefined);
    }
  }

  // Check if service is still active
  isActive(): boolean {
    return this.isInitialized && !this.isDestroyed;
  }
}

// Export singleton instance
export default new MusicService();
