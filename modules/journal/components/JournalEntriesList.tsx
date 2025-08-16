import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { colors } from '@/constants/theme';
import { fontSize, spacing } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import JournalEntryCard from './JournalEntryCard';

type Entry = {
  id: string;
  date: string;
  title: string;
  preview: string;
  mood: { label: string; color: string; bg: string; icon: string };
  tags: string[];
};

type JournalEntriesListProps = {
  entries: Entry[];
  onEntryPress: (id: string) => void;
  sectionTitle?: string;
  searchQuery?: string;
};

export default function JournalEntriesList({
  entries,
  onEntryPress,
  sectionTitle = 'Entradas do Diário',
  searchQuery = '',
}: JournalEntriesListProps) {
  
  // Se há busca e nenhum resultado
  if (searchQuery.trim() && entries.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          {sectionTitle}
        </ThemedText>
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="search" size={48} color={colors.neutral.text.secondary} />
          </View>
          <ThemedText style={styles.emptyTitle}>
            Nenhuma entrada encontrada
          </ThemedText>
          <ThemedText style={styles.emptyDescription}>
            Não encontramos entradas com "{searchQuery}".{'\n'}
            Tente buscar por:
          </ThemedText>
          <View style={styles.searchTips}>
            <ThemedText style={styles.searchTip}>• Palavras do texto da entrada</ThemedText>
            <ThemedText style={styles.searchTip}>• Emoções (feliz, triste, ansioso...)</ThemedText>
            <ThemedText style={styles.searchTip}>• Categorias (gratidão, reflexão...)</ThemedText>
            <ThemedText style={styles.searchTip}>• Datas (janeiro, dezembro...)</ThemedText>
          </View>
        </View>
      </ThemedView>
    );
  }
  
  // Se não há entradas (sem busca)
  if (!searchQuery.trim() && entries.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          {sectionTitle}
        </ThemedText>
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="book-outline" size={48} color={colors.neutral.text.secondary} />
          </View>
          <ThemedText style={styles.emptyTitle}>
            Seu diário está vazio
          </ThemedText>
          <ThemedText style={styles.emptyDescription}>
            Comece criando sua primeira entrada!{'\n'}
            Toque no botão + para começar.
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerContainer}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          {sectionTitle}
        </ThemedText>
        {searchQuery.trim() && (
          <ThemedText style={styles.resultCount}>
            {entries.length} resultado{entries.length !== 1 ? 's' : ''} encontrado{entries.length !== 1 ? 's' : ''}
          </ThemedText>
        )}
      </View>
      {entries.map(entry => (
        <JournalEntryCard
          key={entry.id}
          date={entry.date}
          title={entry.title}
          preview={entry.preview}
          mood={entry.mood}
          tags={entry.tags}
          onPress={() => onEntryPress(entry.id)}
        />
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  headerContainer: {
    marginBottom: 15,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  resultCount: {
    fontSize: fontSize.sm,
    color: colors.neutral.text.secondary,
    fontFamily: 'Inter-Medium',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
    paddingHorizontal: spacing.lg,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.neutral.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontFamily: 'Inter-Bold',
    color: colors.neutral.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptyDescription: {
    fontSize: fontSize.md,
    color: colors.neutral.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  searchTips: {
    alignSelf: 'stretch',
  },
  searchTip: {
    fontSize: fontSize.sm,
    color: colors.neutral.text.secondary,
    marginBottom: spacing.xs,
    paddingLeft: spacing.sm,
  },
});