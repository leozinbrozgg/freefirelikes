const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean)
      : ['http://localhost:8080', 'http://localhost:3000', 'http://127.0.0.1:8080', 'http://localhost:5173'],
    methods: ['GET', 'POST']
  }
});
const PORT = process.env.PORT || 3001;

// Configurações de segurança
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
const API_KEY = process.env.API_KEY || crypto.randomBytes(32).toString('hex');

// Armazenamento temporário de usuários (em produção, use um banco de dados)
const users = new Map();
const apiKeys = new Map();

// Armazenamento global de histórico de likes
const globalHistory = [];
const MAX_HISTORY_ENTRIES = 1000; // Máximo de 1000 entradas no histórico global

// Função para adicionar entrada ao histórico global
const addToGlobalHistory = (entry) => {
  globalHistory.unshift(entry); // Adiciona no início
  
  // Mantém apenas os últimos MAX_HISTORY_ENTRIES registros
  if (globalHistory.length > MAX_HISTORY_ENTRIES) {
    globalHistory.splice(MAX_HISTORY_ENTRIES);
  }
  
  // Emite atualização para todos os clientes conectados
  io.emit('historyUpdate', {
    newEntry: entry,
    totalEntries: globalHistory.length
  });
};

// Função para obter estatísticas do histórico global
const getGlobalStats = () => {
  const successful = globalHistory.filter(entry => entry.success);
  const failed = globalHistory.filter(entry => !entry.success);
  const totalLikes = successful.reduce((sum, entry) => sum + entry.likesEnviados, 0);
  
  return {
    total: globalHistory.length,
    successful: successful.length,
    failed: failed.length,
    totalLikes: totalLikes
  };
};

// Configurar WebSocket
io.on('connection', (socket) => {
  console.log(`[${new Date().toISOString()}] Cliente conectado: ${socket.id}`);
  
  // Enviar histórico atual para o cliente recém-conectado
  socket.emit('initialHistory', {
    history: globalHistory.slice(0, 50), // Últimos 50 registros
    stats: getGlobalStats()
  });
  
  socket.on('disconnect', () => {
    console.log(`[${new Date().toISOString()}] Cliente desconectado: ${socket.id}`);
  });
});

// Gerar chave API inicial se não existir
if (!process.env.API_KEY) {
  console.log('🔑 Chave API gerada:', API_KEY);
  console.log('⚠️  IMPORTANTE: Salve esta chave em suas variáveis de ambiente!');
}

// Middleware de segurança
app.use(helmet());
// Configuração de CORS mais restritiva
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean)
  : ['http://localhost:8080', 'http://localhost:3000', 'http://127.0.0.1:8080', 'http://localhost:5173'];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requisições sem origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`🚫 CORS bloqueado para origem: ${origin}`);
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-API-Key'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset']
}));
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 10, // máximo 10 requests por IP
  message: {
    error: 'Muitas tentativas. Tente novamente em alguns minutos.',
    retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

// Middleware de autenticação por API Key
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  
  if (!apiKey) {
    return res.status(401).json({
      error: 'Chave API necessária. Inclua no header X-API-Key ou Authorization.'
    });
  }
  
  // Verificar se a chave API é válida
  if (apiKey !== API_KEY && !apiKeys.has(apiKey)) {
    return res.status(401).json({
      error: 'Chave API inválida.'
    });
  }
  
  next();
};

// Middleware de autenticação JWT (opcional)
const authenticateJWT = (req, res, next) => {
  const token = req.headers['authorization']?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      error: 'Token de acesso necessário.'
    });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Token inválido ou expirado.'
    });
  }
};

// Validação robusta de entrada
const validateRequest = [
  body('uid')
    .isNumeric()
    .isLength({ min: 8, max: 11 })
    .withMessage('ID do jogador deve ser numérico entre 8 e 11 dígitos'),
  body('quantity')
    .isInt({ min: 1, max: 1000 })
    .withMessage('Quantidade deve ser entre 1 e 1000'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }
    next();
  }
];

// Middleware de logging de segurança
const securityLogger = (req, res, next) => {
  const startTime = Date.now();
  const originalSend = res.send;
  
  res.send = function(data) {
    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms - IP: ${req.ip}`);
    originalSend.call(this, data);
  };
  
  next();
};

// Aplicar middleware de logging
app.use(securityLogger);

// Endpoint principal (protegido)
app.post('/api/send-likes', authenticateApiKey, validateRequest, async (req, res) => {
  try {
    const { uid, quantity } = req.body;
    
    console.log(`[${new Date().toISOString()}] Nova requisição: UID=${uid}, Qty=${quantity}, IP=${req.ip}`);
    
    // Chamar API externa
    const response = await axios.get(process.env.EXTERNAL_API_URL, {
      params: {
        uid: uid,
        quantity: quantity,
        key: process.env.EXTERNAL_API_KEY
      },
      timeout: 10000 // 10 segundos timeout
    });
    
    // Log da resposta (sem dados sensíveis)
    console.log(`[${new Date().toISOString()}] Resposta recebida para UID=${uid}`);
    
    // Adicionar ao histórico global
    const historyEntry = {
      id: crypto.randomUUID(),
      playerId: uid,
      playerNickname: response.data.PlayerNickname || 'Desconhecido',
      playerRegion: response.data.PlayerRegion || 'Desconhecido',
      quantity: quantity,
      likesAntes: response.data.Likes_Antes || 0,
      likesDepois: response.data.Likes_Depois || 0,
      likesEnviados: response.data.Likes_Enviados || 0,
      playerLevel: response.data.PlayerLevel || 0,
      playerEXP: response.data.PlayerEXP || 0,
      timestamp: Date.now(),
      success: (response.data.Likes_Enviados || 0) > 0 && 
               (response.data.Likes_Depois || 0) > (response.data.Likes_Antes || 0) &&
               Math.abs((response.data.Likes_Enviados || 0) - ((response.data.Likes_Depois || 0) - (response.data.Likes_Antes || 0))) <= 1,
      clientIP: req.ip
    };
    
    addToGlobalHistory(historyEntry);
    
    res.json(response.data);
    
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Erro na API:`, error.message);
    
    // Resposta de erro genérica (não expor detalhes internos)
    res.status(500).json({
      error: 'Erro interno do servidor. Tente novamente mais tarde.',
      retryAfter: 60
    });
  }
});

// Endpoint de saúde (público)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    security: 'enabled'
  });
});

// Endpoint para buscar histórico global (público)
app.get('/api/global-history', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    
    const history = globalHistory.slice(offset, offset + limit);
    const stats = getGlobalStats();
    
    res.json({
      history,
      stats,
      pagination: {
        total: globalHistory.length,
        limit,
        offset,
        hasMore: offset + limit < globalHistory.length
      }
    });
  } catch (error) {
    console.error('Erro ao buscar histórico global:', error);
    res.status(500).json({
      error: 'Erro ao buscar histórico'
    });
  }
});

// Endpoint para buscar estatísticas globais (público)
app.get('/api/global-stats', (req, res) => {
  try {
    const stats = getGlobalStats();
    res.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      error: 'Erro ao buscar estatísticas'
    });
  }
});

// Endpoint para gerar nova API Key (protegido)
app.post('/api/generate-key', authenticateApiKey, (req, res) => {
  try {
    const newApiKey = crypto.randomBytes(32).toString('hex');
    const keyId = crypto.randomUUID();
    
    apiKeys.set(newApiKey, {
      id: keyId,
      createdAt: new Date(),
      createdBy: req.ip,
      isActive: true
    });
    
    res.json({
      success: true,
      apiKey: newApiKey,
      keyId: keyId,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 ano
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao gerar chave API'
    });
  }
});

// Endpoint para revogar API Key
app.delete('/api/revoke-key/:keyId', authenticateApiKey, (req, res) => {
  try {
    const { keyId } = req.params;
    
    // Encontrar e revogar a chave
    for (const [key, data] of apiKeys.entries()) {
      if (data.id === keyId) {
        apiKeys.delete(key);
        return res.json({
          success: true,
          message: 'Chave API revogada com sucesso'
        });
      }
    }
    
    res.status(404).json({
      error: 'Chave API não encontrada'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao revogar chave API'
    });
  }
});

// Endpoint para listar chaves ativas (apenas para debug)
app.get('/api/keys', authenticateApiKey, (req, res) => {
  const keys = Array.from(apiKeys.entries()).map(([key, data]) => ({
    id: data.id,
    createdAt: data.createdAt,
    createdBy: data.createdBy,
    isActive: data.isActive,
    keyPreview: key.substring(0, 8) + '...'
  }));
  
  res.json({
    keys,
    total: keys.length
  });
});

// Middleware de erro global
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({
    error: 'Erro interno do servidor'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint não encontrado'
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Rate limit: ${process.env.RATE_LIMIT_MAX_REQUESTS || 10} requests por ${Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 60000)} minutos`);
  console.log(`🌐 WebSocket habilitado para atualizações em tempo real`);
  console.log(`📈 Histórico global: ${globalHistory.length} entradas`);
});
