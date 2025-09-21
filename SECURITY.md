# 🔒 Guia de Segurança da API

## Proteções Implementadas

### 1. Autenticação por API Key
- **Obrigatória**: Todas as requisições devem incluir uma chave API válida
- **Header**: `X-API-Key` ou `Authorization: Bearer <key>`
- **Geração**: Use `/api/generate-key` para criar novas chaves
- **Revogação**: Use `/api/revoke-key/:keyId` para revogar chaves

### 2. Rate Limiting
- **Limite**: 10 requisições por IP a cada 15 minutos
- **Configurável**: Via variáveis de ambiente
- **Headers**: Inclui informações de limite nas respostas

### 3. Validação de Entrada
- **UID**: Deve ser numérico entre 8-11 dígitos
- **Quantidade**: Entre 1 e 1000
- **Sanitização**: Remove caracteres maliciosos

### 4. CORS Restritivo
- **Origens**: Apenas domínios autorizados
- **Headers**: Limitados aos necessários
- **Métodos**: Apenas GET, POST, PUT, DELETE, OPTIONS

### 5. Logging de Segurança
- **Todas as requisições** são logadas com IP e timestamp
- **Tentativas de acesso** não autorizadas são registradas
- **Performance** é monitorada

## Configuração de Produção

### Variáveis de Ambiente Obrigatórias

```bash
# Segurança (GERE NOVAS CHAVES!)
JWT_SECRET=sua_chave_jwt_super_secreta_aqui_64_caracteres_minimo
API_KEY=sua_chave_api_super_secreta_aqui_64_caracteres_minimo

# API Externa
EXTERNAL_API_URL=https://kryptorweb.com.br/api/likes
EXTERNAL_API_KEY=slaboy

# CORS (domínios permitidos)
ALLOWED_ORIGINS=https://seu-dominio.com,https://www.seu-dominio.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=10
```

### Frontend (Vite)
```bash
# Chave API para o frontend
VITE_API_KEY=sua_chave_api_aqui
```

## Como Usar a API Protegida

### 1. Obter Chave API
```bash
curl -X POST https://seu-backend.vercel.app/api/generate-key \
  -H "X-API-Key: sua_chave_master" \
  -H "Content-Type: application/json"
```

### 2. Fazer Requisição
```bash
curl -X POST https://seu-backend.vercel.app/api/send-likes \
  -H "X-API-Key: sua_chave_gerada" \
  -H "Content-Type: application/json" \
  -d '{"uid": "2003009502", "quantity": 100}'
```

### 3. Frontend (JavaScript)
```javascript
const response = await fetch('/api/send-likes', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'sua_chave_api'
  },
  body: JSON.stringify({
    uid: '2003009502',
    quantity: 100
  })
});
```

## Monitoramento

### Endpoints de Monitoramento
- `GET /api/health` - Status da API
- `GET /api/keys` - Listar chaves ativas (requer autenticação)

### Logs Importantes
- Tentativas de acesso sem chave API
- Requisições bloqueadas por CORS
- Rate limiting ativado
- Erros de validação

## Boas Práticas

1. **Nunca exponha** as chaves API no código frontend
2. **Use HTTPS** sempre em produção
3. **Monitore** os logs regularmente
4. **Revogue** chaves comprometidas imediatamente
5. **Atualize** as chaves periodicamente
6. **Configure** CORS corretamente para seu domínio

## Troubleshooting

### Erro 401: Chave API inválida
- Verifique se a chave está correta
- Confirme se está no header correto
- Verifique se a chave não foi revogada

### Erro 429: Rate limit excedido
- Aguarde o tempo de reset
- Considere aumentar o limite se necessário
- Verifique se não há múltiplas requisições simultâneas

### Erro CORS
- Verifique se seu domínio está em `ALLOWED_ORIGINS`
- Confirme se está usando HTTPS em produção
- Verifique se os headers estão corretos
