import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Button from '../../components/base/Button';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { useMood } from '../../context/MoodContext';

/**
 * Componente de Debug simplificado para o novo sistema de humor
 */
export function MoodDebugScreen() {
  const { 
    moodStatus,
    currentPeriod, 
    shouldShowMoodSelector,
    isLoading,
    errorStates,
    syncStatus
  } = useMood();

  return (
    <ThemedView style={styles.container}>
      <ScrollView>
        <ThemedText style={styles.title}>🎯 Debug Mood - Sistema Simplificado</ThemedText>
        
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Status Atual</ThemedText>
          <Text style={styles.debugText}>
            Período: {currentPeriod}{'\n'}
            Mostrar Selector: {shouldShowMoodSelector ? 'Sim' : 'Não'}{'\n'}
            Loading: {isLoading ? 'Sim' : 'Não'}{'\n'}
            Hora atual: {new Date().getHours()}h{'\n'}
          </Text>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Mood Status (do Token)</ThemedText>
          <Text style={styles.debugText}>
            Manhã: {moodStatus.manha ? 'Respondido ✅' : 'Não respondido ❌'}{'\n'}
            Tarde: {moodStatus.tarde ? 'Respondido ✅' : 'Não respondido ❌'}{'\n'}
            Noite: {moodStatus.noite ? 'Respondido ✅' : 'Não respondido ❌'}{'\n'}
          </Text>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Estados de Erro</ThemedText>
          <Text style={styles.debugText}>
            Submission: {errorStates.submission || 'Nenhum'}{'\n'}
            Network: {errorStates.network || 'Nenhum'}{'\n'}
            Validation: {errorStates.validation || 'Nenhum'}{'\n'}
            Server: {errorStates.server || 'Nenhum'}{'\n'}
            Load Status: {errorStates.loadMoodStatus || 'Nenhum'}{'\n'}
          </Text>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Sync Status</ThemedText>
          <Text style={styles.debugText}>
            Online: {syncStatus.isOnline ? 'Sim' : 'Não'}{'\n'}
            Operações Pendentes: {syncStatus.hasPendingOperations ? 'Sim' : 'Não'}{'\n'}
            Sincronizando: {syncStatus.isSyncing ? 'Sim' : 'Não'}{'\n'}
          </Text>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Sistema Simplificado</ThemedText>
          <Text style={styles.debugText}>
            ✅ Sem AutoSync complexo{'\n'}
            ✅ Sem cache local{'\n'}
            ✅ Apenas dados do JWT token{'\n'}
            ✅ Requisições apenas quando usuário submete{'\n'}
            ✅ Sistema mais simples e rápido{'\n'}
          </Text>
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#333',
  },
});
