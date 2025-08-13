import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { colors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity } from 'react-native';

const quickAccessItems = [
  {
    title: 'Respiração',
    subtitle: '5 min',
    icon: 'wind',
    iconColor: colors.gradients.breathing[0],
    bgColor: colors.gradients.breathing[1],
    route: '/breathing',
  },
  {
    title: 'Emoções',
    subtitle: 'Equilíbrio Emocional',
    icon: 'moon.stars.fill',
    iconColor: colors.gradients.sleep[0],
    bgColor: colors.gradients.sleep[1],
    route: '/prediction-dashboard',
  },
  {
    title: 'Diário',
    subtitle: 'Nova entrada',
    icon: 'book.fill',
    iconColor: colors.gradients.journal[0],
    bgColor: colors.gradients.journal[1],
    route: '/journal',
  },
  {
    title: 'SOS',
    subtitle: 'Emergência',
    icon: 'heart.fill',
    iconColor: colors.gradients.sos[0],
    bgColor: colors.gradients.sos[1],
    route: '/sos',
  },
];

export default function QuickAccess() {
  const router = useRouter();

  return (
    <ThemedView style={styles.recommendedContainer}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Acessos rápidos
      </ThemedText>
      <ThemedView style={styles.quickAccessGrid}>
        {quickAccessItems.map((item, idx) => (
          <TouchableOpacity
            key={item.title}
            style={[
              styles.quickAccessCard,
              idx % 2 === 0 && { marginRight: '5%' }
            ]}
            activeOpacity={0.7}
            onPress={
              item.route
                ? () => router.push(item.route as any)
                : undefined
            }
          >
            <ThemedView style={[styles.iconCircle, { backgroundColor: item.bgColor }]}>
              <IconSymbol name={item.icon as any} size={32} color={item.iconColor} />
            </ThemedView>
            <ThemedText style={styles.cardTitle}>{item.title}</ThemedText>
            <ThemedText style={styles.cardSubtitle}>{item.subtitle}</ThemedText>
          </TouchableOpacity>
        ))}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  recommendedContainer: {
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
    backgroundColor: 'transparent',
  },
  quickAccessCard: {
    width: '40%',
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginBottom: 10,
    marginLeft: '5%',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardTitle: {
    fontWeight: '700',
    fontSize: 20,
    marginBottom: 6,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 15,
    opacity: 0.7,
    textAlign: 'center',
  },
});