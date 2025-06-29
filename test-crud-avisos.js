const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BASE_URL = 'http://localhost:5000/api';

// Test configuration
const TEST_CONFIG = {
  email: 'teste@csv.com',
  password: 'teste123'
};

async function testNoticesCRUD() {
  console.log('\n🧪 Testando CRUD completo de Avisos...\n');

  try {
    // Step 1: Login
    console.log('1. 🔐 Fazendo login...');
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(TEST_CONFIG)
    });

    if (!loginResponse.ok) {
      throw new Error(`Login falhou: ${loginResponse.status} ${loginResponse.statusText}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login realizado com sucesso');

    // Step 2: Criar um novo aviso
    console.log('\n2. 📝 Criando um novo aviso...');
    
    const novoAviso = {
      title: 'Aviso de Teste CRUD',
      content: 'Este é um aviso de teste para verificar se o CRUD está funcionando corretamente. Conteúdo com mais de 10 caracteres.',
      type: 'info',
      priority: 'medium',
      isPinned: false,
      expiryDate: '2025-12-31'
    };

    console.log('Dados do aviso:', JSON.stringify(novoAviso, null, 2));

    const createResponse = await fetch(`${BASE_URL}/notices`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(novoAviso)
    });

    console.log('Status da criação:', createResponse.status);
    const createData = await createResponse.json();
    
    if (!createResponse.ok) {
      console.error('❌ Falha ao criar aviso:', createData);
      return;
    }

    const avisoId = createData.data.notice.id;
    console.log('✅ Aviso criado com sucesso! ID:', avisoId);

    // Step 3: Listar todos os avisos
    console.log('\n3. 📋 Listando todos os avisos...');
    
    const getResponse = await fetch(`${BASE_URL}/notices`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!getResponse.ok) {
      console.error('❌ Falha ao listar avisos');
      return;
    }

    const getData = await getResponse.json();
    console.log(`✅ ${getData.data?.count || 0} avisos encontrados`);
    
    if (getData.data?.notices?.length > 0) {
      console.log('\n📑 Avisos encontrados:');
      getData.data.notices.slice(0, 5).forEach((notice, index) => {
        console.log(`${index + 1}. ${notice.title} (${notice.type}/${notice.priority})`);
        console.log(`   Criado em: ${new Date(notice.createdAt).toLocaleDateString('pt-BR')}`);
        console.log(`   ID: ${notice.id}`);
      });
    }

    // Step 4: Buscar aviso específico
    console.log(`\n4. 🔍 Buscando aviso específico (ID: ${avisoId})...`);
    
    const getOneResponse = await fetch(`${BASE_URL}/notices/${avisoId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (getOneResponse.ok) {
      const getOneData = await getOneResponse.json();
      console.log('✅ Aviso encontrado:', getOneData.data?.notice?.title || 'Sem título');
    } else {
      console.log('⚠️ Endpoint específico pode não estar implementado');
    }

    // Step 5: Atualizar aviso
    console.log(`\n5. ✏️ Atualizando aviso (ID: ${avisoId})...`);
    
    const avisoAtualizado = {
      title: 'Aviso de Teste CRUD - ATUALIZADO',
      content: 'Este aviso foi atualizado para testar a funcionalidade de edição.',
      type: 'warning',
      priority: 'high',
      isPinned: true
    };

    const updateResponse = await fetch(`${BASE_URL}/notices/${avisoId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(avisoAtualizado)
    });

    if (updateResponse.ok) {
      console.log('✅ Aviso atualizado com sucesso');
    } else {
      const updateError = await updateResponse.json();
      console.log('⚠️ Falha ao atualizar:', updateError.message);
    }

    // Step 6: Verificar se a atualização funcionou
    console.log('\n6. 🔄 Verificando avisos após atualização...');
    
    const getAfterUpdateResponse = await fetch(`${BASE_URL}/notices`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (getAfterUpdateResponse.ok) {
      const getAfterUpdateData = await getAfterUpdateResponse.json();
      const avisoAtualizado = getAfterUpdateData.data?.notices?.find(n => n.id === avisoId);
      if (avisoAtualizado) {
        console.log('✅ Atualização confirmada:', avisoAtualizado.title);
        console.log(`   Novo tipo: ${avisoAtualizado.type}, Nova prioridade: ${avisoAtualizado.priority}`);
        console.log(`   Fixado: ${avisoAtualizado.isPinned ? 'Sim' : 'Não'}`);
      }
    }

    // Step 7: Testar exclusão
    console.log(`\n7. 🗑️ Excluindo aviso (ID: ${avisoId})...`);
    
    const deleteResponse = await fetch(`${BASE_URL}/notices/${avisoId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (deleteResponse.ok) {
      console.log('✅ Aviso excluído com sucesso');
      
      // Verificar se foi realmente excluído
      const getAfterDeleteResponse = await fetch(`${BASE_URL}/notices`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (getAfterDeleteResponse.ok) {
        const getAfterDeleteData = await getAfterDeleteResponse.json();
        const avisoExcluido = getAfterDeleteData.data?.notices?.find(n => n.id === avisoId);
        if (!avisoExcluido) {
          console.log('✅ Exclusão confirmada - aviso não encontrado na lista');
        } else {
          console.log('⚠️ Aviso ainda aparece na lista após exclusão');
        }
      }
    } else {
      const deleteError = await deleteResponse.json();
      console.log('⚠️ Falha ao excluir:', deleteError.message);
    }

    console.log('\n🎉 Teste de CRUD completo!');

  } catch (error) {
    console.error('❌ Erro durante teste de CRUD:', error.message);
  }
}

testNoticesCRUD();
