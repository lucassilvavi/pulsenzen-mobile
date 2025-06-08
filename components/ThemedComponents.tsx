import React from 'react';
import { StyleSheet, View, ViewStyle, TextStyle } from 'react-native';
import { useColorScheme } from 'react-native';
import { useAppContext } from '@/context/AppContext';

interface ThemedViewProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  darkStyle?: ViewStyle;
  lightStyle?: ViewStyle;
}

export const ThemedView: React.FC<ThemedViewProps> = ({
  children,
  style,
  darkStyle,
  lightStyle,
}) => {
  const colorScheme = useColorScheme();
  const { theme } = useAppContext();
  
  // Determine which theme to use (context or system)
  const effectiveTheme = theme || colorScheme || 'light';
  
  // Apply appropriate styles based on theme
  const themeSpecificStyle = effectiveTheme === 'dark' ? darkStyle : lightStyle;
  
  return (
    <View style={[styles.container, style, themeSpecificStyle]}>
      {children}
    </View>
  );
};

interface ThemedTextProps {
  children: React.ReactNode;
  style?: TextStyle | TextStyle[];
  darkStyle?: TextStyle;
  lightStyle?: TextStyle;
  type?: 'title' | 'subtitle' | 'body' | 'caption' | 'button';
  numberOfLines?: number;
}

export const ThemedText: React.FC<ThemedTextProps> = ({
  children,
  style,
  darkStyle,
  lightStyle,
  type = 'body',
  numberOfLines,
}) => {
  const colorScheme = useColorScheme();
  const { theme } = useAppContext();
  
  // Determine which theme to use (context or system)
  const effectiveTheme = theme || colorScheme || 'light';
  
  // Get base style for text type
  const baseStyle = getTextTypeStyle(type);
  
  // Apply theme-specific text color
  const themeTextStyle = effectiveTheme === 'dark' 
    ? { color: '#FFFFFF' } 
    : { color: '#212121' };
  
  // Apply appropriate styles based on theme
  const themeSpecificStyle = effectiveTheme === 'dark' ? darkStyle : lightStyle;
  
  return (
    <View style={styles.textContainer}>
      <Text 
        style={[baseStyle, themeTextStyle, style, themeSpecificStyle]}
        numberOfLines={numberOfLines}
      >
        {children}
      </Text>
    </View>
  );
};

// Helper function to get text style based on type
const getTextTypeStyle = (type: string): TextStyle => {
  switch (type) {
    case 'title':
      return {
        fontFamily: 'Inter-Bold',
        fontSize: 24,
        lineHeight: 32,
        letterSpacing: 0.15,
      };
    case 'subtitle':
      return {
        fontFamily: 'Inter-SemiBold',
        fontSize: 18,
        lineHeight: 26,
        letterSpacing: 0.15,
      };
    case 'body':
      return {
        fontFamily: 'Inter-Regular',
        fontSize: 16,
        lineHeight: 24,
        letterSpacing: 0.5,
      };
    case 'caption':
      return {
        fontFamily: 'Inter-Regular',
        fontSize: 12,
        lineHeight: 16,
        letterSpacing: 0.4,
      };
    case 'button':
      return {
        fontFamily: 'Inter-Medium',
        fontSize: 14,
        lineHeight: 20,
        letterSpacing: 1.25,
        textTransform: 'uppercase',
      };
    default:
      return {
        fontFamily: 'Inter-Regular',
        fontSize: 16,
        lineHeight: 24,
        letterSpacing: 0.5,
      };
  }
};

// Import Text component from react-native
import { Text } from 'react-native';

const styles = StyleSheet.create({
  container: {
    // Base container styles
  },
  textContainer: {
    // Base text container styles
  },
});
