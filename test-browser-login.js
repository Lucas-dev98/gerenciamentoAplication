/**
 * Teste de Navegador - Simula exatamente o comportamento do frontend
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testBrowserLogin() {
  try {
    console.log('🌐 Simulando comportamento do navegador...\n');

    // Headers que o navegador enviaria
    const browserHeaders = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      Accept: 'application/json, text/plain, */*',
      'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
      Origin: 'http://localhost:3000',
      Referer: 'http://localhost:3000/',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'cross-site',
    };

    // 1. Login via API como o frontend faria
    console.log('1. Fazendo login via frontend...');
    const loginData = {
      email: 'l.o.bastos@live.com',
      password: '44351502741-+as',
    };

    const loginResponse = await axios.post(
      `${BASE_URL}/api/auth/login`,
      loginData,
      {
        headers: {
          ...browserHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Login realizado');
    console.log(
      '📝 Resposta completa:',
      JSON.stringify(loginResponse.data, null, 2)
    );

    // Extrair token como o frontend corrigido deveria fazer
    const token = loginResponse.data.token; // Agora usando .token diretamente
    const user = loginResponse.data.user;

    console.log('🔑 Token extraído:', token ? 'SIM' : 'NÃO');
    console.log('👤 Usuário extraído:', user ? 'SIM' : 'NÃO');

    if (!token) {
      console.log('❌ PROBLEMA: Token não foi extraído da resposta!');
      return;
    }

    console.log(
      '📝 Token (primeiros 50 chars):',
      token.substring(0, 50) + '...'
    );

    // Simular localStorage (como o frontend faz)
    const mockLocalStorage = {
      token: token,
      user: JSON.stringify(user),
    };

    console.log('💾 Token "salvo" no localStorage simulado');

    // 2. Aguardar um pouco (simular navegação)
    console.log('\n2. Aguardando (simulando navegação do usuário)...');
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 3. Tentar acessar projetos como o frontend faria
    console.log('\n3. Acessando /api/projects como frontend...');

    const projectHeaders = {
      ...browserHeaders,
      Authorization: `Bearer ${mockLocalStorage.token}`,
      'Content-Type': 'application/json',
    };

    console.log('📤 Headers que serão enviados:');
    console.log(
      '- Authorization:',
      projectHeaders.Authorization.substring(0, 50) + '...'
    );
    console.log('- Origin:', projectHeaders.Origin);

    try {
      const projectsResponse = await axios.get(`${BASE_URL}/api/projects`, {
        headers: projectHeaders,
      });

      console.log('✅ SUCESSO! Projetos obtidos');
      console.log(
        '📊 Total de projetos:',
        projectsResponse.data.data?.data?.length || 0
      );
      console.log('📝 Status da resposta:', projectsResponse.data.status);

      console.log('\n🎉 CONCLUSÃO: O problema do token foi RESOLVIDO!');
      console.log(
        '🔧 O frontend agora deveria funcionar corretamente no navegador.'
      );
    } catch (error) {
      console.log('❌ ERRO ao acessar projetos:');
      console.log('Status:', error.response?.status);
      console.log('Mensagem:', error.response?.data?.message);
      console.log(
        'Dados completos:',
        JSON.stringify(error.response?.data, null, 2)
      );

      console.log('\n🔍 ANÁLISE DO ERRO:');
      if (error.response?.data?.message === 'Token inválido') {
        console.log('- ❌ O token ainda está sendo rejeitado');
        console.log('- Possíveis causas:');
        console.log('  * Frontend ainda não foi atualizado com as correções');
        console.log('  * Cache do navegador');
        console.log('  * Container frontend precisa ser reconstruído');
      }
    }

    // 4. Verificar diretamente se o problema é do CORS
    console.log('\n4. Teste sem headers de navegador...');

    try {
      const simpleResponse = await axios.get(`${BASE_URL}/api/projects`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('✅ Teste simples (sem CORS): FUNCIONOU');
    } catch (error) {
      console.log(
        '❌ Teste simples também falhou:',
        error.response?.data?.message
      );
    }
  } catch (error) {
    console.error('❌ Erro geral:', error.response?.data || error.message);
  }
}

testBrowserLogin();
