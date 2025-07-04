const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// Teste de upload de CSV para criação de projeto
async function testCSVUpload() {
  try {
    console.log('=== TESTE DE UPLOAD DE CSV ===');

    // Primeiro fazer login para obter token
    console.log('1. Fazendo login...');
    const loginResponse = await axios.post(
      'http://localhost:5000/api/auth/login',
      {
        email: 'l.o.bastos@live.com',
        password: '44351502741-+as',
      }
    );

    console.log('Resposta do login:', loginResponse.data);
    const token = loginResponse.data.token || loginResponse.data.data?.token;
    console.log(
      '✓ Login realizado com sucesso, token:',
      token ? 'obtido' : 'não encontrado'
    );

    // Verificar se existe um arquivo CSV de exemplo
    const csvPath = './backend/src/data/csv/exemplo.csv';
    if (!fs.existsSync(csvPath)) {
      console.log('⚠ Arquivo CSV de exemplo não encontrado, criando um...');

      // Criar CSV de exemplo baseado na estrutura esperada
      const csvContent = `Nome;Nível_da_estrutura_de_tópicos;Dashboard;Porcentagem_Prev_Real;Porcentagem_Prev_LB
Projeto Principal;1;;85.5;90.0
Pátio de Alimentação;3;;75.2;80.0
Alimentação Principal;4;S;85.0;90.0
Esteira Transportadora;4;S;70.0;75.0
Sistema de Pesagem;4;S;90.0;95.0
Secagem;3;;88.0;85.0
Forno Rotativo;4;S;95.0;90.0
Sistema de Controle;4;S;80.0;85.0
Pátio de Alimentação;3;;60.0;70.0
Carregamento;4;S;65.0;75.0
Mistura;3;;92.0;88.0
Misturador Principal;4;S;100.0;95.0
Sistema Dosagem;4;S;85.0;80.0`;

      fs.writeFileSync(csvPath, csvContent, 'utf8');
      console.log('✓ Arquivo CSV de exemplo criado');
    }

    // Fazer upload do CSV
    console.log('2. Fazendo upload do CSV...');
    const form = new FormData();
    form.append('csvFile', fs.createReadStream(csvPath));
    form.append('projectName', 'Projeto Teste CSV Upload');

    const uploadResponse = await axios.post(
      'http://localhost:5000/api/projects/upload-csv',
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log('✓ Upload realizado com sucesso!');
    console.log(
      'Dados do projeto criado:',
      JSON.stringify(uploadResponse.data, null, 2)
    );

    const projectId = uploadResponse.data.data.project.id;

    // Testar busca do projeto criado
    console.log('3. Buscando projeto criado...');
    const projectResponse = await axios.get(
      `http://localhost:5000/api/projects/${projectId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log(
      '✓ Projeto encontrado:',
      projectResponse.data.data.project.name
    );

    console.log('\n=== TESTE CONCLUÍDO COM SUCESSO ===');
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }
}

// Executar teste
testCSVUpload();
