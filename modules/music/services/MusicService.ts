import { Audio } from 'expo-av';
import { MusicCategory, MusicTrack, PlaybackState, Playlist } from '../types';
import MusicApiService from './MusicApiService';

class MusicService {
  private sound: Audio.Sound | null = null;
  private currentTrack: MusicTrack | null = null;
  private currentPlaylist: MusicTrack[] = [];
  private originalPlaylist: MusicTrack[] = []; // Para restaurar ordem original após shuffle
  private currentTrackIndex: number = 0;
  private playbackState: PlaybackState = {
    isPlaying: false,
    currentTrack: null,
    position: 0,
    duration: 0,
    isLoading: false,
    repeatMode: 'off',
    shuffleMode: false,
    currentPlaylist: undefined,
    playlistName: undefined,
    playlistId: undefined,
    pausedFrom: null
  };
  private listeners: ((state: PlaybackState) => void)[] = [];
  private statusUpdateInterval: any = null;

  constructor() {
    this.setupAudio();
  }

  private async setupAudio() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false
      });
    } catch (error) {
      console.error('Failed to setup audio:', error);
    }
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
  async playTrack(track: MusicTrack, playlist?: MusicTrack[], playlistName?: string, playlistId?: string) {
    try {
      this.playbackState.isLoading = true;
      this.notifyListeners();

      // Set playlist if provided
      if (playlist) {
        this.originalPlaylist = [...playlist]; // Salva playlist original
        this.currentPlaylist = this.playbackState.shuffleMode ? this.shuffleArray([...playlist]) : [...playlist];
        this.currentTrackIndex = this.currentPlaylist.findIndex(t => t.id === track.id);
        
        // Atualiza informações da playlist no estado
        this.playbackState.currentPlaylist = [...this.currentPlaylist];
        this.playbackState.playlistName = playlistName;
        this.playbackState.playlistId = playlistId;
      } else {
        // Se não há playlist, limpa todas as informações de playlist
        this.currentPlaylist = [];
        this.originalPlaylist = [];
        this.currentTrackIndex = 0;
        this.playbackState.currentPlaylist = undefined;
        this.playbackState.playlistName = undefined;
        this.playbackState.playlistId = undefined;
      }

      // PRIMEIRO: Parar completamente qualquer reprodução anterior
      await this.stopCurrentPlayback();

      // Load new sound with error handling
      const { sound } = await Audio.Sound.createAsync(
        track.uri,
        {
          shouldPlay: false, // Mudado para false para controlar manualmente
          isLooping: false,
        }
      );
      
      if (!sound) {
        throw new Error('Failed to create sound');
      }
      
      this.sound = sound;
      this.currentTrack = track;

      // Setup playback status update with error handling
      this.sound.setOnPlaybackStatusUpdate(this.onPlaybackStatusUpdate.bind(this));

      // Configure progress update interval for smoother updates
      try {
        await this.sound.setProgressUpdateIntervalAsync(500);
      } catch (error) {
        console.warn('Could not set progress update interval:', error);
      }

      // Get initial status to set duration immediately
      try {
        const initialStatus = await this.sound.getStatusAsync();
        if (initialStatus.isLoaded && initialStatus.durationMillis) {
          this.playbackState.duration = Math.floor(initialStatus.durationMillis / 1000);
        }
      } catch (error) {
        console.warn('Could not get initial status:', error);
      }

      // Configure media metadata for native controls
      await this.updateNowPlayingInfo(track);

      // AGORA sim, iniciar a reprodução
      await this.sound.playAsync();

      // Start status update interval for more frequent updates
      this.startStatusUpdateInterval();

      this.playbackState = {
        ...this.playbackState,
        currentTrack: track,
        isPlaying: true,
        isLoading: false,
        pausedFrom: null // Limpa a origem da pausa ao iniciar nova música
      };
      
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to play track:', error);
      this.playbackState.isLoading = false;
      this.playbackState.isPlaying = false;
      this.notifyListeners();
    }
  }

  // Método auxiliar para parar completamente a reprodução atual
  private async stopCurrentPlayback() {
    // Stop status update interval primeiro
    this.stopStatusUpdateInterval();
    
    // Se há um som carregado, pare e descarregue
    if (this.sound) {
      try {
        // Remove callback antes de parar
        this.sound.setOnPlaybackStatusUpdate(null);
        
        // Para a reprodução
        await this.sound.stopAsync();
        
        // Descarrega o som
        await this.sound.unloadAsync();
        
      } catch (error) {
        console.warn('Error stopping previous sound:', error);
      }
      
      this.sound = null;
    }
    
    // Reset playback state
    this.playbackState.isPlaying = false;
    this.playbackState.position = 0;
  }

  async pauseTrack(from: 'player' | 'miniPlayer' = 'player') {
    try {
      if (this.sound) {
        await this.sound.pauseAsync();
        this.playbackState.isPlaying = false;
        this.playbackState.pausedFrom = from;
        this.stopStatusUpdateInterval();
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Failed to pause track:', error);
    }
  }

  async resumeTrack() {
    try {
      if (this.sound) {
        await this.sound.playAsync();
        this.playbackState.isPlaying = true;
        this.playbackState.pausedFrom = null; // Limpa a origem da pausa
        this.startStatusUpdateInterval();
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Failed to resume track:', error);
    }
  }

  async stopTrack() {
    try {
      if (this.sound) {
        await this.sound.stopAsync();
        this.playbackState.isPlaying = false;
        this.playbackState.position = 0;
        this.stopStatusUpdateInterval();
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Failed to stop track:', error);
    }
  }

  async seekTo(positionMillis: number) {
    try {
      if (this.sound) {
        // Primeiro, faz o seek
        await this.sound.setPositionAsync(positionMillis);
        
        // Atualiza o estado imediatamente para feedback visual
        const newPosition = Math.floor(positionMillis / 1000);
        this.playbackState = {
          ...this.playbackState,
          position: newPosition
        };
        
        this.notifyListeners();
        
        // Força uma atualização do status após um pequeno delay
        setTimeout(async () => {
          if (this.sound) {
            const status = await this.sound.getStatusAsync();
            if (status.isLoaded) {
              this.onPlaybackStatusUpdate(status);
            }
          }
        }, 100);
      }
    } catch (error) {
      console.error('Failed to seek:', error);
    }
  }

  private onPlaybackStatusUpdate(status: any) {
    // Verifica se o sound ainda está carregado e válido
    if (!this.sound || !status) {
      return; // Silently ignore status updates for unloaded sounds
    }
    
    // Verifica se o status é de um sound válido
    try {
      if (status.isLoaded) {
        const newPosition = Math.floor((status.positionMillis || 0) / 1000);
        const newDuration = Math.floor((status.durationMillis || 0) / 1000);
        const isPlaying = status.isPlaying || false;
        
        // Só atualiza se houver mudanças significativas para evitar loops
        const hasChanges = 
          newPosition !== this.playbackState.position ||
          newDuration !== this.playbackState.duration ||
          isPlaying !== this.playbackState.isPlaying;
          
        if (hasChanges) {
          this.playbackState = {
            ...this.playbackState,
            position: newPosition,
            duration: newDuration,
            isPlaying: isPlaying
          };
          
          this.notifyListeners();
        }
        
        if (status.didJustFinish) {
          this.playbackState.isPlaying = false;
          // Handle repeat and auto-play logic
          this.handleTrackFinished();
        }
      } else if (status.error) {
        console.error('Audio playback error:', status.error);
      }
    } catch (error) {
      // Silently ignore errors from unloaded sounds
      return;
    }
  }

  private startStatusUpdateInterval() {
    // Para qualquer intervalo anterior
    this.stopStatusUpdateInterval();
    
    this.statusUpdateInterval = setInterval(async () => {
      if (this.sound && this.playbackState.isPlaying) {
        try {
          const status = await this.sound.getStatusAsync();
          if (status && this.sound) { // Verifica se o sound ainda existe
            this.onPlaybackStatusUpdate(status);
          }
        } catch (error) {
          // Silently ignore errors for unloaded sounds
          const errorMessage = error instanceof Error ? error.message : String(error);
          if (!errorMessage.includes('unloaded')) {
            console.error('Error getting status:', error);
          }
        }
      }
    }, 1000); // Intervalo de 1 segundo
  }

  private stopStatusUpdateInterval() {
    if (this.statusUpdateInterval) {
      clearInterval(this.statusUpdateInterval);
      this.statusUpdateInterval = null;
    }
  }

  async playNext() {
    // Verifica se há uma playlist válida e mais de uma música
    if (this.currentPlaylist.length <= 1) {
      return;
    }
    
    let nextIndex: number;
    
    if (this.playbackState.shuffleMode) {
      // Em modo shuffle, escolhe uma faixa aleatória diferente da atual
      const availableIndices = this.currentPlaylist
        .map((_, index) => index)
        .filter(index => index !== this.currentTrackIndex);
      
      if (availableIndices.length === 0) {
        return;
      } else {
        nextIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      }
    } else {
      nextIndex = (this.currentTrackIndex + 1) % this.currentPlaylist.length;
    }
    
    const nextTrack = this.currentPlaylist[nextIndex];
    
    if (nextTrack) {
      this.currentTrackIndex = nextIndex;
      await this.playTrack(nextTrack, this.currentPlaylist, this.playbackState.playlistName, this.playbackState.playlistId);
    }
  }

  async playPrevious() {
    // Verifica se há uma playlist válida e mais de uma música
    if (this.currentPlaylist.length <= 1) {
      return;
    }
    
    let prevIndex: number;
    
    if (this.playbackState.shuffleMode) {
      // Em modo shuffle, escolhe uma faixa aleatória diferente da atual
      const availableIndices = this.currentPlaylist
        .map((_, index) => index)
        .filter(index => index !== this.currentTrackIndex);
      
      if (availableIndices.length === 0) {
        return;
      } else {
        prevIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      }
    } else {
      prevIndex = this.currentTrackIndex === 0 
        ? this.currentPlaylist.length - 1 
        : this.currentTrackIndex - 1;
    }
    
    const prevTrack = this.currentPlaylist[prevIndex];
    
    if (prevTrack) {
      this.currentTrackIndex = prevIndex;
      await this.playTrack(prevTrack, this.currentPlaylist, this.playbackState.playlistName, this.playbackState.playlistId);
    }
  }

  // Shuffle and Repeat Controls
  toggleShuffle(): boolean {
    this.playbackState.shuffleMode = !this.playbackState.shuffleMode;
    
    if (this.playbackState.shuffleMode) {
      // Ativar shuffle - embaralha a playlist mantendo a faixa atual
      const currentTrack = this.currentPlaylist[this.currentTrackIndex];
      const otherTracks = this.currentPlaylist.filter((_, index) => index !== this.currentTrackIndex);
      const shuffledOthers = this.shuffleArray(otherTracks);
      
      this.currentPlaylist = [currentTrack, ...shuffledOthers];
      this.currentTrackIndex = 0; // A faixa atual agora está no início
    } else {
      // Desativar shuffle - restaura ordem original
      if (this.originalPlaylist.length > 0) {
        const currentTrack = this.currentPlaylist[this.currentTrackIndex];
        this.currentPlaylist = [...this.originalPlaylist];
        this.currentTrackIndex = this.currentPlaylist.findIndex(t => t.id === currentTrack.id);
      }
    }
    
    this.notifyListeners();
    return this.playbackState.shuffleMode;
  }

  toggleRepeat(): 'off' | 'one' | 'all' {
    const modes: ('off' | 'one' | 'all')[] = ['off', 'one', 'all'];
    const currentIndex = modes.indexOf(this.playbackState.repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    
    this.playbackState.repeatMode = modes[nextIndex];
    this.notifyListeners();
    return this.playbackState.repeatMode;
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private async handleTrackFinished() {
    const currentTrack = this.playbackState.currentTrack;
    
    switch (this.playbackState.repeatMode) {
      case 'one':
        // Repetir a faixa atual
        if (currentTrack && this.sound) {
          await this.sound.replayAsync();
        }
        break;
      case 'all':
        // Ir para próxima faixa (ou primeira se for a última) - apenas se há playlist
        if (this.currentPlaylist.length > 1) {
          await this.playNext();
        } else if (currentTrack && this.sound) {
          // Se só tem uma música ou não há playlist, repete ela
          await this.sound.replayAsync();
        }
        break;
      case 'off':
      default:
        // Tocar próxima faixa apenas se há playlist válida e não é a última música
        if (this.currentPlaylist.length > 1 && this.currentTrackIndex < this.currentPlaylist.length - 1) {
          await this.playNext();
        } else {
          // Para no final da playlist ou se é música avulsa
          this.playbackState.isPlaying = false;
          this.notifyListeners();
        }
        break;
    }
  }

  // Share functionality
  async shareCurrentTrack(): Promise<boolean> {
    if (!this.currentTrack) {
      return false;
    }

    try {
      const { isAvailableAsync, shareAsync } = await import('expo-sharing');
      
      if (await isAvailableAsync()) {
        const shareContent = {
          message: `🎵 Escutando "${this.currentTrack.title}" ${this.currentTrack.artist ? `de ${this.currentTrack.artist}` : ''} no PulseZen\n\nBaixe o PulseZen e desfrute de músicas relaxantes para meditação, sono e bem-estar! 🧘‍♀️✨`,
          title: `${this.currentTrack.title} - PulseZen`
        };

        // No React Native/Expo, usamos o sistema nativo de compartilhamento
        const Share = await import('react-native').then(rn => rn.Share);
        await Share.share(shareContent);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error sharing track:', error);
      return false;
    }
  }

  // Data fetching
  async getAllTracks(): Promise<MusicTrack[]> {
    return await MusicApiService.searchTracks({}).then(result => result.tracks);
  }

  async getTracksByCategory(categoryId: string): Promise<MusicTrack[]> {
    return await MusicApiService.getTracksByCategory(categoryId);
  }

  async getCategories(): Promise<MusicCategory[]> {
    return await MusicApiService.getCategories();
  }

  async getPlaylists(): Promise<Playlist[]> {
    return await MusicApiService.getPlaylists();
  }

  async getPlaylist(playlistId: string): Promise<Playlist | null> {
    return await MusicApiService.getPlaylist(playlistId);
  }

  // Métodos de edição de playlist removidos - funcionalidade descontinuada

  // Media metadata for native controls
  private async updateNowPlayingInfo(track: MusicTrack) {
    try {
      if (this.sound) {
        // Configura intervalo de atualização para melhor responsividade
        await this.sound.setProgressUpdateIntervalAsync(500);
        
        // Expo-AV automaticamente configura os metadados quando o áudio
        // está configurado para tocar em background com staysActiveInBackground: true
        
        // Configura o status para permitir controles nativos
        await this.sound.setStatusAsync({
          shouldPlay: true,
          isLooping: false,
          isMuted: false,
          androidImplementation: 'MediaPlayer', // Usa MediaPlayer no Android para melhor integração
        });
      }
    } catch (error) {
      console.warn('Failed to update now playing info:', error);
    }
  }

  // Getters
  getPlaybackState(): PlaybackState {
    return this.playbackState;
  }

  getCurrentTrack(): MusicTrack | null {
    return this.currentTrack;
  }

  getCurrentPlaylist(): MusicTrack[] {
    return this.currentPlaylist;
  }

  // Stop and clear all music data
  async stopAndClearMusic() {
    await this.stopCurrentPlayback();
    
    // Clear all music state
    this.currentTrack = null;
    this.currentPlaylist = [];
    this.originalPlaylist = [];
    this.currentTrackIndex = 0;
    
    // Reset playback state completely
    this.playbackState = {
      isPlaying: false,
      currentTrack: null,
      position: 0,
      duration: 0,
      isLoading: false,
      repeatMode: 'off',
      shuffleMode: false,
      currentPlaylist: undefined,
      playlistName: undefined,
      playlistId: undefined,
      pausedFrom: null
    };
    
    this.notifyListeners();
  }

  // Cleanup
  async cleanup() {
    this.stopStatusUpdateInterval();
    if (this.sound) {
      try {
        // Remove callbacks antes de descarregar
        this.sound.setOnPlaybackStatusUpdate(null);
        await this.sound.unloadAsync();
      } catch (error) {
        // Silently ignore cleanup errors
      }
      this.sound = null;
    }
    this.listeners = [];
  }
}

export default new MusicService();
