import Button from '@/components/base/Button';
import Card from '@/components/base/Card';
import { ThemedText } from '@/components/ThemedText';
import { colors } from '@/constants/theme';
import { fontSize, spacing } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import {
    Alert,
    Clipboard,
    Modal,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';

interface DebugConfigModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function DebugConfigModal({ visible, onClose }: DebugConfigModalProps) {
  // Collect all environment variables and config
  const envVars = {
    // API Configuration
    EXPO_PUBLIC_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
    EXPO_PUBLIC_API_VERSION: process.env.EXPO_PUBLIC_API_VERSION,
    EXPO_PUBLIC_API_TIMEOUT: process.env.EXPO_PUBLIC_API_TIMEOUT,
    
    // Environment
    EXPO_PUBLIC_NODE_ENV: process.env.EXPO_PUBLIC_NODE_ENV,
    EXPO_PUBLIC_DEBUG_MODE: process.env.EXPO_PUBLIC_DEBUG_MODE,
    EXPO_PUBLIC_USE_REAL_API: process.env.EXPO_PUBLIC_USE_REAL_API,
    
    // Feature Flags
    EXPO_PUBLIC_ENABLE_ANALYTICS: process.env.EXPO_PUBLIC_ENABLE_ANALYTICS,
    EXPO_PUBLIC_ENABLE_CRASH_REPORTING: process.env.EXPO_PUBLIC_ENABLE_CRASH_REPORTING,
    EXPO_PUBLIC_ENABLE_OFFLINE_MODE: process.env.EXPO_PUBLIC_ENABLE_OFFLINE_MODE,
    EXPO_PUBLIC_ENABLE_BIOMETRIC_AUTH: process.env.EXPO_PUBLIC_ENABLE_BIOMETRIC_AUTH,
    
    // App Configuration
    EXPO_PUBLIC_APP_VERSION: process.env.EXPO_PUBLIC_APP_VERSION,
    EXPO_PUBLIC_MIN_APP_VERSION: process.env.EXPO_PUBLIC_MIN_APP_VERSION,
    
    // Rate Limiting
    EXPO_PUBLIC_API_RATE_LIMIT: process.env.EXPO_PUBLIC_API_RATE_LIMIT,
    EXPO_PUBLIC_REQUEST_TIMEOUT: process.env.EXPO_PUBLIC_REQUEST_TIMEOUT,
    
    // Storage Configuration
    EXPO_PUBLIC_MAX_STORAGE_SIZE: process.env.EXPO_PUBLIC_MAX_STORAGE_SIZE,
    EXPO_PUBLIC_STORAGE_ENCRYPTION: process.env.EXPO_PUBLIC_STORAGE_ENCRYPTION,
    
    // Development
    EXPO_PUBLIC_API_MOCK_ENABLED: process.env.EXPO_PUBLIC_API_MOCK_ENABLED,
    EXPO_PUBLIC_LOG_LEVEL: process.env.EXPO_PUBLIC_LOG_LEVEL,
  };

  // Runtime configuration
  const runtimeConfig = {
    __DEV__: __DEV__,
    Platform: require('react-native').Platform.OS,
    Version: require('react-native').Platform.Version,
    UserAgent: global.navigator?.userAgent || 'N/A',
    NetworkState: 'Unknown', // You could add network state detection here
  };

  const copyToClipboard = async () => {
    const configText = JSON.stringify({
      environment: envVars,
      runtime: runtimeConfig,
      timestamp: new Date().toISOString()
    }, null, 2);
    
    try {
      await Clipboard.setString(configText);
      Alert.alert('Copiado!', 'Configuração copiada para a área de transferência');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível copiar a configuração');
    }
  };

  const testApiConnection = async () => {
    try {
      const apiUrl = envVars.EXPO_PUBLIC_API_BASE_URL || 'https://pulsezen-api-production.up.railway.app/api';
      const testUrl = `${apiUrl}/v1/health`;
      
      Alert.alert('Testando...', `Fazendo requisição para: ${testUrl}`);
      
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      const result = await response.text();
      
      Alert.alert(
        'Resultado do Teste',
        `Status: ${response.status}\nResponse: ${result.substring(0, 200)}${result.length > 200 ? '...' : ''}`
      );
    } catch (error: any) {
      Alert.alert('Erro na Conexão', `Erro: ${error.message}\nCode: ${error.code || 'N/A'}`);
    }
  };

  const renderConfigItem = (key: string, value: any) => (
    <View key={key} style={styles.configItem}>
      <ThemedText style={styles.configKey}>{key}:</ThemedText>
      <ThemedText style={styles.configValue}>
        {value !== undefined ? String(value) : 'undefined'}
      </ThemedText>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>🔧 Debug Configuration</ThemedText>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.neutral.text.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Card style={styles.section}>
            <ThemedText style={styles.sectionTitle}>📡 Environment Variables</ThemedText>
            {Object.entries(envVars).map(([key, value]) => renderConfigItem(key, value))}
          </Card>

          <Card style={styles.section}>
            <ThemedText style={styles.sectionTitle}>🏃‍♂️ Runtime Configuration</ThemedText>
            {Object.entries(runtimeConfig).map(([key, value]) => renderConfigItem(key, value))}
          </Card>

          <View style={styles.actionButtons}>
            <Button
              label="📋 Copiar Configuração"
              onPress={copyToClipboard}
              style={styles.actionButton}
            />
            
            <Button
              label="🔗 Testar Conexão API"
              onPress={testApiConnection}
              style={styles.actionButton}
              variant="secondary"
            />
          </View>
        </ScrollView>
      </View>
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
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.divider,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: spacing.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  section: {
    marginVertical: spacing.md,
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    marginBottom: spacing.md,
    color: colors.primary.main,
  },
  configItem: {
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.divider,
  },
  configKey: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.neutral.text.secondary,
    marginBottom: 2,
  },
  configValue: {
    fontSize: fontSize.sm,
    color: colors.neutral.text.primary,
    fontFamily: 'monospace',
  },
  actionButtons: {
    marginVertical: spacing.lg,
    gap: spacing.md,
  },
  actionButton: {
    marginBottom: spacing.sm,
  },
});