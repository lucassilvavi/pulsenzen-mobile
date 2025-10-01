# 🔒 Guia de Segurança - PulseZen

## ⚠️ Práticas de Segurança Implementadas

### 🔑 Autenticação e Tokens
- ✅ **Sem tokens hardcoded**: Todos os tokens vêm do AuthService ou variáveis de ambiente
- ✅ **Tratamento de erro de autenticação**: Mensagens específicas para sessões expiradas
- ✅ **Fallback seguro**: Em caso de token inválido, força novo login

### 🌐 Configuração de API
- ✅ **URLs baseadas em environment**: Usando `EXPO_PUBLIC_API_BASE_URL`
- ✅ **Fallbacks para desenvolvimento**: `localhost:3333` como padrão
- ✅ **Separação ambiente/produção**: Configurações específicas por ambiente

### 📄 Proteção de Arquivos Sensíveis
- ✅ **`.env` no gitignore**: Arquivos de configuração não são commitados
- ✅ **`.env.example` disponível**: Template para configuração local
- ✅ **Documentação clara**: Instruções para setup seguro

## 🚫 Práticas Evitadas (Corrigidas)

### ❌ O que NÃO fazer:
```typescript
// ❌ NUNCA fazer isso:
const authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."; // Token hardcoded

// ❌ NUNCA fazer isso:
const API_URL = "http://192.168.1.106:3333/api"; // IP específico hardcoded
```

### ✅ O que fazer:
```typescript
// ✅ Buscar token do serviço de autenticação:
const authToken = await AuthService.getToken();
if (!authToken) {
  throw new Error('Authentication required. Please login first.');
}

// ✅ Usar variáveis de ambiente com fallback seguro:
const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3333/api';
```

## 🔧 Setup de Desenvolvimento Seguro

### 1. Configuração do `.env`
```bash
# Copie o .env.example
cp .env.example .env

# Configure suas variáveis locais
EXPO_PUBLIC_API_BASE_URL=http://localhost:3333/api
EXPO_PUBLIC_USE_REAL_API=true
```

### 2. Verificação de Segurança
```bash
# Verificar se não há tokens hardcoded
grep -r "eyJ" --include="*.ts" --include="*.js" ./

# Verificar se .env não está no git
git ls-files | grep "\.env$"
```

### 3. Testes de Autenticação
- ✅ Testar comportamento com token expirado
- ✅ Testar comportamento sem token
- ✅ Verificar mensagens de erro apropriadas

## 🎯 Checklist de Segurança

- [x] Remover todos os tokens hardcoded
- [x] Configurar tratamento de erro de autenticação
- [x] Padronizar fallbacks para localhost
- [x] Adicionar .env ao gitignore
- [x] Criar .env.example como template
- [x] Documentar práticas de segurança
- [x] Implementar validação de token
- [x] Mensagens de erro específicas para usuário

## 🚀 Próximos Passos

1. **Implementar refresh token automático**
2. **Adicionar rate limiting no frontend**
3. **Implementar logout automático em token expirado**
4. **Adicionar logs de segurança (sem dados sensíveis)**

---

**⚡ Lembre-se**: Segurança é um processo contínuo, não um destino!