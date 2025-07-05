import Button from '@/components/base/Button';
import PlaylistModal from '@/components/PlaylistModal';
import { SafeInsets } from '@/components/SafeInsets';
import musicService from '@/services/musicService';
import { MusicTrack, PlaybackState } from '@/types/music';
import { fontSize, spacing } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Função de utilidade para calcular dimensões responsivas
const calculateDimension = (baseSize: number, scaleFactor = 1): number => {
  // Ajusta baseado na largura da tela para proporcionalidade
  const screenSizeFactor = width / 375; // 375 é o "padrão" iPhone X
  return baseSize * screenSizeFactor * scaleFactor;
};

export default function MusicPlayerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [track, setTrack] = useState<MusicTrack | null>(null);
  const [allTracks, setAllTracks] = useState<MusicTrack[]>([]);
  const [playbackState, setPlaybackState] = useState<PlaybackState>(
    musicService.getPlaybackState()
  );
  const [isLoading, setIsLoading] = useState(true);

  const [isSliding, setIsSliding] = useState(false);
  const [slidingValue, setSlidingValue] = useState(0);
  const [progressBarLayout, setProgressBarLayout] = useState({ width: 0, x: 0 });
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);

  // PanResponder para arrastar a barra de progresso
  const progressPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      // Só ativa o movimento se o usuário realmente arrastou
      return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
    },
    
    onPanResponderGrant: (event) => {
      const { pageX } = event.nativeEvent;
      const relativeX = pageX - progressBarLayout.x;
      const progress = Math.max(0, Math.min(1, relativeX / progressBarLayout.width));
      
      setIsSliding(true);
      setSlidingValue(progress);
      
      // Feedback tátil para indicar que o usuário pode arrastar
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    
    onPanResponderMove: (event, gestureState) => {
      // Só atualiza se realmente está arrastando
      if (Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5) {
        const { pageX } = event.nativeEvent;
        const relativeX = pageX - progressBarLayout.x;
        const progress = Math.max(0, Math.min(1, relativeX / progressBarLayout.width));
        
        setSlidingValue(progress);
      }
    },
    
    onPanResponderRelease: (event, gestureState) => {
      const { pageX } = event.nativeEvent;
      const relativeX = pageX - progressBarLayout.x;
      const progress = Math.max(0, Math.min(1, relativeX / progressBarLayout.width));
      
      setIsSliding(false);
      handleSeek(progress);
      
      // Feedback tátil para confirmar a ação
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    },
  });

  // Função para lidar com toques simples na barra
  const handleProgressBarPress = (event: any) => {
    if (progressBarLayout.width > 0) {
      const { pageX } = event.nativeEvent;
      const relativeX = pageX - progressBarLayout.x;
      const progress = Math.max(0, Math.min(1, relativeX / progressBarLayout.width));
      
      handleSeek(progress);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  // Animações
  const fadeAnim = useState(() => new Animated.Value(0))[0];
  const scaleAnim = useState(() => new Animated.Value(0.95))[0];
  const playButtonPulse = useState(() => new Animated.Value(1))[0];
  const albumBreathingAnim = useState(() => new Animated.Value(1))[0];
  const pulsingDotAnim = useState(() => new Animated.Value(0.8))[0];

  useEffect(() => {
    // Só chama loadTrack na primeira montagem ou se há parâmetros específicos
    const trackId = params.trackId as string;
    const shouldLoadTrack = trackId || !musicService.getPlaybackState().currentTrack;
    
    if (shouldLoadTrack) {
      loadTrack();
    } else {
      // Se já há uma música tocando e não há trackId, apenas sincroniza
      const currentState = musicService.getPlaybackState();
      setTrack(currentState.currentTrack);
      setPlaybackState(currentState);
      setIsLoading(false);
    }
    
    // Animação de entrada suave
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Animação de "respiração" suave para o álbum
    const breathingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(albumBreathingAnim, {
          toValue: 1.02,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(albumBreathingAnim, {
          toValue: 0.98,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );
    
    breathingAnimation.start();
    
    return () => {
      breathingAnimation.stop();
    };
  }, []);

  // Animação de pulsação no botão play quando tocando
  useEffect(() => {
    if (playbackState.isPlaying) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(playButtonPulse, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(playButtonPulse, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      
      const dotPulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulsingDotAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulsingDotAnim, {
            toValue: 0.8,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      
      pulse.start();
      dotPulse.start();
      return () => {
        pulse.stop();
        dotPulse.stop();
      };
    } else {
      playButtonPulse.setValue(1);
      pulsingDotAnim.setValue(0.8);
    }
  }, [playbackState.isPlaying]);

  // Subscribe to playback state changes and cleanup on unmount
  useEffect(() => {
    const unsubscribe = musicService.addPlaybackListener(setPlaybackState);
    
    // Não pausamos a música ao sair da tela, pois queremos que ela continue tocando em segundo plano
    // Isso permite que o mini-player continue funcionando
    
    return unsubscribe;
  }, []);
  
  // Update position when playing
  useEffect(() => {
    let positionInterval: any = null;
    
    if (playbackState.isPlaying) {
      positionInterval = setInterval(() => {
        const currentState = musicService.getPlaybackState();
        setPlaybackState(prevState => {
          if (currentState.position !== prevState.position || 
              currentState.duration !== prevState.duration ||
              currentState.isPlaying !== prevState.isPlaying) {
            return currentState;
          }
          return prevState;
        });
      }, 500);
    }
    
    return () => {
      if (positionInterval) {
        clearInterval(positionInterval);
      }
    };
  }, [playbackState.isPlaying]);

  // Update track when playback state changes
  useEffect(() => {
    if (playbackState.currentTrack && (!track || track.id !== playbackState.currentTrack.id)) {
      setTrack(playbackState.currentTrack);
    }
  }, [playbackState.currentTrack]);
  
  // Monitor trackId param changes to handle navigation with new tracks
  useEffect(() => {
    const trackId = params.trackId as string;
    
    // Se não há trackId, não faz nada aqui (será tratado pelo loadTrack inicial)
    if (!trackId) {
      return;
    }
    
    const currentPlaybackState = musicService.getPlaybackState();
    
    // Só carrega a track se:
    // 1. Há um trackId nos parâmetros
    // 2. E a track local não corresponde ao trackId
    // 3. E a track atualmente tocando no serviço também não corresponde ao trackId
    if (trackId && 
        (!track || track.id !== trackId) && 
        (!currentPlaybackState.currentTrack || currentPlaybackState.currentTrack.id !== trackId)) {
      loadTrack();
    } else if (trackId && currentPlaybackState.currentTrack?.id === trackId) {
      // Se a música já está tocando no serviço, apenas sincroniza os estados locais
      setTrack(currentPlaybackState.currentTrack);
      setPlaybackState(currentPlaybackState);
      setIsLoading(false);
    }
  }, [params.trackId]);

  const loadTrack = async () => {
    try {
      const trackId = params.trackId as string;
      const playlistId = params.playlistId as string;
      const playlistName = params.playlistName as string;
      
      // Se não há trackId (navegação do mini-player), sincroniza com o estado atual do musicService
      if (!trackId) {
        const currentPlaybackState = musicService.getPlaybackState();
        if (currentPlaybackState.currentTrack) {
          setTrack(currentPlaybackState.currentTrack);
          setPlaybackState(currentPlaybackState);
          
          // Define allTracks baseado na playlist atual ou todas as músicas
          if (currentPlaybackState.currentPlaylist) {
            setAllTracks(currentPlaybackState.currentPlaylist);
          } else {
            const allTracks = await musicService.getAllTracks();
            setAllTracks(allTracks);
          }
        }
        setIsLoading(false);
        return;
      }
      
      // Se há trackId, processa normalmente (nova música)
      if (trackId) {
        let tracks: MusicTrack[] = [];
        let currentPlaylistName: string | undefined = undefined;
        
        if (playlistId) {
          // Se veio de uma playlist, carrega apenas as músicas da playlist
          const playlists = await musicService.getPlaylists();
          const playlist = playlists.find(p => p.id === playlistId);
          if (playlist) {
            tracks = playlist.tracks;
            currentPlaylistName = playlist.name;
          }
        } else if (playlistName) {
          // Se veio de uma categoria (que funciona como playlist)
          const categories = await musicService.getCategories();
          const category = categories.find(c => c.title === playlistName);
          if (category) {
            tracks = category.tracks;
            currentPlaylistName = category.title;
          }
        } else {
          // Se não veio de playlist, carrega todas as músicas
          tracks = await musicService.getAllTracks();
        }
        
        setAllTracks(tracks);
        
        const foundTrack = tracks.find(t => t.id === trackId);
        if (foundTrack) {
          setTrack(foundTrack);
          // Sempre inicia a reprodução pois esta função só é chamada para novas músicas
          await musicService.playTrack(foundTrack, tracks, currentPlaylistName, playlistId);
        }
      }
    } catch (error) {
      console.error('Error loading track:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayPause = async () => {
    try {
      // Feedback tátil suave
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      if (playbackState.isPlaying) {
        await musicService.pauseTrack('player');
      } else {
        if (track && (!playbackState.currentTrack || playbackState.currentTrack.id !== track.id)) {
          // Usa as informações de playlist atuais se existirem
          const currentPlaylist = playbackState.currentPlaylist || allTracks;
          await musicService.playTrack(track, currentPlaylist, playbackState.playlistName, playbackState.playlistId);
        } else {
          await musicService.resumeTrack();
        }
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  };

  const handleNext = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await musicService.playNext();
    } catch (error) {
      console.error('Error playing next track:', error);
    }
  };

  const handlePrevious = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await musicService.playPrevious();
    } catch (error) {
      console.error('Error playing previous track:', error);
    }
  };

  const handleSeek = async (value: number) => {
    try {
      if (playbackState.duration > 0) {
        const positionMillis = value * playbackState.duration * 1000;
        
        // Atualiza o estado local imediatamente para feedback visual
        setPlaybackState(prev => ({
          ...prev,
          position: value * playbackState.duration
        }));
        
        await musicService.seekTo(positionMillis);
      }
    } catch (error) {
      console.error('Error seeking:', error);
    }
  };

  const handleToggleShuffle = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await musicService.toggleShuffle();
    // Atualiza o estado para refletir a mudança na UI
    setPlaybackState(musicService.getPlaybackState());
  };

  const handleToggleRepeat = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await musicService.toggleRepeat();
    // Atualiza o estado para refletir a mudança na UI
    setPlaybackState(musicService.getPlaybackState());
  };
  
  const handleShareTrack = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      if (!currentTrack) return;
      
      const shareMessage = `🎵 Estou ouvindo "${safeTitle}" por ${safeArtist} no PulseZen! ✨\n\nBaixe o PulseZen e desfrute de músicas relaxantes para meditação e bem-estar!`;
      
      // Usando o Share API da React Native para compartilhar a música
      const result = await Share.share({ 
        message: shareMessage,
        title: `${safeTitle} - PulseZen`
      });
    } catch (error) {
      console.error('Erro ao compartilhar música:', error);
    }
  };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressValue = (): number => {
    if (isSliding) {
      return slidingValue;
    }
    if (playbackState.duration === 0) return 0;
    return playbackState.position / playbackState.duration;
  };

  const currentTrack = playbackState.currentTrack || track;

  // Se currentTrack for null, exibe tela de erro amigável
  if (!currentTrack) {
    return (
      <SafeInsets>
        {(insets) => (
          <LinearGradient
            colors={['#b096df', '#a58ad7', '#9c7ed0']} // Roxo suave
            style={styles.fullScreen}
          >
            <View style={[styles.container, { paddingTop: insets.top + 60 }]}> 
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Música não encontrada</Text>
                <Button
                  label="Voltar"
                  variant="primary"
                  onPress={() => router.back()}
                  style={styles.backButtonError}
                />
              </View>
            </View>
          </LinearGradient>
        )}
      </SafeInsets>
    );
  }
  
  // Fallbacks seguros para campos de texto
  const safeIcon = typeof currentTrack.icon === 'string' ? currentTrack.icon : '🌊';
  const safeTitle = typeof currentTrack.title === 'string' ? String(currentTrack.title) : 'Sem título';
  const safeArtist = typeof currentTrack.artist === 'string' ? String(currentTrack.artist) : 'PulseZen Sounds';
  const safeCategory = typeof currentTrack.categoryTitle === 'string' ? String(currentTrack.categoryTitle) : 'Relaxamento';

  const handleMenuPress = () => {
    if (playbackState.currentPlaylist && playbackState.playlistName) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setShowPlaylistModal(true);
    }
  };

  const handlePlaylistTrackSelect = async (selectedTrack: MusicTrack) => {
    try {
      setShowPlaylistModal(false);
      
      if (selectedTrack.id !== currentTrack?.id) {
        await musicService.playTrack(
          selectedTrack, 
          playbackState.currentPlaylist, 
          playbackState.playlistName,
          playbackState.playlistId
        );
      }
    } catch (error) {
      console.error('Error selecting playlist track:', error);
    }
  };

  return (
    <SafeInsets>
      {(insets) => (
        <LinearGradient
          colors={['#BA9CFF', '#A586F0', '#9979E0']} // Roxo mais suave como na nova imagem
          start={{x: 0, y: 0}}
          end={{x: 0, y: 1}}
          style={styles.fullScreen}
        >
          <Animated.View 
            style={[
              styles.container, 
              { 
                paddingTop: insets.top,
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
              }
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.iconButton}
              >
                <Ionicons name="chevron-back" size={28} color="white" />
              </TouchableOpacity>
              
              <Text style={styles.headerTitle}>
                Reproduzindo
              </Text>
              
              {playbackState.currentPlaylist && playbackState.playlistName ? (
                <TouchableOpacity 
                  style={styles.iconButton}
                  onPress={handleMenuPress}
                >
                  <Ionicons name="menu" size={28} color="white" />
                </TouchableOpacity>
              ) : (
                <View style={styles.iconButton} />
              )}
            </View>

            {/* Main Content Container */}
            <View style={styles.mainContent}>
              {/* Album Art Container */}
              <View style={styles.albumContainer}>
                <Animated.View 
                  style={[
                    styles.albumArt,
                    { transform: [{ scale: albumBreathingAnim }] }
                  ]}
                >
                  <View style={styles.albumImage}>
                    {/* Exibe o ícone associado à música */}
                    <Text style={styles.albumIcon}>
                      {safeIcon}
                    </Text>
                  </View>
                  {/* Renderização de elemento visual de áudio */}
                  <View style={styles.waveformOverlay}>
                    {playbackState.isPlaying && (
                      <Animated.View 
                        style={[
                          styles.pulsingDot,
                          { transform: [{ scale: pulsingDotAnim }] }
                        ]} 
                      />
                    )}
                  </View>
                </Animated.View>
              </View>

              {/* Track Information */}
              <View style={styles.trackInfoSection}>
                <Text style={styles.trackTitle} numberOfLines={2}>
                  {safeTitle}
                </Text>
                <Text style={styles.trackArtist} numberOfLines={1}>
                  {safeArtist}
                </Text>
                <Text style={styles.trackCategory}>
                  {safeCategory}
                </Text>
              </View>
            </View>

            {/* Progress Slider */}
            <View style={styles.progressSection}>
              <TouchableOpacity
                style={styles.progressBar}
                activeOpacity={1}
                onLayout={(event) => {
                  const { width, x } = event.nativeEvent.layout;
                  setProgressBarLayout({ width, x });
                }}
                onPress={handleProgressBarPress}
                {...progressPanResponder.panHandlers}
              >
                <View style={styles.progressBg} />
                <View style={[
                  styles.progressFill, 
                  {width: `${getProgressValue() * 100}%`}
                ]} />
                <View
                  style={[
                    styles.progressDot,
                    {left: `${getProgressValue() * 100}%`, marginLeft: -10}
                  ]}
                />
              </TouchableOpacity>
              <View style={styles.timeLabels}>
                <Text style={styles.timeText}>
                  {formatTime(playbackState.position || 0)}
                </Text>
                <Text style={styles.timeText}>
                  {formatTime(playbackState.duration || 0)}
                </Text>
              </View>
            </View>

            {/* Main Controls */}
            <View style={styles.controlsSection}>
              <TouchableOpacity 
                style={[
                  styles.controlButton,
                  (!playbackState.currentPlaylist || playbackState.currentPlaylist.length <= 1) && styles.disabledButton
                ]} 
                onPress={handlePrevious}
                activeOpacity={(!playbackState.currentPlaylist || playbackState.currentPlaylist.length <= 1) ? 1 : 0.6}
                disabled={!playbackState.currentPlaylist || playbackState.currentPlaylist.length <= 1}
              >
                <Ionicons 
                  name="play-back" 
                  size={28} 
                  color={(!playbackState.currentPlaylist || playbackState.currentPlaylist.length <= 1) ? 'rgba(255, 255, 255, 0.3)' : 'white'} 
                />
              </TouchableOpacity>
              
              <Animated.View style={{ transform: [{ scale: playButtonPulse }] }}>
                <TouchableOpacity
                  onPress={handlePlayPause}
                  style={styles.playButton}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={playbackState.isPlaying ? 'pause' : 'play'}
                    size={36}
                    color="white"
                    style={!playbackState.isPlaying && { marginLeft: 4 }}
                  />
                </TouchableOpacity>
              </Animated.View>
              
              <TouchableOpacity 
                style={[
                  styles.controlButton,
                  (!playbackState.currentPlaylist || playbackState.currentPlaylist.length <= 1) && styles.disabledButton
                ]} 
                onPress={handleNext}
                activeOpacity={(!playbackState.currentPlaylist || playbackState.currentPlaylist.length <= 1) ? 1 : 0.6}
                disabled={!playbackState.currentPlaylist || playbackState.currentPlaylist.length <= 1}
              >
                <Ionicons 
                  name="play-forward" 
                  size={28} 
                  color={(!playbackState.currentPlaylist || playbackState.currentPlaylist.length <= 1) ? 'rgba(255, 255, 255, 0.3)' : 'white'} 
                />
              </TouchableOpacity>
            </View>

            {/* Bottom Controls */}
            <View style={[
              styles.bottomControlsSection, 
              {paddingBottom: insets.bottom > 0 ? insets.bottom : 20}
            ]}>
              <TouchableOpacity 
                style={[
                  styles.bottomButton,
                  playbackState.repeatMode !== 'off' && styles.activeBottomButton
                ]}
                onPress={handleToggleRepeat}
                activeOpacity={0.6}
              >
                {playbackState.repeatMode === 'one' ? (
                  <View style={styles.iconContainer}>
                    <Ionicons name="repeat" size={24} color="white" />
                    <Text style={styles.repeatOneIndicator}>1</Text>
                  </View>
                ) : playbackState.repeatMode === 'all' ? (
                  <Ionicons name="repeat" size={24} color="white" />
                ) : (
                  <Ionicons name="repeat-outline" size={24} color="white" />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.bottomButton,
                  playbackState.shuffleMode && styles.activeBottomButton
                ]}
                onPress={handleToggleShuffle}
                activeOpacity={0.6}
              >
                <Ionicons 
                  name={playbackState.shuffleMode ? "shuffle" : "shuffle-outline"} 
                  size={24} 
                  color="white" 
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.bottomButton}
                onPress={handleShareTrack}
                activeOpacity={0.6}
              >
                <Ionicons name="share-social-outline" size={24} color="white" />
              </TouchableOpacity>
            </View>

            {/* Playlist Modal */}
            {playbackState.currentPlaylist && playbackState.playlistName && (
              <PlaylistModal
                visible={showPlaylistModal}
                onClose={() => setShowPlaylistModal(false)}
                onTrackSelect={handlePlaylistTrackSelect}
                currentTrackId={currentTrack?.id}
                tracks={playbackState.currentPlaylist}
                playlistName={playbackState.playlistName}
              />
            )}
          </Animated.View>
        </LinearGradient>
      )}
    </SafeInsets>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    width: '100%',
    height: '100%'
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    textAlign: 'center',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  albumContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  albumArt: {
    width: width * 0.75,
    height: width * 0.75,
    borderRadius: 32, // Retângulo com cantos bem arredondados
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 15,
  },
  albumImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5FC',
    display: 'flex',
  },
  albumIcon: {
    fontSize: width * 0.3,
    textAlign: 'center',
    lineHeight: width * 0.75,
  },
  trackInfoSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  trackTitle: {
    fontSize: Math.min(fontSize.xxl, width * 0.065),
    fontFamily: 'Inter-Bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: spacing.sm,
    maxWidth: '90%',
    letterSpacing: 0.3,
  },
  trackArtist: {
    fontSize: fontSize.lg,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    marginBottom: spacing.sm,
    letterSpacing: 0.2,
  },
  trackCategory: {
    fontSize: fontSize.md,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.75)',
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  progressSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  progressBar: {
    width: '100%',
    height: 22, // Área de toque maior
    borderRadius: 3,
    backgroundColor: 'transparent',
    position: 'relative',
    marginBottom: spacing.sm,
    justifyContent: 'center',
    paddingVertical: 8, // Área de toque vertical
  },
  progressBg: {
    position: 'absolute',
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    top: '50%',
    marginTop: -3, // Centraliza verticalmente
  },
  progressFill: {
    position: 'absolute',
    height: 6,
    backgroundColor: 'white',
    borderRadius: 3,
    top: '50%',
    marginTop: -3, // Centraliza verticalmente
  },
  progressDot: {
    position: 'absolute',
    width: 20, // Ligeiramente maior para melhor interação
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    top: '50%',
    marginTop: -10, // Centraliza verticalmente
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  timeLabels: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
  },
  timeText: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  controlsSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.xl,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.4,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#7F55D0', // Cor roxa sólida
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  bottomControlsSection: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  bottomButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
  },
  errorText: {
    fontSize: fontSize.lg,
    fontFamily: 'Inter-Regular',
    color: 'white',
    textAlign: 'center',
  },
  backButtonError: {
    marginTop: spacing.md,
  },
  activeBottomButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
  },
  repeatOneIndicator: {
    position: 'absolute',
    fontSize: fontSize.xs,
    fontFamily: 'Inter-Bold',
    color: 'white',
    bottom: 10,
    right: 14,
  },
  waveformOverlay: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
  },
  pulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(127, 85, 208, 0.8)',
    margin: 2,
  },
  iconContainer: {
    position: 'relative',
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
