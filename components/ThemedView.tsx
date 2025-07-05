import React from 'react';
import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, children, ...otherProps }: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
  
  // Pass only safe props to View
  const safeProps: any = {};
  
  // Manually copy only valid ViewProps to avoid passing unexpected props
  Object.entries(otherProps).forEach(([key, value]) => {
    // Skip any prop that might contain text nodes or string values outside of allowed View props
    if (key !== 'children' && 
        key !== 'dangerouslySetInnerHTML' && 
        typeof value !== 'string') {
      safeProps[key] = value;
    }
  });

  return <View style={[{ backgroundColor }, style]} {...safeProps}>{children}</View>;
}
