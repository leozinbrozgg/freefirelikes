# Backend Seguro - FreeFire Likes Bot

## 🛡️ Recursos de Segurança

- **API Key protegida**: Chave da API externa não exposta no frontend
- **Rate Limiting**: Máximo 10 requests por 15 minutos por IP
- **Validação de entrada**: Validação rigorosa dos dados enviados
- **CORS configurado**: Apenas domínios autorizados podem acessar
- **Logs seguros**: Logs sem exposição de dados sensíveis
- **Helmet**: Headers de segurança HTTP

## 🚀 Como executar

### 1. Instalar dependências:
```bash
cd server
npm install
```

### 2. Configurar variáveis de ambiente:
```bash
cp env.example .env
# Edite o arquivo .env com suas configurações
```

### 3. Executar em desenvolvimento:
```bash
npm run dev
```

### 4. Executar em produção:
```bash
npm start
```

## 📋 Variáveis de Ambiente

Crie um arquivo `.env` baseado no `env.example`:

```env
PORT=3001
NODE_ENV=production
EXTERNAL_API_URL=https://kryptorweb.com.br/api/likes
EXTERNAL_API_KEY=sua_chave_aqui
JWT_SECRET=sua_chave_super_secreta
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=10
```

## 🌐 Deploy

### Heroku:
```bash
# Instalar Heroku CLI
# Fazer login
heroku login
heroku create seu-app-name
heroku config:set EXTERNAL_API_KEY=sua_chave
heroku config:set JWT_SECRET=sua_chave_secreta
git push heroku main
```

### Vercel:
```bash
# Instalar Vercel CLI
npm i -g vercel
vercel --prod
```

## 🔒 Endpoints

- `POST /api/send-likes` - Enviar likes (protegido)
- `GET /api/health` - Status do servidor

## 📊 Monitoramento

O servidor registra:
- Requisições recebidas
- Erros da API externa
- Tentativas de rate limiting
- Status de saúde
