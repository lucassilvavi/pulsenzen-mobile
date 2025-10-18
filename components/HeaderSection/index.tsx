import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { colors } from '@/constants/theme';
import { useUserAvatar } from '@/hooks/useUserAvatar';
import { useUserData } from '@/hooks/useUserData';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface HeaderSectionProps {
  userName?: string;
}

export default function HeaderSection({ userName }: HeaderSectionProps) {
  const { userAvatar } = useUserAvatar();
  const { rawUser, rawProfile } = useUserData();
  
  // Função para determinar se o nome é longo e ajustar o estilo
  const getNameStyle = (name: string) => {
    const nameLength = name.length;
    if (nameLength > 20) {
      return [styles.userName, styles.userNameLong];
    } else if (nameLength > 15) {
      return [styles.userName, styles.userNameMedium];
    }
    return styles.userName;
  };

  const displayName = userName || 'Visitante';

  const handleProfilePress = () => {
    router.push('/profile');
  };

  const getDefaultAvatarImage = () => {
    const userGender = (rawProfile as any)?.sex;
    if (userGender === 'MENINO' || userGender === 'MASCULINO') {
      return require('@/assets/images/man.png');
    } else if (userGender === 'MENINA' || userGender === 'FEMININO') {
      return require('@/assets/images/woman.png');
    }
    return null;
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

    // Verificar se há imagem padrão baseada no gênero
    const defaultImage = getDefaultAvatarImage();
    if (defaultImage) {
      return (
        <Image
          source={defaultImage}
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
      <ThemedView style={styles.nameContainer}>
        <ThemedText style={styles.greeting}>Olá,</ThemedText>
        <ThemedText style={getNameStyle(displayName)} numberOfLines={1} ellipsizeMode="tail">
          {displayName}
        </ThemedText>
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
  nameContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    marginRight: 15, // Espaço entre nome e avatar
  },
  greeting: {
    fontSize: 18,
    fontWeight: '400',
    color: colors.neutral.text.secondary,
    marginBottom: 2,
  },
  userName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.neutral.text.primary,
    lineHeight: 30,
  },
  userNameMedium: {
    fontSize: 22,
    lineHeight: 26,
  },
  userNameLong: {
    fontSize: 20,
    lineHeight: 24,
  },
  profileImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: 'transparent', // fundo transparente
    flexShrink: 0, // Não permite que o avatar diminua
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