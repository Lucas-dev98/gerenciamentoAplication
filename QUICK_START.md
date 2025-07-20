# 🚀 EPU-Gestão - Início Rápido com Docker

## Instruções Simples

### 1. Executar o Script Automático (Windows)

```batch
start-docker.bat
```

### 2. Ou Manualmente

```bash
# Construir e iniciar
docker-compose up --build -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down
```

### 3. Acessar

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **MongoDB**: localhost:27017

### Credenciais Padrão

- **MongoDB**: admin / epugestao123
- **JWT Secret**: epu-gestao-jwt-secret-key-super-secure-2025

### Comandos Úteis

```bash
# Status dos containers
docker-compose ps

# Logs específicos
docker-compose logs frontend
docker-compose logs backend
docker-compose logs mongodb

# Reconstruir um serviço
docker-compose build frontend
docker-compose up -d frontend

# Reset completo
docker-compose down -v
docker-compose up --build -d
```

## ✅ Funcionalidades Prontas

### Frontend (React + TypeScript + Vite)

- ✅ Login/Register com JWT
- ✅ Dashboard dinâmico
- ✅ Gestão de Projetos
- ✅ Gestão de Equipes
- ✅ Gestão de Membros
- ✅ Perfil do Usuário
- ✅ KPIs e Indicadores
- ✅ Notificações
- ✅ Design Responsivo
- ✅ Styled Components

### Backend (Node.js + Express + MongoDB)

- ✅ API RESTful completa
- ✅ Autenticação JWT
- ✅ CRUD completo (Projetos, Usuários, Equipes)
- ✅ Middleware de segurança
- ✅ Rate Limiting
- ✅ CORS configurado
- ✅ Logs estruturados
- ✅ Health Checks

### Banco de Dados (MongoDB)

- ✅ Configuração automática
- ✅ Usuário admin criado
- ✅ Database inicializada
- ✅ Scripts de inicialização

## 🔧 Tudo Configurado e Funcionando!

O sistema está **100% funcional** com Docker! 🎉
