import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Modal,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Card from '@/components/base/Card';
import ScreenContainer from '@/components/base/ScreenContainer';
import SearchAndActionBar from '@/components/SearchAndActionBar';
import StatsBar from '@/components/StatsBar';
import { ThemedText } from '@/components/ThemedText';
import TipsSection from '@/components/TipsSection';
import { colors } from '@/constants/theme';
import { fontSize, spacing } from '@/utils/responsive';

// Importar os novos hooks da API
import { useJournalEntries, useJournalStats } from '@/hooks/useJournalApi';

import { JournalEntriesList, JournalEntryView } from '../components';
import { JournalEntry } from '../types';

export default function JournalScreenWithApi() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Usar os novos hooks da API
  const {
    entries: journalEntries,
    loading: entriesLoading,
    error: entriesError,
    loadEntries,
    deleteEntry,
    refresh: refreshEntries
  } = useJournalEntries();

  const {
    stats,
    loading: statsLoading,
    error: statsError,
    refresh: refreshStats
  } = useJournalStats();

  // Carrega entradas ao montar a tela
  useEffect(() => {
    loadEntries(true);
  }, []);

  // Recarrega dados ao focar na tela
  useFocusEffect(
    useCallback(() => {
      refreshEntries();
      refreshStats();
    }, [refreshEntries, refreshStats])
  );

  // Tratar erros
  useEffect(() => {
    if (entriesError) {
      Alert.alert('Erro', entriesError);
    }
  }, [entriesError]);

  useEffect(() => {
    if (statsError) {
      Alert.alert('Erro', statsError);
    }
  }, [statsError]);

  const handleEntryPress = (entryId: string) => {
    const entry = journalEntries.find(e => e.id === entryId);
    if (entry) {
      setSelectedEntry(entry);
      setModalVisible(true);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedEntry(null);
  };

  const handleDeleteEntry = async (entryId: string) => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir esta entrada?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEntry(entryId);
              Alert.alert('Sucesso', 'Entrada excluída com sucesso');
              handleCloseModal();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir a entrada');
            }
          }
        }
      ]
    );
  };

  const handleCreateEntry = () => {
    router.push('/journal-entry');
  };

  // Mapeia os dados da API para o formato esperado pelo componente de lista
  const entriesList = journalEntries.map(entry => ({
    id: entry.id,
    date: new Date(entry.createdAt).toLocaleDateString('pt-BR', {
      day: '2-digit', 
      month: 'short', 
      year: '2-digit'
    }),
    title: entry.title || entry.category || 'Reflexão',
    preview: entry.content,
    mood: {
      label: entry.category || '',
      color: '#FFA726',
      bg: '#FFF3E0',
      icon: 'book',
    },
    tags: [], // Será mapeado quando os tags estiverem disponíveis na API
    wordCount: entry.wordCount,
    readingTime: entry.readingTime
  }));

  // Mapear stats da API para o formato esperado
  const mappedStats = stats ? {
    totalEntries: stats.totalEntries,
    uniqueDays: stats.entriesThisMonth, // Usar aproximação
    percentPositive: 75 // Calcular baseado no sentiment quando disponível
  } : { totalEntries: 0, uniqueDays: 0, percentPositive: 0 };

  const { width, height } = Dimensions.get('window');

  return (
    <ScreenContainer
      gradientColors={colors.gradients.journal}
      gradientHeight={height * 0.4}
    >
      <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
        {/* Custom Header */}
        <View style={styles.customHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={colors.primary.main} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Diário</ThemedText>
          <TouchableOpacity onPress={refreshEntries} style={styles.headerRight}>
            <Ionicons name="refresh" size={24} color={colors.primary.main} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Search and Action Bar */}
          <SearchAndActionBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onAddPress={handleCreateEntry}
            placeholder="Buscar nas suas reflexões..."
          />

          {/* Stats Bar */}
          {statsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary.main} />
            </View>
          ) : (
            <StatsBar stats={mappedStats} />
          )}

          {/* Tips Section */}
          <TipsSection 
            tips={[
              "Escreva sobre algo pelo qual você é grato hoje",
              "Reflita sobre um momento que te fez sorrir",
              "Descreva como você está se sentindo agora"
            ]} 
          />

          {/* Journal Entries */}
          <Card style={styles.entriesCard}>
            <View style={styles.entriesHeader}>
              <ThemedText style={styles.entriesTitle}>Suas Reflexões</ThemedText>
              <ThemedText style={styles.entriesCount}>
                {mappedStats.totalEntries} {mappedStats.totalEntries === 1 ? 'entrada' : 'entradas'}
              </ThemedText>
            </View>

            {entriesLoading && journalEntries.length === 0 ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary.main} />
                <ThemedText style={styles.loadingText}>Carregando entradas...</ThemedText>
              </View>
            ) : journalEntries.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="book-outline" size={48} color={colors.text.light} />
                <ThemedText style={styles.emptyTitle}>Nenhuma entrada ainda</ThemedText>
                <ThemedText style={styles.emptySubtitle}>
                  Comece sua jornada de autoconhecimento criando sua primeira entrada
                </ThemedText>
                <TouchableOpacity style={styles.createButton} onPress={handleCreateEntry}>
                  <ThemedText style={styles.createButtonText}>Criar primeira entrada</ThemedText>
                </TouchableOpacity>
              </View>
            ) : (
              <JournalEntriesList
                entries={entriesList}
                onEntryPress={handleEntryPress}
                searchQuery={searchQuery}
              />
            )}
          </Card>
        </ScrollView>

        {/* Entry Detail Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={handleCloseModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {selectedEntry && (
                <JournalEntryView
                  entry={{
                    id: selectedEntry.id,
                    date: new Date(selectedEntry.createdAt).toLocaleDateString('pt-BR'),
                    title: selectedEntry.title || 'Reflexão',
                    text: selectedEntry.content,
                    moodTags: [],
                    promptCategory: selectedEntry.category || 'Reflexão',
                    wordCount: selectedEntry.wordCount,
                    readingTime: selectedEntry.readingTime
                  }}
                  onClose={handleCloseModal}
                  onEdit={() => {
                    handleCloseModal();
                    router.push(`/journal-entry?id=${selectedEntry.id}`);
                  }}
                  onDelete={() => handleDeleteEntry(selectedEntry.id)}
                />
              )}
            </View>
          </View>
        </Modal>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.text.primary,
  },
  headerRight: {
    padding: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  entriesCard: {
    margin: spacing.lg,
    marginTop: spacing.md,
  },
  entriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  entriesTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text.primary,
  },
  entriesCount: {
    fontSize: fontSize.sm,
    color: colors.text.light,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.text.light,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontSize: fontSize.sm,
    color: colors.text.light,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  createButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  createButtonText: {
    color: colors.text.white,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    padding: spacing.lg,
  },
});

export default JournalScreenWithApi;
