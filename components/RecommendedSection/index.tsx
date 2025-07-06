import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Card from '@/components/base/Card';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet } from 'react-native';

const recommendedItems = [
  {
    image: require('@/assets/images/meditation-placeholder.jpg'),
    title: 'Meditação Guiada',
    subtitle: '10 minutos • Relaxamento',
  },
  {
    image: require('@/assets/images/sleep-placeholder.jpg'),
    title: 'Sons para Dormir',
    subtitle: '30 minutos • Sono',
  },
  {
    image: require('@/modules/breathing/assets/images/breathing-placeholder.jpg'),
    title: 'Respiração 4-7-8',
    subtitle: '5 minutos • Ansiedade',
  },
];

export default function RecommendedSection() {
  return (
    <ThemedView style={styles.recommendedContainer}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Recomendado para você
      </ThemedText>
      <ThemedView style={styles.horizontalScroll}>
        {recommendedItems.map((item, idx) => (
          <Card style={styles.recommendedCard} key={item.title + idx}>
            <Image
              source={item.image}
              style={styles.recommendedImage}
              contentFit="cover"
            />
            <ThemedView style={styles.recommendedContent}>
              <ThemedText style={styles.recommendedTitle}>{item.title}</ThemedText>
              <ThemedText style={styles.recommendedSubtitle}>{item.subtitle}</ThemedText>
            </ThemedView>
          </Card>
        ))}
      </ThemedView>
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
  recommendedCard: {
    width: 250,
    marginRight: 15,
    overflow: 'hidden',
  },
  recommendedImage: {
    width: '100%',
    height: 150,
  },
  recommendedContent: {
    padding: 15,
  },
  recommendedTitle: {
    fontWeight: '600',
    marginBottom: 5,
  },
  recommendedSubtitle: {
    fontSize: 12,
    opacity: 0.7,
  },
});