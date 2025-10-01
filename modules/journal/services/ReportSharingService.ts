import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

export class ReportSharingService {
  /**
   * Gera e compartilha relatório terapêutico em PDF
   */
  static async shareTherapeuticReport(analyticsData: any) {
    try {
      // Verificar se é possível compartilhar
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Erro', 'Compartilhamento não disponível neste dispositivo');
        return;
      }

      // Normalizar dados com valores padrão
      const normalizedData = this.normalizeAnalyticsData(analyticsData);

      // Gerar HTML do relatório
      const htmlContent = this.generateReportHTML(normalizedData);

      // Gerar PDF usando expo-print
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
        width: 612, // A4 width in points
        height: 792, // A4 height in points
      });

      // Compartilhar arquivo diretamente
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Compartilhar Relatório Terapêutico',
        UTI: 'com.adobe.pdf',
      });

    } catch (error) {
      console.error('Erro ao compartilhar relatório:', error);
      Alert.alert(
        'Erro',
        'Não foi possível gerar o relatório. Tente novamente.',
        [{ text: 'OK' }]
      );
    }
  }

  /**
   * Normaliza os dados de analytics para evitar undefined
   */
  private static normalizeAnalyticsData(data: any) {
    return {
      totalEntries: data?.totalEntries || 0,
      uniqueDays: data?.uniqueDays || 0,
      avgWordsPerEntry: data?.avgWordsPerEntry || 0,
      percentPositive: data?.percentPositive || 0,
      streak: {
        currentStreak: data?.streak?.currentStreak || data?.currentStreak || 0,
        longestStreak: data?.streak?.longestStreak || data?.longestStreak || 0
      },
      moodDistribution: {
        topMoods: data?.moodDistribution?.topMoods || data?.moodDistribution || []
      },
      timeline: data?.timeline || data?.moodTimeline || []
    };
  }

  /**
   * Gera HTML otimizado para PDF
   */
  private static generateReportHTML(analytics: any): string {
    const currentDate = new Date().toLocaleDateString('pt-BR');
    const reportPeriod = analytics.timeline && analytics.timeline.length > 0 ? 
      `${analytics.timeline[analytics.timeline.length - 1].date} até ${analytics.timeline[0].date}` :
      'Últimos 7 dias';

    return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Relatório Terapêutico - PulseZen</title>
      <style>
        @page {
          margin: 20mm;
          size: A4;
        }
        body {
          font-family: 'Helvetica', 'Arial', sans-serif;
          line-height: 1.5;
          color: #333;
          margin: 0;
          padding: 0;
          font-size: 12px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 3px solid #4A90E2;
          padding-bottom: 20px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #4A90E2;
          margin-bottom: 8px;
        }
        .subtitle {
          color: #666;
          font-size: 14px;
          margin-bottom: 10px;
        }
        .date-info {
          font-size: 11px;
          color: #666;
        }
        .section {
          margin-bottom: 20px;
          break-inside: avoid;
        }
        .section-title {
          font-size: 16px;
          font-weight: bold;
          color: #4A90E2;
          border-bottom: 1px solid #E8F4FD;
          padding-bottom: 5px;
          margin-bottom: 12px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
          margin-bottom: 20px;
        }
        .stat-card {
          background: #F8FBFF;
          padding: 12px;
          border-radius: 6px;
          border-left: 3px solid #4A90E2;
          text-align: center;
        }
        .stat-number {
          font-size: 20px;
          font-weight: bold;
          color: #4A90E2;
          margin-bottom: 4px;
        }
        .stat-label {
          color: #666;
          font-size: 10px;
        }
        .mood-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 0;
          border-bottom: 1px solid #eee;
          font-size: 11px;
        }
        .timeline-container {
          text-align: center;
          margin: 15px 0;
        }
        .timeline-day {
          display: inline-block;
          width: 35px;
          height: 35px;
          border-radius: 50%;
          text-align: center;
          line-height: 35px;
          margin: 3px;
          font-weight: bold;
          color: white;
          font-size: 10px;
        }
        .timeline-legend {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 15px;
          margin-top: 15px;
          padding: 10px;
          background: #f9f9f9;
          border-radius: 6px;
          font-size: 10px;
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          display: inline-block;
        }
        .insights {
          background: #FFF9E6;
          padding: 15px;
          border-radius: 6px;
          border-left: 3px solid #FFA500;
          margin: 10px 0;
        }
        .insights h3 {
          margin-top: 0;
          color: #E65100;
          font-size: 14px;
        }
        .insights ul {
          margin: 8px 0;
          padding-left: 20px;
        }
        .insights li {
          margin-bottom: 5px;
          font-size: 11px;
        }
        .recommendation {
          background: #E8F5E8;
          padding: 12px;
          border-radius: 6px;
          margin: 8px 0;
          border-left: 3px solid #4CAF50;
          font-size: 11px;
        }
        .recommendation strong {
          color: #2E7D32;
        }
        .sample-entry {
          background: #f9f9f9;
          padding: 12px;
          margin: 8px 0;
          border-radius: 6px;
          font-size: 10px;
        }
        .entry-header {
          font-weight: bold;
          color: #4A90E2;
          margin-bottom: 6px;
          font-size: 11px;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 10px;
          color: #666;
          border-top: 1px solid #eee;
          padding-top: 15px;
        }
        .page-break {
          page-break-before: always;
        }
      </style>
    </head>
    <body>
      <!-- Header -->
      <div class="header">
        <div class="logo">🧠 PulseZen</div>
        <div class="subtitle">Relatório Terapêutico de Saúde Mental</div>
        <div class="date-info">
          <strong>Data do Relatório:</strong> ${currentDate}<br>
          <strong>Período Analisado:</strong> ${reportPeriod}
        </div>
      </div>

      <!-- Resumo Executivo -->
      <div class="section">
        <h2 class="section-title">📊 Resumo Executivo</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">${analytics.totalEntries || 0}</div>
            <div class="stat-label">Total de Registros</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${analytics.uniqueDays || 0}</div>
            <div class="stat-label">Dias Ativos</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${analytics.avgWordsPerEntry || 0}</div>
            <div class="stat-label">Palavras por Registro</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${analytics.percentPositive || 0}%</div>
            <div class="stat-label">Registros Positivos</div>
          </div>
        </div>
      </div>

      <!-- Consistência -->
      <div class="section">
        <h2 class="section-title">🔥 Análise de Consistência</h2>
        <div class="insights">
          <h3>Padrão de Escrita:</h3>
          <ul>
            <li><strong>Streak Atual:</strong> ${analytics.streak?.currentStreak || 0} ${(analytics.streak?.currentStreak || 0) === 1 ? 'dia' : 'dias'} consecutivos</li>
            <li><strong>Maior Sequência:</strong> ${analytics.streak?.longestStreak || 0} ${(analytics.streak?.longestStreak || 0) === 1 ? 'dia' : 'dias'}</li>
            <li><strong>Status:</strong> ${(analytics.streak?.currentStreak || 0) > 0 ? 'Ativo' : 'Inativo'}</li>
          </ul>
        </div>
      </div>

      <!-- Padrões Emocionais -->
      <div class="section">
        <h2 class="section-title">💭 Padrões Emocionais Identificados</h2>
        <div>
          <h3 style="font-size: 13px; margin-bottom: 10px;">Distribuição de Humores:</h3>
          ${analytics.moodDistribution?.topMoods?.slice(0, 5).map((mood: any) => `
            <div class="mood-item">
              <span>${mood.emoji || '😐'} ${mood.mood || 'Não definido'}</span>
              <span><strong>${mood.count} vezes (${mood.percentage}%)</strong></span>
            </div>
          `).join('') || '<p>Nenhum dado de humor disponível</p>'}
        </div>
        
        <div class="insights">
          <h3>🔍 Insights Clínicos:</h3>
          <ul>
            <li><strong>Consistência:</strong> ${this.getConsistencyInsight(analytics.streak)}</li>
            <li><strong>Padrão Emocional:</strong> ${this.getEmotionalPattern(analytics)}</li>
            <li><strong>Engajamento:</strong> ${this.getEngagementInsight(analytics)}</li>
          </ul>
        </div>
      </div>

      <!-- Timeline Semanal -->
      <div class="section">
        <h2 class="section-title">📈 Evolução Semanal</h2>
        <div class="timeline-container">
          ${analytics.timeline?.map((day: any) => `
            <div class="timeline-day" style="background-color: ${day.moodColor || '#FFA500'};">
              ${day.dayNumber || '?'}
            </div>
          `).join('') || '<p>Dados de timeline não disponíveis</p>'}
        </div>
        
        <!-- Legenda das Cores -->
        <div class="timeline-legend">
          <div class="legend-item">
            <span class="legend-color" style="background-color: #4CAF50;"></span>
            <span>Radiante</span>
          </div>
          <div class="legend-item">
            <span class="legend-color" style="background-color: #2196F3;"></span>
            <span>Bem</span>
          </div>
          <div class="legend-item">
            <span class="legend-color" style="background-color: #FFA500;"></span>
            <span>Neutro</span>
          </div>
          <div class="legend-item">
            <span class="legend-color" style="background-color: #9C27B0;"></span>
            <span>Difícil</span>
          </div>
        </div>
        
        <p style="text-align: center; color: #666; font-size: 10px; margin-top: 10px;">
          Últimos 7 dias - Cada círculo representa o humor predominante do dia
        </p>
      </div>

      <div class="page-break"></div>

      <!-- Recomendações Terapêuticas -->
      <div class="section">
        <h2 class="section-title">💡 Recomendações Terapêuticas</h2>
        ${this.generateTherapeuticRecommendations(analytics).map((rec: string) => `
          <div class="recommendation">
            ${rec}
          </div>
        `).join('')}
      </div>

      <!-- Footer -->
      <div class="footer">
        <p><strong>PulseZen</strong> - Plataforma de Saúde Mental Digital</p>
        <p>Este relatório foi gerado automaticamente e deve ser interpretado por profissionais qualificados.</p>
        <p>Para mais informações: suporte@pulsezen.com</p>
      </div>
    </body>
    </html>
    `;
  }

  /**
   * Helpers para insights clínicos
   */
  private static getConsistencyInsight(streak: any): string {
    const currentStreak = streak?.currentStreak || 0;
    if (currentStreak >= 7) {
      return `Excelente: ${currentStreak} dias consecutivos demonstram comprometimento significativo`;
    } else if (currentStreak >= 3) {
      return `Bom: ${currentStreak} dias consecutivos indicam engajamento crescente`;
    } else {
      return `Inconsistente: Apenas ${currentStreak} dia(s) - necessita incentivo para regularidade`;
    }
  }

  private static getEmotionalPattern(analytics: any): string {
    const percentPositive = analytics.percentPositive || 0;
    if (percentPositive >= 60) {
      return `Predominantemente positivo (${percentPositive}%) - indica estabilidade emocional`;
    } else if (percentPositive >= 40) {
      return `Equilibrado (${percentPositive}% positivo) - flutuações normais observadas`;
    } else {
      return `Desafiador (${percentPositive}% positivo) - requer atenção terapêutica focada`;
    }
  }

  private static getEngagementInsight(analytics: any): string {
    const avgPerDay = (analytics.totalEntries || 0) / Math.max(analytics.uniqueDays || 1, 1);
    if (avgPerDay >= 2) {
      return `Alto: ${avgPerDay.toFixed(1)} registros/dia demonstram alta motivação`;
    } else if (avgPerDay >= 1) {
      return `Moderado: ${avgPerDay.toFixed(1)} registros/dia indicam engajamento regular`;
    } else {
      return `Baixo: ${avgPerDay.toFixed(1)} registros/dia - necessita estratégias de motivação`;
    }
  }

  private static generateTherapeuticRecommendations(analytics: any): string[] {
    const recommendations = [];
    const currentStreak = analytics.streak?.currentStreak || 0;
    const percentPositive = analytics.percentPositive || 0;
    const avgWordsPerEntry = analytics.avgWordsPerEntry || 0;

    // Recomendações baseadas na consistência
    if (currentStreak < 3) {
      recommendations.push(
        '🎯 <strong>Estabelecer Rotina:</strong> Implementar horários fixos para escrita pode melhorar a consistência e criar um hábito terapêutico sustentável.'
      );
    }

    // Recomendações baseadas no humor
    if (percentPositive < 40) {
      recommendations.push(
        '🌱 <strong>Técnicas de Regulação Emocional:</strong> Considerar CBT (Terapia Cognitivo-Comportamental) para trabalhar padrões de pensamento e desenvolver estratégias de enfrentamento.'
      );
      recommendations.push(
        '🧘 <strong>Práticas de Mindfulness:</strong> Incorporar exercícios de atenção plena pode ajudar na identificação e processamento de emoções difíceis.'
      );
    }

    // Recomendações baseadas no engajamento
    if (avgWordsPerEntry < 15) {
      recommendations.push(
        '✍️ <strong>Expressão Expandida:</strong> Encorajar registros mais detalhados pode aprofundar a auto-reflexão e fornecer mais insights terapêuticos.'
      );
    }

    // Recomendação geral
    recommendations.push(
      '📈 <strong>Monitoramento Contínuo:</strong> Revisões regulares dos padrões identificados podem orientar ajustes na abordagem terapêutica e medir o progresso.'
    );

    return recommendations;
  }
}