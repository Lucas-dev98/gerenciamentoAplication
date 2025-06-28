// Teste frontend - simula o que o RegisterPage deveria fazer
const http = require('http');

// Simula os dados que o frontend envia
const formData = {
  nome: 'João Silva',
  email: 'joao@example.com',
  senha: 'password123',
  confirmeSenha: 'password123',
  tipo: 'student',
};

// Mapeia para o formato esperado pelo backend
const userData = {
  username: formData.nome,
  email: formData.email,
  password: formData.senha,
  fullName: formData.nome,
  role: 'user', // Frontend envia student/professor, mas backend só aceita user/admin
};

const testData = JSON.stringify(userData);

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

console.log('🧪 Testando fluxo completo do frontend...');
console.log('📝 Dados do formulário:', formData);
console.log('📝 Dados mapeados para backend:', userData);

const req = http.request(options, (res) => {
  console.log(`📊 Status: ${res.statusCode}`);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('📋 Resposta do backend:', JSON.stringify(response, null, 2));

      if (res.statusCode === 201) {
        console.log('✅ Registro bem-sucedido!');
        console.log('👤 Usuário criado:', response.user);
      } else {
        console.log('❌ Falha no registro');
        console.log('🔍 Erros:', response.errors || response.message);
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
