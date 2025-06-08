import React from 'react';
import { StyleSheet, View, AccessibilityInfo, AccessibilityProps } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ThemedText';
import { colors } from '@/constants/theme';
import { spacing, fontSize } from '@/utils/responsive';

interface AccessibilityWrapperProps extends AccessibilityProps {
  children: React.ReactNode;
  label?: string;
  hint?: string;
  role?: 'none' | 'button' | 'link' | 'search' | 'image' | 'text' | 'adjustable' | 'header' | 'summary' | 'imagebutton';
  testID?: string;
}

/**
 * A wrapper component that enhances child components with proper accessibility attributes
 */
export const AccessibilityWrapper: React.FC<AccessibilityWrapperProps> = ({
  children,
  label,
  hint,
  role = 'none',
  testID,
  ...accessibilityProps
}) => {
  return (
    <View
      accessible={true}
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityRole={role}
      testID={testID}
      {...accessibilityProps}
    >
      {children}
    </View>
  );
};

/**
 * A component that provides screen reader announcements
 */
export const ScreenReaderAnnouncement: React.FC<{ message: string }> = ({ message }) => {
  React.useEffect(() => {
    if (message) {
      AccessibilityInfo.announceForAccessibility(message);
    }
  }, [message]);

  return null; // This component doesn't render anything
};

/**
 * A component that displays accessibility instructions for screen readers
 */
export const AccessibilityInstructions: React.FC<{ instructions: string }> = ({ instructions }) => {
  const [screenReaderEnabled, setScreenReaderEnabled] = React.useState(false);

  React.useEffect(() => {
    // Check if screen reader is enabled
    const checkScreenReader = async () => {
      const isEnabled = await AccessibilityInfo.isScreenReaderEnabled();
      setScreenReaderEnabled(isEnabled);
    };

    checkScreenReader();

    // Listen for screen reader changes
    const listener = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setScreenReaderEnabled
    );

    return () => {
      listener.remove();
    };
  }, []);

  // Only show instructions if screen reader is enabled
  if (!screenReaderEnabled) {
    return null;
  }

  return (
    <View style={styles.instructionsContainer} accessibilityRole="text">
      <IconSymbol name="info.circle" size={20} color={colors.info.main} />
      <ThemedText style={styles.instructionsText}>{instructions}</ThemedText>
    </View>
  );
};

/**
 * A component that provides focus management for accessibility
 */
export const FocusableView = React.forwardRef<View, React.ComponentProps<typeof View>>((props, ref) => {
  return (
    <View
      {...props}
      ref={ref}
      accessible={true}
      accessibilityViewIsModal={false}
      importantForAccessibility="yes"
    />
  );
});

const styles = StyleSheet.create({
  instructionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.info.light,
    padding: spacing.sm,
    borderRadius: 8,
    marginVertical: spacing.sm,
  },
  instructionsText: {
    marginLeft: spacing.sm,
    fontSize: fontSize.sm,
    color: colors.info.dark,
    flex: 1,
  },
});

export default {
  AccessibilityWrapper,
  ScreenReaderAnnouncement,
  AccessibilityInstructions,
  FocusableView,
};
