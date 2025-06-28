# EPU-Gestão

Sistema de gestão de projetos com upload e processamento de arquivos CSV para cronogramas operacionais.

## 🚀 Tecnologias

### Backend

- Node.js + Express
- MongoDB + Mongoose
- Multer (upload de arquivos)
- JWT (autenticação)
- CSV-Parser (processamento de CSV)

### Frontend

- React + TypeScript
- Styled Components
- Axios (requisições HTTP)
- React Router (navegação)

## 📋 Pré-requisitos

- Node.js 16+
- MongoDB 4.4+
- npm ou yarn

## 🔧 Instalação

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd EPU-Gestão
```

### 2. Configure o Backend

```bash
cd backend
npm install

# Copie e configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

### 3. Configure o Frontend

```bash
cd frontend
npm install

# Copie e configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

## 🏃‍♂️ Executando o Projeto

### Backend

```bash
cd backend
npm start
```

O servidor rodará em `http://localhost:5000`

### Frontend

```bash
cd frontend
npm start
```

A aplicação rodará em `http://localhost:3000`

## 📁 Estrutura do Projeto

```
EPU-Gestão/
├── backend/
│   ├── src/
│   │   ├── config/          # Configurações (DB, etc)
│   │   ├── controllers/     # Controladores da API
│   │   ├── data/           # Dados de exemplo e CSVs
│   │   ├── middlewares/    # Middlewares (auth, upload, etc)
│   │   ├── models/         # Modelos do MongoDB
│   │   ├── routes/         # Rotas da API
│   │   ├── services/       # Serviços de negócio
│   │   ├── temp/           # Arquivos temporários de upload
│   │   └── utils/          # Utilitários
│   ├── .env.example        # Exemplo de variáveis de ambiente
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── context/        # Context API (Auth, etc)
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── services/       # Serviços (API calls)
│   │   ├── styles/         # Styled Components
│   │   └── types/          # Tipos TypeScript
│   ├── .env.example        # Exemplo de variáveis de ambiente
│   └── package.json
└── .gitignore
```

## 🔐 Configuração de Ambiente

### Backend (.env)

```env
DB_URI=mongodb://localhost:27017/epu-gestao
JWT_SECRET=seu_jwt_secret_muito_seguro
PORT=5000
NODE_ENV=development
```

### Frontend (.env)

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENV=development
```

## 📊 Funcionalidades

### ✅ Implementadas

- **Autenticação:** Login/logout com JWT
- **Gestão de Projetos:** CRUD completo
- **Upload de CSV:** Processamento de cronogramas operacionais
- **Dashboard:** Visão geral dos projetos
- **Interface Responsiva:** Design moderno e limpo

### 🔄 Funcionalidades de Atualização

- **Editar Projetos:** Nome, descrição, status, prioridade, orçamento
- **Status Disponíveis:** Rascunho, Ativo, Em Pausa, Concluído, Cancelado
- **Validações:** Campos obrigatórios e formatos corretos
- **Exclusão:** Com confirmação de segurança

### 📈 Upload de CSV

- **Formatos Suportados:** CSV com cronogramas operacionais
- **Processamento:** Separação em blocos (parada, manutenção, partida)
- **Estatísticas:** Progresso automático por atividade
- **Visualização:** Todas as atividades e subatividades

## 🧪 Testes

O projeto inclui vários scripts de teste para validar as funcionalidades:

```bash
# Testes disponíveis (executar na raiz do projeto)
node test-csv-upload.js          # Teste de upload CSV
node test-edit-delete.js         # Teste de edição/exclusão
node test-projects-list.js       # Teste de listagem
node test-frontend-data.js       # Teste de dados do frontend
```

## 🐛 Problemas Conhecidos

- ✅ **Resolvido:** Erro de status `in-progress` no upload CSV
- ✅ **Resolvido:** Prop `isActive` em elementos DOM
- ✅ **Resolvido:** `projects.filter is not a function` no Dashboard
- ✅ **Resolvido:** Inconsistência de status entre frontend/backend

## 📝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🚨 Notas Importantes

- **Arquivos .env:** Nunca commitar arquivos `.env` com dados sensíveis
- **node_modules:** Sempre incluir no `.gitignore`
- **Uploads:** Pasta `temp/` é limpa automaticamente após processamento
- **Logs:** Configurar adequadamente para produção
