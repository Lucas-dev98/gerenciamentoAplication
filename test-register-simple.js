// Teste de registro usando JavaScript puro (Node.js)
const http = require('http');

const testData = JSON.stringify({
  username: 'testuser123',
  email: 'test123@example.com',
  password: 'password123',
  fullName: 'Test User 123',
  role: 'user',
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(testData),
  },
};

console.log('🧪 Testando registro no backend...');
console.log('📝 Dados:', testData);

const req = http.request(options, (res) => {
  console.log(`📊 Status: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('📋 Resposta:', JSON.stringify(response, null, 2));

      if (res.statusCode === 201) {
        console.log('✅ Registro bem-sucedido!');
      } else {
        console.log('❌ Falha no registro');
      }
    } catch (error) {
      console.log('📋 Resposta (texto):', data);
      console.error('💥 Erro ao parsear JSON:', error.message);
    }
  });
});

req.on('error', (error) => {
  console.error('💥 Erro na requisição:', error.message);
});

req.write(testData);
req.end();
