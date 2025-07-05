import { MusicCategory, MusicTrack, PlaybackState, Playlist } from '@/types/music';
import TrackPlayer, {
    Capability,
    Event,
    State,
    Track
} from 'react-native-track-player';
import { mockCategories, mockPlaylists, mockTracks } from './musicMock';

class MusicServiceNative {
  private currentTrack: MusicTrack | null = null;
  private currentPlaylist: MusicTrack[] = [];
  private currentTrackIndex: number = 0;
  private playbackState: PlaybackState = {
    isPlaying: false,
    currentTrack: null,
    position: 0,
    duration: 0,
    isLoading: false,
    repeatMode: 'off',
    shuffleMode: false
  };
  private listeners: ((state: PlaybackState) => void)[] = [];
  private isSetup: boolean = false;

  constructor() {
    this.setupPlayer();
  }

  private async setupPlayer() {
    try {
      if (this.isSetup) return;
      
      await TrackPlayer.setupPlayer({
        maxCacheSize: 1024 * 10, // 10 MB
      });

      await TrackPlayer.updateOptions({
        // Configurações de capacidades para controles nativos
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
          Capability.SeekTo,
        ],
        
        // Configurações para manter reprodução quando app é fechado
        compactCapabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
        ],

        // Comportamento quando app é fechado
        stoppingAppPausesPlayback: false,
      });

      this.isSetup = true;
      this.setupEventListeners();
    } catch (error) {
      console.error('Failed to setup player:', error);
    }
  }

  private setupEventListeners() {
    // Eventos do player nativo
    TrackPlayer.addEventListener(Event.PlaybackState, (data) => {
      const isPlaying = data.state === State.Playing;
      this.playbackState.isPlaying = isPlaying;
      this.notifyListeners();
    });

    TrackPlayer.addEventListener(Event.PlaybackTrackChanged, async (data) => {
      if (data.nextTrack !== undefined) {
        const track = await TrackPlayer.getTrack(data.nextTrack);
        if (track) {
          this.currentTrack = this.convertTrackPlayerTrackToMusicTrack(track);
          this.playbackState.currentTrack = this.currentTrack;
          this.notifyListeners();
        }
      }
    });

    TrackPlayer.addEventListener(Event.RemotePause, () => {
      this.pauseTrack();
    });

    TrackPlayer.addEventListener(Event.RemotePlay, () => {
      this.resumeTrack();
    });

    TrackPlayer.addEventListener(Event.RemoteNext, () => {
      this.playNext();
    });

    TrackPlayer.addEventListener(Event.RemotePrevious, () => {
      this.playPrevious();
    });
  }

  private convertMusicTrackToTrackPlayerTrack(track: MusicTrack): Track {
    // Para arquivos locais, precisamos de uma abordagem diferente
    // Por enquanto, vamos usar uma URL placeholder e implementar depois
    const resourcePath = `asset://${track.id}.mp3`; // Placeholder para arquivo local
    
    return {
      id: track.id,
      url: resourcePath,
      title: track.title,
      artist: track.artist || 'PulseZen',
      album: track.categoryTitle,
      genre: 'Relaxamento',
      duration: track.duration,
      // artwork pode ser adicionado aqui se houver
    };
  }

  private convertTrackPlayerTrackToMusicTrack(track: Track): MusicTrack {
    // Encontra a track original baseada no ID
    const originalTrack = [...mockTracks].find(t => t.id === track.id);
    return originalTrack || {
      id: track.id,
      title: track.title || 'Unknown',
      artist: track.artist,
      category: 'unknown',
      categoryTitle: track.album || 'Unknown',
      duration: track.duration || 0,
      durationFormatted: this.formatDuration(track.duration || 0),
      uri: track.url as any, // Aqui pode precisar de conversão
      description: ''
    };
  }

  private formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Listeners
  addPlaybackListener(listener: (state: PlaybackState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.playbackState));
  }

  // Playback Control
  async playTrack(track: MusicTrack, playlist?: MusicTrack[]) {
    try {
      this.playbackState.isLoading = true;
      this.notifyListeners();

      if (playlist) {
        this.currentPlaylist = playlist;
        this.currentTrackIndex = playlist.findIndex(t => t.id === track.id);
      }

      await this.setupPlayer();

      // Limpa a queue atual
      await TrackPlayer.reset();

      // Converte e adiciona as tracks
      const trackPlayerTracks = this.currentPlaylist.map(t => 
        this.convertMusicTrackToTrackPlayerTrack(t)
      );

      await TrackPlayer.add(trackPlayerTracks);
      
      // Vai para a track específica
      await TrackPlayer.skip(this.currentTrackIndex);
      
      // Inicia reprodução
      await TrackPlayer.play();

      this.currentTrack = track;
      this.playbackState = {
        ...this.playbackState,
        currentTrack: track,
        isPlaying: true,
        isLoading: false
      };
      this.notifyListeners();

      // Atualiza posição e duração periodicamente
      this.startPositionUpdater();

    } catch (error) {
      console.error('Failed to play track:', error);
      this.playbackState.isLoading = false;
      this.notifyListeners();
    }
  }

  private async startPositionUpdater() {
    setInterval(async () => {
      try {
        const position = await TrackPlayer.getPosition();
        const duration = await TrackPlayer.getDuration();
        
        this.playbackState.position = Math.floor(position);
        this.playbackState.duration = Math.floor(duration);
        this.notifyListeners();
      } catch (error) {
        // Silently ignore errors
      }
    }, 1000);
  }

  async pauseTrack() {
    try {
      await TrackPlayer.pause();
      this.playbackState.isPlaying = false;
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to pause track:', error);
    }
  }

  async resumeTrack() {
    try {
      await TrackPlayer.play();
      this.playbackState.isPlaying = true;
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to resume track:', error);
    }
  }

  async playNext() {
    try {
      await TrackPlayer.skipToNext();
      // O evento PlaybackTrackChanged irá atualizar o estado
    } catch (error) {
      console.error('Failed to play next track:', error);
    }
  }

  async playPrevious() {
    try {
      await TrackPlayer.skipToPrevious();
      // O evento PlaybackTrackChanged irá atualizar o estado
    } catch (error) {
      console.error('Failed to play previous track:', error);
    }
  }

  async seekTo(positionMillis: number) {
    try {
      await TrackPlayer.seekTo(positionMillis / 1000); // TrackPlayer usa segundos
    } catch (error) {
      console.error('Failed to seek:', error);
    }
  }

  // Data methods (mantendo compatibilidade com o serviço anterior)
  async getAllCategories(): Promise<MusicCategory[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockCategories;
  }

  async getCategoryTracks(categoryId: string): Promise<MusicTrack[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const category = mockCategories.find(cat => cat.id === categoryId);
    return category ? category.tracks : [];
  }

  async getAllTracks(): Promise<MusicTrack[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockTracks;
  }

  async getAllPlaylists(): Promise<Playlist[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockPlaylists;
  }

  async getPlaylist(playlistId: string): Promise<Playlist | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockPlaylists.find(playlist => playlist.id === playlistId) || null;
  }

  // Getters
  getPlaybackState(): PlaybackState {
    return this.playbackState;
  }

  getCurrentTrack(): MusicTrack | null {
    return this.currentTrack;
  }

  // Cleanup
  async cleanup() {
    try {
      await TrackPlayer.reset();
      // destroy() foi removido nas versões mais recentes
    } catch (error) {
      console.error('Failed to cleanup player:', error);
    }
  }
}

export default new MusicServiceNative();
