import Typography from '@/components/base/Typography';
import { Colors } from '@/constants/Colors';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface IconProps {
  color?: string;
  size?: number;
}

interface IconButtonProps {
  icon: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  color?: string;
  backgroundColor?: string;
  disabled?: boolean;
  label?: string;
  labelPosition?: 'bottom' | 'right';
}

const IconButton = ({
  icon,
  onPress,
  variant = 'default',
  size = 'medium',
  color,
  backgroundColor,
  disabled = false,
  label,
  labelPosition = 'bottom'
}: IconButtonProps) => {
  
  const getContainerSize = () => {
    switch (size) {
      case 'small': return 32;
      case 'medium': return 40;
      case 'large': return 48;
      default: return 40;
    }
  };
  
  const getBackgroundColor = () => {
    if (backgroundColor) return backgroundColor;
    
    switch (variant) {
      case 'default': return Colors.primary[100];
      case 'outline': return Colors.transparent;
      case 'ghost': return Colors.transparent;
      default: return Colors.primary[100];
    }
  };
  
  const getIconColor = () => {
    if (color) return color;
    
    switch (variant) {
      case 'default': return Colors.primary[600];
      case 'outline': return Colors.primary[600];
      case 'ghost': return Colors.gray[700];
      default: return Colors.primary[600];
    }
  };
  
  const getBorderStyle = () => {
    if (variant === 'outline') {
      return {
        borderWidth: 1,
        borderColor: Colors.primary[600]
      };
    }
    return {};
  };
  
  const containerSize = getContainerSize();
  
  const renderButton = () => (
    <TouchableOpacity
      style={[
        styles.container,
        {
          width: containerSize,
          height: containerSize,
          backgroundColor: getBackgroundColor(),
          opacity: disabled ? 0.5 : 1
        },
        getBorderStyle()
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {React.cloneElement(icon as React.ReactElement<IconProps>, { 
        color: getIconColor(),
        size: size === 'small' ? 16 : size === 'medium' ? 20 : 24
      })}
    </TouchableOpacity>
  );
  
  if (label) {
    return (
      <View style={[
        styles.labelContainer,
        labelPosition === 'right' ? styles.labelContainerRight : styles.labelContainerBottom
      ]}>
        {renderButton()}
        <Typography 
          variant="bodySmall" 
          color={disabled ? Colors.gray[400] : Colors.gray[700]}
          style={labelPosition === 'right' ? styles.labelRight : styles.labelBottom}
        >
          {label}
        </Typography>
      </View>
    );
  }
  
  return renderButton();
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelContainer: {
    alignItems: 'center',
  },
  labelContainerBottom: {
    flexDirection: 'column',
  },
  labelContainerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelBottom: {
    marginTop: 4,
  },
  labelRight: {
    marginLeft: 8,
  }
});

export default IconButton;
