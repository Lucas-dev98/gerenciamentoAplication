const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';

async function checkExistingUsers() {
  console.log('🔍 Verificando usuários existentes...\n');

  // Testar diferentes credenciais comuns
  const testCredentials = [
    { email: 'admin@teste.com', password: 'admin123' },
    { email: 'admin@admin.com', password: 'admin123' },
    { email: 'teste@teste.com', password: 'teste123' },
    { email: 'user@teste.com', password: '123456' },
    { email: 'admin@epu.com', password: 'admin123' },
    { email: 'admin', password: 'admin' },
    { email: 'admin@gmail.com', password: 'admin123' },
  ];

  for (const creds of testCredentials) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/login`,
        creds
      );
      console.log(
        `✅ Login bem-sucedido com: ${creds.email} / ${creds.password}`
      );
      console.log('🔑 Token:', response.data.token);
      console.log('👤 Usuário:', response.data.user);
      return { token: response.data.token, user: response.data.user };
    } catch (error) {
      console.log(`❌ Falha: ${creds.email} / ${creds.password}`);
    }
  }

  console.log(
    '\n❌ Nenhuma credencial válida encontrada. Vamos criar um usuário...'
  );

  // Tentar criar um usuário
  try {
    const newUser = {
      nome: 'Admin Teste',
      email: 'admin@teste.com',
      password: 'admin123',
      role: 'admin',
    };

    const response = await axios.post(
      `${API_BASE_URL}/api/auth/register`,
      newUser
    );
    console.log('✅ Usuário criado:', response.data);

    // Tentar fazer login com o novo usuário
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: newUser.email,
      password: newUser.password,
    });

    console.log('✅ Login realizado com novo usuário');
    return { token: loginResponse.data.token, user: loginResponse.data.user };
  } catch (error) {
    console.error(
      '❌ Erro ao criar usuário:',
      error.response?.data || error.message
    );
    return null;
  }
}

checkExistingUsers()
  .then((result) => {
    if (result) {
      console.log('\n🎉 Credenciais funcionais encontradas!');
      console.log('Email:', result.user.email);
      console.log('Token:', result.token);
    } else {
      console.log(
        '\n❌ Não foi possível encontrar ou criar credenciais válidas'
      );
    }
  })
  .catch(console.error);
