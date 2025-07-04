// Test CRUD endpoints
const http = require('http');

const testEndpoints = async () => {
  const baseUrl = 'http://localhost:5000';

  // Test endpoints
  const endpoints = [
    '/health',
    '/api/projects-crud',
    '/api/projects-crud/stats',
  ];

  console.log('🧪 Testando endpoints CRUD...\n');

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`);
      const data = await response.json();

      console.log(`✅ ${endpoint}: ${response.status}`);
      console.log(
        `   Response:`,
        JSON.stringify(data, null, 2).substring(0, 200) + '...\n'
      );
    } catch (error) {
      console.log(`❌ ${endpoint}: Erro - ${error.message}\n`);
    }
  }
};

// Wait for server to start
setTimeout(testEndpoints, 3000);

console.log('⏳ Aguardando servidor iniciar...');
