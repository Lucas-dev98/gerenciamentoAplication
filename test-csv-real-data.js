const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configuração da API
const API_BASE_URL = 'http://localhost:3001/api';

// Token de autenticação (temporariamente desabilitado)
// const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NjFiMTYxNmQyZDU1MGM2YmI2YzQ1ZiIsImlhdCI6MTc1MTM5NDgyOCwiZXhwIjoxNzUxNDgxMjI4fQ.xQel0XVCVGKBbWL9KRjYlVtjDw2MsGRONetwjjTZP8o';

// Função para testar upload de CSV
const testCSVUpload = async (csvFileName, projectName) => {
  try {
    console.log(`\n🔄 Testando upload do arquivo: ${csvFileName}`);

    const csvPath = path.join(
      __dirname,
      'backend',
      'src',
      'data',
      'csv',
      csvFileName
    );

    if (!fs.existsSync(csvPath)) {
      console.error(`❌ Arquivo não encontrado: ${csvPath}`);
      return null;
    }

    const form = new FormData();
    form.append('csvFile', fs.createReadStream(csvPath));
    form.append('projectName', projectName);

    const response = await axios.post(
      `${API_BASE_URL}/projects/upload-csv`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          // Authorization: `Bearer ${AUTH_TOKEN}`, // Temporariamente desabilitado
        },
      }
    );

    console.log(`✅ Upload realizado com sucesso!`);
    console.log(`📊 Projeto criado: ${response.data.data.project.name}`);
    console.log(`🆔 ID do projeto: ${response.data.data.project.id}`);

    return response.data.data.project;
  } catch (error) {
    console.error(`❌ Erro no upload:`, error.response?.data || error.message);
    return null;
  }
};

// Função para testar endpoints de visualização
const testVisualizationEndpoints = async (projectId) => {
  try {
    console.log(
      `\n🔍 Testando endpoints de visualização para projeto: ${projectId}`
    );

    const endpoints = [
      {
        name: 'Procedimento de Parada',
        url: `/projects/${projectId}/procedimento-parada`,
      },
      { name: 'Manutenção', url: `/projects/${projectId}/manutencao` },
      {
        name: 'Procedimento de Partida',
        url: `/projects/${projectId}/procedimento-partida`,
      },
      { name: 'Frentes', url: `/projects/${projectId}/frentes` },
      { name: 'Estatísticas', url: `/projects/${projectId}/statistics` },
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${API_BASE_URL}${endpoint.url}`, {
          headers: {
            // Authorization: `Bearer ${AUTH_TOKEN}`, // Temporariamente desabilitado
          },
        });

        console.log(
          `✅ ${endpoint.name}: ${response.data.data.length || 'N/A'} itens`
        );

        if (response.data.data.length > 0) {
          console.log(`   📝 Primeiro item: ${response.data.data[0].name}`);
        }
      } catch (error) {
        console.error(
          `❌ ${endpoint.name}:`,
          error.response?.data?.message || error.message
        );
      }
    }
  } catch (error) {
    console.error('❌ Erro geral nos testes:', error.message);
  }
};

// Função principal de teste
const runTests = async () => {
  console.log('🚀 Iniciando testes com dados reais dos CSVs...\n');

  // Teste 1: Upload do CSV de procedimento de partida
  const project = await testCSVUpload(
    'procedimento_partida.csv',
    'Projeto Teste - Procedimento de Partida'
  );

  if (project) {
    // Teste 2: Verificar endpoints de visualização
    await testVisualizationEndpoints(project.id);
  }

  console.log('\n✨ Testes concluídos!');
};

// Executar testes
runTests().catch(console.error);
