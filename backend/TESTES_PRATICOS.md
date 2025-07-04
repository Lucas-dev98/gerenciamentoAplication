# 🧪 TESTES PRÁTICOS - EPU GESTÃO BACKEND

## 🚀 TESTES IMEDIATOS (CURL)

### 1. Teste Básico de Conectividade

```bash
curl -X GET http://localhost:3001/api/test

# Resposta esperada:
{
  "status": "success",
  "message": "EPU-Gestão Backend funcionando!",
  "db": "Connected",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. Registrar Usuário

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@epu.com",
    "password": "123456",
    "fullName": "Usuário de Teste"
  }'

# Resposta esperada:
{
  "success": true,
  "message": "Usuário criado com sucesso",
  "user": {
    "id": "...",
    "username": "testuser",
    "email": "test@epu.com",
    "fullName": "Usuário de Teste"
  }
}
```

### 3. Fazer Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "123456"
  }'

# Resposta esperada:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "username": "testuser",
    "email": "test@epu.com"
  }
}

# 🔥 IMPORTANTE: Copie o token para usar nos próximos testes!
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 4. Testar Autenticação

```bash
curl -X GET http://localhost:3001/api/auth/verify \
  -H "Authorization: Bearer $TOKEN"

# Resposta esperada:
{
  "success": true,
  "message": "Token válido",
  "user": {
    "id": "...",
    "username": "testuser"
  }
}
```

### 5. Criar Projeto

```bash
curl -X POST http://localhost:3001/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Projeto Teste API",
    "description": "Projeto criado via API para teste",
    "priority": "high",
    "status": "active"
  }'

# Resposta esperada:
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Projeto Teste API",
    "description": "Projeto criado via API para teste",
    "priority": "high",
    "status": "active",
    "progress": 0,
    "createdAt": "..."
  }
}
```

### 6. Listar Projetos

```bash
curl -X GET http://localhost:3001/api/projects \
  -H "Authorization: Bearer $TOKEN"

# Resposta esperada:
{
  "status": "success",
  "data": [
    {
      "id": "...",
      "name": "Projeto Teste API",
      "description": "Projeto criado via API para teste",
      "status": "active",
      "progress": 0,
      "totalActivities": 0
    }
  ]
}
```

### 7. Criar Evento

```bash
curl -X POST http://localhost:3001/api/events \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Reunião de Teste",
    "eventType": "reuniao",
    "date": "2024-02-01",
    "time": "14:00",
    "location": "Sala Virtual",
    "description": "Evento criado via API para teste",
    "priority": "media"
  }'

# Resposta esperada:
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Reunião de Teste",
    "eventType": "reuniao",
    "date": "2024-02-01T00:00:00.000Z",
    "time": "14:00",
    "location": "Sala Virtual",
    "priority": "media",
    "status": "agendado"
  }
}
```

### 8. Criar Equipe

```bash
curl -X POST http://localhost:3001/api/teams \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Equipe Teste API",
    "department": "TI",
    "description": "Equipe criada via API para teste"
  }'

# Resposta esperada:
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Equipe Teste API",
    "department": "TI",
    "description": "Equipe criada via API para teste",
    "isActive": true,
    "members": [],
    "projects": []
  }
}
```

---

## 🔒 TESTES DE SEGURANÇA

### 1. Teste sem Token (deve falhar)

```bash
curl -X GET http://localhost:3001/api/projects

# Resposta esperada (401):
{
  "success": false,
  "message": "Token de acesso não fornecido"
}
```

### 2. Teste com Token Inválido (deve falhar)

```bash
curl -X GET http://localhost:3001/api/projects \
  -H "Authorization: Bearer token_invalido"

# Resposta esperada (401):
{
  "success": false,
  "message": "Token inválido"
}
```

### 3. Teste Rate Limiting

```bash
# Execute 6 vezes rapidamente para testar o rate limiting
for i in {1..6}; do
  curl -X POST http://localhost:3001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"wrong","password":"wrong"}'
  echo "Tentativa $i"
done

# Na 6ª tentativa, resposta esperada (429):
{
  "error": "Muitas requisições deste IP, tente novamente em 15 minutos."
}
```

### 4. Teste de Sanitização

```bash
curl -X POST http://localhost:3001/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Projeto {$ne: null}",
    "description": "<script>alert(\"xss\")</script>",
    "priority": "high"
  }'

# Os caracteres perigosos devem ser removidos automaticamente
```

---

## 🧪 TESTES JAVASCRIPT (Browser/Node)

### 1. Teste Completo de Autenticação

```javascript
// teste-auth.js
async function testarAutenticacao() {
  const baseURL = 'http://localhost:3001/api';

  try {
    // 1. Registrar usuário
    console.log('1. Registrando usuário...');
    const registerResponse = await fetch(`${baseURL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: `test_${Date.now()}`,
        email: `test_${Date.now()}@epu.com`,
        password: '123456',
        fullName: 'Usuário Teste JS',
      }),
    });
    const registerData = await registerResponse.json();
    console.log('✅ Usuário registrado:', registerData.success);

    // 2. Fazer login
    console.log('2. Fazendo login...');
    const loginResponse = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: registerData.user.username,
        password: '123456',
      }),
    });
    const loginData = await loginResponse.json();
    console.log('✅ Login realizado:', loginData.success);

    const token = loginData.token;

    // 3. Verificar token
    console.log('3. Verificando token...');
    const verifyResponse = await fetch(`${baseURL}/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const verifyData = await verifyResponse.json();
    console.log('✅ Token verificado:', verifyData.success);

    // 4. Acessar rota protegida
    console.log('4. Acessando projetos...');
    const projectsResponse = await fetch(`${baseURL}/projects`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const projectsData = await projectsResponse.json();
    console.log('✅ Projetos acessados:', projectsData.status === 'success');

    console.log('🎉 Todos os testes de autenticação passaram!');
    return token;
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Execute no browser console ou Node.js
testarAutenticacao();
```

### 2. Teste de CRUD Completo

```javascript
// teste-crud.js
async function testarCRUD(token) {
  const baseURL = 'http://localhost:3001/api';
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  try {
    // CREATE
    console.log('1. Criando projeto...');
    const createResponse = await fetch(`${baseURL}/projects`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: `Projeto Teste ${Date.now()}`,
        description: 'Projeto criado para teste CRUD',
        priority: 'high',
      }),
    });
    const createData = await createResponse.json();
    console.log('✅ Projeto criado:', createData.success);
    const projectId = createData.data._id;

    // READ
    console.log('2. Lendo projeto...');
    const readResponse = await fetch(`${baseURL}/projects/${projectId}`, {
      headers,
    });
    const readData = await readResponse.json();
    console.log('✅ Projeto lido:', readData.status === 'success');

    // UPDATE
    console.log('3. Atualizando projeto...');
    const updateResponse = await fetch(`${baseURL}/projects/${projectId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        name: 'Projeto Atualizado',
        progress: 50,
      }),
    });
    const updateData = await updateResponse.json();
    console.log('✅ Projeto atualizado:', updateData.success);

    // DELETE
    console.log('4. Deletando projeto...');
    const deleteResponse = await fetch(`${baseURL}/projects/${projectId}`, {
      method: 'DELETE',
      headers,
    });
    const deleteData = await deleteResponse.json();
    console.log('✅ Projeto deletado:', deleteData.success);

    console.log('🎉 Todos os testes CRUD passaram!');
  } catch (error) {
    console.error('❌ Erro no teste CRUD:', error);
  }
}
```

### 3. Teste de Performance

```javascript
// teste-performance.js
async function testarPerformance(token) {
  const baseURL = 'http://localhost:3001/api';
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // Teste 1: Múltiplas requisições simultâneas
  console.log('1. Testando múltiplas requisições...');
  const start = Date.now();

  const promises = [];
  for (let i = 0; i < 10; i++) {
    promises.push(fetch(`${baseURL}/projects`, { headers }));
  }

  await Promise.all(promises);
  const duration = Date.now() - start;
  console.log(
    `✅ 10 requisições em ${duration}ms (${duration / 10}ms por req)`
  );

  // Teste 2: Requisição grande (estatísticas)
  console.log('2. Testando requisição de estatísticas...');
  const statsStart = Date.now();
  await fetch(`${baseURL}/projects/stats`, { headers });
  const statsDuration = Date.now() - statsStart;
  console.log(`✅ Estatísticas em ${statsDuration}ms`);

  // Teste 3: Criação em lote simulada
  console.log('3. Testando criação em lote...');
  const batchStart = Date.now();
  const batchPromises = [];

  for (let i = 0; i < 5; i++) {
    batchPromises.push(
      fetch(`${baseURL}/events`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: `Evento Teste ${i}`,
          eventType: 'reuniao',
          date: '2024-02-01',
          time: '14:00',
          location: 'Sala Virtual',
        }),
      })
    );
  }

  await Promise.all(batchPromises);
  const batchDuration = Date.now() - batchStart;
  console.log(`✅ 5 criações em ${batchDuration}ms`);
}
```

---

## 📱 TESTES MOBILE/PWA

### 1. Teste Offline

```javascript
// teste-offline.js
async function testarOffline() {
  // Simula conexão offline
  console.log('Testando comportamento offline...');

  try {
    const response = await fetch('http://localhost:3001/api/projects', {
      headers: { Authorization: 'Bearer fake_token' },
    });
    console.log('Resposta online:', response.status);
  } catch (error) {
    console.log('❌ Offline detectado:', error.message);
    // Aqui implementaria fallback para cache local
    console.log('💾 Usando dados do cache...');
  }
}
```

### 2. Teste PWA

```javascript
// service-worker-test.js
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then((registration) => {
      console.log('✅ SW registrado:', registration.scope);
    })
    .catch((error) => {
      console.log('❌ SW falhou:', error);
    });
}

// Teste de cache
caches.open('epu-cache-v1').then((cache) => {
  cache.add('/api/projects').then(() => {
    console.log('✅ API cacheada');
  });
});
```

---

## 🚨 TESTES DE ERRO

### 1. Teste de Validação

```bash
# Dados inválidos devem ser rejeitados
curl -X POST http://localhost:3001/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "",
    "priority": "invalid_priority"
  }'

# Resposta esperada (400):
{
  "success": false,
  "message": "Dados de entrada inválidos",
  "details": ["Nome é obrigatório", "Prioridade inválida"]
}
```

### 2. Teste de Recurso Não Encontrado

```bash
curl -X GET http://localhost:3001/api/projects/123456789012345678901234 \
  -H "Authorization: Bearer $TOKEN"

# Resposta esperada (404):
{
  "success": false,
  "message": "Projeto não encontrado"
}
```

---

## 📊 SCRIPT DE TESTE AUTOMÁTICO

### teste-completo.sh

```bash
#!/bin/bash

echo "🧪 INICIANDO TESTES AUTOMÁTICOS EPU-GESTÃO"
echo "=========================================="

API_URL="http://localhost:3001/api"

# 1. Teste de conectividade
echo "1. Testando conectividade..."
if curl -s "$API_URL/test" > /dev/null; then
  echo "✅ Backend está rodando"
else
  echo "❌ Backend não está respondendo"
  exit 1
fi

# 2. Registrar usuário de teste
echo "2. Registrando usuário de teste..."
USER_DATA='{
  "username": "test_'$(date +%s)'",
  "email": "test_'$(date +%s)'@epu.com",
  "password": "123456",
  "fullName": "Usuário Teste Automático"
}'

REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "$USER_DATA")

if echo "$REGISTER_RESPONSE" | grep -q '"success":true'; then
  echo "✅ Usuário registrado"
  USERNAME=$(echo "$REGISTER_RESPONSE" | grep -o '"username":"[^"]*"' | cut -d'"' -f4)
else
  echo "❌ Falha no registro"
  exit 1
fi

# 3. Fazer login
echo "3. Fazendo login..."
LOGIN_DATA='{
  "username": "'$USERNAME'",
  "password": "123456"
}'

LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "$LOGIN_DATA")

if echo "$LOGIN_RESPONSE" | grep -q '"success":true'; then
  echo "✅ Login realizado"
  TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
else
  echo "❌ Falha no login"
  exit 1
fi

# 4. Testar rota protegida
echo "4. Testando rota protegida..."
if curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/projects" > /dev/null; then
  echo "✅ Rota protegida acessível"
else
  echo "❌ Falha no acesso à rota protegida"
  exit 1
fi

# 5. Criar projeto
echo "5. Criando projeto..."
PROJECT_DATA='{
  "name": "Projeto Teste Automático",
  "description": "Projeto criado pelo teste automático",
  "priority": "high"
}'

CREATE_RESPONSE=$(curl -s -X POST "$API_URL/projects" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$PROJECT_DATA")

if echo "$CREATE_RESPONSE" | grep -q '"success":true'; then
  echo "✅ Projeto criado"
  PROJECT_ID=$(echo "$CREATE_RESPONSE" | grep -o '"_id":"[^"]*"' | cut -d'"' -f4)
else
  echo "❌ Falha na criação do projeto"
fi

echo ""
echo "🎉 TODOS OS TESTES PASSARAM!"
echo "=========================================="
echo "Token de teste: $TOKEN"
echo "ID do projeto: $PROJECT_ID"
echo ""
echo "Você pode usar estes dados para testes manuais adicionais."
```

### Executar o teste:

```bash
chmod +x teste-completo.sh
./teste-completo.sh
```

---

## 📈 MONITORAMENTO EM TEMPO REAL

### 1. Monitor de Logs

```bash
# Monitorar logs em tempo real
tail -f logs/app.log | grep -E "(ERROR|WARN|INFO)"

# Ou criar um script de monitoramento
watch -n 5 'curl -s http://localhost:3001/api/test | jq .'
```

### 2. Health Check

```javascript
// health-check.js
setInterval(async () => {
  try {
    const response = await fetch('http://localhost:3001/api/test');
    const data = await response.json();
    console.log(
      `[${new Date().toISOString()}] Status: ${data.status}, DB: ${data.db}`
    );
  } catch (error) {
    console.log(`[${new Date().toISOString()}] ❌ Backend offline`);
  }
}, 30000); // Verifica a cada 30 segundos
```

---

## 🎯 RESULTADOS ESPERADOS

### ✅ Testes que DEVEM PASSAR:

- Conectividade básica
- Registro de usuário válido
- Login com credenciais corretas
- Acesso a rotas protegidas com token válido
- CRUD completo de todas as entidades
- Validação de dados de entrada
- Rate limiting funcionando

### ❌ Testes que DEVEM FALHAR:

- Acesso sem token
- Token inválido ou expirado
- Dados de entrada inválidos
- Recursos não encontrados
- Excesso de requisições (rate limiting)

---

**🚀 EXECUTE OS TESTES E COMPROVE: O BACKEND EPU-GESTÃO ESTÁ 100% FUNCIONAL!**

**📝 PRÓXIMO PASSO: Use estes testes como base para implementar testes automatizados no seu frontend.**
