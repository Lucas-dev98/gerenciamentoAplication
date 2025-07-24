# 🔄 **FLUXO COMPLETO DE CRIAÇÃO DE EQUIPES**

## 📱 **1. FRONTEND (React/TypeScript)**

### **🎨 Interface do Usuário**

```typescript
// TeamsWorking.tsx ou Teams.tsx

interface Team {
  _id: string;
  name: string;
  description: string;
  department: string;
  status?: 'Ativa' | 'Inativa' | 'Em Formação';
  members: Member[];
  leader?: Member;
}

interface TeamFormData {
  name: string;
  description: string;
  department: string;
}
```

### **⚡ Função de Criação**

```typescript
const handleCreateTeam = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    // 1️⃣ Fazer requisição HTTP POST para API
    const response = await api.post('/teams', formData);

    // 2️⃣ Atualizar estado local
    setTeams((prevTeams) => [...prevTeams, response.data.data]);

    // 3️⃣ Fechar modal e limpar formulário
    setShowCreateModal(false);
    setFormData({ name: '', description: '', department: '' });

    // 4️⃣ Mostrar feedback de sucesso
    showSuccess('✅ Equipe criada com sucesso!');

    // 5️⃣ Recarregar dados para consistência
    fetchTeams();
  } catch (error: any) {
    // 6️⃣ Tratamento de erros
    const errorMessage =
      error.response?.data?.message || 'Erro ao criar equipe';
    setError(errorMessage);
    showError(`❌ ${errorMessage}`);
  }
};
```

### **🌐 Serviço de API**

```typescript
// services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 🚀 **2. ROTEAMENTO HTTP**

### **📡 Requisição HTTP**

```
POST /api/teams
Headers:
  - Content-Type: application/json
  - Authorization: Bearer <JWT_TOKEN>
Body:
{
  "name": "Equipe de Desenvolvimento",
  "description": "Responsável pelo desenvolvimento de software",
  "department": "Tecnologia"
}
```

---

## ⚙️ **3. BACKEND (Node.js/Express)**

### **🛣️ Roteamento**

```javascript
// routes/teamRoutes.js
const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const authMiddleware = require('../middlewares/authMiddleware');

// Middleware de autenticação (temporariamente desabilitado)
// router.use(authMiddleware);

// Rota de criação de equipe
router.post('/', teamController.createTeam);
```

### **🔐 Middleware de Autenticação**

```javascript
// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Token de acesso não fornecido',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: 'Token inválido',
    });
  }
};
```

### **🎮 Controller**

```javascript
// controllers/teamController.js
const createTeam = async (req, res, next) => {
  try {
    // 1️⃣ Log da operação
    logger.info('CREATE_TEAM: Starting team creation', {
      userId: req.user?.id || 'anonymous',
      body: req.body,
    });

    const { name, description, department } = req.body;

    // 2️⃣ Validação de dados
    if (!name || name.trim().length < 3) {
      return res.status(400).json({
        status: 'error',
        type: 'VALIDATION_ERROR',
        message: 'Nome da equipe deve ter pelo menos 3 caracteres',
      });
    }

    if (!department || department.trim().length < 3) {
      return res.status(400).json({
        status: 'error',
        type: 'VALIDATION_ERROR',
        message: 'Departamento deve ter pelo menos 3 caracteres',
      });
    }

    // 3️⃣ Verificar duplicatas
    const existingTeam = await Team.findOne({
      name: name.trim(),
      isActive: true,
    });

    if (existingTeam) {
      return res.status(409).json({
        status: 'error',
        type: 'CONFLICT_ERROR',
        message: 'Já existe uma equipe com este nome',
      });
    }

    // 4️⃣ Preparar dados da equipe
    const teamData = {
      name: name.trim(),
      description: description?.trim(),
      department: department.trim(),
      color: '#3498db',
      budget: 0,
      goals: [],
      createdBy: req.user?.id || '60d5ecb54b24a03d1c8b4567',
    };

    // 5️⃣ Criar equipe no banco de dados
    const team = await Team.create(teamData);

    // 6️⃣ Log de sucesso
    logger.info('CREATE_TEAM: Team created successfully', {
      teamId: team._id,
      teamName: team.name,
      department: team.department,
    });

    // 7️⃣ Resposta de sucesso
    res.status(201).json({
      status: 'success',
      message: 'Equipe criada com sucesso',
      data: {
        team: {
          _id: team._id,
          name: team.name,
          description: team.description,
          department: team.department,
          color: team.color,
          budget: team.budget,
          createdAt: team.createdAt,
        },
      },
    });
  } catch (error) {
    // 8️⃣ Tratamento de erros
    logger.error('CREATE_TEAM: Failed to create team', {
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
};
```

---

## 🗄️ **4. BANCO DE DADOS (MongoDB/Mongoose)**

### **📋 Schema da Equipe**

```javascript
// models/teamModels.js
const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    department: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      default: null,
    },
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
    },
    budget: {
      type: Number,
      default: 0,
    },
    goals: [
      {
        title: String,
        description: String,
        deadline: Date,
        completed: { type: Boolean, default: false },
      },
    ],
    stats: {
      totalMembers: { type: Number, default: 0 },
      activeMembers: { type: Number, default: 0 },
      birthdaysThisMonth: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);
```

---

## 📊 **5. FLUXO COMPLETO VISUAL**

```
1. 👤 Usuário clica "➕ Nova Equipe"
   ↓
2. 📝 Modal de criação abre
   ↓
3. 👤 Usuário preenche formulário:
   - Nome: "Equipe de Desenvolvimento"
   - Descrição: "Responsável pelo desenvolvimento"
   - Departamento: "Tecnologia"
   ↓
4. 👤 Usuário clica "Criar Equipe"
   ↓
5. 🌐 Frontend faz POST /api/teams
   ↓
6. 🔐 Middleware de autenticação verifica token
   ↓
7. 🎮 Controller recebe requisição
   ↓
8. ✅ Validação de dados
   ↓
9. 🔍 Verificação de duplicatas
   ↓
10. 💾 Criação no MongoDB
    ↓
11. 📤 Resposta de sucesso para frontend
    ↓
12. 🎉 Frontend atualiza interface
    ↓
13. ✅ Toast de sucesso exibido
    ↓
14. 🔄 Lista de equipes recarregada
```

---

## 🛠️ **6. TRATAMENTO DE ERROS**

### **Frontend:**

- Validação de formulário
- Tratamento de erros HTTP
- Exibição de mensagens de erro
- Fallback para dados mock

### **Backend:**

- Validação de entrada
- Verificação de duplicatas
- Logging de operações
- Resposta estruturada de erros

### **Banco de Dados:**

- Validação de schema
- Constraints de unicidade
- Tratamento de erros de conexão

---

## 🎯 **7. MELHORIAS POSSÍVEIS**

1. **Validação mais robusta** no frontend
2. **Upload de avatar** para equipe
3. **Assignação automática** de membros
4. **Notificações** para membros da equipe
5. **Auditoria** de operações
6. **Backup** automático
7. **Métricas** de performance
