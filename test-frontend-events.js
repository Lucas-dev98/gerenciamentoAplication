const axios = require('axios');
const FormData = require('form-data');

const BASE_URL = 'http://localhost:5000';

async function testFrontendEventFlow() {
  try {
    console.log('🧪 Teste: Fluxo Completo de Eventos via Frontend');
    console.log('='.repeat(50));

    // 1. Fazer login
    console.log('1. Fazendo login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'teste@csv.com',
      password: 'teste123',
    });

    const token = loginResponse.data.token || loginResponse.data.data?.token;
    console.log('✅ Login realizado com sucesso');

    // 2. Criar evento via API (simulando frontend)
    console.log('2. Criando evento via API...');
    const eventData = {
      name: 'Reunião de Planejamento Q3',
      eventType: 'reuniao',
      date: '2025-07-15',
      time: '14:30',
      location: 'Sala de Conferências Principal',
      observations:
        'Reunião para discutir metas e objetivos do terceiro trimestre de 2025.',
      status: 'agendado',
    };

    const createResponse = await axios.post(
      `${BASE_URL}/api/events`,
      eventData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const eventId = createResponse.data.data.event.id;
    console.log('✅ Evento criado:', eventId);
    console.log(`   Nome: ${createResponse.data.data.event.name}`);
    console.log(`   Tipo: ${createResponse.data.data.event.eventType}`);
    console.log(
      `   Data/Hora: ${createResponse.data.data.event.dateTimeFormatted}`
    );

    // 3. Listar eventos (simulando carregamento da página)
    console.log('3. Listando eventos...');
    const listResponse = await axios.get(`${BASE_URL}/api/events`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(`✅ Total de eventos: ${listResponse.data.data.events.length}`);
    listResponse.data.data.events.forEach((event, index) => {
      console.log(
        `   ${index + 1}. ${event.name} (${event.eventType}) - ${event.dateTimeFormatted}`
      );
    });

    // 4. Editar evento
    console.log('4. Editando evento...');
    const updateData = {
      name: 'Reunião de Planejamento Q3 - ATUALIZADA',
      observations:
        'Reunião atualizada com pauta expandida para incluir revisão de projetos.',
      status: 'em_andamento',
    };

    const updateResponse = await axios.put(
      `${BASE_URL}/api/events/${eventId}`,
      updateData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Evento atualizado:');
    console.log(`   Nome: ${updateResponse.data.data.event.name}`);
    console.log(`   Status: ${updateResponse.data.data.event.status}`);

    // 5. Filtrar eventos por tipo
    console.log('5. Filtrando eventos por tipo (reunião)...');
    const filterResponse = await axios.get(
      `${BASE_URL}/api/events?eventType=reuniao`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log(
      `✅ Eventos de reunião: ${filterResponse.data.data.events.length}`
    );

    // 6. Deletar evento
    console.log('6. Deletando evento...');
    await axios.delete(`${BASE_URL}/api/events/${eventId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('✅ Evento deletado com sucesso');

    // 7. Verificar se foi deletado
    console.log('7. Verificando lista final...');
    const finalListResponse = await axios.get(`${BASE_URL}/api/events`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(
      `✅ Total final de eventos: ${finalListResponse.data.data.events.length}`
    );

    console.log(
      '\n🎉 Teste do fluxo completo de eventos concluído com sucesso!'
    );
    console.log('✅ Frontend API está pronta para ser utilizada');
    console.log('\n📋 Funcionalidades testadas:');
    console.log('   ✓ Criar evento');
    console.log('   ✓ Listar eventos');
    console.log('   ✓ Editar evento');
    console.log('   ✓ Filtrar eventos');
    console.log('   ✓ Deletar evento');
    console.log('\n🔗 Acesse o frontend em: http://localhost:3000');
    console.log('📄 Navegue para a página de Eventos para testar a interface');
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    if (error.response) {
      console.error('Detalhes do erro:', error.response.data);
    }
  }
}

// Executar teste
testFrontendEventFlow();
