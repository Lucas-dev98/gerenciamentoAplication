require('dotenv').config({ path: './.env' });
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware básico
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Conectar ao MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      bufferCommands: false,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
  }
};

// Rota de teste básica
app.get('/api/test', (req, res) => {
  res.json({
    status: 'success',
    message: 'Backend funcionando!',
    db: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
  });
});

// Rota de teste para projects
app.get('/api/projects', async (req, res) => {
  try {
    res.json({
      status: 'success',
      message: 'Endpoint projects funcionando',
      data: [],
    });
  } catch (error) {
    console.error('Erro em /api/projects:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno',
    });
  }
});

// Conectar ao banco e iniciar servidor
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
  });
});
