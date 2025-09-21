# 🔥 FreeFire Likes Bot - Sistema Seguro

Sistema completo para envio de likes no FreeFire com API protegida e interface moderna.

## 🚀 Funcionalidades

- ✅ Interface moderna e responsiva
- ✅ API completamente protegida com autenticação
- ✅ Rate limiting para prevenir abuso
- ✅ Validação robusta de dados
- ✅ CORS configurado adequadamente
- ✅ Logging de segurança
- ✅ Deploy automático no Vercel

## 🔒 Segurança Implementada

### Proteções da API
- **Autenticação obrigatória** por API Key
- **Rate limiting** (10 req/15min por IP)
- **Validação rigorosa** de entrada
- **CORS restritivo** apenas para domínios autorizados
- **Logging completo** de todas as requisições
- **Headers de segurança** com Helmet.js

### Como Funciona
1. Frontend envia requisição com chave API
2. Backend valida chave e dados
3. Backend chama API externa de forma segura
4. Resposta é retornada ao frontend

## 🛠️ Tecnologias

### Frontend
- **React** + **TypeScript**
- **Vite** para build rápido
- **Tailwind CSS** + **shadcn/ui** para UI
- **Axios** para requisições HTTP

### Backend
- **Node.js** + **Express**
- **JWT** para autenticação
- **bcryptjs** para hash de senhas
- **express-rate-limit** para rate limiting
- **helmet** para headers de segurança
- **cors** para controle de origem

## 📦 Instalação e Desenvolvimento

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Instalação
```bash
# Clone o repositório
git clone <seu-repositorio>
cd ff-likes-bot

# Instale dependências do frontend
npm install

# Instale dependências do backend
cd server
npm install
cd ..

# Configure variáveis de ambiente
cp server/env.example server/.env
# Edite server/.env com suas configurações
```

### Desenvolvimento
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
cd server
npm run dev
```

## 🚀 Deploy no Vercel

### 1. Configuração do Projeto
```bash
# Instale o Vercel CLI
npm i -g vercel

# Faça login
vercel login

# Configure o projeto
vercel
```

### 2. Variáveis de Ambiente
Configure no painel do Vercel:

```bash
# Segurança (GERE NOVAS CHAVES!)
JWT_SECRET=sua_chave_jwt_super_secreta_aqui_64_caracteres_minimo
API_KEY=sua_chave_api_super_secreta_aqui_64_caracteres_minimo

# API Externa
EXTERNAL_API_URL=https://kryptorweb.com.br/api/likes
EXTERNAL_API_KEY=slaboy

# CORS (seu domínio)
ALLOWED_ORIGINS=https://seu-dominio.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=10

# Frontend
VITE_API_KEY=sua_chave_api_aqui
```

### 3. Deploy
```bash
# Deploy automático
git push origin main

# Ou deploy manual
vercel --prod
```

## 🔧 Configuração de Produção

### 1. Gere Chaves Seguras
```bash
# JWT Secret (64+ caracteres)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# API Key (32+ caracteres)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Configure CORS
No arquivo `server/.env`:
```bash
ALLOWED_ORIGINS=https://seu-dominio.vercel.app,https://www.seu-dominio.vercel.app
```

### 3. Teste as Proteções
```bash
# Execute o script de teste
node test-security.js
```

## 📚 Uso da API

### Obter Nova Chave API
```bash
curl -X POST https://seu-backend.vercel.app/api/generate-key \
  -H "X-API-Key: sua_chave_master" \
  -H "Content-Type: application/json"
```

### Enviar Likes
```bash
curl -X POST https://seu-backend.vercel.app/api/send-likes \
  -H "X-API-Key: sua_chave_gerada" \
  -H "Content-Type: application/json" \
  -d '{"uid": "2003009502", "quantity": 100}'
```

### Frontend (JavaScript)
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

## 🔍 Monitoramento

### Endpoints de Status
- `GET /api/health` - Status da API
- `GET /api/keys` - Listar chaves ativas

### Logs Importantes
- Tentativas de acesso sem autenticação
- Requisições bloqueadas por CORS
- Rate limiting ativado
- Erros de validação

## 🛡️ Boas Práticas de Segurança

1. **Nunca exponha** chaves API no código frontend
2. **Use HTTPS** sempre em produção
3. **Monitore** os logs regularmente
4. **Revogue** chaves comprometidas imediatamente
5. **Atualize** as chaves periodicamente
6. **Configure** CORS apenas para seus domínios

## 📖 Documentação Completa

Consulte o arquivo [SECURITY.md](./SECURITY.md) para documentação detalhada de segurança.

## 🐛 Troubleshooting

### Erro 401: Chave API inválida
- Verifique se a chave está correta
- Confirme se está no header `X-API-Key`
- Verifique se a chave não foi revogada

### Erro 429: Rate limit excedido
- Aguarde o tempo de reset (15 minutos)
- Considere aumentar o limite se necessário

### Erro CORS
- Verifique se seu domínio está em `ALLOWED_ORIGINS`
- Confirme se está usando HTTPS em produção

## 📄 Licença

Este projeto é para uso educacional. Use com responsabilidade.
