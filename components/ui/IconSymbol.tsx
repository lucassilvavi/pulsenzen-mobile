// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  // Navigation icons
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  
  // Action icons
  'addition': 'add',
  'plus': 'add',
  'checkmark.circle.fill': 'check-circle',
  'checkmark': 'check',
  'magnifyingglass': 'search',
  'pencil': 'edit',
  
  // Status and feedback icons
  'info.circle': 'info',
  'flame.fill': 'local-fire-department',
  
  // Communication icons
  'phone.fill': 'phone',
  
  // Nature and elements icons
  'wind': 'air',
  'moon.stars.fill': 'nights-stay',
  'bolt.fill': 'flash-on',
  
  // Objects and tools icons
  'book.fill': 'menu-book',
  'heart.fill': 'favorite',
  'square': 'crop-square',
  
  // Body and health icons
  'brain': 'psychology',
  
  // Breathing module icons
  'lungs': 'favorite',
  'arrow.left.and.right': 'swap-horiz',
} as any;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: any; // Made flexible to support various icon names
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name] || name} style={style} />;
}
