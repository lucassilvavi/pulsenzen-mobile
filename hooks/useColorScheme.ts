import { useColorScheme as useRNColorScheme } from 'react-native';
import { Platform } from 'react-native';

export function useColorScheme() {
  const colorScheme = useRNColorScheme();
  
  // Force light mode on web and always
  if (Platform.OS === 'web') {
    return 'light';
  }
  
  // Force light mode on all platforms
  return 'light';
}
