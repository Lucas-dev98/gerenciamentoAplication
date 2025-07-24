/**
 * 🧪 Teste Completo do Fluxo EPU
 *
 * Este script testa todo o fluxo:
 * 1. Autenticação
 * 2. Criação de equipes
 * 3. Criação de membros
 * 4. Criação de projetos
 * 5. Alocação de equipes aos projetos
 * 6. Verificação de integridade dos dados
 */

const testCompleteFlow = async () => {
  console.log('🚀 Iniciando teste completo do fluxo EPU...\n');

  const baseURL = 'http://localhost:5000/api';
  let authToken = null;

  try {
    // === 1. TESTE DE AUTENTICAÇÃO ===
    console.log('🔐 1. Testando autenticação...');

    const authResponse = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@epu.com',
        password: 'admin123',
      }),
    });

    if (!authResponse.ok) {
      throw new Error(`Falha na autenticação: ${authResponse.status}`);
    }

    const authData = await authResponse.json();
    authToken = authData.token;
    console.log('✅ Autenticação bem-sucedida');
    console.log(`   Token obtido: ${authToken ? 'Sim' : 'Não'}\n`);

    const headers = {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    };

    // === 2. TESTE DE CRIAÇÃO DE EQUIPE ===
    console.log('🏢 2. Testando criação de equipe...');

    const teamData = {
      name: 'Equipe de Desenvolvimento Full Stack',
      description:
        'Equipe responsável pelo desenvolvimento completo do sistema EPU',
      department: 'Tecnologia da Informação',
      color: '#3498db',
      budget: 150000,
    };

    const teamResponse = await fetch(`${baseURL}/teams`, {
      method: 'POST',
      headers,
      body: JSON.stringify(teamData),
    });

    if (!teamResponse.ok) {
      throw new Error(`Falha na criação da equipe: ${teamResponse.status}`);
    }

    const teamResult = await teamResponse.json();
    const createdTeam = teamResult.data.team;
    console.log('✅ Equipe criada com sucesso');
    console.log(`   ID: ${createdTeam._id}`);
    console.log(`   Nome: ${createdTeam.name}`);
    console.log(`   Departamento: ${createdTeam.department}\n`);

    // === 3. TESTE DE CRIAÇÃO DE MEMBROS ===
    console.log('👥 3. Testando criação de membros...');

    const membersData = [
      {
        name: 'João Silva',
        email: 'joao.silva@epu.com',
        matricula: 'EPU001',
        company: 'EPU',
        position: 'Desenvolvedor Frontend Senior',
        team: createdTeam._id,
        isActive: true,
        birthDate: '1990-05-15',
      },
      {
        name: 'Maria Santos',
        email: 'maria.santos@epu.com',
        matricula: 'EPU002',
        company: 'EPU',
        position: 'Desenvolvedora Backend Senior',
        team: createdTeam._id,
        isActive: true,
        birthDate: '1988-11-23',
      },
      {
        name: 'Pedro Lima',
        email: 'pedro.lima@epu.com',
        matricula: 'EPU003',
        company: 'EPU',
        position: 'DevOps Engineer',
        team: createdTeam._id,
        isActive: true,
        birthDate: '1992-08-07',
      },
    ];

    const createdMembers = [];

    for (const memberData of membersData) {
      const memberResponse = await fetch(`${baseURL}/members`, {
        method: 'POST',
        headers,
        body: JSON.stringify(memberData),
      });

      if (!memberResponse.ok) {
        throw new Error(
          `Falha na criação do membro ${memberData.name}: ${memberResponse.status}`
        );
      }

      const memberResult = await memberResponse.json();
      createdMembers.push(memberResult.data.member);
      console.log(
        `✅ Membro criado: ${memberData.name} (${memberData.position})`
      );
    }
    console.log(`   Total de membros criados: ${createdMembers.length}\n`);

    // === 4. TESTE DE CRIAÇÃO DE PROJETO ===
    console.log('📁 4. Testando criação de projeto...');

    const projectData = {
      name: 'Sistema EPU - Módulo de Gestão de Equipes',
      description:
        'Desenvolvimento completo do módulo de gestão de equipes, incluindo CRUD, relatórios e dashboards',
      status: 'active',
      priority: 'high',
      teams: [createdTeam._id],
      mainTeam: createdTeam._id,
      startDate: new Date().toISOString(),
      deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 dias
      budget: 200000,
      goals: [
        'Implementar CRUD completo de equipes',
        'Desenvolver dashboard de métricas',
        'Criar sistema de relatórios',
        'Implementar notificações em tempo real',
      ],
    };

    const projectResponse = await fetch(`${baseURL}/projects`, {
      method: 'POST',
      headers,
      body: JSON.stringify(projectData),
    });

    if (!projectResponse.ok) {
      throw new Error(`Falha na criação do projeto: ${projectResponse.status}`);
    }

    const projectResult = await projectResponse.json();
    const createdProject = projectResult.data.project;
    console.log('✅ Projeto criado com sucesso');
    console.log(`   ID: ${createdProject._id}`);
    console.log(`   Nome: ${createdProject.name}`);
    console.log(`   Status: ${createdProject.status}`);
    console.log(`   Prioridade: ${createdProject.priority}\n`);

    // === 5. VERIFICAÇÃO DE INTEGRIDADE ===
    console.log('🔍 5. Verificando integridade dos dados...');

    // Verificar equipe criada
    const teamVerifyResponse = await fetch(
      `${baseURL}/teams/${createdTeam._id}`,
      {
        headers,
      }
    );

    if (teamVerifyResponse.ok) {
      const teamData = await teamVerifyResponse.json();
      console.log('✅ Equipe verificada no banco de dados');
      console.log(
        `   Membros associados: ${teamData.data.members?.length || 0}`
      );
    }

    // Verificar projeto criado
    const projectVerifyResponse = await fetch(
      `${baseURL}/projects/${createdProject._id}`,
      {
        headers,
      }
    );

    if (projectVerifyResponse.ok) {
      const projectData = await projectVerifyResponse.json();
      console.log('✅ Projeto verificado no banco de dados');
      console.log(
        `   Equipes associadas: ${projectData.data.teams?.length || 0}`
      );
    }

    // === 6. TESTE DE LISTAGEM ===
    console.log('\n📋 6. Testando listagens...');

    // Listar todas as equipes
    const teamsListResponse = await fetch(`${baseURL}/teams`, { headers });
    if (teamsListResponse.ok) {
      const teamsData = await teamsListResponse.json();
      console.log(
        `✅ Lista de equipes obtida: ${teamsData.data?.length || 0} equipes`
      );
    }

    // Listar todos os membros
    const membersListResponse = await fetch(`${baseURL}/members`, { headers });
    if (membersListResponse.ok) {
      const membersData = await membersListResponse.json();
      console.log(
        `✅ Lista de membros obtida: ${membersData.data?.length || 0} membros`
      );
    }

    // Listar todos os projetos
    const projectsListResponse = await fetch(`${baseURL}/projects`, {
      headers,
    });
    if (projectsListResponse.ok) {
      const projectsData = await projectsListResponse.json();
      console.log(
        `✅ Lista de projetos obtida: ${projectsData.data?.length || 0} projetos`
      );
    }

    // === RESULTADO FINAL ===
    console.log('\n🎉 TESTE COMPLETO FINALIZADO COM SUCESSO!');
    console.log('📊 Resumo dos dados criados:');
    console.log(`   • 1 Equipe: ${createdTeam.name}`);
    console.log(
      `   • ${createdMembers.length} Membros: ${createdMembers.map((m) => m.name).join(', ')}`
    );
    console.log(`   • 1 Projeto: ${createdProject.name}`);
    console.log('\n✅ Todo o fluxo está funcionando corretamente!');

    return {
      success: true,
      data: {
        team: createdTeam,
        members: createdMembers,
        project: createdProject,
      },
    };
  } catch (error) {
    console.error('❌ ERRO NO TESTE:', error.message);
    console.error('🔍 Detalhes do erro:', error);

    return {
      success: false,
      error: error.message,
    };
  }
};

// === TESTE DE FRONTEND ===
const testFrontendIntegration = async () => {
  console.log('\n🖥️ Testando integração do frontend...');

  try {
    // Verificar se frontend está rodando
    const frontendResponse = await fetch('http://localhost:3000');
    if (frontendResponse.ok) {
      console.log('✅ Frontend está rodando na porta 3000');
    }

    // Verificar página de equipes
    const teamsPageResponse = await fetch('http://localhost:3000/teams');
    if (teamsPageResponse.ok) {
      console.log('✅ Página de equipes está acessível em /teams');
    }

    console.log('\n📝 Para testar manualmente no frontend:');
    console.log('1. Acesse: http://localhost:3000/teams');
    console.log('2. Faça login com: admin@epu.com / admin123');
    console.log('3. Teste criar uma nova equipe');
    console.log('4. Verifique se os dados aparecem na lista');
  } catch (error) {
    console.log('⚠️ Frontend não está rodando ou não acessível');
    console.log('   Execute: cd frontend && npm start');
  }
};

// Exportar funções para uso
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testCompleteFlow,
    testFrontendIntegration,
  };
}

// Se executado diretamente
if (typeof window === 'undefined' && require.main === module) {
  (async () => {
    await testCompleteFlow();
    await testFrontendIntegration();
  })();
}
