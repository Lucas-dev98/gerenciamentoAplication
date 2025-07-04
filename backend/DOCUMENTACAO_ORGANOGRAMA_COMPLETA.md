# 📊 Documentação Completa do Sistema de Organograma

## 🎯 Visão Geral

O sistema de organograma do EPU-Gestão permite a visualização e gestão hierárquica de:

- **Projetos** → contêm **Equipes**
- **Equipes** → contêm **Membros**
- **Organograma Completo** → visualização global da estrutura

## 🔗 Estrutura Hierárquica

```
📂 PROJETO
├── 👥 EQUIPE PRINCIPAL (mainTeam)
│   ├── 👤 MEMBRO 1 (Leader)
│   ├── 👤 MEMBRO 2 (Member)
│   └── 👤 MEMBRO 3 (Analyst)
├── 👥 EQUIPE SECUNDÁRIA
│   ├── 👤 MEMBRO 4 (Coordinator)
│   └── 👤 MEMBRO 5 (Member)
└── 👤 RESPONSÁVEL (Owner)
```

## 🛡️ Segurança

**TODAS as rotas de organograma são protegidas por autenticação JWT:**

- ✅ Visualização de organograma completo
- ✅ Visualização de organograma por projeto
- ✅ Adição de equipes a projetos
- ✅ Remoção de equipes de projetos
- ✅ Adição de membros a equipes
- ✅ Remoção de membros de equipes

## 📋 Rotas Disponíveis

### 🌐 Organograma Completo

```http
GET /api/organogram
Authorization: Bearer {token}
```

**Resposta:**

```json
{
  "success": true,
  "message": "Organograma completo recuperado com sucesso",
  "data": {
    "projects": [
      {
        "_id": "project_id",
        "name": "Projeto EPU",
        "description": "Descrição do projeto",
        "status": "active",
        "owner": { "username": "admin", "email": "admin@epu.com" },
        "teams": ["team_id_1", "team_id_2"],
        "mainTeam": "team_id_1",
        "stats": {
          "teamsCount": 2,
          "membersCount": 5
        }
      }
    ],
    "teams": [
      {
        "_id": "team_id_1",
        "name": "Equipe de Desenvolvimento",
        "department": "TI",
        "description": "Equipe responsável pelo desenvolvimento",
        "members": [
          {
            "user": { "username": "dev1", "email": "dev1@epu.com" },
            "role": "leader",
            "isActive": true
          }
        ],
        "stats": {
          "membersCount": 3,
          "activeMembers": 3
        }
      }
    ],
    "members": [
      {
        "_id": "member_id",
        "name": "João Silva",
        "matricula": "DEV001",
        "company": "EPU",
        "position": "Desenvolvedor Senior",
        "team": "team_id_1"
      }
    ],
    "statistics": {
      "totalProjects": 1,
      "totalTeams": 2,
      "totalMembers": 5,
      "activeProjects": 1
    }
  }
}
```

### 📊 Organograma por Projeto

```http
GET /api/organogram/project/{projectId}
Authorization: Bearer {token}
```

**Resposta:**

```json
{
  "success": true,
  "message": "Organograma do projeto recuperado com sucesso",
  "data": {
    "project": {
      "_id": "project_id",
      "name": "Projeto EPU",
      "description": "Descrição do projeto",
      "owner": { "username": "admin", "email": "admin@epu.com" },
      "mainTeam": { "name": "Equipe Principal", "department": "TI" }
    },
    "teams": [
      {
        "_id": "team_id",
        "name": "Equipe de Desenvolvimento",
        "department": "TI",
        "members": [
          {
            "user": { "username": "dev1", "email": "dev1@epu.com" },
            "role": "leader"
          }
        ],
        "isMainTeam": true
      }
    ],
    "members": [
      {
        "_id": "member_id",
        "name": "João Silva",
        "position": "Desenvolvedor Senior",
        "team": { "name": "Equipe de Desenvolvimento" }
      }
    ],
    "hierarchy": {
      "owner": { "username": "admin", "email": "admin@epu.com" },
      "mainTeam": { "name": "Equipe Principal" },
      "secondaryTeams": [{ "name": "Equipe de QA" }]
    }
  }
}
```

### 🏢 Adicionar Equipe a Projeto

```http
POST /api/organogram/project/{projectId}/teams
Authorization: Bearer {token}
Content-Type: application/json

{
  "teamId": "team_id",
  "isMainTeam": false
}
```

**Resposta:**

```json
{
  "success": true,
  "message": "Equipe adicionada ao projeto com sucesso",
  "data": {
    "project": {
      "_id": "project_id",
      "name": "Projeto EPU",
      "teamsCount": 2
    },
    "team": {
      "_id": "team_id",
      "name": "Nova Equipe",
      "department": "TI"
    }
  }
}
```

### 🗑️ Remover Equipe de Projeto

```http
DELETE /api/organogram/project/{projectId}/teams/{teamId}
Authorization: Bearer {token}
```

### 👤 Adicionar Membro a Equipe

```http
POST /api/organogram/teams/{teamId}/members
Authorization: Bearer {token}
Content-Type: application/json

{
  "userId": "user_id",
  "role": "member"
}
```

**Resposta:**

```json
{
  "success": true,
  "message": "Membro adicionado à equipe com sucesso",
  "data": {
    "team": {
      "_id": "team_id",
      "name": "Equipe de Desenvolvimento",
      "membersCount": 4
    },
    "member": {
      "user": { "username": "newuser", "email": "newuser@epu.com" },
      "role": "member",
      "joinDate": "2025-07-03T10:00:00.000Z"
    }
  }
}
```

### 🗑️ Remover Membro de Equipe

```http
DELETE /api/organogram/teams/{teamId}/members/{userId}
Authorization: Bearer {token}
```

## 🛠️ Operações CRUD Completas

### 🏢 Equipes

#### **Criar Equipe**

```http
POST /api/teams
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Nova Equipe",
  "description": "Descrição da nova equipe",
  "department": "TI",
  "color": "#3498db"
}
```

#### **Visualizar Equipes**

```http
GET /api/teams
Authorization: Bearer {token}
```

#### **Buscar Equipe Específica**

```http
GET /api/teams/{teamId}
Authorization: Bearer {token}
```

#### **Editar Equipe**

```http
PUT /api/teams/{teamId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Nome Atualizado",
  "description": "Nova descrição",
  "department": "Departamento Atualizado"
}
```

#### **Excluir Equipe**

```http
DELETE /api/teams/{teamId}
Authorization: Bearer {token}
```

#### **Excluir Múltiplas Equipes**

```http
DELETE /api/teams/batch
Authorization: Bearer {token}
Content-Type: application/json

{
  "teamIds": ["team_id_1", "team_id_2", "team_id_3"]
}
```

### 👥 Membros

#### **Criar Membro**

```http
POST /api/members
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "João Silva",
  "matricula": "DEV001",
  "company": "EPU",
  "position": "Desenvolvedor Senior",
  "team": "team_id",
  "email": "joao@epu.com",
  "phone": "(11) 99999-9999"
}
```

#### **Visualizar Membros**

```http
GET /api/members
Authorization: Bearer {token}
```

#### **Buscar Membro Específico**

```http
GET /api/members/{memberId}
Authorization: Bearer {token}
```

#### **Editar Membro**

```http
PUT /api/members/{memberId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "João Silva Santos",
  "position": "Tech Lead",
  "team": "new_team_id"
}
```

#### **Excluir Membro**

```http
DELETE /api/members/{memberId}
Authorization: Bearer {token}
```

#### **Excluir Múltiplos Membros**

```http
DELETE /api/members/batch
Authorization: Bearer {token}
Content-Type: application/json

{
  "memberIds": ["member_id_1", "member_id_2", "member_id_3"]
}
```

### 📂 Projetos

#### **Criar Projeto com Equipes**

```http
POST /api/projects/with-teams
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Projeto EPU - Sistema Completo",
  "description": "Projeto principal do sistema EPU-Gestão",
  "status": "active",
  "priority": "high",
  "teams": ["team_id_1", "team_id_2"],
  "mainTeam": "team_id_1"
}
```

#### **Buscar Projeto com Detalhes Completos**

```http
GET /api/projects/{projectId}/full-details
Authorization: Bearer {token}
```

## 🔄 Fluxo de Trabalho Completo

### **Cenário: Criar Organograma Completo**

#### 1. **Autenticação**

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

#### 2. **Criar Equipes**

```http
POST /api/teams
Authorization: Bearer {token}

{
  "name": "Equipe de Desenvolvimento",
  "department": "TI",
  "description": "Responsável pelo desenvolvimento do sistema"
}
```

#### 3. **Adicionar Membros às Equipes**

```http
POST /api/members
Authorization: Bearer {token}

{
  "name": "João Silva",
  "matricula": "DEV001",
  "company": "EPU",
  "position": "Desenvolvedor Senior",
  "team": "team_dev_id"
}
```

#### 4. **Criar Projeto com Equipes**

```http
POST /api/projects/with-teams
Authorization: Bearer {token}

{
  "name": "Modernização Sistema EPU",
  "description": "Projeto de modernização completa do sistema EPU-Gestão",
  "status": "active",
  "priority": "high",
  "teams": ["team_dev_id", "team_qa_id"],
  "mainTeam": "team_dev_id"
}
```

#### 5. **Visualizar Organograma Completo**

```http
GET /api/organogram
Authorization: Bearer {token}
```

#### 6. **Gerenciar Organograma**

```http
# Adicionar nova equipe ao projeto
POST /api/organogram/project/{projectId}/teams
Authorization: Bearer {token}

# Adicionar membro a equipe
POST /api/organogram/teams/{teamId}/members
Authorization: Bearer {token}

# Remover membro de equipe
DELETE /api/organogram/teams/{teamId}/members/{userId}
Authorization: Bearer {token}
```

## 📊 Funcionalidades Avançadas

### **Estatísticas do Organograma**

- Total de projetos
- Total de equipes
- Total de membros
- Projetos ativos
- Departamentos representados
- Empresas representadas

### **Filtros Disponíveis**

- Por projeto específico
- Por status (ativo/inativo)
- Por departamento
- Por empresa

### **Relacionamentos**

- **Projeto ↔ Equipes** (N:N)
- **Equipe ↔ Membros** (1:N)
- **Projeto → Responsável** (N:1)

## 🔒 Validações e Segurança

### **Validações Implementadas:**

- ✅ Nome obrigatório (mínimo 3 caracteres)
- ✅ Departamento obrigatório
- ✅ Matrícula única para membros
- ✅ Email válido
- ✅ Verificação de existência antes de associações
- ✅ Logs de auditoria completos

### **Segurança:**

- ✅ JWT obrigatório para todas as operações
- ✅ Rate limiting
- ✅ Sanitização de dados
- ✅ Validação de entrada
- ✅ Logs de segurança

## 🎯 Casos de Uso

### **1. Gestão de Projetos**

- Criar projeto com equipes predefinidas
- Visualizar estrutura hierárquica
- Adicionar/remover equipes dinamicamente

### **2. Gestão de Equipes**

- Criar equipes por departamento
- Definir responsáveis e coordenadores
- Gerenciar membros ativos/inativos

### **3. Gestão de Membros**

- Cadastrar colaboradores
- Associar a equipes específicas
- Rastrear mudanças de equipe

### **4. Relatórios**

- Organograma visual completo
- Estatísticas por projeto/equipe
- Análise de distribuição de recursos

## 🚀 Integração com Frontend

### **Componentes Sugeridos:**

- **OrganogramView** - Visualização em árvore
- **TeamCard** - Card de equipe com membros
- **MemberCard** - Card de membro com detalhes
- **ProjectHierarchy** - Hierarquia do projeto

### **Estados de Loading:**

- Carregamento inicial do organograma
- Adição/remoção de elementos
- Atualização de dados em tempo real

### **Notificações:**

- Sucesso nas operações
- Erros de validação
- Confirmações de exclusão

---

**📅 Data de Criação:** 03/07/2025  
**✅ Status:** Implementado e Funcional  
**🔒 Segurança:** Totalmente Protegido  
**📊 Cobertura:** 100% das funcionalidades CRUD

**🎯 O sistema de organograma está completo e pronto para uso!**
