// Teste simples para verificar problemas no frontend
const https = require('https');

console.log('🔍 Verificando problemas no sistema...\n');

// 1. Testar API diretamente
async function testAPI() {
  return new Promise((resolve, reject) => {
    const url =
      'https://api.openweathermap.org/data/2.5/weather?lat=-23.5505&lon=-46.6333&appid=3a13a8fb98632d1c05d5aecb16a6a866&units=metric&lang=pt_br';

    https
      .get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          if (res.statusCode === 200) {
            const weather = JSON.parse(data);
            console.log('✅ 1. API Externa funcionando');
            console.log(`   🌡️ Temp: ${weather.main.temp}°C`);
            console.log(`   📍 Local: ${weather.name}`);
            resolve(true);
          } else {
            console.log(`❌ 1. API Externa falhou: ${res.statusCode}`);
            reject(false);
          }
        });
      })
      .on('error', (err) => {
        console.log(`❌ 1. Erro de rede: ${err.message}`);
        reject(false);
      });
  });
}

// 2. Verificar arquivos críticos
function checkFiles() {
  const fs = require('fs');
  const path = require('path');

  console.log('\n🔍 2. Verificando arquivos críticos...');

  const files = [
    'frontend/src/services/weatherService.ts',
    'frontend/src/components/dashboard/DynamicWelcome.tsx',
    'frontend/.env',
    'frontend/package.json',
  ];

  files.forEach((file) => {
    if (fs.existsSync(file)) {
      const stats = fs.statSync(file);
      if (stats.size > 0) {
        console.log(`✅    ${file} (${stats.size} bytes)`);
      } else {
        console.log(`❌    ${file} (VAZIO!)`);
      }
    } else {
      console.log(`❌    ${file} (NÃO EXISTE)`);
    }
  });
}

// 3. Verificar se node_modules está ok
function checkNodeModules() {
  const fs = require('fs');
  console.log('\n🔍 3. Verificando dependências...');

  if (fs.existsSync('frontend/node_modules')) {
    console.log('✅    node_modules existe');

    // Verificar algumas dependências críticas
    const deps = ['react', '@types/react', 'typescript', 'styled-components'];
    deps.forEach((dep) => {
      if (fs.existsSync(`frontend/node_modules/${dep}`)) {
        console.log(`✅    ${dep} instalado`);
      } else {
        console.log(`❌    ${dep} faltando`);
      }
    });
  } else {
    console.log(
      '❌    node_modules não existe - execute: cd frontend && npm install'
    );
  }
}

// 4. Verificar ports em uso
function checkPorts() {
  console.log('\n🔍 4. Verificando se portas estão livres...');

  const net = require('net');

  function checkPort(port, name) {
    const server = net.createServer();
    server.listen(port, (err) => {
      if (err) {
        console.log(`❌    Porta ${port} (${name}) está ocupada`);
      } else {
        console.log(`✅    Porta ${port} (${name}) está livre`);
        server.close();
      }
    });
    server.on('error', (err) => {
      console.log(`❌    Porta ${port} (${name}) está ocupada`);
    });
  }

  checkPort(3000, 'Frontend');
  checkPort(5000, 'Backend');
}

// Executar todos os testes
async function runAllTests() {
  try {
    await testAPI();
    checkFiles();
    checkNodeModules();
    checkPorts();

    console.log('\n🎯 Diagnóstico concluído!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Se tudo está ✅, execute: cd frontend && npm start');
    console.log('2. Se há ❌, resolva os problemas primeiro');
    console.log('3. Acesse http://localhost:3000 e abra F12 para ver logs');
  } catch (error) {
    console.log('\n❌ Falha no diagnóstico:', error);
  }
}

runAllTests();
