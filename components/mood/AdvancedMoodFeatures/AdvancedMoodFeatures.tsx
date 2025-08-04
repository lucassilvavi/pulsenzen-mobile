import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useMood } from '../../../modules/mood/hooks/useMood';
import { ThemedText } from '../../ThemedText';
import { ThemedView } from '../../ThemedView';
import Button from '../../base/Button';

interface AdvancedMoodFeaturesProps {
  testMode?: boolean;
}

/**
 * Componente de demonstração das funcionalidades avançadas do sistema de humor
 * - Bulk operations (deletar múltiplas entradas)
 * - Export de dados (CSV/JSON)
 * - Filtros avançados
 */
export function AdvancedMoodFeatures({ testMode = false }: AdvancedMoodFeaturesProps) {
  const {
    loadingStates,
    bulkDeleteEntries,
    exportMoodData,
    getFilteredEntries,
    getMoodEntries
  } = useMood();

  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const [filterResults, setFilterResults] = useState<any[]>([]);

  // ============ BULK DELETE ============

  const handleBulkDelete = async () => {
    if (selectedEntries.length === 0) {
      Alert.alert('Atenção', 'Selecione ao menos uma entrada para deletar');
      return;
    }

    Alert.alert(
      'Confirmar Exclusão',
      `Deseja realmente deletar ${selectedEntries.length} entradas?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await bulkDeleteEntries(selectedEntries);
              
              Alert.alert(
                'Resultado da Operação',
                `✅ Sucessos: ${result.success}\n❌ Falhados: ${result.failed}${result.errors.length > 0 ? '\n\nErros:\n' + result.errors.join('\n') : ''}`
              );
              
              setSelectedEntries([]);
            } catch (error) {
              Alert.alert('Erro', 'Falha ao executar operação de exclusão');
            }
          }
        }
      ]
    );
  };

  // ============ EXPORT DATA ============

  const handleExportData = async () => {
    try {
      const result = await exportMoodData({
        format: exportFormat,
        dateRange: {
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0]
        },
        includeStats: true
      });

      if (result.success && result.data && result.filename) {
        if (testMode) {
          Alert.alert('Export Simulado', `Arquivo ${result.filename} gerado com sucesso!`);
          return;
        }

        // Salva o arquivo no sistema
        const fileUri = FileSystem.documentDirectory + result.filename;
        await FileSystem.writeAsStringAsync(fileUri, result.data);

        // Compartilha o arquivo
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri);
        } else {
          Alert.alert(
            'Export Concluído',
            `Arquivo salvo como: ${result.filename}\nLocalização: ${fileUri}`
          );
        }
      } else {
        Alert.alert('Erro', result.message || 'Falha ao exportar dados');
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao executar exportação');
    }
  };

  // ============ ADVANCED FILTERS ============

  const handleApplyFilters = async () => {
    try {
      const results = await getFilteredEntries({
        moodLevels: ['bem', 'excelente'],
        periods: ['manha', 'tarde'],
        dateRange: {
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0]
        },
        hasNotes: true
      });

      setFilterResults(results);
      Alert.alert(
        'Filtros Aplicados',
        `Encontradas ${results.length} entradas que correspondem aos critérios:\n- Humor: Bem ou Excelente\n- Períodos: Manhã ou Tarde\n- Últimos 7 dias\n- Com observações`
      );
    } catch (error) {
      Alert.alert('Erro', 'Falha ao aplicar filtros');
    }
  };

  const handleGenerateTestEntries = async () => {
    // Simula a seleção de algumas entradas para demonstração
    const entries = await getMoodEntries();
    const testEntries = entries.slice(0, 3).map(entry => entry.id);
    setSelectedEntries(testEntries);
    
    Alert.alert(
      'Entradas de Teste',
      `Selecionadas ${testEntries.length} entradas para demonstração das funcionalidades`
    );
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText style={styles.title}>🚀 Funcionalidades Avançadas</ThemedText>
        <ThemedText style={styles.subtitle}>Demonstração das Features do Item 11.2</ThemedText>

        {/* Bulk Operations */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>🗂️ Operações em Lote</ThemedText>
          <ThemedText style={styles.description}>
            Deletar múltiplas entradas de uma vez com processamento em batches
          </ThemedText>
          
          <View style={styles.row}>
            <Button
              label="Gerar Dados Teste"
              onPress={handleGenerateTestEntries}
              variant="outline"
              style={styles.button}
            />
            <Button
              label={`Deletar ${selectedEntries.length} Entradas`}
              onPress={handleBulkDelete}
              variant="secondary"
              disabled={selectedEntries.length === 0 || loadingStates.bulkDeleting}
              loading={loadingStates.bulkDeleting}
              style={styles.button}
            />
          </View>
          
          {selectedEntries.length > 0 && (
            <ThemedText style={styles.info}>
              ✅ {selectedEntries.length} entradas selecionadas para exclusão
            </ThemedText>
          )}
        </ThemedView>

        {/* Data Export */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>📊 Exportação de Dados</ThemedText>
          <ThemedText style={styles.description}>
            Exportar dados em CSV ou JSON com estatísticas incluídas
          </ThemedText>
          
          <View style={styles.row}>
            <Button
              label={`CSV ${exportFormat === 'csv' ? '✓' : ''}`}
              onPress={() => setExportFormat('csv')}
              variant={exportFormat === 'csv' ? 'primary' : 'outline'}
              style={styles.formatButton}
            />
            <Button
              label={`JSON ${exportFormat === 'json' ? '✓' : ''}`}
              onPress={() => setExportFormat('json')}
              variant={exportFormat === 'json' ? 'primary' : 'outline'}
              style={styles.formatButton}
            />
          </View>
          
          <Button
            label={`Exportar como ${exportFormat.toUpperCase()}`}
            onPress={handleExportData}
            variant="primary"
            loading={loadingStates.exporting}
            disabled={loadingStates.exporting}
            style={styles.exportButton}
          />
        </ThemedView>

        {/* Advanced Filters */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>🔍 Filtros Avançados</ThemedText>
          <ThemedText style={styles.description}>
            Buscar entradas com critérios específicos de humor, período e conteúdo
          </ThemedText>
          
          <Button
            label="Aplicar Filtros de Exemplo"
            onPress={handleApplyFilters}
            variant="secondary"
            loading={loadingStates.filtering}
            disabled={loadingStates.filtering}
            style={styles.button}
          />
          
          {filterResults.length > 0 && (
            <ThemedView style={styles.resultsContainer}>
              <ThemedText style={styles.resultsTitle}>
                📋 Resultados: {filterResults.length} entradas
              </ThemedText>
              {filterResults.slice(0, 3).map((entry, index) => (
                <ThemedView key={entry.id} style={styles.resultItem}>
                  <ThemedText style={styles.resultText}>
                    {entry.date} - {entry.period} - {entry.mood}
                  </ThemedText>
                  {entry.notes && (
                    <ThemedText style={styles.resultNotes}>
                      💭 {entry.notes.slice(0, 50)}...
                    </ThemedText>
                  )}
                </ThemedView>
              ))}
              
              {filterResults.length > 3 && (
                <ThemedText style={styles.moreResults}>
                  +{filterResults.length - 3} outras entradas...
                </ThemedText>
              )}
            </ThemedView>
          )}
        </ThemedView>

        {/* Performance Info */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>⚡ Informações Técnicas</ThemedText>
          <ThemedText style={styles.description}>
            • Processamento em batches para operações em lote{'\n'}
            • Cache invalidation automático após modificações{'\n'}
            • Filtros aplicados localmente para performance{'\n'}
            • Export com compressão e formatação otimizada
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 16,
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  button: {
    flex: 1,
  },
  formatButton: {
    flex: 1,
  },
  exportButton: {
    marginTop: 8,
  },
  info: {
    fontSize: 12,
    color: '#2ECC71',
    marginTop: 8,
  },
  resultsContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
    borderRadius: 8,
  },
  resultsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  resultItem: {
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  resultText: {
    fontSize: 13,
    fontWeight: '500',
  },
  resultNotes: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  moreResults: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.7,
  },
});
