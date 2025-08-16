import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';
import { useJournalNavigation } from '../../navigation/JournalNavigation';

interface NavigationBarProps {
  currentRoute: 'entries' | 'search' | 'analytics' | 'prompts';
  onRouteChange: (route: 'entries' | 'search' | 'analytics' | 'prompts') => void;
}

/**
 * Enhanced navigation bar with gesture support and animations
 */
export const JournalNavigationBar: React.FC<NavigationBarProps> = ({
  currentRoute,
  onRouteChange
}) => {
  const navigation = useJournalNavigation();
  const translateX = useSharedValue(0);
  const indicatorPosition = useSharedValue(getIndicatorPosition(currentRoute));

  function getIndicatorPosition(route: string): number {
    switch (route) {
      case 'entries': return 0;
      case 'search': return 1;
      case 'analytics': return 2;
      case 'prompts': return 3;
      default: return 0;
    }
  }

  const routes = [
    { 
      key: 'entries', 
      icon: 'book-outline' as const, 
      activeIcon: 'book' as const, 
      label: 'Entradas' 
    },
    { 
      key: 'search', 
      icon: 'search-outline' as const, 
      activeIcon: 'search' as const, 
      label: 'Buscar' 
    },
    { 
      key: 'analytics', 
      icon: 'analytics-outline' as const, 
      activeIcon: 'analytics' as const, 
      label: 'Análise' 
    },
    { 
      key: 'prompts', 
      icon: 'bulb-outline' as const, 
      activeIcon: 'bulb' as const, 
      label: 'Prompts' 
    }
  ];

  const handleRoutePress = (route: string) => {
    onRouteChange(route as any);
    indicatorPosition.value = withTiming(getIndicatorPosition(route));
    navigation.toTab(route as any);
  };

  // Swipe gesture for tab navigation
  const swipeGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      const threshold = 50;
      const currentIndex = getIndicatorPosition(currentRoute);
      
      if (event.translationX > threshold && currentIndex > 0) {
        // Swipe right - go to previous tab
        const newRoute = routes[currentIndex - 1].key;
        runOnJS(handleRoutePress)(newRoute);
      } else if (event.translationX < -threshold && currentIndex < routes.length - 1) {
        // Swipe left - go to next tab
        const newRoute = routes[currentIndex + 1].key;
        runOnJS(handleRoutePress)(newRoute);
      }
      
      translateX.value = withTiming(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorPosition.value * 75 }],
  }));

  return (
    <GestureDetector gesture={swipeGesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <Animated.View style={[styles.indicator, indicatorStyle]} />
        
        {routes.map((route, index) => (
          <Pressable
            key={route.key}
            style={[
              styles.tab,
              currentRoute === route.key && styles.activeTab
            ]}
            onPress={() => handleRoutePress(route.key)}
          >
            <Ionicons
              name={currentRoute === route.key ? route.activeIcon : route.icon}
              size={24}
              color={currentRoute === route.key ? '#007AFF' : '#8E8E93'}
            />
          </Pressable>
        ))}
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'space-around',
    position: 'relative',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#F2F2F7',
  },
  indicator: {
    position: 'absolute',
    top: 0,
    left: 20,
    width: 75,
    height: 3,
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
});
