import { ThemedView } from '@/components/ThemedView';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

interface CardProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  elevation?: 'none' | 'low' | 'medium' | 'high';
  borderRadius?: number;
  backgroundColor?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  elevation = 'low',
  borderRadius = 12,
  backgroundColor = '#FFFFFF',
}) => {
  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  // Get shadow style based on elevation
  const getShadowStyle = () => {
    switch (elevation) {
      case 'none':
        return {};
      case 'low':
        return styles.shadowLow;
      case 'medium':
        return styles.shadowMedium;
      case 'high':
        return styles.shadowHigh;
      default:
        return styles.shadowLow;
    }
  };

  const cardContent = (
    <ThemedView 
      lightColor={backgroundColor}
      style={[
        styles.card, 
        getShadowStyle(), 
        { borderRadius },
        style
      ]}
    >
      {children}
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
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  shadowLow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  shadowMedium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  shadowHigh: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
});

export default Card;
