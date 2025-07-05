import Button from '@/components/base/Button';
import Card from '@/components/base/Card';
import ScreenContainer from '@/components/base/ScreenContainer';
import { ThemedText } from '@/components/ThemedText';
import { colors } from '@/constants/theme';
import musicService from '@/services/musicService';
import { MusicTrack, Playlist } from '@/types/music';
import { fontSize, spacing } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    View,
    ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function PlaylistsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [allTracks, setAllTracks] = useState<MusicTrack[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [playlistsData, tracksData] = await Promise.all([
        musicService.getPlaylists(),
        musicService.getAllTracks()
      ]);
      
      setPlaylists(playlistsData);
      setAllTracks(tracksData);
      
      // Select first playlist by default
      if (playlistsData.length > 0) {
        setSelectedPlaylist(playlistsData[0]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Erro', 'Não foi possível carregar as playlists');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayTrack = async (track: MusicTrack) => {
    // Se está tocando uma música de uma playlist, passa o playlistId
    if (selectedPlaylist) {
      router.push(`/music-player?trackId=${track.id}&playlistId=${selectedPlaylist.id}`);
    } else {
      router.push(`/music-player?trackId=${track.id}`);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getTotalDuration = (tracks: MusicTrack[]): number => {
    return tracks.reduce((total, track) => total + track.duration, 0);
  };

  const renderTrackItem = ({ item }: { item: MusicTrack }) => (
    <Card style={styles.trackCard}>
      <TouchableOpacity
        style={styles.trackContent}
        onPress={() => handlePlayTrack(item)}
      >
        <View style={styles.trackInfo}>
          <View style={styles.trackIcon}>
            <ThemedText style={styles.trackEmoji}>{item.icon}</ThemedText>
          </View>
          <View style={styles.trackDetails}>
            <ThemedText style={styles.trackTitle}>{item.title}</ThemedText>
            <ThemedText style={styles.trackArtist}>{item.artist}</ThemedText>
            <ThemedText style={styles.trackCategory}>{item.categoryTitle}</ThemedText>
          </View>
        </View>
        
        <View style={styles.trackActions}>
          <ThemedText style={styles.trackDuration}>
            {item.durationFormatted}
          </ThemedText>
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => handlePlayTrack(item)}
          >
            <Ionicons name="play" size={18} color={colors.sleep.accent} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Card>
  );

  const renderPlaylistItem = ({ item }: { item: Playlist }) => (
    <TouchableOpacity
      style={[
        styles.playlistItem,
        selectedPlaylist?.id === item.id && styles.selectedPlaylistItem
      ]}
      onPress={() => setSelectedPlaylist(item)}
    >
      <View style={styles.playlistItemContent}>
        <ThemedText style={styles.playlistItemName}>{item.name}</ThemedText>
        <ThemedText style={styles.playlistItemCount}>
          {item.tracks.length} música{item.tracks.length !== 1 ? 's' : ''}
        </ThemedText>
      </View>
      {selectedPlaylist?.id === item.id && (
        <Ionicons name="checkmark-circle" size={20} color={colors.sleep.accent} />
      )}
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <ScreenContainer gradientColors={colors.gradients.sleep}>
        <View style={[styles.container, { paddingTop: insets.top + 60 }]}>
          <View style={styles.loadingContainer}>
            <ThemedText style={styles.loadingText}>Carregando playlists...</ThemedText>
          </View>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      gradientColors={colors.gradients.sleep}
      gradientHeight={height * 0.3}
    >
      <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={28} color={colors.neutral.white} />
          </TouchableOpacity>
          
          <ThemedText style={styles.headerTitle}>
            Minhas Playlists
          </ThemedText>
          
          <View style={{width: 44}} />
        </View>

        <View style={styles.content}>
          {/* Playlists List */}
          <View style={styles.playlistsSection}>
            <ThemedText style={styles.sectionTitle}>Playlists</ThemedText>
            <FlatList
              horizontal
              data={playlists}
              renderItem={renderPlaylistItem}
              keyExtractor={(item) => `playlist-${item.id}`}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.playlistsList}
            />
          </View>

          {/* Selected Playlist Details */}
          {selectedPlaylist && (
            <View style={styles.playlistDetails}>
              <View style={styles.playlistHeader}>
                <View style={styles.playlistInfo}>
                  <ThemedText style={styles.playlistName}>
                    {selectedPlaylist.name}
                  </ThemedText>
                  {selectedPlaylist.description && (
                    <ThemedText style={styles.playlistDescription}>
                      {selectedPlaylist.description}
                    </ThemedText>
                  )}
                  <ThemedText style={styles.playlistMeta}>
                    {selectedPlaylist.tracks.length} música{selectedPlaylist.tracks.length !== 1 ? 's' : ''} • {' '}
                    {formatDuration(getTotalDuration(selectedPlaylist.tracks))}
                  </ThemedText>
                  <ThemedText style={styles.playlistDate}>
                    Criada em {formatDate(selectedPlaylist.createdAt)}
                  </ThemedText>
                </View>
                
                {selectedPlaylist.tracks.length > 0 && (
                  <Button
                    label="Reproduzir Tudo"
                    variant="primary"
                    size="small"
                    onPress={() => handlePlayTrack(selectedPlaylist.tracks[0])}
                    style={styles.playAllButton}
                  />
                )}
              </View>

              {/* Tracks List */}
              <View style={styles.tracksSection}>
                {selectedPlaylist.tracks.length > 0 ? (
                  <FlatList
                    data={selectedPlaylist.tracks}
                    renderItem={renderTrackItem}
                    keyExtractor={(item, index) => `track-${selectedPlaylist.id}-${item.id}-${index}`}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.tracksList}
                  />
                ) : (
                  <View style={styles.emptyState}>
                    <Ionicons name="musical-notes-outline" size={48} color={colors.neutral.text.secondary} />
                    <ThemedText style={styles.emptyText}>
                      Esta playlist está vazia
                    </ThemedText>
                    <ThemedText style={styles.emptySubtext}>
                      Adicione músicas para começar a ouvir
                    </ThemedText>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Funcionalidade de criar playlist removida */}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
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
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.neutral.white + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontFamily: 'Inter-SemiBold',
    color: colors.neutral.white,
  },
  // addButton removido - funcionalidade descontinuada
  content: {
    flex: 1,
  },
  playlistsSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontFamily: 'Inter-SemiBold',
    color: colors.neutral.text.primary,
    marginBottom: spacing.md,
  },
  playlistsList: {
    paddingRight: spacing.md,
  },
  playlistItem: {
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
    padding: spacing.md,
    marginRight: spacing.sm,
    minWidth: 150,
    shadowColor: colors.neutral.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedPlaylistItem: {
    backgroundColor: colors.sleep.secondary,
    borderWidth: 2,
    borderColor: colors.sleep.accent,
  },
  playlistItemContent: {
    marginBottom: spacing.xs,
  },
  playlistItemName: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-SemiBold',
    color: colors.neutral.text.primary,
    marginBottom: spacing.xs,
  },
  playlistItemCount: {
    fontSize: fontSize.xs,
    fontFamily: 'Inter-Regular',
    color: colors.neutral.text.secondary,
  },
  playlistDetails: {
    flex: 1,
  },
  playlistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    padding: spacing.lg,
    shadowColor: colors.neutral.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  playlistInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  playlistName: {
    fontSize: fontSize.lg,
    fontFamily: 'Inter-Bold',
    color: colors.neutral.text.primary,
    marginBottom: spacing.xs,
  },
  playlistDescription: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: colors.neutral.text.secondary,
    marginBottom: spacing.sm,
    lineHeight: fontSize.sm * 1.4,
  },
  playlistMeta: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Medium',
    color: colors.sleep.accent,
    marginBottom: spacing.xs,
  },
  playlistDate: {
    fontSize: fontSize.xs,
    fontFamily: 'Inter-Regular',
    color: colors.neutral.text.secondary,
  },
  playAllButton: {
    alignSelf: 'flex-start' as const,
    backgroundColor: colors.sleep.accent,
  },
  tracksSection: {
    flex: 1,
  },
  tracksList: {
    paddingBottom: spacing.xl,
  },
  trackCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: colors.neutral.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  trackContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  trackIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.sleep.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  trackEmoji: {
    fontSize: 18,
  },
  trackDetails: {
    flex: 1,
  },
  trackTitle: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-SemiBold',
    color: colors.neutral.text.primary,
    marginBottom: spacing.xs,
  },
  trackArtist: {
    fontSize: fontSize.xs,
    fontFamily: 'Inter-Regular',
    color: colors.neutral.text.secondary,
    marginBottom: spacing.xs,
  },
  trackCategory: {
    fontSize: fontSize.xs,
    fontFamily: 'Inter-Regular',
    color: colors.sleep.accent,
  },
  trackActions: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  trackDuration: {
    fontSize: fontSize.xs,
    fontFamily: 'Inter-Medium',
    color: colors.neutral.text.secondary,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(127, 102, 204, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontSize: fontSize.md,
    fontFamily: 'Inter-SemiBold',
    color: colors.neutral.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: colors.neutral.text.secondary,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: fontSize.lg,
    fontFamily: 'Inter-Regular',
    color: colors.neutral.white,
  },
  // Estilos do modal de criação de playlist foram removidos
});
