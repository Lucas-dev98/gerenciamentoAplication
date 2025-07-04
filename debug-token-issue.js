/**
 * Debug de Autenticação - Token Inválido
 * Testa o fluxo completo de login e acesso às rotas protegidas
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function debugTokenIssue() {
  try {
    console.log('🔍 Depurando problema de token inválido...\n');

    // 1. Verificar se o backend está respondendo
    console.log('1. Testando conectividade do backend...');
    try {
      const healthResponse = await axios.get(`${BASE_URL}/health`);
      console.log('✅ Backend ativo:', healthResponse.data);
    } catch (error) {
      console.log('❌ Backend não está respondendo:', error.message);
      return;
    }

    // 2. Criar/verificar usuário
    console.log('\n2. Criando/verificando usuário...');
    const userData = {
      name: 'Lucas Bastos',
      username: 'lucas.bastos',
      email: 'l.o.bastos@live.com',
      password: '44351502741-+as',
      role: 'admin',
      department: 'TI',
    };

    let token = null;

    try {
      const registerResponse = await axios.post(
        `${BASE_URL}/api/auth/register`,
        userData
      );
      token = registerResponse.data.token;
      console.log('✅ Usuário criado com sucesso');
      console.log('📝 Token recebido:', token.substring(0, 50) + '...');
    } catch (regError) {
      if (regError.response?.status === 409) {
        console.log('👍 Usuário já existe, tentando login...');

        // 3. Fazer login
        console.log('\n3. Fazendo login...');
        try {
          const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: userData.email,
            password: userData.password,
          });

          token = loginResponse.data.token;
          console.log('✅ Login realizado com sucesso');
          console.log('📝 Token recebido:', token.substring(0, 50) + '...');
        } catch (loginError) {
          console.log(
            '❌ Erro no login:',
            loginError.response?.data || loginError.message
          );
          return;
        }
      } else {
        console.log(
          '❌ Erro no registro:',
          regError.response?.data || regError.message
        );
        return;
      }
    }

    // 4. Testar o token nas rotas protegidas
    console.log('\n4. Testando token em rotas protegidas...');

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    console.log('📤 Headers sendo enviados:', headers);

    // Testar rota de projetos
    try {
      console.log('\n5. Testando GET /api/projects...');
      const projectsResponse = await axios.get(`${BASE_URL}/api/projects`, {
        headers,
      });
      console.log('✅ Rota /api/projects funcionando!');
      console.log(
        '📊 Projetos encontrados:',
        projectsResponse.data.data?.data?.length || 0
      );
    } catch (projectsError) {
      console.log('❌ Erro na rota /api/projects:');
      console.log('Status:', projectsError.response?.status);
      console.log('Dados:', projectsError.response?.data);
      console.log('Headers da resposta:', projectsError.response?.headers);

      // Verificar se é problema de middleware de autenticação
      console.log('\n🔍 Análise detalhada do erro:');
      if (projectsError.response?.data?.message === 'Token inválido') {
        console.log('- O middleware de autenticação está rejeitando o token');
        console.log('- Possíveis causas:');
        console.log('  * Token malformado');
        console.log('  * Chave JWT diferente entre geração e validação');
        console.log('  * Token expirado');
        console.log('  * Middleware de autenticação com problemas');
      }
    }

    // Testar outras rotas para comparação
    try {
      console.log('\n6. Testando GET /api/projects/statistics...');
      const statsResponse = await axios.get(
        `${BASE_URL}/api/projects/statistics`,
        { headers }
      );
      console.log('✅ Rota /api/projects/statistics funcionando!');
    } catch (statsError) {
      console.log(
        '❌ Erro na rota /api/projects/statistics:',
        statsError.response?.data?.message
      );
    }
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

debugTokenIssue();
