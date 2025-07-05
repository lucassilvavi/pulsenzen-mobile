import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Button from '@/components/base/Button';
import Card from '@/components/base/Card';
import Header from '@/components/base/Header';
import TabBar from '@/components/base/TabBar';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function ProfileScreen() {
  const { top, bottom, left, right } = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <ThemedView style={[styles.container, { paddingTop: top }]}>
      <LinearGradient
        colors={['#E1F5FE', '#F5F5F5']}
        style={styles.headerGradient}
      />
      
      <Header title="Perfil" showBackButton={false} />
      
      
      <ThemedView style={styles.profileHeader}>
        <ThemedView style={styles.profileImageContainer}>
          <Image
            source={require('@/assets/images/profile-placeholder.png')}
            style={styles.profileImage}
            contentFit="cover"
          />
          <ThemedView style={styles.editIconContainer}>
            <IconSymbol name="pencil" size={16} color="#FFFFFF" />
          </ThemedView>
        </ThemedView>
        <ThemedText type="title" style={styles.profileName}>Lucas Silva</ThemedText>
        <ThemedText style={styles.profileBio}>Buscando equilíbrio e bem-estar a cada dia</ThemedText>
        
        <ThemedView style={styles.statsContainer}>
          <ThemedView style={styles.statItem}>
            <ThemedText style={styles.statValue}>28</ThemedText>
            <ThemedText style={styles.statLabel}>Dias</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statDivider} />
          <ThemedView style={styles.statItem}>
            <ThemedText style={styles.statValue}>86</ThemedText>
            <ThemedText style={styles.statLabel}>Sessões</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statDivider} />
          <ThemedView style={styles.statItem}>
            <ThemedText style={styles.statValue}>7</ThemedText>
            <ThemedText style={styles.statLabel}>Sequência</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
      
      <TabBar
        tabs={[
          { id: 'profile', label: 'Perfil' },
          { id: 'stats', label: 'Estatísticas' },
          { id: 'achievements', label: 'Conquistas' },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        style={styles.tabBar}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'profile' && (
          <>
            {/* Settings Section */}
            <ThemedView style={styles.sectionContainer}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>Configurações</ThemedText>
              
              <Card style={styles.settingsCard}>
                <ThemedView style={styles.settingItem}>
                  <ThemedView style={styles.settingIconContainer}>
                    <IconSymbol name="person.fill" size={20} color="#2196F3" />
                  </ThemedView>
                  <ThemedText style={styles.settingText}>Editar Perfil</ThemedText>
                  <IconSymbol name="chevron.right" size={20} color="#757575" />
                </ThemedView>
                
                <ThemedView style={styles.settingDivider} />
                
                <ThemedView style={styles.settingItem}>
                  <ThemedView style={styles.settingIconContainer}>
                    <IconSymbol name="bell.fill" size={20} color="#2196F3" />
                  </ThemedView>
                  <ThemedText style={styles.settingText}>Notificações</ThemedText>
                  <IconSymbol name="chevron.right" size={20} color="#757575" />
                </ThemedView>
                
                <ThemedView style={styles.settingDivider} />
                
                <ThemedView style={styles.settingItem}>
                  <ThemedView style={styles.settingIconContainer}>
                    <IconSymbol name="lock.fill" size={20} color="#2196F3" />
                  </ThemedView>
                  <ThemedText style={styles.settingText}>Privacidade</ThemedText>
                  <IconSymbol name="chevron.right" size={20} color="#757575" />
                </ThemedView>
                
                <ThemedView style={styles.settingDivider} />
                
                <ThemedView style={styles.settingItem}>
                  <ThemedView style={styles.settingIconContainer}>
                    <IconSymbol name="moon.stars.fill" size={20} color="#2196F3" />
                  </ThemedView>
                  <ThemedText style={styles.settingText}>Tema</ThemedText>
                  <IconSymbol name="chevron.right" size={20} color="#757575" />
                </ThemedView>
              </Card>
            </ThemedView>

            {/* Goals Section */}
            <ThemedView style={styles.sectionContainer}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>Metas Diárias</ThemedText>
              
              <Card style={styles.goalsCard}>
                <ThemedView style={styles.goalItem}>
                  <ThemedView style={styles.goalInfo}>
                    <ThemedText style={styles.goalTitle}>Meditação</ThemedText>
                    <ThemedText style={styles.goalSubtitle}>10 minutos por dia</ThemedText>
                  </ThemedView>
                  <ThemedView style={styles.goalProgress}>
                    <ThemedView style={styles.progressBar}>
                      <ThemedView style={[styles.progressFill, { width: '70%', backgroundColor: '#4CAF50' }]} />
                    </ThemedView>
                    <ThemedText style={styles.progressText}>7/10 min</ThemedText>
                  </ThemedView>
                </ThemedView>
                
                <ThemedView style={styles.goalDivider} />
                
                <ThemedView style={styles.goalItem}>
                  <ThemedView style={styles.goalInfo}>
                    <ThemedText style={styles.goalTitle}>Respiração</ThemedText>
                    <ThemedText style={styles.goalSubtitle}>3 sessões por dia</ThemedText>
                  </ThemedView>
                  <ThemedView style={styles.goalProgress}>
                    <ThemedView style={styles.progressBar}>
                      <ThemedView style={[styles.progressFill, { width: '33%', backgroundColor: '#FF9800' }]} />
                    </ThemedView>
                    <ThemedText style={styles.progressText}>1/3 sessões</ThemedText>
                  </ThemedView>
                </ThemedView>
                
                <ThemedView style={styles.goalDivider} />
                
                <ThemedView style={styles.goalItem}>
                  <ThemedView style={styles.goalInfo}>
                    <ThemedText style={styles.goalTitle}>Diário</ThemedText>
                    <ThemedText style={styles.goalSubtitle}>1 entrada por dia</ThemedText>
                  </ThemedView>
                  <ThemedView style={styles.goalProgress}>
                    <ThemedView style={styles.progressBar}>
                      <ThemedView style={[styles.progressFill, { width: '100%', backgroundColor: '#4CAF50' }]} />
                    </ThemedView>
                    <ThemedText style={styles.progressText}>Completo</ThemedText>
                  </ThemedView>
                </ThemedView>
              </Card>
              
              <Button 
                label="Editar Metas" 
                variant="outline"
                style={styles.editGoalsButton}
              />
            </ThemedView>

            {/* Support Section */}
            <Card style={styles.supportCard}>
              <ThemedText type="subtitle">Precisa de ajuda?</ThemedText>
              <ThemedText style={styles.supportText}>
                Estamos aqui para ajudar com qualquer dúvida ou problema que você possa ter.
              </ThemedText>
              <ThemedView style={styles.supportActions}>
                <Button 
                  label="Suporte" 
                  variant="outline"
                  style={styles.supportButton}
                  leftIcon={<IconSymbol name="questionmark.circle" size={18} color="#2196F3" />}
                />
                <Button 
                  label="Feedback" 
                  variant="outline"
                  style={styles.supportButton}
                  leftIcon={<IconSymbol name="star.fill" size={18} color="#2196F3" />}
                />
              </ThemedView>
            </Card>
            
            <Button 
              label="Sair" 
              variant="outline"
              style={styles.logoutButton}
              labelStyle={styles.logoutButtonLabel}
            />
          </>
        )}
        
        {activeTab === 'stats' && (
          <>
            {/* Activity Overview */}
            <Card style={styles.statsCard}>
              <ThemedText type="subtitle">Visão Geral da Atividade</ThemedText>
              
              <ThemedView style={styles.activityStats}>
                <ThemedView style={styles.activityItem}>
                  <ThemedView style={[styles.activityIcon, { backgroundColor: '#E3F2FD' }]}>
                    <IconSymbol name="clock.fill" size={24} color="#2196F3" />
                  </ThemedView>
                  <ThemedText style={styles.activityValue}>12h 30m</ThemedText>
                  <ThemedText style={styles.activityLabel}>Tempo Total</ThemedText>
                </ThemedView>
                
                <ThemedView style={styles.activityItem}>
                  <ThemedView style={[styles.activityIcon, { backgroundColor: '#E8F5E9' }]}>
                    <IconSymbol name="calendar" size={24} color="#4CAF50" />
                  </ThemedView>
                  <ThemedText style={styles.activityValue}>28</ThemedText>
                  <ThemedText style={styles.activityLabel}>Dias Ativos</ThemedText>
                </ThemedView>
                
                <ThemedView style={styles.activityItem}>
                  <ThemedView style={[styles.activityIcon, { backgroundColor: '#FFF3E0' }]}>
                    <IconSymbol name="flame.fill" size={24} color="#FF9800" />
                  </ThemedView>
                  <ThemedText style={styles.activityValue}>7</ThemedText>
                  <ThemedText style={styles.activityLabel}>Sequência</ThemedText>
                </ThemedView>
              </ThemedView>
              
              {/* Activity Chart Placeholder */}
              <ThemedView style={styles.chartPlaceholder}>
                <ThemedText style={styles.chartPlaceholderText}>Gráfico de Atividade</ThemedText>
              </ThemedView>
            </Card>
            
            {/* Session Breakdown */}
            <ThemedView style={styles.sectionContainer}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>Detalhamento de Sessões</ThemedText>
              
              <Card style={styles.breakdownCard}>
                <ThemedView style={styles.breakdownItem}>
                  <ThemedView style={styles.breakdownInfo}>
                    <ThemedView style={[styles.breakdownIcon, { backgroundColor: '#E3F2FD' }]}>
                      <IconSymbol name="wind" size={20} color="#2196F3" />
                    </ThemedView>
                    <ThemedText style={styles.breakdownText}>Respiração</ThemedText>
                  </ThemedView>
                  <ThemedText style={styles.breakdownValue}>32 sessões</ThemedText>
                </ThemedView>
                
                <ThemedView style={styles.breakdownDivider} />
                
                <ThemedView style={styles.breakdownItem}>
                  <ThemedView style={styles.breakdownInfo}>
                    <ThemedView style={[styles.breakdownIcon, { backgroundColor: '#E8F5E9' }]}>
                      <IconSymbol name="moon.stars.fill" size={20} color="#4CAF50" />
                    </ThemedView>
                    <ThemedText style={styles.breakdownText}>Sono</ThemedText>
                  </ThemedView>
                  <ThemedText style={styles.breakdownValue}>18 sessões</ThemedText>
                </ThemedView>
                
                <ThemedView style={styles.breakdownDivider} />
                
                <ThemedView style={styles.breakdownItem}>
                  <ThemedView style={styles.breakdownInfo}>
                    <ThemedView style={[styles.breakdownIcon, { backgroundColor: '#FFF3E0' }]}>
                      <IconSymbol name="book.fill" size={20} color="#FF9800" />
                    </ThemedView>
                    <ThemedText style={styles.breakdownText}>Diário</ThemedText>
                  </ThemedView>
                  <ThemedText style={styles.breakdownValue}>28 entradas</ThemedText>
                </ThemedView>
                
                <ThemedView style={styles.breakdownDivider} />
                
                <ThemedView style={styles.breakdownItem}>
                  <ThemedView style={styles.breakdownInfo}>
                    <ThemedView style={[styles.breakdownIcon, { backgroundColor: '#FFEBEE' }]}>
                      <IconSymbol name="heart.fill" size={20} color="#F44336" />
                    </ThemedView>
                    <ThemedText style={styles.breakdownText}>SOS</ThemedText>
                  </ThemedView>
                  <ThemedText style={styles.breakdownValue}>8 sessões</ThemedText>
                </ThemedView>
              </Card>
            </ThemedView>
            
            {/* Mood Tracking */}
            <ThemedView style={styles.sectionContainer}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>Rastreamento de Humor</ThemedText>
              
              {/* Mood Chart Placeholder */}
              <Card style={styles.moodChartCard}>
                <ThemedView style={styles.chartPlaceholder}>
                  <ThemedText style={styles.chartPlaceholderText}>Gráfico de Humor</ThemedText>
                </ThemedView>
                
                <ThemedView style={styles.moodSummary}>
                  <ThemedText style={styles.moodSummaryText}>
                    Seu humor tem sido predominantemente positivo nos últimos 30 dias, com 70% das entradas registradas como "Ótimo" ou "Bem".
                  </ThemedText>
                </ThemedView>
              </Card>
            </ThemedView>
          </>
        )}
        
        {activeTab === 'achievements' && (
          <>
            {/* Achievements Section */}
            <ThemedView style={styles.achievementsHeader}>
              <ThemedText type="subtitle">Suas Conquistas</ThemedText>
              <ThemedView style={styles.achievementsSummary}>
                <ThemedText style={styles.achievementsCount}>12/30</ThemedText>
                <ThemedText style={styles.achievementsLabel}>conquistas desbloqueadas</ThemedText>
              </ThemedView>
            </ThemedView>
            
            <ThemedView style={styles.achievementsGrid}>
              <Card style={styles.achievementCard}>
                <ThemedView style={[styles.achievementIcon, { backgroundColor: '#E3F2FD' }]}>
                  <IconSymbol name="star.fill" size={24} color="#2196F3" />
                </ThemedView>
                <ThemedText style={styles.achievementTitle}>Primeiros Passos</ThemedText>
                <ThemedText style={styles.achievementDescription}>Complete sua primeira sessão de meditação</ThemedText>
              </Card>
              
              <Card style={styles.achievementCard}>
                <ThemedView style={[styles.achievementIcon, { backgroundColor: '#E8F5E9' }]}>
                  <IconSymbol name="flame.fill" size={24} color="#4CAF50" />
                </ThemedView>
                <ThemedText style={styles.achievementTitle}>Sequência de 7 Dias</ThemedText>
                <ThemedText style={styles.achievementDescription}>Use o app por 7 dias consecutivos</ThemedText>
              </Card>
              
              <Card style={styles.achievementCard}>
                <ThemedView style={[styles.achievementIcon, { backgroundColor: '#FFF3E0' }]}>
                  <IconSymbol name="book.fill" size={24} color="#FF9800" />
                </ThemedView>
                <ThemedText style={styles.achievementTitle}>Escritor Dedicado</ThemedText>
                <ThemedText style={styles.achievementDescription}>Crie 10 entradas no diário</ThemedText>
              </Card>
              
              <Card style={[styles.achievementCard, styles.achievementLocked]}>
                <ThemedView style={[styles.achievementIcon, { backgroundColor: '#F5F5F5' }]}>
                  <IconSymbol name="lock.fill" size={24} color="#9E9E9E" />
                </ThemedView>
                <ThemedText style={styles.achievementTitleLocked}>Mestre da Respiração</ThemedText>
                <ThemedText style={styles.achievementDescriptionLocked}>Complete 20 sessões de respiração</ThemedText>
              </Card>
              
              <Card style={[styles.achievementCard, styles.achievementLocked]}>
                <ThemedView style={[styles.achievementIcon, { backgroundColor: '#F5F5F5' }]}>
                  <IconSymbol name="lock.fill" size={24} color="#9E9E9E" />
                </ThemedView>
                <ThemedText style={styles.achievementTitleLocked}>Dorminhoco Tranquilo</ThemedText>
                <ThemedText style={styles.achievementDescriptionLocked}>Use 15 vezes os sons para dormir</ThemedText>
              </Card>
              
              <Card style={[styles.achievementCard, styles.achievementLocked]}>
                <ThemedView style={[styles.achievementIcon, { backgroundColor: '#F5F5F5' }]}>
                  <IconSymbol name="lock.fill" size={24} color="#9E9E9E" />
                </ThemedView>
                <ThemedText style={styles.achievementTitleLocked}>Sequência de 30 Dias</ThemedText>
                <ThemedText style={styles.achievementDescriptionLocked}>Use o app por 30 dias consecutivos</ThemedText>
              </Card>
            </ThemedView>
            
            <Button 
              label="Ver Todas as Conquistas" 
              variant="outline"
              style={styles.viewAllButton}
            />
          </>
        )}
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
    height: 200,
  },
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    backgroundColor: '#E0E0E0',
    marginBottom: 15,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  editIconContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    marginBottom: 5,
  },
  profileBio: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
  },
  tabBar: {
    marginHorizontal: 20,
    marginBottom: 15,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 15,
  },
  settingsCard: {
    padding: 5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
  },
  settingDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 15,
  },
  goalsCard: {
    padding: 5,
    marginBottom: 15,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  goalInfo: {
    flex: 1,
    marginRight: 15,
  },
  goalTitle: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 3,
  },
  goalSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  goalProgress: {
    width: 120,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
    marginBottom: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'right',
  },
  goalDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 15,
  },
  editGoalsButton: {
    marginBottom: 20,
  },
  supportCard: {
    padding: 20,
    marginBottom: 20,
  },
  supportText: {
    marginTop: 10,
    marginBottom: 15,
  },
  supportActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  supportButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  logoutButton: {
    marginBottom: 20,
    borderColor: '#F44336',
  },
  logoutButtonLabel: {
    color: '#F44336',
  },
  statsCard: {
    padding: 20,
    marginBottom: 20,
  },
  activityStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    marginBottom: 20,
  },
  activityItem: {
    alignItems: 'center',
  },
  activityIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  activityValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 5,
  },
  activityLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  chartPlaceholder: {
    height: 200,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartPlaceholderText: {
    opacity: 0.5,
  },
  breakdownCard: {
    padding: 5,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
  },
  breakdownInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breakdownIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  breakdownText: {
    fontSize: 16,
  },
  breakdownValue: {
    fontWeight: '600',
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 15,
  },
  moodChartCard: {
    padding: 20,
  },
  moodSummary: {
    marginTop: 15,
  },
  moodSummaryText: {
    lineHeight: 22,
  },
  achievementsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  achievementsSummary: {
    alignItems: 'flex-end',
  },
  achievementsCount: {
    fontSize: 18,
    fontWeight: '700',
  },
  achievementsLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  achievementCard: {
    width: '48%',
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  achievementLocked: {
    opacity: 0.6,
  },
  achievementIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  achievementTitle: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 5,
    textAlign: 'center',
  },
  achievementTitleLocked: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 5,
    textAlign: 'center',
    color: '#9E9E9E',
  },
  achievementDescription: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  achievementDescriptionLocked: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
    color: '#9E9E9E',
  },
  viewAllButton: {
    marginBottom: 20,
  },
});
