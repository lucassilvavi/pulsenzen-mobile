import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  gradientColors?: string[];
  gradientHeight?: number;
  useSafeArea?: boolean;
}

const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  style,
  gradientColors = ['#A1CEDC', '#E8F4F8'],
  gradientHeight = 200,
  useSafeArea = true,
}) => {
  const { top } = useSafeAreaInsets();
  
  return (
    <View 
      style={[
        styles.container, 
        useSafeArea && { paddingTop: top },
        style
      ]}
    >
      <LinearGradient
        colors={gradientColors as any}
        style={[styles.headerGradient, { height: gradientHeight }]}
      />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
  },
});

export default ScreenContainer;
