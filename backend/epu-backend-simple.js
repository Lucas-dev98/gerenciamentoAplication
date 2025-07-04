require('dotenv').config({ path: './.env' });
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const validator = require('validator');

const app = express();
const PORT = process.env.PORT || 3001;

// Importar rotas de autenticação
const authRoutes = require('./src/routes/authRoutes');
const authMiddleware = require('./src/middlewares/authMiddleware');

// Importar rotas de eventos
const eventRoutes = require('./src/routes/eventRoutes');

// Importar rotas de equipes
const teamRoutes = require('./src/routes/teamRoutes');

// Importar rotas de membros
const memberRoutes = require('./src/routes/memberRoutes');

// Importar rotas de usuários
const userRoutes = require('./src/routes/userRoutes');

// Importar rotas de organograma
const organogramRoutes = require('./src/routes/organogramRoutes');

// Importar rotas de projeto
const projectRoutes = require('./src/routes/projectRoutes');

// Middleware de segurança
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

// Rate limiting global
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // máximo 1000 requisições por IP por janela
  message: {
    error: 'Muitas requisições deste IP, tente novamente em 15 minutos.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
});

app.use(globalLimiter);

// Middleware para parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de sanitização
app.use((req, res, next) => {
  const sanitizeObject = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = validator.escape(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };

  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);

  next();
});

// Middleware para CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Configuração do multer para upload
const uploadDir = path.join(__dirname, 'temp');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Configurar rotas de autenticação
app.use('/api/auth', authRoutes);

// Configurar rotas de eventos
app.use('/api/events', eventRoutes);

// Configurar rotas de equipes
app.use('/api/teams', teamRoutes);

// Configurar rotas de membros
app.use('/api/members', memberRoutes);

// Configurar rotas de usuários
app.use('/api/users', userRoutes);

// Configurar rotas de organograma
app.use('/api/organogram', organogramRoutes);

// Configurar rotas de projeto
app.use('/api/projects', projectRoutes);

// Importar modelos
const Team = require('./src/models/teamModels');
const Project = require('./src/models/projectModels');
const Event = require('./src/models/Event');
const Member = require('./src/models/memberModels');
const User = require('./src/models/userModels');

// Conectar ao MongoDB
const connectDB = async () => {
  try {
    console.log('🔗 Tentando conectar ao MongoDB...');
    console.log(
      `📍 URI: ${process.env.DB_URI ? 'Configurada' : 'NÃO CONFIGURADA'}`
    );

    await mongoose.connect(process.env.DB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      bufferCommands: false,
    });

    console.log('✅ MongoDB connected successfully');
    console.log(`🗄️ Database: ${mongoose.connection.db.databaseName}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    return true;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.log('⚠️ Servidor continuará rodando sem banco de dados...');
    return false;
  }
};

// Middleware de tratamento de erros
const errorHandler = (err, req, res, next) => {
  console.error('❌ Error caught by middleware:', err.message);
  console.error('Stack:', err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: err.message,
      details: err.errors,
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'Cast Error',
      message: 'Invalid ID format',
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      error: 'Duplicate Entry',
      message: 'This record already exists',
    });
  }

  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: 'Something went wrong on our end',
  });
};

// Rotas básicas de projeto (necessárias para o organograma)
app.post('/api/projects/with-teams', authMiddleware, async (req, res) => {
  try {
    const { name, description, status, priority, teams, mainTeam } = req.body;

    const projectData = {
      name: name.trim(),
      description: description?.trim(),
      status: status || 'active',
      priority: priority || 'medium',
      owner: req.user?.id || '60d5ecb54b24a03d1c8b4567',
      teams: teams || [],
      mainTeam: mainTeam || null,
    };

    const project = await Project.create(projectData);

    if (teams && teams.length > 0) {
      await Team.updateMany(
        { _id: { $in: teams } },
        { $addToSet: { projects: project._id } }
      );
    }

    const populatedProject = await Project.findById(project._id)
      .populate('teams', 'name description department')
      .populate('mainTeam', 'name description department')
      .populate('owner', 'username email fullName');

    res.status(201).json({
      success: true,
      message: 'Projeto criado com sucesso',
      data: populatedProject,
    });
  } catch (error) {
    console.error('Erro ao criar projeto:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar projeto',
      error: error.message,
    });
  }
});

app.get('/api/projects/:id/full-details', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id)
      .populate({
        path: 'teams',
        populate: {
          path: 'members',
          populate: {
            path: 'user',
            select: 'username email fullName',
          },
        },
      })
      .populate('mainTeam', 'name description department')
      .populate('owner', 'username email fullName');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado',
      });
    }

    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error('Erro ao buscar projeto:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar projeto',
      error: error.message,
    });
  }
});

// Usar middleware de tratamento de erros
app.use(errorHandler);

// Função para iniciar o servidor
const startServer = async () => {
  try {
    console.log('🚀 Iniciando servidor EPU-Gestão...');

    // Conectar ao banco de dados
    await connectDB();

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`✅ Servidor rodando na porta ${PORT}`);
      console.log(`🌐 http://localhost:${PORT}`);
      console.log('🎯 Sistema EPU-Gestão pronto para uso!');
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

// Iniciar o servidor
startServer();

module.exports = app;
