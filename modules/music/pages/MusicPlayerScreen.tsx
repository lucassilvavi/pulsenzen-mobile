import Button from '@/components/base/Button';
import { SafeInsets } from '@/components/SafeInsets';
import { fontSize, spacing } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    PanResponder,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { PlaylistModal } from '../components';
import usePlayback from '../hooks/usePlayback';
import musicService from '../services/MusicService';
import { MusicTrack, PlaybackState } from '../types';

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
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      const { locationX } = evt.nativeEvent;
      const { width: barWidth } = progressBarLayout;
      const percentage = Math.max(0, Math.min(1, locationX / barWidth));
      
      setIsSliding(true);
      setSlidingValue(percentage);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    onPanResponderMove: (evt) => {
      const { locationX } = evt.nativeEvent;
      const { width: barWidth } = progressBarLayout;
      const percentage = Math.max(0, Math.min(1, locationX / barWidth));
      
      setSlidingValue(percentage);
    },
    onPanResponderRelease: async () => {
      try {
        await musicService.seekTo(slidingValue * playbackState.duration * 1000);
        setIsSliding(false);
        setSlidingValue(0);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (error) {
        console.error('Erro ao definir posição:', error);
        setIsSliding(false);
        setSlidingValue(0);
      }
    },
  });

  const { handleNext, handlePrevious } = usePlayback();

  useEffect(() => {
    const unsubscribe = musicService.addPlaybackListener(setPlaybackState);
    return unsubscribe;
  }, []);

  // Sincronização inicial
  useEffect(() => {
    const syncWithService = async () => {
      try {
        const currentState = musicService.getPlaybackState();
        setPlaybackState(currentState);
        
        if (currentState.currentTrack) {
          setTrack(currentState.currentTrack);
          if (currentState.currentPlaylist) {
            setAllTracks(currentState.currentPlaylist);
          }
        } else if (params.trackId && typeof params.trackId === 'string') {
          // Só carrega nova música se não há música tocando
          const categories = await musicService.getCategories();
          let foundTrack: MusicTrack | null = null;
          let foundPlaylist: MusicTrack[] = [];
          
          for (const category of categories) {
            foundTrack = category.tracks.find((t: MusicTrack) => t.id === params.trackId) || null;
            if (foundTrack) {
              foundPlaylist = category.tracks;
              break;
            }
          }
          
          if (foundTrack) {
            setTrack(foundTrack);
            setAllTracks(foundPlaylist);
            await musicService.playTrack(foundTrack, foundPlaylist);
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Erro ao sincronizar com o serviço:', error);
        setIsLoading(false);
      }
    };

    syncWithService();
  }, [params.trackId]);

  // Função para compartilhar música
  const shareTrack = async () => {
    if (!track) return;
    
    try {
      await Share.share({
        message: `Ouça "${track.title}" no PulseZen! 🎵`,
        title: track.title,
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  // Função para alternar reprodução/pausa
  const togglePlayPause = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (playbackState.isPlaying) {
        await musicService.pauseTrack('player');
      } else {
        if (playbackState.currentTrack) {
          await musicService.resumeTrack();
        } else if (track) {
          await musicService.playTrack(track, allTracks);
        }
      }
    } catch (error) {
      console.error('Erro ao alternar reprodução:', error);
    }
  };

  // Funções de controle
  const toggleRepeat = async () => {
    await musicService.toggleRepeat();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const toggleShuffle = async () => {
    await musicService.toggleShuffle();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Formatação de tempo
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Cálculo do progresso
  const getProgressPercentage = (): number => {
    if (isSliding) return slidingValue * 100;
    if (playbackState.duration === 0) return 0;
    return (playbackState.position / playbackState.duration) * 100;
  };

  // Função para selecionar música da playlist
  const onTrackSelect = async (selectedTrack: MusicTrack) => {
    try {
      setShowPlaylistModal(false);
      await musicService.playTrack(selectedTrack, allTracks);
      setTrack(selectedTrack);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error('Erro ao selecionar música:', error);
    }
  };

  if (isLoading) {
    return (
      <LinearGradient colors={['#0a0a0a', '#1a1a2e', '#16213e']} style={styles.container}>
        <SafeInsets>
          {(insets) => (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Carregando...</Text>
            </View>
          )}
        </SafeInsets>
      </LinearGradient>
    );
  }

  if (!track) {
    return (
      <LinearGradient colors={['#0a0a0a', '#1a1a2e', '#16213e']} style={styles.container}>
        <SafeInsets>
          {(insets) => (
            <View style={styles.errorContainer}>
              <Ionicons name="musical-notes-outline" size={64} color="rgba(255,255,255,0.3)" />
              <Text style={styles.errorText}>Nenhuma música encontrada</Text>
              <Button 
                label="Voltar" 
                onPress={() => router.back()}
                variant="secondary"
                style={styles.backButton}
              />
            </View>
          )}
        </SafeInsets>
      </LinearGradient>
    );
  }

  return (
    <>
      <LinearGradient colors={['#0a0a0a', '#1a1a2e', '#16213e']} style={styles.container}>
        <SafeInsets>
          {(insets) => (
            <>
              {/* Header */}
              <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                  <Ionicons name="chevron-back" size={28} color="white" />
                </TouchableOpacity>
                
                <View style={styles.headerCenter}>
                  <Text style={styles.headerTitle}>Tocando Agora</Text>
                  <Text style={styles.headerSubtitle} numberOfLines={1}>
                    {playbackState.playlistName || 'Música'}
                  </Text>
                </View>
                
                <TouchableOpacity onPress={shareTrack} style={styles.shareButton}>
                  <Ionicons name="share-outline" size={24} color="white" />
                </TouchableOpacity>
              </View>

              {/* Track Image/Icon */}
              <View style={styles.trackImageContainer}>
                <View style={styles.trackImageWrapper}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                    style={styles.trackImage}
                  >
                    <Text style={styles.trackEmoji}>{track.icon || '🎵'}</Text>
                  </LinearGradient>
                </View>
              </View>

              {/* Track Info */}
              <View style={styles.trackInfo}>
                <Text style={styles.trackTitle} numberOfLines={2}>
                  {track.title}
                </Text>
                <Text style={styles.trackArtist} numberOfLines={1}>
                  {track.artist || 'PulseZen Sounds'}
                </Text>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressSection}>
                <View 
                  style={styles.progressBarContainer}
                  onLayout={(event) => {
                    const { width, x } = event.nativeEvent.layout;
                    setProgressBarLayout({ width, x });
                  }}
                  {...progressPanResponder.panHandlers}
                >
                  <View style={styles.progressBarBackground}>
                    <View 
                      style={[
                        styles.progressBarFill, 
                        { width: `${getProgressPercentage()}%` }
                      ]} 
                    />
                    <View 
                      style={[
                        styles.progressThumb,
                        { left: `${getProgressPercentage()}%` }
                      ]}
                    />
                  </View>
                </View>
                
                <View style={styles.timeLabels}>
                  <Text style={styles.timeText}>
                    {formatTime(isSliding ? slidingValue * playbackState.duration : playbackState.position)}
                  </Text>
                  <Text style={styles.timeText}>
                    {formatTime(playbackState.duration)}
                  </Text>
                </View>
              </View>

              {/* Controls */}
              <View style={styles.controls}>
                <View style={styles.secondaryControls}>
                  <TouchableOpacity 
                    onPress={toggleShuffle}
                    style={[styles.secondaryControlButton, playbackState.shuffleMode && styles.activeControl]}
                  >
                    <Ionicons 
                      name="shuffle" 
                      size={22} 
                      color={playbackState.shuffleMode ? "#7F55D0" : "rgba(255,255,255,0.6)"} 
                    />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    onPress={toggleRepeat}
                    style={[styles.secondaryControlButton, playbackState.repeatMode !== 'off' && styles.activeControl]}
                  >
                    <Ionicons 
                      name={playbackState.repeatMode === 'one' ? "repeat-outline" : "repeat"} 
                      size={22} 
                      color={playbackState.repeatMode !== 'off' ? "#7F55D0" : "rgba(255,255,255,0.6)"} 
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.mainControls}>
                  <TouchableOpacity onPress={handlePrevious} style={styles.controlButton}>
                    <Ionicons name="play-skip-back" size={calculateDimension(32)} color="white" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity onPress={togglePlayPause} style={styles.playButton}>
                    <Ionicons 
                      name={playbackState.isPlaying ? "pause" : "play"} 
                      size={calculateDimension(36)} 
                      color="white" 
                    />
                  </TouchableOpacity>
                  
                  <TouchableOpacity onPress={handleNext} style={styles.controlButton}>
                    <Ionicons name="play-skip-forward" size={calculateDimension(32)} color="white" />
                  </TouchableOpacity>
                </View>

                <View style={styles.secondaryControls}>
                  <TouchableOpacity 
                    onPress={() => setShowPlaylistModal(true)}
                    style={styles.secondaryControlButton}
                  >
                    <Ionicons name="list" size={22} color="rgba(255,255,255,0.6)" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    onPress={shareTrack}
                    style={styles.secondaryControlButton}
                  >
                    <Ionicons name="heart-outline" size={22} color="rgba(255,255,255,0.6)" />
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </SafeInsets>
      </LinearGradient>

      {/* Playlist Modal */}
      <PlaylistModal
        visible={showPlaylistModal}
        onClose={() => setShowPlaylistModal(false)}
        playlistName={playbackState.playlistName || 'Playlist'}
        tracks={allTracks}
        currentTrackId={track.id}
        onTrackSelect={onTrackSelect}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: fontSize.lg,
    fontFamily: 'Inter-Medium',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  errorText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: fontSize.lg,
    fontFamily: 'Inter-Medium',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: spacing.md,
  },
  headerTitle: {
    color: 'white',
    fontSize: fontSize.md,
    fontFamily: 'Inter-SemiBold',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackImageContainer: {
    alignItems: 'center',
    marginVertical: calculateDimension(40, 0.8),
  },
  trackImageWrapper: {
    width: calculateDimension(280),
    height: calculateDimension(280),
    borderRadius: calculateDimension(140),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  trackImage: {
    width: '100%',
    height: '100%',
    borderRadius: calculateDimension(140),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  trackEmoji: {
    fontSize: calculateDimension(80),
    textAlign: 'center',
  },
  trackInfo: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: calculateDimension(40, 0.8),
  },
  trackTitle: {
    color: 'white',
    fontSize: calculateDimension(24, 0.9),
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    marginBottom: spacing.xs,
    lineHeight: calculateDimension(28, 0.9),
  },
  trackArtist: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: calculateDimension(16, 0.9),
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  progressSection: {
    paddingHorizontal: spacing.xl,
    marginBottom: calculateDimension(50, 0.8),
  },
  progressBarContainer: {
    paddingVertical: spacing.sm,
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    position: 'relative',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#7F55D0',
    borderRadius: 2,
  },
  progressThumb: {
    position: 'absolute',
    top: -6,
    width: 16,
    height: 16,
    backgroundColor: '#7F55D0',
    borderRadius: 8,
    marginLeft: -8,
    shadowColor: '#7F55D0',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  timeText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: calculateDimension(12, 0.9),
    fontFamily: 'Inter-Medium',
  },
  controls: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  secondaryControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: spacing.lg,
  },
  secondaryControlButton: {
    width: calculateDimension(44),
    height: calculateDimension(44),
    borderRadius: calculateDimension(22),
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeControl: {
    backgroundColor: 'rgba(127, 85, 208, 0.2)',
  },
  mainControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  controlButton: {
    width: calculateDimension(60),
    height: calculateDimension(60),
    borderRadius: calculateDimension(30),
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
  },
  playButton: {
    width: calculateDimension(80),
    height: calculateDimension(80),
    borderRadius: calculateDimension(40),
    backgroundColor: '#7F55D0',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    shadowColor: '#7F55D0',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
});
