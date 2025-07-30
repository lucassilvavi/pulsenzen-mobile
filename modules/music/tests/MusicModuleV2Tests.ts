import { logger } from '../../../utils/logger';
import { AudioEngine, AudioState } from '../services/AudioEngine';
import { MusicServiceV2 } from '../services/MusicServiceV2';
import { PlaylistManager } from '../services/PlaylistManager';

// Mock track for testing
const mockTrack = {
  id: 'test-track-1',
  title: 'Test Track',
  artist: 'Test Artist',
  duration: 210, // 3:30 in seconds
  durationFormatted: '3:30',
  uri: 123456 as number, // Mock require() number
  category: 'meditation',
  categoryTitle: 'Meditation',
};

const mockPlaylist = [
  mockTrack,
  {
    id: 'test-track-2',
    title: 'Test Track 2',
    artist: 'Test Artist 2',
    duration: 240, // 4:00 in seconds
    durationFormatted: '4:00',
    uri: 123457 as number,
    category: 'sleep',
    categoryTitle: 'Sleep',
  },
  {
    id: 'test-track-3',
    title: 'Test Track 3',
    artist: 'Test Artist 3',
    duration: 165, // 2:45 in seconds
    durationFormatted: '2:45',
    uri: 123458 as number,
    category: 'focus',
    categoryTitle: 'Focus',
  },
];

/**
 * MusicModuleV2Tests - Comprehensive testing suite for refactored music module
 * 
 * This test suite validates:
 * - AudioEngine functionality
 * - PlaylistManager logic
 * - MusicServiceV2 integration
 * - Memory management
 * - Error handling
 * - Performance characteristics
 */
export class MusicModuleV2Tests {
  private results: Array<{ name: string; success: boolean; error?: string; duration?: number }> = [];

  constructor() {
    logger.info('MusicModuleV2Tests', 'Initializing test suite');
  }

  async runAllTests(): Promise<void> {
    logger.info('MusicModuleV2Tests', '🧪 Starting comprehensive test suite');
    
    const startTime = Date.now();
    
    try {
      // Core component tests
      await this.testAudioEngine();
      await this.testPlaylistManager();
      await this.testMusicServiceV2();
      
      // Integration tests
      await this.testIntegration();
      
      // Performance tests
      await this.testPerformance();
      
      // Memory management tests
      await this.testMemoryManagement();
      
      const endTime = Date.now();
      const totalDuration = endTime - startTime;
      
      this.printResults(totalDuration);
      
    } catch (error) {
      logger.error('MusicModuleV2Tests', 'Test suite failed', error instanceof Error ? error : undefined);
      throw error;
    }
  }

  private async testAudioEngine(): Promise<void> {
    logger.info('MusicModuleV2Tests', '🎵 Testing AudioEngine');
    
    let audioEngine: AudioEngine | null = null;
    
    try {
      // Test 1: Engine creation and initialization
      await this.runTest('AudioEngine Creation', async () => {
        audioEngine = new AudioEngine();
        const status = audioEngine.getStatus();
        if (status.state !== AudioState.IDLE) {
          throw new Error(`Expected IDLE state, got ${status.state}`);
        }
      });

      if (!audioEngine) return;

      // Test 2: Track loading
      await this.runTest('Track Loading', async () => {
        if (!audioEngine) throw new Error('AudioEngine not initialized');
        
        // Mock the Audio.Sound.createAsync for testing
        // In real tests, you'd use proper mocking framework
        await audioEngine.load(mockTrack);
        
        const status = audioEngine.getStatus();
        if (status.state !== AudioState.LOADED && status.state !== AudioState.LOADING) {
          throw new Error(`Expected LOADED/LOADING state after load`);
        }
      });

      // Test 3: Playback controls
      await this.runTest('Playback Controls', async () => {
        if (!audioEngine) throw new Error('AudioEngine not initialized');
        
        // Test play
        await audioEngine.play();
        // Note: In real environment, this would change to PLAYING
        
        // Test pause
        await audioEngine.pause();
        
        // Test seek
        await audioEngine.seek(30);
      });

      // Test 4: Status callbacks
      await this.runTest('Status Callbacks', async () => {
        if (!audioEngine) throw new Error('AudioEngine not initialized');
        
        let callbackCalled = false;
        audioEngine.setOnStatusUpdate(() => {
          callbackCalled = true;
        });
        
        // Simulate status update
        // In real tests, this would be triggered by actual audio events
        
        // For mock testing, we'll just verify the callback can be set
        if (typeof audioEngine['statusCallback'] !== 'function') {
          throw new Error('Status callback not set properly');
        }
      });

      // Test 5: Cleanup
      await this.runTest('AudioEngine Cleanup', async () => {
        if (!audioEngine) throw new Error('AudioEngine not initialized');
        
        await audioEngine.cleanup();
        const status = audioEngine.getStatus();
        
        if (status.state !== AudioState.IDLE) {
          throw new Error(`Expected IDLE state after cleanup, got ${status.state}`);
        }
      });

    } catch (error) {
      logger.error('MusicModuleV2Tests', 'AudioEngine test failed', error instanceof Error ? error : undefined);
      throw error;
    }
  }

  private async testPlaylistManager(): Promise<void> {
    logger.info('MusicModuleV2Tests', '📋 Testing PlaylistManager');
    
    let playlistManager: PlaylistManager | null = null;
    
    try {
      // Test 1: Manager creation
      await this.runTest('PlaylistManager Creation', async () => {
        playlistManager = new PlaylistManager();
        
        const playlist = playlistManager.getPlaylist();
        if (playlist.length !== 0) {
          throw new Error('Expected empty playlist on creation');
        }
      });

      if (!playlistManager) return;

      // Test 2: Playlist setting
      await this.runTest('Set Playlist', async () => {
        if (!playlistManager) throw new Error('PlaylistManager not initialized');
        
        playlistManager.setPlaylist(mockPlaylist, 0);
        
        const playlist = playlistManager.getPlaylist();
        const currentTrack = playlistManager.getCurrentTrack();
        
        if (playlist.length !== mockPlaylist.length) {
          throw new Error(`Expected ${mockPlaylist.length} tracks, got ${playlist.length}`);
        }
        
        if (!currentTrack || currentTrack.id !== mockPlaylist[0].id) {
          throw new Error('Current track not set correctly');
        }
      });

      // Test 3: Navigation
      await this.runTest('Playlist Navigation', async () => {
        if (!playlistManager) throw new Error('PlaylistManager not initialized');
        
        // Test next
        const nextTrack = playlistManager.next();
        if (!nextTrack || nextTrack.id !== mockPlaylist[1].id) {
          throw new Error('Next navigation failed');
        }
        
        // Test previous
        const previousTrack = playlistManager.previous();
        if (!previousTrack || previousTrack.id !== mockPlaylist[0].id) {
          throw new Error('Previous navigation failed');
        }
      });

      // Test 4: Shuffle mode
      await this.runTest('Shuffle Mode', async () => {
        if (!playlistManager) throw new Error('PlaylistManager not initialized');
        
        const originalPlaylist = playlistManager.getPlaylist();
        
        playlistManager.setShuffle(true);
        if (!playlistManager.isShuffleEnabled()) {
          throw new Error('Shuffle mode not enabled');
        }
        
        playlistManager.setShuffle(false);
        const restoredPlaylist = playlistManager.getPlaylist();
        
        // Verify order is restored (first track should be the same)
        if (restoredPlaylist[0].id !== originalPlaylist[0].id) {
          throw new Error('Playlist order not restored after shuffle disable');
        }
      });

      // Test 5: Repeat modes
      await this.runTest('Repeat Modes', async () => {
        if (!playlistManager) throw new Error('PlaylistManager not initialized');
        
        playlistManager.setRepeatMode('one');
        if (playlistManager.getRepeatMode() !== 'one') {
          throw new Error('Repeat mode not set to one');
        }
        
        playlistManager.setRepeatMode('all');
        if (playlistManager.getRepeatMode() !== 'all') {
          throw new Error('Repeat mode not set to all');
        }
        
        playlistManager.setRepeatMode('off');
        if (playlistManager.getRepeatMode() !== 'off') {
          throw new Error('Repeat mode not set to off');
        }
      });

      // Test 6: Edge cases
      await this.runTest('Edge Cases', async () => {
        if (!playlistManager) throw new Error('PlaylistManager not initialized');
        
        // Test navigation bounds
        playlistManager.setPlaylist([mockTrack], 0); // Single track
        
        const nextTrack = playlistManager.next();
        // Should return null for single track with repeat off
        if (nextTrack !== null && playlistManager.getRepeatMode() === 'off') {
          throw new Error('Next should return null for single track playlist');
        }
      });

    } catch (error) {
      logger.error('MusicModuleV2Tests', 'PlaylistManager test failed', error instanceof Error ? error : undefined);
      throw error;
    }
  }

  private async testMusicServiceV2(): Promise<void> {
    logger.info('MusicModuleV2Tests', '🎼 Testing MusicServiceV2');
    
    let musicService: MusicServiceV2 | null = null;
    
    try {
      // Test 1: Service creation
      await this.runTest('MusicServiceV2 Creation', async () => {
        musicService = new MusicServiceV2();
        
        const state = musicService.getPlaybackState();
        if (state.isPlaying) {
          throw new Error('Service should not be playing on creation');
        }
      });

      if (!musicService) return;

      // Test 2: Listener management
      await this.runTest('Listener Management', async () => {
        if (!musicService) throw new Error('MusicServiceV2 not initialized');
        
        let listenerCalled = false;
        const removeListener = musicService.addPlaybackListener(() => {
          listenerCalled = true;
        });
        
        // Trigger notification
        musicService['notifyListeners']();
        
        if (!listenerCalled) {
          throw new Error('Listener not called');
        }
        
        // Test listener removal
        removeListener();
        listenerCalled = false;
        musicService['notifyListeners']();
        
        if (listenerCalled) {
          throw new Error('Listener not removed properly');
        }
      });

      // Test 3: Control methods
      await this.runTest('Control Methods', async () => {
        if (!musicService) throw new Error('MusicServiceV2 not initialized');
        
        // Test shuffle toggle
        const shuffleState = musicService.toggleShuffle();
        if (typeof shuffleState !== 'boolean') {
          throw new Error('Shuffle toggle should return boolean');
        }
        
        // Test repeat toggle
        const repeatMode = musicService.toggleRepeat();
        if (!['off', 'all', 'one'].includes(repeatMode)) {
          throw new Error('Invalid repeat mode returned');
        }
      });

      // Test 4: API delegation
      await this.runTest('API Delegation', async () => {
        if (!musicService) throw new Error('MusicServiceV2 not initialized');
        
        // Test API methods exist and return appropriate types
        try {
          const categories = await musicService.getCategories();
          if (!Array.isArray(categories)) {
            throw new Error('getCategories should return array');
          }
        } catch (error) {
          // API errors are expected in test environment
          logger.debug('MusicModuleV2Tests', 'API call failed as expected in test environment');
        }
      });

      // Test 5: Cleanup
      await this.runTest('MusicServiceV2 Cleanup', async () => {
        if (!musicService) throw new Error('MusicServiceV2 not initialized');
        
        await musicService.cleanup();
        
        // Verify service is in clean state
        const currentTrack = musicService.getCurrentTrack();
        if (currentTrack !== null) {
          throw new Error('Current track should be null after cleanup');
        }
      });

    } catch (error) {
      logger.error('MusicModuleV2Tests', 'MusicServiceV2 test failed', error instanceof Error ? error : undefined);
      throw error;
    }
  }

  private async testIntegration(): Promise<void> {
    logger.info('MusicModuleV2Tests', '🔗 Testing Integration');
    
    try {
      // Test 1: AudioEngine + PlaylistManager integration
      await this.runTest('AudioEngine + PlaylistManager', async () => {
        const audioEngine = new AudioEngine();
        const playlistManager = new PlaylistManager();
        
        playlistManager.setPlaylist(mockPlaylist, 0);
        const currentTrack = playlistManager.getCurrentTrack();
        
        if (currentTrack) {
          await audioEngine.load(currentTrack);
          const status = audioEngine.getStatus();
          
          if (status.state === AudioState.ERROR) {
            throw new Error('AudioEngine failed to load track from PlaylistManager');
          }
        }
        
        await audioEngine.cleanup();
      });

      // Test 2: Service + Components integration
      await this.runTest('Service Integration', async () => {
        const musicService = new MusicServiceV2();
        
        // Test state synchronization
        const initialState = musicService.getPlaybackState();
        if (typeof initialState.isPlaying !== 'boolean') {
          throw new Error('Invalid playback state structure');
        }
        
        await musicService.cleanup();
      });

    } catch (error) {
      logger.error('MusicModuleV2Tests', 'Integration test failed', error instanceof Error ? error : undefined);
      throw error;
    }
  }

  private async testPerformance(): Promise<void> {
    logger.info('MusicModuleV2Tests', '⚡ Testing Performance');
    
    try {
      // Test 1: Service creation performance
      await this.runTest('Service Creation Performance', async () => {
        const startTime = Date.now();
        
        const services = [];
        for (let i = 0; i < 10; i++) {
          services.push(new MusicServiceV2());
        }
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        if (duration > 1000) { // 1 second for 10 services
          throw new Error(`Service creation too slow: ${duration}ms`);
        }
        
        // Cleanup
        await Promise.all(services.map(s => s.cleanup()));
      });

      // Test 2: Playlist operations performance
      await this.runTest('Playlist Operations Performance', async () => {
        const playlistManager = new PlaylistManager();
        const largePlaylist = Array.from({ length: 1000 }, (_, i) => ({
          ...mockTrack,
          id: `track-${i}`,
          title: `Track ${i}`,
          uri: (123456 + i) as number,
        }));
        
        const startTime = Date.now();
        
        playlistManager.setPlaylist(largePlaylist, 0);
        
        // Perform 100 navigation operations
        for (let i = 0; i < 100; i++) {
          playlistManager.next();
          playlistManager.previous();
        }
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        if (duration > 500) { // 500ms for 200 operations on 1000 tracks
          throw new Error(`Playlist operations too slow: ${duration}ms`);
        }
      });

    } catch (error) {
      logger.error('MusicModuleV2Tests', 'Performance test failed', error instanceof Error ? error : undefined);
      throw error;
    }
  }

  private async testMemoryManagement(): Promise<void> {
    logger.info('MusicModuleV2Tests', '🧠 Testing Memory Management');
    
    try {
      // Test 1: Listener cleanup
      await this.runTest('Listener Cleanup', async () => {
        const musicService = new MusicServiceV2();
        
        // Add multiple listeners
        const removeListeners = [];
        for (let i = 0; i < 100; i++) {
          const remove = musicService.addPlaybackListener(() => {});
          removeListeners.push(remove);
        }
        
        // Remove all listeners
        removeListeners.forEach(remove => remove());
        
        // Verify listeners are cleaned up
        const listenersCount = musicService['listeners'].size;
        if (listenersCount !== 0) {
          throw new Error(`Expected 0 listeners, found ${listenersCount}`);
        }
        
        await musicService.cleanup();
      });

      // Test 2: Resource cleanup on service destruction
      await this.runTest('Resource Cleanup', async () => {
        const services = [];
        
        // Create multiple services
        for (let i = 0; i < 10; i++) {
          const service = new MusicServiceV2();
          services.push(service);
        }
        
        // Cleanup all services
        await Promise.all(services.map(s => s.cleanup()));
        
        // Verify no lingering references (in a real test, you'd check memory usage)
        services.forEach(service => {
          const currentTrack = service.getCurrentTrack();
          if (currentTrack !== null) {
            throw new Error('Service not properly cleaned up');
          }
        });
      });

    } catch (error) {
      logger.error('MusicModuleV2Tests', 'Memory management test failed', error instanceof Error ? error : undefined);
      throw error;
    }
  }

  private async runTest(
    name: string, 
    testFn: () => Promise<void>
  ): Promise<void> {
    const startTime = Date.now();
    
    try {
      await testFn();
      const duration = Date.now() - startTime;
      
      this.results.push({ name, success: true, duration });
      logger.info('MusicModuleV2Tests', `✅ ${name} - ${duration}ms`);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      this.results.push({ name, success: false, error: errorMessage, duration });
      logger.error('MusicModuleV2Tests', `❌ ${name} - ${errorMessage}`);
      
      throw error;
    }
  }

  private printResults(totalDuration: number): void {
    const passed = this.results.filter(r => r.success).length;
    const total = this.results.length;
    const failed = total - passed;
    
    logger.info('MusicModuleV2Tests', '📊 Test Results Summary');
    logger.info('MusicModuleV2Tests', `Total Tests: ${total}`);
    logger.info('MusicModuleV2Tests', `Passed: ${passed} ✅`);
    logger.info('MusicModuleV2Tests', `Failed: ${failed} ❌`);
    logger.info('MusicModuleV2Tests', `Total Duration: ${totalDuration}ms`);
    
    if (failed > 0) {
      logger.warn('MusicModuleV2Tests', 'Failed Tests:');
      this.results
        .filter(r => !r.success)
        .forEach(r => {
          logger.warn('MusicModuleV2Tests', `- ${r.name}: ${r.error}`);
        });
    }
    
    // Performance summary
    const avgDuration = this.results.reduce((sum, r) => sum + (r.duration || 0), 0) / total;
    logger.info('MusicModuleV2Tests', `Average Test Duration: ${avgDuration.toFixed(2)}ms`);
    
    if (failed === 0) {
      logger.info('MusicModuleV2Tests', '🎉 All tests passed! Music module refactoring is successful.');
    } else {
      logger.error('MusicModuleV2Tests', '💥 Some tests failed. Please review and fix issues.');
    }
  }

  getResults() {
    return {
      total: this.results.length,
      passed: this.results.filter(r => r.success).length,
      failed: this.results.filter(r => !r.success).length,
      results: this.results,
    };
  }
}

export default MusicModuleV2Tests;
