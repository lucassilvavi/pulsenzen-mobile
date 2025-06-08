import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Card from '@/components/base/Card';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { StyleSheet } from 'react-native';

export default function SettingsList({ settings }) {
  return (
    <Card style={styles.settingsCard}>
      {settings.map((item, idx) => (
        <ThemedView key={item.label}>
          <ThemedView style={styles.settingItem}>
            <ThemedView style={styles.settingIconContainer}>
              <IconSymbol name={item.icon} size={20} color="#2196F3" />
            </ThemedView>
            <ThemedText style={styles.settingText}>{item.label}</ThemedText>
            <IconSymbol name="chevron.right" size={20} color="#757575" />
          </ThemedView>
          {idx < settings.length - 1 && <ThemedView style={styles.settingDivider} />}
        </ThemedView>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  settingsCard: { padding: 5 },
  settingItem: { flexDirection: 'row', alignItems: 'center', padding: 15 },
  settingIconContainer: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  settingText: { flex: 1, fontSize: 16 },
  settingDivider: { height: 1, backgroundColor: '#E0E0E0', marginHorizontal: 15 },
});