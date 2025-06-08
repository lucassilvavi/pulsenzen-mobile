import React from 'react';
import { StyleSheet, View, TouchableOpacity, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { colors, commonStyles } from '@/constants/theme';
import { spacing, borderRadius, fontSize } from '@/utils/responsive';

interface FeatureCardProps {
  title: string;
  description?: string;
  icon?: string;
  iconComponent?: React.ReactNode;
  backgroundColor?: string;
  textColor?: string;
  onPress?: () => void;
  style?: ViewStyle;
  size?: 'small' | 'medium' | 'large';
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  iconComponent,
  backgroundColor = colors.primary.light,
  textColor = colors.neutral.text.primary,
  onPress,
  style,
  size = 'medium',
}) => {
  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  // Determine card dimensions based on size
  const getCardDimensions = () => {
    switch (size) {
      case 'small':
        return styles.smallCard;
      case 'large':
        return styles.largeCard;
      case 'medium':
      default:
        return styles.mediumCard;
    }
  };

  // Determine icon dimensions based on size
  const getIconDimensions = () => {
    switch (size) {
      case 'small':
        return styles.smallIcon;
      case 'large':
        return styles.largeIcon;
      case 'medium':
      default:
        return styles.mediumIcon;
    }
  };

  // Determine text styles based on size
  const getTitleStyle = () => {
    switch (size) {
      case 'small':
        return styles.smallTitle;
      case 'large':
        return styles.largeTitle;
      case 'medium':
      default:
        return styles.mediumTitle;
    }
  };

  const getDescriptionStyle = () => {
    switch (size) {
      case 'small':
        return styles.smallDescription;
      case 'large':
        return styles.largeDescription;
      case 'medium':
      default:
        return styles.mediumDescription;
    }
  };

  const cardContent = (
    <ThemedView 
      style={[
        styles.card,
        getCardDimensions(),
        { backgroundColor },
        style
      ]}
    >
      {iconComponent ? (
        <View style={[styles.iconContainer, getIconDimensions()]}>
          {iconComponent}
        </View>
      ) : icon ? (
        <Image
          source={{ uri: icon }}
          style={[styles.iconContainer, getIconDimensions()]}
          contentFit="contain"
        />
      ) : null}
      
      <ThemedText 
        style={[
          styles.title,
          getTitleStyle(),
          { color: textColor }
        ]}
      >
        {title}
      </ThemedText>
      
      {description && (
        <ThemedText 
          style={[
            styles.description,
            getDescriptionStyle(),
            { color: textColor }
          ]}
          numberOfLines={size === 'small' ? 2 : 3}
        >
          {description}
        </ThemedText>
      )}
    </ThemedView>
  );

  if (onPress) {
    return (
      <TouchableOpacity 
        activeOpacity={0.7} 
        onPress={handlePress}
        style={styles.touchable}
      >
        {cardContent}
      </TouchableOpacity>
    );
  }

  return cardContent;
};

const styles = StyleSheet.create({
  touchable: {
    width: '100%',
  },
  card: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...commonStyles.shadowSmall,
  },
  smallCard: {
    padding: spacing.sm,
    minHeight: 100,
  },
  mediumCard: {
    padding: spacing.md,
    minHeight: 150,
  },
  largeCard: {
    padding: spacing.lg,
    minHeight: 200,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  smallIcon: {
    width: 40,
    height: 40,
  },
  mediumIcon: {
    width: 60,
    height: 60,
  },
  largeIcon: {
    width: 80,
    height: 80,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  smallTitle: {
    fontSize: fontSize.sm,
  },
  mediumTitle: {
    fontSize: fontSize.md,
  },
  largeTitle: {
    fontSize: fontSize.lg,
  },
  description: {
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    opacity: 0.8,
  },
  smallDescription: {
    fontSize: fontSize.xs,
  },
  mediumDescription: {
    fontSize: fontSize.sm,
  },
  largeDescription: {
    fontSize: fontSize.md,
  },
});

export default FeatureCard;
