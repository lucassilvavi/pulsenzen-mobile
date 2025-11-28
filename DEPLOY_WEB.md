# 🌐 Deploy Web - PulseZen (Versão Beta para iOS)

## 📋 Visão Geral

Este guia documenta como fazer deploy da versão web do PulseZen no Railway, permitindo que usuários iOS testem o aplicativo via navegador enquanto aguardamos a aprovação na App Store.

## 🎯 Objetivo

Disponibilizar uma versão web paliativa do PulseZen para:
- ✅ Permitir testes beta em dispositivos iOS
- ✅ Evitar custos iniciais da Apple Store
- ✅ Coletar feedback dos usuários antes do lançamento oficial
- ✅ Validar funcionalidades em produção

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────┐
│         Railway Server (Único)          │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────┐  ┌─────────────────┐ │
│  │  API Server  │  │  Web App (PWA)  │ │
│  │  (AdonisJS)  │  │  (Expo + Nginx) │ │
│  │  Port: 3333  │  │  Port: 8080     │ │
│  └──────────────┘  └─────────────────┘ │
│         │                   │          │
│         └───────────────────┘          │
│            Mesmo domínio               │
└─────────────────────────────────────────┘
```

## 📦 Arquivos Criados

### 1. **Dockerfile**
- Build multi-stage otimizado
- Usa Node 20 Alpine para build
- Nginx Alpine para servir arquivos estáticos
- Compressão gzip habilitada
- Cache de assets configurado

### 2. **nginx.conf**
- Configuração otimizada para SPA
- Headers de segurança
- Fallback para index.html (routing client-side)
- Health check endpoint
- Cache de assets estáticos

### 3. **.env.production**
- Variáveis de ambiente para produção
- URL da API configurada para Railway
- Ambiente definido como production

### 4. **railway.toml**
- Configuração de build com Dockerfile
- Health check configurado
- Restart policy otimizado

### 5. **.dockerignore**
- Otimização do build
- Exclui arquivos desnecessários

## 🚀 Como Fazer Deploy

### Passo 1: Preparar o Repositório

```bash
cd /Users/lucas/Documents/pulsezen/pulsezen-app

# Adicionar arquivos ao git
git add Dockerfile nginx.conf railway.toml .env.production .dockerignore package.json

# Commit
git commit -m "feat: add web build configuration for Railway deployment"

# Push para o repositório
git push origin main
```

### Passo 2: Criar Novo Serviço no Railway

1. Acesse [Railway Dashboard](https://railway.app)
2. Abra o projeto onde está a API
3. Clique em **"+ New"** → **"GitHub Repo"**
4. Selecione o repositório `pulsezen-app`
5. Railway detectará automaticamente o `railway.toml`

### Passo 3: Configurar Variáveis de Ambiente no Railway

No painel do Railway, adicione as variáveis:

```env
EXPO_PUBLIC_API_URL=https://pulsezen-api-production.up.railway.app/api
EXPO_PUBLIC_ENV=production
NODE_ENV=production
```

### Passo 4: Configurar Domínio

1. No serviço web criado, vá em **Settings** → **Networking**
2. Clique em **Generate Domain**
3. Railway irá gerar um domínio como: `pulsezen-app-production.up.railway.app`
4. Ou configure um domínio customizado se preferir

### Passo 5: Deploy Automático

1. O Railway fará o build automaticamente
2. Acompanhe os logs em **Deployments**
3. Quando finalizar, acesse a URL gerada

## 🧪 Testar Localmente Antes do Deploy

### Teste 1: Exportar para Web

```bash
cd /Users/lucas/Documents/pulsezen/pulsezen-app

# Exportar build web
npm run web:export
```

### Teste 2: Build e Test Docker Local

```bash
# Build da imagem Docker
npm run web:build

# Rodar container localmente
npm run web:test

# Acessar em: http://localhost:8080
```

### Teste 3: Verificar Conectividade com API

```bash
# Verificar se a API está acessível
curl https://pulsezen-api-production.up.railway.app/api/health

# Deve retornar: {"status":"ok"}
```

## 📱 Como Usuários iOS Acessarão

### Opção 1: Navegador Safari
1. Usuário acessa a URL: `https://pulsezen-app-production.up.railway.app`
2. Clica em compartilhar (ícone de seta)
3. Seleciona "Adicionar à Tela de Início"
4. App aparece como ícone na tela inicial (PWA)

### Opção 2: Criar QR Code para Facilitar

Você pode criar um QR Code que direciona para a URL do app:

```bash
# Ferramenta online: https://www.qr-code-generator.com/
# Cole a URL: https://pulsezen-app-production.up.railway.app
```

## 🔍 Monitoramento e Logs

### Ver Logs do Deploy

```bash
# Via Railway CLI (se instalado)
railway logs

# Ou acesse via dashboard:
# Railway Dashboard → Seu Serviço → Deployments → View Logs
```

### Health Check

```bash
# Verificar se o app está online
curl https://pulsezen-app-production.up.railway.app/health

# Deve retornar: healthy
```

## ⚙️ Configurações CORS na API

**IMPORTANTE**: Certifique-se de que a API aceita requisições do domínio web.

No arquivo da API `/Users/lucas/Documents/pulsezen/pulsezen-api/config/cors.ts`:

```typescript
{
  origin: [
    'https://pulsezen-app-production.up.railway.app',
    // outros domínios...
  ]
}
```

## 🔐 Funcionalidades Limitadas na Web

Algumas features nativas não funcionarão no navegador:

❌ **Não Disponível**:
- Face ID / Touch ID (biometria nativa)
- Notificações push nativas
- Acesso a arquivos do sistema
- Vibração háptica completa

✅ **Disponível**:
- Login com email/senha
- Registro de humor
- Meditações e áudios
- Exercícios de respiração
- Diário e anotações
- Gráficos e estatísticas
- Terapia CBT
- SOS e recursos de emergência

## 📊 Custos Estimados

### Railway (Pay-as-you-go)
- **Build**: Grátis para primeiros deploys
- **Running**: ~$5-10/mês para tráfego moderado
- **Total**: Compartilhado com API, custo marginal baixo

### Alternativa: Vercel/Netlify (Grátis)
Se quiser reduzir custos, pode fazer deploy estático em:
- Vercel (100GB bandwidth grátis)
- Netlify (100GB bandwidth grátis)

## 🔄 Atualizações Futuras

Para fazer deploy de novas versões:

```bash
# Fazer alterações no código
git add .
git commit -m "feat: nova funcionalidade"
git push origin main

# Railway fará deploy automaticamente
```

## 📞 Suporte e Troubleshooting

### Problema: Build Failed

**Solução**: Verifique os logs no Railway Dashboard

### Problema: API não conecta

**Solução**: Verifique variável `EXPO_PUBLIC_API_URL` e CORS

### Problema: Página em branco

**Solução**: Verifique console do navegador (F12)

## 🎉 Próximos Passos

1. ✅ Deploy concluído
2. 📱 Compartilhar link com beta testers iOS
3. 📊 Coletar feedback
4. 🐛 Corrigir bugs reportados
5. 🚀 Preparar para lançamento na App Store

## 📝 Notas Importantes

- Esta é uma versão **paliativa** para testes
- A experiência web é boa, mas não substitui o app nativo
- Use para validar funcionalidades antes do lançamento oficial
- Monitore o uso e feedback dos usuários

---

**Desenvolvido por Lucas Silva**  
**Data**: Novembro 2025  
**Versão**: 1.0.0-web-beta
