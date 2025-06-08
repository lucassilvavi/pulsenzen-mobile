import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

export default function ProfileHeader({ profile }) {
  return (
    <ThemedView style={styles.profileHeader}>
      <ThemedView style={styles.profileImageContainer}>
        <Image
          source={profile.image}
          style={styles.profileImage}
          contentFit="cover"
        />
        <ThemedView style={styles.editIconContainer}>
          <IconSymbol name="pencil" size={16} color="#FFFFFF" />
        </ThemedView>
      </ThemedView>
      <ThemedText type="title" style={styles.profileName}>{profile.name}</ThemedText>
      <ThemedText style={styles.profileBio}>{profile.bio}</ThemedText>
      <ThemedView style={styles.statsContainer}>
        <ThemedView style={styles.statItem}>
          <ThemedText style={styles.statValue}>{profile.stats.days}</ThemedText>
          <ThemedText style={styles.statLabel}>Dias</ThemedText>
        </ThemedView>
        <ThemedView style={styles.statDivider} />
        <ThemedView style={styles.statItem}>
          <ThemedText style={styles.statValue}>{profile.stats.sessions}</ThemedText>
          <ThemedText style={styles.statLabel}>Sessões</ThemedText>
        </ThemedView>
        <ThemedView style={styles.statDivider} />
        <ThemedView style={styles.statItem}>
          <ThemedText style={styles.statValue}>{profile.stats.streak}</ThemedText>
          <ThemedText style={styles.statLabel}>Sequência</ThemedText>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  profileHeader: { alignItems: 'center', paddingHorizontal: 20, paddingBottom: 20, backgroundColor: 'transparent', },
  profileImageContainer: { width: 100, height: 100, borderRadius: 50, overflow: 'hidden', backgroundColor: '#E0E0E0', marginBottom: 15 },
  profileImage: { width: '100%', height: '100%' },
  editIconContainer: { position: 'absolute', right: 0, bottom: 0, width: 30, height: 30, borderRadius: 15, backgroundColor: '#2196F3', justifyContent: 'center', alignItems: 'center' },
  profileName: { marginBottom: 5 },
  profileBio: { textAlign: 'center', opacity: 0.7, marginBottom: 15 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', width: '100%', paddingHorizontal: 20 },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '700', marginBottom: 5 },
  statLabel: { fontSize: 14, opacity: 0.7 },
  statDivider: { width: 1, height: 40, backgroundColor: '#E0E0E0' },
});