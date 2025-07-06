import Button from '@/components/base/Button';
import Card from '@/components/base/Card';
import ScreenContainer from '@/components/base/ScreenContainer';
import TextInput from '@/components/base/TextInput';
import { ThemedText } from '@/components/ThemedText';
import { colors } from '@/constants/theme';
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
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MusicService } from '../services';
import { MusicTrack, Playlist } from '../types';

const { width, height } = Dimensions.get('window');

export default function PlaylistsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [allTracks, setAllTracks] = useState<MusicTrack[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [customPlaylistTracks, setCustomPlaylistTracks] = useState<MusicTrack[]>([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [playlistsData, tracksData] = await Promise.all([
        MusicService.getPlaylists(),
        MusicService.getAllTracks()
      ]);
      setPlaylists(playlistsData);
      setAllTracks(tracksData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar as playlists');
    }
  };

  const handlePlaylistPress = (playlist: Playlist) => {
    router.push({
      pathname: '/music-player',
      params: { 
        playlistId: playlist.id,
        trackId: playlist.tracks[0]?.id 
      }
    });
  };

  const startCreatePlaylist = () => {
    setIsCreatingPlaylist(true);
    setCustomPlaylistTracks([]);
    setNewPlaylistName('');
  };

  const toggleTrackSelection = (track: MusicTrack) => {
    setCustomPlaylistTracks(prev => {
      const isSelected = prev.some(t => t.id === track.id);
      if (isSelected) {
        return prev.filter(t => t.id !== track.id);
      } else {
        return [...prev, track];
      }
    });
  };

  const saveCustomPlaylist = () => {
    if (!newPlaylistName.trim()) {
      Alert.alert('Erro', 'Por favor, digite um nome para a playlist');
      return;
    }

    if (customPlaylistTracks.length === 0) {
      Alert.alert('Erro', 'Selecione pelo menos uma música');
      return;
    }

    const newPlaylist: Playlist = {
      id: `custom-${Date.now()}`,
      name: newPlaylistName.trim(),
      description: `Playlist personalizada com ${customPlaylistTracks.length} músicas`,
      tracks: customPlaylistTracks,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setPlaylists(prev => [...prev, newPlaylist]);
    setIsCreatingPlaylist(false);
    Alert.alert('Sucesso', 'Playlist criada com sucesso!');
  };

  const renderPlaylistItem = ({ item }: { item: Playlist }) => (
    <Card style={styles.playlistCard}>
      <TouchableOpacity
        style={styles.playlistContent}
        onPress={() => handlePlaylistPress(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.playlistCover, { backgroundColor: colors.sleep.primary }]}>
          <Ionicons 
            name="moon-outline" 
            size={32} 
            color="white" 
          />
        </View>
        
        <View style={styles.playlistInfo}>
          <ThemedText style={styles.playlistName}>{item.name}</ThemedText>
          <ThemedText style={styles.playlistDescription}>{item.description}</ThemedText>
          <ThemedText style={styles.trackCount}>
            {item.tracks.length} {item.tracks.length === 1 ? 'música' : 'músicas'}
          </ThemedText>
        </View>

        <TouchableOpacity style={styles.playButton}>
          <Ionicons name="play" size={24} color="white" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Card>
  );

  const renderTrackItem = ({ item }: { item: MusicTrack }) => {
    const isSelected = customPlaylistTracks.some(t => t.id === item.id);
    
    return (
      <TouchableOpacity
        style={[styles.trackItem, isSelected && styles.selectedTrackItem]}
        onPress={() => toggleTrackSelection(item)}
        activeOpacity={0.7}
      >
        <View style={styles.trackInfo}>
          <ThemedText style={[styles.trackTitle, isSelected && styles.selectedTrackText]} numberOfLines={1}>
            {item.title}
          </ThemedText>
          <ThemedText style={[styles.trackArtist, isSelected && styles.selectedTrackSubtext]} numberOfLines={1}>
            {item.artist || 'Artista Desconhecido'}
          </ThemedText>
        </View>
        
        <View style={styles.trackRight}>
          <ThemedText style={[styles.trackDuration, isSelected && styles.selectedTrackSubtext]}>
            {item.durationFormatted}
          </ThemedText>
          {isSelected && (
            <Ionicons name="checkmark-circle" size={20} color={colors.sleep.accent} style={{ marginLeft: spacing.sm }} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (isCreatingPlaylist) {
    return (
      <ScreenContainer
        gradientColors={colors.gradients.sleep}
        gradientHeight={height}
      >
        <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setIsCreatingPlaylist(false)}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <ThemedText style={styles.screenTitle}>Nova Playlist</ThemedText>
            <View style={styles.backButton} />
          </View>

          <View style={styles.createPlaylistContent}>
            <Card style={styles.playlistNameCard}>
              <ThemedText style={styles.inputLabel}>Nome da Playlist</ThemedText>
              <TextInput
                style={styles.playlistNameInput}
                value={newPlaylistName}
                onChangeText={setNewPlaylistName}
                placeholder="Digite o nome da playlist..."
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
              />
            </Card>

            <ThemedText style={styles.sectionTitle}>
              Selecione as Músicas ({customPlaylistTracks.length} selecionadas)
            </ThemedText>

            <FlatList
              data={allTracks}
              renderItem={renderTrackItem}
              keyExtractor={(item) => item.id}
              style={styles.trackList}
              contentContainerStyle={styles.trackListContent}
              showsVerticalScrollIndicator={false}
            />

            <Button
              label={`Criar Playlist (${customPlaylistTracks.length} músicas)`}
              variant="primary"
              onPress={saveCustomPlaylist}
              disabled={customPlaylistTracks.length === 0 || !newPlaylistName.trim()}
              style={styles.createButton}
            />
          </View>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      gradientColors={colors.gradients.sleep}
      gradientHeight={height}
    >
      <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
        <View style={styles.header}>
          <ThemedText style={styles.screenTitle}>Playlists</ThemedText>
          <TouchableOpacity
            style={styles.addButton}
            onPress={startCreatePlaylist}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={playlists}
          renderItem={renderPlaylistItem}
          keyExtractor={(item) => item.id}
          style={styles.playlistList}
          contentContainerStyle={styles.playlistListContent}
          showsVerticalScrollIndicator={false}
          numColumns={1}
        />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: fontSize.xxl,
    fontFamily: 'Inter-Bold',
    color: 'white',
    textAlign: 'center',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playlistList: {
    flex: 1,
  },
  playlistListContent: {
    paddingBottom: spacing.xl,
  },
  playlistCard: {
    marginBottom: spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  playlistContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  playlistCover: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  playlistInfo: {
    flex: 1,
  },
  playlistName: {
    fontSize: fontSize.lg,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: 4,
  },
  playlistDescription: {
    fontSize: fontSize.sm,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  trackCount: {
    fontSize: fontSize.xs,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.sleep.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Create playlist styles
  createPlaylistContent: {
    flex: 1,
  },
  playlistNameCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputLabel: {
    fontSize: fontSize.md,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginBottom: spacing.sm,
  },
  playlistNameInput: {
    fontSize: fontSize.md,
    color: 'white',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: spacing.md,
  },
  trackList: {
    flex: 1,
    marginBottom: spacing.lg,
  },
  trackListContent: {
    paddingBottom: spacing.lg,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  selectedTrackItem: {
    backgroundColor: 'rgba(127, 85, 208, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(127, 85, 208, 0.3)',
  },
  trackInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  trackTitle: {
    fontSize: fontSize.md,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginBottom: 2,
  },
  trackArtist: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  selectedTrackText: {
    color: colors.sleep.accent,
  },
  selectedTrackSubtext: {
    color: 'rgba(127, 85, 208, 0.8)',
  },
  trackRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackDuration: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  createButton: {
    marginBottom: spacing.xl,
  },
});
