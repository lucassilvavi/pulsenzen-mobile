import { MusicTrack } from '@/types/music';
import { fontSize, spacing } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    Dimensions,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface PlaylistModalProps {
  visible: boolean;
  onClose: () => void;
  playlistName: string;
  tracks: MusicTrack[];
  currentTrackId?: string;
  onTrackSelect: (track: MusicTrack) => void;
}

export default function PlaylistModal({
  visible,
  onClose,
  playlistName,
  tracks,
  currentTrackId,
  onTrackSelect
}: PlaylistModalProps) {

  const renderTrackItem = ({ item }: { item: MusicTrack }) => {
    const isCurrentTrack = item.id === currentTrackId;
    
    return (
      <TouchableOpacity
        style={[styles.trackItem, isCurrentTrack && styles.currentTrackItem]}
        onPress={() => onTrackSelect(item)}
        activeOpacity={0.7}
      >
        <View style={styles.trackInfo}>
          <Text style={[styles.trackTitle, isCurrentTrack && styles.currentTrackText]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[styles.trackArtist, isCurrentTrack && styles.currentTrackSubtext]} numberOfLines={1}>
            {item.artist || 'Artista Desconhecido'}
          </Text>
        </View>
        
        <View style={styles.trackRight}>
          <Text style={[styles.trackDuration, isCurrentTrack && styles.currentTrackSubtext]}>
            {item.durationFormatted}
          </Text>
          {isCurrentTrack && (
            <Ionicons name="musical-notes" size={20} color="#7F55D0" style={{ marginLeft: spacing.sm }} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.modalTitle}>Playlist</Text>
            <Text style={styles.playlistName} numberOfLines={1}>
              {playlistName}
            </Text>
            <Text style={styles.trackCount}>
              {tracks.length} {tracks.length === 1 ? 'música' : 'músicas'}
            </Text>
          </View>
        </View>

        {/* Track List */}
        <FlatList
          data={tracks}
          renderItem={renderTrackItem}
          keyExtractor={(item) => item.id}
          style={styles.trackList}
          contentContainerStyle={styles.trackListContent}
          showsVerticalScrollIndicator={false}
          initialScrollIndex={tracks.findIndex(t => t.id === currentTrackId)}
          getItemLayout={(data, index) => ({
            length: 72,
            offset: 72 * index,
            index,
          })}
          onScrollToIndexFailed={() => {}}
        />
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButton: {
    alignSelf: 'flex-end',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerContent: {
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: spacing.xs,
  },
  playlistName: {
    fontSize: fontSize.xl,
    fontFamily: 'Inter-Bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  trackCount: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  trackList: {
    flex: 1,
  },
  trackListContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
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
  currentTrackItem: {
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
  currentTrackText: {
    color: '#7F55D0',
  },
  currentTrackSubtext: {
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
});
