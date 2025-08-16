# 🚀 PulseZen CI/CD Pipeline

## 📋 Visão Geral

Este diretório contém a configuração completa de CI/CD para o PulseZen App, implementando automação de testes, builds, deploys e monitoramento de performance.

## 🔧 Configuração da Pipeline

### Workflows Disponíveis

1. **🧪 Test & Quality Check** - Executa testes e verificações de qualidade
2. **🔨 Build Preview** - Gera builds para PRs e branch develop
3. **🚀 Production Build** - Build de produção com EAS
4. **🛡️ Security Scan** - Auditoria de segurança e vulnerabilidades
5. **🎭 Deploy Staging** - Deploy automático para ambiente de staging
6. **📈 Performance Monitoring** - Monitoramento de performance e budgets

### Triggers

- **Push para `main`**: Executa todos os workflows de produção
- **Push para `develop`**: Executa workflows de staging
- **Pull Requests**: Executa testes e builds de preview

## 🏗️ EAS Build Configuration

### Perfis de Build

```json
{
  "development": "Builds para desenvolvimento com debug",
  "staging": "Builds para testes internos",
  "preview": "Builds para preview e QA",
  "production": "Builds otimizados para produção"
}
```

### Canais de Release

- **development**: Desenvolvimento local
- **staging**: Testes internos e QA
- **preview**: Demonstrações e testes beta
- **production**: Release para app stores

## 🔐 Secrets Necessários

Configure os seguintes secrets no GitHub:

```bash
# Expo/EAS
EXPO_TOKEN=your_expo_access_token

# Code Coverage
CODECOV_TOKEN=your_codecov_token

# Analytics (opcional)
AMPLITUDE_API_KEY=your_amplitude_key
MIXPANEL_TOKEN=your_mixpanel_token

# Error Tracking (opcional)
SENTRY_DSN=your_sentry_dsn
```

## 📊 Performance Monitoring

### Budgets Configurados

- **Bundle Size**: 500KB JavaScript, 2MB assets, 3MB total
- **Build Time**: 30s dev, 5min production
- **Test Suite**: 1min unit tests, 3min integration

### Scripts Disponíveis

```bash
# Performance
npm run performance:check      # Verifica budgets de performance
npm run security:audit         # Auditoria de segurança

# Build & Deploy
npm run build:preview          # Build preview local
npm run build:staging          # Build staging com EAS
npm run build:production       # Build produção com EAS
npm run deploy:staging         # Deploy para staging
npm run deploy:production      # Deploy para produção

# CI/CD
npm run ci:setup              # Setup para CI
npm run ci:test               # Testes para CI
npm run ci:build              # Build para CI
```

## 🚦 Status da Pipeline

### ✅ Implementado

- [x] Workflow de testes automatizados
- [x] Build preview para PRs
- [x] EAS Build configuration
- [x] Security audit
- [x] Performance monitoring
- [x] Deploy staging automático
- [x] Error tracking integration

### 🔄 Em Progresso

- [ ] Deploy production automático
- [ ] App store submission automation
- [ ] Performance regression detection
- [ ] Advanced security scanning

### 📋 Roadmap

- [ ] E2E testing integration
- [ ] Visual regression testing
- [ ] Accessibility testing
- [ ] Load testing for API endpoints

## 🔍 Troubleshooting

### Falhas Comuns

#### 1. EAS Build Failures
```bash
# Verificar configuração
npx eas build:configure

# Debug build local
npx eas build --platform ios --local
```

#### 2. Test Failures
```bash
# Executar testes localmente
npm run test:coverage

# Debug testes específicos
npm test -- --verbose MyTest.test.ts
```

#### 3. Performance Budget Exceeded
```bash
# Analisar bundle size
npm run performance:check

# Verificar dependências pesadas
npx bundle-analyzer
```

## 📈 Métricas Monitoradas

- **Build Success Rate**: Target 95%+
- **Test Coverage**: Target 80%+
- **Bundle Size**: Max 3MB
- **Build Time**: Max 5min produção
- **Security Vulnerabilities**: 0 high/critical

## 🛠️ Manutenção

### Atualizações Regulares

- **Dependências**: Atualizar mensalmente
- **Node.js**: Manter LTS mais recente
- **Expo SDK**: Atualizar a cada release
- **EAS CLI**: Manter sempre atualizado

### Monitoramento

- Verificar dashboards de performance semanalmente
- Revisar security scans mensalmente
- Atualizar budgets de performance conforme necessário

## 📞 Suporte

Para problemas com a pipeline CI/CD:

1. Verificar logs do GitHub Actions
2. Consultar documentação do Expo/EAS
3. Verificar status dos serviços terceiros
4. Contatar equipe DevOps se necessário

---

*Este pipeline é mantido e atualizado regularmente para garantir builds rápidos, seguros e confiáveis.*
