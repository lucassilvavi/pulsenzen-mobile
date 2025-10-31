import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { useBiometricAuth } from '../../hooks/useBiometricAuth';
import BiometricSetup from './BiometricSetup';

interface BiometricSettingsProps {
  style?: any;
}

const BiometricSettings: React.FC<BiometricSettingsProps> = ({ style }) => {
  const {
    isAvailable,
    isEnabled,
    isLoading,
    setupBiometric,
    disableBiometric,
    generateBackupCodes,
    getBackupCodes,
    refreshState,
  } = useBiometricAuth();

  const [showSetup, setShowSetup] = useState(false);

  /**
   * Handle toggle biometric authentication
   */
  const handleToggle = async (enabled: boolean) => {
    if (enabled) {
      setShowSetup(true);
    } else {
      await disableBiometric();
    }
  };

  /**
   * Handle setup complete
   */
  const handleSetupComplete = async () => {
    // Refresh state to update the checkbox
    await refreshState();
    
    Alert.alert(
      '🎉 Sucesso!',
      'A autenticação biométrica foi configurada com sucesso. Agora você pode usá-la para fazer login de forma rápida e segura.',
      [{ text: 'Ótimo!' }]
    );
  };

  /**
   * Handle view backup codes
   */
  const handleViewBackupCodes = async () => {
    try {
      const codes = await getBackupCodes();
      
      if (codes && codes.length > 0) {
        const codeList = codes.map((code, index) => `${index + 1}. ${code.code}`).join('\n');
        
        Alert.alert(
          '🔑 Códigos de Backup',
          `Seus códigos de backup:\n\n${codeList}\n\nGuarde estes códigos em um local seguro.`,
          [
            { text: 'Fechar', style: 'cancel' },
            { 
              text: 'Gerar Novos', 
              onPress: handleGenerateNewCodes,
              style: 'default'
            }
          ]
        );
      } else {
        Alert.alert(
          '❌ Nenhum Código Encontrado',
          'Nenhum código de backup encontrado. Deseja gerar novos?',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Gerar', onPress: handleGenerateNewCodes }
          ]
        );
      }
    } catch (error) {
      Alert.alert('❌ Erro', 'Falha ao recuperar códigos de backup');
    }
  };

  /**
   * Handle generate new backup codes
   */
  const handleGenerateNewCodes = async () => {
    try {
      const codes = await generateBackupCodes();
      
      if (codes && codes.length > 0) {
        const codeList = codes.map((code, index) => `${index + 1}. ${code}`).join('\n');
        
        Alert.alert(
          '🔑 Novos Códigos de Backup',
          `Seus novos códigos de backup:\n\n${codeList}\n\n⚠️ Guarde estes códigos em um local seguro. Seus códigos antigos não são mais válidos.`,
          [{ text: 'Entendi!' }]
        );
      } else {
        Alert.alert('❌ Erro', 'Falha ao gerar códigos de backup');
      }
    } catch (error) {
      Alert.alert('❌ Erro', 'Falha ao gerar códigos de backup');
    }
  };

  if (!isAvailable) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.unavailableContainer}>
          <Ionicons name="finger-print-outline" size={24} color={Colors.gray[400]} />
          <Text style={styles.unavailableText}>
            Autenticação biométrica não disponível neste dispositivo
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {/* Main Toggle */}
      <View style={styles.settingItem}>
        <View style={styles.settingLeft}>
          <Ionicons 
            name="finger-print" 
            size={24} 
            color={isEnabled ? Colors.primary[600] : Colors.gray[400]} 
          />
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>Autenticação Biométrica</Text>
            <Text style={styles.settingDescription}>
              {isEnabled 
                ? 'Use impressão digital ou Face ID para entrar' 
                : 'Habilite login rápido e seguro'
              }
            </Text>
          </View>
        </View>
        
        <Switch
          value={isEnabled}
          onValueChange={handleToggle}
          disabled={isLoading}
          trackColor={{
            false: Colors.gray[200],
            true: Colors.primary[100],
          }}
          thumbColor={isEnabled ? Colors.primary[600] : Colors.gray[400]}
        />
      </View>

      {/* Backup Codes Section - Only show if biometric is enabled */}
      {isEnabled && (
        <>
          <View style={styles.separator} />
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={handleViewBackupCodes}
            disabled={isLoading}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="key" size={24} color={Colors.gray[600]} />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Códigos de Backup</Text>
                <Text style={styles.settingDescription}>
                  Ver ou gerar códigos de acesso de backup
                </Text>
              </View>
            </View>
            
            <Ionicons name="chevron-forward" size={20} color={Colors.gray[400]} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={handleGenerateNewCodes}
            disabled={isLoading}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="refresh" size={24} color={Colors.gray[600]} />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Gerar Novos Códigos</Text>
                <Text style={styles.settingDescription}>
                  Criar novos códigos de backup (invalida os antigos)
                </Text>
              </View>
            </View>
            
            <Ionicons name="chevron-forward" size={20} color={Colors.gray[400]} />
          </TouchableOpacity>
        </>
      )}

      {/* Setup Modal */}
      <BiometricSetup
        visible={showSetup}
        onClose={() => setShowSetup(false)}
        onSetupComplete={handleSetupComplete}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.white,
  },
  settingLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: Colors.gray[600],
    lineHeight: 18,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.gray[200],
    marginLeft: 52,
  },
  unavailableContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  unavailableText: {
    fontSize: 14,
    color: Colors.gray[500],
    flex: 1,
  },
});

export default BiometricSettings;
