/**
 * Teste Frontend - Simulação completa do comportamento do navegador
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testFrontendFlow() {
  try {
    console.log('🌐 Simulando fluxo completo do frontend...\n');

    // 1. Login como o frontend faria
    console.log('1. Login via frontend API...');
    const loginData = {
      email: 'l.o.bastos@live.com',
      password: '44351502741-+as',
    };

    const loginResponse = await axios.post(
      `${BASE_URL}/api/auth/login`,
      loginData,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          // Simular headers do navegador
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      }
    );

    console.log('✅ Login realizado');
    console.log('📝 Resposta do login:', {
      success: loginResponse.data.success,
      tokenLength: loginResponse.data.token?.length,
      user: loginResponse.data.user?.email,
    });

    const token = loginResponse.data.token;

    // 2. Simular requisição GET /api/projects como o frontend faria
    console.log('\n2. Acessando /api/projects...');

    const projectsHeaders = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      // Headers típicos de CORS
      Origin: 'http://localhost:3000',
      Referer: 'http://localhost:3000/',
    };

    console.log('📤 Headers da requisição:', {
      Authorization: projectsHeaders.Authorization.substring(0, 30) + '...',
      'Content-Type': projectsHeaders['Content-Type'],
      Accept: projectsHeaders['Accept'],
      Origin: projectsHeaders['Origin'],
    });

    try {
      const projectsResponse = await axios.get(`${BASE_URL}/api/projects`, {
        headers: projectsHeaders,
      });

      console.log('✅ Requisição bem-sucedida!');
      console.log('📊 Status:', projectsResponse.status);
      console.log(
        '📊 Projetos encontrados:',
        projectsResponse.data.data?.data?.length || 0
      );
    } catch (projectsError) {
      console.log('❌ Erro na requisição:');
      console.log('Status:', projectsError.response?.status);
      console.log('Mensagem:', projectsError.response?.data?.message);
      console.log('Dados completos:', projectsError.response?.data);

      // Se der erro, vamos testar sem alguns headers
      console.log('\n🔄 Tentando sem headers de CORS...');
      try {
        const simpleHeaders = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        };

        const retryResponse = await axios.get(`${BASE_URL}/api/projects`, {
          headers: simpleHeaders,
        });

        console.log('✅ Funcionou sem headers de CORS!');
        console.log(
          '💡 O problema pode estar relacionado a CORS ou headers específicos do navegador'
        );
      } catch (retryError) {
        console.log('❌ Ainda falhou:', retryError.response?.data?.message);
      }
    }

    // 3. Testar se o token está válido fazendo decode manual
    console.log('\n3. Validando token manualmente...');
    try {
      const jwt = require('jsonwebtoken');
      // Usar a mesma chave que o backend usa
      const JWT_SECRET = process.env.JWT_SECRET || 'epu-gestao-secret-key-2024';
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('✅ Token válido:', {
        id: decoded.id,
        email: decoded.email,
        exp: new Date(decoded.exp * 1000).toISOString(),
      });
    } catch (jwtError) {
      console.log('❌ Token inválido:', jwtError.message);
    }
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    if (error.response) {
      console.log('📄 Resposta de erro:', error.response.data);
    }
  }
}

testFrontendFlow();
