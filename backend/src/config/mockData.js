// Dados mockados para testes sem MongoDB
const mockProjectData = {
  users: [
    {
      id: '60d5ec49f1b2c8b1f8c4e123',
      name: 'Lucas Oliveira Bastos',
      email: 'l.o.bastos@live.com',
      password: '$2b$10$hashedpassword', // Senha: 44351502741-+as
      role: 'admin',
    },
  ],

  projects: [
    {
      id: '60d5ec49f1b2c8b1f8c4e456',
      name: 'Projeto Teste CSV Upload',
      description: 'Projeto de teste para visualização',
      status: 'active',
      createdBy: '60d5ec49f1b2c8b1f8c4e123',
      team: ['60d5ec49f1b2c8b1f8c4e123'],
      csvData: {
        procedimento_parada: [
          {
            name: 'Pátio de Alimentação',
            planned: 80.0,
            real: 75.2,
            image: '/static/images/frentes/patioAlimentacao.png',
            sub_activities: [
              {
                name: 'Alimentação Principal',
                real: 85.0,
                planned: 90.0,
              },
              {
                name: 'Esteira Transportadora',
                real: 70.0,
                planned: 75.0,
              },
            ],
          },
          {
            name: 'Britagem Primária',
            planned: 95.0,
            real: 88.5,
            image: '/static/images/frentes/britagemPrimaria.png',
            sub_activities: [
              {
                name: 'Britador Principal',
                real: 90.0,
                planned: 95.0,
              },
              {
                name: 'Sistema de Peneiramento',
                real: 85.0,
                planned: 95.0,
              },
            ],
          },
        ],
        manutencao: [
          {
            name: 'Forno',
            planned: 90.0,
            real: 85.0,
            image: '/static/images/frentes/forno.png',
            sub_activities: [
              {
                name: 'Refratários',
                real: 80.0,
                planned: 85.0,
              },
              {
                name: 'Sistema de Combustão',
                real: 90.0,
                planned: 95.0,
              },
            ],
          },
          {
            name: 'Moinho',
            planned: 85.0,
            real: 92.0,
            image: '/static/images/frentes/moinho.png',
            sub_activities: [
              {
                name: 'Revestimento',
                real: 95.0,
                planned: 90.0,
              },
              {
                name: 'Sistema de Lubrificação',
                real: 88.0,
                planned: 80.0,
              },
            ],
          },
        ],
        procedimento_partida: [
          {
            name: 'Sistema Elétrico',
            planned: 100.0,
            real: 95.0,
            image: '/static/images/frentes/sistemaEletrico.png',
            sub_activities: [
              {
                name: 'Painéis de Controle',
                real: 100.0,
                planned: 100.0,
              },
              {
                name: 'Motores',
                real: 90.0,
                planned: 100.0,
              },
            ],
          },
          {
            name: 'Instrumentação',
            planned: 88.0,
            real: 82.0,
            image: '/static/images/frentes/instrumentacao.png',
            sub_activities: [
              {
                name: 'Sensores',
                real: 85.0,
                planned: 90.0,
              },
              {
                name: 'Atuadores',
                real: 78.0,
                planned: 85.0,
              },
            ],
          },
        ],
      },
    },
  ],
};

const calculateStatistics = (projectData) => {
  const allActivities = [
    ...projectData.procedimento_parada,
    ...projectData.manutencao,
    ...projectData.procedimento_partida,
  ];

  const totalAtividades = allActivities.length;
  const somaReal = allActivities.reduce(
    (sum, activity) => sum + activity.real,
    0
  );
  const somaPlanejado = allActivities.reduce(
    (sum, activity) => sum + activity.planned,
    0
  );

  const progressoMedioReal =
    totalAtividades > 0 ? somaReal / totalAtividades : 0;
  const progressoMedioPlanejado =
    totalAtividades > 0 ? somaPlanejado / totalAtividades : 0;
  const eficiencia =
    progressoMedioPlanejado > 0
      ? (progressoMedioReal / progressoMedioPlanejado) * 100
      : 0;

  return {
    success: true,
    data: {
      geral: {
        totalAtividades,
        progressoMedioReal,
        progressoMedioPlanejado,
        eficiencia,
      },
      por_frente: {
        procedimento_parada: {
          totalAtividades: projectData.procedimento_parada.length,
          progressoMedio:
            projectData.procedimento_parada.reduce(
              (sum, a) => sum + a.real,
              0
            ) / projectData.procedimento_parada.length,
        },
        manutencao: {
          totalAtividades: projectData.manutencao.length,
          progressoMedio:
            projectData.manutencao.reduce((sum, a) => sum + a.real, 0) /
            projectData.manutencao.length,
        },
        procedimento_partida: {
          totalAtividades: projectData.procedimento_partida.length,
          progressoMedio:
            projectData.procedimento_partida.reduce(
              (sum, a) => sum + a.real,
              0
            ) / projectData.procedimento_partida.length,
        },
      },
    },
  };
};

module.exports = {
  mockProjectData,
  calculateStatistics,
};
