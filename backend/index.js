/**
 * EPU Backend - Main Application Entry Point
 *
 * Responsabilidade única: Configuração e inicialização da aplicação
 * - Configuração do Express
 * - Aplicação de middlewares globais
 * - Registro de rotas
 * - Inicialização do servidor
 *
 * @version 4.0.0
 * @architecture Clean Architecture - Main/Composition Root
 */

require('dotenv').config({ path: './.env' });
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const logger = require('./src/utils/logger');
const connectDB = require('./src/config/database');

// Importar middlewares
const errorHandler = require('./src/middlewares/errorHandler');
const requestIdMiddleware = require('./src/middlewares/requestId');
const { apiLimiter } = require('./src/middlewares/rateLimiter');

// Importar rotas
const authRoutes = require('./src/routes/authRoutes');
const projectRoutes = require('./src/routes/projectRoutes');
const { crudRouter } = require('./src/routes/projectRoutes');
const eventRoutes = require('./src/routes/eventRoutes');
const teamRoutes = require('./src/routes/teamRoutes');
const memberRoutes = require('./src/routes/memberRoutes');
const noticeRoutes = require('./src/routes/noticeRoutes');

// Configurações
const PORT = process.env.PORT || 3001;
const app = express();

// === MIDDLEWARE STACK ===

// Segurança básica
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// Rate limiting
app.use(apiLimiter);

// Request ID (deve vir antes de qualquer log)
app.use(requestIdMiddleware);

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Parsing de dados
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'temp/uploads')));

// Logs de requisições
app.use((req, res, next) => {
  logger.info('Request received', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    requestId: req.requestId,
  });
  next();
});

// === ROTAS ===

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '4.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Routes (todas habilitadas)
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects-crud', crudRouter); // Frontend compatibility
app.use('/api/events', eventRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/notices', noticeRoutes);

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: 'EPU Backend API',
    version: '4.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      projects: '/api/projects',
      events: '/api/events',
      teams: '/api/teams',
      members: '/api/members',
      notices: '/api/notices',
    },
  });
});

// === ERROR HANDLING ===

// 404 Handler (sem wildcard para compatibilidade)
app.use((req, res, next) => {
  // Se chegou até aqui, a rota não foi encontrada
  res.status(404).json({
    status: 'error',
    message: 'Endpoint not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
});

// Error Handler (deve ser o último middleware)
app.use(errorHandler);

// === SERVER INITIALIZATION ===

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server with database connection
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`🚀 EPU Backend Server running on port ${PORT}`, {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
      });
    });
  })
  .catch((error) => {
    logger.error('Failed to start server:', error);
    // Ainda assim inicia o servidor (modo degradado)
    app.listen(PORT, () => {
      logger.info(
        `🚀 EPU Backend Server running on port ${PORT} (degraded mode)`,
        {
          port: PORT,
          environment: process.env.NODE_ENV || 'development',
          timestamp: new Date().toISOString(),
        }
      );
    });
  });

// Export para testes
module.exports = app;
