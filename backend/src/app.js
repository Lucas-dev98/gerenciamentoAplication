const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
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

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/notices', noticeRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info('Server started', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
  console.log(`Server running on port ${PORT}`);
});
