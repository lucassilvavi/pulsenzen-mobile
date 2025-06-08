import Typography from '@/components/base/Typography';
import { Colors } from '@/constants/Colors';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface ListItemProps {
  title: string;
  subtitle?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onPress?: () => void;
  showDivider?: boolean;
  disabled?: boolean;
}

const ListItem = ({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  onPress,
  showDivider = true,
  disabled = false
}: ListItemProps) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        showDivider && styles.divider,
        disabled && styles.disabled
      ]}
      onPress={onPress}
      disabled={disabled || !onPress}
      activeOpacity={0.7}
    >
      {leftIcon && (
        <View style={styles.leftIcon}>
          {leftIcon}
        </View>
      )}
      
      <View style={styles.content}>
        <Typography 
          variant="body" 
          weight="medium" 
          color={Colors.gray[800]}
        >
          {title}
        </Typography>
        
        {subtitle && (
          <Typography 
            variant="bodySmall" 
            color={Colors.gray[600]}
            style={styles.subtitle}
          >
            {subtitle}
          </Typography>
        )}
      </View>
      
      {rightIcon && (
        <View style={styles.rightIcon}>
          {rightIcon}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    backgroundColor: Colors.white,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  disabled: {
    opacity: 0.5,
  },
  leftIcon: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  subtitle: {
    marginTop: 2,
  },
  rightIcon: {
    marginLeft: 12,
  }
});

export default ListItem;
