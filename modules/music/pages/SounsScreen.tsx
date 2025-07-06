import Button from '@/components/base/Button';
import Card from '@/components/base/Card';
import FeatureCard from '@/components/base/FeatureCard';
import ScreenContainer from '@/components/base/ScreenContainer';
import { ThemedText } from '@/components/ThemedText';
import { colors } from '@/constants/theme';
import { fontSize, spacing } from '@/utils/responsive';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const sleepCategories = [
  {
    id: 'stories',
    title: 'Histórias para Dormir',
    description: 'Narrativas relaxantes que ajudam você a adormecer',
    icon: '📖',
    color: colors.sleep.primary,
    items: [
      { id: 'forest-walk', title: 'Caminhada na Floresta', duration: '15 min' },
      { id: 'ocean-moonlight', title: 'Praia ao Luar', duration: '20 min' },
      { id: 'serene-mountains', title: 'Montanhas Serenas', duration: '18 min' },
    ]
  },
  {
    id: 'sounds',
    title: 'Sons Relaxantes',
    description: 'Ambientes sonoros para uma noite tranquila',
    icon: '🎵',
    color: colors.breathing.primary,
    items: [
      { id: 'gentle-rain', title: 'Chuva Suave', duration: '60 min' },
      { id: 'ocean-waves', title: 'Ondas do Mar', duration: '45 min' },
      { id: 'forest-sounds', title: 'Sons da Floresta', duration: '30 min' },
    ]
  },
  {
    id: 'meditations',
    title: 'Meditações para Dormir',
    description: 'Práticas guiadas para relaxamento profundo',
    icon: '🧘‍♀️',
    color: colors.journal.primary,
    items: [
      { id: 'body-scan', title: 'Relaxamento Corporal', duration: '25 min' },
      { id: 'sleep-breathing', title: 'Respiração para Dormir', duration: '10 min' },
      { id: 'gratitude-night', title: 'Gratidão Noturna', duration: '15 min' },
    ]
  }
];

export default function SounsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleCategoryPress = (categoryId: string) => {
    router.push(`/category?categoryId=${categoryId}`);
  };

  const handleItemPress = (categoryId: string, itemId: string) => {
    router.push(`/music-player?trackId=${itemId}`);
  };

  return (
    <ScreenContainer
      gradientColors={colors.gradients.sleep}
      gradientHeight={height * 0.4}
    >
      <View style={[styles.container, { paddingTop: insets.top + 60 }]}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.title}>
            Sono Tranquilo
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Encontre paz e relaxamento para uma noite reparadora
          </ThemedText>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Quick Start */}
          <View style={styles.quickStartSection}>
            <ThemedText style={styles.sectionTitle}>
              Início Rápido
            </ThemedText>
            <Button
              label="Ver Playlists"
              variant="primary"
              size="large"
              fullWidth
              onPress={() => router.push('/playlists')}
              style={[styles.quickStartButton, { backgroundColor: colors.sleep.accent }] as any}
            />
          </View>

          {/* Categories */}
          <View style={styles.categoriesSection}>
            <ThemedText style={styles.sectionTitle}>
              Categorias
            </ThemedText>
            <View style={styles.categoriesGrid}>
              {sleepCategories.map((category) => (
                <FeatureCard
                  key={category.id}
                  title={category.title}
                  description={category.description}
                  icon={category.icon}
                  onPress={() => handleCategoryPress(category.id)}
                  style={[
                    styles.categoryCard,
                    { backgroundColor: category.color }
                  ] as any}
                />
              ))}
            </View>
          </View>

          {/* Popular Content */}
          <View style={styles.popularSection}>
            <ThemedText style={styles.sectionTitle}>
              Mais Populares
            </ThemedText>
            <View style={styles.popularGrid}>
              {sleepCategories.map((category) =>
                category.items.slice(0, 1).map((item) => (
                  <Card
                    key={`${category.id}-${item.id}`}
                    style={styles.popularCard}
                    onPress={() => handleItemPress(category.id, item.id)}
                  >
                    <View style={styles.popularContent}>
                      <View style={styles.popularHeader}>
                        <ThemedText style={styles.popularIcon}>
                          {category.icon}
                        </ThemedText>
                        <View style={styles.popularInfo}>
                          <ThemedText style={styles.popularTitle}>
                            {item.title}
                          </ThemedText>
                          <ThemedText style={styles.popularCategory}>
                            {category.title}
                          </ThemedText>
                        </View>
                        <ThemedText style={styles.popularDuration}>
                          {item.duration}
                        </ThemedText>
                      </View>
                    </View>
                  </Card>
                ))
              )}
            </View>
          </View>

          {/* All Content by Category */}
          {sleepCategories.map((category) => (
            <View key={category.id} style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <ThemedText style={styles.categoryTitle}>
                  {category.icon} {category.title}
                </ThemedText>
                <Button
                  label="Ver todos"
                  variant="text"
                  size="small"
                  onPress={() => handleCategoryPress(category.id)}
                  labelStyle={{ color: colors.sleep.accent }}
                />
              </View>
              <View style={styles.itemsGrid}>
                {category.items.map((item) => (
                  <Card
                    key={item.id}
                    style={styles.itemCard}
                    onPress={() => handleItemPress(category.id, item.id)}
                  >
                    <View style={styles.itemContent}>
                      <ThemedText style={styles.itemTitle}>
                        {item.title}
                      </ThemedText>
                      <ThemedText style={styles.itemDuration}>
                        {item.duration}
                      </ThemedText>
                    </View>
                  </Card>
                ))}
              </View>
            </View>
          ))}

          {/* Sleep Tips */}
          <View style={styles.tipsSection}>
            <ThemedText style={styles.sectionTitle}>
              Dicas para Dormir Melhor
            </ThemedText>
            <Card style={styles.tipsCard}>
              <View style={styles.tipsContent}>
                <ThemedText style={styles.tipsTitle}>
                  💡 Dica do Dia
                </ThemedText>
                <ThemedText style={styles.tipsText}>
                  Mantenha seu quarto entre 18-22°C para uma temperatura ideal de sono.
                  Um ambiente mais fresco ajuda seu corpo a relaxar naturalmente.
                </ThemedText>
              </View>
            </Card>
          </View>
        </ScrollView>
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
    alignItems: 'center',
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxl,
    fontFamily: 'Inter-Bold',
    color: colors.neutral.white,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.md,
    fontFamily: 'Inter-Regular',
    color: colors.neutral.white,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: fontSize.md * 1.4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  quickStartSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontFamily: 'Inter-SemiBold',
    color: colors.neutral.text.primary,
    marginBottom: spacing.md,
  },
  quickStartButton: {
    shadowColor: colors.neutral.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  categoriesSection: {
    marginBottom: spacing.xl,
  },
  categoriesGrid: {
    gap: spacing.md,
  },
  categoryCard: {
    marginBottom: spacing.sm,
    borderRadius: 16,
    shadowColor: colors.neutral.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  popularSection: {
    marginBottom: spacing.xl,
  },
  popularGrid: {
    gap: spacing.sm,
  },
  popularCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
    padding: spacing.md,
    shadowColor: colors.neutral.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  popularContent: {
    flex: 1,
  },
  popularHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  popularIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  popularInfo: {
    flex: 1,
  },
  popularTitle: {
    fontSize: fontSize.md,
    fontFamily: 'Inter-SemiBold',
    color: colors.neutral.text.primary,
    marginBottom: spacing.xs,
  },
  popularCategory: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: colors.sleep.accent,
  },
  popularDuration: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Medium',
    color: colors.neutral.text.secondary,
  },
  categorySection: {
    marginBottom: spacing.xl,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  categoryTitle: {
    fontSize: fontSize.lg,
    fontFamily: 'Inter-SemiBold',
    color: colors.neutral.text.primary,
  },
  itemsGrid: {
    gap: spacing.sm,
  },
  itemCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
    padding: spacing.md,
    shadowColor: colors.neutral.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  itemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: fontSize.md,
    fontFamily: 'Inter-Medium',
    color: colors.neutral.text.primary,
    flex: 1,
  },
  itemDuration: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: colors.neutral.text.secondary,
  },
  tipsSection: {
    marginBottom: spacing.lg,
  },
  tipsCard: {
    backgroundColor: colors.sleep.secondary,
    borderRadius: 16,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.sleep.accent,
  },
  tipsContent: {
    gap: spacing.sm,
  },
  tipsTitle: {
    fontSize: fontSize.md,
    fontFamily: 'Inter-SemiBold',
    color: colors.neutral.text.primary,
  },
  tipsText: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: colors.neutral.text.secondary,
    lineHeight: fontSize.sm * 1.4,
  },
});
