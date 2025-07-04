require('dotenv').config({ path: './.env' });
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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

// Configuração do multer para upload
const uploadDir = path.join(__dirname, 'temp');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Schema simples do projeto
const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    status: { type: String, default: 'active' },
    createdAt: { type: Date, default: Date.now },
    csvData: {
      procedimentoParada: [
        {
          name: String,
          value: String,
          baseline: String,
          subActivities: [String],
        },
      ],
      manutencao: [
        {
          name: String,
          value: String,
          baseline: String,
          subActivities: [String],
        },
      ],
      procedimentoPartida: [
        {
          name: String,
          value: String,
          baseline: String,
          subActivities: [String],
        },
      ],
    },
  },
  { collection: 'projects' }
);

const Project = mongoose.model('Project', projectSchema);

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

// Função para processar CSV baseado nos seus dados
const processCSVData = (csvContent, type) => {
  const lines = csvContent.split('\n');
  const result = [];

  // Pular cabeçalho
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(',');
    if (parts.length >= 4) {
      const subActivities = parts[3]
        ? parts[3].split(';').map((s) => s.trim())
        : [];

      result.push({
        name: parts[0] || '',
        value: parts[1] || '0',
        baseline: parts[2] || '0',
        subActivities: subActivities,
      });
    }
  }

  return result;
};

// Rotas
app.get('/api/test', (req, res) => {
  res.json({
    status: 'success',
    message: 'Backend funcionando!',
    db: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
  });
});

app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.find({}).select(
      'name description status createdAt'
    );
    res.json({
      status: 'success',
      data: projects,
    });
  } catch (error) {
    console.error('Erro em /api/projects:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno',
    });
  }
});

app.post(
  '/api/projects/upload-csv',
  upload.single('csvFile'),
  async (req, res) => {
    try {
      console.log('📁 Upload CSV iniciado');

      if (!req.file) {
        return res.status(400).json({
          status: 'error',
          message: 'Nenhum arquivo enviado',
        });
      }

      const { projectName } = req.body;
      const fileName = req.file.originalname.toLowerCase();

      console.log('📄 Arquivo:', fileName);
      console.log('📝 Nome do projeto:', projectName);

      // Ler conteúdo do arquivo
      const csvContent = fs.readFileSync(req.file.path, 'utf8');

      // Determinar tipo baseado no nome do arquivo
      let type = 'procedimentoPartida';
      if (fileName.includes('parada')) {
        type = 'procedimentoParada';
      } else if (fileName.includes('manutencao')) {
        type = 'manutencao';
      }

      // Processar dados CSV
      const processedData = processCSVData(csvContent, type);

      console.log(
        `📊 Processados ${processedData.length} itens do tipo ${type}`
      );

      // Criar projeto
      const projectData = {
        name: projectName || req.file.originalname.replace('.csv', ''),
        description: `Projeto importado do arquivo ${req.file.originalname}`,
        status: 'active',
        csvData: {
          procedimentoParada:
            type === 'procedimentoParada' ? processedData : [],
          manutencao: type === 'manutencao' ? processedData : [],
          procedimentoPartida:
            type === 'procedimentoPartida' ? processedData : [],
        },
      };

      const project = await Project.create(projectData);

      // Limpar arquivo temporário
      fs.unlinkSync(req.file.path);

      console.log(`✅ Projeto criado: ${project._id}`);

      res.status(201).json({
        status: 'success',
        message: 'Projeto criado com sucesso',
        data: {
          project: {
            id: project._id,
            name: project.name,
            description: project.description,
            status: project.status,
            createdAt: project.createdAt,
          },
        },
      });
    } catch (error) {
      console.error('❌ Erro no upload CSV:', error);
      res.status(500).json({
        status: 'error',
        message: 'Erro no processamento do CSV',
      });
    }
  }
);

// Endpoint para buscar dados de um projeto específico
app.get('/api/projects/:id/:type', async (req, res) => {
  try {
    const { id, type } = req.params;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({
        status: 'error',
        message: 'Projeto não encontrado',
      });
    }

    let data = [];
    switch (type) {
      case 'procedimento-parada':
        data = project.csvData.procedimentoParada || [];
        break;
      case 'manutencao':
        data = project.csvData.manutencao || [];
        break;
      case 'procedimento-partida':
        data = project.csvData.procedimentoPartida || [];
        break;
      default:
        return res.status(400).json({
          status: 'error',
          message: 'Tipo inválido',
        });
    }

    res.json({
      status: 'success',
      data: data,
    });
  } catch (error) {
    console.error('Erro ao buscar dados do projeto:', error);
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
