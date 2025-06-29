// Teste específico para investigar o erro do DashboardPage
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Função para fazer login e obter token
async function loginUser() {
  try {
    // Primeiro tentar registrar um usuário
    try {
      await axios.post(`${BASE_URL}/api/auth/register`, {
        name: 'Usuário Teste',
        email: 'teste@epu.com',
        password: 'teste123',
      });
      console.log('📝 Usuário registrado com sucesso');
    } catch (regError) {
      console.log(
        'ℹ️ Usuário já existe ou erro no registro:',
        regError.response?.data?.message || regError.message
      );
    }

    // Agora fazer login
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'teste@epu.com',
      password: 'teste123',
    });
    return response.data.token;
  } catch (error) {
    console.error('Erro no login:', error.response?.data || error.message);
    throw error;
  }
}

// Função para testar o endpoint de notices
async function testNoticesEndpoint(token) {
  try {
    const response = await axios.get(`${BASE_URL}/api/notices`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('📋 Estrutura dos dados de notices:');
    console.log('Response status:', response.status);
    console.log('Response data type:', typeof response.data);
    console.log('Response data:', JSON.stringify(response.data, null, 2));

    const notices = response.data?.notices || response.data || [];
    console.log('\n📋 Análise dos notices:');
    console.log('Notices é array?', Array.isArray(notices));
    console.log('Quantidade de notices:', notices.length);

    if (Array.isArray(notices) && notices.length > 0) {
      notices.forEach((notice, index) => {
        console.log(`\n📋 Notice ${index + 1}:`);
        console.log('  ID:', notice._id);
        console.log('  Title:', notice.title);
        console.log('  readBy existe?', 'readBy' in notice);
        console.log('  readBy é array?', Array.isArray(notice.readBy));
        console.log('  readBy value:', notice.readBy);
      });
    }

    return notices;
  } catch (error) {
    console.error(
      '❌ Erro ao testar endpoint de notices:',
      error.response?.data || error.message
    );
    throw error;
  }
}

// Função para testar o endpoint de projetos
async function testProjectsEndpoint(token) {
  try {
    const response = await axios.get(`${BASE_URL}/api/projects`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('\n📁 Estrutura dos dados de projetos:');
    console.log('Response status:', response.status);
    console.log('Response data type:', typeof response.data);
    console.log('Response data:', JSON.stringify(response.data, null, 2));

    const projects = response.data?.projects || response.data || [];
    console.log('\n📁 Análise dos projetos:');
    console.log('Projects é array?', Array.isArray(projects));
    console.log('Quantidade de projetos:', projects.length);

    return projects;
  } catch (error) {
    console.error(
      '❌ Erro ao testar endpoint de projetos:',
      error.response?.data || error.message
    );
    throw error;
  }
}

// Função principal
async function main() {
  try {
    console.log('🔍 Iniciando teste de dados do dashboard...\n');

    // 1. Fazer login
    console.log('🔐 Fazendo login...');
    const token = await loginUser();
    console.log('✅ Login realizado com sucesso');

    // 2. Testar endpoint de notices
    console.log('\n📋 Testando endpoint de notices...');
    const notices = await testNoticesEndpoint(token);

    // 3. Testar endpoint de projetos
    console.log('\n📁 Testando endpoint de projetos...');
    const projects = await testProjectsEndpoint(token);

    // 4. Simular a lógica do DashboardPage
    console.log('\n🔄 Simulando lógica do DashboardPage...');
    const userId = 'test-user-id'; // ID fictício para teste

    const unreadNotices = Array.isArray(notices)
      ? notices.filter((n) => {
          console.log(`🔍 Processando notice: ${n?.title || 'Sem título'}`);
          console.log(`  - n existe? ${!!n}`);
          console.log(`  - n.readBy existe? ${!!n?.readBy}`);
          console.log(`  - n.readBy é array? ${Array.isArray(n?.readBy)}`);

          // Safe check for notice structure
          if (!n || !userId) {
            console.log('  - Retornando false: notice ou userId inválido');
            return false;
          }

          // If readBy doesn't exist or is not an array, consider as unread
          if (!n.readBy || !Array.isArray(n.readBy)) {
            console.log(
              '  - Retornando true: readBy não existe ou não é array'
            );
            return true;
          }

          // Check if current user is in readBy array
          const isRead = n.readBy.some((r) => r && r.user === userId);
          console.log(`  - Usuario já leu? ${isRead}`);
          return !isRead;
        })
      : [];

    console.log(
      `\n📊 Resultado final: ${unreadNotices.length} notices não lidos`
    );
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar o teste
main();
