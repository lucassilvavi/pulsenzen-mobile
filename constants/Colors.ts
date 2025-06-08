/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Gradients = {
  primary: ['#EEF2FF', '#F3E8FF'] as [string, string], // from-indigo-50 to-purple-50
  secondary: ['#EEF2FF', '#F3E8FF'], // from-indigo-50 to-purple-100
};

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
  primary: {
    50: '#EEF2FF',  // from-indigo-50
    100: '#E0E7FF', // bg-indigo-100
    500: '#6366F1', // text-indigo-500
    600: '#4F46E5', // bg-indigo-600
    700: '#4338CA', // text-indigo-700
    800: '#3730A3', // text-indigo-800
    900: '#312E81', // text-indigo-900
  },
  
  // Purple shades
  purple: {
    50: '#FAF5FF',  // to-purple-50
    100: '#F3E8FF', // to-purple-100
    500: '#A855F7', // text-purple-500
    600: '#9333EA', // text-purple-600
    700: '#7E22CE', // text-purple-700
  },
  
  // Blue shades
  blue: {
    100: '#DBEAFE', // bg-blue-100
    500: '#3B82F6', // bg-blue-500
    600: '#2563EB', // text-blue-600
    700: '#1D4ED8', // text-blue-700
    800: '#1E40AF', // text-blue-800
  },
  
  // Red shades
  red: {
    100: '#FEE2E2', // bg-red-100
    500: '#EF4444', // bg-red-500
    600: '#DC2626', // text-red-600
    700: '#B91C1C', // text-red-700
    800: '#991B1B', // text-red-800
  },
  
  // Green shades
  green: {
    100: '#DCFCE7', // bg-green-100
    800: '#166534', // text-green-800
  },
  
  // Yellow shades
  yellow: {
    100: '#FEF9C3', // bg-yellow-100
    800: '#854D0E', // text-yellow-800
  },
  
  // Orange shades
  orange: {
    100: '#FFEDD5', // bg-orange-100
    800: '#9A3412', // text-orange-800
  },
  
  // Gray shades
  gray: {
    50: '#F9FAFB',  // bg-gray-50
    100: '#F3F4F6', // bg-gray-100
    200: '#E5E7EB', // bg-gray-200
    300: '#D1D5DB', // border-gray-300
    400: '#9CA3AF', // text-gray-400
    500: '#6B7280', // text-gray-500
    600: '#4B5563', // text-gray-600
    700: '#374151', // text-gray-700
    800: '#1F2937', // text-gray-800
  },
  
  // Base colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};
