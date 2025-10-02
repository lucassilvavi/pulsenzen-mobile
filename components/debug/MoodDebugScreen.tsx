import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Button from '../../components/base/Button';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { useMood } from '../../modules/mood/hooks/useMood';

/**
 * Componente de Debug para diagnosticar problemas do sistema de humor
 */
export function MoodDebugScreen() {
  const {
    currentPeriod,
    hasAnsweredCurrentPeriod,
    isLoading,
    loadingStates,
    errorStates,
    syncStatus,
    todayEntries,
    recentStats,
    checkCurrentPeriodResponse,
    getMoodEntries,
    refreshData
  } = useMood();

  const [debugInfo, setDebugInfo] = React.useState<any>({});

  useEffect(() => {
    const collectDebugInfo = async () => {
      try {
        const entries = await getMoodEntries();
        const todayString = new Date().toISOString().split('T')[0];
        const todayEntriesDebug = entries.filter(entry => entry.date === todayString);
        
        setDebugInfo({
          totalEntries: entries.length,
          todayString,
          todayEntriesFound: todayEntriesDebug,
          lastEntry: entries[0] || null,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        setDebugInfo({
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString()
        });
      }
    };

    collectDebugInfo();
  }, [getMoodEntries]);

  const handleManualCheck = async () => {
    const result = await checkCurrentPeriodResponse();
    alert(`Check result: ${result}`);
  };

  const handleRefresh = async () => {
    await refreshData();
    alert('Data refreshed');
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scroll}>
        <ThemedText style={styles.title}>🔍 Mood Debug Screen</ThemedText>
        
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Estado Atual</ThemedText>
          <Text style={styles.debugText}>
            Período Atual: {currentPeriod}{'\n'}
            Respondeu Hoje: {hasAnsweredCurrentPeriod ? 'SIM' : 'NÃO'}{'\n'}
            Carregando: {isLoading ? 'SIM' : 'NÃO'}{'\n'}
            Data/Hora: {new Date().toLocaleString('pt-BR')}
          </Text>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Loading States</ThemedText>
          <Text style={styles.debugText}>
            {Object.entries(loadingStates).map(([key, value]) => 
              `${key}: ${value ? 'SIM' : 'NÃO'}`
            ).join('\n')}
          </Text>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Error States</ThemedText>
          <Text style={styles.debugText}>
            {Object.entries(errorStates).map(([key, value]) => 
              `${key}: ${value || 'null'}`
            ).join('\n')}
          </Text>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Sync Status</ThemedText>
          <Text style={styles.debugText}>
            Online: {syncStatus.isOnline ? 'SIM' : 'NÃO'}{'\n'}
            Último Sync: {syncStatus.lastSync ? new Date(syncStatus.lastSync).toLocaleString('pt-BR') : 'Nunca'}{'\n'}
            Operações Pendentes: {syncStatus.hasPendingOperations ? 'SIM' : 'NÃO'}{'\n'}
            Sync em Progresso: {syncStatus.isSyncing ? 'SIM' : 'NÃO'}
          </Text>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Entradas de Hoje</ThemedText>
          <Text style={styles.debugText}>
            Quantidade: {todayEntries.length}{'\n'}
            {todayEntries.map((entry, index) => 
              `${index + 1}. ${entry.mood} - ${entry.period} (${entry.timestamp})`
            ).join('\n')}
          </Text>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Estatísticas Recentes</ThemedText>
          <Text style={styles.debugText}>
            {recentStats ? (
              `Média: ${recentStats.averageMood}\n` +
              `Total: ${recentStats.totalEntries}\n` +
              `Distribuição: ${JSON.stringify(recentStats.moodDistribution, null, 2)}`
            ) : 'Nenhuma estatística disponível'}
          </Text>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Debug Info</ThemedText>
          <Text style={styles.debugText}>
            {JSON.stringify(debugInfo, null, 2)}
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            label="🔄 Check Manual"
            onPress={handleManualCheck}
            variant="primary"
            style={styles.button}
          />
          
          <Button
            label="♻️ Refresh Data"
            onPress={handleRefresh}
            variant="secondary"
            style={styles.button}
          />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  scroll: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  debugText: {
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 16,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
  },
});
