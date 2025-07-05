import Button from '@/components/base/Button';
import Card from '@/components/base/Card';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { colors } from '@/constants/theme';
import { fontSize, spacing } from '@/utils/responsive';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const name = await AsyncStorage.getItem('userName');
      const email = await AsyncStorage.getItem('userEmail');
      setUserName(name || 'Usuário');
      setUserEmail(email || 'usuario@pulsezen.com');
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    }
  };

  const handleEditProfile = () => {
    Alert.alert('Em desenvolvimento', 'Esta funcionalidade estará disponível em breve!');
  };

  const handleNotifications = () => {
    Alert.alert('Em desenvolvimento', 'Esta funcionalidade estará disponível em breve!');
  };

  const handlePrivacy = () => {
    Alert.alert('Em desenvolvimento', 'Esta funcionalidade estará disponível em breve!');
  };

  const handleSupport = () => {
    Alert.alert('Em desenvolvimento', 'Esta funcionalidade estará disponível em breve!');
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            router.replace('/onboarding/welcome');
          }
        }
      ]
    );
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#A1CEDC', '#E8F4F8']}
        style={styles.headerGradient}
      />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image
              source={require('@/assets/images/profile-placeholder.png')}
              style={styles.avatar}
              contentFit="cover"
            />
          </View>
          <ThemedText style={styles.userName}>{userName}</ThemedText>
          <ThemedText style={styles.userEmail}>{userEmail}</ThemedText>
        </View>

        {/* Profile Stats */}
        <Card style={styles.statsCard}>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statNumber}>12</ThemedText>
              <ThemedText style={styles.statLabel}>Dias de sequência</ThemedText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <ThemedText style={styles.statNumber}>45</ThemedText>
              <ThemedText style={styles.statLabel}>Sessões concluídas</ThemedText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <ThemedText style={styles.statNumber}>180</ThemedText>
              <ThemedText style={styles.statLabel}>Minutos praticados</ThemedText>
            </View>
          </View>
        </Card>

        {/* Achievements */}
        <Card style={styles.sectionCard}>
          <ThemedText style={styles.sectionTitle}>Conquistas</ThemedText>
          <View style={styles.achievementsGrid}>
            <View style={styles.achievementCard}>
              <ThemedText style={styles.achievementIcon}>🏆</ThemedText>
              <ThemedText style={styles.achievementTitle}>Primeira Sessão</ThemedText>
            </View>
            <View style={styles.achievementCard}>
              <ThemedText style={styles.achievementIcon}>🔥</ThemedText>
              <ThemedText style={styles.achievementTitle}>7 Dias Seguidos</ThemedText>
            </View>
            <View style={[styles.achievementCard, styles.achievementLocked]}>
              <ThemedText style={styles.achievementIcon}>🌟</ThemedText>
              <ThemedText style={styles.achievementTitle}>30 Dias Seguidos</ThemedText>
            </View>
            <View style={[styles.achievementCard, styles.achievementLocked]}>
              <ThemedText style={styles.achievementIcon}>💎</ThemedText>
              <ThemedText style={styles.achievementTitle}>100 Sessões</ThemedText>
            </View>
          </View>
        </Card>

        {/* Settings */}
        <Card style={styles.sectionCard}>
          <ThemedText style={styles.sectionTitle}>Configurações</ThemedText>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleEditProfile}>
            <ThemedText style={styles.settingLabel}>Editar Perfil</ThemedText>
            <ThemedText style={styles.settingArrow}>›</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleNotifications}>
            <ThemedText style={styles.settingLabel}>Notificações</ThemedText>
            <ThemedText style={styles.settingArrow}>›</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem} onPress={handlePrivacy}>
            <ThemedText style={styles.settingLabel}>Privacidade</ThemedText>
            <ThemedText style={styles.settingArrow}>›</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleSupport}>
            <ThemedText style={styles.settingLabel}>Suporte</ThemedText>
            <ThemedText style={styles.settingArrow}>›</ThemedText>
          </TouchableOpacity>
        </Card>

        {/* Logout Button */}
        <Button
          label="Sair"
          variant="outline"
          onPress={handleLogout}
          style={styles.logoutButton}
        />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 300,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: spacing.md,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  userName: {
    fontSize: fontSize.xl,
    fontFamily: 'Inter-Bold',
    color: colors.primary.main,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: fontSize.md,
    fontFamily: 'Inter-Regular',
    color: colors.neutral.text.secondary,
  },
  statsCard: {
    marginBottom: spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: fontSize.xl,
    fontFamily: 'Inter-Bold',
    color: colors.primary.main,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: colors.neutral.text.secondary,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.neutral.divider,
  },
  sectionCard: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontFamily: 'Inter-SemiBold',
    color: colors.primary.main,
    marginBottom: spacing.md,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementCard: {
    width: '48%',
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.neutral.background,
    borderRadius: 12,
  },
  achievementLocked: {
    opacity: 0.5,
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  achievementTitle: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Medium',
    color: colors.neutral.text.primary,
    textAlign: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.divider,
  },
  settingLabel: {
    fontSize: fontSize.md,
    fontFamily: 'Inter-Medium',
    color: colors.neutral.text.primary,
  },
  settingArrow: {
    fontSize: fontSize.lg,
    color: colors.neutral.text.disabled,
  },
  logoutButton: {
    marginTop: spacing.lg,
    borderColor: colors.error.main,
    borderWidth: 1,
  },
});
