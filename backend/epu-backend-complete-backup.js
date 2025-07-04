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
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(globalLimiter);

// Middleware básico com proteções
app.use(express.json({ limit: '10mb' })); // Limite de tamanho do payload
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware customizado para sanitização
app.use((req, res, next) => {
  // Sanitizar query parameters
  if (req.query) {
    for (const [key, value] of Object.entries(req.query)) {
      if (typeof value === 'string') {
        // Remover caracteres MongoDB perigosos
        req.query[key] = value.replace(/[{}$]/g, '');
      }
    }
  }

  // Sanitizar body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  next();
});

// Função para sanitizar objetos recursivamente
function sanitizeObject(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      // Remover caracteres MongoDB perigosos e escapar HTML
      sanitized[key] = value.replace(/[{}$]/g, '');
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

// CORS mais seguro
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }

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

// Schema do evento
const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Nome do evento é obrigatório'],
      trim: true,
      maxlength: [100, 'Nome do evento deve ter no máximo 100 caracteres'],
    },
    eventType: {
      type: String,
      required: [true, 'Tipo do evento é obrigatório'],
      enum: {
        values: [
          'reuniao',
          'treinamento',
          'manutencao',
          'inspecao',
          'auditoria',
          'emergencia',
          'outro',
        ],
        message:
          'Tipo de evento deve ser: reuniao, treinamento, manutencao, inspecao, auditoria, emergencia ou outro',
      },
    },
    date: {
      type: Date,
      required: [true, 'Data do evento é obrigatória'],
    },
    time: {
      type: String,
      required: [true, 'Hora do evento é obrigatória'],
      match: [
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        'Formato de hora inválido (HH:mm)',
      ],
    },
    location: {
      type: String,
      required: [true, 'Local do evento é obrigatório'],
      trim: true,
      maxlength: [200, 'Local deve ter no máximo 200 caracteres'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Descrição deve ter no máximo 500 caracteres'],
    },
    observations: {
      type: String,
      trim: true,
      maxlength: [1000, 'Observações devem ter no máximo 1000 caracteres'],
    },
    status: {
      type: String,
      enum: {
        values: ['agendado', 'em_andamento', 'concluido', 'cancelado'],
        message:
          'Status deve ser: agendado, em_andamento, concluido ou cancelado',
      },
      default: 'agendado',
    },
    priority: {
      type: String,
      enum: {
        values: ['baixa', 'media', 'alta', 'critica'],
        message: 'Prioridade deve ser: baixa, media, alta ou critica',
      },
      default: 'media',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    attachments: [
      {
        filename: String,
        path: String,
        size: Number,
        mimetype: String,
      },
    ],
    reminders: [
      {
        type: {
          type: String,
          enum: ['email', 'sms', 'push'],
          default: 'email',
        },
        time: {
          type: Number, // minutos antes do evento
          default: 30,
        },
        sent: {
          type: Boolean,
          default: false,
        },
      },
    ],
    recurrence: {
      type: {
        type: String,
        enum: ['diaria', 'semanal', 'mensal', 'anual'],
      },
      interval: {
        type: Number,
        default: 1,
      },
      endDate: Date,
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    collection: 'events',
    timestamps: true,
  }
);

// Índices para melhor performance
eventSchema.index({ date: 1, time: 1 });
eventSchema.index({ eventType: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ createdBy: 1 });
eventSchema.index({ project: 1 });

// Métodos virtuais
eventSchema.virtual('dateTimeFormatted').get(function () {
  return `${this.date.toLocaleDateString('pt-BR')} às ${this.time}`;
});

eventSchema.virtual('isToday').get(function () {
  const today = new Date();
  return this.date.toDateString() === today.toDateString();
});

eventSchema.virtual('isPast').get(function () {
  const now = new Date();
  const eventDateTime = new Date(this.date);
  const [hours, minutes] = this.time.split(':');
  eventDateTime.setHours(parseInt(hours), parseInt(minutes));
  return eventDateTime < now;
});

// Schema do aviso
const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Título do aviso é obrigatório'],
      trim: true,
      minlength: [5, 'Título deve ter pelo menos 5 caracteres'],
      maxlength: [200, 'Título deve ter no máximo 200 caracteres'],
    },
    content: {
      type: String,
      required: [true, 'Conteúdo do aviso é obrigatório'],
      trim: true,
      minlength: [10, 'Conteúdo deve ter pelo menos 10 caracteres'],
      maxlength: [2000, 'Conteúdo deve ter no máximo 2000 caracteres'],
    },
    type: {
      type: String,
      enum: {
        values: ['info', 'warning', 'urgent', 'announcement', 'maintenance'],
        message:
          'Tipo deve ser: info, warning, urgent, announcement ou maintenance',
      },
      default: 'info',
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high', 'critical'],
        message: 'Prioridade deve ser: low, medium, high ou critical',
      },
      default: 'medium',
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetAudience: {
      type: String,
      enum: {
        values: ['all', 'students', 'teachers', 'staff', 'admins'],
        message:
          'Público-alvo deve ser: all, students, teachers, staff ou admins',
      },
      default: 'all',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    publishDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      validate: {
        validator: function (value) {
          return !value || value > this.publishDate;
        },
        message: 'Data de expiração deve ser posterior à data de publicação',
      },
    },
    views: {
      type: Number,
      default: 0,
      min: [0, 'Número de visualizações não pode ser negativo'],
    },
    attachments: [
      {
        filename: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        fileType: {
          type: String,
          required: true,
        },
        fileSize: {
          type: Number,
          required: true,
          min: [0, 'Tamanho do arquivo não pode ser negativo'],
        },
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
        maxlength: [50, 'Tag deve ter no máximo 50 caracteres'],
      },
    ],
    readBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    collection: 'notices',
    timestamps: true,
  }
);

// Índices para melhor performance
noticeSchema.index({ isActive: 1, publishDate: -1 });
noticeSchema.index({ type: 1 });
noticeSchema.index({ priority: 1 });
noticeSchema.index({ author: 1 });
noticeSchema.index({ targetAudience: 1 });
noticeSchema.index({ isPinned: 1 });
noticeSchema.index({ expiryDate: 1 });
noticeSchema.index({ tags: 1 });

// Virtual para verificar se o aviso expirou
noticeSchema.virtual('isExpired').get(function () {
  return this.expiryDate && this.expiryDate < new Date();
});

// Virtual para calcular dias restantes até expirar
noticeSchema.virtual('daysUntilExpiry').get(function () {
  if (!this.expiryDate) return null;
  const diff = this.expiryDate - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Virtual para verificar se está ativo e não expirado
noticeSchema.virtual('isDisplayable').get(function () {
  return this.isActive && !this.isExpired;
});

// Método para incrementar visualizações
noticeSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save();
};

// Método para marcar como lido por um usuário
noticeSchema.methods.markAsReadBy = function (userId) {
  const alreadyRead = this.readBy.some(
    (read) => read.user.toString() === userId.toString()
  );
  if (!alreadyRead) {
    this.readBy.push({ user: userId, readAt: new Date() });
    return this.save();
  }
  return Promise.resolve(this);
};

// Importar modelos
const Team = require('./src/models/teamModels');
const Project = require('./src/models/projectModels');
const Event = require('./src/models/Event');

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

// Função para processar dados CSV
const processCSVData = (csvContent, activityType) => {
  const lines = csvContent.split('\n');
  const activities = [];

  // Processar cada linha (pular cabeçalho)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Os CSVs têm formato: name,value,baseline,sub_activities
    const parts = line.split(',');
    if (parts.length >= 4) {
      const name = parts[0];
      const value = parts[1];
      const baseline = parts[2];
      const subActivitiesRaw = parts.slice(3).join(','); // Reagrupar sub_activities que podem ter vírgulas

      // Processar sub-atividades
      const subActivities = [];
      if (subActivitiesRaw) {
        const subParts = subActivitiesRaw.split(';');
        for (const sub of subParts) {
          const trimmed = sub.trim();
          if (trimmed) {
            const [subName, values] = trimmed.split(':');
            if (subName && values) {
              const [real, planejado] = values.split('|');
              subActivities.push({
                name: subName.trim(),
                progress: parseFloat(real?.replace(',', '.')) || 0,
                baseline: parseFloat(planejado?.replace(',', '.')) || 0,
              });
            }
          }
        }
      }

      activities.push({
        name: name.trim(),
        type: activityType,
        progress: parseFloat(value?.replace(',', '.')) || 0,
        baseline: parseFloat(baseline?.replace(',', '.')) || 0,
        subActivities: subActivities,
        order: activities.length,
      });
    }
  }

  return activities;
};

// Rotas
app.get('/api/test', (req, res) => {
  res.json({
    status: 'success',
    message: 'EPU-Gestão Backend funcionando!',
    db: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/projects', authMiddleware, async (req, res) => {
  try {
    console.log('📋 Buscando projetos...');
    console.log(
      `🔗 Status da conexão: ${mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado'}`
    );

    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️ MongoDB desconectado, retornando dados mockados');
      return res.json({
        status: 'success',
        data: [
          {
            id: '6864447b916b6c03fbe1b260',
            name: 'Projeto EPU - Dados Completos',
            description: 'Projeto com dados dos CSVs (modo offline)',
            status: 'active',
            progress: 41,
            createdAt: new Date(),
            totalActivities: 32,
            csvImport: true,
          },
        ],
      });
    }

    const projects = await Project.find({}).select(
      'name description status progress createdAt metadata'
    );

    console.log(`✅ ${projects.length} projetos encontrados`);

    res.json({
      status: 'success',
      data: projects.map((p) => ({
        id: p._id,
        name: p.name,
        description: p.description,
        status: p.status,
        progress: p.progress,
        createdAt: p.createdAt,
        totalActivities: p.metadata?.statistics?.totalActivities || 0,
        csvImport: p.metadata?.csvImport || false,
      })),
    });
  } catch (error) {
    console.error('❌ Erro ao buscar projetos:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao buscar projetos',
      details: error.message,
    });
  }
});

// Rota para obter projeto específico
app.get('/api/projects/:id', authMiddleware, async (req, res) => {
  try {
    console.log(`📄 Buscando projeto: ${req.params.id}`);

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        status: 'error',
        message: 'Banco de dados não conectado',
      });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        status: 'error',
        message: 'Projeto não encontrado',
      });
    }

    console.log(`✅ Projeto encontrado: ${project.name}`);

    res.json({
      status: 'success',
      data: {
        project: {
          _id: project._id,
          name: project.name,
          description: project.description,
          status: project.status,
          priority: project.priority,
          progress: project.progress,
          budget: project.budget,
          startDate: project.startDate,
          endDate: project.endDate,
          owner: project.owner,
          team: project.team,
          tags: project.tags,
          activities: project.activities,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
          metadata: project.metadata,
        },
      },
    });
  } catch (error) {
    console.error('❌ Erro ao buscar projeto:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao buscar projeto',
      details: error.message,
    });
  }
});

// Rota para obter estatísticas dos projetos
app.get('/api/projects/stats', authMiddleware, async (req, res) => {
  try {
    console.log('📊 Buscando estatísticas dos projetos...');

    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️ MongoDB desconectado, retornando estatísticas mockadas');
      return res.json({
        success: true,
        data: {
          total: 5,
          byStatus: {
            active: 3,
            completed: 1,
            'on-hold': 1,
            draft: 0,
          },
          byPriority: {
            urgent: 1,
            high: 2,
            medium: 2,
            low: 0,
          },
          averageProgress: 65,
          totalBudget: 250000,
          recentActivity: 12,
        },
      });
    }

    const projects = await Project.find({});

    // Calcular estatísticas
    const total = projects.length;
    const byStatus = {};
    const byPriority = {};
    let totalProgress = 0;
    let totalBudget = 0;

    projects.forEach((project) => {
      // Contar por status
      byStatus[project.status] = (byStatus[project.status] || 0) + 1;

      // Contar por prioridade
      byPriority[project.priority] = (byPriority[project.priority] || 0) + 1;

      // Somar progresso
      totalProgress += project.progress || 0;

      // Somar orçamento
      totalBudget += project.budget || 0;
    });

    const averageProgress = total > 0 ? totalProgress / total : 0;
    const recentActivity = projects.filter((p) => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      return p.updatedAt > threeDaysAgo;
    }).length;

    const stats = {
      total,
      byStatus,
      byPriority,
      averageProgress: Math.round(averageProgress),
      totalBudget,
      recentActivity,
    };

    console.log('✅ Estatísticas calculadas:', stats);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas',
      details: error.message,
    });
  }
});

app.post(
  '/api/projects/upload-csv',
  authMiddleware,
  upload.single('csvFile'),
  async (req, res) => {
    try {
      console.log('📁 Upload CSV iniciado');

      if (!req.file) {
        return res.status(400).json({
          status: 'error',
          message: 'Nenhum arquivo foi enviado',
        });
      }

      const { projectName } = req.body;
      const fileName = req.file.originalname.toLowerCase();

      console.log(`📄 Processando arquivo: ${req.file.originalname}`);
      console.log(
        `📝 Nome do projeto: ${projectName || 'Gerado automaticamente'}`
      );

      // Ler conteúdo do arquivo
      const csvContent = fs.readFileSync(req.file.path, 'utf8');

      // Determinar tipo baseado no nome do arquivo
      let activityType = 'partida';
      if (fileName.includes('parada')) {
        activityType = 'parada';
      } else if (fileName.includes('manutencao')) {
        activityType = 'manutencao';
      }

      console.log(`📊 Tipo de atividade detectado: ${activityType}`);

      // Processar dados CSV
      const activities = processCSVData(csvContent, activityType);

      console.log(`✅ ${activities.length} atividades processadas`);

      // Calcular estatísticas
      const totalActivities = activities.length;
      const totalProgress = activities.reduce(
        (sum, act) => sum + act.progress,
        0
      );
      const averageProgress =
        totalActivities > 0 ? totalProgress / totalActivities : 0;
      const completedActivities = activities.filter(
        (act) => act.progress >= 100
      ).length;

      // Criar projeto
      const projectData = {
        name: projectName || req.file.originalname.replace('.csv', ''),
        description: `Projeto criado a partir do arquivo ${req.file.originalname}`,
        status: 'active',
        priority: 'medium',
        progress: Math.round(averageProgress),
        activities: activities,
        metadata: {
          csvImport: true,
          processedAt: new Date(),
          statistics: {
            totalActivities,
            completedActivities,
            averageProgress: Math.round(averageProgress * 100) / 100,
          },
        },
      };

      const project = await Project.create(projectData);

      // Limpar arquivo temporário
      fs.unlinkSync(req.file.path);

      console.log(`🎉 Projeto criado com sucesso: ${project._id}`);

      res.status(201).json({
        status: 'success',
        message: 'Projeto criado com sucesso',
        data: {
          project: {
            id: project._id,
            name: project.name,
            description: project.description,
            status: project.status,
            progress: project.progress,
            createdAt: project.createdAt,
            totalActivities,
            type: activityType,
          },
        },
      });
    } catch (error) {
      console.error('❌ Erro no upload CSV:', error);

      // Limpar arquivo temporário em caso de erro
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (cleanupError) {
          console.error('Erro ao limpar arquivo temporário:', cleanupError);
        }
      }

      res.status(500).json({
        status: 'error',
        message: 'Erro no processamento do CSV',
        details: error.message,
      });
    }
  }
);

// Endpoints para buscar dados específicos do projeto
app.get(
  '/api/projects/:id/procedimento-parada',
  authMiddleware,
  async (req, res) => {
    try {
      console.log(
        `📋 Buscando procedimento-parada para projeto: ${req.params.id}`
      );

      // Se offline, retornar dados mockados
      if (
        mongoose.connection.readyState !== 1 ||
        req.params.id === '6864447b916b6c03fbe1b260'
      ) {
        const mockData = [
          {
            name: 'Pátio de Alimentação',
            type: 'parada',
            progress: 100.01,
            baseline: 100.01,
            subActivities: [
              {
                name: 'Cortar Produção do Pátio de Finos Parar Pátio Vazio',
                progress: 100,
                baseline: 100,
              },
              {
                name: 'Esvaziar e Limpar Chutes do Circuito de Alimentação',
                progress: 100,
                baseline: 100,
              },
              {
                name: 'Posicionar Emenda das Correias Conforme Necessidade',
                progress: 100,
                baseline: 100,
              },
              {
                name: 'Realizar Bloqueio do Circuito do Pátio de Finos',
                progress: 100,
                baseline: 100,
              },
            ],
            order: 0,
          },
          {
            name: 'Secagem',
            type: 'parada',
            progress: 100,
            baseline: 100,
            subActivities: [
              {
                name: 'Desligar e Resfriar Queimadores 1SM6GG',
                progress: 100,
                baseline: 100,
              },
              {
                name: 'Realizar Purga do Gás do Queimador',
                progress: 100,
                baseline: 100,
              },
              {
                name: 'Realizar Bloqueio da Secagem',
                progress: 100,
                baseline: 100,
              },
            ],
            order: 1,
          },
        ];
        return res.json({ status: 'success', data: mockData });
      }

      const project = await Project.findById(req.params.id);
      if (!project) {
        return res
          .status(404)
          .json({ status: 'error', message: 'Projeto não encontrado' });
      }

      const data = project.activities.filter((act) => act.type === 'parada');
      res.json({ status: 'success', data });
    } catch (error) {
      console.error('❌ Erro em procedimento-parada:', error.message);
      res.status(500).json({
        status: 'error',
        message: 'Erro interno',
        details: error.message,
      });
    }
  }
);

app.get('/api/projects/:id/manutencao', authMiddleware, async (req, res) => {
  try {
    console.log(`🔧 Buscando manutenção para projeto: ${req.params.id}`);

    // Se offline, retornar dados mockados
    if (
      mongoose.connection.readyState !== 1 ||
      req.params.id === '6864447b916b6c03fbe1b260'
    ) {
      const mockData = [
        {
          name: 'Pátio de Alimentação',
          type: 'manutencao',
          progress: 98.84,
          baseline: 100,
          subActivities: [
            {
              name: 'IE - Pátio de Alimentação',
              progress: 97.68,
              baseline: 100,
            },
            {
              name: 'Manutenção PQ - Pátio de Alimentação',
              progress: 100,
              baseline: 100,
            },
          ],
          order: 0,
        },
        {
          name: 'Forno',
          type: 'manutencao',
          progress: 97.19,
          baseline: 99.99,
          subActivities: [
            {
              name: 'Manutenção do Meio do Forno',
              progress: 99.63,
              baseline: 100,
            },
            {
              name: 'Substituição Viga do Quadro Móvel da Roda Abaixamento',
              progress: 100,
              baseline: 100,
            },
            {
              name: 'Manutenção Região do Levantamento AH1',
              progress: 89.36,
              baseline: 99.98,
            },
          ],
          order: 1,
        },
      ];
      return res.json({ status: 'success', data: mockData });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res
        .status(404)
        .json({ status: 'error', message: 'Projeto não encontrado' });
    }

    const data = project.activities.filter((act) => act.type === 'manutencao');
    res.json({ status: 'success', data });
  } catch (error) {
    console.error('❌ Erro em manutenção:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno',
      details: error.message,
    });
  }
});

app.get(
  '/api/projects/:id/procedimento-partida',
  authMiddleware,
  async (req, res) => {
    try {
      console.log(
        `▶️ Buscando procedimento-partida para projeto: ${req.params.id}`
      );

      // Se offline, retornar dados mockados
      if (
        mongoose.connection.readyState !== 1 ||
        req.params.id === '6864447b916b6c03fbe1b260'
      ) {
        const mockData = [
          {
            name: 'Pátio de Alimentação',
            type: 'partida',
            progress: 0,
            baseline: 100,
            subActivities: [
              {
                name: 'Retirar Bloqueio Elétrico do Pátio de Finos',
                progress: 0,
                baseline: 100,
              },
              {
                name: 'Realizar Calibração de Equipamentos',
                progress: 0,
                baseline: 100,
              },
              {
                name: 'Realizar Teste Operacional do Pátio de Finos',
                progress: 0,
                baseline: 100,
              },
              { name: 'Encher Silo 1SM2SI', progress: 0, baseline: 100 },
            ],
            order: 0,
          },
          {
            name: 'Precipitadores',
            type: 'partida',
            progress: 8.99,
            baseline: 100,
            subActivities: [
              { name: 'AR80', progress: 0, baseline: 100 },
              { name: 'AR40', progress: 11.11, baseline: 100 },
              { name: 'AR1', progress: 11.11, baseline: 100 },
            ],
            order: 1,
          },
        ];
        return res.json({ status: 'success', data: mockData });
      }

      const project = await Project.findById(req.params.id);
      if (!project) {
        return res
          .status(404)
          .json({ status: 'error', message: 'Projeto não encontrado' });
      }

      const data = project.activities.filter((act) => act.type === 'partida');
      res.json({ status: 'success', data });
    } catch (error) {
      console.error('❌ Erro em procedimento-partida:', error.message);
      res.status(500).json({
        status: 'error',
        message: 'Erro interno',
        details: error.message,
      });
    }
  }
);

app.get('/api/projects/:id/frentes', authMiddleware, async (req, res) => {
  try {
    console.log(`[FRENTES] Solicitação para projeto ID: ${req.params.id}`);

    // Verificar se MongoDB está conectado
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        status: 'error',
        message: 'Banco de dados não está conectado',
      });
    }

    // Buscar projeto no banco
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        status: 'error',
        message: 'Projeto não encontrado',
      });
    }

    console.log(`[FRENTES] Projeto encontrado: ${project.name}`);

    // Organizar atividades por tipo usando dados reais
    const frentes = {
      parada: project.activities.filter((act) => act.type === 'parada'),
      manutencao: project.activities.filter((act) => act.type === 'manutencao'),
      partida: project.activities.filter((act) => act.type === 'partida'),
    };

    console.log(
      `[FRENTES] Retornando ${Object.values(frentes).flat().length} atividades`
    );
    res.json({ status: 'success', data: frentes, source: 'database' });
  } catch (error) {
    console.error('[FRENTES] Erro:', error);
    res
      .status(500)
      .json({ status: 'error', message: 'Erro interno do servidor' });
  }
});

app.get('/api/projects/:id/statistics', authMiddleware, async (req, res) => {
  try {
    console.log(`[STATISTICS] Solicitação para projeto ID: ${req.params.id}`);

    // Verificar se MongoDB está conectado
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        status: 'error',
        message: 'Banco de dados não está conectado',
      });
    }

    // Buscar projeto no banco
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        status: 'error',
        message: 'Projeto não encontrado',
      });
    }

    console.log(`[STATISTICS] Projeto encontrado: ${project.name}`);

    // Calcular estatísticas dos dados reais
    const activities = project.activities || [];
    const stats = project.metadata?.statistics || {};

    const byType = {
      parada: activities.filter((act) => act.type === 'parada').length,
      manutencao: activities.filter((act) => act.type === 'manutencao').length,
      partida: activities.filter((act) => act.type === 'partida').length,
    };

    const response = {
      status: 'success',
      data: {
        ...stats,
        totalActivities: activities.length,
        activitiesByType: byType,
        lastUpdated: project.metadata?.processedAt || project.updatedAt,
      },
      source: 'database',
    };

    console.log(
      `[STATISTICS] Retornando estatísticas: ${activities.length} atividades`
    );
    res.json(response);
  } catch (error) {
    console.error('[STATISTICS] Erro:', error);
    res
      .status(500)
      .json({ status: 'error', message: 'Erro interno do servidor' });
  }
});

// Rota para criar projeto com equipes e membros (🔐 PROTEGIDA)
app.post('/api/projects/with-teams', authMiddleware, async (req, res) => {
  const action = 'CREATE_PROJECT_WITH_TEAMS';
  const startTime = Date.now();

  try {
    console.log(`[${action}] Iniciando criação de projeto com equipes...`);
    
    const { name, description, status, priority, teams, mainTeam, members } = req.body;

    // Validação básica
    if (!name || name.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Nome do projeto deve ter pelo menos 3 caracteres',
        timestamp: new Date().toISOString(),
      });
    }

    // Verificar se está conectado ao banco
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️ MongoDB desconectado, simulando criação...');
      
      const mockProject = {
        _id: new mongoose.Types.ObjectId(),
        name: name.trim(),
        description: description?.trim(),
        status: status || 'active',
        priority: priority || 'medium',
        owner: req.user?.id || '60d5ecb54b24a03d1c8b4567',
        teams: teams || [],
        mainTeam: mainTeam || null,
        createdAt: new Date(),
        updatedAt: new Date(),
        progress: 0,
        activities: [],
        metadata: {
          csvImport: false,
          statistics: {
            totalActivities: 0,
            completedActivities: 0,
            averageProgress: 0,
          },
        },
      };

      const duration = Date.now() - startTime;
      console.log(`✅ [${action}] Projeto simulado criado:`, {
        projectId: mockProject._id,
        projectName: mockProject.name,
        teamsCount: mockProject.teams.length,
        duration: `${duration}ms`,
      });

      return res.status(201).json({
        success: true,
        message: 'Projeto com equipes criado com sucesso (modo simulação)',
        data: {
          project: mockProject,
          teams: teams || [],
          members: members || [],
        },
        timestamp: new Date().toISOString(),
      });
    }

    // Criar o projeto
    const projectData = {
      name: name.trim(),
      description: description?.trim(),
      status: status || 'active',
      priority: priority || 'medium',
      owner: req.user?.id || '60d5ecb54b24a03d1c8b4567',
      teams: teams || [],
      mainTeam: mainTeam || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const project = await Project.create(projectData);

    // Se foram fornecidas equipes, associar o projeto às equipes
    if (teams && teams.length > 0) {
      await Team.updateMany(
        { _id: { $in: teams } },
        { $addToSet: { projects: project._id } }
      );
    }

    // Popular os dados das equipes para retorno
    const populatedProject = await Project.findById(project._id)
      .populate('teams', 'name description department members')
      .populate('mainTeam', 'name description department')
      .populate('owner', 'username email fullName');

    const duration = Date.now() - startTime;
    console.log(`✅ [${action}] Projeto criado com sucesso:`, {
      projectId: project._id,
      projectName: project.name,
      teamsCount: teams?.length || 0,
      mainTeam: mainTeam || 'Não definida',
      userId: req.user?.id,
      duration: `${duration}ms`,
    });

    res.status(201).json({
      success: true,
      message: 'Projeto com equipes criado com sucesso',
      data: {
        project: populatedProject,
        teamsAssociated: teams?.length || 0,
        membersTotal: members?.length || 0,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ [${action}] Erro ao criar projeto:`, {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      duration: `${duration}ms`,
    });

    res.status(500).json({
      success: false,
      message: 'Erro ao criar projeto com equipes',
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Rota para buscar projeto com equipes e membros (🔐 PROTEGIDA)
app.get('/api/projects/:id/full-details', authMiddleware, async (req, res) => {
  const action = 'GET_PROJECT_FULL_DETAILS';
  const startTime = Date.now();

  try {
    const { id } = req.params;
    
    console.log(`[${action}] Buscando detalhes completos do projeto ${id}...`);

    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️ MongoDB desconectado, retornando dados mockados');
      
      const mockProject = {
        _id: id,
        name: 'Projeto EPU - Exemplo Completo',
        description: 'Projeto de exemplo com equipes e membros',
        status: 'active',
        priority: 'high',
        teams: [
          {
            _id: '507f1f77bcf86cd799439011',
            name: 'Equipe de Desenvolvimento',
            department: 'TI',
            members: [
              { name: 'João Silva', role: 'leader' },
              { name: 'Maria Santos', role: 'developer' },
            ],
          },
          {
            _id: '507f1f77bcf86cd799439012',
            name: 'Equipe de QA',
            department: 'Qualidade',
            members: [
              { name: 'Pedro Costa', role: 'tester' },
              { name: 'Ana Oliveira', role: 'analyst' },
            ],
          },
        ],
        mainTeam: {
          _id: '507f1f77bcf86cd799439011',
          name: 'Equipe de Desenvolvimento',
          department: 'TI',
        },
        owner: {
          _id: '507f1f77bcf86cd799439013',
          username: 'admin',
          fullName: 'Administrador do Sistema',
        },
      };

      return res.json({
        success: true,
        data: mockProject,
        message: 'Dados de exemplo (modo offline)',
        timestamp: new Date().toISOString(),
      });
    }

    const project = await Project.findById(id)
      .populate({
        path: 'teams',
        select: 'name description department members color',
        populate: {
          path: 'members.user',
          select: 'username email fullName',
        },
      })
      .populate('mainTeam', 'name description department color')
      .populate('owner', 'username email fullName');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado',
        timestamp: new Date().toISOString(),
      });
    }

    const duration = Date.now() - startTime;
    console.log(`✅ [${action}] Detalhes completos recuperados:`, {
      projectId: project._id,
      projectName: project.name,
      teamsCount: project.teams.length,
      duration: `${duration}ms`,
    });

    res.json({
      success: true,
      data: project,
      message: 'Detalhes completos do projeto recuperados',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ [${action}] Erro ao buscar detalhes:`, {
      error: error.message,
      projectId: req.params.id,
      duration: `${duration}ms`,
    });

    res.status(500).json({
      success: false,
      message: 'Erro ao buscar detalhes do projeto',
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Conectar ao banco e iniciar servidor
connectDB()
  .then((connected) => {
    const dbStatus = connected
      ? '✅ Conectado ao MongoDB'
      : '⚠️ Modo offline (sem banco)';

    app.listen(PORT, () => {
      console.log(`🚀 EPU-Gestão Backend rodando na porta ${PORT}`);
      console.log(`🌐 API disponível em: http://localhost:${PORT}/api`);
      console.log(`🔧 Teste: http://localhost:${PORT}/api/test`);
      console.log(`🗄️ Banco de dados: ${dbStatus}`);
      console.log(`📊 Dados mockados disponíveis para demonstração`);
    });
  })
  .catch((error) => {
    console.error('❌ Erro ao inicializar servidor:', error);
    // Iniciar servidor mesmo sem banco
    app.listen(PORT, () => {
      console.log(
        `🚀 EPU-Gestão Backend rodando na porta ${PORT} (modo emergência)`
      );
      console.log(`⚠️ Funcionando apenas com dados mockados`);
    });
  });
