# 🐳 EPU-Gestão - Setup Docker

Sistema de gestão empresarial completo com React + Node.js + MongoDB

## 🚀 Início Rápido

### Pré-requisitos

- Docker
- Docker Compose

### 1. Clonar o Repositório

```bash
git clone <repository-url>
cd EPU-Gestão
```

### 2. Iniciar com Docker

```bash
# Windows PowerShell
.\docker-manage.ps1 start

# Linux/Mac
./docker-manage.sh start

# Ou manualmente
docker-compose up -d
```

### 3. Acessar a Aplicação

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017

## 📋 Comandos Disponíveis

### Windows (PowerShell)

```powershell
.\docker-manage.ps1 start     # Inicia todos os serviços
.\docker-manage.ps1 stop      # Para todos os serviços
.\docker-manage.ps1 restart   # Reinicia todos os serviços
.\docker-manage.ps1 build     # Reconstrói as imagens
.\docker-manage.ps1 rebuild   # Reconstrói e inicia
.\docker-manage.ps1 logs      # Mostra logs em tempo real
.\docker-manage.ps1 status    # Mostra status dos serviços
.\docker-manage.ps1 clean     # Remove containers e volumes
```

### Linux/Mac (Bash)

```bash
./docker-manage.sh start      # Inicia todos os serviços
./docker-manage.sh stop       # Para todos os serviços
./docker-manage.sh restart    # Reinicia todos os serviços
./docker-manage.sh build      # Reconstrói as imagens
./docker-manage.sh rebuild    # Reconstrói e inicia
./docker-manage.sh logs       # Mostra logs em tempo real
./docker-manage.sh status     # Mostra status dos serviços
./docker-manage.sh clean      # Remove containers e volumes
```

### Docker Compose Manual

```bash
# Iniciar todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar serviços
docker-compose down

# Reconstruir imagens
docker-compose build --no-cache

# Ver status
docker-compose ps
```

## 🏗️ Arquitetura

```
EPU-Gestão/
├── frontend/          # React + Vite + TypeScript
│   ├── src/
│   ├── Dockerfile
│   └── nginx.conf
├── backend/           # Node.js + Express + MongoDB
│   ├── src/
│   ├── Dockerfile
│   └── index.js
├── mongo-init/        # Scripts de inicialização do MongoDB
├── docker-compose.yml # Configuração dos serviços
└── README.md
```

## 🔧 Configuração

### Variáveis de Ambiente

#### Frontend (.env)

```env
VITE_APP_TITLE=EPU - Gestão
VITE_API_BASE_URL=/api
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=production
```

#### Backend (.env.docker)

```env
NODE_ENV=production
PORT=3001
DB_URI=mongodb://admin:epugestao123@mongodb:27017/epu_gestao?authSource=admin
JWT_SECRET=epu-gestao-jwt-secret-key-super-secure-2025
CORS_ORIGIN=http://localhost:3000
```

## 🔌 Serviços

### Frontend (React)

- **Porta**: 3000
- **Tecnologias**: React 18, TypeScript, Styled Components, Vite
- **Servidor**: Nginx

### Backend (Node.js)

- **Porta**: 5000 (externa) / 3001 (interna)
- **Tecnologias**: Node.js, Express, MongoDB
- **Arquitetura**: Clean Architecture

### Banco de Dados (MongoDB)

- **Porta**: 27017
- **Versão**: 7.0
- **Usuário**: admin
- **Senha**: epugestao123
- **Database**: epu_gestao

## 🔍 Monitoramento

### Health Checks

Todos os serviços possuem health checks configurados:

- **Frontend**: `wget http://localhost:80/`
- **Backend**: `node healthcheck.js`
- **MongoDB**: `mongosh --eval "db.adminCommand('ping')"`

### Logs

```bash
# Ver logs de todos os serviços
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f mongodb
```

## 🛠️ Desenvolvimento

### Modo Desenvolvimento Local

```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
npm install
npm run dev
```

### Rebuild Durante Desenvolvimento

```bash
# Reconstruir apenas o frontend
docker-compose build frontend

# Reconstruir apenas o backend
docker-compose build backend

# Reconstruir tudo
docker-compose build --no-cache
```

## 🔒 Segurança

- JWT para autenticação
- Rate limiting configurado
- CORS configurado
- Usuário não-root nos containers
- Secrets via environment variables

## 📊 Features

### Frontend

- ✅ Autenticação completa (Login/Register)
- ✅ Dashboard com estatísticas
- ✅ Gestão de projetos
- ✅ Gestão de equipes
- ✅ Gestão de membros
- ✅ Perfil do usuário
- ✅ KPIs e indicadores
- ✅ Sistema de notificações
- ✅ Responsive design

### Backend

- ✅ API RESTful completa
- ✅ Autenticação JWT
- ✅ CRUD de projetos
- ✅ CRUD de usuários
- ✅ CRUD de equipes
- ✅ Middleware de segurança
- ✅ Rate limiting
- ✅ Logs estruturados

## 🐛 Troubleshooting

### Problemas Comuns

1. **Porta 3000 já em uso**

   ```bash
   # Verificar processo usando a porta
   netstat -ano | findstr :3000
   # Matar processo ou mudar porta no docker-compose.yml
   ```

2. **MongoDB não conecta**

   ```bash
   # Verificar logs do MongoDB
   docker-compose logs mongodb
   # Limpar volumes e reiniciar
   docker-compose down -v
   docker-compose up -d
   ```

3. **Build do frontend falha**
   ```bash
   # Limpar cache do Docker
   docker system prune -f
   # Rebuild sem cache
   docker-compose build --no-cache frontend
   ```

### Reset Completo

```bash
# Para tudo e remove volumes
docker-compose down -v

# Remove imagens
docker rmi epu-gestao-frontend epu-gestao-backend

# Limpa sistema Docker
docker system prune -f

# Rebuild completo
docker-compose build --no-cache
docker-compose up -d
```

## 📞 Suporte

Para problemas ou dúvidas, verifique:

1. Logs dos containers: `docker-compose logs -f`
2. Status dos serviços: `docker-compose ps`
3. Health checks: `docker inspect <container_name>`

---

**EPU-Gestão** - Sistema de Gestão Empresarial Completo 🚀
