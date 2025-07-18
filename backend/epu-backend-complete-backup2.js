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

// Importar rotas de usuários
const userRoutes = require('./src/routes/userRoutes');

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

// Configurar rotas de usuários
app.use('/api/users', userRoutes);

// Schema do projeto
const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    status: { type: String, default: 'active' },
    priority: { type: String, default: 'medium' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    progress: { type: Number, default: 0 },
    activities: [
      {
        name: String,
        type: { type: String, enum: ['parada', 'manutencao', 'partida'] },
        progress: { type: Number, default: 0 },
        baseline: { type: Number, default: 0 },
        subActivities: [
          {
            name: String,
            progress: { type: Number, default: 0 },
            baseline: { type: Number, default: 0 },
          },
        ],
        order: { type: Number, default: 0 },
      },
    ],
    metadata: {
      csvImport: { type: Boolean, default: false },
      processedAt: Date,
      statistics: {
        totalActivities: { type: Number, default: 0 },
        completedActivities: { type: Number, default: 0 },
        averageProgress: { type: Number, default: 0 },
      },
    },
  },
  { collection: 'projects' }
);

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

// Importar modelos existentes (removendo definições duplicadas)
  {
    name: {
      type: String,
      required: [true, 'Nome da equipe é obrigatório'],
      trim: true,
      minlength: [3, 'Nome deve ter pelo menos 3 caracteres'],
      maxlength: [100, 'Nome deve ter no máximo 100 caracteres'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Descrição deve ter no máximo 500 caracteres'],
    },
    department: {
      type: String,
      required: [true, 'Departamento é obrigatório'],
      trim: true,
      minlength: [3, 'Departamento deve ter pelo menos 3 caracteres'],
      maxlength: [100, 'Departamento deve ter no máximo 100 caracteres'],
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        role: {
          type: String,
          enum: {
            values: ['leader', 'member', 'coordinator', 'analyst'],
            message: 'Papel deve ser: leader, member, coordinator ou analyst',
          },
          default: 'member',
        },
        joinDate: {
          type: Date,
          default: Date.now,
        },
        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],
    projects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    color: {
      type: String,
      default: '#3498db',
      trim: true,
      match: [
        /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
        'Cor deve estar no formato hexadecimal (#RRGGBB)',
      ],
    },
    budget: {
      type: Number,
      default: 0,
      min: [0, 'Orçamento não pode ser negativo'],
    },
    goals: [
      {
        title: {
          type: String,
          required: [true, 'Título da meta é obrigatório'],
          trim: true,
          maxlength: [200, 'Título deve ter no máximo 200 caracteres'],
        },
        description: {
          type: String,
          trim: true,
          maxlength: [500, 'Descrição deve ter no máximo 500 caracteres'],
        },
        deadline: {
          type: Date,
          validate: {
            validator: function (value) {
              return !value || value > new Date();
            },
            message: 'Prazo deve ser uma data futura',
          },
        },
        priority: {
          type: String,
          enum: {
            values: ['low', 'medium', 'high', 'critical'],
            message: 'Prioridade deve ser: low, medium, high ou critical',
          },
          default: 'medium',
        },
        completed: {
          type: Boolean,
          default: false,
        },
        completedAt: {
          type: Date,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    settings: {
      allowPublicView: {
        type: Boolean,
        default: true,
      },
      allowMemberInvite: {
        type: Boolean,
        default: false,
      },
      requireApproval: {
        type: Boolean,
        default: true,
      },
    },
    stats: {
      totalMembers: {
        type: Number,
        default: 0,
      },
      activeMembers: {
        type: Number,
        default: 0,
      },
      completedGoals: {
        type: Number,
        default: 0,
      },
      totalProjects: {
        type: Number,
        default: 0,
      },
      lastActivity: {
        type: Date,
        default: Date.now,
      },
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    collection: 'teams',
    timestamps: true,
  }
);

// Índices para melhor performance
teamSchema.index({ name: 1, department: 1 });
teamSchema.index({ department: 1 });
teamSchema.index({ isActive: 1 });
teamSchema.index({ createdBy: 1 });
teamSchema.index({ manager: 1 });
teamSchema.index({ 'members.user': 1 });
teamSchema.index({ projects: 1 });

// Virtual para contar membros ativos
teamSchema.virtual('activeMemberCount').get(function () {
  return this.members.filter((member) => member.isActive).length;
});

// Virtual para contar metas concluídas
teamSchema.virtual('completedGoalsCount').get(function () {
  return this.goals.filter((goal) => goal.completed).length;
});

// Virtual para calcular progresso das metas
teamSchema.virtual('goalsProgress').get(function () {
  if (this.goals.length === 0) return 0;
  const completed = this.completedGoalsCount;
  return Math.round((completed / this.goals.length) * 100);
});

// Método para adicionar membro
teamSchema.methods.addMember = function (userId, role = 'member') {
  const existingMember = this.members.find(
    (member) => member.user.toString() === userId.toString() && member.isActive
  );

  if (existingMember) {
    throw new Error('Usuário já é membro ativo desta equipe');
  }

  this.members.push({
    user: userId,
    role: role,
    joinDate: new Date(),
    isActive: true,
  });

  this.stats.totalMembers = this.members.length;
  this.stats.activeMembers = this.activeMemberCount;
  this.stats.lastActivity = new Date();

  return this.save();
};

// Método para remover membro
teamSchema.methods.removeMember = function (userId) {
  const memberIndex = this.members.findIndex(
    (member) => member.user.toString() === userId.toString() && member.isActive
  );

  if (memberIndex === -1) {
    throw new Error('Usuário não é membro ativo desta equipe');
  }

  this.members[memberIndex].isActive = false;

  this.stats.activeMembers = this.activeMemberCount;
  this.stats.lastActivity = new Date();

  return this.save();
};

// Método para marcar meta como concluída
teamSchema.methods.completeGoal = function (goalId) {
  const goal = this.goals.id(goalId);
  if (!goal) {
    throw new Error('Meta não encontrada');
  }

  goal.completed = true;
  goal.completedAt = new Date();

  this.stats.completedGoals = this.completedGoalsCount;
  this.stats.lastActivity = new Date();

  return this.save();
};

// Importar modelos existentes
const Team = require('./src/models/teamModels');
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

// Rotas de compatibilidade para o frontend (projects-crud)
// Alias para /api/projects-crud/stats -> /api/projects/stats
app.get('/api/projects-crud/stats', authMiddleware, async (req, res) => {
  try {
    console.log('📊 Buscando estatísticas dos projetos via projects-crud...');

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

    console.log('✅ Estatísticas calculadas via projects-crud:', stats);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error(
      '❌ Erro ao buscar estatísticas via projects-crud:',
      error.message
    );
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas',
      details: error.message,
    });
  }
});

// Alias para /api/projects-crud -> /api/projects
app.get('/api/projects-crud', authMiddleware, async (req, res) => {
  try {
    console.log('📋 Buscando projetos via projects-crud...');
    console.log(
      `🔗 Status da conexão: ${mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado'}`
    );

    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️ MongoDB desconectado, retornando dados mockados');
      return res.json({
        success: true,
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

    console.log(`✅ ${projects.length} projetos encontrados via projects-crud`);

    res.json({
      success: true,
      data: {
        projects: projects.map((p) => ({
          _id: p._id,
          id: p._id,
          name: p.name,
          description: p.description,
          status: p.status,
          priority: p.priority,
          progress: p.progress,
          budget: p.budget,
          startDate: p.startDate,
          endDate: p.endDate,
          owner: p.owner,
          team: p.team,
          tags: p.tags,
          activities: p.activities,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          totalActivities: p.activities?.length || 0,
          csvImport: p.metadata?.csvImport || false,
        })),
        pagination: {
          total: projects.length,
          page: 1,
          limit: projects.length,
          pages: 1,
        },
      },
    });
  } catch (error) {
    console.error(
      '❌ Erro ao buscar projetos via projects-crud:',
      error.message
    );
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar projetos',
      details: error.message,
    });
  }
});

// Alias para CSV import
app.post(
  '/api/projects-crud/import-csv',
  authMiddleware,
  upload.single('csvFile'),
  async (req, res) => {
    try {
      console.log('📁 Upload CSV via projects-crud iniciado');

      if (!req.file) {
        return res.status(400).json({
          success: false,
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

      console.log(
        `🎉 Projeto criado com sucesso via projects-crud: ${project._id}`
      );

      res.status(201).json({
        success: true,
        message: 'Projeto criado com sucesso',
        data: {
          project: {
            id: project._id,
            name: project.name,
            description: project.description,
            status: project.status,
            priority: project.priority,
            progress: project.progress,
            createdAt: project.createdAt,
            totalActivities,
            type: activityType,
          },
        },
      });
    } catch (error) {
      console.error('❌ Erro no upload CSV via projects-crud:', error);

      // Limpar arquivo temporário em caso de erro
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (cleanupError) {
          console.error('Erro ao limpar arquivo temporário:', cleanupError);
        }
      }

      res.status(500).json({
        success: false,
        message: 'Erro no processamento do CSV',
        details: error.message,
      });
    }
  }
);

// Alias para /api/projects/import-csv -> /api/projects-crud/import-csv (redundante, mas para compatibilidade)
app.post(
  '/api/projects/import-csv',
  authMiddleware,
  upload.single('csvFile'),
  async (req, res) => {
    try {
      console.log('📁 Upload CSV via projects/import-csv iniciado (alias)');

      if (!req.file) {
        return res.status(400).json({
          success: false,
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

      console.log(
        `🎉 Projeto criado com sucesso via projects/import-csv: ${project._id}`
      );

      res.status(201).json({
        success: true,
        message: 'Projeto criado com sucesso',
        data: {
          project: {
            id: project._id,
            name: project.name,
            description: project.description,
            status: project.status,
            priority: project.priority,
            progress: project.progress,
            createdAt: project.createdAt,
            totalActivities,
            type: activityType,
          },
        },
      });
    } catch (error) {
      console.error('❌ Erro no upload CSV via projects/import-csv:', error);

      // Limpar arquivo temporário em caso de erro
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (cleanupError) {
          console.error('Erro ao limpar arquivo temporário:', cleanupError);
        }
      }

      res.status(500).json({
        success: false,
        message: 'Erro no processamento do CSV',
        details: error.message,
      });
    }
  }
);

// ==================== ROTAS DE AVISOS ====================

// Rota para listar avisos (🔐 PROTEGIDA - requer autenticação)
app.get('/api/notices', authMiddleware, async (req, res) => {
  try {
    console.log('📢 [NOTICES] Buscando avisos...');

    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️ MongoDB desconectado, retornando dados mockados');
      return res.json({
        success: true,
        data: [],
        message: 'Banco de dados não conectado',
      });
    }

    const {
      type,
      priority,
      targetAudience,
      isActive,
      isPinned,
      tags,
      page = 1,
      limit = 10,
    } = req.query;

    // Construir filtros
    const filters = {};

    if (type) filters.type = type;
    if (priority) filters.priority = priority;
    if (targetAudience) filters.targetAudience = targetAudience;
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (isPinned !== undefined) filters.isPinned = isPinned === 'true';
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      filters.tags = { $in: tagArray };
    }

    // Filtrar apenas avisos não expirados e ativos por padrão
    if (isActive === undefined) {
      filters.isActive = true;
      filters.$or = [
        { expiryDate: { $exists: false } },
        { expiryDate: { $gte: new Date() } },
      ];
    }

    // Paginação
    const skip = (page - 1) * limit;
    const totalNotices = await Notice.countDocuments(filters);

    const notices = await Notice.find(filters)
      .populate('author', 'username fullName email')
      .sort({ isPinned: -1, publishDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    console.log(`✅ [NOTICES] ${notices.length} avisos encontrados`);

    res.json({
      success: true,
      data: notices.map((notice) => ({
        _id: notice._id,
        title: notice.title,
        content: notice.content,
        type: notice.type,
        priority: notice.priority,
        author: notice.author,
        targetAudience: notice.targetAudience,
        isActive: notice.isActive,
        isPinned: notice.isPinned,
        publishDate: notice.publishDate,
        expiryDate: notice.expiryDate,
        views: notice.views,
        attachments: notice.attachments,
        tags: notice.tags,
        readBy: notice.readBy,
        createdAt: notice.createdAt,
        updatedAt: notice.updatedAt,
        isExpired: notice.isExpired,
        daysUntilExpiry: notice.daysUntilExpiry,
        isDisplayable: notice.isDisplayable,
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalNotices / limit),
        totalNotices,
        noticesPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('❌ [NOTICES] Erro ao buscar avisos:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar avisos',
      details: error.message,
    });
  }
});

// Rota para buscar aviso específico (🔐 PROTEGIDA - requer autenticação)
app.get('/api/notices/:id', authMiddleware, async (req, res) => {
  try {
    console.log(`📢 [NOTICES] Buscando aviso: ${req.params.id}`);

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Banco de dados não conectado',
      });
    }

    const notice = await Notice.findById(req.params.id)
      .populate('author', 'username fullName email')
      .populate('readBy.user', 'username fullName email');

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Aviso não encontrado',
      });
    }

    // Incrementar visualizações
    await notice.incrementViews();

    console.log(`✅ [NOTICES] Aviso encontrado: ${notice.title}`);

    res.json({
      success: true,
      data: {
        _id: notice._id,
        title: notice.title,
        content: notice.content,
        type: notice.type,
        priority: notice.priority,
        author: notice.author,
        targetAudience: notice.targetAudience,
        isActive: notice.isActive,
        isPinned: notice.isPinned,
        publishDate: notice.publishDate,
        expiryDate: notice.expiryDate,
        views: notice.views,
        attachments: notice.attachments,
        tags: notice.tags,
        readBy: notice.readBy,
        createdAt: notice.createdAt,
        updatedAt: notice.updatedAt,
        isExpired: notice.isExpired,
        daysUntilExpiry: notice.daysUntilExpiry,
        isDisplayable: notice.isDisplayable,
      },
    });
  } catch (error) {
    console.error('❌ [NOTICES] Erro ao buscar aviso:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar aviso',
      details: error.message,
    });
  }
});

// Rota para criar aviso (REQUER AUTENTICAÇÃO)
app.post('/api/notices', authMiddleware, async (req, res) => {
  try {
    console.log('📢 [NOTICES] Criando novo aviso...');
    console.log(`👤 Usuário: ${req.user.email} (ID: ${req.user.id})`);

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Banco de dados não conectado',
      });
    }

    const noticeData = {
      ...req.body,
      author: req.user.id,
      publishDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const notice = await Notice.create(noticeData);

    // Popular o autor
    await notice.populate('author', 'username fullName email');

    console.log(`✅ [NOTICES] Aviso criado: ${notice._id}`);
    console.log(`📢 Título: ${notice.title}`);

    res.status(201).json({
      success: true,
      message: 'Aviso criado com sucesso',
      data: {
        _id: notice._id,
        title: notice.title,
        content: notice.content,
        type: notice.type,
        priority: notice.priority,
        author: notice.author,
        targetAudience: notice.targetAudience,
        isActive: notice.isActive,
        isPinned: notice.isPinned,
        publishDate: notice.publishDate,
        expiryDate: notice.expiryDate,
        views: notice.views,
        attachments: notice.attachments,
        tags: notice.tags,
        createdAt: notice.createdAt,
        updatedAt: notice.updatedAt,
        isExpired: notice.isExpired,
        daysUntilExpiry: notice.daysUntilExpiry,
        isDisplayable: notice.isDisplayable,
        user: {
          id: req.user.id,
          email: req.user.email,
        },
      },
    });
  } catch (error) {
    console.error('❌ [NOTICES] Erro ao criar aviso:', error.message);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: 'Dados de entrada inválidos',
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro ao criar aviso',
      details: error.message,
    });
  }
});

// Rota para atualizar aviso (REQUER AUTENTICAÇÃO)
app.put('/api/notices/:id', authMiddleware, async (req, res) => {
  try {
    console.log(`📢 [NOTICES] Atualizando aviso: ${req.params.id}`);
    console.log(`👤 Usuário: ${req.user.email} (ID: ${req.user.id})`);

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Banco de dados não conectado',
      });
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date(),
    };

    const notice = await Notice.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('author', 'username fullName email')
      .populate('readBy.user', 'username fullName email');

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Aviso não encontrado',
      });
    }

    console.log(`✅ [NOTICES] Aviso atualizado: ${notice.title}`);

    res.json({
      success: true,
      message: 'Aviso atualizado com sucesso',
      data: {
        _id: notice._id,
        title: notice.title,
        content: notice.content,
        type: notice.type,
        priority: notice.priority,
        author: notice.author,
        targetAudience: notice.targetAudience,
        isActive: notice.isActive,
        isPinned: notice.isPinned,
        publishDate: notice.publishDate,
        expiryDate: notice.expiryDate,
        views: notice.views,
        attachments: notice.attachments,
        tags: notice.tags,
        readBy: notice.readBy,
        createdAt: notice.createdAt,
        updatedAt: notice.updatedAt,
        isExpired: notice.isExpired,
        daysUntilExpiry: notice.daysUntilExpiry,
        isDisplayable: notice.isDisplayable,
        user: {
          id: req.user.id,
          email: req.user.email,
        },
      },
    });
  } catch (error) {
    console.error('❌ [NOTICES] Erro ao atualizar aviso:', error.message);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: 'Dados de entrada inválidos',
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar aviso',
      details: error.message,
    });
  }
});

// Rota para deletar aviso (REQUER AUTENTICAÇÃO)
app.delete('/api/notices/:id', authMiddleware, async (req, res) => {
  try {
    console.log(`🗑️ [NOTICES] Deletando aviso: ${req.params.id}`);
    console.log(`👤 Usuário: ${req.user.email} (ID: ${req.user.id})`);

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Banco de dados não conectado',
      });
    }

    const notice = await Notice.findByIdAndDelete(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Aviso não encontrado',
      });
    }

    console.log(`✅ [NOTICES] Aviso deletado: ${notice.title}`);

    res.json({
      success: true,
      message: 'Aviso deletado com sucesso',
      data: {
        deletedNotice: {
          _id: notice._id,
          title: notice.title,
          type: notice.type,
          priority: notice.priority,
        },
        user: {
          id: req.user.id,
          email: req.user.email,
        },
      },
    });
  } catch (error) {
    console.error('❌ [NOTICES] Erro ao deletar aviso:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar aviso',
      details: error.message,
    });
  }
});

// Rota para exclusão em lote de avisos (REQUER AUTENTICAÇÃO)
app.delete('/api/notices/batch', authMiddleware, async (req, res) => {
  try {
    const { ids } = req.body;

    console.log(
      `🗑️ [NOTICES] Exclusão em lote de avisos: ${ids?.length || 0} avisos`
    );
    console.log(`👤 Usuário: ${req.user.email} (ID: ${req.user.id})`);

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Lista de IDs de avisos é obrigatória',
        details: {
          providedIds: ids,
          expectedFormat: 'Array de strings com IDs dos avisos',
        },
      });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Banco de dados não conectado',
      });
    }

    // Verificar se todos os avisos existem antes de excluir
    const existingNotices = await Notice.find({ _id: { $in: ids } });
    const existingIds = existingNotices.map((n) => n._id.toString());
    const notFoundIds = ids.filter((id) => !existingIds.includes(id));

    if (notFoundIds.length > 0) {
      return res.status(404).json({
        success: false,
        message: 'Alguns avisos não foram encontrados',
        details: {
          notFound: notFoundIds,
          found: existingIds,
          total: ids.length,
        },
      });
    }

    // Realizar exclusão em lote
    const result = await Notice.deleteMany({ _id: { $in: ids } });

    console.log(`✅ [NOTICES] ${result.deletedCount} avisos excluídos em lote`);

    res.json({
      success: true,
      message: `${result.deletedCount} avisos excluídos com sucesso`,
      data: {
        deletedCount: result.deletedCount,
        deletedIds: ids,
        user: {
          id: req.user.id,
          email: req.user.email,
        },
      },
    });
  } catch (error) {
    console.error('❌ [NOTICES] Erro na exclusão em lote:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erro na exclusão em lote de avisos',
      details: error.message,
    });
  }
});

// Rota para marcar aviso como lido (REQUER AUTENTICAÇÃO)
app.post('/api/notices/:id/read', authMiddleware, async (req, res) => {
  try {
    console.log(`📖 [NOTICES] Marcando aviso como lido: ${req.params.id}`);
    console.log(`👤 Usuário: ${req.user.email} (ID: ${req.user.id})`);

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Banco de dados não conectado',
      });
    }

    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Aviso não encontrado',
      });
    }

    await notice.markAsReadBy(req.user.id);

    console.log(`✅ [NOTICES] Aviso marcado como lido: ${notice.title}`);

    res.json({
      success: true,
      message: 'Aviso marcado como lido',
      data: {
        noticeId: notice._id,
        title: notice.title,
        readAt: new Date(),
        user: {
          id: req.user.id,
          email: req.user.email,
        },
      },
    });
  } catch (error) {
    console.error(
      '❌ [NOTICES] Erro ao marcar aviso como lido:',
      error.message
    );
    res.status(500).json({
      success: false,
      message: 'Erro ao marcar aviso como lido',
      details: error.message,
    });
  }
});

// Rota para avisos ativos (🔐 PROTEGIDA - requer autenticação)
app.get('/api/notices/active', authMiddleware, async (req, res) => {
  try {
    console.log('📢 [NOTICES] Buscando avisos ativos...');

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Banco de dados não conectado',
      });
    }

    const notices = await Notice.find({
      isActive: true,
      $or: [
        { expiryDate: { $exists: false } },
        { expiryDate: { $gte: new Date() } },
      ],
    })
      .populate('author', 'username fullName email')
      .sort({ isPinned: -1, priority: -1, publishDate: -1 })
      .limit(20);

    console.log(`✅ [NOTICES] ${notices.length} avisos ativos encontrados`);

    res.json({
      success: true,
      data: notices.map((notice) => ({
        _id: notice._id,
        title: notice.title,
        content: notice.content,
        type: notice.type,
        priority: notice.priority,
        author: notice.author,
        targetAudience: notice.targetAudience,
        isPinned: notice.isPinned,
        publishDate: notice.publishDate,
        expiryDate: notice.expiryDate,
        views: notice.views,
        tags: notice.tags,
        isExpired: notice.isExpired,
        daysUntilExpiry: notice.daysUntilExpiry,
      })),
      message: `${notices.length} avisos ativos encontrados`,
    });
  } catch (error) {
    console.error('❌ [NOTICES] Erro ao buscar avisos ativos:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar avisos ativos',
      details: error.message,
    });
  }
});

// Rota para avisos fixados (🔐 PROTEGIDA - requer autenticação)
app.get('/api/notices/pinned', authMiddleware, async (req, res) => {
  try {
    console.log('📌 [NOTICES] Buscando avisos fixados...');

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Banco de dados não conectado',
      });
    }

    const notices = await Notice.find({
      isPinned: true,
      isActive: true,
      $or: [
        { expiryDate: { $exists: false } },
        { expiryDate: { $gte: new Date() } },
      ],
    })
      .populate('author', 'username fullName email')
      .sort({ priority: -1, publishDate: -1 });

    console.log(`✅ [NOTICES] ${notices.length} avisos fixados encontrados`);

    res.json({
      success: true,
      data: notices.map((notice) => ({
        _id: notice._id,
        title: notice.title,
        content: notice.content,
        type: notice.type,
        priority: notice.priority,
        author: notice.author,
        targetAudience: notice.targetAudience,
        publishDate: notice.publishDate,
        expiryDate: notice.expiryDate,
        views: notice.views,
        tags: notice.tags,
        isExpired: notice.isExpired,
        daysUntilExpiry: notice.daysUntilExpiry,
      })),
      message: `${notices.length} avisos fixados encontrados`,
    });
  } catch (error) {
    console.error('❌ [NOTICES] Erro ao buscar avisos fixados:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar avisos fixados',
      details: error.message,
    });
  }
});

// Rota para estatísticas de avisos (🔐 PROTEGIDA - requer autenticação)
app.get('/api/notices/stats', authMiddleware, async (req, res) => {
  try {
    console.log('📊 [NOTICES] Buscando estatísticas de avisos...');

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Banco de dados não conectado',
      });
    }

    const notices = await Notice.find({});

    // Calcular estatísticas
    const total = notices.length;
    const byType = {};
    const byPriority = {};
    const byTargetAudience = {};

    let activeNotices = 0;
    let expiredNotices = 0;
    let pinnedNotices = 0;
    let totalViews = 0;

    notices.forEach((notice) => {
      // Contar por tipo
      byType[notice.type] = (byType[notice.type] || 0) + 1;

      // Contar por prioridade
      byPriority[notice.priority] = (byPriority[notice.priority] || 0) + 1;

      // Contar por público-alvo
      byTargetAudience[notice.targetAudience] =
        (byTargetAudience[notice.targetAudience] || 0) + 1;

      // Contar estados
      if (notice.isActive) activeNotices++;
      if (notice.isExpired) expiredNotices++;
      if (notice.isPinned) pinnedNotices++;

      // Somar visualizações
      totalViews += notice.views;
    });

    const stats = {
      total,
      activeNotices,
      expiredNotices,
      pinnedNotices,
      totalViews,
      averageViewsPerNotice: total > 0 ? Math.round(totalViews / total) : 0,
      byType,
      byPriority,
      byTargetAudience,
    };

    console.log('✅ [NOTICES] Estatísticas de avisos calculadas:', stats);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error(
      '❌ [NOTICES] Erro ao buscar estatísticas de avisos:',
      error.message
    );
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas de avisos',
      details: error.message,
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
