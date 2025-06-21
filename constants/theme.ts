import { borderRadius, fontSize, lineHeight, shadows, spacing } from '@/utils/responsive';
import { StyleSheet } from 'react-native';

// Define theme colors
export const colors = {
  // Primary colors
  primary: {
    main: '#2196F3',
    light: '#64B5F6',
    dark: '#1976D2',
    contrast: '#FFFFFF',
  },
  
  // Secondary colors
  secondary: {
    main: '#4CAF50',
    light: '#81C784',
    dark: '#388E3C',
    contrast: '#FFFFFF',
  },
  
  // Accent colors
  accent: {
    main: '#FF9800',
    light: '#FFB74D',
    dark: '#F57C00',
    contrast: '#000000',
  },
  
  // Semantic colors
  success: {
    main: '#4CAF50',
    light: '#A5D6A7',
    dark: '#2E7D32',
    contrast: '#FFFFFF',
  },
  
  warning: {
    main: '#FF9800',
    light: '#FFE082',
    dark: '#EF6C00',
    contrast: '#000000',
  },
  
  error: {
    main: '#F44336',
    light: '#FFCDD2',
    dark: '#D32F2F',
    contrast: '#FFFFFF',
  },
  
  info: {
    main: '#2196F3',
    light: '#BBDEFB',
    dark: '#0D47A1',
    contrast: '#FFFFFF',
  },
  
  // Neutral colors
  neutral: {
    white: '#FFFFFF',
    black: '#000000',
    background: '#F5F5F5',
    card: '#FFFFFF',
    text: {
      primary: '#212121',
      secondary: '#757575',
      disabled: '#9E9E9E',
      hint: '#9E9E9E',
    },
    divider: '#E0E0E0',
  },
  
  // Feature-specific colors
  breathing: {
    primary: '#A1CEDC',
    secondary: '#E8F4F8',
    accent: '#2196F3',
  },
  
  sleep: {
    primary: '#9575CD',
    secondary: '#EDE7F6',
    accent: '#673AB7',
  },
  
  sos: {
    primary: '#FFCDD2',
    secondary: '#FFEBEE',
    accent: '#F44336',
  },
  
  journal: {
    primary: '#FFE0B2',
    secondary: '#FFF8E1',
    accent: '#FF9800',
  },
  
  profile: {
    primary: '#E1F5FE',
    secondary: '#F5F5F5',
    accent: '#03A9F4',
  },
  
  // Gradient presets
  gradients: {
    primary: ['#2196F3', '#64B5F6'],
    breathing: ['#A1CEDC', '#E8F4F8'],
    sleep: ['#9575CD', '#EDE7F6'],
    sos: ['#FFCDD2', '#FFEBEE'],
    journal: ['#FFE0B2', '#FFF8E1'],
    profile: ['#E1F5FE', '#F5F5F5'],
  },
};

// Define common styles
export const commonStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  
  contentContainer: {
    padding: spacing.md,
  },
  
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  spaceBetweenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  // Card styles
  card: {
    backgroundColor: colors.neutral.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.small,
  },
  
  // Text styles
  title: {
    fontSize: fontSize.xxl,
    lineHeight: lineHeight.xxl,
    fontFamily: 'Inter-Bold',
    color: colors.neutral.text.primary,
    marginBottom: spacing.sm,
  },
  
  subtitle: {
    fontSize: fontSize.lg,
    lineHeight: lineHeight.lg,
    fontFamily: 'Inter-SemiBold',
    color: colors.neutral.text.primary,
    marginBottom: spacing.sm,
  },
  
  bodyText: {
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
    fontFamily: 'Inter-Regular',
    color: colors.neutral.text.primary,
  },
  
  caption: {
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    fontFamily: 'Inter-Regular',
    color: colors.neutral.text.secondary,
  },
  
  // Form styles
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.neutral.divider,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.md,
    color: colors.neutral.text.primary,
    backgroundColor: colors.neutral.white,
    marginBottom: spacing.md,
  },
  
  // Button styles
  button: {
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  
  primaryButton: {
    backgroundColor: colors.primary.main,
  },
  
  secondaryButton: {
    backgroundColor: colors.secondary.main,
  },
  
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary.main,
  },
  
  buttonText: {
    fontSize: fontSize.md,
    fontFamily: 'Inter-Medium',
    color: colors.neutral.white,
  },
  
  outlineButtonText: {
    fontSize: fontSize.md,
    fontFamily: 'Inter-Medium',
    color: colors.primary.main,
  },
  
  // Icon styles
  icon: {
    width: 24,
    height: 24,
  },
  
  // Divider styles
  divider: {
    height: 1,
    backgroundColor: colors.neutral.divider,
    marginVertical: spacing.md,
  },
  
  // Shadow styles
  shadowSmall: shadows.small,
  shadowMedium: shadows.medium,
  shadowLarge: shadows.large,
  
  // Spacing helpers
  marginBottom: {
    xs: { marginBottom: spacing.xs },
    sm: { marginBottom: spacing.sm },
    md: { marginBottom: spacing.md },
    lg: { marginBottom: spacing.lg },
    xl: { marginBottom: spacing.xl },
  },
  
  marginTop: {
    xs: { marginTop: spacing.xs },
    sm: { marginTop: spacing.sm },
    md: { marginTop: spacing.md },
    lg: { marginTop: spacing.lg },
    xl: { marginTop: spacing.xl },
  },
  
  padding: {
    xs: { padding: spacing.xs },
    sm: { padding: spacing.sm },
    md: { padding: spacing.md },
    lg: { padding: spacing.lg },
    xl: { padding: spacing.xl },
  },
  
  // Border radius helpers
  rounded: {
    xs: { borderRadius: borderRadius.xs },
    sm: { borderRadius: borderRadius.sm },
    md: { borderRadius: borderRadius.md },
    lg: { borderRadius: borderRadius.lg },
    xl: { borderRadius: borderRadius.xl },
    full: { borderRadius: borderRadius.round },
  },
});

export default {
  colors,
  commonStyles,
};
