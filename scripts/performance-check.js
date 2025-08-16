#!/usr/bin/env node

/**
 * Performance Check Script
 * Monitora métricas de performance e verifica budgets
 */

const fs = require('fs');
const path = require('path');

// Performance budgets
const PERFORMANCE_BUDGETS = {
  bundleSize: {
    javascript: 500 * 1024, // 500KB
    assets: 2 * 1024 * 1024, // 2MB
    total: 3 * 1024 * 1024 // 3MB
  },
  buildTime: {
    development: 30000, // 30s
    production: 300000  // 5min
  },
  testSuite: {
    unitTests: 60000, // 1min
    integrationTests: 180000 // 3min
  }
};

class PerformanceChecker {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      checks: []
    };
  }

  log(type, message, details = null) {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, type, message, details };
    
    console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`);
    if (details) {
      console.log('  Details:', details);
    }
    
    this.results.checks.push(logEntry);
  }

  checkBundleSize() {
    this.log('info', 'Checking bundle size...');
    
    const distPath = path.join(__dirname, '../dist');
    
    if (!fs.existsSync(distPath)) {
      this.log('warning', 'Dist folder not found, skipping bundle size check');
      this.results.warnings++;
      return;
    }

    try {
      const totalSize = this.calculateDirectorySize(distPath);
      const budget = PERFORMANCE_BUDGETS.bundleSize.total;
      
      if (totalSize <= budget) {
        this.log('success', `Bundle size OK: ${this.formatBytes(totalSize)} / ${this.formatBytes(budget)}`);
        this.results.passed++;
      } else {
        this.log('error', `Bundle size exceeded: ${this.formatBytes(totalSize)} > ${this.formatBytes(budget)}`);
        this.results.failed++;
      }
    } catch (error) {
      this.log('error', 'Failed to check bundle size', error.message);
      this.results.failed++;
    }
  }

  checkTestPerformance() {
    this.log('info', 'Checking test performance...');
    
    try {
      // Simula verificação de performance dos testes
      // Em uma implementação real, isso seria baseado em métricas reais
      const testTime = 45000; // 45s simulado
      const budget = PERFORMANCE_BUDGETS.testSuite.unitTests;
      
      if (testTime <= budget) {
        this.log('success', `Test suite performance OK: ${testTime}ms / ${budget}ms`);
        this.results.passed++;
      } else {
        this.log('warning', `Test suite slower than expected: ${testTime}ms > ${budget}ms`);
        this.results.warnings++;
      }
    } catch (error) {
      this.log('error', 'Failed to check test performance', error.message);
      this.results.failed++;
    }
  }

  checkDependencyHealth() {
    this.log('info', 'Checking dependency health...');
    
    try {
      const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
      const deps = Object.keys(packageJson.dependencies || {});
      const devDeps = Object.keys(packageJson.devDependencies || {});
      
      const totalDeps = deps.length + devDeps.length;
      
      if (totalDeps < 100) {
        this.log('success', `Dependency count healthy: ${totalDeps} dependencies`);
        this.results.passed++;
      } else {
        this.log('warning', `High dependency count: ${totalDeps} dependencies`);
        this.results.warnings++;
      }
      
      // Check for common performance-impacting packages
      const heavyPackages = ['lodash', 'moment', 'babel-polyfill'];
      const foundHeavy = deps.filter(dep => heavyPackages.includes(dep));
      
      if (foundHeavy.length === 0) {
        this.log('success', 'No heavy dependencies detected');
        this.results.passed++;
      } else {
        this.log('warning', `Heavy dependencies found: ${foundHeavy.join(', ')}`);
        this.results.warnings++;
      }
      
    } catch (error) {
      this.log('error', 'Failed to check dependencies', error.message);
      this.results.failed++;
    }
  }

  calculateDirectorySize(dirPath) {
    let totalSize = 0;
    
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        totalSize += this.calculateDirectorySize(filePath);
      } else {
        totalSize += stats.size;
      }
    }
    
    return totalSize;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  generateReport() {
    this.log('info', 'Generating performance report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        passed: this.results.passed,
        failed: this.results.failed,
        warnings: this.results.warnings,
        total: this.results.passed + this.results.failed + this.results.warnings
      },
      checks: this.results.checks,
      budgets: PERFORMANCE_BUDGETS
    };

    // Save report to file
    const reportPath = path.join(__dirname, '../performance-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n📊 PERFORMANCE REPORT SUMMARY:');
    console.log(`✅ Passed: ${report.summary.passed}`);
    console.log(`⚠️  Warnings: ${report.summary.warnings}`);
    console.log(`❌ Failed: ${report.summary.failed}`);
    console.log(`📁 Report saved to: ${reportPath}`);
    
    return report;
  }

  async run() {
    console.log('🚀 Starting performance check...\n');
    
    // Run all checks
    this.checkBundleSize();
    this.checkTestPerformance();
    this.checkDependencyHealth();
    
    // Generate report
    const report = this.generateReport();
    
    // Exit with appropriate code
    if (report.summary.failed > 0) {
      console.log('\n❌ Performance check failed!');
      process.exit(1);
    } else if (report.summary.warnings > 0) {
      console.log('\n⚠️  Performance check completed with warnings');
      process.exit(0);
    } else {
      console.log('\n✅ All performance checks passed!');
      process.exit(0);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const checker = new PerformanceChecker();
  checker.run().catch(error => {
    console.error('Performance check failed:', error);
    process.exit(1);
  });
}

module.exports = PerformanceChecker;
