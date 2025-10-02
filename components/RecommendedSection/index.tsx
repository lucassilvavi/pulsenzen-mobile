import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Card from '@/components/base/Card';
import { colors } from '@/constants/theme';
import suggestionApiService from '@/modules/suggestions/services/SuggestionApiService';
import { Suggestion, SUGGESTION_CATEGORIES } from '@/modules/suggestions/types';
import { spacing } from '@/utils/responsive';
import { logger } from '@/utils/secureLogger';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7;

// Use Animated FlatList to allow native driver scroll events
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList as any);

export default function RecommendedSection() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const dailySuggestions = await suggestionApiService.getDailySuggestions();
      setSuggestions(dailySuggestions.suggestions);
    } catch (error) {
      logger.error('RecommendedSection', 'Failed to load suggestions', error instanceof Error ? error : new Error(String(error)));
      setError('Não foi possível carregar as sugestões');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionPress = async (suggestion: Suggestion) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Navigate to suggestion reading screen
      router.push({
        pathname: '/suggestion-reading',
        params: { 
          suggestionId: suggestion.id,
          userSuggestionId: suggestion.userSuggestionId || suggestion.id
        }
      });
    } catch (error) {
      logger.error('RecommendedSection', 'Failed to navigate to suggestion', error instanceof Error ? error : new Error(String(error)));
    }
  };

  const renderSuggestion = ({ item, index }: { item: Suggestion; index: number }) => {
    const inputRange = [
      (index - 1) * (CARD_WIDTH + spacing.md),
      index * (CARD_WIDTH + spacing.md),
      (index + 1) * (CARD_WIDTH + spacing.md)
    ];
    
    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.95, 1, 0.95],
      extrapolate: 'clamp'
    });

    const categoryMeta = SUGGESTION_CATEGORIES[item.category];

    return (
      <Animated.View style={[styles.cardWrapper, { transform: [{ scale }] }]}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => handleSuggestionPress(item)}
          style={[styles.recommendedCard, item.isRead && styles.readCard]}
        >
          <Image
            source={item.imageUrl ? { uri: item.imageUrl } : require('@/assets/images/meditation-placeholder.jpg')}
            style={styles.recommendedImage}
            contentFit="cover"
          />
          <ThemedView style={styles.recommendedContent}>
            <View style={styles.categoryContainer}>
              <ThemedText style={styles.categoryEmoji}>{categoryMeta.icon}</ThemedText>
              <ThemedText style={[styles.categoryLabel, { color: categoryMeta.color }]}>
                {categoryMeta.label}
              </ThemedText>
              <ThemedText style={styles.readTime}>
                {item.estimatedReadTime} min
              </ThemedText>
            </View>
            <ThemedText style={styles.recommendedTitle} numberOfLines={2}>
              {item.title}
            </ThemedText>
            <ThemedText style={styles.recommendedSubtitle} numberOfLines={3}>
              {item.summary}
            </ThemedText>
            {item.isRead && (
              <View style={styles.readBadge}>
                <ThemedText style={styles.readBadgeText}>✓ Lido</ThemedText>
              </View>
            )}
          </ThemedView>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.recommendedContainer}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Recomendado para você
        </ThemedText>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <ThemedText style={styles.loadingText}>Carregando sugestões...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (error || suggestions.length === 0) {
    return (
      <ThemedView style={styles.recommendedContainer}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Recomendado para você
        </ThemedText>
        <Card style={styles.errorCard}>
          <ThemedText style={styles.errorText}>
            {error || 'Nenhuma sugestão disponível no momento'}
          </ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={loadSuggestions}>
            <ThemedText style={styles.retryButtonText}>Tentar novamente</ThemedText>
          </TouchableOpacity>
        </Card>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.recommendedContainer}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Recomendado para você
      </ThemedText>
      <AnimatedFlatList
        data={suggestions}
        renderItem={renderSuggestion}
        keyExtractor={(item: Suggestion) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + spacing.md}
        decelerationRate="fast"
        contentContainerStyle={styles.flatListContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  recommendedContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 15,
  },
  horizontalScroll: {
    flexDirection: 'row',
    paddingRight: 20,
  },
  flatListContent: {
    paddingHorizontal: spacing.lg,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginRight: spacing.md,
  },
  recommendedCard: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 16,
    backgroundColor: colors.neutral.card,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  readCard: {
    opacity: 0.8,
    borderWidth: 2,
    borderColor: colors.primary.main,
  },
  recommendedImage: {
    width: '100%',
    height: 150,
  },
  recommendedContent: {
    padding: 15,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  readTime: {
    fontSize: 11,
    color: colors.neutral.text.secondary,
    fontWeight: '500',
  },
  recommendedTitle: {
    fontWeight: '600',
    marginBottom: 5,
    fontSize: 16,
    lineHeight: 20,
  },
  recommendedSubtitle: {
    fontSize: 13,
    opacity: 0.7,
    lineHeight: 18,
  },
  readBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.primary.main,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  readBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    color: colors.neutral.text.secondary,
    fontSize: 14,
  },
  errorCard: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    textAlign: 'center',
    color: colors.neutral.text.secondary,
    marginBottom: 16,
    fontSize: 14,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});