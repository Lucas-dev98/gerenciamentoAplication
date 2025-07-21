// Test script para verificar se o frontend está usando dados reais da API
// Execute este script no console do navegador em http://localhost:3000

async function testRealApiData() {
  console.log('🔧 Teste completo: Dados reais da API vs dados simulados');

  try {
    // 1. Teste direto da API através do proxy
    console.log('\n1️⃣ Testando API diretamente através do proxy...');
    const apiResponse = await fetch(
      '/api/weather/weather?lat=-23.5505&lon=-46.6333'
    );

    if (apiResponse.ok) {
      const apiData = await apiResponse.json();
      console.log('✅ API funcionando - dados reais recebidos:');
      console.log(`  📍 Local: ${apiData.name}`);
      console.log(`  🌡️ Temperatura: ${Math.round(apiData.main.temp)}°C`);
      console.log(`  ☁️ Descrição: ${apiData.weather[0].description}`);
      console.log(`  💧 Umidade: ${apiData.main.humidity}%`);

      // 2. Verificar se o weatherService está configurado corretamente
      console.log('\n2️⃣ Verificando configuração do weatherService...');

      // Acessar o weatherService do contexto global (se disponível)
      const weather = window.weatherService || {
        isOffline: () => true,
        enableOnlineMode: () => console.log('enableOnlineMode não disponível'),
        getCurrentWeather: async () => null,
      };

      console.log(`  🔄 Modo offline ativo: ${weather.isOffline()}`);

      if (weather.isOffline()) {
        console.log('⚠️ PROBLEMA: WeatherService está em modo offline!');
        console.log('  Ativando modo online...');
        weather.enableOnlineMode();

        // Aguardar um momento para a configuração ser aplicada
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log(`  🔄 Modo offline após ativação: ${weather.isOffline()}`);
      }

      // 3. Teste do weatherService com dados reais
      console.log('\n3️⃣ Testando weatherService com dados reais...');

      try {
        const weatherData = await weather.getCurrentWeather(-23.5505, -46.6333);

        if (weatherData) {
          console.log('✅ WeatherService retornou dados:');
          console.log(`  📍 Local: ${weatherData.location}`);
          console.log(`  🌡️ Temperatura: ${weatherData.temperature}°C`);
          console.log(`  ☁️ Descrição: ${weatherData.description}`);
          console.log(`  💧 Umidade: ${weatherData.humidity}%`);

          // Comparar com dados da API para verificar se são reais
          const tempDiff = Math.abs(
            weatherData.temperature - Math.round(apiData.main.temp)
          );
          const humidityDiff = Math.abs(
            weatherData.humidity - apiData.main.humidity
          );

          if (tempDiff <= 1 && humidityDiff <= 5) {
            console.log(
              '🎉 SUCESSO: WeatherService está usando dados REAIS da API!'
            );
            return true;
          } else {
            console.log(
              '❌ PROBLEMA: WeatherService está retornando dados diferentes da API'
            );
            console.log(`  Diferença temperatura: ${tempDiff}°C`);
            console.log(`  Diferença umidade: ${humidityDiff}%`);
            console.log('  Provavelmente ainda está usando dados simulados');
            return false;
          }
        } else {
          console.log('❌ WeatherService retornou null - possível erro');
          return false;
        }
      } catch (error) {
        console.error('❌ Erro ao chamar weatherService:', error);
        return false;
      }
    } else {
      console.error(
        '❌ API não está funcionando:',
        apiResponse.status,
        apiResponse.statusText
      );
      return false;
    }
  } catch (error) {
    console.error('❌ Erro geral no teste:', error);
    return false;
  }
}

// Função para simular clique no botão de geolocalização
async function testGeolocationButton() {
  console.log('\n🌍 Testando botão de geolocalização...');

  // Procurar o botão de geolocalização
  const locationButton =
    document.querySelector('[data-testid="location-button"]') ||
    document.querySelector('button[title*="localização"]') ||
    document.querySelector('button[title*="location"]') ||
    document.querySelector('button:contains("📍")');

  if (locationButton) {
    console.log('✅ Botão de geolocalização encontrado');

    // Simular clique
    locationButton.click();
    console.log('🖱️ Clique simulado no botão');

    // Aguardar carregamento
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Verificar se os dados foram atualizados
    console.log('⏳ Aguardando carregamento dos dados...');
  } else {
    console.log('❌ Botão de geolocalização não encontrado');
    console.log(
      'Procure por um botão com ícone 📍 ou texto relacionado à localização'
    );
  }
}

// Executar teste automaticamente
console.log('🚀 Iniciando teste de dados reais da API...');
testRealApiData().then((success) => {
  if (success) {
    console.log(
      '\n✅ RESULTADO: Sistema configurado corretamente para usar dados reais!'
    );
  } else {
    console.log('\n❌ RESULTADO: Sistema ainda está usando dados simulados');
    console.log(
      '💡 Dica: Tente clicar no botão de geolocalização na interface'
    );
  }
});
