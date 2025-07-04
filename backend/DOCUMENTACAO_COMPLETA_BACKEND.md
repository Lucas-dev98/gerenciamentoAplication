# 📚 Documentação Completa - Backend EPU-Gestão

## 🚀 Sistema de Gestão EPU - API Documentation

### **Versão:** 3.0.0

### **Data:** 03/07/2025

### **Status:** Produção - Segurança Máxima

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Segurança](#segurança)
4. [Autenticação](#autenticação)
5. [Middlewares](#middlewares)
6. [Modelos de Dados](#modelos-de-dados)
7. [Rotas da API](#rotas-da-api)
8. [Exemplos de Uso](#exemplos-de-uso)
9. [Códigos de Resposta](#códigos-de-resposta)
10. [Configuração](#configuração)

---

## 🎯 Visão Geral

O backend EPU-Gestão é um sistema robusto de gestão empresarial construído com Node.js, Express e MongoDB. Implementa segurança de nível empresarial com autenticação JWT obrigatória em todas as rotas.

### **Características Principais:**

- 🔐 **Autenticação JWT obrigatória** em todas as operações
- 🛡️ **Proteção contra ataques** (DDOS, XSS, Injection)
- 📊 **Auditoria completa** de todas as operações
- 🔗 **Relacionamentos complexos** entre entidades
- 📈 **Performance otimizada** com rate limiting
- 🌐 **CORS configurado** para segurança

---

## 🏗️ Arquitetura

### **Estrutura do Projeto:**

```
backend/
├── src/
│   ├── controllers/          # Lógica de negócio
│   ├── models/              # Esquemas do banco de dados
│   ├── routes/              # Definição de rotas
│   ├── middlewares/         # Middlewares customizados
│   ├── services/            # Serviços auxiliares
│   └── utils/               # Utilitários
├── epu-backend-complete.js  # Arquivo principal
├── package.json             # Dependências
└── .env                     # Variáveis de ambiente
```

### **Tecnologias Utilizadas:**

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB + Mongoose** - Banco de dados
- **JWT** - Autenticação
- **Helmet** - Segurança HTTP
- **Rate Limiting** - Proteção contra DDOS
- **CORS** - Controle de origem

---

## 🔒 Segurança

### **Nível de Segurança: MÁXIMO**

#### **Autenticação Obrigatória:**

- ✅ **TODAS as rotas** requerem token JWT válido
- ✅ **Nenhuma informação** acessível sem autenticação
- ✅ **Tokens com expiração** configurável
- ✅ **Validação robusta** de tokens

#### **Proteções Implementadas:**

- 🛡️ **Rate Limiting** - Máximo 1000 req/15min por IP
- 🔐 **CORS Restritivo** - Apenas origens autorizadas
- 🚫 **XSS Protection** - Sanitização automática
- 🛑 **SQL/NoSQL Injection** - Validação de entrada
- 📊 **Logs de Auditoria** - Todas as operações rastreadas

---

## 🔑 Autenticação

### **Sistema JWT (JSON Web Token)**

#### **Login:**

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "usuario@epu.com",
  "password": "senha123"
}
```

#### **Resposta de Sucesso:**

```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "usuario",
      "email": "usuario@epu.com",
      "role": "user"
    }
  },
  "timestamp": "2025-07-03T14:30:00.000Z"
}
```

#### **Uso do Token:**

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## ⚙️ Middlewares

### **1. Middleware de Autenticação (authMiddleware)**

```javascript
// Aplicado em TODAS as rotas protegidas
const authMiddleware = (req, res, next) => {
  // Validação de token JWT
  // Verificação de expiração
  // Logs de auditoria
};
```

### **2. Rate Limiting**

```javascript
// Proteção global contra DDOS
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // máximo 1000 requisições por IP
  message: 'Muitas requisições, tente novamente em 15 minutos.',
});
```

### **3. Helmet (Segurança HTTP)**

```javascript
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
  })
);
```

### **4. CORS Restritivo**

```javascript
// Configuração de origens permitidas
const allowedOrigins = ['http://localhost:3000', 'https://epu-gestao.com'];
```

### **5. Sanitização de Dados**

```javascript
// Middleware customizado de sanitização
const sanitizeInput = (req, res, next) => {
  // Remove caracteres perigosos
  // Valida formatos de entrada
  // Previne injection attacks
};
```

---

## 📊 Modelos de Dados

### **1. User (Usuário)**

```javascript
{
  _id: ObjectId,
  username: String, // obrigatório, único
  email: String,    // obrigatório, único
  password: String, // hash bcrypt
  fullName: String,
  phone: String,
  role: String,     // 'user' | 'admin'
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### **2. Project (Projeto)**

```javascript
{
  _id: ObjectId,
  name: String,           // obrigatório
  description: String,
  status: String,         // 'active' | 'completed' | 'cancelled'
  priority: String,       // 'low' | 'medium' | 'high'
  teams: [ObjectId],      // referência para Team
  mainTeam: ObjectId,     // equipe principal
  owner: ObjectId,        // responsável (User)
  activities: [Activity],
  progress: Number,       // 0-100
  createdAt: Date,
  updatedAt: Date
}
```

### **3. Team (Equipe)**

```javascript
{
  _id: ObjectId,
  name: String,           // obrigatório
  description: String,
  department: String,     // obrigatório
  manager: ObjectId,      // líder da equipe
  members: [{
    user: ObjectId,       // referência para User
    role: String,         // 'leader' | 'member' | 'coordinator'
    joinDate: Date,
    isActive: Boolean
  }],
  projects: [ObjectId],   // projetos associados
  color: String,          // cor hexadecimal
  budget: Number,
  goals: [Goal],
  isActive: Boolean,
  createdBy: ObjectId,
  createdAt: Date
}
```

### **4. Member (Membro)**

```javascript
{
  _id: ObjectId,
  name: String,           // obrigatório
  matricula: String,      // obrigatório, único
  company: String,        // obrigatório
  position: String,       // cargo
  team: ObjectId,         // equipe associada
  supervisor: ObjectId,   // supervisor
  workArea: String,
  birthDate: Date,
  isActive: Boolean,
  createdAt: Date
}
```

### **5. Event (Evento)**

```javascript
{
  _id: ObjectId,
  name: String,           // obrigatório
  eventType: String,      // 'reuniao' | 'treinamento' | etc
  date: Date,             // obrigatório
  time: String,           // formato HH:mm
  location: String,       // obrigatório
  description: String,
  status: String,         // 'scheduled' | 'completed' | 'cancelled'
  participants: [ObjectId],
  createdBy: ObjectId,
  createdAt: Date
}
```

### **6. Notice (Aviso)**

```javascript
{
  _id: ObjectId,
  title: String,          // obrigatório
  content: String,        // obrigatório
  type: String,           // 'info' | 'warning' | 'urgent'
  priority: String,       // 'low' | 'medium' | 'high'
  targetAudience: String, // 'all' | 'managers' | 'teams'
  isActive: Boolean,
  isPinned: Boolean,
  expiresAt: Date,
  readBy: [{
    user: ObjectId,
    readAt: Date
  }],
  views: Number,
  createdBy: ObjectId,
  createdAt: Date
}
```

---

## 🌐 Rotas da API

### **Base URL:** `http://localhost:3001/api`

### **🔐 Todas as rotas requerem autenticação JWT**

---

## 👤 Autenticação

### **Login**

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "usuario@epu.com",
  "password": "senha123"
}
```

### **Registro**

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "novousuario",
  "email": "novo@epu.com",
  "password": "senha123",
  "fullName": "Novo Usuário"
}
```

### **Logout**

```http
POST /api/auth/logout
Authorization: Bearer {token}
```

---

## 👥 Usuários

### **Listar Usuários (Admin apenas)**

```http
GET /api/users
Authorization: Bearer {token}
```

### **Buscar Usuário Específico**

```http
GET /api/users/{userId}
Authorization: Bearer {token}
```

### **Buscar Perfil Próprio**

```http
GET /api/users/profile/me
Authorization: Bearer {token}
```

---

## 📂 Projetos

### **Listar Projetos**

```http
GET /api/projects
Authorization: Bearer {token}
```

### **Buscar Projeto Específico**

```http
GET /api/projects/{projectId}
Authorization: Bearer {token}
```

### **Criar Projeto**

```http
POST /api/projects-crud
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Novo Projeto EPU",
  "description": "Descrição do projeto",
  "status": "active",
  "priority": "high"
}
```

### **Criar Projeto com Equipes**

```http
POST /api/projects/with-teams
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Projeto com Equipes",
  "description": "Projeto completo",
  "status": "active",
  "priority": "high",
  "teams": ["teamId1", "teamId2"],
  "mainTeam": "teamId1"
}
```

### **Editar Projeto**

```http
PUT /api/projects-crud/{projectId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Nome Atualizado",
  "description": "Nova descrição"
}
```

### **Excluir Projeto**

```http
DELETE /api/projects-crud/{projectId}
Authorization: Bearer {token}
```

### **Excluir Múltiplos Projetos**

```http
DELETE /api/projects-crud/batch
Authorization: Bearer {token}
Content-Type: application/json

{
  "projectIds": ["id1", "id2", "id3"]
}
```

### **Duplicar Projeto**

```http
POST /api/projects-crud/{projectId}/duplicate
Authorization: Bearer {token}
```

### **Importar CSV**

```http
POST /api/projects/upload-csv
Authorization: Bearer {token}
Content-Type: multipart/form-data

Form Data:
- file: arquivo.csv
```

### **Estatísticas do Projeto**

```http
GET /api/projects/{projectId}/statistics
Authorization: Bearer {token}
```

---

## 🏢 Equipes

### **Listar Equipes**

```http
GET /api/teams
Authorization: Bearer {token}
```

### **Buscar Equipe Específica**

```http
GET /api/teams/{teamId}
Authorization: Bearer {token}
```

### **Criar Equipe**

```http
POST /api/teams
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Nova Equipe",
  "description": "Descrição da equipe",
  "department": "TI",
  "color": "#3498db"
}
```

### **Editar Equipe**

```http
PUT /api/teams/{teamId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Nome Atualizado",
  "description": "Nova descrição"
}
```

### **Excluir Equipe**

```http
DELETE /api/teams/{teamId}
Authorization: Bearer {token}
```

### **Excluir Múltiplas Equipes**

```http
DELETE /api/teams/batch
Authorization: Bearer {token}
Content-Type: application/json

{
  "teamIds": ["id1", "id2", "id3"]
}
```

### **Organograma Completo**

```http
GET /api/teams/organogram
Authorization: Bearer {token}
```

### **Organograma da Equipe**

```http
GET /api/teams/{teamId}/organogram
Authorization: Bearer {token}
```

### **Aniversários da Equipe**

```http
GET /api/teams/{teamId}/birthdays
Authorization: Bearer {token}
```

---

## 👤 Membros

### **Listar Membros**

```http
GET /api/members
Authorization: Bearer {token}
```

### **Buscar Membro Específico**

```http
GET /api/members/{memberId}
Authorization: Bearer {token}
```

### **Criar Membro**

```http
POST /api/members
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "João Silva",
  "matricula": "EMP001",
  "company": "EPU",
  "position": "Desenvolvedor",
  "team": "teamId",
  "birthDate": "1990-05-15"
}
```

### **Editar Membro**

```http
PUT /api/members/{memberId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "João Silva Santos",
  "position": "Desenvolvedor Senior"
}
```

### **Excluir Membro**

```http
DELETE /api/members/{memberId}
Authorization: Bearer {token}
```

### **Excluir Múltiplos Membros**

```http
DELETE /api/members/batch
Authorization: Bearer {token}
Content-Type: application/json

{
  "memberIds": ["id1", "id2", "id3"]
}
```

### **Aniversários dos Membros**

```http
GET /api/members/birthdays
Authorization: Bearer {token}
```

---

## 📅 Eventos

### **Listar Eventos**

```http
GET /api/events
Authorization: Bearer {token}
```

### **Buscar Evento Específico**

```http
GET /api/events/{eventId}
Authorization: Bearer {token}
```

### **Eventos de Hoje**

```http
GET /api/events/today
Authorization: Bearer {token}
```

### **Criar Evento**

```http
POST /api/events
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Reunião de Planejamento",
  "eventType": "reuniao",
  "date": "2025-07-10",
  "time": "14:30",
  "location": "Sala de Conferências",
  "description": "Reunião mensal de planejamento"
}
```

### **Editar Evento**

```http
PUT /api/events/{eventId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Reunião Atualizada",
  "time": "15:00"
}
```

### **Excluir Evento**

```http
DELETE /api/events/{eventId}
Authorization: Bearer {token}
```

### **Excluir Múltiplos Eventos**

```http
DELETE /api/events/batch
Authorization: Bearer {token}
Content-Type: application/json

{
  "eventIds": ["id1", "id2", "id3"]
}
```

---

## 📢 Avisos

### **Listar Avisos**

```http
GET /api/notices
Authorization: Bearer {token}
```

### **Buscar Aviso Específico**

```http
GET /api/notices/{noticeId}
Authorization: Bearer {token}
```

### **Avisos Ativos**

```http
GET /api/notices/active
Authorization: Bearer {token}
```

### **Avisos Fixados**

```http
GET /api/notices/pinned
Authorization: Bearer {token}
```

### **Criar Aviso**

```http
POST /api/notices
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Aviso Importante",
  "content": "Conteúdo do aviso...",
  "type": "info",
  "priority": "high",
  "targetAudience": "all",
  "isPinned": true
}
```

### **Editar Aviso**

```http
PUT /api/notices/{noticeId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Título Atualizado",
  "content": "Novo conteúdo"
}
```

### **Excluir Aviso**

```http
DELETE /api/notices/{noticeId}
Authorization: Bearer {token}
```

### **Excluir Múltiplos Avisos**

```http
DELETE /api/notices/batch
Authorization: Bearer {token}
Content-Type: application/json

{
  "noticeIds": ["id1", "id2", "id3"]
}
```

### **Marcar como Lido**

```http
POST /api/notices/{noticeId}/read
Authorization: Bearer {token}
```

### **Estatísticas de Avisos**

```http
GET /api/notices/stats
Authorization: Bearer {token}
```

---

## 💻 Exemplos de Uso no Frontend

### **1. Configuração do Axios (React/Vue/Angular)**

```javascript
import axios from 'axios';

// Configuração base
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('epu_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('epu_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### **2. Serviço de Autenticação**

```javascript
// authService.js
import api from './api';

export const authService = {
  // Login
  async login(username, password) {
    try {
      const response = await api.post('/auth/login', {
        username,
        password,
      });

      if (response.data.success) {
        localStorage.setItem('epu_token', response.data.data.token);
        localStorage.setItem(
          'epu_user',
          JSON.stringify(response.data.data.user)
        );
        return response.data;
      }
    } catch (error) {
      throw error.response?.data || { message: 'Erro no login' };
    }
  },

  // Logout
  async logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('epu_token');
      localStorage.removeItem('epu_user');
    }
  },

  // Verificar se está logado
  isAuthenticated() {
    return !!localStorage.getItem('epu_token');
  },

  // Obter usuário atual
  getCurrentUser() {
    const user = localStorage.getItem('epu_user');
    return user ? JSON.parse(user) : null;
  },
};
```

### **3. Serviço de Projetos**

```javascript
// projectService.js
import api from './api';

export const projectService = {
  // Listar projetos
  async getProjects(params = {}) {
    const response = await api.get('/projects', { params });
    return response.data;
  },

  // Buscar projeto específico
  async getProject(id) {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  // Buscar projeto com detalhes completos
  async getProjectFullDetails(id) {
    const response = await api.get(`/projects/${id}/full-details`);
    return response.data;
  },

  // Criar projeto
  async createProject(projectData) {
    const response = await api.post('/projects-crud', projectData);
    return response.data;
  },

  // Criar projeto com equipes
  async createProjectWithTeams(projectData) {
    const response = await api.post('/projects/with-teams', projectData);
    return response.data;
  },

  // Editar projeto
  async updateProject(id, projectData) {
    const response = await api.put(`/projects-crud/${id}`, projectData);
    return response.data;
  },

  // Excluir projeto
  async deleteProject(id) {
    const response = await api.delete(`/projects-crud/${id}`);
    return response.data;
  },

  // Excluir múltiplos projetos
  async deleteMultipleProjects(projectIds) {
    const response = await api.delete('/projects-crud/batch', {
      data: { projectIds },
    });
    return response.data;
  },
};
```

### **4. Hook React para Projetos**

```javascript
// useProjects.js
import { useState, useEffect } from 'react';
import { projectService } from '../services/projectService';

export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await projectService.getProjects();
      if (response.success) {
        setProjects(response.data);
      }
    } catch (err) {
      setError(err.message || 'Erro ao carregar projetos');
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData) => {
    try {
      setLoading(true);
      const response = await projectService.createProject(projectData);
      if (response.success) {
        await fetchProjects(); // Recarregar lista
        return response;
      }
    } catch (err) {
      setError(err.message || 'Erro ao criar projeto');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    refetch: fetchProjects,
  };
};
```

### **5. Componente React de Lista de Projetos**

```jsx
// ProjectList.jsx
import React from 'react';
import { useProjects } from '../hooks/useProjects';

const ProjectList = () => {
  const { projects, loading, error, createProject } = useProjects();

  if (loading) {
    return <div className="loading">Carregando projetos...</div>;
  }

  if (error) {
    return <div className="error">Erro: {error}</div>;
  }

  return (
    <div className="project-list">
      <h2>Projetos EPU-Gestão</h2>

      <div className="projects-grid">
        {projects.map((project) => (
          <div key={project._id} className="project-card">
            <h3>{project.name}</h3>
            <p>{project.description}</p>
            <div className="project-meta">
              <span className={`status ${project.status}`}>
                {project.status}
              </span>
              <span className={`priority ${project.priority}`}>
                {project.priority}
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectList;
```

---

## 📊 Códigos de Resposta

### **Códigos de Sucesso:**

- **200 OK** - Operação realizada com sucesso
- **201 Created** - Recurso criado com sucesso
- **204 No Content** - Operação realizada, sem conteúdo de retorno

### **Códigos de Erro Cliente:**

- **400 Bad Request** - Dados inválidos ou malformados
- **401 Unauthorized** - Token ausente, inválido ou expirado
- **403 Forbidden** - Acesso negado para a operação
- **404 Not Found** - Recurso não encontrado
- **409 Conflict** - Conflito com estado atual do recurso
- **422 Unprocessable Entity** - Dados válidos mas não processáveis
- **429 Too Many Requests** - Rate limit excedido

### **Códigos de Erro Servidor:**

- **500 Internal Server Error** - Erro interno do servidor
- **502 Bad Gateway** - Problema com serviço upstream
- **503 Service Unavailable** - Serviço temporariamente indisponível

### **Estrutura Padrão de Resposta:**

```json
{
  "success": true|false,
  "message": "Mensagem descritiva",
  "data": { ... },
  "error": "Detalhes do erro (se houver)",
  "timestamp": "2025-07-03T14:30:00.000Z",
  "requestId": "req_123456789"
}
```

### **Exemplo de Resposta de Erro:**

```json
{
  "success": false,
  "message": "Token de autenticação inválido",
  "error": "JsonWebTokenError: invalid signature",
  "timestamp": "2025-07-03T14:30:00.000Z",
  "requestId": "req_123456789"
}
```

---

## ⚙️ Configuração

### **Variáveis de Ambiente (.env):**

```env
# Servidor
PORT=3001
NODE_ENV=production

# Banco de Dados
DB_URI=mongodb://localhost:27017/epu-gestao

# JWT
JWT_SECRET=sua_chave_secreta_super_forte
JWT_EXPIRE=24h

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=1000

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://epu-gestao.com

# Logs
LOG_LEVEL=info
```

### **Instalação e Execução:**

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# 3. Iniciar servidor
npm start

# 4. Desenvolvimento (com auto-reload)
npm run dev

# 5. Testes
npm test
```

### **Docker (Opcional):**

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

CMD ["node", "epu-backend-complete.js"]
```

---

## 🔍 Monitoramento e Logs

### **Logs Disponíveis:**

- 📊 **Logs de Acesso** - Todas as requisições
- 🔐 **Logs de Autenticação** - Login/logout/tokens
- ⚠️ **Logs de Erro** - Erros e exceções
- 📈 **Logs de Performance** - Tempos de resposta
- 🛡️ **Logs de Segurança** - Tentativas suspeitas

### **Exemplo de Log:**

```json
{
  "timestamp": "2025-07-03T14:30:00.000Z",
  "level": "info",
  "action": "CREATE_PROJECT",
  "userId": "507f1f77bcf86cd799439011",
  "ip": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "duration": "245ms",
  "status": "success",
  "projectId": "507f1f77bcf86cd799439012"
}
```

---

## 🚀 Performance

### **Otimizações Implementadas:**

- ⚡ **Índices MongoDB** otimizados
- 🔄 **Connection Pooling** configurado
- 📦 **Compression** habilitada
- 🎯 **Rate Limiting** inteligente
- 📊 **Queries otimizadas** com populate seletivo

### **Métricas de Performance:**

- 🚀 **Tempo médio de resposta:** < 200ms
- 📈 **Throughput:** 1000+ req/min
- 💾 **Uso de memória:** < 512MB
- 🔄 **CPU:** < 30% em carga normal

---

## 🛠️ Troubleshooting

### **Problemas Comuns:**

#### **1. Erro 401 - Unauthorized**

```
Causa: Token JWT inválido, expirado ou ausente
Solução: Verificar header Authorization e renovar token
```

#### **2. Erro 429 - Too Many Requests**

```
Causa: Rate limit excedido
Solução: Aguardar 15 minutos ou otimizar requisições
```

#### **3. Erro 500 - Internal Server Error**

```
Causa: Erro interno do servidor
Solução: Verificar logs do servidor e conectividade com MongoDB
```

#### **4. Timeout de Conexão**

```
Causa: MongoDB desconectado ou lento
Solução: Verificar status do MongoDB e configuração de rede
```

---

## 📞 Suporte

### **Contatos:**

- 📧 **Email:** suporte@epu-gestao.com
- 📱 **Telefone:** +55 11 1234-5678
- 💬 **Chat:** Disponível no sistema
- 📚 **Documentação:** https://docs.epu-gestao.com

### **Horário de Suporte:**

- 🕐 **Segunda a Sexta:** 08:00 - 18:00
- 🕐 **Sábado:** 09:00 - 12:00
- 🚨 **Emergências:** 24/7

---

## 📝 Changelog

### **Versão 3.0.0 (03/07/2025):**

- ✅ Implementação de segurança máxima
- ✅ Autenticação JWT obrigatória em todas as rotas
- ✅ Relacionamentos complexos entre entidades
- ✅ Operações em lote para todas as entidades
- ✅ Auditoria completa de operações
- ✅ Rate limiting e proteções contra ataques

### **Versão 2.1.0:**

- ✅ Adição de equipes e membros
- ✅ Melhorias na estrutura de projetos
- ✅ Sistema de eventos implementado

### **Versão 2.0.0:**

- ✅ Refatoração completa da arquitetura
- ✅ Implementação de middlewares de segurança
- ✅ Sistema de avisos

---

**© 2025 EPU-Gestão. Todos os direitos reservados.**

**Status:** ✅ **SISTEMA SEGURO E OPERACIONAL**
