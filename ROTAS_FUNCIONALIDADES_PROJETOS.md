# 📍 Localização das Funcionalidades de Gerenciamento de Projetos

## 🚀 Rota Principal das Funcionalidades

### **URL Principal:** `/projetos`

- **Arquivo:** `frontend/src/pages/ProjectsPage.tsx`
- **Componente:** `ProjectsPage`

### **Navegação:**

- **Menu Lateral:** Sidebar → "Projetos" → Vai para `/projetos`
- **Arquivo do Menu:** `frontend/src/components/layout/Sidebar.tsx` (linha 123-124)

## 🎯 Funcionalidades Implementadas na Página Principal

### **1. 📝 Criação de Projetos**

- **Localização:** `ProjectsPage.tsx` → Botão "Novo Projeto"
- **Modal:** `ProjectForm` component
- **Função:** `handleCreateProject()` → `createProject()`

### **2. 📤 Importação CSV**

- **Localização:** `ProjectsPage.tsx` → Botão "Importar CSV"
- **Componente:** `CSVUpload`
- **Função:** `handleCSVUpload()` → `uploadCSV()`

### **3. 📊 Visualização de Frentes**

- **Localização:** Card do projeto → Botão "📊 Visualizar"
- **Modal:** `ProjectFrentesVisualization` component
- **Função:** `handleVisualizeProject()` → `getProjectFrentesData()`

### **4. ✏️ Edição de Projetos**

- **Localização:** Card do projeto → Botão "✏️ Editar"
- **Modal:** `ProjectForm` component (modo edição)
- **Função:** `handleEditProject()` → `updateProject()`

### **5. 💾 Exportação CSV**

- **Localização:** Card do projeto → Botão "💾 Exportar"
- **Função:** `handleExportProject()` → `exportProjectToCSV()`
- **Resultado:** Download automático do arquivo CSV

### **6. 📤 Atualização via CSV**

- **Localização:** Card do projeto → Botão "📤 Atualizar CSV"
- **Modal:** `ProjectCSVUpdate` component
- **Função:** `handleUpdateProjectCSV()` → `updateProjectFromCSV()`

### **7. 📋 Duplicação de Projetos**

- **Localização:** Card do projeto → Botão "📋 Duplicar"
- **Função:** `handleDuplicateProject()` → `duplicateProject()`

### **8. 🗑️ Exclusão de Projetos**

- **Localização:** Card do projeto → Botão "🗑️ Excluir" (vermelho)
- **Função:** `handleDeleteProject()` → `deleteProject()`
- **Confirmação:** Dialog nativo do browser

## 📁 Estrutura de Arquivos das Funcionalidades

### **Página Principal**

```
📄 frontend/src/pages/ProjectsPage.tsx
├── Estado dos modais e formulários
├── Handlers para todas as operações
├── Integração com hooks e componentes
└── Layout responsivo com cards
```

### **Componentes Específicos**

```
📁 frontend/src/components/projects/
├── 📄 ProjectsList.tsx          - Lista de projetos em cards
├── 📄 ProjectForm.tsx           - Formulário de criação/edição
├── 📄 CSVUpload.tsx            - Upload de CSV para importação
├── 📄 ProjectCSVUpdate.tsx     - Upload de CSV para atualização
├── 📄 ProjectFrentesVisualization.tsx - Visualização das frentes
└── 📄 index.ts                 - Exports dos componentes
```

### **Hooks de Estado**

```
📄 frontend/src/hooks/useProjects.ts
├── loadProjects()              - Buscar todos os projetos
├── createProject()             - Criar novo projeto
├── updateProject()             - Atualizar projeto existente
├── deleteProject()             - Excluir projeto
├── uploadCSV()                 - Importar projeto via CSV
├── updateProjectFromCSV()      - Atualizar projeto via CSV
├── exportProjectToCSV()        - Exportar projeto para CSV
├── getProjectFrentesData()     - Buscar dados das frentes
└── duplicateProject()          - Duplicar projeto
```

### **Serviços de API**

```
📄 frontend/src/services/api.ts
├── projectsAPI.getProjects()           - GET /api/projects
├── projectsAPI.createProject()         - POST /api/projects
├── projectsAPI.updateProject()         - PUT /api/projects/:id
├── projectsAPI.deleteProject()         - DELETE /api/projects/:id
├── projectsAPI.uploadProjectCSV()      - POST /api/projects/import-csv
├── projectsAPI.updateProjectFromCSV()  - PUT /api/projects/:id/update-csv
├── projectsAPI.exportProjectToCSV()   - GET /api/projects/:id/export-csv
├── projectsAPI.getProjectFrentesData() - GET /api/projects/:id/frentes-data
└── projectsAPI.duplicateProject()     - POST /api/projects/:id/duplicate
```

## 🎨 Interface Visual

### **Layout da Página**

```
┌─────────────────────────────────────────────────────────┐
│ 📋 Gestão de Projetos                    [Novo] [CSV]    │
├─────────────────────────────────────────────────────────┤
│ 📤 [Seção de Upload CSV - Expansível]                   │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│ │ 📊 Projeto 1│ │ 📊 Projeto 2│ │ 📊 Projeto 3│          │
│ │ Descrição   │ │ Descrição   │ │ Descrição   │          │
│ │ [Ações]     │ │ [Ações]     │ │ [Ações]     │          │
│ └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────┘
```

### **Ações por Card de Projeto**

```
┌─────────────────────────────────────┐
│ 📊 Nome do Projeto                   │
│ Status: ● Ativo  Prioridade: ● Alta │
│ Descrição do projeto...             │
├─────────────────────────────────────┤
│ [📊 Visualizar] [✏️ Editar] [💾 Exportar] │
│ [📤 Atualizar CSV] [📋 Duplicar] [🗑️ Excluir] │
└─────────────────────────────────────┘
```

## 🔄 Fluxos de Uso

### **1. Criar Projeto Manual**

```
/projetos → Botão "Novo Projeto" → Modal ProjectForm → Salvar
```

### **2. Importar via CSV**

```
/projetos → Botão "Importar CSV" → Seção CSVUpload → Selecionar arquivo → Upload
```

### **3. Visualizar Frentes**

```
/projetos → Card do projeto → "📊 Visualizar" → Modal ProjectFrentesVisualization
```

### **4. Atualizar via CSV**

```
/projetos → Card do projeto → "📤 Atualizar CSV" → Modal ProjectCSVUpdate → Upload
```

### **5. Exportar CSV**

```
/projetos → Card do projeto → "💾 Exportar" → Download automático
```

## 🎯 Como Acessar

### **1. Via Navegação Web**

```
http://localhost:3000/projetos
```

### **2. Via Menu Lateral**

```
Sidebar → Clique em "Projetos"
```

### **3. Via Navegação Programática**

```javascript
// Em qualquer componente React
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate('/projetos');
```

## ✅ Status Atual

- ✅ **Rota configurada:** `/projetos` → `ProjectsPage`
- ✅ **Menu atualizado:** Sidebar aponta para `/projetos`
- ✅ **Funcionalidades ativas:** Todas as 8 operações CRUD + CSV
- ✅ **Interface responsiva:** Cards com ações organizadas
- ✅ **Modais funcionais:** Para formulários e visualizações
- ✅ **Integração completa:** Frontend ↔ Backend via API

## 🚀 Para Testar

1. **Iniciar o sistema:**

   ```bash
   # Terminal 1 - Backend
   cd backend && npm start

   # Terminal 2 - Frontend
   cd frontend && npm start
   ```

2. **Acessar a funcionalidade:**

   ```
   http://localhost:3000/projetos
   ```

3. **Testar via script:**
   ```bash
   node test-complete-crud-system.js
   ```

**🎉 Todas as funcionalidades estão implementadas e acessíveis na rota `/projetos`!**
