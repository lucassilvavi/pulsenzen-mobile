import { ThemedText } from '@/components/ThemedText';
import { colors } from '@/constants/theme';
import { EmergencyContact } from '@/types/sos';
import { fontSize, spacing } from '@/utils/responsive';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import EmergencyContactCard from './EmergencyContactCard';

interface EmergencyContactsProps {
  contacts: EmergencyContact[];
  onContactPress: (contact: EmergencyContact) => void;
  title?: string;
}

export default function EmergencyContacts({ 
  contacts, 
  onContactPress, 
  title = "Precisa de Ajuda Profissional?" 
}: EmergencyContactsProps) {
  return (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>
        {title}
      </ThemedText>
      <View style={styles.contactsList}>
        {contacts.map((contact, index) => (
          <EmergencyContactCard
            key={index}
            contact={contact}
            onPress={onContactPress}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontFamily: 'Inter-Bold',
    color: colors.error.main,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  contactsList: {
    gap: spacing.sm,
  },
});
