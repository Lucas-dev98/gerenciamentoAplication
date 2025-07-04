# EPU-Gestão

Sistema de gerenciamento de projetos, equipes e recursos seguindo Clean Architecture.

## 🚀 Tecnologias

### Backend

- **Node.js** + **Express.js**
- **MongoDB** com Mongoose
- **JWT** para autenticação
- **Multer** para upload de arquivos
- **Jest** para testes
- **Docker** para containerização

### Frontend

- **React 18** + **TypeScript**
- **Vite** como build tool
- **CSS Modules** para estilização
- **React Testing Library** + **Jest** para testes
- **Docker** para containerização

## 📁 Estrutura do Projeto

```
EPU-Gestão/
├── backend/                 # API Node.js
│   ├── src/
│   │   ├── main.js         # Ponto de entrada
│   │   ├── controllers/    # Controladores
│   │   ├── routes/         # Rotas da API
│   │   ├── services/       # Camada de serviços
│   │   ├── models/         # Modelos MongoDB
│   │   ├── middlewares/    # Middlewares
│   │   ├── utils/          # Utilitários
│   │   ├── config/         # Configurações
│   │   ├── docs/           # Documentação API
│   │   ├── domain/         # Camada de domínio
│   │   ├── application/    # Casos de uso
│   │   └── infrastructure/ # Infraestrutura
│   ├── tests/              # Testes automatizados
│   │   ├── unit/           # Testes unitários
│   │   ├── integration/    # Testes de integração
│   │   └── e2e/            # Testes E2E
│   └── Dockerfile
├── frontend/               # Aplicação React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # Serviços de API
│   │   ├── types/          # Tipos TypeScript
│   │   ├── utils/          # Utilitários
│   │   ├── docs/           # Documentação Frontend
│   │   └── __tests__/      # Testes automatizados
│   └── Dockerfile
├── mongo-init/             # Scripts de inicialização MongoDB
├── docker-compose.yml      # Orquestração Docker
└── README.md               # Este arquivo
```

## 🛠️ Instalação e Execução

### Pré-requisitos

- **Node.js** 18+
- **MongoDB** 6+
- **Docker** + **Docker Compose** (opcional)

### Opção 1: Docker (Recomendado)

```bash
# Clonar o repositório
git clone <repository-url>
cd EPU-Gestão

# Subir todos os serviços
docker-compose up --build

# Aplicação estará disponível em:
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# MongoDB: localhost:27017
```

### Opção 2: Instalação Local

#### Backend

```bash
cd backend
npm install
cp src/.env.example src/.env
# Configurar variáveis de ambiente no .env
npm run dev
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

#### MongoDB

```bash
# Instalar e iniciar MongoDB localmente
mongod
```

## 🔧 Variáveis de Ambiente

### Backend (.env)

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/epu-gestao
JWT_SECRET=your-secret-key
JWT_EXPIRE=24h
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=EPU-Gestão
VITE_APP_VERSION=3.0.0
```

## 🧪 Testes

### Backend

```bash
cd backend

# Todos os testes
npm test

# Testes unitários
npm run test:unit

# Testes de integração
npm run test:integration

# Testes E2E
npm run test:e2e

# Coverage
npm run test:coverage
```

### Frontend

```bash
cd frontend

# Todos os testes
npm test

# Modo watch
npm run test:watch

# Coverage
npm run test:coverage

# Testes E2E
npm run test:e2e
```

## 📋 Funcionalidades

### ✅ Gerenciamento de Projetos

- CRUD completo de projetos
- Upload/Download de arquivos CSV
- Acompanhamento de progresso
- Filtros e busca avançada

### ✅ Gerenciamento de Equipes

- Criação e gestão de equipes
- Associação de membros
- Atribuição a projetos

### ✅ Gerenciamento de Membros

- Cadastro de membros
- Gestão de cargos e responsabilidades
- Controle de aniversários

### ✅ Sistema de Eventos

- Calendário de eventos
- Notificações
- Filtros por categoria

### ✅ Sistema de Avisos

- Criação e gestão de avisos
- Sistema de prioridades
- Controle de visualização

### ✅ Autenticação

- Login/logout seguro
- JWT tokens
- Controle de acesso

## 🏗️ Arquitetura

O projeto segue os princípios de **Clean Architecture**:

### Backend

- **Controllers**: Interface com HTTP
- **Routes**: Definição de endpoints
- **Services**: Lógica de negócio
- **Models**: Entidades do banco
- **Domain**: Regras de negócio puras
- **Application**: Casos de uso
- **Infrastructure**: Acesso a dados

### Frontend

- **Components**: Componentes reutilizáveis
- **Pages**: Páginas da aplicação
- **Hooks**: Lógica compartilhada
- **Services**: Comunicação com API
- **Types**: Definições TypeScript

## 📚 Documentação

### API

- **Documentação completa**: `backend/src/docs/API_DOCUMENTATION.md`
- **Endpoints RESTful**: Padrão REST implementado
- **Autenticação**: JWT Bearer Token

### Frontend

- **Documentação completa**: `frontend/src/docs/FRONTEND_DOCUMENTATION.md`
- **Componentes**: Todos documentados
- **Hooks customizados**: API completa

## 🚀 Deploy

### Produção com Docker

```bash
# Build das imagens
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

### Variáveis de Produção

- Configurar variáveis de ambiente para produção
- Usar certificados SSL
- Configurar proxy reverso (Nginx)
- Implementar monitoramento

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Padrões de Código

- **ESLint** + **Prettier** configurados
- **Conventional Commits**
- **Testes obrigatórios** para novas features
- **Clean Code** principles

## 📝 Scripts Úteis

### Desenvolvimento

```bash
# Iniciar todos os serviços
docker-compose up

# Apenas backend
npm run dev:backend

# Apenas frontend
npm run dev:frontend

# Logs em tempo real
docker-compose logs -f
```

### Utilitários

```bash
# Limpar volumes Docker
docker-compose down -v

# Rebuild completo
docker-compose up --build --force-recreate

# Backup do banco
mongodump --uri="mongodb://localhost:27017/epu-gestao"
```

## 🐛 Troubleshooting

### Problemas Comuns

**Erro de conexão MongoDB**

```bash
# Verificar se MongoDB está rodando
docker-compose ps
# Recriar volumes
docker-compose down -v && docker-compose up
```

**Erro de porta em uso**

```bash
# Verificar processos na porta
netstat -ano | findstr :5000
# Parar serviços Docker
docker-compose down
```

**Erro de permissões Docker**

```bash
# Windows: Executar como Administrador
# Linux: Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER
```

## 📊 Status do Projeto

- ✅ **Backend**: Clean Architecture implementada
- ✅ **Frontend**: React + TypeScript completo
- ✅ **Testes**: Coverage > 80%
- ✅ **Docker**: Ambiente containerizado
- ✅ **Documentação**: 100% documentado
- ✅ **Produção**: Ready to deploy

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Equipe

- **Desenvolvedor Principal**: [Seu Nome]
- **Arquitetura**: Clean Architecture + SOLID
- **Versão**: 3.0.0

---

**EPU-Gestão** - Sistema de Gestão de Projetos e Equipes
