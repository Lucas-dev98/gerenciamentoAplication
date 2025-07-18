const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function updateExistingMembers() {
  try {
    console.log('🔐 Fazendo login...');

    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'hierarquia@teste.com',
      password: 'senha123',
    });

    const token = loginResponse.data.token;
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    console.log('✅ Token obtido');

    // Buscar todos os membros
    console.log('👥 Buscando todos os membros...');
    const membersResponse = await axios.get(`${BASE_URL}/api/members`, {
      headers,
    });
    const members = membersResponse.data.data.members;

    console.log(`📋 Encontrados ${members.length} membros`);

    // Atualizar cada membro que não tem status definido
    for (const member of members) {
      console.log(`🔄 Verificando membro: ${member.name}`);

      if (!member.status) {
        console.log(`   └── Atualizando status para 'ativo'`);

        const updateData = {
          name: member.name,
          matricula: member.matricula,
          company: member.company,
          birthDate: member.birthDate,
          position: member.position,
          workArea: member.workArea,
          team:
            typeof member.team === 'object'
              ? member.team.id || member.team._id
              : member.team,
          phone: member.phone || '',
          email: member.email || '',
          hireDate: member.hireDate,
          level: member.level || 1,
          status: 'ativo',
        };

        if (member.supervisor) {
          updateData.supervisor = member.supervisor;
        }

        await axios.put(`${BASE_URL}/api/members/${member.id}`, updateData, {
          headers,
        });
        console.log(`   └── ✅ Status atualizado para 'ativo'`);
      } else {
        console.log(`   └── ✅ Status já definido: ${member.status}`);
      }
    }

    // Verificar se funcionou
    console.log('\n🔍 Verificando atualizações...');
    const updatedMembersResponse = await axios.get(`${BASE_URL}/api/members`, {
      headers,
    });
    const updatedMembers = updatedMembersResponse.data.data.members;

    console.log('\n📊 Status dos membros:');
    updatedMembers.forEach((member) => {
      console.log(`   • ${member.name}: ${member.status || 'não definido'}`);
    });

    console.log('\n🎉 Atualização concluída!');
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
  }
}

updateExistingMembers();
