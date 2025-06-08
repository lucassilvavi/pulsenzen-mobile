import Typography from '@/components/base/Typography';
import { Colors } from '@/constants/Colors';
import React from 'react';
import { ActivityIndicator, StyleSheet, View, ViewProps } from 'react-native';

interface LoadingProps extends ViewProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  fullScreen?: boolean;
  overlay?: boolean;
}

const Loading = ({
  size = 'large',
  color = Colors.primary[600],
  text,
  fullScreen = false,
  overlay = false,
  style,
  ...props
}: LoadingProps) => {
  const containerStyles = [
    styles.container,
    fullScreen && styles.fullScreen,
    overlay && styles.overlay,
    style
  ];

  return (
    <View style={containerStyles} {...props}>
      <ActivityIndicator size={size} color={color} />
      {text && (
        <Typography 
          variant="body" 
          color={Colors.gray[600]} 
          style={styles.text}
        >
          {text}
        </Typography>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  fullScreen: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  overlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  text: {
    marginTop: 12,
  },
});

export default Loading;
