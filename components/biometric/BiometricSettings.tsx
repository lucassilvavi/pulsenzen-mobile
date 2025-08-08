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
  const handleSetupComplete = () => {
    Alert.alert(
      '🎉 Success!',
      'Biometric authentication has been set up successfully. You can now use it to sign in quickly and securely.',
      [{ text: 'Great!' }]
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
          '🔑 Backup Codes',
          `Your backup codes:\n\n${codeList}\n\nSave these codes in a secure location.`,
          [
            { text: 'Close', style: 'cancel' },
            { 
              text: 'Generate New', 
              onPress: handleGenerateNewCodes,
              style: 'default'
            }
          ]
        );
      } else {
        Alert.alert(
          '❌ No Codes Found',
          'No backup codes found. Would you like to generate new ones?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Generate', onPress: handleGenerateNewCodes }
          ]
        );
      }
    } catch (error) {
      Alert.alert('❌ Error', 'Failed to retrieve backup codes');
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
          '🔑 New Backup Codes',
          `Your new backup codes:\n\n${codeList}\n\n⚠️ Save these codes in a secure location. Your old codes are no longer valid.`,
          [{ text: 'Got it!' }]
        );
      } else {
        Alert.alert('❌ Error', 'Failed to generate backup codes');
      }
    } catch (error) {
      Alert.alert('❌ Error', 'Failed to generate backup codes');
    }
  };

  if (!isAvailable) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.unavailableContainer}>
          <Ionicons name="finger-print-outline" size={24} color={Colors.gray[400]} />
          <Text style={styles.unavailableText}>
            Biometric authentication is not available on this device
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
            <Text style={styles.settingTitle}>Biometric Authentication</Text>
            <Text style={styles.settingDescription}>
              {isEnabled 
                ? 'Use fingerprint or face ID to sign in' 
                : 'Enable quick and secure login'
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
                <Text style={styles.settingTitle}>Backup Codes</Text>
                <Text style={styles.settingDescription}>
                  View or generate backup access codes
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
                <Text style={styles.settingTitle}>Generate New Codes</Text>
                <Text style={styles.settingDescription}>
                  Create new backup codes (invalidates old ones)
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
