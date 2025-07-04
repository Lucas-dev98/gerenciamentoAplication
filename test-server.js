// Minimal test server to verify endpoint logic
require('dotenv').config({ path: './backend/.env' });
const express = require('express');

// Import mock data
const { mockProjectData } = require('./backend/src/config/mockData');

const app = express();
const PORT = 5001; // Different port to avoid conflicts

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ status: 'success', message: 'Test server running' });
});

// Frentes endpoint with simplified logic
app.get('/api/projects/:id/frentes', async (req, res) => {
  try {
    console.log(`[FRENTES-TEST] Solicitação para projeto ID: ${req.params.id}`);

    // Always use mock data for this test
    console.log('[FRENTES-TEST] Retornando dados mock para frentes');
    const mockProject = mockProjectData.projects[0]; // Get the first project
    const mockFrentes = {
      parada: mockProject.csvData.procedimento_parada || [],
      manutencao: mockProject.csvData.manutencao || [],
      partida: mockProject.csvData.procedimento_partida || [],
    };

    res.json({ status: 'success', data: mockFrentes, source: 'mock' });
  } catch (error) {
    console.error('[FRENTES-TEST] Erro:', error);
    res.status(500).json({ status: 'error', message: 'Erro interno' });
  }
});

// Statistics endpoint with simplified logic
app.get('/api/projects/:id/statistics', async (req, res) => {
  try {
    console.log(
      `[STATISTICS-TEST] Solicitação para projeto ID: ${req.params.id}`
    );

    // Always use mock data for this test
    console.log('[STATISTICS-TEST] Retornando dados mock para statistics');

    const mockProject = mockProjectData.projects[0]; // Get the first project
    const parada = mockProject.csvData.procedimento_parada || [];
    const manutencao = mockProject.csvData.manutencao || [];
    const partida = mockProject.csvData.procedimento_partida || [];

    const mockStats = {
      totalActivities: parada.length + manutencao.length + partida.length,
      activitiesByType: {
        parada: parada.length,
        manutencao: manutencao.length,
        partida: partida.length,
      },
      totalProgress: 75,
      lastUpdated: new Date().toISOString(),
    };

    res.json({ status: 'success', data: mockStats, source: 'mock' });
  } catch (error) {
    console.error('[STATISTICS-TEST] Erro:', error);
    res.status(500).json({ status: 'error', message: 'Erro interno' });
  }
});

app.listen(PORT, () => {
  console.log(`🧪 Test Server rodando na porta ${PORT}`);
  console.log(`🌐 Teste: http://localhost:${PORT}/api/test`);
  console.log(
    `📊 Frentes: http://localhost:${PORT}/api/projects/60d5ec49f1b2c8b1f8c4e456/frentes`
  );
  console.log(
    `📈 Statistics: http://localhost:${PORT}/api/projects/60d5ec49f1b2c8b1f8c4e456/statistics`
  );
});
