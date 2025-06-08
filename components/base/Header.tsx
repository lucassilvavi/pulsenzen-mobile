import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  transparent?: boolean;
  textColor?: string;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = true,
  rightIcon,
  onRightIconPress,
  transparent = true,
  textColor = '#000000',
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleRightIconPress = () => {
    if (onRightIconPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onRightIconPress();
    }
  };

  return (
    <ThemedView style={[
      styles.container,
      transparent ? styles.transparent : styles.solid,
      { paddingTop: insets.top > 0 ? 10 : 15 }
    ]}>
      <View style={styles.leftContainer}>
        {showBackButton && (
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBackPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <IconSymbol name="chevron.left" size={24} color={textColor} />
          </TouchableOpacity>
        )}
      </View>
      
      <ThemedText type="subtitle" style={[styles.title, { color: textColor }]}>
        {title}
      </ThemedText>
      
      <View style={styles.rightContainer}>
        {rightIcon && (
          <TouchableOpacity 
            style={styles.rightButton} 
            onPress={handleRightIconPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 15,
    width: '100%',
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  solid: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  leftContainer: {
    width: 40,
    alignItems: 'flex-start',
  },
  rightContainer: {
    width: 40,
    alignItems: 'flex-end',
  },
  backButton: {
    padding: 5,
  },
  rightButton: {
    padding: 5,
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
});

export default Header;
