# 🚀 Guia de Migração para API - Módulo SOS

## 📋 Quick Start para Integração

### 1. Trocar Service (1 linha de código)
```typescript
// Em SOSScreen.tsx - ANTES
import { SOSService } from '../services';

// Em SOSScreen.tsx - DEPOIS
import { SOSApiService as SOSService } from '../services';
```

### 2. Configurar Environment
```bash
# .env
EXPO_PUBLIC_API_KEY=your_api_key_here
```

### 3. Endpoints da API
```typescript
// Base URL já configurada
const baseUrl = 'https://api.pulsezen.com/v1/sos';

// Endpoints implementados:
GET    /strategies              // getCopingStrategies()
GET    /strategies/:id          // getCopingStrategy(id)
GET    /emergency-contacts      // getEmergencyContacts()
POST   /sessions               // startSession(strategyId)
PUT    /sessions/:id/complete  // completeSession(id, rating, notes)
GET    /stats                  // getSOSStats()
GET    /sessions               // getSessions()
```

### 4. Modelos API (já implementados)
```typescript
// Request/Response models prontos em:
// modules/sos/models/ApiModels.ts

interface ApiCopingStrategy {
  id: string;
  title: string;
  description: string;
  duration: number;
  steps: string[];
  icon: string;
  category: 'breathing' | 'grounding' | 'relaxation' | 'physical';
  created_at: string;
  updated_at: string;
}
```

## ✅ Features Prontas para Produção

- **Mock Data**: 4 estratégias + 3 contatos de emergência
- **Session Management**: Start/Complete com rating e notas
- **Statistics**: Cálculo automático de métricas
- **Error Handling**: Fallback gracioso para offline
- **Validation**: Dados sanitizados antes de envio
- **TypeScript**: 100% tipado para segurança

## 🔄 Processo de Deployment

1. **Teste local** com SOSService (atual)
2. **Configure API** endpoints no backend
3. **Troque** para SOSApiService
4. **Teste** integração completa
5. **Deploy** para produção

O módulo SOS está **100% pronto** para API integration! 🎯
