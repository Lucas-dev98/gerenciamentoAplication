// Teste direto do csvProjectProcessor sem upload
const csvProjectProcessor = require('./backend/src/services/csvProjectProcessor');
const path = require('path');

async function testCSVProcessor() {
  try {
    console.log('🔍 Testando csvProjectProcessor diretamente...');

    // Caminho do arquivo CSV
    const csvPath = path.join(
      __dirname,
      'backend/src/data/Project/250619 - Report - PFBT1.csv'
    );
    console.log('📄 Arquivo CSV:', csvPath);

    // Testar apenas o processamento, sem criar projeto
    console.log('⚙️ Testando apenas o processamento de frentes...');
    const atividadesBrutas =
      await csvProjectProcessor.processarFrentes(csvPath);
    console.log(`✅ Frentes processadas: ${atividadesBrutas.length}`);

    if (atividadesBrutas.length > 0) {
      console.log('📋 Exemplo de atividade:', atividadesBrutas[0]);
    }

    console.log('⚙️ Testando formatação...');
    const atividadesFormatadas =
      csvProjectProcessor.formatarAtividades(atividadesBrutas);
    console.log(`✅ Atividades formatadas: ${atividadesFormatadas.length}`);

    console.log('⚙️ Testando desempilhamento...');
    const blocos =
      csvProjectProcessor.desempilharEmBlocos(atividadesFormatadas);
    console.log('✅ Blocos criados:', {
      parada: blocos.parada.length,
      manutencao: blocos.manutencao.length,
      partida: blocos.partida.length,
    });

    console.log('⚙️ Testando estatísticas...');
    const estatisticas = csvProjectProcessor.calcularEstatisticas(blocos);
    console.log('✅ Estatísticas:', estatisticas);

    console.log('⚙️ Testando formatação para banco...');
    const activities = csvProjectProcessor.formatarAtividadesParaBanco(blocos);
    console.log(`✅ Atividades para banco: ${activities.length}`);

    if (activities.length > 0) {
      console.log('📋 Exemplo de atividade para banco:', activities[0]);
    }

    console.log('🎉 Todos os testes passaram!');
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    console.error('Stack:', error.stack);
  }
}

testCSVProcessor();
