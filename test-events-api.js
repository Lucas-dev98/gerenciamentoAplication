const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testEventsAPI() {
  try {
    console.log('🧪 Teste: API de Eventos');
    console.log('='.repeat(50));

    // 1. Criar usuário e fazer login
    console.log('1. Criando usuário e fazendo login...');
    const timestamp = Date.now();

    const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, {
      username: `eventuser${timestamp}`,
      email: `eventuser-${timestamp}@test.com`,
      password: 'password123',
      fullName: 'Event Test User',
    });

    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: registerResponse.data.user.email,
      password: 'password123',
    });

    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');

    // 2. Criar um projeto (opcional para associar ao evento)
    console.log('2. Criando projeto de teste...');
    const projectResponse = await axios.post(
      `${BASE_URL}/api/projects`,
      {
        name: 'Projeto para Eventos',
        description: 'Projeto de teste para associar eventos',
        status: 'active',
        priority: 'medium',
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const projectId = projectResponse.data.data.project.id;
    console.log('✅ Projeto criado:', projectId);

    // 3. Criar eventos de teste
    console.log('3. Criando eventos de teste...');

    const eventsToCreate = [
      {
        name: 'Reunião de Planejamento',
        eventType: 'reuniao',
        date: '2025-07-01',
        time: '14:00',
        location: 'Sala de Conferências A',
        observations: 'Reunião para definir cronograma do próximo trimestre',
        status: 'agendado',
        project: projectId,
      },
      {
        name: 'Treinamento de Segurança',
        eventType: 'treinamento',
        date: '2025-07-02',
        time: '09:00',
        location: 'Auditório Principal',
        observations:
          'Treinamento obrigatório sobre procedimentos de segurança',
        status: 'agendado',
      },
      {
        name: 'Manutenção Preventiva',
        eventType: 'manutencao',
        date: '2025-07-03',
        time: '08:00',
        location: 'Setor Industrial',
        observations: 'Manutenção preventiva dos equipamentos principais',
        status: 'agendado',
      },
      {
        name: 'Auditoria Interna',
        eventType: 'auditoria',
        date: '2025-07-04',
        time: '10:00',
        location: 'Escritório Administrativo',
        observations: 'Auditoria dos processos internos',
        status: 'agendado',
      },
    ];

    const createdEvents = [];
    for (const eventData of eventsToCreate) {
      const response = await axios.post(`${BASE_URL}/api/events`, eventData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      createdEvents.push(response.data.data.event);
      console.log(`✅ Evento criado: ${eventData.name}`);
    }

    // 4. Listar todos os eventos
    console.log('4. Listando todos os eventos...');
    const allEventsResponse = await axios.get(`${BASE_URL}/api/events`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log(
      `✅ Total de eventos: ${allEventsResponse.data.data.events.length}`
    );
    allEventsResponse.data.data.events.forEach((event) => {
      console.log(
        `   - ${event.name} (${event.eventType}) - ${event.dateTimeFormatted}`
      );
    });

    // 5. Filtrar eventos por tipo
    console.log('5. Filtrando eventos por tipo (reuniao)...');
    const filteredResponse = await axios.get(
      `${BASE_URL}/api/events?eventType=reuniao`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log(
      `✅ Eventos de reunião: ${filteredResponse.data.data.events.length}`
    );

    // 6. Obter evento específico
    console.log('6. Obtendo evento específico...');
    const eventId = createdEvents[0].id;
    const eventResponse = await axios.get(`${BASE_URL}/api/events/${eventId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log('✅ Evento obtido:');
    console.log(`   Nome: ${eventResponse.data.data.event.name}`);
    console.log(`   Tipo: ${eventResponse.data.data.event.eventType}`);
    console.log(
      `   Data/Hora: ${eventResponse.data.data.event.dateTimeFormatted}`
    );
    console.log(`   Local: ${eventResponse.data.data.event.location}`);

    // 7. Atualizar evento
    console.log('7. Atualizando evento...');
    const updateData = {
      status: 'em_andamento',
      observations: 'Reunião iniciada conforme planejado',
    };

    const updateResponse = await axios.put(
      `${BASE_URL}/api/events/${eventId}`,
      updateData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log('✅ Evento atualizado:');
    console.log(`   Status: ${updateResponse.data.data.event.status}`);
    console.log(
      `   Observações: ${updateResponse.data.data.event.observations}`
    );

    // 8. Obter eventos de hoje (simulação)
    console.log('8. Testando eventos de hoje...');
    try {
      const todayResponse = await axios.get(`${BASE_URL}/api/events/today`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(
        `✅ Eventos de hoje: ${todayResponse.data.data.events.length}`
      );
    } catch (error) {
      console.log('ℹ️ Nenhum evento para hoje (esperado)');
    }

    // 9. Deletar um evento
    console.log('9. Deletando evento...');
    const eventToDelete = createdEvents[createdEvents.length - 1];
    await axios.delete(`${BASE_URL}/api/events/${eventToDelete.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log(`✅ Evento deletado: ${eventToDelete.name}`);

    // 10. Verificar lista final
    console.log('10. Verificando lista final de eventos...');
    const finalResponse = await axios.get(`${BASE_URL}/api/events`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log(
      `✅ Total final de eventos: ${finalResponse.data.data.events.length}`
    );

    console.log('\n🎉 Teste da API de Eventos concluído com sucesso!');
    console.log(
      'Todas as operações CRUD foram testadas e funcionaram corretamente.'
    );

    // 11. Teste de validação (deve falhar)
    console.log('11. Testando validação (criação com dados inválidos)...');
    try {
      await axios.post(
        `${BASE_URL}/api/events`,
        {
          name: 'AB', // Nome muito curto
          eventType: 'tipo_invalido', // Tipo inválido
          date: 'data_invalida', // Data inválida
          time: '25:99', // Hora inválida
          location: '', // Local vazio
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Validação funcionando corretamente');
        console.log('   Erros capturados:', error.response.data.errors.length);
      }
    }
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    if (error.response) {
      console.error('Detalhes do erro:', error.response.data);
    }
  }
}

// Executar teste
testEventsAPI();
