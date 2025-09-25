import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  Modal,
  RefreshControl,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Card from '@/components/base/Card';
import ScreenContainer from '@/components/base/ScreenContainer';
import StatsBar from '@/components/StatsBar';
import { ThemedText } from '@/components/ThemedText';
import { colors } from '@/constants/theme';
import { useAccessibilityProps, useScreenReaderAnnouncement } from '@/hooks/useAccessibility';
import { fontSize, spacing } from '@/utils/responsive';

import { JournalEntryCardFlat, JournalEntryView } from '../components';
import { useJournalInfiniteScroll } from '../hooks/useJournalInfiniteScroll';
import { JournalStatsService } from '../services';
import { JournalEntry } from '../types';

export default function JournalScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [stats, setStats] = useState({ totalEntries: 0, uniqueDays: 0, percentPositive: 0 });
  const [isSearching, setIsSearching] = useState(false);

  // Use the new infinite scroll hook
  const {
    entries: journalEntries,
    loading,
    refreshing,
    hasMore,
    error,
    loadMore,
    refresh,
    applyFilters,
    clearFilters
  } = useJournalInfiniteScroll();

  // Accessibility hooks
  const { createButtonProps } = useAccessibilityProps();
  const { announceNavigation, announceActionComplete } = useScreenReaderAnnouncement();

  // Update stats when entries change
  useEffect(() => {
    setStats(JournalStatsService.calculateStats(journalEntries));
  }, [journalEntries]);

  // Announce navigation when component mounts
  useEffect(() => {
    announceNavigation(
      'Tela do Diário',
      `Página do diário carregada. Você tem ${journalEntries.length} entradas no seu diário. Use a barra de pesquisa para encontrar entradas específicas ou toque no botão adicionar para criar uma nova entrada.`
    );
  }, [announceNavigation, journalEntries.length]);

  // Handle search with debounce and apply filters
  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
    setIsSearching(true);
    
    // Debounce search
    const timeoutId = setTimeout(async () => {
      if (text.trim().length > 0) {
        await applyFilters({ search: text.trim() });
      } else {
        await clearFilters();
      }
      setIsSearching(false);
    }, 300);

    // Cleanup timeout on next call
    return () => clearTimeout(timeoutId);
  }, [applyFilters, clearFilters]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const handleEntryPress = (entryId: string) => {
    const entry = journalEntries.find(e => e.id === entryId);
    if (entry) {
      setSelectedEntry(entry);
      setModalVisible(true);
      announceActionComplete(
        'Abrir entrada',
        'success',
        `Entrada do diário de ${new Date(entry.createdAt).toLocaleDateString('pt-BR')} aberta.`
      );
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedEntry(null);
  };

  // Render item for FlatList
  const renderJournalEntry: ListRenderItem<JournalEntry> = ({ item }) => (
    <JournalEntryCardFlat 
      entry={item} 
      onPress={handleEntryPress}
    />
  );

  // Render empty state
  const renderEmptyComponent = () => {
    if (loading && journalEntries.length === 0) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <ThemedText style={styles.emptyTitle}>Carregando entradas...</ThemedText>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error.main} />
          <ThemedText style={styles.emptyTitle}>Erro ao carregar entradas</ThemedText>
          <ThemedText style={styles.emptyDescription}>{error}</ThemedText>
          <TouchableOpacity 
            onPress={refresh}
            style={styles.retryButton}
          >
            <ThemedText style={styles.retryText}>Tentar novamente</ThemedText>
          </TouchableOpacity>
        </View>
      );
    }

    if (searchQuery.trim()) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="search" size={48} color={colors.neutral.text.secondary} />
          <ThemedText style={styles.emptyTitle}>Nenhuma entrada encontrada</ThemedText>
          <ThemedText style={styles.emptyDescription}>
            Não encontramos entradas com "{searchQuery}"
          </ThemedText>
          <TouchableOpacity 
            onPress={() => {
              setSearchQuery('');
              clearFilters();
            }}
            style={styles.retryButton}
          >
            <ThemedText style={styles.retryText}>Limpar busca</ThemedText>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Ionicons name="book-outline" size={48} color={colors.neutral.text.secondary} />
        <ThemedText style={styles.emptyTitle}>Seu diário está vazio</ThemedText>
        <ThemedText style={styles.emptyDescription}>
          Comece criando sua primeira entrada!{'\n'}
          Use o botão + no header para começar.
        </ThemedText>
        <TouchableOpacity 
          onPress={() => router.push('/journal-entry')}
          style={styles.retryButton}
        >
          <ThemedText style={styles.retryText}>Criar primeira entrada</ThemedText>
        </TouchableOpacity>
      </View>
    );
  };

  // Render footer with loading indicator
  const renderFooter = () => {
    if (!hasMore) return null;
    
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={colors.primary.main} />
        <ThemedText style={styles.loadingText}>Carregando mais entradas...</ThemedText>
      </View>
    );
  };

  // Render header component (only stats and tips now)
  const renderHeader = () => (
    <>
      <Card style={styles.statsCard}>
        <StatsBar
          stats={[
            { value: stats.totalEntries, label: 'Entradas' },
            { value: stats.uniqueDays, label: 'Dias' },
            { value: `${stats.percentPositive}%`, label: 'Positivas' },
          ]}
        />
      </Card>
    </>
  );

  return (
    <ScreenContainer style={styles.container}>
      <View style={[styles.customHeader, { paddingTop: insets.top }]}>
        {/* Top Row - Navigation and Title */}
        <View style={styles.headerTopRow}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={styles.backButton}
            {...createButtonProps('Botão Voltar', 'Voltar para a tela anterior')}
          >
            <Ionicons name="chevron-back" size={24} color={colors.primary.main} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Diário</ThemedText>
          <TouchableOpacity 
            onPress={() => router.push('/journal-analytics')} 
            style={styles.analyticsButton}
            {...createButtonProps('Botão de Analytics', 'Navegar para tela de estatísticas do diário')}
          >
            <Ionicons name="stats-chart" size={24} color={colors.primary.main} />
          </TouchableOpacity>
        </View>

        {/* Bottom Row - Search and Add Button */}
        <View style={styles.headerBottomRow}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={colors.neutral.text.secondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Pesquisar por conteúdo, categoria, humor..."
              placeholderTextColor={colors.neutral.text.secondary}
              value={searchQuery}
              onChangeText={handleSearchChange}
              returnKeyType="search"
              {...createButtonProps('Campo de busca', 'Digite para buscar entradas do diário')}
            />
            {(searchQuery.length > 0 || isSearching) && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  clearFilters();
                }}
                style={styles.clearSearchButton}
                {...createButtonProps('Limpar busca', 'Limpar campo de busca')}
              >
                {isSearching ? (
                  <ActivityIndicator size="small" color={colors.neutral.text.secondary} />
                ) : (
                  <Ionicons name="close-circle" size={20} color={colors.neutral.text.secondary} />
                )}
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity 
            onPress={() => router.push('/journal-entry')}
            style={styles.addButton}
            {...createButtonProps('Adicionar entrada', 'Criar nova entrada no diário')}
          >
            <Ionicons name="add" size={24} color={colors.neutral.background} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={journalEntries}
        renderItem={renderJournalEntry}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyComponent}
        ListFooterComponent={renderFooter}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[colors.primary.main]}
          />
        }
        contentContainerStyle={styles.flatListContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Modal de leitura do diário */}
      <Modal
        visible={modalVisible && !!selectedEntry}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseModal}
      >
        {selectedEntry && (
          <JournalEntryView
            entry={selectedEntry}
            onBack={handleCloseModal}
          />
        )}
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  customHeader: {
    flexDirection: 'column',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.neutral.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.divider,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  headerBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.card,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.neutral.divider,
    minHeight: 44, // Better touch target
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.neutral.text.primary,
    paddingVertical: spacing.xs,
  },
  clearSearchButton: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
  addButton: {
    backgroundColor: colors.primary.main,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 48,
    minHeight: 48,
    // Shadow for better visibility
    shadowColor: colors.primary.main,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.neutral.text.primary,
  },
  analyticsButton: {
    padding: spacing.xs,
  },
  flatListContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  statsCard: {
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  tipsCard: {
    margin: spacing.lg,
    padding: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.neutral.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: fontSize.md,
    color: colors.neutral.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    marginTop: spacing.md,
  },
  retryText: {
    color: colors.primary.contrast,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  loadingFooter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  loadingText: {
    fontSize: fontSize.sm,
    color: colors.neutral.text.secondary,
    marginTop: spacing.xs,
  },
});