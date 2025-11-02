import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Button from '@/components/base/Button';
import { colors } from '@/constants/theme';
import { fontSize, spacing } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from 'react-native';

interface PrivacySettings {
  dataSharing: boolean;
  analytics: boolean;
  personalizedAds: boolean;
  locationData: boolean;
  thirdPartySharing: boolean;
  crashReporting: boolean;
}

interface PrivacySettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

const PRIVACY_STORAGE_KEY = '@PulseZen:privacy_settings';

export function PrivacySettingsModal({
  visible,
  onClose,
}: PrivacySettingsModalProps) {
  const [settings, setSettings] = useState<PrivacySettings>({
    dataSharing: false,
    analytics: true,
    personalizedAds: false,
    locationData: false,
    thirdPartySharing: false,
    crashReporting: true,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadPrivacySettings();
    }
  }, [visible]);

  const loadPrivacySettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(PRIVACY_STORAGE_KEY);
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Erro ao carregar configurações de privacidade:', error);
    }
  };

  const savePrivacySettings = async (newSettings: PrivacySettings) => {
    try {
      await AsyncStorage.setItem(PRIVACY_STORAGE_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Erro ao salvar configurações de privacidade:', error);
      Alert.alert('Erro', 'Não foi possível salvar as configurações.');
    }
  };

  const updateSetting = (key: keyof PrivacySettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    savePrivacySettings(newSettings);
  };

  const handleDeleteData = () => {
    Alert.alert(
      'Excluir Dados',
      'Esta ação irá excluir permanentemente todos os seus dados do aplicativo. Esta ação não pode ser desfeita.\n\nDeseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              // Clear all app data
              await AsyncStorage.clear();
              Alert.alert(
                'Dados Excluídos',
                'Todos os seus dados foram excluídos com sucesso.',
                [{ text: 'OK', onPress: onClose }]
              );
            } catch (error) {
              console.error('Erro ao excluir dados:', error);
              Alert.alert('Erro', 'Não foi possível excluir os dados.');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Exportar Dados',
      'Em breve você poderá solicitar uma cópia dos seus dados conforme a LGPD.',
      [{ text: 'OK' }]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <ThemedView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.neutral.text.primary} />
          </TouchableOpacity>
          <ThemedText style={styles.title}>Privacidade</ThemedText>
          <View style={styles.headerRight} />
        </View>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* LGPD Information */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Seus Direitos (LGPD)</ThemedText>
            <ThemedText style={styles.description}>
              Conforme a Lei Geral de Proteção de Dados (LGPD), você tem o direito de saber quais dados coletamos, 
              como os usamos, e pode solicitar a correção, exclusão ou portabilidade dos seus dados.
            </ThemedText>
          </View>

          {/* Data Collection Settings */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Coleta de Dados</ThemedText>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <ThemedText style={styles.settingLabel}>Compartilhamento de Dados</ThemedText>
                <ThemedText style={styles.settingDescription}>
                  Permitir compartilhamento de dados de uso para melhorar o aplicativo
                </ThemedText>
              </View>
              <Switch
                value={settings.dataSharing}
                onValueChange={(value) => updateSetting('dataSharing', value)}
                trackColor={{ false: colors.neutral.divider, true: colors.primary.light }}
                thumbColor={settings.dataSharing ? colors.primary.main : colors.neutral.white}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <ThemedText style={styles.settingLabel}>Análise de Uso</ThemedText>
                <ThemedText style={styles.settingDescription}>
                  Coletar dados anônimos sobre como você usa o aplicativo
                </ThemedText>
              </View>
              <Switch
                value={settings.analytics}
                onValueChange={(value) => updateSetting('analytics', value)}
                trackColor={{ false: colors.neutral.divider, true: colors.primary.light }}
                thumbColor={settings.analytics ? colors.primary.main : colors.neutral.white}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <ThemedText style={styles.settingLabel}>Anúncios Personalizados</ThemedText>
                <ThemedText style={styles.settingDescription}>
                  Usar seus dados para personalizar anúncios (atualmente não utilizamos anúncios)
                </ThemedText>
              </View>
              <Switch
                value={settings.personalizedAds}
                onValueChange={(value) => updateSetting('personalizedAds', value)}
                trackColor={{ false: colors.neutral.divider, true: colors.primary.light }}
                thumbColor={settings.personalizedAds ? colors.primary.main : colors.neutral.white}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <ThemedText style={styles.settingLabel}>Dados de Localização</ThemedText>
                <ThemedText style={styles.settingDescription}>
                  Coletar informações de localização para recursos baseados em localização
                </ThemedText>
              </View>
              <Switch
                value={settings.locationData}
                onValueChange={(value) => updateSetting('locationData', value)}
                trackColor={{ false: colors.neutral.divider, true: colors.primary.light }}
                thumbColor={settings.locationData ? colors.primary.main : colors.neutral.white}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <ThemedText style={styles.settingLabel}>Compartilhamento com Terceiros</ThemedText>
                <ThemedText style={styles.settingDescription}>
                  Permitir que parceiros confiáveis acessem dados anônimos
                </ThemedText>
              </View>
              <Switch
                value={settings.thirdPartySharing}
                onValueChange={(value) => updateSetting('thirdPartySharing', value)}
                trackColor={{ false: colors.neutral.divider, true: colors.primary.light }}
                thumbColor={settings.thirdPartySharing ? colors.primary.main : colors.neutral.white}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <ThemedText style={styles.settingLabel}>Relatórios de Erro</ThemedText>
                <ThemedText style={styles.settingDescription}>
                  Enviar relatórios automáticos de erro para melhorar a estabilidade
                </ThemedText>
              </View>
              <Switch
                value={settings.crashReporting}
                onValueChange={(value) => updateSetting('crashReporting', value)}
                trackColor={{ false: colors.neutral.divider, true: colors.primary.light }}
                thumbColor={settings.crashReporting ? colors.primary.main : colors.neutral.white}
              />
            </View>
          </View>

          {/* Data Management */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Gerenciar Dados</ThemedText>
            
            <TouchableOpacity style={styles.actionButton} onPress={handleExportData}>
              <Ionicons name="download-outline" size={20} color={colors.primary.main} />
              <View style={styles.actionInfo}>
                <ThemedText style={styles.actionLabel}>Exportar Dados</ThemedText>
                <ThemedText style={styles.actionDescription}>
                  Solicitar uma cópia dos seus dados
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.neutral.text.disabled} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleDeleteData}>
              <Ionicons name="trash-outline" size={20} color={colors.error.main} />
              <View style={styles.actionInfo}>
                <ThemedText style={[styles.actionLabel, { color: colors.error.main }]}>
                  Excluir Todos os Dados
                </ThemedText>
                <ThemedText style={styles.actionDescription}>
                  Remover permanentemente todos os seus dados
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.neutral.text.disabled} />
            </TouchableOpacity>
          </View>

          {/* Contact Information */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Contato</ThemedText>
            <ThemedText style={styles.description}>
              Para questões sobre privacidade ou exercer seus direitos da LGPD, entre em contato:
              {'\n\n'}📧 acalmarapp@gmail.com
              {'\n\n'}Data Protection Officer:
              {'\n'}Lucas Vieira - acalmarapp@gmail.com
            </ThemedText>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            label="Fechar"
            onPress={onClose}
            style={styles.closeButtonAction}
            disabled={isLoading}
          />
        </View>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingTop: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.divider,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: fontSize.lg,
    fontFamily: 'Inter-SemiBold',
    color: colors.neutral.text.primary,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontFamily: 'Inter-SemiBold',
    color: colors.primary.main,
    marginBottom: spacing.md,
  },
  description: {
    fontSize: fontSize.md,
    fontFamily: 'Inter-Regular',
    color: colors.neutral.text.secondary,
    lineHeight: 22,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.divider,
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingLabel: {
    fontSize: fontSize.md,
    fontFamily: 'Inter-Medium',
    color: colors.neutral.text.primary,
    marginBottom: spacing.xs,
  },
  settingDescription: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: colors.neutral.text.secondary,
    lineHeight: 18,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.divider,
  },
  actionInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  actionLabel: {
    fontSize: fontSize.md,
    fontFamily: 'Inter-Medium',
    color: colors.neutral.text.primary,
    marginBottom: spacing.xs,
  },
  actionDescription: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: colors.neutral.text.secondary,
  },
  actions: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  closeButtonAction: {
    width: '100%',
  },
});