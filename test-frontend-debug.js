// Teste Frontend Debug - Execute no console do navegador em http://localhost:3000
// Este arquivo testa especificamente o weatherService no frontend

// Função para testar o weatherService diretamente
async function testWeatherServiceFrontend() {
  console.log('🔍 Testando WeatherService Frontend...');

  try {
    // Verificar se o weatherService está disponível globalmente
    if (typeof window !== 'undefined' && window.weatherService) {
      console.log('✅ WeatherService encontrado no window object');
    } else {
      console.warn('⚠️ WeatherService não encontrado no window object');
    }

    // Testar através do import direto se possível
    console.log('🧪 Testando API de clima...');

    // Teste 1: Rota de teste
    console.log('\n--- Teste 1: Rota de teste ---');
    const testResponse = await fetch('/api/weather/test');
    if (testResponse.ok) {
      const testData = await testResponse.json();
      console.log('✅ Rota de teste funcionando:', testData);
    } else {
      console.error('❌ Rota de teste falhou:', testResponse.status);
    }

    // Teste 2: Clima por coordenadas (São Paulo)
    console.log('\n--- Teste 2: Clima por coordenadas ---');
    const weatherResponse = await fetch(
      '/api/weather/weather?lat=-23.5505&lon=-46.6333'
    );
    if (weatherResponse.ok) {
      const weatherData = await weatherResponse.json();
      console.log('✅ Clima por coordenadas funcionando:');
      console.log(`   📍 Local: ${weatherData.name}`);
      console.log(`   🌡️ Temperatura: ${weatherData.main.temp}°C`);
      console.log(`   🌤️ Tempo: ${weatherData.weather[0].description}`);
    } else {
      console.error('❌ Clima por coordenadas falhou:', weatherResponse.status);
    }

    // Teste 3: Verificar se o navigator.geolocation está disponível
    console.log('\n--- Teste 3: Geolocalização do navegador ---');
    if (navigator.geolocation) {
      console.log('✅ Geolocalização disponível no navegador');

      // Testar permissões
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({
          name: 'geolocation',
        });
        console.log(`📋 Status da permissão: ${permission.state}`);

        if (permission.state === 'denied') {
          console.warn(
            '⚠️ Permissão de geolocalização negada. Habilite nas configurações do navegador.'
          );
        }
      }
    } else {
      console.error('❌ Geolocalização não disponível no navegador');
    }

    // Teste 4: Tentar obter localização real (se possível)
    console.log('\n--- Teste 4: Obtendo localização real ---');
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          enableHighAccuracy: false,
          maximumAge: 300000, // 5 minutos
        });
      });

      const coords = position.coords;
      console.log(`✅ Localização obtida:`);
      console.log(`   📍 Latitude: ${coords.latitude}`);
      console.log(`   📍 Longitude: ${coords.longitude}`);
      console.log(`   📍 Precisão: ${coords.accuracy}m`);

      // Testar clima com localização real
      console.log('\n--- Teste 5: Clima da localização real ---');
      const realWeatherResponse = await fetch(
        `/api/weather/weather?lat=${coords.latitude}&lon=${coords.longitude}`
      );
      if (realWeatherResponse.ok) {
        const realWeatherData = await realWeatherResponse.json();
        console.log('✅ Clima da sua localização:');
        console.log(`   📍 Local: ${realWeatherData.name}`);
        console.log(`   🌡️ Temperatura: ${realWeatherData.main.temp}°C`);
        console.log(`   🌤️ Tempo: ${realWeatherData.weather[0].description}`);
        console.log(`   💧 Umidade: ${realWeatherData.main.humidity}%`);
      }
    } catch (geoError) {
      console.warn('⚠️ Não foi possível obter localização:', geoError.message);

      if (geoError.code === 1) {
        console.warn('   Motivo: Permissão negada pelo usuário');
      } else if (geoError.code === 2) {
        console.warn('   Motivo: Posição indisponível');
      } else if (geoError.code === 3) {
        console.warn('   Motivo: Timeout');
      }
    }

    console.log('\n✅ Testes do frontend concluídos!');
  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
  }
}

// Função para simular clique no botão de localização
function simulateLocationButton() {
  console.log('🎯 Simulando clique no botão de localização...');

  // Procurar pelo botão de localização na página
  const locationButtons = document.querySelectorAll('button');
  let foundButton = null;

  for (const button of locationButtons) {
    const buttonText = button.textContent || '';
    if (
      buttonText.includes('📍') ||
      buttonText.includes('localização') ||
      buttonText.includes('Obter')
    ) {
      foundButton = button;
      break;
    }
  }

  if (foundButton) {
    console.log('✅ Botão de localização encontrado, clicando...');
    foundButton.click();
  } else {
    console.warn('⚠️ Botão de localização não encontrado');
    console.log('Botões disponíveis na página:');
    document.querySelectorAll('button').forEach((btn, index) => {
      console.log(`  ${index}: "${btn.textContent}"`);
    });
  }
}

// Exportar funções para uso no console
window.testWeatherServiceFrontend = testWeatherServiceFrontend;
window.simulateLocationButton = simulateLocationButton;

console.log('🔧 Funções de debug frontend carregadas!');
console.log('📝 Use no console:');
console.log('   testWeatherServiceFrontend() - Testa todo o sistema');
console.log('   simulateLocationButton() - Simula clique no botão');
