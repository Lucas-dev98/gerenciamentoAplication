// Script para testar geolocalização no console do navegador
// Copie e cole este código no console em http://localhost:3000

// 1. Primeiro, vamos testar se a API está funcionando
async function testBackendAPI() {
  console.log('🧪 Testando backend API...');

  try {
    const response = await fetch('/api/weather/test');
    const data = await response.json();
    console.log('✅ Backend API funcionando:', data);
    return true;
  } catch (error) {
    console.error('❌ Backend API com problema:', error);
    return false;
  }
}

// 2. Testar clima por coordenadas
async function testWeatherCoords() {
  console.log('🌍 Testando clima por coordenadas...');

  try {
    const response = await fetch(
      '/api/weather/weather?lat=-23.5505&lon=-46.6333'
    );
    const data = await response.json();
    console.log('✅ Clima por coordenadas funcionando:');
    console.log(`   📍 Local: ${data.name}`);
    console.log(`   🌡️ Temperatura: ${data.main.temp}°C`);
    console.log(`   🌤️ Tempo: ${data.weather[0].description}`);
    return true;
  } catch (error) {
    console.error('❌ Clima por coordenadas com problema:', error);
    return false;
  }
}

// 3. Simular geolocalização e obter clima local
async function testRealGeolocation() {
  console.log('📍 Testando geolocalização real...');

  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.error('❌ Geolocalização não suportada');
      resolve(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log(`📍 Sua localização: ${latitude}, ${longitude}`);

        try {
          const response = await fetch(
            `/api/weather/weather?lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();

          console.log('✅ Clima da sua localização:');
          console.log(`   📍 Local: ${data.name}`);
          console.log(`   🌡️ Temperatura: ${data.main.temp}°C`);
          console.log(`   🌤️ Tempo: ${data.weather[0].description}`);
          console.log(`   💧 Umidade: ${data.main.humidity}%`);
          console.log(`   💨 Vento: ${data.wind.speed} m/s`);

          resolve(true);
        } catch (error) {
          console.error('❌ Erro ao obter clima local:', error);
          resolve(false);
        }
      },
      (error) => {
        console.warn('⚠️ Erro de geolocalização:', error.message);
        if (error.code === 1) {
          console.warn(
            '   💡 Dica: Permita acesso à localização nas configurações do navegador'
          );
        }
        resolve(false);
      },
      {
        timeout: 10000,
        enableHighAccuracy: false,
        maximumAge: 300000,
      }
    );
  });
}

// 4. Função principal que roda todos os testes
async function runAllTests() {
  console.log('🚀 Iniciando testes de geolocalização completos...\n');

  const test1 = await testBackendAPI();
  console.log('');

  const test2 = await testWeatherCoords();
  console.log('');

  const test3 = await testRealGeolocation();
  console.log('');

  console.log('📊 Resumo dos testes:');
  console.log(`   Backend API: ${test1 ? '✅' : '❌'}`);
  console.log(`   Coordenadas: ${test2 ? '✅' : '❌'}`);
  console.log(`   Geolocalização: ${test3 ? '✅' : '❌'}`);

  if (test1 && test2 && test3) {
    console.log(
      '\n🎉 Todos os testes passaram! Sistema funcionando perfeitamente!'
    );
  } else if (test1 && test2) {
    console.log(
      '\n✅ Backend funcionando! Se a geolocalização falhou, verifique as permissões do navegador.'
    );
  } else {
    console.log('\n⚠️ Alguns testes falharam. Verifique os logs acima.');
  }
}

// Disponibilizar funções globalmente
window.testBackendAPI = testBackendAPI;
window.testWeatherCoords = testWeatherCoords;
window.testRealGeolocation = testRealGeolocation;
window.runAllTests = runAllTests;

console.log('🔧 Testes de geolocalização carregados!');
console.log('📝 Execute: runAllTests() para testar tudo');
console.log('   ou use as funções individuais disponíveis');
