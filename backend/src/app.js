const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const eventRoutes = require('./routes/eventRoutes');
const teamRoutes = require('./routes/teamRoutes');
const memberRoutes = require('./routes/memberRoutes');
const errorHandler = require('./middlewares/errorHandler');
const requestIdMiddleware = require('./middlewares/requestId');
const logger = require('./utils/logger');

dotenv.config({ path: path.join(__dirname, '.env') });
const app = express();

// Conectar ao banco de dados
connectDB();

// Request ID middleware (deve vir antes de qualquer log)
app.use(requestIdMiddleware);

// CORS middleware
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

// Request logging middleware
app.use((req, res, next) => {
  logger.http('HTTP Request', {
    method: req.method || 'UNKNOWN',
    url: req.url || 'UNKNOWN',
    ip: req.ip || req.connection?.remoteAddress || 'UNKNOWN',
    userAgent: req.get('User-Agent') || 'UNKNOWN',
    requestId: req.id || 'NO_ID',
    timestamp: req.timestamp || new Date().toISOString(),
  });
  next();
});

app.use(express.json());

// Health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    requestId: req.id,
  });
});

// Database health check route
app.get('/api/health/db', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const dbStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  if (dbStatus === 1) {
    res.json({
      status: 'OK',
      message: 'Database connection is healthy',
      database: {
        status: dbStates[dbStatus],
        name: mongoose.connection.db?.databaseName || 'unknown',
        host: mongoose.connection.host || 'unknown',
      },
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  } else {
    res.status(503).json({
      status: 'ERROR',
      message: 'Database connection is not healthy',
      database: {
        status: dbStates[dbStatus] || 'unknown',
        name: mongoose.connection.db?.databaseName || 'unknown',
        host: mongoose.connection.host || 'unknown',
      },
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  }
});

// Database health check route
app.get('/health/database', async (req, res) => {
  try {
    const state = mongoose.connection.readyState;
    let dbStatus = 'unknown';

    switch (state) {
      case 0:
        dbStatus = 'disconnected';
        break;
      case 1:
        dbStatus = 'connected';
        break;
      case 2:
        dbStatus = 'connecting';
        break;
      case 3:
        dbStatus = 'disconnecting';
        break;
    }

    res.json({
      status: 'OK',
      database: {
        state: dbStatus,
        timestamp: new Date().toISOString(),
      },
      requestId: req.id,
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Database health check failed',
      error: error.message,
      requestId: req.id,
    });
  }
});

// Token verification endpoint
app.get(
  '/api/auth/verify',
  require('./middlewares/authMiddleware'),
  (req, res) => {
    res.json({
      status: 'OK',
      message: 'Token is valid',
      user: {
        id: req.user?.id,
        email: req.user?.email,
        role: req.user?.role,
      },
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  }
);

// Rota de teste simples
app.get('/api/test', (req, res) => {
  console.log('=== TESTE SIMPLES FUNCIONANDO ===');
  res.json({ message: 'Teste funcionando' });
});

// Endpoints temporários para teste (ANTES de todas as outras rotas)
const {
  getProcedimentoParada,
  getManutencao,
  getProcedimentoPartida,
  getAllFrentes,
  getProjectStatistics,
} = require('./controllers/projectController');

app.get('/api/projects/:id/procedimento-parada', (req, res, next) => {
  console.log('=== ENDPOINT PROCEDIMENTO-PARADA CHAMADO ===');
  getProcedimentoParada(req, res, next);
});
app.get('/api/projects/:id/manutencao', getManutencao);
app.get('/api/projects/:id/procedimento-partida', getProcedimentoPartida);
app.get('/api/projects/:id/frentes', getAllFrentes);
app.get('/api/projects/:id/statistics', getProjectStatistics);

// API routes
console.log('🔗 Registering API routes...');

app.use('/api/auth', authRoutes);
console.log('✅ Auth routes registered');

app.use('/api/projects', projectRoutes);
console.log('✅ Project routes registered');
app.use('/api/notices', noticeRoutes);
console.log('✅ Notice routes registered');
app.use('/api/events', eventRoutes);
console.log('✅ Event routes registered');
app.use('/api/teams', teamRoutes);
console.log('✅ Team routes registered');
app.use('/api/members', memberRoutes);
console.log('✅ Member routes registered');

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info('Server started', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
  console.log(`Server running on port ${PORT}`);
});
