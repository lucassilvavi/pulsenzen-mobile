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
  
  // RISK semantic tokens
  risk: {
    low: {
      bg: '#E3F9F0',
      bgAlt: '#F7FCFA',
      text: '#1B7F52',
      border: '#A8E5D2',
    },
    medium: {
      bg: '#FFF4E0',
      bgAlt: '#FFF9EE',
      text: '#B25E00',
      border: '#FFD399',
    },
    high: {
      bg: '#FDE8EA',
      bgAlt: '#FEF3F4',
      text: '#B4232C',
      border: '#F5B6BC',
    }
  },
  // Prediction factor categories (tokens para UI)
  factorCategories: {
    humor: { bg: '#E0F7F4', color: '#0F766E', icon: 'happy-outline' },
    escrita: { bg: '#F1F5F9', color: '#334155', icon: 'create-outline' },
    comportamento: { bg: '#F5F3FF', color: '#6D28D9', icon: 'trending-up-outline' },
    rotina: { bg: '#FFF7ED', color: '#C2410C', icon: 'time-outline' },
  },
  riskIntensity: {
    high: { bg: '#B4232C', fg: '#FFFFFF' },
    medium: { bg: '#B25E00', fg: '#FFFFFF' },
    low: { bg: '#1B7F52', fg: '#FFFFFF' },
  },
  // Toast semantic tokens (accessible contrast, aligned with risk palette)
  toast: {
    info: { bg: '#0D47A1', fg: '#E3F2FD' },      // deep info blue + light fg
    success: { bg: '#1B5E20', fg: '#E8F5E9' },   // deep success green
    warning: { bg: '#B25E00', fg: '#FFF4E0' },   // uses medium risk text tone
    error: { bg: '#B4232C', fg: '#FDE8EA' },     // high risk red tone
  }
};

export function getFactorCategoryMeta(category: string){
  const key = category.toLowerCase();
  // tenta mapear por chave direta; fallback heurístico
  if (key.includes('humor')) return colors.factorCategories.humor;
  if (key.includes('escrita') || key.includes('linguagem')) return colors.factorCategories.escrita;
  if (key.includes('comport')) return colors.factorCategories.comportamento;
  if (key.includes('rotina') || key.includes('noite') || key.includes('uso')) return colors.factorCategories.rotina;
  return { bg:'#E2E8F0', color:'#334155', icon:'information-circle-outline' } as const;
}

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
  marginBottomXs: { marginBottom: spacing.xs },
  marginBottomSm: { marginBottom: spacing.sm },
  marginBottomMd: { marginBottom: spacing.md },
  marginBottomLg: { marginBottom: spacing.lg },
  marginBottomXl: { marginBottom: spacing.xl },
  
  marginTopXs: { marginTop: spacing.xs },
  marginTopSm: { marginTop: spacing.sm },
  marginTopMd: { marginTop: spacing.md },
  marginTopLg: { marginTop: spacing.lg },
  marginTopXl: { marginTop: spacing.xl },
  
  paddingXs: { padding: spacing.xs },
  paddingSm: { padding: spacing.sm },
  paddingMd: { padding: spacing.md },
  paddingLg: { padding: spacing.lg },
  paddingXl: { padding: spacing.xl },
  
  // Border radius helpers
  roundedXs: { borderRadius: borderRadius.xs },
  roundedSm: { borderRadius: borderRadius.sm },
  roundedMd: { borderRadius: borderRadius.md },
  roundedLg: { borderRadius: borderRadius.lg },
  roundedXl: { borderRadius: borderRadius.xl },
  roundedFull: { borderRadius: borderRadius.round },
});

export function getRiskPalette(level: 'low' | 'medium' | 'high'){ return colors.risk[level]; }

export default {
  colors,
  commonStyles,
};
