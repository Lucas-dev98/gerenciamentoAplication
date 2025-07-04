# 🚀 GUIA RÁPIDO DE INTEGRAÇÃO - EPU GESTÃO BACKEND

## ⚡ START RÁPIDO

### 1. Configuração (2 minutos)

```bash
# Clone e configure
cd backend
npm install
cp .env.example .env  # Configure suas variáveis

# Inicie o servidor
npm start
# ✅ Backend rodando em http://localhost:3001
```

### 2. Teste da API (1 minuto)

```bash
# Teste básico
curl http://localhost:3001/api/test

# Resposta esperada:
{
  "status": "success",
  "message": "EPU-Gestão Backend funcionando!",
  "db": "Connected",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 🔐 AUTENTICAÇÃO SIMPLIFICADA

### Login e Token

```javascript
// 1. Login
const response = await fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'admin',
    password: '123456',
  }),
});

const { token } = await response.json();

// 2. Use o token em todas as requisições
const headers = {
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
};
```

### Configuração Axios Global

```javascript
// api.js - Configure uma vez, use em todo lugar
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
});

// Auto-adiciona token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

---

## 📊 OPERAÇÕES ESSENCIAIS

### Projetos

```javascript
import api from './api';

// Listar todos
const projects = await api.get('/projects');

// Criar novo
const newProject = await api.post('/projects', {
  name: 'Meu Projeto',
  description: 'Descrição do projeto',
  priority: 'high',
});

// Obter detalhes completos (com equipes e membros)
const details = await api.get('/projects/123/details');

// Estatísticas
const stats = await api.get('/projects/stats');
```

### Eventos

```javascript
// Criar evento
const event = await api.post('/events', {
  name: 'Reunião Importante',
  eventType: 'reuniao',
  date: '2024-01-20',
  time: '14:00',
  location: 'Sala A',
  priority: 'alta',
});

// Eventos de hoje
const todayEvents = await api.get('/events/today');
```

### Equipes

```javascript
// Criar equipe
const team = await api.post('/teams', {
  name: 'Equipe Frontend',
  department: 'TI',
  description: 'Equipe de desenvolvimento frontend',
});

// Adicionar membro à equipe
await api.post(`/teams/${teamId}/members`, {
  name: 'João Silva',
  email: 'joao@empresa.com',
  role: 'developer',
});
```

---

## 🎨 COMPONENTES REACT PRONTOS

### Hook de Autenticação

```jsx
// hooks/useAuth.js
import { useState, useEffect } from 'react';
import api from '../api';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (username, password) => {
    try {
      const { data } = await api.post('/auth/login', { username, password });
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api
        .get('/auth/verify')
        .then(({ data }) => setUser(data.user))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  return { user, login, logout, loading };
};
```

### Componente de Login

```jsx
// components/Login.jsx
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(credentials.username, credentials.password);

    if (!result.success) {
      alert(result.message);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Usuário"
        value={credentials.username}
        onChange={(e) =>
          setCredentials({ ...credentials, username: e.target.value })
        }
      />
      <input
        type="password"
        placeholder="Senha"
        value={credentials.password}
        onChange={(e) =>
          setCredentials({ ...credentials, password: e.target.value })
        }
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  );
};
```

### Hook de Projetos

```jsx
// hooks/useProjects.js
import { useState, useEffect } from 'react';
import api from '../api';

export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data.data);
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/projects/stats');
      setStats(data.data);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  const createProject = async (projectData) => {
    try {
      const { data } = await api.post('/projects', projectData);
      setProjects((prev) => [...prev, data.data]);
      return { success: true, data: data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  };

  const deleteProject = async (id) => {
    try {
      await api.delete(`/projects/${id}`);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchStats();
  }, []);

  return {
    projects,
    stats,
    loading,
    createProject,
    deleteProject,
    refetch: fetchProjects,
  };
};
```

### Lista de Projetos

```jsx
// components/ProjectList.jsx
import { useProjects } from '../hooks/useProjects';

export const ProjectList = () => {
  const { projects, loading, deleteProject } = useProjects();

  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      <h2>Projetos ({projects.length})</h2>
      {projects.map((project) => (
        <div key={project.id} className="project-card">
          <h3>{project.name}</h3>
          <p>{project.description}</p>
          <div className="project-meta">
            <span>Status: {project.status}</span>
            <span>Progresso: {project.progress}%</span>
          </div>
          <button onClick={() => deleteProject(project.id)}>Excluir</button>
        </div>
      ))}
    </div>
  );
};
```

---

## 🎯 DASHBOARD RÁPIDO

### Estatísticas em Tempo Real

```jsx
// components/Dashboard.jsx
import { useEffect, useState } from 'react';
import api from '../api';

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Buscar estatísticas
    api.get('/projects/stats').then(({ data }) => setStats(data.data));

    // Buscar eventos de hoje
    api.get('/events/today').then(({ data }) => setEvents(data.data));
  }, []);

  if (!stats) return <div>Carregando dashboard...</div>;

  return (
    <div className="dashboard">
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Projetos Totais</h3>
          <p>{stats.total}</p>
        </div>
        <div className="stat-card">
          <h3>Projetos Ativos</h3>
          <p>{stats.byStatus.active || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Progresso Médio</h3>
          <p>{stats.averageProgress}%</p>
        </div>
        <div className="stat-card">
          <h3>Atividade Recente</h3>
          <p>{stats.recentActivity}</p>
        </div>
      </div>

      <div className="events-today">
        <h3>Eventos de Hoje ({events.length})</h3>
        {events.map((event) => (
          <div key={event.id} className="event-item">
            <span>{event.time}</span>
            <span>{event.name}</span>
            <span>{event.location}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## 🔄 OPERAÇÕES EM LOTE

### Exclusão Múltipla

```javascript
// Selecionar múltiplos itens e excluir
const deleteMultipleProjects = async (selectedIds) => {
  try {
    await api.delete('/projects/batch', {
      data: { ids: selectedIds },
    });
    console.log('Projetos excluídos com sucesso');
  } catch (error) {
    console.error('Erro na exclusão em lote:', error);
  }
};

// Uso no componente
const [selectedProjects, setSelectedProjects] = useState([]);

const handleBatchDelete = () => {
  if (selectedProjects.length > 0) {
    deleteMultipleProjects(selectedProjects);
    setSelectedProjects([]);
  }
};
```

---

## 📱 MOBILE-FIRST

### Service Worker (PWA)

```javascript
// public/sw.js
const CACHE_NAME = 'epu-gestao-v1';
const urlsToCache = ['/', '/static/js/bundle.js', '/static/css/main.css'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

// Interceptar requests para cache offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

---

## 🚨 TRATAMENTO DE ERROS

### Interceptor Global

```javascript
// Adicione ao seu api.js
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Token expirado
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    // Rate limiting
    if (error.response?.status === 429) {
      alert('Muitas requisições. Aguarde um momento.');
    }

    // Erro do servidor
    if (error.response?.status >= 500) {
      alert('Erro interno. Tente novamente.');
    }

    return Promise.reject(error);
  }
);
```

---

## 🎨 ESTILOS CSS BÁSICOS

```css
/* styles.css - Estilos básicos para começar */
.dashboard {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-card h3 {
  margin: 0 0 10px 0;
  color: #666;
  font-size: 14px;
}

.stat-card p {
  margin: 0;
  font-size: 32px;
  font-weight: bold;
  color: #333;
}

.project-card {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 15px;
}

.project-meta {
  display: flex;
  gap: 15px;
  margin: 10px 0;
  font-size: 14px;
  color: #666;
}

.event-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.event-item:last-child {
  border-bottom: none;
}
```

---

## ⚡ COMANDOS ÚTEIS

```bash
# Desenvolvimento
npm start          # Inicia servidor de desenvolvimento
npm run dev        # Modo watch (se configurado)
npm test           # Roda testes

# Produção
npm run build      # Build para produção
npm run start:prod # Inicia em modo produção

# Banco de dados
mongosh           # Conecta ao MongoDB
db.projects.find() # Lista projetos
db.dropDatabase()  # Reset completo (cuidado!)

# Logs
tail -f logs/app.log    # Acompanha logs em tempo real
grep "ERROR" logs/*.log # Busca erros nos logs
```

---

## 🎯 PRÓXIMOS PASSOS

### Para Começar AGORA:

1. ✅ **Backend já está rodando**
2. 🔥 **Copie os componentes React acima**
3. 🚀 **Teste a autenticação**
4. 📊 **Implemente o dashboard**
5. 🎨 **Customize a UI**

### Template Completo:

```bash
# 1. Crie um projeto React
npx create-react-app epu-frontend
cd epu-frontend

# 2. Instale dependências
npm install axios

# 3. Copie os arquivos:
# - src/api.js (configuração axios)
# - src/hooks/useAuth.js
# - src/hooks/useProjects.js
# - src/components/Login.jsx
# - src/components/Dashboard.jsx

# 4. Inicie o frontend
npm start
```

---

**🚀 EM 10 MINUTOS VOCÊ TEM:**

- ✅ Backend funcionando
- ✅ Autenticação implementada
- ✅ Dashboard básico
- ✅ CRUD de projetos
- ✅ Pronto para personalizar

**🎯 FOCO:** O backend está 100% pronto. Agora é só criar a interface que você preferir!
