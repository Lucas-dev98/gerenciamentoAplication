# EPU-Gestão API Documentation

## Overview

Esta documentação descreve todos os endpoints disponíveis na API do sistema EPU-Gestão seguindo os princípios RESTful e Clean Architecture.

**Versão:** 3.0.0  
**Base URL:** `http://localhost:5000/api`  
**Autenticação:** JWT Bearer Token

## Authentication Endpoints

### POST /auth/register

Registra um novo usuário no sistema.

**Request Body:**

```json
{
  "username": "string (min: 3 chars)",
  "email": "string (valid email)",
  "password": "string (min: 6 chars)",
  "role": "user|admin"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Usuário registrado com sucesso",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "role": "string"
  }
}
```

### POST /auth/login

Autentica um usuário no sistema.

**Request Body:**

```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "role": "string"
  },
  "token": "string"
}
```

### POST /auth/logout

Faz logout do usuário autenticado.

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "message": "Logout realizado com sucesso"
}
```

## Project Endpoints

### GET /projects

Retorna lista de todos os projetos.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

- `page` (number): Página (default: 1)
- `limit` (number): Itens por página (default: 10)
- `search` (string): Termo de busca
- `status` (string): Filtro por status

**Response:**

```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "string",
        "name": "string",
        "description": "string",
        "status": "string",
        "startDate": "date",
        "endDate": "date",
        "team": ["string"],
        "createdAt": "date",
        "updatedAt": "date"
      }
    ],
    "totalPages": "number",
    "currentPage": "number",
    "totalProjects": "number"
  }
}
```

### POST /projects

Cria um novo projeto.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "name": "string (required)",
  "description": "string",
  "status": "planning|active|completed|suspended",
  "startDate": "date",
  "endDate": "date",
  "team": ["userId1", "userId2"]
}
```

### GET /projects/:id

Retorna detalhes de um projeto específico.

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "description": "string",
    "status": "string",
    "startDate": "date",
    "endDate": "date",
    "team": [
      {
        "id": "string",
        "name": "string",
        "email": "string",
        "role": "string"
      }
    ],
    "createdAt": "date",
    "updatedAt": "date"
  }
}
```

### PUT /projects/:id

Atualiza um projeto existente.

**Headers:** `Authorization: Bearer <token>`

**Request Body:** (mesma estrutura do POST, campos opcionais)

### DELETE /projects/:id

Remove um projeto.

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "message": "Projeto removido com sucesso"
}
```

### POST /projects/upload-csv

Faz upload de projetos via arquivo CSV.

**Headers:**

- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Request Body:**

- `file`: CSV file

### GET /projects/download-csv

Faz download dos projetos em formato CSV.

**Headers:** `Authorization: Bearer <token>`

## Team Endpoints

### GET /teams

Retorna lista de todas as equipes.

### POST /teams

Cria uma nova equipe.

### GET /teams/:id

Retorna detalhes de uma equipe específica.

### PUT /teams/:id

Atualiza uma equipe existente.

### DELETE /teams/:id

Remove uma equipe.

### POST /teams/:id/members

Adiciona um membro à equipe.

### DELETE /teams/:id/members/:memberId

Remove um membro da equipe.

## Member Endpoints

### GET /members

Retorna lista de todos os membros.

### POST /members

Cria um novo membro.

### GET /members/:id

Retorna detalhes de um membro específico.

### PUT /members/:id

Atualiza um membro existente.

### DELETE /members/:id

Remove um membro.

## Event Endpoints

### GET /events

Retorna lista de todos os eventos.

### POST /events

Cria um novo evento.

### GET /events/:id

Retorna detalhes de um evento específico.

### PUT /events/:id

Atualiza um evento existente.

### DELETE /events/:id

Remove um evento.

## Notice Endpoints

### GET /notices

Retorna lista de todos os avisos.

### POST /notices

Cria um novo aviso.

### GET /notices/:id

Retorna detalhes de um aviso específico.

### PUT /notices/:id

Atualiza um aviso existente.

### DELETE /notices/:id

Remove um aviso.

## Error Responses

Todos os endpoints podem retornar os seguintes códigos de erro:

### 400 - Bad Request

```json
{
  "success": false,
  "message": "Dados inválidos",
  "errors": ["Erro específico 1", "Erro específico 2"]
}
```

### 401 - Unauthorized

```json
{
  "success": false,
  "message": "Token inválido ou expirado"
}
```

### 403 - Forbidden

```json
{
  "success": false,
  "message": "Acesso negado"
}
```

### 404 - Not Found

```json
{
  "success": false,
  "message": "Recurso não encontrado"
}
```

### 422 - Unprocessable Entity

```json
{
  "success": false,
  "message": "Dados não puderam ser processados",
  "errors": ["Erro de validação"]
}
```

### 500 - Internal Server Error

```json
{
  "success": false,
  "message": "Erro interno do servidor"
}
```

## Rate Limiting

A API implementa rate limiting para prevenir abuso:

- Limite: 100 requests por minuto por IP
- Headers de resposta incluem informações sobre o limite

## Middleware de Logging

Todas as requests são logadas com:

- Timestamp
- Método HTTP
- URL
- Status de resposta
- Tempo de processamento
- IP do cliente
- User Agent

## Validação de Dados

Todos os endpoints implementam validação rigorosa de dados de entrada:

- Tipos de dados corretos
- Campos obrigatórios
- Limites de caracteres
- Formatos válidos (email, data, etc.)

## Paginação

Endpoints que retornam listas suportam paginação:

- `page`: Número da página (default: 1)
- `limit`: Itens por página (default: 10, max: 100)
- Resposta inclui metadados de paginação

## Filtros e Busca

Endpoints de listagem suportam:

- Busca por texto (campo `search`)
- Filtros por status, data, categoria
- Ordenação (campo `sort`, `order`)

## Websockets

O sistema suporta conexões WebSocket para:

- Notificações em tempo real
- Atualizações de status de projetos
- Chat de equipe
- Sincronização de dados

**URL WebSocket:** `ws://localhost:5000/ws`

## Autenticação WebSocket

Para conectar via WebSocket com autenticação:

```javascript
const socket = new WebSocket('ws://localhost:5000/ws', ['token', jwt_token]);
```

## Exemplos de Uso

### Autenticação e criação de projeto

```javascript
// Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
  }),
});

const { token } = await loginResponse.json();

// Criar projeto
const projectResponse = await fetch('/api/projects', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    name: 'Novo Projeto',
    description: 'Descrição do projeto',
    status: 'planning',
  }),
});
```

## Ambiente de Desenvolvimento

Para testar a API em desenvolvimento:

1. Instale as dependências: `npm install`
2. Configure as variáveis de ambiente (.env)
3. Inicie o servidor: `npm run dev`
4. A API estará disponível em: `http://localhost:5000`

## Testes

Execute os testes da API:

```bash
# Testes unitários
npm run test:unit

# Testes de integração
npm run test:integration

# Testes E2E
npm run test:e2e

# Coverage
npm run test:coverage
```

## Monitoramento

A API inclui endpoints de health check:

- `GET /health`: Status geral da aplicação
- `GET /health/db`: Status da conexão com banco de dados
- `GET /metrics`: Métricas da aplicação (Prometheus format)
