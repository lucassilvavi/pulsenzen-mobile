import { Dimensions, Platform, PixelRatio } from 'react-native';

// Dimensions of the design mockup (based on iPhone 12/13)
const designWidth = 390;
const designHeight = 844;

// Get device dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Calculate scale factors
const widthScaleFactor = screenWidth / designWidth;
const heightScaleFactor = screenHeight / designHeight;

/**
 * Scales a size value based on the device's screen width relative to the design width
 * @param size - Size in pixels based on design mockup
 * @returns Scaled size for current device
 */
export const scaleWidth = (size: number): number => {
  const newSize = size * widthScaleFactor;
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

/**
 * Scales a size value based on the device's screen height relative to the design height
 * @param size - Size in pixels based on design mockup
 * @returns Scaled size for current device
 */
export const scaleHeight = (size: number): number => {
  const newSize = size * heightScaleFactor;
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

/**
 * Scales a font size value based on the device's screen width
 * with a more moderate scaling factor to prevent text from becoming too large or small
 * @param size - Font size in pixels based on design mockup
 * @returns Scaled font size for current device
 */
export const scaleFontSize = (size: number): number => {
  // Use a more moderate scaling factor for fonts (0.75 of the full scale)
  const scaleFactor = widthScaleFactor * 0.75;
  const newSize = size * scaleFactor;
  
  // Ensure font size doesn't go below minimum readable size
  const minSize = 10;
  const finalSize = Math.max(minSize, newSize);
  
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(finalSize));
  }
  return Math.round(PixelRatio.roundToNearestPixel(finalSize));
};

/**
 * Scales a spacing value (margin, padding) based on the device's screen width
 * @param size - Spacing size in pixels based on design mockup
 * @returns Scaled spacing for current device
 */
export const scaleSpacing = (size: number): number => {
  return scaleWidth(size);
};

/**
 * Determines if the device is a tablet based on screen dimensions and pixel density
 * @returns Boolean indicating if the device is a tablet
 */
export const isTablet = (): boolean => {
  const pixelDensity = PixelRatio.get();
  const adjustedWidth = screenWidth * pixelDensity;
  const adjustedHeight = screenHeight * pixelDensity;
  
  return (
    Math.max(adjustedWidth, adjustedHeight) >= 1000 && 
    Math.min(adjustedWidth, adjustedHeight) >= 600
  );
};

/**
 * Returns the appropriate size based on whether the device is a phone or tablet
 * @param phoneSize - Size to use for phones
 * @param tabletSize - Size to use for tablets
 * @returns The appropriate size based on device type
 */
export const deviceSpecificSize = (phoneSize: number, tabletSize: number): number => {
  return isTablet() ? tabletSize : phoneSize;
};

/**
 * Returns the appropriate styles based on whether the device is a phone or tablet
 * @param phoneStyles - Styles to use for phones
 * @param tabletStyles - Styles to use for tablets
 * @returns The appropriate styles based on device type
 */
export const deviceSpecificStyles = (phoneStyles: any, tabletStyles: any): any => {
  return isTablet() ? tabletStyles : phoneStyles;
};

// Export device dimensions for convenience
export const deviceDimensions = {
  width: screenWidth,
  height: screenHeight,
  isSmallDevice: screenWidth < 375,
  isMediumDevice: screenWidth >= 375 && screenWidth < 414,
  isLargeDevice: screenWidth >= 414,
};

// Export common spacing values
export const spacing = {
  xs: scaleSpacing(4),
  sm: scaleSpacing(8),
  md: scaleSpacing(16),
  lg: scaleSpacing(24),
  xl: scaleSpacing(32),
  xxl: scaleSpacing(48),
};

// Export common border radius values
export const borderRadius = {
  xs: scaleWidth(4),
  sm: scaleWidth(8),
  md: scaleWidth(12),
  lg: scaleWidth(16),
  xl: scaleWidth(24),
  round: scaleWidth(999),
};

// Export common font sizes
export const fontSize = {
  xs: scaleFontSize(12),
  sm: scaleFontSize(14),
  md: scaleFontSize(16),
  lg: scaleFontSize(18),
  xl: scaleFontSize(20),
  xxl: scaleFontSize(24),
  xxxl: scaleFontSize(32),
};

// Export common line heights
export const lineHeight = {
  xs: scaleFontSize(16),
  sm: scaleFontSize(20),
  md: scaleFontSize(24),
  lg: scaleFontSize(28),
  xl: scaleFontSize(32),
  xxl: scaleFontSize(36),
  xxxl: scaleFontSize(40),
};

// Export common shadow styles
export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
};
