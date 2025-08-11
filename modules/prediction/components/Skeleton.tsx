import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';

interface SkeletonProps { width?: number | string; height?: number; radius?: number; style?: ViewStyle; }

export const Skeleton: React.FC<SkeletonProps> = ({ width='100%', height=16, radius=8, style }) => {
  const shimmer = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 1200, useNativeDriver: true })
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);
  const opacity = shimmer.interpolate({ inputRange:[0,1], outputRange:[0.35, 0.9] });
  const baseStyle: any = { height, borderRadius: radius, opacity };
  if (typeof width === 'string') baseStyle.width = width as `${number}%` | string; else baseStyle.width = width;
  return <Animated.View style={[styles.base, baseStyle, style]} />;
};

const styles = StyleSheet.create({
  base:{ backgroundColor:'#E2E8F0' }
});
