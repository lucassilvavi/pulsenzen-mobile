import React from 'react';
import { StyleSheet, View, TouchableOpacity, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface BottomTabBarProps {
  activeTab: string;
  style?: ViewStyle;
}

const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  style,
}) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const tabs = [
    { id: 'index', label: 'Home', icon: 'house.fill', route: '/' },
    { id: 'breathing', label: 'Respiração', icon: 'wind', route: '/breathing' },
    { id: 'sos', label: 'SOS', icon: 'heart.fill', route: '/sos' },
    { id: 'journal', label: 'Diário', icon: 'book.fill', route: '/journal' },
    { id: 'profile', label: 'Perfil', icon: 'person.fill', route: '/profile' },
  ];

  const handleTabPress = (tabRoute: string, tabId: string) => {
    if (tabId !== activeTab) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push(tabRoute);
    }
  };

  return (
    <ThemedView 
      style={[
        styles.container, 
        { paddingBottom: insets.bottom > 0 ? insets.bottom : 16 },
        style
      ]}
    >
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={styles.tab}
          onPress={() => handleTabPress(tab.route, tab.id)}
          activeOpacity={0.7}
        >
          <View style={styles.tabContent}>
            <IconSymbol 
              name={tab.icon} 
              size={24} 
              color={activeTab === tab.id ? '#2196F3' : '#757575'} 
            />
            <ThemedText 
              style={[
                styles.tabLabel,
                activeTab === tab.id ? styles.activeTabLabel : null,
              ]}
            >
              {tab.label}
            </ThemedText>
          </View>
        </TouchableOpacity>
      ))}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 5,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
  },
  tabContent: {
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
    color: '#757575',
  },
  activeTabLabel: {
    color: '#2196F3',
    fontWeight: '600',
  },
});

export default BottomTabBar;
