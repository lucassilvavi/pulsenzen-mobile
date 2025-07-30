import React, { createContext, ReactNode, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { logger } from '../../../utils/logger';
import AudioEngine, { AudioState, AudioStatus } from '../services/AudioEngine';
import PlaylistManager, { RepeatMode } from '../services/PlaylistManager';
import { MusicTrack } from '../types';

// Enhanced state interface
export interface MusicState {
  // Playback state
  currentTrack: MusicTrack | null;
  audioState: AudioState;
  position: number; // in seconds
  duration: number; // in seconds
  isBuffering: boolean;
  
  // Playlist state
  playlist: MusicTrack[];
  currentIndex: number;
  hasNext: boolean;
  hasPrevious: boolean;
  
  // Control state
  shuffleEnabled: boolean;
  repeatMode: RepeatMode;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Metadata
  playlistName?: string;
  playlistId?: string;
}

// Action types
export type MusicAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CURRENT_TRACK'; payload: MusicTrack | null }
  | { type: 'SET_AUDIO_STATUS'; payload: AudioStatus }
  | { type: 'SET_PLAYLIST'; payload: { tracks: MusicTrack[]; currentIndex?: number; name?: string; id?: string } }
  | { type: 'SET_CURRENT_INDEX'; payload: number }
  | { type: 'SET_SHUFFLE'; payload: boolean }
  | { type: 'SET_REPEAT_MODE'; payload: RepeatMode }
  | { type: 'UPDATE_NAVIGATION'; payload: { hasNext: boolean; hasPrevious: boolean } }
  | { type: 'CLEAR_STATE' };

// Initial state
const initialState: MusicState = {
  currentTrack: null,
  audioState: AudioState.IDLE,
  position: 0,
  duration: 0,
  isBuffering: false,
  playlist: [],
  currentIndex: 0,
  hasNext: false,
  hasPrevious: false,
  shuffleEnabled: false,
  repeatMode: 'off',
  isLoading: false,
  error: null,
};

// Reducer
function musicReducer(state: MusicState, action: MusicAction): MusicState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SET_CURRENT_TRACK':
      return { ...state, currentTrack: action.payload };
    
    case 'SET_AUDIO_STATUS':
      return {
        ...state,
        audioState: action.payload.state,
        position: action.payload.position,
        duration: action.payload.duration,
        isBuffering: action.payload.isBuffering,
      };
    
    case 'SET_PLAYLIST':
      return {
        ...state,
        playlist: action.payload.tracks,
        currentIndex: action.payload.currentIndex ?? 0,
        playlistName: action.payload.name,
        playlistId: action.payload.id,
      };
    
    case 'SET_CURRENT_INDEX':
      return { ...state, currentIndex: action.payload };
    
    case 'SET_SHUFFLE':
      return { ...state, shuffleEnabled: action.payload };
    
    case 'SET_REPEAT_MODE':
      return { ...state, repeatMode: action.payload };
    
    case 'UPDATE_NAVIGATION':
      return {
        ...state,
        hasNext: action.payload.hasNext,
        hasPrevious: action.payload.hasPrevious,
      };
    
    case 'CLEAR_STATE':
      return { ...initialState };
    
    default:
      return state;
  }
}

// Context interface
export interface MusicContextType {
  state: MusicState;
  actions: {
    // Playback controls
    play: (track: MusicTrack, playlist?: MusicTrack[], playlistName?: string, playlistId?: string) => Promise<void>;
    pause: () => Promise<void>;
    resume: () => Promise<void>;
    stop: () => Promise<void>;
    seek: (positionSeconds: number) => Promise<void>;
    
    // Navigation
    next: () => Promise<void>;
    previous: () => Promise<void>;
    jumpToIndex: (index: number) => Promise<void>;
    
    // Playlist management
    setPlaylist: (tracks: MusicTrack[], currentIndex?: number, name?: string, id?: string) => void;
    addToPlaylist: (track: MusicTrack) => void;
    removeFromPlaylist: (trackId: string) => void;
    clearPlaylist: () => void;
    
    // Control modes
    toggleShuffle: () => void;
    toggleRepeat: () => void;
    
    // Utility
    clearError: () => void;
    reset: () => Promise<void>;
  };
}

// Create context
const MusicContext = createContext<MusicContextType | null>(null);

// Provider component
export const MusicProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(musicReducer, initialState);
  const audioEngine = useRef<AudioEngine>(new AudioEngine());
  const playlistManager = useRef<PlaylistManager>(new PlaylistManager());

  // Setup audio status updates
  useEffect(() => {
    const engine = audioEngine.current;
    
    engine.setOnStatusUpdate((status: AudioStatus) => {
      dispatch({ type: 'SET_AUDIO_STATUS', payload: status });
      
      // Update navigation state based on audio state
      const manager = playlistManager.current;
      dispatch({
        type: 'UPDATE_NAVIGATION',
        payload: {
          hasNext: manager.hasNext(),
          hasPrevious: manager.hasPrevious(),
        },
      });
    });

    return () => {
      engine.cleanup();
    };
  }, []);

  // Sync playlist manager state with context state
  useEffect(() => {
    const manager = playlistManager.current;
    manager.setShuffle(state.shuffleEnabled);
    manager.setRepeatMode(state.repeatMode);
  }, [state.shuffleEnabled, state.repeatMode]);

  const actions = useMemo(() => ({
    play: async (track: MusicTrack, playlist?: MusicTrack[], playlistName?: string, playlistId?: string) => {
      logger.info('MusicContext', 'Playing track', { trackId: track.id, hasPlaylist: !!playlist });
      
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });

        const engine = audioEngine.current;
        const manager = playlistManager.current;

        // Set up playlist if provided
        if (playlist && playlist.length > 0) {
          const trackIndex = playlist.findIndex(t => t.id === track.id);
          manager.setPlaylist(playlist, Math.max(0, trackIndex));
          
          dispatch({
            type: 'SET_PLAYLIST',
            payload: {
              tracks: manager.getPlaylist(),
              currentIndex: manager.getCurrentIndex(),
              name: playlistName,
              id: playlistId,
            },
          });
        } else {
          // Single track
          manager.setPlaylist([track], 0);
          dispatch({
            type: 'SET_PLAYLIST',
            payload: {
              tracks: [track],
              currentIndex: 0,
            },
          });
        }

        // Load and play the track
        await engine.load(track);
        await engine.play();
        
        dispatch({ type: 'SET_CURRENT_TRACK', payload: track });
        dispatch({ type: 'SET_CURRENT_INDEX', payload: manager.getCurrentIndex() });
        
        // Update navigation state
        dispatch({
          type: 'UPDATE_NAVIGATION',
          payload: {
            hasNext: manager.hasNext(),
            hasPrevious: manager.hasPrevious(),
          },
        });

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to play track';
        logger.error('MusicContext', 'Play error', error instanceof Error ? error : undefined);
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },

    pause: async () => {
      try {
        await audioEngine.current.pause();
        logger.info('MusicContext', 'Playback paused');
      } catch (error) {
        logger.error('MusicContext', 'Pause error', error instanceof Error ? error : undefined);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to pause playback' });
      }
    },

    resume: async () => {
      try {
        await audioEngine.current.play();
        logger.info('MusicContext', 'Playback resumed');
      } catch (error) {
        logger.error('MusicContext', 'Resume error', error instanceof Error ? error : undefined);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to resume playback' });
      }
    },

    stop: async () => {
      try {
        await audioEngine.current.stop();
        logger.info('MusicContext', 'Playback stopped');
      } catch (error) {
        logger.error('MusicContext', 'Stop error', error instanceof Error ? error : undefined);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to stop playback' });
      }
    },

    seek: async (positionSeconds: number) => {
      try {
        await audioEngine.current.seek(positionSeconds);
        logger.debug('MusicContext', 'Seek completed', { position: positionSeconds });
      } catch (error) {
        logger.error('MusicContext', 'Seek error', error instanceof Error ? error : undefined);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to seek' });
      }
    },

    next: async () => {
      try {
        const manager = playlistManager.current;
        const nextTrack = manager.next();
        
        if (nextTrack) {
          const engine = audioEngine.current;
          await engine.load(nextTrack);
          await engine.play();
          
          dispatch({ type: 'SET_CURRENT_TRACK', payload: nextTrack });
          dispatch({ type: 'SET_CURRENT_INDEX', payload: manager.getCurrentIndex() });
          
          // Update navigation state
          dispatch({
            type: 'UPDATE_NAVIGATION',
            payload: {
              hasNext: manager.hasNext(),
              hasPrevious: manager.hasPrevious(),
            },
          });
          
          logger.info('MusicContext', 'Navigated to next track', { trackId: nextTrack.id });
        } else {
          logger.debug('MusicContext', 'No next track available');
        }
      } catch (error) {
        logger.error('MusicContext', 'Next track error', error instanceof Error ? error : undefined);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to play next track' });
      }
    },

    previous: async () => {
      try {
        const manager = playlistManager.current;
        const previousTrack = manager.previous();
        
        if (previousTrack) {
          const engine = audioEngine.current;
          await engine.load(previousTrack);
          await engine.play();
          
          dispatch({ type: 'SET_CURRENT_TRACK', payload: previousTrack });
          dispatch({ type: 'SET_CURRENT_INDEX', payload: manager.getCurrentIndex() });
          
          // Update navigation state
          dispatch({
            type: 'UPDATE_NAVIGATION',
            payload: {
              hasNext: manager.hasNext(),
              hasPrevious: manager.hasPrevious(),
            },
          });
          
          logger.info('MusicContext', 'Navigated to previous track', { trackId: previousTrack.id });
        } else {
          logger.debug('MusicContext', 'No previous track available');
        }
      } catch (error) {
        logger.error('MusicContext', 'Previous track error', error instanceof Error ? error : undefined);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to play previous track' });
      }
    },

    jumpToIndex: async (index: number) => {
      try {
        const manager = playlistManager.current;
        const track = manager.jumpToIndex(index);
        
        if (track) {
          const engine = audioEngine.current;
          await engine.load(track);
          await engine.play();
          
          dispatch({ type: 'SET_CURRENT_TRACK', payload: track });
          dispatch({ type: 'SET_CURRENT_INDEX', payload: index });
          
          logger.info('MusicContext', 'Jumped to index', { index, trackId: track.id });
        }
      } catch (error) {
        logger.error('MusicContext', 'Jump to index error', error instanceof Error ? error : undefined);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to jump to track' });
      }
    },

    setPlaylist: (tracks: MusicTrack[], currentIndex = 0, name?: string, id?: string) => {
      const manager = playlistManager.current;
      manager.setPlaylist(tracks, currentIndex);
      
      dispatch({
        type: 'SET_PLAYLIST',
        payload: {
          tracks: manager.getPlaylist(),
          currentIndex: manager.getCurrentIndex(),
          name,
          id,
        },
      });
      
      // Update navigation state
      dispatch({
        type: 'UPDATE_NAVIGATION',
        payload: {
          hasNext: manager.hasNext(),
          hasPrevious: manager.hasPrevious(),
        },
      });
      
      logger.info('MusicContext', 'Playlist set', { trackCount: tracks.length, currentIndex });
    },

    addToPlaylist: (track: MusicTrack) => {
      const manager = playlistManager.current;
      manager.addTrack(track);
      
      dispatch({
        type: 'SET_PLAYLIST',
        payload: {
          tracks: manager.getPlaylist(),
          currentIndex: manager.getCurrentIndex(),
        },
      });
      
      logger.info('MusicContext', 'Track added to playlist', { trackId: track.id });
    },

    removeFromPlaylist: (trackId: string) => {
      const manager = playlistManager.current;
      const removed = manager.removeTrack(trackId);
      
      if (removed) {
        dispatch({
          type: 'SET_PLAYLIST',
          payload: {
            tracks: manager.getPlaylist(),
            currentIndex: manager.getCurrentIndex(),
          },
        });
        
        // Update current track if it was removed
        const currentTrack = manager.getCurrentTrack();
        dispatch({ type: 'SET_CURRENT_TRACK', payload: currentTrack });
        
        logger.info('MusicContext', 'Track removed from playlist', { trackId });
      }
    },

    clearPlaylist: () => {
      playlistManager.current.clear();
      dispatch({ type: 'CLEAR_STATE' });
      logger.info('MusicContext', 'Playlist cleared');
    },

    toggleShuffle: () => {
      const newShuffleState = !state.shuffleEnabled;
      const manager = playlistManager.current;
      manager.setShuffle(newShuffleState);
      
      dispatch({ type: 'SET_SHUFFLE', payload: newShuffleState });
      dispatch({
        type: 'SET_PLAYLIST',
        payload: {
          tracks: manager.getPlaylist(),
          currentIndex: manager.getCurrentIndex(),
        },
      });
      
      logger.info('MusicContext', 'Shuffle toggled', { enabled: newShuffleState });
    },

    toggleRepeat: () => {
      const modes: RepeatMode[] = ['off', 'all', 'one'];
      const currentIndex = modes.indexOf(state.repeatMode);
      const nextMode = modes[(currentIndex + 1) % modes.length];
      
      dispatch({ type: 'SET_REPEAT_MODE', payload: nextMode });
      logger.info('MusicContext', 'Repeat mode changed', { mode: nextMode });
    },

    clearError: () => {
      dispatch({ type: 'SET_ERROR', payload: null });
    },

    reset: async () => {
      try {
        await audioEngine.current.cleanup();
        playlistManager.current.clear();
        dispatch({ type: 'CLEAR_STATE' });
        logger.info('MusicContext', 'Music state reset');
      } catch (error) {
        logger.error('MusicContext', 'Reset error', error instanceof Error ? error : undefined);
      }
    },
  }), [state.shuffleEnabled, state.repeatMode]);

  const contextValue = useMemo(() => ({
    state,
    actions,
  }), [state, actions]);

  return (
    <MusicContext.Provider value={contextValue}>
      {children}
    </MusicContext.Provider>
  );
};

// Custom hook to use music context
export const useMusic = (): MusicContextType => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};

// Specialized hooks for specific use cases
export const usePlaybackState = () => {
  const { state } = useMusic();
  
  return useMemo(() => ({
    currentTrack: state.currentTrack,
    isPlaying: state.audioState === AudioState.PLAYING,
    isPaused: state.audioState === AudioState.PAUSED,
    isLoading: state.isLoading || state.audioState === AudioState.LOADING,
    isBuffering: state.isBuffering,
    position: state.position,
    duration: state.duration,
    progressPercentage: state.duration > 0 ? (state.position / state.duration) * 100 : 0,
    canGoNext: state.hasNext,
    canGoPrevious: state.hasPrevious,
    shuffleEnabled: state.shuffleEnabled,
    repeatMode: state.repeatMode,
    error: state.error,
    playlistName: state.playlistName,
    playlistId: state.playlistId,
  }), [state]);
};

export const usePlaybackControls = () => {
  const { actions } = useMusic();
  
  return useMemo(() => ({
    play: actions.play,
    pause: actions.pause,
    resume: actions.resume,
    stop: actions.stop,
    seek: actions.seek,
    next: actions.next,
    previous: actions.previous,
    toggleShuffle: actions.toggleShuffle,
    toggleRepeat: actions.toggleRepeat,
  }), [actions]);
};

export const usePlaylist = () => {
  const { state, actions } = useMusic();
  
  return useMemo(() => ({
    playlist: state.playlist,
    currentIndex: state.currentIndex,
    playlistName: state.playlistName,
    playlistId: state.playlistId,
    setPlaylist: actions.setPlaylist,
    addToPlaylist: actions.addToPlaylist,
    removeFromPlaylist: actions.removeFromPlaylist,
    clearPlaylist: actions.clearPlaylist,
    jumpToIndex: actions.jumpToIndex,
  }), [state, actions]);
};

export default MusicContext;
