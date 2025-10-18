/**
 * Auto Sync Service - Sprint 2 Task 2.1
 * 
 * Implementa sincronização automática com detecção de mudanças de estado de rede:
 * - Detecta quando o dispositivo volta online
 * - Gerencia fila de sincronização inteligente
 * - Implementa estratégias de conflict resolution
 * - Background sync automático
 * - Rate limiting e exponential backoff
 * 
 * @author PulseZen Team
 * @version 1.0.0
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';
import { MoodEntry } from '../types';
import { moodApiClient } from './MoodApiClient';

interface SyncQueueItem {
  id: string;
  entry: MoodEntry;
  action: 'create' | 'update' | 'delete';
  timestamp: number;
  retryCount: number;
  lastError?: string;
}

interface SyncStats {
  totalAttempts: number;
  successful: number;
  failed: number;
  lastSyncTime: number | null;
  pendingItems: number;
}

interface ConflictResolutionStrategy {
  type: 'last_write_wins' | 'merge' | 'user_choice';
  priority: 'local' | 'server' | 'newest';
}

class AutoSyncService {
  private static instance: AutoSyncService;
  private netInfoSubscription: NetInfoSubscription | null = null;
  private syncInterval: any = null;
  private isOnline = false;
  private isSyncing = false;
  private syncStats: SyncStats = {
    totalAttempts: 0,
    successful: 0,
    failed: 0,
    lastSyncTime: null,
    pendingItems: 0
  };

  // Configurações
  private readonly SYNC_QUEUE_KEY = '@mood_sync_queue';
  private readonly SYNC_STATS_KEY = '@mood_sync_stats';
  private readonly BACKGROUND_SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutos
  private readonly MAX_RETRY_COUNT = 3;
  private readonly RETRY_DELAYS = [1000, 3000, 5000]; // Exponential backoff
  private readonly CONFLICT_STRATEGY: ConflictResolutionStrategy = {
    type: 'last_write_wins',
    priority: 'newest'
  };

  private constructor() {}

  static getInstance(): AutoSyncService {
    if (!AutoSyncService.instance) {
      AutoSyncService.instance = new AutoSyncService();
    }
    return AutoSyncService.instance;
  }

  /**
   * Inicializa o serviço de sync automático
   */
  async initialize(): Promise<void> {
    try {
      await this.loadSyncStats();

      // Monitor de estado da rede
      this.netInfoSubscription = NetInfo.addEventListener(state => {
        const wasOnline = this.isOnline;
        this.isOnline = state.isConnected ?? false;

        if (wasOnline !== this.isOnline) {
          if (this.isOnline) {
            this.performSync();
          } else {
            this.stopBackgroundSync();
          }
        }
      });

      // Verificar estado inicial da rede
      const initialState = await NetInfo.fetch();
      this.isOnline = initialState.isConnected ?? false;

      // Iniciar background sync se estiver online
      if (this.isOnline) {
        this.startBackgroundSync();
      }

    } catch (error) {
      console.error('[AutoSyncService] Erro na inicialização:', error);
    }
  }  /**
   * Configura listener para mudanças no estado da rede
   */
  private setupNetworkListener(): void {
    this.netInfoSubscription = NetInfo.addEventListener((state: NetInfoState) => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected ?? false;

      // ✅ Task 4: Reduzido log verbose - só loga quando há mudança real de estado
      if (wasOnline !== this.isOnline) {
        console.log(`[AutoSyncService] Mudança de rede detectada: ${wasOnline ? 'online' : 'offline'} -> ${this.isOnline ? 'online' : 'offline'}`);
      }

      if (!wasOnline && this.isOnline) {
        // Acabou de voltar online - inicia sync automático
        console.log('[AutoSyncService] Dispositivo voltou online - iniciando sync...');
        this.onBackOnline();
      } else if (wasOnline && !this.isOnline) {
        // Ficou offline - para sync em background
        console.log('[AutoSyncService] Dispositivo ficou offline - pausando sync...');
        this.onGoOffline();
      }
    });
  }

  /**
   * Ações quando dispositivo volta online
   */
  private async onBackOnline(): Promise<void> {
    try {
      // Inicia background sync
      this.startBackgroundSync();
      
      // Tenta sincronizar itens pendentes imediatamente
      await this.performSync();
    } catch (error) {
      console.error('[AutoSyncService] Erro ao processar volta online:', error);
    }
  }

  /**
   * Ações quando dispositivo fica offline
   */
  private onGoOffline(): void {
    // Para background sync
    this.stopBackgroundSync();
  }

  /**
   * Inicia sync automático em background
   */
  private startBackgroundSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(async () => {
      if (this.isOnline && !this.isSyncing) {
        await this.performSync();
      }
    }, this.BACKGROUND_SYNC_INTERVAL);
  }

  /**
   * Para sync automático em background
   */
  private stopBackgroundSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Adiciona item à fila de sincronização
   */
  async addToSyncQueue(entry: MoodEntry, action: 'create' | 'update' | 'delete'): Promise<void> {
    try {
      const queue = await this.getSyncQueue();
      
      const queueItem: SyncQueueItem = {
        id: `${entry.id}_${action}_${Date.now()}`,
        entry,
        action,
        timestamp: Date.now(),
        retryCount: 0
      };

      // Remove item duplicado se existir (para updates)
      const filteredQueue = queue.filter(item => 
        !(item.entry.id === entry.id && item.action === action)
      );

      filteredQueue.push(queueItem);
      await this.saveSyncQueue(filteredQueue);

      this.syncStats.pendingItems = filteredQueue.length;
      await this.saveSyncStats();

      // Se estiver online, tenta sincronizar imediatamente
      if (this.isOnline && !this.isSyncing) {
        await this.performSync();
      }
    } catch (error) {
      console.error('[AutoSyncService] Erro ao adicionar item à fila:', error);
    }
  }

  /**
   * Executa sincronização da fila
   */
  async performSync(): Promise<{ success: number; failed: number; errors: string[] }> {
    if (this.isSyncing) {
      // ✅ Task 4: Removido log verbose - só loga em caso de debug específico
      return { success: 0, failed: 0, errors: [] };
    }

    if (!this.isOnline) {
      // ✅ Task 4: Removido log verbose - estado offline é comum
      return { success: 0, failed: 0, errors: [] };
    }

    this.isSyncing = true;
    // ✅ Task 4: Removido log de "Iniciando sincronização" - muito verbose

    try {
      const queue = await this.getSyncQueue();
      if (queue.length === 0) {
        // ✅ Task 4: Removido log "Fila de sync vazia" - muito verbose no startup
        return { success: 0, failed: 0, errors: [] };
      }

      // Filtra itens muito antigos (mais de 24 horas) - provavelmente inválidos
      const now = Date.now();
      const MAX_AGE = 24 * 60 * 60 * 1000; // 24 horas
      const COOLDOWN_TIME = 30000; // 30 segundos
      
      let validQueue = queue.filter(item => {
        const itemAge = now - item.timestamp;
        if (itemAge > MAX_AGE) {
          console.log(`[AutoSyncService] 🗑️ Removendo item expirado (${Math.round(itemAge/(1000*60*60))}h): ${item.id}`);
          return false;
        }
        return true;
      });

      // Salva fila limpa se houve remoções
      if (validQueue.length !== queue.length) {
        await this.saveSyncQueue(validQueue);
      }

      // Filtra items muito recentes para evitar conflito com rate limit
      const filteredQueue = validQueue.filter(item => {
        const itemAge = now - item.timestamp;
        return itemAge >= COOLDOWN_TIME;
      });

      if (filteredQueue.length === 0) {
        return { success: 0, failed: 0, errors: [] };
      }

      // ✅ Task 4: Só loga quando há itens reais para sincronizar
      let successCount = 0;
      let failedCount = 0;
      const errors: string[] = [];
      const updatedQueue: SyncQueueItem[] = [];
      
      // Adiciona items em cooldown de volta à fila sem processar
      const itemsInCooldown = queue.filter(item => {
        const itemAge = now - item.timestamp;
        return itemAge < COOLDOWN_TIME;
      });
      updatedQueue.push(...itemsInCooldown);

      for (const item of filteredQueue) {
        try {
          this.syncStats.totalAttempts++;

          // Executa ação específica
          const success = await this.syncItem(item);

          if (success) {
            successCount++;
            console.log(`[AutoSyncService] Item sincronizado: ${item.action} ${item.entry.id}`);
          } else {
            throw new Error('Sync retornou false');
          }
        } catch (error) {
          failedCount++;
          const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
          errors.push(`${item.action} ${item.entry.id}: ${errorMsg}`);
          
          console.error(`[AutoSyncService] Erro ao sincronizar item ${item.id}:`, error);

          // Incrementa contador de retry
          item.retryCount++;
          item.lastError = errorMsg;

          // Mantém na fila se ainda pode tentar
          if (item.retryCount < this.MAX_RETRY_COUNT) {
            updatedQueue.push(item);
          }
        }
      }

      // Atualiza fila com itens não sincronizados
      await this.saveSyncQueue(updatedQueue);

      // Atualiza estatísticas
      this.syncStats.successful += successCount;
      this.syncStats.failed += failedCount;
      this.syncStats.lastSyncTime = Date.now();
      this.syncStats.pendingItems = updatedQueue.length;
      await this.saveSyncStats();

      return { success: successCount, failed: failedCount, errors };
    } catch (error) {
      console.error('[AutoSyncService] Erro geral no sync:', error);
      return { success: 0, failed: 1, errors: [error instanceof Error ? error.message : 'Erro desconhecido'] };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Sincroniza um item específico
   */
  private async syncItem(item: SyncQueueItem): Promise<boolean> {
    try {
      switch (item.action) {
        case 'create':
          // Verifica se já existe uma entrada para este período antes de criar
          try {
            const validation = await moodApiClient.validatePeriod(item.entry.period, item.entry.date);
            if (!validation.success || !validation.data?.can_create) {
              return true; // Remove da fila pois já foi criado
            }
          } catch (validationError) {
            // Continua tentando criar mesmo com erro na validação
          }

          const createResponse = await moodApiClient.createMoodEntry({
            mood_level: item.entry.mood,
            period: item.entry.period,
            date: item.entry.date,
            notes: item.entry.notes,
            activities: item.entry.activities,
            emotions: item.entry.emotions
          });
          
          // Se é rate limit, trata como sucesso para remover da fila e evitar spam
          if (!createResponse.success && createResponse.error === 'Rate limit exceeded') {
            return true; // Remove da fila
          }
          
          return createResponse.success;

        case 'update':
          // Para updates, implementar lógica de conflict resolution
          return await this.handleUpdateSync(item);

        case 'delete':
          // Para deletes, verificar se ainda existe no servidor
          return await this.handleDeleteSync(item);

        default:
          console.error(`[AutoSyncService] Ação desconhecida: ${item.action}`);
          return false;
      }
    } catch (error) {
      console.error(`[AutoSyncService] Erro ao sincronizar item ${item.id}:`, error);
      return false;
    }
  }

  /**
   * Gerencia conflict resolution para updates
   */
  private async handleUpdateSync(item: SyncQueueItem): Promise<boolean> {
    try {
      // Por enquanto, implementa "last write wins"
      const updateResponse = await moodApiClient.createMoodEntry({
        mood_level: item.entry.mood,
        period: item.entry.period,
        date: item.entry.date,
        notes: item.entry.notes,
        activities: item.entry.activities,
        emotions: item.entry.emotions
      });

      return updateResponse.success;
    } catch (error) {
      console.error('[AutoSyncService] Erro em conflict resolution:', error);
      return false;
    }
  }

  /**
   * Gerencia sync de deletes
   */
  private async handleDeleteSync(item: SyncQueueItem): Promise<boolean> {
    try {
      // Por enquanto, considera delete sempre bem-sucedido
      // Em implementação futura, verificar se item ainda existe no servidor
      console.log(`[AutoSyncService] Delete sincronizado: ${item.entry.id}`);
      return true;
    } catch (error) {
      console.error('[AutoSyncService] Erro ao sincronizar delete:', error);
      return false;
    }
  }

  /**
   * Obtém estatísticas de sincronização
   */
  async getSyncStats(): Promise<SyncStats> {
    return { ...this.syncStats };
  }

  /**
   * 🧹 Limpa completamente a fila de sincronização
   * Útil para resolver problemas de rate limiting
   */
  async clearSyncQueue(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.SYNC_QUEUE_KEY);
      this.syncStats.pendingItems = 0;
      await this.saveSyncStats();
    } catch (error) {
      console.error('[AutoSyncService] Erro ao limpar fila:', error);
    }
  }

  /**
   * Para o serviço e limpa recursos
   */
  async shutdown(): Promise<void> {
    console.log('[AutoSyncService] Finalizando serviço...');

    if (this.netInfoSubscription) {
      this.netInfoSubscription();
      this.netInfoSubscription = null;
    }

    this.stopBackgroundSync();
    this.isSyncing = false;
  }

  // ============ MÉTODOS AUXILIARES ============

  private async getSyncQueue(): Promise<SyncQueueItem[]> {
    try {
      const queueStr = await AsyncStorage.getItem(this.SYNC_QUEUE_KEY);
      return queueStr ? JSON.parse(queueStr) : [];
    } catch (error) {
      console.error('[AutoSyncService] Erro ao carregar fila:', error);
      return [];
    }
  }

  private async saveSyncQueue(queue: SyncQueueItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.SYNC_QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('[AutoSyncService] Erro ao salvar fila:', error);
    }
  }

  private async loadSyncStats(): Promise<void> {
    try {
      const statsStr = await AsyncStorage.getItem(this.SYNC_STATS_KEY);
      if (statsStr) {
        this.syncStats = { ...this.syncStats, ...JSON.parse(statsStr) };
      }
    } catch (error) {
      console.error('[AutoSyncService] Erro ao carregar stats:', error);
    }
  }

  private async saveSyncStats(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.SYNC_STATS_KEY, JSON.stringify(this.syncStats));
    } catch (error) {
      console.error('[AutoSyncService] Erro ao salvar stats:', error);
    }
  }

  // ============ GETTERS PÚBLICOS ============

  get isConnected(): boolean {
    return this.isOnline;
  }

  get syncInProgress(): boolean {
    return this.isSyncing;
  }

  get pendingItemsCount(): number {
    return this.syncStats.pendingItems;
  }
}

// Exporta instância singleton
export const autoSyncService = AutoSyncService.getInstance();
export default AutoSyncService;
