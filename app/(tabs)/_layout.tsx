import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import musicService from '@/services/musicService';
import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  // Estado para verificar se há uma música tocando para ajustar o tabBar
  const [hasMusicPlaying, setHasMusicPlaying] = useState(false);
  
  useEffect(() => {
    // Adiciona um listener para verificar mudanças no estado de reprodução
    const unsubscribe = musicService.addPlaybackListener((state) => {
      setHasMusicPlaying(!!state.currentTrack);
    });
    
    // Verifica o estado inicial
    setHasMusicPlaying(!!musicService.getPlaybackState().currentTrack);
    
    return unsubscribe;
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
            // Adiciona padding bottom quando há música tocando para não sobrepor o mini-player
            paddingBottom: hasMusicPlaying ? 75 : 0,
          },
          default: {
            // Adiciona padding bottom quando há música tocando para não sobrepor o mini-player
            paddingBottom: hasMusicPlaying ? 75 : 0,
          },
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
