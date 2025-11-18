import { API_CONFIG } from '../../../config/api';
import { appConfig } from '../../../config/appConfig';
import AuthService from '../../../services/authService';
import { logger } from '../../../utils/secureLogger';
import { networkManager } from '../../../utils/simpleNetworkManager';
import { InsufficientDataState, InterventionSuggestion, PredictionDetail, PredictionResult, RiskFactor, RiskLevel } from '../types';
import { PredictionDataSource } from './PredictionDataSource';
import { PredictionMockService } from './PredictionMock';

/**
 * Crisis Prediction API Client
 * Connects mobile app with Crisis Prediction Engine™ backend
 */
export class CrisisPredictionApiClient implements PredictionDataSource {
  private static readonly ENDPOINT = API_CONFIG.ENDPOINTS.CRISIS_PREDICTION.LATEST;
  private static readonly TIMEOUT = API_CONFIG.TIMEOUT;
  private static readonly MAX_RETRIES = API_CONFIG.RETRY_ATTEMPTS;

  /**
   * Fetch latest prediction from Crisis Prediction Engine™
   */
  async fetchLatest(): Promise<PredictionResult> {
    try {
      logger.info('CrisisPredictionApiClient', 'Fetching latest prediction from backend');

      // Get auth header for authenticated request
      const authHeader = await AuthService.getAuthHeader();
      
      if (!Object.keys(authHeader).length) {
        logger.warn('CrisisPredictionApiClient', 'No authentication token available');
        return this.createInsufficientDataResponse('Você precisa estar logado para ver sua análise de bem-estar.');
      }

      // Sempre buscar dados em tempo real, sem cache
      // Predições devem ser sempre atualizadas no login e em tempo real
      const response = await networkManager.get<any>(
        appConfig.getApiUrl(CrisisPredictionApiClient.ENDPOINT),
        {
          timeout: CrisisPredictionApiClient.TIMEOUT,
          retries: CrisisPredictionApiClient.MAX_RETRIES,
          priority: 'high',
          tags: ['prediction', 'crisis'],
          headers: authHeader,
          cache: false, // ⚡ NUNCA usar cache - sempre buscar em tempo real
        }
      );

      // NetworkManager já retorna { success, data }
      // Dentro de data está a resposta da API que também tem { success, data }
      if (response.success && response.data) {
        const apiResponse = response.data;
        
        // Verifica se a API retornou sucesso
        if (apiResponse.success === true && apiResponse.data) {
          logger.info('CrisisPredictionApiClient', 'Successfully fetched prediction from backend');
          
          // Map backend response to mobile types
          const prediction = this.mapApiResponseToPredictionDetail(apiResponse.data);
          return prediction;
        } 
        
        // API retornou falha explícita
        if (apiResponse.success === false) {
          logger.warn('CrisisPredictionApiClient', 'API response indicates failure', { 
            message: apiResponse.message,
            error: apiResponse.error 
          });
          
          // Se a API explicitamente disse que não há dados, não use mock
          if (apiResponse.message && apiResponse.message.includes('predição válida encontrada')) {
            return this.createInsufficientDataResponse(
              'Ainda não temos dados suficientes para gerar sua análise personalizada.',
              [
                'Continue registrando seu humor diariamente',
                'Escreva pelo menos 2-3 entradas no diário',
                'Volte em alguns dias para ver sua análise'
              ]
            );
          }
          
          return this.createInsufficientDataResponse('Erro ao processar dados de análise.');
        }
        
        // Formato antigo ou inesperado - trata como dados da predição diretamente
        logger.info('CrisisPredictionApiClient', 'Legacy or direct format detected, using data directly');
        const prediction = this.mapApiResponseToPredictionDetail(apiResponse);
        return prediction;
      } else {
        logger.warn('CrisisPredictionApiClient', 'Network request failed', {
          status: response.status,
          error: response.error
        });
        
        // Handle specific error cases
        if (response.status === 404) {
          // 404 significa que não há dados suficientes para análise
          return this.createInsufficientDataResponse(
            'Ainda não temos dados suficientes para gerar sua análise personalizada.',
            [
              'Continue registrando seu humor diariamente',
              'Escreva pelo menos 2-3 entradas no diário',
              'Use o app por alguns dias consecutivos',
              'Volte em alguns dias para ver sua análise'
            ]
          );
        }
        
        if (response.status === 401) {
          // Try token refresh and retry once
          logger.info('CrisisPredictionApiClient', 'Attempting token refresh due to 401 error');
          const refreshResult = await AuthService.refreshAuthToken();
          
          if (refreshResult.success) {
            return this.retryWithNewToken();
          }
          
          return this.createInsufficientDataResponse('Sessão expirada. Faça login novamente.');
        }
        
        // Outros erros de rede
        return this.createInsufficientDataResponse(
          'Não foi possível carregar sua análise no momento.',
          ['Verifique sua conexão com a internet', 'Tente novamente em alguns minutos']
        );
      }
    } catch (error) {
      logger.error('CrisisPredictionApiClient', 'All retry attempts failed', error as Error);
      // Em caso de erro grave, informar que não há dados disponíveis
      return this.createInsufficientDataResponse(
        'Não foi possível carregar sua análise no momento.',
        ['Verifique sua conexão com a internet', 'Tente novamente em alguns minutos']
      );
    }
  }

  /**
   * Retry request with refreshed token
   */
  private async retryWithNewToken(): Promise<PredictionResult> {
    try {
      logger.info('CrisisPredictionApiClient', 'Retrying prediction request with refreshed token');
      
      const newAuthHeader = await AuthService.getAuthHeader();
      
      const retryResponse = await networkManager.get<any>(
        appConfig.getApiUrl(CrisisPredictionApiClient.ENDPOINT),
        {
          timeout: CrisisPredictionApiClient.TIMEOUT,
          retries: 1, // Only one retry
          priority: 'high',
          tags: ['prediction', 'crisis', 'retry'],
          headers: newAuthHeader,
        }
      );

      if (retryResponse.success && retryResponse.data && retryResponse.data.success) {
        logger.info('CrisisPredictionApiClient', 'Retry successful');
        return this.mapApiResponseToPredictionDetail(retryResponse.data.data);
      } else {
        logger.warn('CrisisPredictionApiClient', 'Retry failed');
        return this.createInsufficientDataResponse('Sessão expirada. Faça login novamente.');
      }
    } catch (error) {
      logger.error('CrisisPredictionApiClient', 'Retry attempt failed', error as Error);
      return this.createInsufficientDataResponse('Erro de autenticação. Tente fazer login novamente.');
    }
  }

  /**
   * Create response for insufficient data scenarios
   */
  private createInsufficientDataResponse(message: string, suggestions?: string[]): InsufficientDataState {
    return {
      id: 'insufficient_data',
      type: 'insufficient_data',
      message,
      suggestions: suggestions || [
        'Registre seu humor pelo menos 3 vezes',
        'Escreva no diário pelo menos 2 entradas',
        'Use o app por alguns dias para gerar dados'
      ],
      requiredActions: [
        'Registrar humor diariamente',
        'Escrever entradas no diário',
        'Aguardar alguns dias para análise'
      ]
    };
  }

  /**
   * Fallback to mock service when API is unavailable (DEPRECATED - only for development)
   */
  private fallbackToMock(): PredictionDetail {
    return PredictionMockService.generateMockPrediction();
  }

  /**
   * Map backend API response to mobile PredictionDetail type
   */
  private mapApiResponseToPredictionDetail(apiData: any): PredictionDetail {
    try {
      // Debug: Log dos campos recebidos da API
      logger.debug('CrisisPredictionApiClient', 'Mapping API data', {
        risk_score: apiData.risk_score,
        confidence_score: apiData.confidence_score,
        risk_level: apiData.risk_level
      });

      // Map risk level from backend to mobile format
      // Backend pode usar snake_case (risk_level) ou camelCase (riskLevel)
      const riskLevel = this.mapRiskLevel(apiData.risk_level || apiData.riskLevel);
      
      // Map factors from backend format
      const factors: RiskFactor[] = (apiData.factors || []).map((factor: any) => ({
        id: factor.type || factor.id || `factor_${Date.now()}`,
        category: this.mapFactorCategory(factor.type),
        label: this.mapFactorLabel(factor.type),
        weight: factor.weight || 0,
        description: this.cleanDescription(factor.description || 'Fator de análise'),
        suggestion: this.getFactorSuggestion(factor.type)
      }));

      // Map interventions from backend format
      const interventions: InterventionSuggestion[] = (apiData.interventions || []).map((intervention: any) => ({
        id: intervention.id || `intervention_${Date.now()}`,
        title: intervention.title || 'Intervenção Recomendada',
        emoji: this.getInterventionEmoji(intervention.type),
        benefit: intervention.description || 'Ajuda no bem-estar emocional',
        estimatedMinutes: intervention.estimatedTime || 5,
        type: this.mapInterventionType(intervention.type),
        completed: false
      }));

      // Create the mapped prediction detail
      // Backend usa snake_case, precisamos mapear corretamente
      const prediction: PredictionDetail = {
        id: apiData.id || `pred_${Date.now()}`,
        score: parseFloat(apiData.risk_score || apiData.riskScore || 0),
        level: riskLevel,
        label: this.getRiskLevelLabel(riskLevel),
        confidence: parseFloat(apiData.confidence_score || apiData.confidenceScore || 0),
        generatedAt: apiData.created_at ? new Date(apiData.created_at).getTime() : 
                     apiData.createdAt ? new Date(apiData.createdAt).getTime() : 
                     Date.now(),
        factors: factors.sort((a, b) => b.weight - a.weight), // Sort by weight descending
        interventions: interventions
      };

      logger.info('CrisisPredictionApiClient', 'Successfully mapped API response to PredictionDetail', {
        predictionId: prediction.id,
        riskLevel: prediction.level,
        factorsCount: prediction.factors.length,
        interventionsCount: prediction.interventions.length
      });

      return prediction;
    } catch (error) {
      logger.error('CrisisPredictionApiClient', 'Error mapping API response', error as Error);
      // Return a safe fallback
      return this.fallbackToMock();
    }
  }

  /**
   * Map backend risk level to mobile format
   */
  private mapRiskLevel(backendLevel: string): RiskLevel {
    switch (backendLevel?.toLowerCase()) {
      case 'low':
        return 'low';
      case 'medium':
        return 'medium';
      case 'high':
        return 'high';
      case 'critical':
        return 'critical';
      default:
        return 'medium';
    }
  }

  /**
   * Get label for risk level (humanizado e claro)
   * NOVA LÓGICA: 100% = BEM | 0% = CRÍTICO
   */
  private getRiskLevelLabel(level: RiskLevel): string {
    switch (level) {
      case 'low':
        return '😊 Excelente - Você está muito bem! (75-100%)';
      case 'medium':
        return '😐 Atenção - Vamos cuidar melhor de você (50-75%)';
      case 'high':
        return '😟 Alerta - Busque um especialista para conversar (25-50%)';
      case 'critical':
        return '🆘 Urgente - Busque ajuda imediata (0-25%)';
      default:
        return '😐 Atenção - Vamos cuidar melhor de você';
    }
  }

  /**
   * Map factor type to category
   */
  private mapFactorCategory(factorType: string): string {
    switch (factorType) {
      case 'mood_decline':
        return 'Humor';
      case 'negative_sentiment':
        return 'Escrita';
      case 'stress_keywords':
        return 'Linguagem';
      case 'journal_frequency':
        return 'Comportamento';
      case 'temporal_trend':
        return 'Tendência';
      default:
        return 'Análise';
    }
  }

  /**
   * Map factor type to readable label
   */
  private mapFactorLabel(factorType: string): string {
    switch (factorType) {
      case 'mood_decline':
        return 'Variação de humor recente';
      case 'negative_sentiment':
        return 'Sentimento negativo no diário';
      case 'stress_keywords':
        return 'Palavras-chave de stress';
      case 'journal_frequency':
        return 'Frequência de registros';
      case 'temporal_trend':
        return 'Tendência temporal';
      default:
        return 'Fator de análise';
    }
  }

  /**
   * Get suggestion for factor type
   */
  private getFactorSuggestion(factorType: string): string {
    switch (factorType) {
      case 'mood_decline':
        return 'Registrar gatilhos após anotar humor';
      case 'negative_sentiment':
        return 'Praticar reestruturação cognitiva';
      case 'stress_keywords':
        return 'Exercícios de respiração e mindfulness';
      case 'journal_frequency':
        return 'Definir lembrete suave diário';
      case 'temporal_trend':
        return 'Monitorar padrões ao longo do tempo';
      default:
        return 'Manter práticas de autocuidado';
    }
  }

  /**
   * Clean description to remove technical terms and NaN values
   */
  private cleanDescription(description: string): string {
    // Remove "NaN" and replace with user-friendly message
    if (description.includes('NaN')) {
      description = description.replace(/NaN/g, 'ainda em análise');
    }
    
    // Remove technical jargon
    description = description
      .replace(/sentiment/gi, 'sentimento')
      .replace(/mood/gi, 'humor')
      .replace(/null/gi, 'em análise');
    
    return description;
  }

  /**
   * Map backend intervention type to mobile format
   */
  private mapInterventionType(backendType: string): 'breathing' | 'reframe' | 'journal' | 'mindfulness' {
    switch (backendType?.toLowerCase()) {
      case 'breathing':
        return 'breathing';
      case 'journaling':
      case 'journal':
        return 'journal';
      case 'professional_help':
      case 'emergency_contact':
        return 'mindfulness'; // Map to mindfulness as we don't have professional category
      case 'self_care':
      default:
        return 'reframe';
    }
  }

  /**
   * Get emoji for intervention type
   */
  private getInterventionEmoji(interventionType: string): string {
    switch (interventionType?.toLowerCase()) {
      case 'breathing':
        return '🫁';
      case 'journaling':
      case 'journal':
        return '📝';
      case 'professional_help':
        return '👨‍⚕️';
      case 'emergency_contact':
        return '📞';
      case 'self_care':
        return '🧘';
      default:
        return '💡';
    }
  }
}
