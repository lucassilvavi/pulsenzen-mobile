/**
 * Music Module - Refactored Architecture
 * 
 * This module provides comprehensive music playback functionality with:
 * - Modular architecture (AudioEngine, PlaylistManager, Context)
 * - Better performance and memory management
 * - Enhanced error handling and logging
 * - Clean, maintainable codebase
 */

// Core Services (New Architecture)
export { default as AudioEngine } from './services/AudioEngine';
export { default as MusicApiService } from './services/MusicApiService';
export { default as MusicService } from './services/MusicService';
export { default as PlaylistManager } from './services/PlaylistManager';

// Context and Hooks (Recommended)
export {
    MusicProvider,
    useMusic, usePlaybackControls, usePlaybackState, usePlaylist
} from './context/MusicContext';

// Components
export { default as MiniPlayer } from './components/MiniPlayer';
export { default as PlaylistModal } from './components/PlaylistModal';
export { default as SleepScreen } from './components/SleepScreen';

// Pages/Screens
export { default as CategoryScreen } from './pages/CategoryScreen';
export { default as MusicPlayerScreen } from './pages/MusicPlayerScreen';
export { default as PlaylistsScreen } from './pages/PlaylistsScreen';
export { default as SounsScreen } from './pages/SounsScreen';

// Hooks
export { default as usePlayback } from './hooks/usePlayback';

// Types
export * from './types';

// Default export for main service
export { default } from './services/MusicService';

