import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { colors } from '@/constants/theme';
import { useUserAvatar } from '@/hooks/useUserAvatar';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface HeaderSectionProps {
  userName?: string;
}

export default function HeaderSection({ userName }: HeaderSectionProps) {
  const { userAvatar } = useUserAvatar();

  const handleProfilePress = () => {
    router.push('/profile');
  };

  const renderProfileImage = () => {
    if (userAvatar) {
      return (
        <Image
          source={{ uri: userAvatar }}
          style={styles.profileImage}
          contentFit="cover"
        />
      );
    }

    // Avatar padrão com ícone de pessoa
    return (
      <View style={styles.defaultAvatarContainer}>
        <Ionicons 
          name="person" 
          size={28} 
          color={colors.primary.main} 
        />
      </View>
    );
  };

  return (
    <ThemedView style={styles.header}>
      <ThemedView style={{ backgroundColor: 'transparent' }}>
        <ThemedText type="title">Olá, {userName || 'Visitante'}</ThemedText>
      </ThemedView>
      <TouchableOpacity onPress={handleProfilePress} style={styles.profileImageContainer}>
        {renderProfileImage()}
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: 'transparent', // fundo transparente
  },
  profileImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: 'transparent', // fundo transparente
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  defaultAvatarContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.neutral.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary.main,
  },
});