import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet } from 'react-native';

export default function HeaderSection() {
  return (
    <ThemedView style={styles.header}>
      <ThemedView style={{ backgroundColor: 'transparent' }}>
        <ThemedText type="title">Olá, Joyce</ThemedText>
      </ThemedView>
      <ThemedView style={styles.profileImageContainer}>
        <Image
          source={require('@/assets/images/profile-placeholder.png')}
          style={styles.profileImage}
          contentFit="cover"
        />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: 'transparent', // fundo transparente
  },
  profileImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: 'transparent', // fundo transparente
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
});