# 🔥 Histórico Global de Likes - Free Fire

## ✨ Funcionalidades Implementadas

### 🌐 Histórico Global em Tempo Real
- **Visibilidade para todos**: Todos os usuários veem o histórico de likes enviados por qualquer pessoa
- **Atualizações em tempo real**: WebSocket conecta todos os clientes para receber atualizações instantâneas
- **Estatísticas globais**: Contadores de total, sucessos, falhas e likes enviados

### 🚀 Tecnologias Utilizadas
- **Backend**: Node.js + Express + Socket.IO
- **Frontend**: React + TypeScript + Socket.IO Client
- **Tempo Real**: WebSocket para comunicação bidirecional
- **Armazenamento**: Memória (pode ser migrado para banco de dados)

## 🛠️ Como Funciona

### 1. Servidor (Backend)
- Armazena histórico global em memória (máximo 1000 entradas)
- WebSocket emite atualizações para todos os clientes conectados
- APIs REST para buscar histórico e estatísticas
- Salva automaticamente cada envio de likes no histórico global

### 2. Cliente (Frontend)
- Conecta automaticamente ao WebSocket
- Recebe histórico inicial ao conectar
- Atualiza em tempo real quando novos likes são enviados
- Fallback para API REST se WebSocket falhar

## 📊 Endpoints da API

### GET `/api/global-history`
Busca histórico global com paginação
```json
{
  "history": [...],
  "stats": {
    "total": 150,
    "successful": 120,
    "failed": 30,
    "totalLikes": 5000
  },
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

### GET `/api/global-stats`
Busca apenas estatísticas globais
```json
{
  "total": 150,
  "successful": 120,
  "failed": 30,
  "totalLikes": 5000
}
```

## 🔌 Eventos WebSocket

### `initialHistory`
Enviado quando cliente conecta
```json
{
  "history": [...],
  "stats": {...}
}
```

### `historyUpdate`
Enviado quando novo like é enviado
```json
{
  "newEntry": {...},
  "totalEntries": 151
}
```

## 🚀 Como Executar

### 1. Instalar Dependências
```bash
# Frontend
npm install

# Backend
cd server
npm install
```

### 2. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto:
```env
VITE_SERVER_URL=http://localhost:3001
```

### 3. Executar Servidor
```bash
cd server
npm start
```

### 4. Executar Frontend
```bash
npm run dev
```

## 📱 Interface do Usuário

### Indicadores de Status
- 🟢 **Conectado**: WebSocket ativo, recebendo atualizações em tempo real
- 🔴 **Desconectado**: Usando API REST como fallback
- 🔄 **Atualizando**: Carregando dados

### Informações Exibidas
- **Nickname do jogador** e região
- **ID do jogador** (Free Fire)
- **Likes antes/depois** do envio
- **Quantidade enviada** com sucesso
- **Nível do jogador**
- **Timestamp** (há quanto tempo foi enviado)
- **Status** (sucesso ou limite atingido)

## 🔧 Configurações Avançadas

### Limite de Histórico
No servidor (`server.js`):
```javascript
const MAX_HISTORY_ENTRIES = 1000; // Ajustar conforme necessário
```

### Entradas Exibidas
No componente (`GlobalLikeHistory.tsx`):
```typescript
<GlobalLikeHistory maxEntries={100} />
```

### Timeout WebSocket
No serviço (`globalHistoryService.ts`):
```typescript
this.socket = io(this.serverUrl, {
  timeout: 20000, // 20 segundos
});
```

## 🎯 Próximos Passos

1. **Banco de Dados**: Migrar de memória para PostgreSQL/MongoDB
2. **Persistência**: Salvar histórico permanentemente
3. **Filtros**: Adicionar filtros por região, nível, etc.
4. **Notificações**: Push notifications para novos likes
5. **Analytics**: Gráficos e métricas avançadas

## 🐛 Troubleshooting

### WebSocket não conecta
- Verificar se servidor está rodando na porta 3001
- Verificar CORS no servidor
- Verificar firewall/proxy

### Histórico não atualiza
- Verificar console do navegador para erros
- Verificar conexão WebSocket
- Usar botão "Atualizar" como fallback

### Performance
- Reduzir `maxEntries` se necessário
- Implementar paginação no frontend
- Usar virtualização para listas grandes
