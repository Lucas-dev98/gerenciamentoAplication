const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000';

async function testCSVUploadInEdit() {
  try {
    console.log('🧪 Teste: Upload de CSV na Edição de Projeto');
    console.log('='.repeat(50));

    // 1. Primeiro, registrar/fazer login
    console.log('1. Fazendo login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'teste@csv.com',
      password: 'teste123',
    });

    console.log('Login response:', loginResponse.data);
    const token = loginResponse.data.token || loginResponse.data.data?.token;
    console.log('✅ Login realizado com sucesso');

    // 2. Criar um projeto inicial
    console.log('2. Criando projeto inicial...');
    const projectData = {
      name: 'Projeto Teste CSV Edit',
      description: 'Projeto para testar upload de CSV na edição',
      status: 'active',
      priority: 'medium',
    };

    const createResponse = await axios.post(
      `${BASE_URL}/api/projects`,
      projectData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const projectId =
      createResponse.data.data.project.id ||
      createResponse.data.data.project._id;
    console.log('✅ Projeto criado:', projectId);

    // 3. Criar arquivo CSV de teste com formato correto
    console.log('3. Criando arquivo CSV de teste...');
    const csvContent = `Nome;Nível_da_estrutura_de_tópicos;Dashboard;Porcentagem_Prev_Real;Porcentagem_Prev_LB
PARADA GERAL;3;;30;25
Isolamento Elétrico;4;S;80;70
Isolamento Mecânico;4;S;90;85
Drenagem de Sistema;4;S;60;55
MANUTENÇÃO;3;;45;40
Inspeção de Equipamentos;4;S;70;65
Substituição de Peças;4;S;50;45
Testes Funcionais;4;S;80;75
PARTIDA;3;;20;15
Pressurização;4;S;40;35
Testes Iniciais;4;S;30;25
Liberação Operacional;4;S;10;5`;

    const csvPath = path.join(__dirname, 'temp-test-edit.csv');
    fs.writeFileSync(csvPath, csvContent);
    console.log('✅ Arquivo CSV criado');

    // 4. Testar upload de CSV para atualizar o projeto
    console.log('4. Testando upload de CSV na edição...');
    const formData = new FormData();
    formData.append('csvFile', fs.createReadStream(csvPath));

    const uploadResponse = await axios.put(
      `${BASE_URL}/api/projects/${projectId}/update-csv`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          ...formData.getHeaders(),
        },
      }
    );

    console.log('✅ Upload de CSV realizado com sucesso');
    console.log('Resposta:', uploadResponse.data);

    // 5. Verificar se o projeto foi atualizado
    console.log('5. Verificando projeto atualizado...');
    const projectResponse = await axios.get(
      `${BASE_URL}/api/projects/${projectId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const updatedProject = projectResponse.data.data.project;
    console.log('✅ Projeto verificado:');
    console.log(`   Nome: ${updatedProject.name}`);
    console.log(
      `   Atividades: ${updatedProject.activities ? updatedProject.activities.length : 0}`
    );
    console.log(`   Status: ${updatedProject.status}`);

    // 6. Limpar arquivo temporário
    fs.unlinkSync(csvPath);
    console.log('✅ Arquivo temporário removido');

    console.log('\n🎉 Teste concluído com sucesso!');
    console.log(
      'A funcionalidade de upload de CSV na edição está operacional.'
    );
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    if (error.response) {
      console.error('Detalhes do erro:', error.response.data);
    }
  }
}

// Executar teste
testCSVUploadInEdit();
