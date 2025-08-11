# Backend Prediction API Contract (Draft v0.1)
Status: Draft (Mock-driven development)
Last Updated: 2025-08-10

## 1. Objetivo
Definir contrato inicial para o endpoint de previsão de equilíbrio emocional (risk scoring) consumido pelo app. Implementação backend pode iniciar após validação de UX. MVP usa mock local.

## 2. Recursos REST
### GET /prediction/current
Retorna previsão atual do usuário.
Response 200:
```json
{
  "success": true,
  "data": {
    "id": "1733872345234",
    "score": 0.62,
    "level": "medium",
    "label": "Atenção leve",
    "confidence": 0.81,
    "generated_at": "2025-08-10T12:34:01Z",
    "factors": [
      { "id": "mood_volatility", "category": "Humor", "label": "Variação de humor recente", "weight": 0.22, "description": "Oscilações nos últimos 3 dias", "suggestion": "Registrar gatilhos" }
    ],
    "interventions": [
      { "id": "breathing_box", "title": "Respiração Caixa 4x4", "emoji": "🫁", "benefit": "Reduz ativação", "estimated_minutes": 3, "type": "breathing" }
    ]
  }
}
```

### POST /prediction/refresh
Força recomputação (rate limited). Body vazio.
Response 202:
```json
{ "success": true, "job_id": "abc123" }
```
Ou 200 síncrono (MVP): retorna igual a GET.

### GET /prediction/history?limit=20
Retorna array de summaries recentes.
```json
{
  "success": true,
  "data": [ { "id": "...", "score": 0.55, "level": "medium", "label": "Atenção leve", "confidence": 0.78, "generated_at": "..." } ]
}
```

### POST /interventions/:id/complete
Marca intervenção sugerida como concluída (telemetria).
Body opcional: `{ "duration_seconds": 180 }`
Response 200: `{ "success": true }`

## 3. Códigos de Erro
| Código | HTTP | Mensagem | Ação app |
|--------|------|----------|----------|
| PREDICTION_NOT_READY | 425 | Previsão em processamento | Mostrar skeleton + retry | 
| RATE_LIMIT | 429 | Limite excedido | Exibir mensagem suave | 
| VALIDATION_ERROR | 400 | Parâmetros inválidos | Ajustar chamada |
| SERVER_ERROR | 500 | Erro interno | Retry exponencial |

## 4. Autenticação
Bearer JWT (mesmo fluxo atual). Escopo futuro: `prediction:read` `prediction:update`.

## 5. Versão
Header `X-PulseZen-Prediction-Version: 1`. Alterar ao mudar payload.

## 6. Telemetria Proposta
- prediction_request
- prediction_compute_time_ms
- prediction_cache_hit
- intervention_completed
- prediction_error (com error_code)

## 7. Modelo de Dados (DB draft backend)
Tabela `predictions` (id, user_id, score NUMERIC(4,3), level, confidence NUMERIC(4,3), factors JSONB, interventions JSONB, created_at)

## 8. SLA / Performance (alvo)
- P95 GET /prediction/current < 300ms
- Cache válido por 3h (inicial)

## 9. Próximos Passos
1. Validar layout com usuários (mock)
2. Ajustar vocabulário / labels
3. Converter este draft em OpenAPI
4. Implementar endpoint + testes
5. Integrar app substituindo mocks

---
End of draft.
