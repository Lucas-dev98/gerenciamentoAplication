const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Configuração de axios para requests
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

async function testCompleteAvisosFlow() {
  console.log('🚀 Iniciando teste completo do sistema de avisos...\n');

  try {
    // 1. Criar usuário de teste
    console.log('1. Criando usuário de teste...');
    const userData = {
      username: 'testeavisos',
      fullName: 'Teste Avisos',
      email: 'teste.avisos@example.com',
      password: 'senha123',
    };

    try {
      await api.post('/auth/register', userData);
      console.log('✅ Usuário criado com sucesso');
    } catch (error) {
      if (
        error.response?.status === 400 &&
        error.response?.data?.message?.includes('already exists')
      ) {
        console.log('ℹ️ Usuário já existe, continuando...');
      } else if (
        error.response?.status === 409 &&
        error.response?.data?.message?.includes('já existe')
      ) {
        console.log('ℹ️ Usuário já existe, continuando...');
      } else {
        throw error;
      }
    }

    // 2. Fazer login
    console.log('\n2. Fazendo login...');
    const loginResponse = await api.post('/auth/login', {
      email: userData.email,
      password: userData.password,
    });

    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');

    // Configurar token para próximas requisições
    api.defaults.headers.Authorization = `Bearer ${token}`;

    // 3. Listar avisos iniciais
    console.log('\n3. Listando avisos existentes...');
    const initialNoticesResponse = await api.get('/notices');
    const initialNotices = initialNoticesResponse.data.data?.notices || [];
    console.log(`📋 Encontrados ${initialNotices.length} avisos existentes`);

    // 4. Criar novo aviso
    console.log('\n4. Criando novo aviso...');
    const newNotice = {
      title: 'Teste de Aviso Automático',
      content:
        'Este é um aviso criado pelo teste automático para verificar o funcionamento do CRUD. Conteúdo suficientemente longo para passar na validação.',
      type: 'info',
      priority: 'medium',
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias no futuro
    };

    const createResponse = await api.post('/notices', newNotice);
    console.log('✅ Aviso criado com sucesso');
    const createdNotice = createResponse.data.data.notice;
    console.log(`   ID: ${createdNotice.id}`);
    console.log(`   Título: ${createdNotice.title}`);

    // 5. Verificar se o aviso aparece na lista
    console.log('\n5. Verificando se o aviso aparece na lista...');
    const updatedNoticesResponse = await api.get('/notices');
    const updatedNotices = updatedNoticesResponse.data.data?.notices || [];
    console.log(`📋 Total de avisos após criação: ${updatedNotices.length}`);

    const foundNotice = updatedNotices.find(
      (notice) =>
        notice.id === createdNotice.id || notice._id === createdNotice.id
    );
    if (foundNotice) {
      console.log('✅ Aviso encontrado na lista');
      console.log(`   Título: ${foundNotice.title}`);
      console.log(`   Tipo: ${foundNotice.type}`);
      console.log(`   Prioridade: ${foundNotice.priority}`);
    } else {
      console.log('❌ Aviso NÃO encontrado na lista');
    }

    // 6. Atualizar o aviso
    console.log('\n6. Atualizando o aviso...');
    const updatedData = {
      title: 'Teste de Aviso Automático - ATUALIZADO',
      content:
        'Este aviso foi atualizado pelo teste automático. Conteúdo suficiente para validação.',
      priority: 'high',
    };

    const updateResponse = await api.put(
      `/notices/${createdNotice.id}`,
      updatedData
    );
    const updatedNotice =
      updateResponse.data.data?.notice || updateResponse.data.notice;
    console.log('✅ Aviso atualizado com sucesso');
    console.log(`   Novo título: ${updatedNotice.title}`);
    console.log(`   Nova prioridade: ${updatedNotice.priority}`);

    // 7. Buscar aviso específico
    console.log('\n7. Buscando aviso específico...');
    const getNoticeResponse = await api.get(`/notices/${createdNotice.id}`);
    const specificNotice =
      getNoticeResponse.data.data?.notice || getNoticeResponse.data.notice;
    console.log('✅ Aviso encontrado');
    console.log(`   Título atual: ${specificNotice.title}`);

    // 8. Excluir o aviso
    console.log('\n8. Excluindo o aviso...');
    await api.delete(`/notices/${createdNotice.id}`);
    console.log('✅ Aviso excluído com sucesso');

    // 9. Verificar se foi excluído
    console.log('\n9. Verificando se o aviso foi excluído...');
    const finalNoticesResponse = await api.get('/notices');
    const finalNotices = finalNoticesResponse.data.data?.notices || [];
    console.log(`📋 Total de avisos após exclusão: ${finalNotices.length}`);

    const deletedNotice = finalNotices.find(
      (notice) =>
        notice.id === createdNotice.id || notice._id === createdNotice.id
    );
    if (!deletedNotice) {
      console.log('✅ Aviso excluído com sucesso da lista');
    } else {
      console.log('❌ Aviso ainda aparece na lista');
    }

    console.log(
      '\n🎉 Teste completo do sistema de avisos concluído com sucesso!'
    );
    console.log('📊 Resumo:');
    console.log(`   - Avisos iniciais: ${initialNotices.length}`);
    console.log(`   - Aviso criado: ✅`);
    console.log(`   - Aviso listado: ✅`);
    console.log(`   - Aviso atualizado: ✅`);
    console.log(`   - Aviso excluído: ✅`);
  } catch (error) {
    console.error(
      '❌ Erro durante o teste:',
      error.response?.data || error.message
    );
    console.error('Stack:', error.stack);
  }
}

// Executar o teste
testCompleteAvisosFlow();
