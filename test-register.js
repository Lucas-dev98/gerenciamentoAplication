const fetch = require('node-fetch');

async function testRegister() {
  const userData = {
    username: 'testuser123',
    email: 'test123@example.com',
    password: 'password123',
    fullName: 'Test User 123',
    role: 'user',
  };

  try {
    console.log('🧪 Testando registro com dados válidos...');
    console.log('📝 Dados:', userData);

    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    console.log('📊 Status:', response.status);
    console.log('📋 Resposta:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('✅ Registro bem-sucedido!');
      return data;
    } else {
      console.log('❌ Falha no registro');
      return null;
    }
  } catch (error) {
    console.error('💥 Erro na requisição:', error.message);
    return null;
  }
}

testRegister();
