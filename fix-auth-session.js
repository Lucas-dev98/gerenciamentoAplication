const axios = require('axios');

async function fixAuthSession() {
  try {
    console.log('🔧 CORRIGINDO SESSÃO DE AUTENTICAÇÃO\n');

    // 1. Fazer login para obter token fresco
    const loginData = {
      email: 'l.o.bastos@live.com',
      password: '44351502741-+as',
    };

    console.log('🔑 Fazendo login para obter token fresco...');
    const loginResponse = await axios.post(
      'http://localhost:5000/api/auth/login',
      loginData
    );

    if (loginResponse.data.success) {
      const { token, user } = loginResponse.data;

      console.log('✅ Login realizado com sucesso!');
      console.log('👤 Dados do usuário:', user);
      console.log('🎫 Token obtido (válido por 3 horas)');

      // 2. Gerar script para o navegador
      const userWithName = {
        _id: user._id || user.id,
        email: user.email,
        nome: user.nome || user.name || 'Lucas Bastos',
        tipo: user.tipo || user.role || 'administrador',
      };

      console.log(
        '\n🌐 EXECUTE NO CONSOLE DO NAVEGADOR (http://localhost:3000):'
      );
      console.log('=====================================');
      console.log(`// Limpar dados antigos`);
      console.log(`localStorage.clear();`);
      console.log('');
      console.log(`// Configurar token fresco`);
      console.log(`localStorage.setItem('token', '${token}');`);
      console.log('');
      console.log(`// Configurar usuário completo`);
      console.log(
        `localStorage.setItem('user', '${JSON.stringify(userWithName)}');`
      );
      console.log('');
      console.log(`// Verificar se foi salvo`);
      console.log(
        `console.log('Token salvo:', localStorage.getItem('token') ? 'SIM' : 'NÃO');`
      );
      console.log(
        `console.log('User salvo:', localStorage.getItem('user') ? 'SIM' : 'NÃO');`
      );
      console.log('');
      console.log(`// Recarregar página`);
      console.log(`window.location.reload();`);
      console.log('=====================================\n');

      console.log('📋 COPIE O CÓDIGO ACIMA E COLE NO CONSOLE DO NAVEGADOR!');
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

fixAuthSession();
