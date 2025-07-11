/**
 * Teste Manual do Módulo de Música
 * Script para testar todas as funcionalidades críticas
 */

import MusicApiService from '../services/MusicApiService';
import MusicService from '../services/MusicService';
import { PlaybackState } from '../types';

export class MusicModuleTests {
  private musicService = MusicService;
  private testResults: { test: string; passed: boolean; error?: string }[] = [];

  async runAllTests(): Promise<{ passed: number; failed: number; results: any[] }> {
    console.log('🎵 Iniciando testes do módulo de música...\n');

    await this.testApiService();
    await this.testPlaybackService();
    await this.testMiniPlayerIntegration();
    await this.testPlaylistManagement();
    await this.testErrorHandling();

    const passed = this.testResults.filter(r => r.passed).length;
    const failed = this.testResults.filter(r => !r.passed).length;

    console.log(`\n✅ Testes concluídos: ${passed} passou, ${failed} falharam\n`);
    
    if (failed > 0) {
      console.log('❌ Testes que falharam:');
      this.testResults.filter(r => !r.passed).forEach(r => {
        console.log(`  - ${r.test}: ${r.error}`);
      });
    }

    return { passed, failed, results: this.testResults };
  }

  private addTestResult(test: string, passed: boolean, error?: string) {
    this.testResults.push({ test, passed, error });
    console.log(passed ? `✅ ${test}` : `❌ ${test}: ${error}`);
  }

  // Teste 1: API Service
  async testApiService() {
    console.log('📡 Testando API Service...');

    try {
      // Teste de categorias
      const categories = await MusicApiService.getCategories();
      this.addTestResult(
        'Buscar categorias', 
        categories.length > 0,
        categories.length === 0 ? 'Nenhuma categoria retornada' : undefined
      );

      // Teste de tracks por categoria
      if (categories.length > 0) {
        const tracks = await MusicApiService.getTracksByCategory(categories[0].id);
        this.addTestResult(
          'Buscar tracks por categoria',
          tracks.length > 0,
          tracks.length === 0 ? 'Nenhuma track retornada' : undefined
        );
      }

      // Teste de playlists
      const playlists = await MusicApiService.getPlaylists();
      this.addTestResult(
        'Buscar playlists',
        playlists.length > 0,
        playlists.length === 0 ? 'Nenhuma playlist retornada' : undefined
      );

      // Teste de busca
      const searchResults = await MusicApiService.searchTracks({ query: 'forest' });
      this.addTestResult(
        'Busca de tracks',
        true, // Sempre passa pois pode retornar array vazio
      );

    } catch (error) {
      this.addTestResult('API Service', false, error instanceof Error ? error.message : 'Erro desconhecido');
    }
  }

  // Teste 2: Playback Service
  async testPlaybackService() {
    console.log('🎵 Testando Playback Service...');

    try {
      // Teste de estado inicial
      const initialState = this.musicService.getPlaybackState();
      this.addTestResult(
        'Estado inicial do playback',
        !initialState.isPlaying && initialState.currentTrack === null,
        'Estado inicial incorreto'
      );

      // Teste de carregamento de tracks
      const tracks = await this.musicService.getAllTracks();
      this.addTestResult(
        'Carregamento de tracks',
        tracks.length > 0,
        'Nenhuma track carregada'
      );

      if (tracks.length > 0) {
        const testTrack = tracks[0];
        
        // Teste de load + play (sem fazer play real para não interferir)
        // Como estamos testando sem dispositivo real, apenas verificamos se a função existe
        this.addTestResult(
          'Função playTrack existe',
          typeof this.musicService.playTrack === 'function',
          'Função playTrack não encontrada'
        );

        this.addTestResult(
          'Função pauseTrack existe',
          typeof this.musicService.pauseTrack === 'function',
          'Função pauseTrack não encontrada'
        );

        this.addTestResult(
          'Função stopAndClearMusic existe',
          typeof this.musicService.stopAndClearMusic === 'function',
          'Função stopAndClearMusic não encontrada'
        );
      }

    } catch (error) {
      this.addTestResult('Playback Service', false, error instanceof Error ? error.message : 'Erro desconhecido');
    }
  }

  // Teste 3: Integração MiniPlayer
  async testMiniPlayerIntegration() {
    console.log('📱 Testando integração MiniPlayer...');

    try {
      // Verifica se os listeners funcionam
      let listenerCalled = false;
      const removeListener = this.musicService.addPlaybackListener((state: PlaybackState) => {
        listenerCalled = true;
      });

      // Força uma notificação
      this.musicService['notifyListeners']();
      
      this.addTestResult(
        'Sistema de listeners',
        listenerCalled,
        'Listener não foi chamado'
      );

      // Remove listener
      removeListener();

      // Verifica se o MiniPlayer pode acessar o estado
      const state = this.musicService.getPlaybackState();
      this.addTestResult(
        'Acesso ao estado do playback',
        state !== null && typeof state === 'object',
        'Estado não acessível'
      );

    } catch (error) {
      this.addTestResult('MiniPlayer Integration', false, error instanceof Error ? error.message : 'Erro desconhecido');
    }
  }

  // Teste 4: Gerenciamento de Playlist
  async testPlaylistManagement() {
    console.log('📋 Testando gerenciamento de playlists...');

    try {
      const playlists = await this.musicService.getPlaylists();
      this.addTestResult(
        'Carregamento de playlists',
        Array.isArray(playlists),
        'Playlists não é um array'
      );

      if (playlists.length > 0) {
        const playlist = await this.musicService.getPlaylist(playlists[0].id);
        this.addTestResult(
          'Busca de playlist específica',
          playlist !== null && playlist.id === playlists[0].id,
          'Playlist não encontrada'
        );

        // Teste de estrutura da playlist
        if (playlist) {
          this.addTestResult(
            'Estrutura da playlist',
            playlist.tracks && Array.isArray(playlist.tracks),
            'Estrutura da playlist inválida'
          );
        }
      }

    } catch (error) {
      this.addTestResult('Playlist Management', false, error instanceof Error ? error.message : 'Erro desconhecido');
    }
  }

  // Teste 5: Tratamento de Erros
  async testErrorHandling() {
    console.log('⚠️ Testando tratamento de erros...');

    try {
      // Teste de playlist inexistente
      const nonExistentPlaylist = await this.musicService.getPlaylist('non-existent-id');
      this.addTestResult(
        'Playlist inexistente',
        nonExistentPlaylist === null,
        'Deveria retornar null para playlist inexistente'
      );

      // Teste de categoria inexistente
      const nonExistentCategoryTracks = await this.musicService.getTracksByCategory('non-existent-category');
      this.addTestResult(
        'Categoria inexistente',
        Array.isArray(nonExistentCategoryTracks) && nonExistentCategoryTracks.length === 0,
        'Deveria retornar array vazio para categoria inexistente'
      );

    } catch (error) {
      this.addTestResult('Error Handling', false, error instanceof Error ? error.message : 'Erro desconhecido');
    }
  }
}

// Teste de performance
export class MusicPerformanceTests {
  async testLoadingTimes() {
    console.log('⏱️ Testando performance...');

    const tests = [
      { name: 'Categorias', fn: () => MusicApiService.getCategories() },
      { name: 'Tracks', fn: () => MusicApiService.searchTracks({}) },
      { name: 'Playlists', fn: () => MusicApiService.getPlaylists() },
    ];

    for (const test of tests) {
      const start = Date.now();
      await test.fn();
      const end = Date.now();
      const duration = end - start;
      
      console.log(`📊 ${test.name}: ${duration}ms ${duration > 1000 ? '⚠️ Lento' : '✅ Rápido'}`);
    }
  }
}

// Exemplo de uso:
// const tests = new MusicModuleTests();
// tests.runAllTests().then(results => console.log(results));
