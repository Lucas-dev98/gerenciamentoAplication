// Backend temporário funcional para testar endpoints
const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares básicos
app.use(cors());
app.use(express.json());

// Rota de teste
app.get('/api/test', (req, res) => {
  console.log('=== TESTE FUNCIONANDO ===');
  res.json({ message: 'Funcionando!' });
});

// Endpoints do projeto (simulados)
app.get('/api/projects/:id/procedimento-parada', (req, res) => {
  console.log('=== PROCEDIMENTO PARADA CHAMADO ===');
  res.json([
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
  ]);
});

app.get('/api/projects/:id/manutencao', (req, res) => {
  console.log('=== MANUTENÇÃO CHAMADO ===');
  res.json([
    {
      name: 'Forno',
      planned: 90.0,
      real: 85.0,
      image: '/static/images/frentes/forno.png',
      sub_activities: [
        {
          name: 'Limpeza do Forno',
          real: 95.0,
          planned: 90.0,
        },
      ],
    },
  ]);
});

app.get('/api/projects/:id/procedimento-partida', (req, res) => {
  console.log('=== PROCEDIMENTO PARTIDA CHAMADO ===');
  res.json([
    {
      name: 'Ventiladores',
      planned: 70.0,
      real: 68.0,
      image: '/static/images/frentes/ventilador.png',
      sub_activities: [],
    },
  ]);
});

app.get('/api/projects/:id/frentes', (req, res) => {
  console.log('=== FRENTES CHAMADO ===');
  res.json({
    procedimento_parada: [],
    manutencao: [
      {
        name: 'Forno',
        planned: 90.0,
        real: 85.0,
        image: '/static/images/frentes/forno.png',
        sub_activities: [],
      },
    ],
    procedimento_partida: [
      {
        name: 'Ventiladores',
        planned: 70.0,
        real: 68.0,
        image: '/static/images/frentes/ventilador.png',
        sub_activities: [],
      },
    ],
  });
});

app.get('/api/projects/:id/statistics', (req, res) => {
  console.log('=== STATISTICS CHAMADO ===');
  res.json({
    status: 'success',
    data: {
      geral: {
        totalAtividades: 3,
        progressoMedioReal: 76.8,
        progressoMedioPlanejado: 81.7,
        eficiencia: 94.0,
        progressoGeral: 78.8,
        status: 'active',
      },
      atividades: {
        parada: 1,
        manutencao: 1,
        partida: 1,
      },
      frentes: {
        procedimento_parada: {
          total: 1,
          concluidas: 0,
          progressoMedio: 75.2,
        },
        manutencao: {
          total: 1,
          concluidas: 0,
          progressoMedio: 85.0,
        },
        procedimento_partida: {
          total: 1,
          concluidas: 0,
          progressoMedio: 70.0,
        },
      },
    },
  });
});

const PORT = 6000; // Porta diferente para não conflitar
app.listen(PORT, () => {
  console.log(`🚀 Backend temporário rodando na porta ${PORT}`);
  console.log(`🔗 Teste: http://localhost:${PORT}/api/test`);
});
