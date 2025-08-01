import Button from '@/components/base/Button';
import Card from '@/components/base/Card';
import ScreenContainer from '@/components/base/ScreenContainer';
import { ThemedText } from '@/components/ThemedText';
import { colors } from '@/constants/theme';
import MusicService from '@/modules/music/services/MusicService';
import { MusicCategory, MusicTrack } from '@/modules/music/types';
import { fontSize, spacing } from '@/utils/responsive';
import { logger } from '@/utils/secureLogger';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
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

const { width, height } = Dimensions.get('window');

export default function CategoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  
  const [category, setCategory] = useState<MusicCategory | null>(null);
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCategoryData();
  }, []);

  const loadCategoryData = async () => {
    try {
      setIsLoading(true);
      const categoryId = params.categoryId as string;
      
      if (!categoryId) {
        Alert.alert('Erro', 'Categoria não encontrada');
        router.back();
        return;
      }

      const [categories, categoryTracks] = await Promise.all([
        MusicService.getCategories(),
        MusicService.getTracksByCategory(categoryId)
      ]);

      const foundCategory = categories.find((cat: MusicCategory) => cat.id === categoryId);
      
      if (!foundCategory) {
        Alert.alert('Erro', 'Categoria não encontrada');
        router.back();
        return;
      }

      setCategory(foundCategory);
      setTracks(categoryTracks);
    } catch (error) {
      logger.error('CategoryScreen', 'Error loading category data', error instanceof Error ? error : new Error(String(error)));
      Alert.alert('Erro', 'Não foi possível carregar a categoria');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayTrack = (track: MusicTrack) => {
    // Passa o nome da categoria como playlistName para identificar que é uma "playlist" de categoria
    router.push(`/music-player?trackId=${track.id}&playlistName=${encodeURIComponent(category?.title || '')}`);
  };

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      handlePlayTrack(tracks[0]);
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getTotalDuration = (): number => {
    return tracks.reduce((total, track) => total + track.duration, 0);
  };

  const renderTrackItem = ({ item, index }: { item: MusicTrack; index: number }) => (
    <Card style={styles.trackCard}>
      <TouchableOpacity
        style={styles.trackContent}
        onPress={() => handlePlayTrack(item)}
      >
        <View style={styles.trackNumber}>
          <ThemedText style={styles.trackNumberText}>
            {(index + 1).toString().padStart(2, '0')}
          </ThemedText>
        </View>

        <View style={styles.trackIcon}>
          <ThemedText style={styles.trackEmoji}>{item.icon}</ThemedText>
        </View>

        <View style={styles.trackDetails}>
          <ThemedText style={styles.trackTitle}>{item.title}</ThemedText>
          <ThemedText style={styles.trackArtist}>{item.artist}</ThemedText>
          {item.description && (
            <ThemedText style={styles.trackDescription} numberOfLines={2}>
              {item.description}
            </ThemedText>
          )}
        </View>

        <View style={styles.trackMeta}>
          <ThemedText style={styles.trackDuration}>
            {item.durationFormatted}
          </ThemedText>
          <TouchableOpacity style={styles.playButton}>
            <Ionicons name="play" size={16} color={colors.neutral.white} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Card>
  );

  const renderHeader = () => (
    <View style={styles.headerContent}>
      {/* Category Info */}
      <View style={styles.categoryInfo}>
        <View style={styles.categoryIconContainer}>
          <ThemedText style={styles.categoryIcon}>
            {category?.icon}
          </ThemedText>
        </View>
        
        <View style={styles.categoryDetails}>
          <ThemedText style={styles.categoryTitle}>
            {category?.title}
          </ThemedText>
          <ThemedText style={styles.categoryDescription}>
            {category?.description}
          </ThemedText>
          <ThemedText style={styles.categoryMeta}>
            {tracks.length} música{tracks.length !== 1 ? 's' : ''} • {' '}
            {formatDuration(getTotalDuration())}
          </ThemedText>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <Button
          label="Reproduzir Tudo"
          variant="primary"
          size="large"
          fullWidth
          onPress={handlePlayAll}
          style={styles.playAllButton}
          disabled={tracks.length === 0}
        />
        
        <View style={styles.secondaryActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="heart-outline" size={24} color={colors.neutral.text.primary} />
            <ThemedText style={styles.actionText}>Favoritar</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="download-outline" size={24} color={colors.neutral.text.primary} />
            <ThemedText style={styles.actionText}>Download</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-outline" size={24} color={colors.neutral.text.primary} />
            <ThemedText style={styles.actionText}>Compartilhar</ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tracks Header */}
      <View style={styles.tracksHeader}>
        <ThemedText style={styles.tracksTitle}>
          Todas as Faixas
        </ThemedText>
        <TouchableOpacity style={styles.sortButton}>
          <Ionicons name="swap-vertical" size={20} color={colors.neutral.text.secondary} />
          <ThemedText style={styles.sortText}>Ordenar</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <ScreenContainer gradientColors={colors.gradients.sleep}>
        <View style={[styles.container, { paddingTop: insets.top + 60 }]}>
          <View style={styles.loadingContainer}>
            <ThemedText style={styles.loadingText}>Carregando categoria...</ThemedText>
          </View>
        </View>
      </ScreenContainer>
    );
  }

  if (!category) {
    return (
      <ScreenContainer gradientColors={colors.gradients.sleep}>
        <View style={[styles.container, { paddingTop: insets.top + 60 }]}>
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>Categoria não encontrada</ThemedText>
            <Button
              label="Voltar"
              variant="primary"
              onPress={() => router.back()}
              style={styles.backButton}
            />
          </View>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      gradientColors={colors.gradients.sleep}
      gradientHeight={height * 0.4}
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
            {category.title}
          </ThemedText>
          
          <TouchableOpacity
            onPress={() => logger.debug('CategoryScreen', 'Search button pressed')}
            style={styles.searchButton}
          >
            <Ionicons name="search" size={24} color={colors.neutral.white} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <FlatList
          data={tracks}
          renderItem={renderTrackItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Ionicons name="musical-notes-outline" size={48} color={colors.neutral.text.secondary} />
              <ThemedText style={styles.emptyText}>
                Nenhuma faixa encontrada
              </ThemedText>
              <ThemedText style={styles.emptySubtext}>
                Esta categoria ainda não possui conteúdo
              </ThemedText>
            </View>
          )}
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
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.neutral.white + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  headerContent: {
    marginBottom: spacing.lg,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: colors.neutral.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.sleep.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  categoryIcon: {
    fontSize: 32,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: fontSize.xl,
    fontFamily: 'Inter-Bold',
    color: colors.neutral.text.primary,
    marginBottom: spacing.xs,
  },
  categoryDescription: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: colors.neutral.text.secondary,
    lineHeight: fontSize.sm * 1.4,
    marginBottom: spacing.sm,
  },
  categoryMeta: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Medium',
    color: colors.sleep.accent,
  },
  actionsContainer: {
    marginBottom: spacing.lg,
  },
  playAllButton: {
    marginBottom: spacing.md,
    shadowColor: colors.neutral.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
    paddingVertical: spacing.md,
    shadowColor: colors.neutral.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButton: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionText: {
    fontSize: fontSize.xs,
    fontFamily: 'Inter-Medium',
    color: colors.neutral.text.secondary,
  },
  tracksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  tracksTitle: {
    fontSize: fontSize.lg,
    fontFamily: 'Inter-SemiBold',
    color: colors.neutral.text.primary,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sortText: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Medium',
    color: colors.neutral.text.secondary,
  },
  trackCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
    padding: spacing.md,
    shadowColor: colors.neutral.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  trackContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackNumber: {
    width: 30,
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  trackNumberText: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Medium',
    color: colors.neutral.text.secondary,
  },
  trackIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.sleep.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  trackEmoji: {
    fontSize: 20,
  },
  trackDetails: {
    flex: 1,
    marginRight: spacing.md,
  },
  trackTitle: {
    fontSize: fontSize.md,
    fontFamily: 'Inter-SemiBold',
    color: colors.neutral.text.primary,
    marginBottom: spacing.xs,
  },
  trackArtist: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: colors.neutral.text.secondary,
    marginBottom: spacing.xs,
  },
  trackDescription: {
    fontSize: fontSize.xs,
    fontFamily: 'Inter-Regular',
    color: colors.neutral.text.secondary,
    lineHeight: fontSize.xs * 1.3,
  },
  trackMeta: {
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
    backgroundColor: colors.sleep.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  separator: {
    height: spacing.sm,
  },
  emptyState: {
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
  },
  errorText: {
    fontSize: fontSize.lg,
    fontFamily: 'Inter-Regular',
    color: colors.neutral.white,
    textAlign: 'center',
  },
});
