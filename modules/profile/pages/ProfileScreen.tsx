import { AvatarPicker } from '@/components/AvatarPicker';
import Button from '@/components/base/Button';
import Card from '@/components/base/Card';
import { BiometricSettings } from '@/components/biometric';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useUserAvatar } from '@/hooks/useUserAvatar';
import { useUserData } from '@/hooks/useUserData';
import { fontSize, spacing } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EditProfileModal } from '../components/EditProfileModal';
import { ProfileService } from '../services/ProfileService';
import { Achievement, UserProfile, UserStats } from '../types';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();
  const { displayName, email } = useUserData();
  const { userAvatar, updateUserAvatar } = useUserAvatar();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  useEffect(() => {
    loadLocalData();
  }, [displayName, email]); // Add dependencies to reload when user data changes

  const loadLocalData = async () => {
    try {
      // Load local data (stats, achievements, profile)
      const stats = await ProfileService.getUserStats();
      const userAchievements = await ProfileService.getUserAchievements();
      const profile = await ProfileService.getUserProfile();

      setUserStats(stats);
      setAchievements(Array.isArray(userAchievements) ? userAchievements : []); // Ensure achievements is always an array
      
      // Set profile with current user data if no saved profile exists
      if (profile) {
        setUserProfile(profile);
      } else {
        // Create default profile from current user data
        const defaultProfile: UserProfile = {
          name: displayName || 'Usuário',
          email: email || '',
          createdAt: new Date().toISOString(),
        };
        setUserProfile(defaultProfile);
      }
      
      console.log('📱 Avatar carregado:', userAvatar ? 'Foto encontrada' : 'Nenhuma foto salva');
    } catch (error) {
      console.error('Erro ao carregar dados locais:', error);
      // Set default values in case of error
      setAchievements([]);
    }
  };

  const handleEditProfile = () => {
    setIsEditModalVisible(true);
  };

  const handleProfileUpdated = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
    // Avatar é automaticamente sincronizado pelo hook useUserAvatar
  };

  const loadUserAvatar = async () => {
    // Avatar é gerenciado pelo hook useUserAvatar
    // Não precisa mais carregar aqui
  };

  const handleAvatarChange = async (newAvatarUri: string | null) => {
    try {
      console.log('📷 Salvando nova foto do avatar:', newAvatarUri);
      const success = await updateUserAvatar(newAvatarUri);
      if (success) {
        console.log('✅ Avatar salvo com sucesso!');
      } else {
        throw new Error('Falha ao salvar avatar');
      }
    } catch (error) {
      console.error('❌ Erro ao salvar avatar:', error);
      Alert.alert('Erro', 'Não foi possível salvar a foto.');
    }
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
      'Tem certeza que deseja sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear local profile data (stats, achievements, settings)
              await ProfileService.clearUserData();
              
              // Logout using AuthContext (clears token and user data)
              await logout();
              
              // Removido: router.replace('/onboarding/welcome');
            } catch (error) {
              console.error('Erro ao fazer logout:', error);
              Alert.alert('Erro', 'Não foi possível fazer logout. Tente novamente.');
            }
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

      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={colors.primary.main} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Perfil</ThemedText>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <AvatarPicker
            currentImage={userAvatar || undefined}
            onImageSelected={handleAvatarChange}
            size={100}
            showEditButton={true}
          />
          <ThemedText style={styles.userName}>
            {userProfile?.name || displayName}
          </ThemedText>
          <ThemedText style={styles.userEmail}>
            {userProfile?.email || email || 'usuario@pulsezen.com'}
          </ThemedText>
        </View>

        {/* Profile Stats 
        <Card style={styles.statsCard}>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statNumber}>
                {userStats?.streakDays || 0}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Dias de sequência</ThemedText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <ThemedText style={styles.statNumber}>
                {userStats?.completedSessions || 0}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Sessões concluídas</ThemedText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <ThemedText style={styles.statNumber}>
                {userStats?.totalMinutes || 0}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Minutos praticados</ThemedText>
            </View>
          </View>
        </Card>
*/}
        {/* Achievements 
        <Card style={styles.sectionCard}>
          <ThemedText style={styles.sectionTitle}>Conquistas</ThemedText>
          <View style={styles.achievementsGrid}>
            {ACHIEVEMENTS.map((achievement: Achievement) => {
              const isUnlocked = Array.isArray(achievements) && achievements.some(a => a.id === achievement.id);
              return (
                <View 
                  key={achievement.id}
                  style={[
                    styles.achievementCard,
                    !isUnlocked && styles.achievementLocked
                  ]}
                >
                  <ThemedText style={styles.achievementIcon}>
                    {achievement.icon}
                  </ThemedText>
                  <ThemedText style={styles.achievementTitle}>
                    {achievement.title}
                  </ThemedText>
                </View>
              );
            })}
          </View>
        </Card>*/}

        {/* Settings */}
        <Card style={styles.sectionCard}>
          <ThemedText style={styles.sectionTitle}>Configurações</ThemedText>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleEditProfile}>
            <ThemedText style={styles.settingLabel}>Editar Perfil</ThemedText>
            <ThemedText style={styles.settingArrow}>›</ThemedText>
          </TouchableOpacity>
          
          {/* <TouchableOpacity style={styles.settingItem} onPress={handleNotifications}>
            <ThemedText style={styles.settingLabel}>Notificações</ThemedText>
            <ThemedText style={styles.settingArrow}>›</ThemedText>
          </TouchableOpacity>*/}
          
          <TouchableOpacity style={styles.settingItem} onPress={handlePrivacy}>
            <ThemedText style={styles.settingLabel}>Privacidade</ThemedText>
            <ThemedText style={styles.settingArrow}>›</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleSupport}>
            <ThemedText style={styles.settingLabel}>Suporte</ThemedText>
            <ThemedText style={styles.settingArrow}>›</ThemedText>
          </TouchableOpacity>
        </Card>

        {/* Biometric Settings */}
        <Card style={styles.sectionCard}>
          <ThemedText style={styles.sectionTitle}>Segurança</ThemedText>
          <BiometricSettings style={styles.biometricSettings} />
        </Card>

        {/* Logout Button */}
        <Button
          label="Sair"
          variant="outline"
          onPress={handleLogout}
          style={styles.logoutButton}
        />
      </ScrollView>

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        currentProfile={userProfile}
        onProfileUpdated={handleProfileUpdated}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    zIndex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontFamily: 'Inter-SemiBold',
    color: colors.primary.main,
  },
  headerRight: {
    width: 40,
    height: 40,
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
  userName: {
    fontSize: fontSize.xl,
    fontFamily: 'Inter-Bold',
    color: colors.primary.main,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
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
  biometricSettings: {
    borderRadius: 0,
    backgroundColor: 'transparent',
  },
});
