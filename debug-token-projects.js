const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function debugTokenProjects() {
  try {
    console.log('=== TESTE COMPLETO DE TOKEN E PROJETOS ===\n');

    // Passo 1: Fazer login
    console.log('1. Fazendo login...');
    const loginData = {
      email: 'l.o.bastos@live.com',
      password: '44351502741-+as',
    };

    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, loginData);

    if (!loginResponse.data.success) {
      console.log('❌ Erro no login:', loginResponse.data);
      return;
    }

    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');
    console.log('Token obtido:', token.substring(0, 20) + '...');
    console.log('Token completo:', token);
    console.log('Tamanho do token:', token.length);

    // Passo 2: Verificar token decodificado
    console.log('\n2. Verificando estrutura do token...');
    const jwt = require('jsonwebtoken');
    try {
      const decoded = jwt.decode(token);
      console.log('Token decodificado (sem verificação):', decoded);
    } catch (err) {
      console.log('Erro ao decodificar token:', err.message);
    }

    // Passo 3: Testar rota protegida de projetos
    console.log('\n3. Testando rota de projetos...');

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    console.log('Headers enviados:', headers);

    try {
      const projectsResponse = await axios.get(`${BASE_URL}/projects`, {
        headers,
      });
      console.log('✅ Sucesso na rota de projetos:', projectsResponse.data);
    } catch (error) {
      console.log('❌ Erro na rota de projetos:');
      if (error.response) {
        console.log('Status:', error.response.status);
        console.log('Dados:', error.response.data);
        console.log('Headers da resposta:', error.response.headers);
      } else {
        console.log('Erro de conexão:', error.message);
      }
    }

    // Passo 4: Testar outras rotas protegidas
    console.log('\n4. Testando outras rotas protegidas...');

    const routes = ['/auth/profile', '/teams', '/users'];

    for (const route of routes) {
      try {
        console.log(`\nTestando ${route}...`);
        const response = await axios.get(`${BASE_URL}${route}`, { headers });
        console.log(`✅ ${route}: OK`);
      } catch (error) {
        console.log(
          `❌ ${route}: ${error.response?.data?.message || error.message}`
        );
      }
    }

    // Passo 5: Verificar se o token expira
    console.log('\n5. Verificando expiração do token...');
    try {
      const decoded = jwt.decode(token);
      if (decoded && decoded.exp) {
        const expirationDate = new Date(decoded.exp * 1000);
        const now = new Date();
        console.log('Token expira em:', expirationDate);
        console.log('Hora atual:', now);
        console.log('Token válido?', expirationDate > now);
      }
    } catch (err) {
      console.log('Erro ao verificar expiração:', err.message);
    }
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    if (error.response) {
      console.log('Dados da resposta:', error.response.data);
    }
  }
}

// Executar teste
debugTokenProjects().catch(console.error);
