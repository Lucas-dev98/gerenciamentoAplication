const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function simulateBrowserBehavior() {
  try {
    console.log('=== SIMULANDO COMPORTAMENTO DO NAVEGADOR ===\n');

    // Simular headers do navegador
    const browserHeaders = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      Accept: 'application/json, text/plain, */*',
      'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      Connection: 'keep-alive',
      Origin: 'http://localhost:3000',
      Referer: 'http://localhost:3000/',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'cross-site',
    };

    // Passo 1: Login como o navegador faria
    console.log('1. Fazendo login simulando navegador...');
    const loginData = {
      email: 'l.o.bastos@live.com',
      password: '44351502741-+as',
    };

    const loginResponse = await axios.post(
      `${BASE_URL}/auth/login`,
      loginData,
      {
        headers: {
          ...browserHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!loginResponse.data.success) {
      console.log('❌ Erro no login:', loginResponse.data);
      return;
    }

    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');
    console.log('Token obtido:', token.substring(0, 30) + '...');

    // Simular armazenamento no localStorage (como o frontend faz)
    const mockLocalStorage = {
      token: token,
    };
    console.log('✅ Token "salvo" no localStorage simulado');

    // Passo 2: Esperar um pouco (simular navegação do usuário)
    console.log('\n2. Aguardando alguns segundos (simulando navegação)...');
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Passo 3: Tentar acessar projetos como o frontend faria
    console.log('\n3. Acessando projetos como o frontend...');

    const projectHeaders = {
      ...browserHeaders,
      Authorization: `Bearer ${mockLocalStorage.token}`,
      'Content-Type': 'application/json',
    };

    console.log('Headers que serão enviados:');
    console.log(
      '- Authorization:',
      projectHeaders.Authorization.substring(0, 50) + '...'
    );
    console.log('- Origin:', projectHeaders.Origin);
    console.log('- Referer:', projectHeaders.Referer);

    const projectsResponse = await axios.get(`${BASE_URL}/projects`, {
      headers: projectHeaders,
    });

    console.log('✅ SUCESSO! Projetos obtidos:', {
      totalProjetos: projectsResponse.data.data?.data?.length || 0,
      message: projectsResponse.data.message,
    });

    // Passo 4: Verificar se o erro pode ser relacionado a CORS
    console.log('\n4. Testando sem headers de navegador...');

    const simpleHeaders = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    const simpleResponse = await axios.get(`${BASE_URL}/projects`, {
      headers: simpleHeaders,
    });

    console.log('✅ Teste simples também funcionou');

    // Passo 5: Verificar todas as variações de cabeçalhos
    console.log('\n5. Testando diferentes formatos de token...');

    const tokenVariations = [
      `Bearer ${token}`,
      token,
      `bearer ${token}`,
      `BEARER ${token}`,
    ];

    for (let i = 0; i < tokenVariations.length; i++) {
      try {
        const variation = tokenVariations[i];
        console.log(
          `\nTestando variação ${i + 1}: ${variation.substring(0, 20)}...`
        );

        const response = await axios.get(`${BASE_URL}/projects`, {
          headers: {
            Authorization: variation,
            'Content-Type': 'application/json',
          },
        });

        console.log(`✅ Variação ${i + 1}: FUNCIONOU`);
      } catch (error) {
        console.log(
          `❌ Variação ${i + 1}: ${error.response?.data?.message || error.message}`
        );
      }
    }
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Dados:', error.response.data);
      console.log('Headers da resposta:', error.response.headers);
    }
  }
}

// Executar simulação
simulateBrowserBehavior().catch(console.error);
