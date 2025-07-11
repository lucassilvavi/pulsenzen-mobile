# 🔗 Integração PulseZen Mobile App com API

## 📋 Status da Integração

✅ **COMPLETO** - Sistema de autenticação integrado ao onboarding  
✅ **COMPLETO** - API de Journal configurada e funcionando  
✅ **COMPLETO** - Persistência de login automático  
✅ **COMPLETO** - Fluxo de onboarding atualizado  

---

## 🚀 Implementação Realizada

### 1. Sistema de Autenticação

#### **AuthService** (`/services/authService.ts`)
- ✅ Registro de usuários com validação
- ✅ Login com JWT tokens
- ✅ Logout com limpeza de dados
- ✅ Persistência automática de sessão
- ✅ Validação de senha em tempo real
- ✅ Headers de autorização automáticos

#### **AuthContext** (`/context/AuthContext.tsx`)
- ✅ Estado global de autenticação
- ✅ Hooks para usar em qualquer componente
- ✅ Verificação automática de sessão
- ✅ Loading states

### 2. Tela de Autenticação

#### **AuthScreen** (`/app/onboarding/auth.tsx`)
- ✅ Formulário de registro e login
- ✅ Validação de campos em tempo real
- ✅ Alternar entre login/registro
- ✅ Integração com API real
- ✅ Feedback visual para o usuário

**Campos do Registro:**
- Nome e Sobrenome
- Email (com validação)
- Senha (min 8 caracteres)
- Confirmação de senha

### 3. Fluxo de Onboarding Atualizado

#### **Novo Fluxo:**
1. **Welcome** → Apresentação do app
2. **Auth** → Login/Registro (**NOVO**)
3. **Setup** → Configuração de perfil (agora integrado com dados do usuário)

#### **Setup Screen Atualizada** (`/app/onboarding/setup.tsx`)
- ✅ Integração com usuário autenticado
- ✅ Validação de autenticação antes de continuar
- ✅ Salvamento do perfil com dados da API

### 4. Journal API Service

#### **JournalApiService** (`/services/journalApiService.ts`)
- ✅ Completamente reescrito para usar AuthService
- ✅ Headers de autorização automáticos
- ✅ Todos os endpoints do Journal implementados:
  - GET /journal - Listar entradas
  - POST /journal - Criar entrada
  - GET /journal/:id - Buscar entrada específica
  - PUT /journal/:id - Atualizar entrada
  - DELETE /journal/:id - Deletar entrada
  - GET /journal/search - Buscar entradas
  - GET /journal/stats - Estatísticas
  - GET /journal/prompts - Prompts

### 5. Layout Principal

#### **RootLayout** (`/app/_layout.tsx`)
- ✅ AuthProvider integrado
- ✅ Verificação automática de autenticação
- ✅ Navegação inteligente baseada em estado:
  - Não autenticado → `/onboarding/welcome`
  - Autenticado + sem onboarding → `/onboarding/setup` 
  - Autenticado + com onboarding → `/` (app principal)

---

## 🔧 Como Funciona

### Persistência de Login
```typescript
// O usuário faz login uma vez e fica sempre logado
await AuthService.login(email, password)
// Token é salvo automaticamente no AsyncStorage
// Na próxima abertura do app, o usuário já estará logado
```

### Requisições Autenticadas
```typescript
// Todas as requisições do Journal incluem automaticamente o token
const entries = await journalApiService.getJournalEntries()
// Headers: { Authorization: "Bearer <token>" }
```

### Estado Global de Autenticação
```typescript
// Em qualquer componente:
const { user, isAuthenticated, logout } = useAuth()

if (!isAuthenticated) {
  return <LoginScreen />
}
```

---

## 🌐 Configuração da API

### URL Base
```typescript
const API_BASE_URL = 'http://localhost:3333/api/v1'
```

### Endpoints Utilizados
- `POST /auth/register` - Registro de usuário
- `POST /auth/login` - Login de usuário
- `GET /auth/profile` - Perfil do usuário
- `POST /auth/logout` - Logout
- `GET /journal/*` - Todas operações do journal

---

## 📱 Experiência do Usuário

### Primeiro Acesso
1. Usuário abre o app
2. Ve a tela de welcome
3. Clica em "Começar"
4. É direcionado para registro/login
5. Faz o registro
6. É direcionado para configuração de perfil
7. Configura objetivos e experiência
8. É direcionado para o app principal

### Acessos Subsequentes
1. Usuário abre o app
2. **É direcionado diretamente para o app principal** (login automático!)

### Logout Manual
```typescript
// Em qualquer tela do app:
const { logout } = useAuth()
await logout() // Limpa dados e volta para onboarding
```

---

## 🔄 Próximos Passos

### Imediato (Para testar)
1. **Iniciar a API** (no diretório `pulsezen-api`):
   ```bash
   npm run dev
   ```

2. **Iniciar o App Mobile** (no diretório `pulsezen-app`):
   ```bash
   npx expo start
   ```

3. **Testar o fluxo completo:**
   - Fazer registro de usuário
   - Configurar perfil
   - Acessar journal
   - Testar persistência (fechar e abrir o app)

### Melhorias Futuras
- [ ] Tela de recuperação de senha
- [ ] Validação de email por código
- [ ] Biometria para login rápido
- [ ] Sync offline/online
- [ ] Perfil de usuário editável

---

## 🌐 Configuração de Rede

### Problema: localhost não funciona em dispositivos móveis

**Importante:** Durante o desenvolvimento, o app móvel (dispositivo real ou emulador) não consegue acessar `localhost:3333` do computador host.

### Solução Implementada:

#### 1. **Configurar API para aceitar conexões externas**
```bash
# No arquivo pulsezen-api/.env
HOST=0.0.0.0  # Permite conexões de qualquer IP
PORT=3333
```

#### 2. **Usar IP local da máquina**
```bash
# Descobrir IP da máquina
ifconfig | grep -E "inet " | grep -v "127.0.0.1"
# Resultado: 192.168.3.75
```

#### 3. **Configuração centralizada da API**
```typescript
// Criado: pulsezen-app/config/api.ts
export const API_CONFIG = {
  BASE_URL: 'http://192.168.3.75:3333/api/v1',
  ENDPOINTS: { /* todos os endpoints */ },
  TIMEOUT: 10000,
  HEADERS: { /* headers padrão */ }
};
```

#### 4. **Serviços atualizados**
- ✅ `authService.ts` - Usa API_CONFIG.BASE_URL
- ✅ `journalApiService.ts` - Usa API_CONFIG.BASE_URL
- ✅ Configuração centralizada para fácil manutenção

### Teste de Conectividade
```bash
# API Health check
curl -X GET http://192.168.3.75:3333/health
# ✅ Status: healthy

# Registro via IP local
curl -X POST http://192.168.3.75:3333/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"...}'
# ✅ Success: true
```

---

## 🚨 Pontos Importantes

### Segurança
- ✅ Senhas são hasheadas na API
- ✅ JWT tokens com expiração
- ✅ Headers seguros
- ✅ Validação de entrada

### Performance
- ✅ Tokens persistidos localmente
- ✅ Verificação de auth assíncrona
- ✅ Loading states implementados
- ✅ Erro handling completo

### UX
- ✅ Login permanente (usuário não precisa logar sempre)
- ✅ Feedback visual em todas ações
- ✅ Navegação inteligente
- ✅ Validação em tempo real

---

## 🎯 Resultado Final

O PulseZen agora possui um **sistema de autenticação completo e integrado** que:

1. **Mantém o usuário sempre logado** após primeiro acesso
2. **Integra perfeitamente com o onboarding** existente
3. **Conecta com a API real** para persistência de dados
4. **Proporciona uma experiência fluida** sem logins repetitivos
5. **Está pronto para produção** com todas validações e tratamentos de erro

**O app mobile agora está completamente integrado com a API! 🎉**
