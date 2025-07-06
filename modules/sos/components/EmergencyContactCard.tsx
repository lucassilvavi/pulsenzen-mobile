import Card from '@/components/base/Card';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { colors } from '@/constants/theme';
import { EmergencyContact } from '../types';
import { fontSize, spacing } from '@/utils/responsive';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface EmergencyContactCardProps {
  contact: EmergencyContact;
  onPress: (contact: EmergencyContact) => void;
}

export default function EmergencyContactCard({ contact, onPress }: EmergencyContactCardProps) {
  const getIconColor = () => {
    switch (contact.type) {
      case 'crisis':
        return colors.error.main;
      case 'medical':
        return '#4CAF50';
      case 'general':
        return '#FF9800';
      default:
        return colors.error.main;
    }
  };

  return (
    <Card
      style={styles.card}
      onPress={() => onPress(contact)}
    >
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: `${getIconColor()}20` }]}>
          <IconSymbol name="phone.fill" size={24} color={getIconColor()} />
        </View>
        <View style={styles.info}>
          <ThemedText style={styles.name}>
            {contact.name}
          </ThemedText>
          <ThemedText style={styles.number}>
            {contact.number}
          </ThemedText>
          <ThemedText style={styles.description}>
            {contact.description}
          </ThemedText>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.error.light,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: fontSize.md,
    fontFamily: 'Inter-SemiBold',
    color: colors.neutral.text.primary,
    marginBottom: spacing.xs,
  },
  number: {
    fontSize: fontSize.lg,
    fontFamily: 'Inter-Bold',
    color: colors.error.main,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: colors.neutral.text.secondary,
  },
});
