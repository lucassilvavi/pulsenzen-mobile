import { logger } from './logger';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface PerformanceThreshold {
  warning: number;
  critical: number;
}

interface ComponentMetrics {
  renderCount: number;
  averageRenderTime: number;
  lastRenderTime: number;
  totalRenderTime: number;
  slowRenders: number; // Renders > 16ms (60fps threshold)
}

/**
 * Sistema avançado de monitoramento de performance
 * - Métricas de componentes React Native
 * - Detecção de problemas de performance
 * - Alertas automáticos
 * - Coleta de dados históricos
 */
export class PerformanceTracker {
  private static instance: PerformanceTracker;
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private componentMetrics: Map<string, ComponentMetrics> = new Map();
  private thresholds: Map<string, PerformanceThreshold> = new Map();
  private isEnabled: boolean = true;

  // Thresholds padrão (em ms)
  private defaultThresholds: Record<string, PerformanceThreshold> = {
    'component-render': { warning: 16, critical: 33 }, // 60fps / 30fps
    'navigation': { warning: 300, critical: 1000 },
    'api-request': { warning: 2000, critical: 5000 },
    'image-load': { warning: 1000, critical: 3000 },
    'bundle-load': { warning: 3000, critical: 8000 }
  };

  static getInstance(): PerformanceTracker {
    if (!PerformanceTracker.instance) {
      PerformanceTracker.instance = new PerformanceTracker();
    }
    return PerformanceTracker.instance;
  }

  constructor() {
    // Configurar thresholds padrão
    Object.entries(this.defaultThresholds).forEach(([key, threshold]) => {
      this.thresholds.set(key, threshold);
    });
  }

  /**
   * Marca o início de uma operação
   */
  startTiming(name: string): PerformanceTimer {
    if (!this.isEnabled) {
      return new PerformanceTimer(name, () => {}, false);
    }

    const startTime = performance.now();
    
    return new PerformanceTimer(name, (metadata?: Record<string, any>) => {
      this.endTiming(name, startTime, metadata);
    });
  }

  /**
   * Finaliza o timing e registra a métrica
   */
  private endTiming(name: string, startTime: number, metadata?: Record<string, any>): void {
    const endTime = performance.now();
    const duration = endTime - startTime;

    this.recordMetric(name, duration, metadata);
  }

  /**
   * Registra uma métrica
   */
  recordMetric(name: string, value: number, metadata?: Record<string, any>): void {
    if (!this.isEnabled) return;

    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata
    };

    // Armazenar métrica
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const metrics = this.metrics.get(name)!;
    metrics.push(metric);

    // Manter apenas os últimos 100 registros por métrica
    if (metrics.length > 100) {
      metrics.shift();
    }

    // Verificar thresholds
    this.checkThresholds(name, value, metadata);

    // Atualizar métricas de componente se for render
    if (name.includes('render')) {
      this.updateComponentMetrics(name, value);
    }

    // Log para debugging
    logger.debug('PerformanceTracker', `Metric recorded: ${name} - ${value.toFixed(2)}ms`, metadata);
  }

  /**
   * Atualiza métricas específicas de componentes
   */
  private updateComponentMetrics(componentName: string, renderTime: number): void {
    if (!this.componentMetrics.has(componentName)) {
      this.componentMetrics.set(componentName, {
        renderCount: 0,
        averageRenderTime: 0,
        lastRenderTime: 0,
        totalRenderTime: 0,
        slowRenders: 0
      });
    }

    const metrics = this.componentMetrics.get(componentName)!;
    metrics.renderCount++;
    metrics.lastRenderTime = renderTime;
    metrics.totalRenderTime += renderTime;
    metrics.averageRenderTime = metrics.totalRenderTime / metrics.renderCount;

    // Contar renders lentos (> 16ms para 60fps)
    if (renderTime > 16) {
      metrics.slowRenders++;
    }
  }

  /**
   * Verifica se a métrica excedeu os thresholds
   */
  private checkThresholds(name: string, value: number, metadata?: Record<string, any>): void {
    // Buscar threshold específico ou por categoria
    const threshold = this.thresholds.get(name) || 
                     this.thresholds.get(this.getMetricCategory(name));

    if (!threshold) return;

    if (value > threshold.critical) {
      logger.error('PerformanceTracker', `Critical performance issue: ${name} - ${value.toFixed(2)}ms (threshold: ${threshold.critical}ms)`);
    } else if (value > threshold.warning) {
      logger.warn('PerformanceTracker', `Performance warning: ${name} - ${value.toFixed(2)}ms (threshold: ${threshold.warning}ms)`);
    }
  }

  /**
   * Determina a categoria da métrica baseada no nome
   */
  private getMetricCategory(name: string): string {
    if (name.includes('render')) return 'component-render';
    if (name.includes('navigation')) return 'navigation';
    if (name.includes('api') || name.includes('request')) return 'api-request';
    if (name.includes('image')) return 'image-load';
    if (name.includes('bundle')) return 'bundle-load';
    return 'default';
  }

  /**
   * Obtém estatísticas de uma métrica
   */
  getMetricStats(name: string): {
    count: number;
    average: number;
    min: number;
    max: number;
    median: number;
    p95: number;
  } | null {
    const metrics = this.metrics.get(name);
    if (!metrics || metrics.length === 0) return null;

    const values = metrics.map(m => m.value).sort((a, b) => a - b);
    const count = values.length;
    
    return {
      count,
      average: values.reduce((sum, val) => sum + val, 0) / count,
      min: values[0],
      max: values[count - 1],
      median: values[Math.floor(count / 2)],
      p95: values[Math.floor(count * 0.95)]
    };
  }

  /**
   * Obtém métricas de componente
   */
  getComponentMetrics(componentName: string): ComponentMetrics | null {
    return this.componentMetrics.get(componentName) || null;
  }

  /**
   * Obtém relatório de performance
   */
  getPerformanceReport(): string {
    const report = ['# Performance Report\n'];

    // Métricas gerais
    report.push('## General Metrics');
    this.metrics.forEach((metrics, name) => {
      const stats = this.getMetricStats(name);
      if (stats) {
        report.push(`### ${name}`);
        report.push(`- Count: ${stats.count}`);
        report.push(`- Average: ${stats.average.toFixed(2)}ms`);
        report.push(`- Min/Max: ${stats.min.toFixed(2)}ms / ${stats.max.toFixed(2)}ms`);
        report.push(`- P95: ${stats.p95.toFixed(2)}ms`);
        report.push('');
      }
    });

    // Métricas de componentes
    if (this.componentMetrics.size > 0) {
      report.push('## Component Metrics');
      this.componentMetrics.forEach((metrics, name) => {
        report.push(`### ${name}`);
        report.push(`- Renders: ${metrics.renderCount}`);
        report.push(`- Average Render Time: ${metrics.averageRenderTime.toFixed(2)}ms`);
        report.push(`- Slow Renders: ${metrics.slowRenders} (${((metrics.slowRenders / metrics.renderCount) * 100).toFixed(1)}%)`);
        report.push('');
      });
    }

    return report.join('\n');
  }

  /**
   * Configura threshold customizado
   */
  setThreshold(name: string, threshold: PerformanceThreshold): void {
    this.thresholds.set(name, threshold);
    logger.info('PerformanceTracker', `Threshold set for ${name}`, threshold);
  }

  /**
   * Ativa/desativa o tracker
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    logger.info('PerformanceTracker', `Performance tracking ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Limpa todas as métricas
   */
  clear(): void {
    this.metrics.clear();
    this.componentMetrics.clear();
    logger.info('PerformanceTracker', 'All metrics cleared');
  }

  /**
   * Exporta dados para análise externa
   */
  exportData(): {
    metrics: Record<string, PerformanceMetric[]>;
    componentMetrics: Record<string, ComponentMetrics>;
    timestamp: number;
  } {
    const data = {
      metrics: Object.fromEntries(this.metrics),
      componentMetrics: Object.fromEntries(this.componentMetrics),
      timestamp: Date.now()
    };

    logger.info('PerformanceTracker', 'Performance data exported', {
      metricsCount: this.metrics.size,
      componentsCount: this.componentMetrics.size
    });

    return data;
  }
}

/**
 * Helper class para timing de operações
 */
export class PerformanceTimer {
  constructor(
    private name: string,
    private endCallback: (metadata?: Record<string, any>) => void,
    private enabled: boolean = true
  ) {}

  /**
   * Finaliza o timer
   */
  end(metadata?: Record<string, any>): void {
    if (this.enabled) {
      this.endCallback(metadata);
    }
  }
}

// Instância singleton
export const performanceTracker = PerformanceTracker.getInstance();

// Funções utilitárias
export const startTiming = (name: string) => performanceTracker.startTiming(name);
export const recordMetric = (name: string, value: number, metadata?: Record<string, any>) => 
  performanceTracker.recordMetric(name, value, metadata);
export const getMetricStats = (name: string) => performanceTracker.getMetricStats(name);
export const getPerformanceReport = () => performanceTracker.getPerformanceReport();
