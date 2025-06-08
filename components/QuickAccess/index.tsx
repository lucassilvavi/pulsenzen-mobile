import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Card from '@/components/base/Card';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
const quickAccessItems = [
  {
    title: 'Respiração',
    subtitle: '5 min',
    icon: 'wind',
    iconColor: '#2196F3',
    bgColor: '#E3F2FD',
    route: '/breathing',
  },
  {
    title: 'Sono',
    subtitle: '10 min',
    icon: 'moon.stars.fill',
    iconColor: '#4CAF50',
    bgColor: '#E8F5E9',
    route: '/sleep',
  },
  {
    title: 'Diário',
    subtitle: 'Nova entrada',
    icon: 'book.fill',
    iconColor: '#FF9800',
    bgColor: '#FFF3E0',
    route: '/journal',
  },
  {
    title: 'SOS',
    subtitle: 'Emergência',
    icon: 'heart.fill',
    iconColor: '#F44336',
    bgColor: '#FFEBEE',
    route: '/sos',
  },
];

export default function QuickAccess() {
  const router = useRouter();
  
  return (
    <ThemedView style={styles.quickAccessContainer}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>Acesso Rápido</ThemedText>
      <ThemedView style={styles.quickAccessGrid}>
        {quickAccessItems.map((item) => (
          <Card 
           style={styles.quickAccessCard}
           key={item.title}
           onPress={
              item.route
                ? () => router.push(item.route)
                : undefined
            }>
            <ThemedView style={[styles.iconCircle, { backgroundColor: item.bgColor }]}>
              <IconSymbol name={item.icon} size={24} color={item.iconColor} />
            </ThemedView>
            <ThemedText style={styles.cardTitle}>{item.title}</ThemedText>
            <ThemedText style={styles.cardSubtitle}>{item.subtitle}</ThemedText>
          </Card>
        ))}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  quickAccessContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    marginBottom: 15,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    backgroundColor: 'transparent', 
    elevation: 0, 
    shadowOpacity: 0, 
  },
  quickAccessCard: {
    width: '48%',
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontWeight: '600',
    marginBottom: 5,
  },
  cardSubtitle: {
    fontSize: 12,
    opacity: 0.7,
  },
});