import React from 'react';
import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  // Check if style has color defined
  const styleColor = StyleSheet.flatten(style)?.color;
  // Use color from style if available, otherwise use lightColor or default
  const color = styleColor || lightColor || '#11181C';

  // Ensure children are wrapped properly and converted to string if needed
  const ensureStringChildren = (children: any): React.ReactNode => {
    if (children === null || children === undefined) {
      return '';
    }
    if (typeof children === 'string' || typeof children === 'number') {
      return children;
    }
    if (Array.isArray(children)) {
      return children.map((child, index) => (
        <React.Fragment key={index}>{ensureStringChildren(child)}</React.Fragment>
      ));
    }
    if (React.isValidElement(children)) {
      return children;
    }
    return String(children);
  };

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    >
      {ensureStringChildren(rest.children)}
    </Text>
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
});
