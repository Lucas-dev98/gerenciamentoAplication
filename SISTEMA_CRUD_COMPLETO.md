# EPU-Gestão - Sistema CRUD Completo com Importação CSV

## 📋 Resumo da Implementação

Este sistema implementa uma estrutura completa de CRUD para projetos seguindo Clean Architecture, com funcionalidades de importação e exportação CSV baseadas nos scripts Python fornecidos.

## 🏗️ Arquitetura Implementada

### Backend (Clean Architecture)

```
backend/src/
├── domain/
│   ├── entities/           # Entidades de domínio
│   └── usecases/
│       ├── ProjectUseCasesClean.js      # Casos de uso originais
│       └── ProjectCrudUseCases.js       # Novos casos de uso CRUD
├── infrastructure/
│   ├── repositories/       # Implementações de repositório
│   └── services/
│       └── CsvProcessorService.js       # Processamento CSV
├── application/
│   ├── controllers/
│   │   ├── ProjectControllerClean.js    # Controller original
│   │   └── ProjectCrudController.js     # Novo controller CRUD
│   └── routes/
│       ├── ProjectRoutesClean.js        # Rotas originais
│       └── ProjectCrudRoutes.js         # Novas rotas CRUD
└── app-clean-refactored.js              # Aplicação principal
```

### Frontend (React + TypeScript)

```
frontend/src/
├── services/
│   ├── api-clean.ts                     # API original
│   └── project-crud.ts                  # Novo serviço CRUD
├── hooks/
│   └── useProjectCrud.ts                # Hooks personalizados
├── components/
│   ├── ProjectManagementSimple.tsx      # Interface CRUD
│   └── ProjectManagement.css            # Estilos
└── App.tsx                              # Roteamento atualizado
```

## 🔧 Funcionalidades Implementadas

### 1. CRUD Completo de Projetos

#### Endpoints Implementados:

- `GET /api/projects-crud` - Listar todos os projetos
- `POST /api/projects-crud` - Criar novo projeto
- `GET /api/projects-crud/:id` - Buscar projeto específico
- `PUT /api/projects-crud/:id` - Atualizar projeto
- `DELETE /api/projects-crud/:id` - Excluir projeto
- `GET /api/projects-crud/stats` - Estatísticas dos projetos

#### Funcionalidades Especiais:

- `POST /api/projects-crud/import-csv` - Importar projeto via CSV
- `PUT /api/projects-crud/:id/update-csv` - Atualizar projeto via CSV
- `GET /api/projects-crud/:id/export-csv` - Exportar projeto para CSV
- `POST /api/projects-crud/:id/duplicate` - Duplicar projeto
- `GET /api/projects-crud/team/:teamId` - Projetos por equipe

### 2. Processamento CSV

O `CsvProcessorService.js` implementa a lógica dos scripts Python:

#### Baseado em `data.py`:

- Detecção automática de codificação
- Filtragem de atividades por nível (3 = principal, 4 = subatividade)
- Organização de dados seguindo Dashboard = 'S'

#### Baseado em `format.py`:

- Limpeza e formatação de nomes
- Remoção de caracteres especiais
- Tratamento de padrões específicos (BH números, parênteses, etc.)

#### Baseado em `desempilhar_csv.py`:

- Separação em categorias: Procedimento de Parada, Manutenção, Procedimento de Partida
- Lógica de pilha para organização correta
- Identificação por "Pátio de Alimentação" como divisor

#### Baseado em `app.py` (Flask):

- Estrutura de dados compatível com frontend
- Mapeamento de imagens por nome de atividade
- Formatação de subatividades com Real|Planejado
- Tratamento de números decimais com vírgula

### 3. Interface de Usuário

#### Funcionalidades da Interface:

- **Dashboard de Estatísticas**: Visão geral dos projetos
- **Listagem de Projetos**: Cards com informações detalhadas
- **Formulários CRUD**: Criar, editar, excluir projetos
- **Importação CSV**: Upload com metadados do projeto
- **Exportação CSV**: Download de dados do projeto
- **Duplicação**: Criar cópias de projetos existentes
- **Validação**: Verificação de dados antes da submissão

#### Recursos Visuais:

- Design responsivo e moderno
- Indicadores de progresso
- Badges de status e prioridade
- Notificações de feedback
- Estados de carregamento

## 🚀 Como Usar

### 1. Iniciar o Sistema

```bash
# Backend
cd backend
npm install
node src/app-clean-refactored.js

# Frontend (em outro terminal)
cd frontend
npm install
npm start
```

### 2. Acessar Funcionalidades

- **Dashboard Principal**: http://localhost:3000
- **Gerenciamento CRUD**: http://localhost:3000/projetos/gerenciar
- **API Backend**: http://localhost:5000/api/projects-crud

### 3. Importar Dados via CSV

1. Acesse a interface de gerenciamento
2. Clique em "Importar CSV"
3. Selecione um arquivo CSV com estrutura compatível:
   ```csv
   Nome;Nível_da_estrutura_de_tópicos;Dashboard;Porcentagem_Prev_Real;Porcentagem_Prev_LB
   Pátio de Alimentação;3;S;75.5;80.0
   Sub-atividade 1;4;S;70.0;75.0
   ```
4. Preencha metadados do projeto
5. Confirme importação

### 4. Testar Sistema Completo

```bash
# Teste automatizado
node test-complete-crud.js

# Interface web de teste
open test-crud-frontend.html
```

## 📊 Estrutura de Dados

### Projeto (MongoDB)

```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  type: String, // 'epu', 'maintenance', 'improvement'
  status: String, // 'not_started', 'in_progress', 'completed'
  priority: String, // 'low', 'medium', 'high'
  startDate: Date,
  endDate: Date,
  assignedTo: String,
  tags: [String],
  progress: Number, // 0-100
  totalActivities: Number,
  procedimentoParada: [Activity],
  manutencao: [Activity],
  procedimentoPartida: [Activity],
  metadata: Object,
  createdAt: Date,
  updatedAt: Date
}
```

### Atividade

```javascript
{
  name: String,
  type: String, // 'parada', 'manutencao', 'partida'
  planned: Number, // Porcentagem planejada
  real: Number, // Porcentagem real
  progress: Number, // Progresso atual
  status: String,
  priority: String,
  image: String, // URL da imagem
  order: Number,
  description: String,
  assignedTo: String,
  estimatedHours: Number,
  actualHours: Number,
  tags: [String],
  dependencies: [String],
  subActivities: [SubActivity],
  efficiency: Number,
  progressColor: String
}
```

## 🔍 Validação e Testes

### Scripts de Teste Incluídos:

- `test-complete-crud.js` - Teste completo de todas as funcionalidades
- `test-crud-frontend.html` - Interface web para testes manuais
- `validate-clean-architecture.js` - Validação da arquitetura

### Funcionalidades Testadas:

- ✅ Criação de projetos
- ✅ Atualização de projetos
- ✅ Exclusão de projetos
- ✅ Duplicação de projetos
- ✅ Importação CSV
- ✅ Exportação CSV
- ✅ Estatísticas
- ✅ Validação de dados
- ✅ Tratamento de erros

## 🎯 Compatibilidade

### Com Scripts Python Originais:

- ✅ Processamento compatível com `data.py`
- ✅ Formatação compatível com `format.py`
- ✅ Categorização compatível com `desempilhar_csv.py`
- ✅ Estrutura de dados compatível com `app.py`

### Melhorias Implementadas:

- 🚀 Performance otimizada
- 🛡️ Validação robusta de dados
- 🎨 Interface moderna e responsiva
- 📱 Compatibilidade mobile
- 🔒 Tratamento de erros
- 📊 Estatísticas em tempo real

## 📝 Próximos Passos

1. **Autenticação**: Implementar sistema de usuários
2. **Permissões**: Controle de acesso por função
3. **Relatórios**: Geração de relatórios avançados
4. **Notificações**: Sistema de alertas em tempo real
5. **Integrações**: APIs externas e webhooks

## 🤝 Contribuição

O sistema foi desenvolvido seguindo as melhores práticas:

- Clean Architecture
- SOLID Principles
- Clean Code
- Responsive Design
- Error Handling
- Comprehensive Testing

---

## 🎉 Sistema Completo Implementado!

O EPU-Gestão agora possui um sistema CRUD completo com importação CSV, mantendo compatibilidade total com a lógica dos scripts Python originais e oferecendo uma interface moderna e funcional para gerenciamento de projetos.
