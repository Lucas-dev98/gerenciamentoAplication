# Development

npm start # Production server
npm run dev # Development server with nodemon

# Testing

npm test # Jest unit/integration tests
npm run test-enhanced-server # Enhanced server with all features
npm run test-quick # Quick validation tests
npm run test-routes # Legacy route tests
npm run test-projects # Project management tests
npm run test-notices # Notice management tests

# Code Quality

npm run lint # ESLint code checking
npm run format # Prettier code formatting

# EPU-Gestão Backend API

## 📋 Rotas Disponíveis

### 🔐 Autenticação (`/api/auth`)

#### **Rotas Públicas** (sem autenticação)

```http
POST /api/auth/register  # Registrar novo usuário
POST /api/auth/login     # Login de usuário
```

#### **Rotas Protegidas** (requerem JWT token)

```http
GET /api/auth/users       # Listar todos os usuários
GET /api/auth/users/:id   # Obter usuário por ID
PUT /api/auth/users/:id   # Atualizar usuário
```

---

### 📁 Projetos (`/api/projects`)

**Todas as rotas protegidas** (requerem JWT token)

#### **CRUD Básico**

```http
POST   /api/projects        # Criar projeto
GET    /api/projects        # Listar todos os projetos
GET    /api/projects/:id    # Obter projeto por ID
PUT    /api/projects/:id    # Atualizar projeto
DELETE /api/projects/:id    # Deletar projeto
```

#### **Funcionalidades Específicas**

```http
GET    /api/projects/user/:userId        # Projetos de um usuário específico
POST   /api/projects/:id/team            # Adicionar membro à equipe
DELETE /api/projects/:id/team/:userId    # Remover membro da equipe
```

---

### 📢 Avisos/Notices (`/api/notices`)

**Todas as rotas protegidas** (requerem JWT token)

#### **CRUD Básico**

```http
POST   /api/notices        # Criar aviso
GET    /api/notices        # Listar todos os avisos
GET    /api/notices/:id    # Obter aviso por ID
PUT    /api/notices/:id    # Atualizar aviso
DELETE /api/notices/:id    # Deletar aviso
```

#### **Funcionalidades Específicas**

```http
GET    /api/notices/active              # Listar avisos ativos
GET    /api/notices/pinned              # Listar avisos fixados
GET    /api/notices/statistics          # Obter estatísticas
GET    /api/notices/author/:authorId    # Avisos de um autor específico
POST   /api/notices/:id/read            # Marcar aviso como lido
```

---

## 🔒 Segurança e Middleware

### **Rate Limiting**

- **Autenticação**: 5 tentativas por 15 minutos
- **API Geral**: 100 requests por 15 minutos
- **Operações Sensíveis**: 10 requests por 15 minutos

### **Validação de Entrada**

- Validação completa para todos os endpoints
- Mensagens de erro detalhadas em português
- Sanitização de dados de entrada

### **Autenticação JWT**

- Token necessário no header: `Authorization: Bearer <token>`
- Todas as rotas protegidas verificam token válido

---

## 📝 Exemplos de Uso

### **1. Registrar Usuário**

```bash
POST /api/auth/register
Content-Type: application/json

{
  "nome": "João Silva",
  "email": "joao@example.com",
  "senha": "senha123",
  "tipo": "student"
}
```

### **2. Login**

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "joao@example.com",
  "senha": "senha123"
}
```

### **3. Criar Projeto (com token)**

```bash
POST /api/projects
Authorization: Bearer <seu_token_jwt>
Content-Type: application/json

{
  "name": "Projeto EPU 2025",
  "description": "Projeto de gestão acadêmica",
  "status": "active",
  "priority": "high",
  "budget": 15000
}
```

### **4. Criar Aviso (com token)**

```bash
POST /api/notices
Authorization: Bearer <seu_token_jwt>
Content-Type: application/json

{
  "title": "Aviso Importante",
  "content": "Conteúdo do aviso aqui...",
  "type": "announcement",
  "priority": "medium",
  "isPinned": true
}
```

---

## 🚀 Scripts Disponíveis
