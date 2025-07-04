/**
 * Teste específico para a funcionalidade de Import CSV
 * Simula o upload de um arquivo CSV com metadados
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000';

// Credenciais do usuário de teste
const testUser = {
  email: 'l.o.bastos@live.com',
  password: '44351502741-+as',
};

/**
 * Criar um arquivo CSV de teste
 */
function createTestCSV() {
  const csvContent = `id,name,description,priority,status,assignedTo,startDate,endDate
1,"Tarefa 1","Primeira tarefa do projeto","high","pending","João Silva","2025-01-01","2025-01-31"
2,"Tarefa 2","Segunda tarefa do projeto","medium","in-progress","Maria Santos","2025-02-01","2025-02-28"
3,"Tarefa 3","Terceira tarefa do projeto","low","completed","Pedro Costa","2025-03-01","2025-03-31"`;

  const filePath = path.join(__dirname, 'test-project.csv');
  fs.writeFileSync(filePath, csvContent);
  return filePath;
}

/**
 * Fazer login e obter token
 */
async function login() {
  try {
    console.log('🔐 Fazendo login...');

    const response = await axios.post(`${BASE_URL}/api/auth/login`, testUser);

    if (response.data && response.data.token) {
      const token = response.data.token;
      console.log('✅ Login realizado com sucesso');
      return token;
    } else {
      throw new Error('Token não encontrado na resposta do login');
    }
  } catch (error) {
    console.error('❌ Erro no login:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Testar upload de CSV com metadados
 */
async function testCSVUpload(token, route) {
  try {
    console.log(`\n📤 Testando upload CSV na rota: ${route}`);

    // Criar arquivo CSV de teste
    const csvFilePath = createTestCSV();

    // Criar FormData com arquivo e metadados
    const formData = new FormData();
    formData.append('csvFile', fs.createReadStream(csvFilePath));
    formData.append('name', 'Projeto de Teste CSV');
    formData.append(
      'description',
      'Projeto criado via upload de CSV para teste'
    );
    formData.append('type', 'desenvolvimento');
    formData.append('priority', 'high');
    formData.append('assignedTo', 'Lucas Bastos');
    formData.append('startDate', '2025-07-04');
    formData.append('endDate', '2025-12-31');
    formData.append('tags', 'teste,csv,import');

    console.log('📋 Metadados enviados:');
    console.log('  - Nome: Projeto de Teste CSV');
    console.log('  - Descrição: Projeto criado via upload de CSV para teste');
    console.log('  - Tipo: desenvolvimento');
    console.log('  - Prioridade: high');
    console.log('  - Responsável: Lucas Bastos');
    console.log('  - Tags: teste,csv,import');

    // Fazer upload
    const response = await axios.post(`${BASE_URL}${route}`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('✅ Upload realizado com sucesso!');
    console.log(`📊 Status: ${response.status}`);
    console.log(`📝 Resposta:`, {
      status: response.data.status,
      message: response.data.message,
      dataKeys: Object.keys(response.data.data || {}),
    });

    // Limpar arquivo de teste
    fs.unlinkSync(csvFilePath);

    return true;
  } catch (error) {
    console.error(`❌ Erro no upload CSV (${route}):`);
    console.error(`   Status: ${error.response?.status}`);
    console.error(`   Dados:`, error.response?.data);

    // Limpar arquivo de teste em caso de erro
    const csvFilePath = path.join(__dirname, 'test-project.csv');
    if (fs.existsSync(csvFilePath)) {
      fs.unlinkSync(csvFilePath);
    }

    return false;
  }
}

/**
 * Executar todos os testes de CSV
 */
async function runCSVTests() {
  console.log('🧪 TESTE DE IMPORT CSV - EPU-Gestão');
  console.log('=' + '='.repeat(50));

  try {
    // 1. Fazer login
    const token = await login();

    // 2. Definir rotas para testar
    const routes = [
      '/api/projects/import-csv',
      '/api/projects-crud/import-csv',
      '/api/projects/upload-csv',
    ];

    // 3. Testar cada rota
    let successCount = 0;
    let totalTests = routes.length;

    for (const route of routes) {
      const success = await testCSVUpload(token, route);
      if (success) successCount++;
    }

    // 4. Resultado final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESULTADO FINAL DOS TESTES CSV');
    console.log('='.repeat(60));
    console.log(`✅ Sucessos: ${successCount}/${totalTests}`);
    console.log(`❌ Falhas: ${totalTests - successCount}/${totalTests}`);

    if (successCount === totalTests) {
      console.log(
        '🎉 TODOS OS TESTES DE CSV PASSARAM! Upload funcionando corretamente.'
      );
    } else {
      console.log('⚠️  Algumas rotas de CSV ainda apresentam problemas.');
    }
  } catch (error) {
    console.error('💥 Erro geral nos testes CSV:', error.message);
  }
}

// Executar os testes
runCSVTests()
  .then(() => {
    console.log('\n🏁 Testes CSV finalizados');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });
