import { logger } from '../../../utils/logger';
import { MusicTrack } from '../types';

export interface IPlaylistManager {
  setPlaylist(tracks: MusicTrack[], currentIndex?: number): void;
  getCurrentTrack(): MusicTrack | null;
  getCurrentIndex(): number;
  getPlaylist(): MusicTrack[];
  hasNext(): boolean;
  hasPrevious(): boolean;
  next(): MusicTrack | null;
  previous(): MusicTrack | null;
  jumpToIndex(index: number): MusicTrack | null;
  setShuffle(enabled: boolean): void;
  isShuffleEnabled(): boolean;
  setRepeatMode(mode: RepeatMode): void;
  getRepeatMode(): RepeatMode;
  addTrack(track: MusicTrack): void;
  removeTrack(trackId: string): boolean;
  clear(): void;
}

export type RepeatMode = 'off' | 'one' | 'all';

/**
 * PlaylistManager - Specialized service for playlist management
 * 
 * Responsibilities:
 * - Playlist track management
 * - Navigation (next, previous, jump to index)
 * - Shuffle functionality
 * - Repeat mode handling
 * - Track ordering and indexing
 */
export class PlaylistManager implements IPlaylistManager {
  private originalPlaylist: MusicTrack[] = [];
  private currentPlaylist: MusicTrack[] = [];
  private currentIndex: number = 0;
  private shuffleEnabled: boolean = false;
  private repeatMode: RepeatMode = 'off';

  constructor() {
    logger.debug('PlaylistManager', 'PlaylistManager initialized');
  }

  setPlaylist(tracks: MusicTrack[], currentIndex: number = 0): void {
    logger.info('PlaylistManager', 'Setting new playlist', {
      trackCount: tracks.length,
      currentIndex,
    });

    this.originalPlaylist = [...tracks];
    this.currentPlaylist = this.shuffleEnabled ? this.shuffleArray([...tracks]) : [...tracks];
    
    // Adjust current index based on shuffle state
    if (this.shuffleEnabled && tracks.length > 0) {
      // In shuffle mode, find the current track in the shuffled playlist
      const currentTrack = tracks[currentIndex];
      if (currentTrack) {
        const shuffledIndex = this.currentPlaylist.findIndex(track => track.id === currentTrack.id);
        this.currentIndex = shuffledIndex >= 0 ? shuffledIndex : 0;
      } else {
        this.currentIndex = 0;
      }
    } else {
      this.currentIndex = Math.max(0, Math.min(currentIndex, tracks.length - 1));
    }

    logger.debug('PlaylistManager', 'Playlist set successfully', {
      originalCount: this.originalPlaylist.length,
      currentCount: this.currentPlaylist.length,
      currentIndex: this.currentIndex,
      shuffleEnabled: this.shuffleEnabled,
    });
  }

  getCurrentTrack(): MusicTrack | null {
    if (this.currentPlaylist.length === 0 || this.currentIndex < 0 || this.currentIndex >= this.currentPlaylist.length) {
      return null;
    }
    return this.currentPlaylist[this.currentIndex];
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }

  getPlaylist(): MusicTrack[] {
    return [...this.currentPlaylist];
  }

  hasNext(): boolean {
    if (this.currentPlaylist.length <= 1) return false;
    
    switch (this.repeatMode) {
      case 'off':
        return this.currentIndex < this.currentPlaylist.length - 1;
      case 'one':
      case 'all':
        return true;
      default:
        return false;
    }
  }

  hasPrevious(): boolean {
    if (this.currentPlaylist.length <= 1) return false;
    
    switch (this.repeatMode) {
      case 'off':
        return this.currentIndex > 0;
      case 'one':
      case 'all':
        return true;
      default:
        return false;
    }
  }

  next(): MusicTrack | null {
    if (this.currentPlaylist.length === 0) {
      logger.warn('PlaylistManager', 'Cannot navigate next: empty playlist');
      return null;
    }

    if (this.currentPlaylist.length === 1) {
      // Only one track - behavior depends on repeat mode
      switch (this.repeatMode) {
        case 'one':
        case 'all':
          logger.debug('PlaylistManager', 'Single track: staying on current (repeat mode)');
          return this.getCurrentTrack();
        case 'off':
        default:
          logger.debug('PlaylistManager', 'Single track: no next available');
          return null;
      }
    }

    let nextIndex: number;

    if (this.shuffleEnabled) {
      // In shuffle mode, pick a random track different from current
      const availableIndices = this.currentPlaylist
        .map((_, index) => index)
        .filter(index => index !== this.currentIndex);
      
      if (availableIndices.length === 0) {
        nextIndex = this.currentIndex; // Fallback to current
      } else {
        nextIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      }
    } else {
      // Normal mode navigation
      switch (this.repeatMode) {
        case 'off':
          if (this.currentIndex >= this.currentPlaylist.length - 1) {
            logger.debug('PlaylistManager', 'End of playlist reached (no repeat)');
            return null;
          }
          nextIndex = this.currentIndex + 1;
          break;
        case 'one':
          // Stay on current track
          nextIndex = this.currentIndex;
          break;
        case 'all':
          // Loop to beginning if at end
          nextIndex = (this.currentIndex + 1) % this.currentPlaylist.length;
          break;
        default:
          return null;
      }
    }

    this.currentIndex = nextIndex;
    const nextTrack = this.getCurrentTrack();
    
    logger.info('PlaylistManager', 'Navigated to next track', {
      newIndex: this.currentIndex,
      trackId: nextTrack?.id,
      shuffleEnabled: this.shuffleEnabled,
      repeatMode: this.repeatMode,
    });

    return nextTrack;
  }

  previous(): MusicTrack | null {
    if (this.currentPlaylist.length === 0) {
      logger.warn('PlaylistManager', 'Cannot navigate previous: empty playlist');
      return null;
    }

    if (this.currentPlaylist.length === 1) {
      // Only one track - behavior depends on repeat mode
      switch (this.repeatMode) {
        case 'one':
        case 'all':
          logger.debug('PlaylistManager', 'Single track: staying on current (repeat mode)');
          return this.getCurrentTrack();
        case 'off':
        default:
          logger.debug('PlaylistManager', 'Single track: no previous available');
          return null;
      }
    }

    let previousIndex: number;

    if (this.shuffleEnabled) {
      // In shuffle mode, pick a random track different from current
      const availableIndices = this.currentPlaylist
        .map((_, index) => index)
        .filter(index => index !== this.currentIndex);
      
      if (availableIndices.length === 0) {
        previousIndex = this.currentIndex; // Fallback to current
      } else {
        previousIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      }
    } else {
      // Normal mode navigation
      switch (this.repeatMode) {
        case 'off':
          if (this.currentIndex <= 0) {
            logger.debug('PlaylistManager', 'Beginning of playlist reached (no repeat)');
            return null;
          }
          previousIndex = this.currentIndex - 1;
          break;
        case 'one':
          // Stay on current track
          previousIndex = this.currentIndex;
          break;
        case 'all':
          // Loop to end if at beginning
          previousIndex = this.currentIndex === 0 ? this.currentPlaylist.length - 1 : this.currentIndex - 1;
          break;
        default:
          return null;
      }
    }

    this.currentIndex = previousIndex;
    const previousTrack = this.getCurrentTrack();
    
    logger.info('PlaylistManager', 'Navigated to previous track', {
      newIndex: this.currentIndex,
      trackId: previousTrack?.id,
      shuffleEnabled: this.shuffleEnabled,
      repeatMode: this.repeatMode,
    });

    return previousTrack;
  }

  jumpToIndex(index: number): MusicTrack | null {
    if (index < 0 || index >= this.currentPlaylist.length) {
      logger.warn('PlaylistManager', 'Invalid index for jump', { index, playlistLength: this.currentPlaylist.length });
      return null;
    }

    const previousIndex = this.currentIndex;
    this.currentIndex = index;
    const track = this.getCurrentTrack();
    
    logger.info('PlaylistManager', 'Jumped to index', {
      fromIndex: previousIndex,
      toIndex: index,
      trackId: track?.id,
    });

    return track;
  }

  setShuffle(enabled: boolean): void {
    if (this.shuffleEnabled === enabled) return;

    logger.info('PlaylistManager', 'Changing shuffle mode', { from: this.shuffleEnabled, to: enabled });

    const currentTrack = this.getCurrentTrack();
    this.shuffleEnabled = enabled;

    if (enabled) {
      // Enable shuffle: randomize playlist but keep current track at current position
      if (currentTrack) {
        const otherTracks = this.originalPlaylist.filter(track => track.id !== currentTrack.id);
        const shuffledOthers = this.shuffleArray(otherTracks);
        this.currentPlaylist = [currentTrack, ...shuffledOthers];
        this.currentIndex = 0; // Current track is now at the beginning
      } else {
        this.currentPlaylist = this.shuffleArray([...this.originalPlaylist]);
      }
    } else {
      // Disable shuffle: restore original order
      this.currentPlaylist = [...this.originalPlaylist];
      if (currentTrack) {
        // Find the current track in the original playlist
        const originalIndex = this.originalPlaylist.findIndex(track => track.id === currentTrack.id);
        this.currentIndex = originalIndex >= 0 ? originalIndex : 0;
      }
    }

    logger.debug('PlaylistManager', 'Shuffle mode applied', {
      shuffleEnabled: this.shuffleEnabled,
      newIndex: this.currentIndex,
      playlistLength: this.currentPlaylist.length,
    });
  }

  isShuffleEnabled(): boolean {
    return this.shuffleEnabled;
  }

  setRepeatMode(mode: RepeatMode): void {
    if (this.repeatMode === mode) return;

    logger.info('PlaylistManager', 'Changing repeat mode', { from: this.repeatMode, to: mode });
    this.repeatMode = mode;
  }

  getRepeatMode(): RepeatMode {
    return this.repeatMode;
  }

  addTrack(track: MusicTrack): void {
    logger.info('PlaylistManager', 'Adding track to playlist', { trackId: track.id });

    // Add to both playlists
    this.originalPlaylist.push(track);
    
    if (this.shuffleEnabled) {
      // In shuffle mode, add at random position
      const randomIndex = Math.floor(Math.random() * (this.currentPlaylist.length + 1));
      this.currentPlaylist.splice(randomIndex, 0, track);
      
      // Adjust current index if insertion affects it
      if (randomIndex <= this.currentIndex) {
        this.currentIndex++;
      }
    } else {
      // In normal mode, add at end
      this.currentPlaylist.push(track);
    }

    logger.debug('PlaylistManager', 'Track added successfully', {
      trackId: track.id,
      newPlaylistLength: this.currentPlaylist.length,
      currentIndex: this.currentIndex,
    });
  }

  removeTrack(trackId: string): boolean {
    logger.info('PlaylistManager', 'Removing track from playlist', { trackId });

    const originalIndex = this.originalPlaylist.findIndex(track => track.id === trackId);
    const currentIndex = this.currentPlaylist.findIndex(track => track.id === trackId);

    if (originalIndex === -1 || currentIndex === -1) {
      logger.warn('PlaylistManager', 'Track not found for removal', { trackId });
      return false;
    }

    // Remove from both playlists
    this.originalPlaylist.splice(originalIndex, 1);
    this.currentPlaylist.splice(currentIndex, 1);

    // Adjust current index
    if (currentIndex < this.currentIndex) {
      this.currentIndex--;
    } else if (currentIndex === this.currentIndex) {
      // Current track was removed
      if (this.currentIndex >= this.currentPlaylist.length) {
        this.currentIndex = Math.max(0, this.currentPlaylist.length - 1);
      }
    }

    logger.debug('PlaylistManager', 'Track removed successfully', {
      trackId,
      newPlaylistLength: this.currentPlaylist.length,
      currentIndex: this.currentIndex,
    });

    return true;
  }

  clear(): void {
    logger.info('PlaylistManager', 'Clearing playlist');

    this.originalPlaylist = [];
    this.currentPlaylist = [];
    this.currentIndex = 0;
    this.shuffleEnabled = false;
    this.repeatMode = 'off';

    logger.debug('PlaylistManager', 'Playlist cleared successfully');
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

export default PlaylistManager;
