import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

const moods = [
  { label: 'Ótimo', icon: 'face.smiling', color: '#4CAF50' },
  { label: 'Bem', icon: 'face.smiling', color: '#8BC34A' },
  { label: 'Neutro', icon: 'face.dashed', color: '#FFC107' },
  { label: 'Mal', icon: 'face.frowning', color: '#FF9800' },
  { label: 'Péssimo', icon: 'face.frowning', color: '#F44336' },
];

export default function MoodSelector() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        Como você está se sentindo hoje?
      </ThemedText>
      <View style={styles.moodsRow}>
        {moods.map((mood) => (
          <TouchableOpacity
            key={mood.label}
            style={styles.moodOption}
            activeOpacity={0.7}
          >
            <View style={[styles.iconCircle, { borderColor: mood.color }]}>
              <IconSymbol name={mood.icon} size={28} color={mood.color} />
            </View>
            <ThemedText style={styles.moodText}>{mood.label}</ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'transparent', // fundo transparente
  },
  title: {
    marginBottom: 10,
    fontWeight: '600',
  },
  moodsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodOption: {
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'transparent',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    backgroundColor: 'transparent', // fundo transparente
    borderWidth: 2,
  },
  moodText: {
    fontSize: 12,
    textAlign: 'center',
  },
});