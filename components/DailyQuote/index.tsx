import Card from '@/components/base/Card';
import { ThemedText } from '@/components/ThemedText';
import React from 'react';
import { StyleSheet } from 'react-native';

export default function DailyQuote() {
  return (
    <Card style={styles.quoteCard}>
      <ThemedText type="subtitle">Pensamento do dia</ThemedText>
      <ThemedText style={styles.quote}>
        "A paz vem de dentro de você mesmo. Não a procure à sua volta."
      </ThemedText>
      <ThemedText style={styles.quoteAuthor}>- Buddha</ThemedText>
    </Card>
  );
}

const styles = StyleSheet.create({
  quoteCard: {
    marginHorizontal: 20,
    padding: 20,
    marginBottom: 20
  },
  quote: {
    fontStyle: 'italic',
    marginVertical: 10,
    lineHeight: 22,
  },
  quoteAuthor: {
    textAlign: 'right',
    opacity: 0.7,
  },
});