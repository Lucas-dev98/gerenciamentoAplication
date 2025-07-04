/**
 * Debug específico para rota /api/projects-crud/stats
 * Investiga o erro "Token inválido" nesta rota específica
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function debugProjectsCrudStats() {
  try {
    console.log('🔍 Depurando rota /api/projects-crud/stats...\n');

    // 1. Fazer login para obter token
    console.log('1. Fazendo login para obter token...');
    const loginData = {
      email: 'l.o.bastos@live.com',
      password: '44351502741-+as',
    };

    const loginResponse = await axios.post(
      `${BASE_URL}/api/auth/login`,
      loginData
    );

    if (!loginResponse.data.success) {
      console.log('❌ Erro no login:', loginResponse.data);
      return;
    }

    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');
    console.log('📝 Token obtido:', token.substring(0, 30) + '...');

    // 2. Testar a rota específica que está falhando
    console.log('\n2. Testando rota /api/projects-crud/stats...');

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    console.log('Headers enviados:', {
      Authorization: headers.Authorization.substring(0, 50) + '...',
      'Content-Type': headers['Content-Type'],
      Accept: headers.Accept,
    });

    try {
      const statsResponse = await axios.get(
        `${BASE_URL}/api/projects-crud/stats`,
        {
          headers: headers,
        }
      );

      console.log('✅ SUCESSO! Rota funcionando');
      console.log('Status:', statsResponse.status);
      console.log('Dados:', statsResponse.data);
    } catch (error) {
      console.log('❌ ERRO na rota /api/projects-crud/stats:');
      console.log('Status HTTP:', error.response?.status);
      console.log('Mensagem de erro:', error.response?.data);
      console.log('Headers da resposta:', error.response?.headers);

      // Análise detalhada do erro
      if (error.response?.data?.message === 'Token inválido') {
        console.log('\n🔍 ANÁLISE DO ERRO:');
        console.log('- Erro: Token inválido');
        console.log('- Possíveis causas:');
        console.log('  1. Rota não está registrada corretamente');
        console.log('  2. Middleware de autenticação não aplicado');
        console.log('  3. Middleware rejeitando token válido');
        console.log('  4. Problema na definição da rota');
      }

      // Vamos verificar se a rota existe
      console.log('\n3. Verificando se a rota existe...');
      try {
        const optionsResponse = await axios.options(
          `${BASE_URL}/api/projects-crud/stats`
        );
        console.log('✅ Rota existe (OPTIONS funcionou)');
      } catch (optionsError) {
        console.log(
          '❌ Rota pode não existir (OPTIONS falhou):',
          optionsError.response?.status
        );
      }
    }

    // 3. Testar rotas similares para comparação
    console.log('\n4. Testando rotas similares para comparação...');

    const testRoutes = [
      '/api/projects',
      '/api/projects/statistics',
      '/api/projects-crud',
      '/api/teams/stats',
    ];

    for (const route of testRoutes) {
      try {
        console.log(`\nTestando ${route}...`);
        const response = await axios.get(`${BASE_URL}${route}`, { headers });
        console.log(`✅ ${route}: OK (${response.status})`);
      } catch (error) {
        console.log(
          `❌ ${route}: ${error.response?.status} - ${error.response?.data?.message || error.message}`
        );
      }
    }

    // 4. Verificar se o token está realmente válido
    console.log('\n5. Verificando validade do token...');
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.decode(token);
      console.log('Token decodificado:', {
        id: decoded?.id,
        iat: new Date(decoded?.iat * 1000),
        exp: new Date(decoded?.exp * 1000),
        válido: new Date(decoded?.exp * 1000) > new Date(),
      });
    } catch (jwtError) {
      console.log('Erro ao decodificar token:', jwtError.message);
    }
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Dados:', error.response.data);
    }
  }
}

debugProjectsCrudStats().catch(console.error);
