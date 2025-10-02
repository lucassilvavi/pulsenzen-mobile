import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Card from '@/components/base/Card';
import { colors } from '@/constants/theme';
import suggestionApiService from '@/modules/suggestions/services/SuggestionApiService';
import { SUGGESTION_CATEGORIES, SuggestionDetail } from '@/modules/suggestions/types';
import { fontSize, spacing } from '@/utils/responsive';
import { logger } from '@/utils/secureLogger';
import Markdown from 'react-native-markdown-display';

const { width, height } = Dimensions.get('window');

export default function SuggestionReadingScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const [suggestion, setSuggestion] = useState<SuggestionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(null);

  const suggestionId = params.suggestionId as string;
  const userSuggestionId = params.userSuggestionId as string;

  useEffect(() => {
    loadSuggestion();
  }, [suggestionId]);

  useEffect(() => {
    // Mark as read when content is loaded
    if (suggestion && !suggestion.isRead) {
      markAsRead();
    }
  }, [suggestion]);

  const loadSuggestion = async () => {
    try {
      setLoading(true);
      setError(null);
      const suggestionData = await suggestionApiService.getSuggestionById(suggestionId);
      setSuggestion(suggestionData);
      // Set initial rating from API data
      const initialRating = suggestionData.rating || null;
      console.log('Loading suggestion rating:', initialRating);
      setRating(initialRating);
    } catch (error) {
      logger.error('SuggestionReading', 'Failed to load suggestion', error instanceof Error ? error : new Error(String(error)));
      setError('Não foi possível carregar a sugestão');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      await suggestionApiService.markAsRead(userSuggestionId);
      if (suggestion) {
        setSuggestion({ ...suggestion, isRead: true });
      }
    } catch (error) {
      logger.error('SuggestionReading', 'Failed to mark as read', error instanceof Error ? error : new Error(String(error)));
    }
  };

  const handleRating = async (newRating: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setRating(newRating);
      await suggestionApiService.rateSuggestion(userSuggestionId, newRating);
    } catch (error) {
      logger.error('SuggestionReading', 'Failed to rate suggestion', error instanceof Error ? error : new Error(String(error)));
      Alert.alert('Erro', 'Não foi possível salvar sua avaliação');
      setRating(null);
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient
          colors={['#A1CEDC', '#E8F4F8']}
          style={styles.headerGradient}
        />
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={colors.primary.main} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Carregando...</ThemedText>
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <ThemedText style={styles.loadingText}>Carregando sugestão...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (error || !suggestion) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient
          colors={['#A1CEDC', '#E8F4F8']}
          style={styles.headerGradient}
        />
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={colors.primary.main} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Erro</ThemedText>
        </View>
        
        <Card style={styles.errorCard}>
          <ThemedText style={styles.errorText}>
            {error || 'Sugestão não encontrada'}
          </ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={loadSuggestion}>
            <ThemedText style={styles.retryButtonText}>Tentar novamente</ThemedText>
          </TouchableOpacity>
        </Card>
      </ThemedView>
    );
  }

  const categoryMeta = SUGGESTION_CATEGORIES[suggestion.category];

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#A1CEDC', '#E8F4F8']}
        style={styles.headerGradient}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.primary.main} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle} numberOfLines={1}>
          {suggestion.title}
        </ThemedText>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        {suggestion.imageUrl && (
          <Image
            source={{ uri: suggestion.imageUrl }}
            style={styles.heroImage}
            contentFit="cover"
          />
        )}

        {/* Category and Info */}
        <Card style={styles.infoCard}>
          <View style={styles.categoryContainer}>
            <View style={styles.categoryBadge}>
              <ThemedText style={styles.categoryEmoji}>{categoryMeta.icon}</ThemedText>
              <ThemedText style={[styles.categoryLabel, { color: categoryMeta.color }]}>
                {categoryMeta.label}
              </ThemedText>
            </View>
            <View style={styles.readTimeContainer}>
              <Ionicons name="time-outline" size={16} color={colors.neutral.text.secondary} />
              <ThemedText style={styles.readTime}>
                {suggestion.estimatedReadTime} min de leitura
              </ThemedText>
            </View>
          </View>

          {suggestion.isRead && (
            <View style={styles.readBadge}>
              <Ionicons name="checkmark-circle" size={16} color={colors.primary.main} />
              <ThemedText style={styles.readBadgeText}>Já lido</ThemedText>
            </View>
          )}
        </Card>

        {/* Title and Summary */}
        <Card style={styles.titleCard}>
          <ThemedText style={styles.title}>{suggestion.title}</ThemedText>
          <ThemedText style={styles.summary}>{suggestion.summary}</ThemedText>
        </Card>

        {/* Content */}
        <Card style={styles.contentCard}>
          <Markdown 
            style={markdownStyles}
          >
            {suggestion.content}
          </Markdown>
        </Card>

        {/* Rating Section */}
        <Card style={styles.ratingCard}>
          <ThemedText style={styles.ratingTitle}>Esta sugestão foi útil?</ThemedText>
          <ThemedText style={styles.ratingSubtitle}>Sua avaliação nos ajuda a melhorar</ThemedText>
          
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => handleRating(star)}
                style={styles.starButton}
              >
                <Ionicons
                  name={star <= (rating || 0) ? "star" : "star-outline"}
                  size={32}
                  color={star <= (rating || 0) ? "#FFD700" : colors.neutral.text.secondary}
                />
              </TouchableOpacity>
            ))}
          </View>
          
          {rating && (
            <ThemedText style={styles.ratingFeedback}>
              Obrigado pela sua avaliação! ⭐
            </ThemedText>
          )}
        </Card>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    zIndex: 1,
  },
  backButton: {
    padding: spacing.sm,
    marginLeft: -spacing.sm,
  },
  headerTitle: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.primary.main,
    marginHorizontal: spacing.md,
  },
  headerRight: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  heroImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: spacing.lg,
  },
  infoCard: {
    marginBottom: spacing.lg,
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.card,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  categoryLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  readTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readTime: {
    fontSize: fontSize.sm,
    color: colors.neutral.text.secondary,
    marginLeft: spacing.xs,
  },
  readBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readBadgeText: {
    fontSize: fontSize.sm,
    color: colors.primary.main,
    marginLeft: spacing.xs,
    fontWeight: '500',
  },
  titleCard: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.neutral.text.primary,
    marginBottom: spacing.sm,
    lineHeight: fontSize.xl * 1.2,
  },
  summary: {
    fontSize: fontSize.md,
    color: colors.neutral.text.secondary,
    lineHeight: fontSize.md * 1.4,
  },
  contentCard: {
    marginBottom: spacing.lg,
  },
  content: {
    fontSize: fontSize.md,
    color: colors.neutral.text.primary,
    lineHeight: fontSize.md * 1.6,
  },
  ratingCard: {
    alignItems: 'center',
  },
  ratingTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.neutral.text.primary,
    marginBottom: spacing.xs,
  },
  ratingSubtitle: {
    fontSize: fontSize.sm,
    color: colors.neutral.text.secondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  starButton: {
    padding: spacing.xs,
    marginHorizontal: spacing.xs,
  },
  ratingFeedback: {
    fontSize: fontSize.sm,
    color: colors.primary.main,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
    color: colors.neutral.text.secondary,
  },
  errorCard: {
    margin: spacing.lg,
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: fontSize.md,
    color: colors.neutral.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: fontSize.md,
  },
});

const markdownStyles = {
  // Heading styles
  heading1: {
    fontSize: fontSize.xl,
    fontWeight: '700' as const,
    color: colors.neutral.text.primary,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  heading2: {
    fontSize: fontSize.lg,
    fontWeight: '600' as const,
    color: colors.neutral.text.primary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  heading3: {
    fontSize: fontSize.md,
    fontWeight: '600' as const,
    color: colors.neutral.text.primary,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  
  // Text styles
  body: {
    fontSize: fontSize.md,
    lineHeight: fontSize.md * 1.6,
    color: colors.neutral.text.primary,
    marginBottom: spacing.sm,
  },
  paragraph: {
    fontSize: fontSize.md,
    lineHeight: fontSize.md * 1.6,
    color: colors.neutral.text.primary,
    marginBottom: spacing.md,
  },
  
  // List styles
  bullet_list: {
    marginBottom: spacing.md,
  },
  ordered_list: {
    marginBottom: spacing.md,
  },
  list_item: {
    marginBottom: spacing.xs,
    paddingLeft: spacing.sm,
  },
  
  // Strong/Bold text
  strong: {
    fontWeight: '700' as const,
    color: colors.neutral.text.primary,
  },
  
  // Code styles
  code_inline: {
    backgroundColor: colors.neutral.card,
    color: colors.primary.main,
    fontSize: fontSize.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
    fontFamily: 'monospace',
  },
  
  // Block quote
  blockquote: {
    backgroundColor: colors.neutral.card,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary.main,
    paddingLeft: spacing.md,
    paddingVertical: spacing.sm,
    marginVertical: spacing.sm,
    fontStyle: 'italic' as const,
  },
};