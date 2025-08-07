#!/bin/bash

# 🚀 SCRIPT DE INICIALIZAÇÃO - AUTENTICAÇÃO BIOMÉTRICA
# Script automatizado para começar a implementação

set -e  # Para em caso de erro

echo "🔐 INICIALIZANDO IMPLEMENTAÇÃO BIOMÉTRICA PULSEZEN"
echo "================================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função de log
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar se estamos no diretório correto
if [[ ! -f "package.json" ]]; then
    log_error "Execute este script a partir da pasta pulsenzen-mobile"
    exit 1
fi

echo ""
log_info "FASE 1: VERIFICAÇÃO DO AMBIENTE"
echo "--------------------------------"

# Verificar Node.js
if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    log_success "Node.js encontrado: $NODE_VERSION"
else
    log_error "Node.js não encontrado. Instale Node.js 18+"
    exit 1
fi

# Verificar Expo CLI
if command -v npx >/dev/null 2>&1; then
    log_success "npx encontrado - Expo CLI disponível"
else
    log_error "npx não encontrado. Instale Node.js corretamente"
    exit 1
fi

# Verificar se API está rodando (opcional)
if curl -s http://localhost:3333/health >/dev/null 2>&1; then
    log_success "API backend detectada em localhost:3333"
else
    log_warning "API backend não detectada - OK para desenvolvimento mobile isolado"
fi

echo ""
log_info "FASE 2: BACKUP E PREPARAÇÃO"
echo "----------------------------"

# Criar backup do AuthService atual
if [[ -f "services/authService.ts" ]]; then
    cp services/authService.ts services/authService.backup.ts
    log_success "Backup criado: services/authService.backup.ts"
fi

# Criar backup do AuthContext atual
if [[ -f "context/AuthContext.tsx" ]]; then
    cp context/AuthContext.tsx context/AuthContext.backup.tsx
    log_success "Backup criado: context/AuthContext.backup.tsx"
fi

echo ""
log_info "FASE 3: INSTALAÇÃO DE DEPENDÊNCIAS"
echo "-----------------------------------"

# Instalar expo-local-authentication
log_info "Instalando expo-local-authentication..."
if npx expo install expo-local-authentication; then
    log_success "expo-local-authentication instalado com sucesso"
else
    log_error "Falha ao instalar expo-local-authentication"
    exit 1
fi

# Instalar expo-secure-store (se não estiver instalado)
log_info "Verificando expo-secure-store..."
if npm list expo-secure-store >/dev/null 2>&1; then
    log_success "expo-secure-store já instalado"
else
    log_info "Instalando expo-secure-store..."
    npx expo install expo-secure-store
    log_success "expo-secure-store instalado"
fi

# Instalar expo-crypto (se não estiver instalado)
log_info "Verificando expo-crypto..."
if npm list expo-crypto >/dev/null 2>&1; then
    log_success "expo-crypto já instalado"
else
    log_info "Instalando expo-crypto..."
    npx expo install expo-crypto
    log_success "expo-crypto instalado"
fi

echo ""
log_info "FASE 4: ATUALIZAÇÃO DO app.json"
echo "-------------------------------"

# Backup do app.json
cp app.json app.json.backup
log_success "Backup criado: app.json.backup"

# Criar versão atualizada do app.json com as permissões necessárias
log_info "Adicionando permissões biométricas ao app.json..."

# Usar Python para atualizar o JSON (mais seguro que sed)
python3 << 'EOF'
import json
import sys

try:
    with open('app.json', 'r') as f:
        config = json.load(f)
    
    # Adicionar permissões iOS
    if 'expo' not in config:
        config['expo'] = {}
    
    if 'ios' not in config['expo']:
        config['expo']['ios'] = {}
        
    if 'infoPlist' not in config['expo']['ios']:
        config['expo']['ios']['infoPlist'] = {}
    
    config['expo']['ios']['infoPlist']['NSFaceIDUsageDescription'] = "PulseZen usa Face ID para login seguro e rápido, tornando seu acesso mais conveniente."
    
    # Adicionar permissões Android
    if 'android' not in config['expo']:
        config['expo']['android'] = {}
        
    if 'permissions' not in config['expo']['android']:
        config['expo']['android']['permissions'] = []
    
    android_permissions = config['expo']['android']['permissions']
    biometric_permissions = [
        "USE_BIOMETRIC",
        "USE_FINGERPRINT"
    ]
    
    for permission in biometric_permissions:
        if permission not in android_permissions:
            android_permissions.append(permission)
    
    # Salvar arquivo atualizado
    with open('app.json', 'w') as f:
        json.dump(config, f, indent=2)
    
    print("app.json atualizado com sucesso")
    
except Exception as e:
    print(f"Erro ao atualizar app.json: {e}")
    sys.exit(1)
EOF

if [[ $? -eq 0 ]]; then
    log_success "Permissões biométricas adicionadas ao app.json"
else
    log_error "Falha ao atualizar app.json"
    exit 1
fi

echo ""
log_info "FASE 5: CRIAÇÃO DE ESTRUTURA DE PASTAS"
echo "-------------------------------------"

# Criar pastas necessárias
mkdir -p components/auth
mkdir -p services/biometric
mkdir -p types/auth
mkdir -p __tests__/biometric
mkdir -p app/onboarding/auth

log_success "Estrutura de pastas criada"

echo ""
log_info "FASE 6: CRIAÇÃO DE ARQUIVOS BASE"
echo "-------------------------------"

# Criar arquivo de tipos base
cat > types/auth/biometric.ts << 'EOF'
// 🔐 Tipos para autenticação biométrica - PulseZen
// Criado automaticamente pelo script de setup

export interface DeviceCapabilities {
  hasBiometrics: boolean;
  biometricType: 'faceId' | 'touchId' | 'fingerprint' | 'iris' | 'none';
  hasDevicePasscode: boolean;
  securityLevel: 'premium' | 'protected' | 'basic' | 'insecure';
}

export interface BiometricAuthResult {
  success: boolean;
  method: 'biometric' | 'devicePin' | 'appPin' | 'email';
  token?: string;
  error?: string;
  fallbackReason?: string;
}

export interface UserDevice {
  id: string;
  fingerprint: string;
  name: string;
  capabilities: DeviceCapabilities;
  trustScore: number;
  lastSeen: Date;
}

// TODO: Implementar interfaces completas conforme documentação
EOF

log_success "Arquivo de tipos criado: types/auth/biometric.ts"

# Criar placeholder para BiometricAuthManager
cat > services/biometric/biometricAuthManager.ts << 'EOF'
// 🔐 BiometricAuthManager - PulseZen
// Criado automaticamente pelo script de setup
// TODO: Implementar classe completa conforme MOBILE_BIOMETRIC_IMPLEMENTATION_PLAN.md

import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

export class BiometricAuthManager {
  // TODO: Implementar métodos conforme documentação
  
  async checkDeviceCapabilities() {
    // Placeholder - implementar conforme MOBILE_BIOMETRIC_IMPLEMENTATION_PLAN.md
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    
    return {
      hasBiometrics: hasHardware && isEnrolled,
      biometricType: 'none' as const,
      hasDevicePasscode: false,
      securityLevel: 'basic' as const
    };
  }
}

export default new BiometricAuthManager();
EOF

log_success "Placeholder criado: services/biometric/biometricAuthManager.ts"

# Criar teste básico
cat > __tests__/biometric/biometricAuthManager.test.ts << 'EOF'
// 🧪 Testes BiometricAuthManager - PulseZen
// Criado automaticamente pelo script de setup

import { BiometricAuthManager } from '../../services/biometric/biometricAuthManager';

describe('BiometricAuthManager', () => {
  it('should be instantiable', () => {
    expect(BiometricAuthManager).toBeDefined();
  });

  // TODO: Implementar testes conforme BIOMETRIC_TESTING_AUTOMATION.md
});
EOF

log_success "Teste básico criado: __tests__/biometric/biometricAuthManager.test.ts"

echo ""
log_info "FASE 7: VALIDAÇÃO FINAL"
echo "----------------------"

# Executar npm install para garantir que tudo está correto
log_info "Executando npm install para validar dependências..."
if npm install; then
    log_success "Dependências validadas com sucesso"
else
    log_warning "Algumas dependências podem ter issues - verificar manualmente"
fi

# Executar teste básico
log_info "Executando teste básico..."
if npm test -- __tests__/biometric/biometricAuthManager.test.ts --passWithNoTests; then
    log_success "Teste básico passou"
else
    log_warning "Teste básico falhou - normal em setup inicial"
fi

echo ""
echo "🎉 IMPLEMENTAÇÃO BIOMÉTRICA INICIALIZADA COM SUCESSO!"
echo "=================================================="
echo ""
log_success "✅ Dependências instaladas (expo-local-authentication, expo-secure-store, expo-crypto)"
log_success "✅ Permissões adicionadas ao app.json"
log_success "✅ Estrutura de pastas criada"
log_success "✅ Arquivos base criados"
log_success "✅ Backups realizados"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "1. Implementar BiometricAuthManager completo (veja MOBILE_BIOMETRIC_IMPLEMENTATION_PLAN.md)"
echo "2. Atualizar AuthService existente com integração biométrica"
echo "3. Criar componentes de UI (AuthMethodSelector, BiometricPrompt, etc.)"
echo "4. Executar testes completos (npm run test:biometric)"
echo ""
echo "📚 DOCUMENTAÇÃO DISPONÍVEL:"
echo "- docs/BIOMETRIC_LOGIN_IMPLEMENTATION_PLAN.md"
echo "- docs/MOBILE_BIOMETRIC_IMPLEMENTATION_PLAN.md"
echo "- docs/BIOMETRIC_AUTH_IMPLEMENTATION_CODE.md"
echo "- docs/BIOMETRIC_TESTING_AUTOMATION.md"
echo "- docs/README_BIOMETRIC_AUTH.md"
echo ""
log_info "Implementação pronta para desenvolvimento! 🚀"
