const axios = require('axios');

async function testLoginAndCheckAuth() {
  try {
    console.log('🔐 TESTANDO LOGIN E VERIFICANDO AUTENTICAÇÃO\n');

    // Fazer login
    const loginData = {
      email: 'l.o.bastos@live.com',
      password: '44351502741-+as',
    };

    console.log('Fazendo login...');
    const loginResponse = await axios.post(
      'http://localhost:5000/api/auth/login',
      loginData
    );

    if (loginResponse.data.success) {
      console.log('✅ Login realizado com sucesso!');
      console.log('👤 Usuário:', loginResponse.data.user.nome);
      console.log(
        '🎫 Token:',
        loginResponse.data.token.substring(0, 30) + '...'
      );
      console.log('📧 Email:', loginResponse.data.user.email);
      console.log('🏷️ Tipo:', loginResponse.data.user.tipo);

      // Testar se o token funciona para buscar dados
      console.log('\n🔍 Testando token com endpoint protegido...');
      const profileResponse = await axios.get(
        'http://localhost:5000/api/auth/me',
        {
          headers: { Authorization: `Bearer ${loginResponse.data.token}` },
        }
      );

      console.log('✅ Token válido! Dados do perfil:');
      console.log('👤 Nome:', profileResponse.data.nome);
      console.log('📧 Email:', profileResponse.data.email);

      console.log('\n💡 Para testar no navegador, execute no console:');
      console.log(
        `localStorage.setItem('token', '${loginResponse.data.token}');`
      );
      console.log(
        `localStorage.setItem('user', '${JSON.stringify(loginResponse.data.user)}');`
      );
      console.log('window.location.reload();');
    } else {
      console.log('❌ Falha no login:', loginResponse.data.message);
    }
  } catch (error) {
    if (error.response) {
      console.error(
        '❌ Erro na API:',
        error.response.status,
        error.response.data
      );
    } else {
      console.error('❌ Erro de conexão:', error.message);
    }
  }
}

testLoginAndCheckAuth();
