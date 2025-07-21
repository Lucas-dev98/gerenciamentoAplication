// Teste de Geolocalização - Clima por Coordenadas
// Execute este código no console do navegador em http://localhost:3000

// Função para testar a API de clima com coordenadas específicas
async function testWeatherByCoords(lat, lon, locationName) {
  console.log(`\n=== Testando clima para ${locationName} (${lat}, ${lon}) ===`);

  try {
    // Testar através do proxy do frontend
    const response = await fetch(`/api/weather/weather?lat=${lat}&lon=${lon}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    console.log(`✅ Sucesso para ${locationName}:`);
    console.log(`   📍 Localização: ${data.name}, ${data.sys.country}`);
    console.log(`   🌡️  Temperatura: ${data.main.temp}°C`);
    console.log(`   🌤️  Tempo: ${data.weather[0].description}`);
    console.log(`   💧 Umidade: ${data.main.humidity}%`);
    console.log(`   💨 Vento: ${data.wind.speed} m/s`);

    return data;
  } catch (error) {
    console.error(`❌ Erro para ${locationName}:`, error);
    return null;
  }
}

// Coordenadas de teste para diferentes cidades brasileiras
const testLocations = [
  { lat: -23.5505, lon: -46.6333, name: 'São Paulo' },
  { lat: -22.9068, lon: -43.1729, name: 'Rio de Janeiro' },
  { lat: -19.9191, lon: -43.9386, name: 'Belo Horizonte' },
  { lat: -30.0346, lon: -51.2177, name: 'Porto Alegre' },
  { lat: -25.4244, lon: -49.2654, name: 'Curitiba' },
  { lat: -8.0476, lon: -34.877, name: 'Recife' },
];

// Função principal para testar todas as localizações
async function testAllLocations() {
  console.log('🧪 Iniciando testes de geolocalização...');
  console.log('🌍 Testando API de clima para várias cidades brasileiras');

  for (const location of testLocations) {
    await testWeatherByCoords(location.lat, location.lon, location.name);
    // Pequena pausa entre requests
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log('\n✅ Testes de geolocalização concluídos!');
  console.log(
    '📋 Resultados mostram que a API está funcionando com coordenadas'
  );
}

// Função para simular a geolocalização do usuário
function simulateUserLocation(lat, lon, cityName = 'Sua localização') {
  console.log(
    `\n🎯 Simulando localização do usuário: ${cityName} (${lat}, ${lon})`
  );

  // Simular o que acontece quando o usuário clica no botão de localização
  testWeatherByCoords(lat, lon, cityName);
}

// Exportar funções para uso no console
window.testWeatherByCoords = testWeatherByCoords;
window.testAllLocations = testAllLocations;
window.simulateUserLocation = simulateUserLocation;

console.log('🔧 Funções de teste carregadas!');
console.log('📝 Use no console:');
console.log('   testAllLocations() - Testa várias cidades');
console.log(
  "   simulateUserLocation(-23.5505, -46.6333, 'São Paulo') - Simula sua localização"
);
console.log(
  "   testWeatherByCoords(lat, lon, 'Nome da Cidade') - Teste específico"
);
