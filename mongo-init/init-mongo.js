// MongoDB initialization script
// This script will run when the MongoDB container starts for the first time

print('🔧 Inicializando banco de dados EPU-Gestão...');

// Switch to the epu_gestao database
db = db.getSiblingDB('epu_gestao');

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['username', 'email', 'password'],
      properties: {
        username: {
          bsonType: 'string',
          minLength: 3,
          maxLength: 30,
          description: 'Username must be a string between 3-30 characters',
        },
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
          description: 'Email must be a valid email address',
        },
        password: {
          bsonType: 'string',
          minLength: 6,
          description: 'Password must be at least 6 characters',
        },
      },
    },
  },
});

db.createCollection('projects', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'owner'],
      properties: {
        name: {
          bsonType: 'string',
          minLength: 3,
          maxLength: 200,
          description: 'Project name must be between 3-200 characters',
        },
        description: {
          bsonType: 'string',
          maxLength: 2000,
          description: 'Description must not exceed 2000 characters',
        },
        status: {
          enum: ['draft', 'active', 'completed', 'cancelled', 'on-hold'],
          description:
            'Status must be one of: draft, active, completed, cancelled, on-hold',
        },
      },
    },
  },
});

db.createCollection('notices', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'content'],
      properties: {
        title: {
          bsonType: 'string',
          minLength: 3,
          maxLength: 200,
          description: 'Title must be between 3-200 characters',
        },
        content: {
          bsonType: 'string',
          minLength: 10,
          maxLength: 5000,
          description: 'Content must be between 10-5000 characters',
        },
        type: {
          enum: ['info', 'warning', 'urgent', 'announcement', 'maintenance'],
          description: 'Type must be one of the allowed notice types',
        },
      },
    },
  },
});

// Create indexes for better performance
print('📊 Criando índices...');

// Users indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ createdAt: 1 });

// Projects indexes
db.projects.createIndex({ owner: 1 });
db.projects.createIndex({ status: 1 });
db.projects.createIndex({ createdAt: -1 });
db.projects.createIndex({ name: 1 });
db.projects.createIndex({ 'team.user': 1 });

// Notices indexes
db.notices.createIndex({ isActive: 1, publishDate: -1 });
db.notices.createIndex({ targetAudience: 1 });
db.notices.createIndex({ author: 1 });
db.notices.createIndex({ type: 1 });
db.notices.createIndex({ expiryDate: 1 });

// Create admin user
print('👤 Criando usuário administrador...');

db.users.insertOne({
  username: 'admin',
  email: 'admin@epugestao.com',
  password: '$2b$10$rQJXHbGzQrXzuOOHNjQJW.YqD3hS7N8hq/9J3.JoB1Q4h7l8E9mJ6', // password: admin123
  fullName: 'Administrador EPU-Gestão',
  role: 'admin',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

// Create sample project
print('📂 Criando projeto de exemplo...');

const adminUser = db.users.findOne({ username: 'admin' });
if (adminUser) {
  db.projects.insertOne({
    name: 'Projeto de Exemplo - Docker',
    description:
      'Este é um projeto de exemplo criado durante a inicialização do Docker.',
    status: 'active',
    priority: 'medium',
    progress: 25,
    owner: adminUser._id,
    team: [],
    activities: [
      {
        name: 'Configuração do Docker',
        status: 'completed',
        progress: 100,
        assignee: 'Administrador',
      },
      {
        name: 'Testes de Integração',
        status: 'in_progress',
        progress: 50,
        assignee: 'Administrador',
      },
    ],
    tags: ['docker', 'exemplo', 'configuração'],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  });
}

// Create sample notice
print('📢 Criando aviso de exemplo...');

db.notices.insertOne({
  title: 'Sistema EPU-Gestão Rodando com Docker!',
  content:
    'O sistema foi configurado com sucesso usando Docker e MongoDB. Todas as funcionalidades estão disponíveis.',
  type: 'announcement',
  priority: 'high',
  isActive: true,
  isPinned: true,
  targetAudience: 'all',
  author: adminUser ? adminUser._id : 'system',
  publishDate: new Date(),
  expiryDate: null,
  views: 0,
  readBy: [],
  tags: ['docker', 'sistema', 'configuração'],
  createdAt: new Date(),
  updatedAt: new Date(),
});

print('✅ Banco de dados EPU-Gestão inicializado com sucesso!');
print('📊 Estatísticas:');
print('   - Users: ' + db.users.countDocuments());
print('   - Projects: ' + db.projects.countDocuments());
print('   - Notices: ' + db.notices.countDocuments());
print('');
print('🔐 Credenciais do administrador:');
print('   Email: admin@epugestao.com');
print('   Senha: admin123');
print('');
