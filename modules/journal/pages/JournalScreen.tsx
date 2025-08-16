import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Dimensions, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Card from '@/components/base/Card';
import ScreenContainer from '@/components/base/ScreenContainer';
import SearchAndActionBar from '@/components/SearchAndActionBar';
import StatsBar from '@/components/StatsBar';
import { ThemedText } from '@/components/ThemedText';
import TipsSection from '@/components/TipsSection';
import { colors } from '@/constants/theme';
import { useAccessibilityProps, useScreenReaderAnnouncement } from '@/hooks/useAccessibility';
import { fontSize, spacing } from '@/utils/responsive';

import { JournalEntriesList, JournalEntryView } from '../components';
import { JournalService, JournalStatsService } from '../services';
import { JournalEntry } from '../types';

export default function JournalScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [stats, setStats] = useState({ totalEntries: 0, uniqueDays: 0, percentPositive: 0 });
  const [isSearching, setIsSearching] = useState(false);

  // Accessibility hooks
  const { createButtonProps } = useAccessibilityProps();
  const { announceNavigation, announceActionComplete } = useScreenReaderAnnouncement();

  // Simulated search delay for better UX feedback
  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
    if (text.trim().length > 0) {
      setIsSearching(true);
      // Simulate search delay
      setTimeout(() => {
        setIsSearching(false);
      }, 300);
    } else {
      setIsSearching(false);
    }
  }, []);

  // Carrega entradas e stats ao montar e ao retornar para a tela
  useEffect(() => {
    const loadEntries = async () => {
      const entries = await JournalService.getEntries();
      setJournalEntries(entries);
      setStats(JournalStatsService.calculateStats(entries));
      
      // Announce page content for screen readers
      announceNavigation(
        'Tela do Diário',
        `Página do diário carregada. Você tem ${entries.length} entradas no seu diário. Use a barra de pesquisa para encontrar entradas específicas ou toque no botão adicionar para criar uma nova entrada.`
      );
    };
    loadEntries();
  }, [announceNavigation]);

  useFocusEffect(
    useCallback(() => {
      const loadEntries = async () => {
        const entries = await JournalService.getEntries();
        setJournalEntries(entries);
        setStats(JournalStatsService.calculateStats(entries));
      };
      loadEntries();
    }, [])
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

  // Mapeia os dados para o formato esperado pelo componente de lista
  const entriesList = journalEntries
    .filter(entry => {
      // Se não há busca, mostra todas
      if (!searchQuery.trim()) return true;
      
      const query = searchQuery.toLowerCase().trim();
      
      // Busca no conteúdo da entrada
      const matchesContent = entry.content.toLowerCase().includes(query);
      
      // Busca na categoria/título
      const matchesCategory = (entry.promptCategory || '').toLowerCase().includes(query);
      
      // Busca nas tags de humor
      const matchesMoodTags = entry.moodTags.some(tag => 
        tag.label.toLowerCase().includes(query) || 
        tag.emoji.includes(query)
      );
      
      // Busca na data (formato brasileiro)
      const dateStr = new Date(entry.createdAt).toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'long', year: 'numeric'
      }).toLowerCase();
      const matchesDate = dateStr.includes(query);
      
      return matchesContent || matchesCategory || matchesMoodTags || matchesDate;
    })
    .map(entry => ({
      id: entry.id,
      date: new Date(entry.createdAt).toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'short', year: '2-digit'
      }),
      title: entry.promptCategory || 'Reflexão',
      preview: entry.content,
      mood: {
        label: entry.moodTags[0] ? `${entry.moodTags[0].emoji} ${entry.moodTags[0].label}` : '',
        color: '#FFA726',
        bg: '#FFF3E0',
        icon: 'book',
      },
      tags: entry.moodTags.map(tag => `${tag.emoji} ${tag.label}`) || [],
    }));

  const { width, height } = Dimensions.get('window');

  return (
    <ScreenContainer
      gradientColors={colors.gradients.journal}
      gradientHeight={height * 0.4}
    >
      <View style={[styles.container]}>
        {/* Custom Header */}
        <View style={styles.customHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
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

        <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SearchAndActionBar
          searchPlaceholder="Pesquisar por conteúdo, categoria, humor..."
          searchValue={searchQuery}
          onSearchChange={handleSearchChange}
          buttonLabel=""
          onButtonPress={() => router.push('/journal-entry')}
          style={{ marginBottom: spacing.md }}
          isSearching={isSearching}
          searchResultsCount={entriesList.length}
          showSearchTips={journalEntries.length > 0 && searchQuery.trim().length === 0}
        />

        <Card style={styles.statsCard}>
          <StatsBar
            stats={[
              { value: stats.totalEntries, label: 'Entradas' },
              { value: stats.uniqueDays, label: 'Dias' },
              { value: `${stats.percentPositive}%`, label: 'Positivas' },
            ]}
          />
        </Card>

        <JournalEntriesList
          entries={entriesList}
          onEntryPress={handleEntryPress}
          searchQuery={searchQuery}
        />

        <TipsSection
          title="Dicas para um diário eficaz"
          tips={[
            'Escreva regularmente, mesmo que por apenas 5 minutos',
            'Seja honesto com seus sentimentos e pensamentos',
            'Não se preocupe com gramática ou estrutura',
            'Revise entradas antigas para observar padrões e crescimento',
          ]}
          style={styles.tipsCard}
        />
      </ScrollView>

      {/* Modal de leitura do diário */}
      <Modal
        visible={modalVisible && !!selectedEntry}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.dragBar} />
            {/* Botão de fechar reformulado */}
            <TouchableOpacity 
              style={styles.modernCloseButton} 
              onPress={handleCloseModal}
              activeOpacity={0.7}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <Ionicons name="close" size={22} color={colors.primary.main} />
            </TouchableOpacity>
            {selectedEntry && (
              <JournalEntryView
                prompt=""
                promptCategory={selectedEntry.promptCategory}
                moodTags={selectedEntry.moodTags.map(tag => `${tag.emoji} ${tag.label}`)}
                text={selectedEntry.content}
                date={new Date(selectedEntry.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' })}
                onBack={handleCloseModal}
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
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyticsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontFamily: 'Inter-SemiBold',
    color: colors.primary.main,
  },
  headerRight: {
    width: 40,
    height: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  statsCard: {
    padding: 15,
    marginBottom: 20,
  },
  tipsCard: {
    padding: 20,
    marginBottom: 20,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    minHeight: '100%',
    maxHeight: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 24,
    paddingBottom: 32,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 16,
    alignItems: 'stretch',
  },
  dragBar: {
    alignSelf: 'center',
    width: 48,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E0E0E0',
    marginBottom: 18,
  },
  closeModalButton: {
    position: 'absolute',
    top: 18,
    right: 18,
    zIndex: 10,
    backgroundColor: 'rgba(255, 152, 0, 0.10)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  modernCloseButton: {
    position: 'absolute',
    top: 60, // Positioned lower for easier access
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF', // Using white directly
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0', // Light gray border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 999,
  },
  closeModalText: {
    fontSize: 28,
    color: '#FFA726',
    fontWeight: 'bold',
    lineHeight: 32,
  },
});
