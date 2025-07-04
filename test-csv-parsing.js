const fs = require('fs');
const path = require('path');

// Função para processar dados CSV dos seus arquivos
const loadCSVData = (fileName) => {
  try {
    console.log(`\n📁 Carregando ${fileName}...`);

    const filePath = path.join(
      __dirname,
      'backend',
      'src',
      'data',
      'csv',
      fileName
    );
    const content = fs.readFileSync(filePath, 'utf8');

    const lines = content.split('\n');
    const result = [];

    // Processar cada linha (pular cabeçalho)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Os CSVs têm formato: name,value,baseline,sub_activities
      const parts = line.split(',');
      if (parts.length >= 4) {
        const name = parts[0];
        const value = parts[1];
        const baseline = parts[2];
        const subActivitiesRaw = parts.slice(3).join(','); // Reagrupar sub_activities que podem ter vírgulas

        // Processar sub-atividades (formato: "atividade:real|planejado; atividade2:real|planejado")
        const subActivities = [];
        if (subActivitiesRaw) {
          const subParts = subActivitiesRaw.split(';');
          for (const sub of subParts) {
            const trimmed = sub.trim();
            if (trimmed) {
              const [subName, values] = trimmed.split(':');
              if (subName && values) {
                const [real, planejado] = values.split('|');
                subActivities.push({
                  name: subName.trim(),
                  progress: parseFloat(real?.replace(',', '.')) || 0,
                  baseline: parseFloat(planejado?.replace(',', '.')) || 0,
                });
              }
            }
          }
        }

        result.push({
          name: name.trim(),
          progress: parseFloat(value?.replace(',', '.')) || 0,
          baseline: parseFloat(baseline?.replace(',', '.')) || 0,
          subActivities: subActivities,
        });
      }
    }

    console.log(`✅ ${result.length} atividades carregadas`);
    console.log(
      `📊 Primeira atividade: ${result[0]?.name} (${result[0]?.subActivities?.length || 0} sub-atividades)`
    );

    return result;
  } catch (error) {
    console.error(`❌ Erro ao carregar ${fileName}:`, error.message);
    return [];
  }
};

// Testar todos os CSVs
console.log('🚀 Testando carregamento dos CSVs reais...');

const parada = loadCSVData('procedimento_parada.csv');
const manutencao = loadCSVData('manutencao.csv');
const partida = loadCSVData('procedimento_partida.csv');

console.log('\n📈 Resumo:');
console.log(`- Procedimento de Parada: ${parada.length} atividades`);
console.log(`- Manutenção: ${manutencao.length} atividades`);
console.log(`- Procedimento de Partida: ${partida.length} atividades`);

// Mostrar exemplo de dados processados
if (partida.length > 0) {
  console.log('\n🔍 Exemplo de atividade (Procedimento de Partida):');
  console.log(JSON.stringify(partida[0], null, 2));
}
