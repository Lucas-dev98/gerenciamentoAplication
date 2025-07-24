/**
 * 🌤️ Teste das Melhorias no Sistema de Previsão do Tempo
 *
 * Este script testa as correções feitas para as previsões de 7, 10 e 14 dias
 */

console.log('🌤️ TESTE DAS MELHORIAS NO SISTEMA DE PREVISÃO DO TEMPO');
console.log('==================================================');

async function testWeatherForecastFix() {
  try {
    // 1. Testar API backend funcionando
    console.log('\n1️⃣ Testando conectividade com backend...');

    const healthResponse = await fetch('http://localhost:3001/health');
    if (healthResponse.ok) {
      console.log('✅ Backend respondendo corretamente');
    } else {
      console.log('❌ Backend não está respondendo');
      throw new Error('Backend indisponível');
    }

    // 2. Testar API de clima atual
    console.log('\n2️⃣ Testando API de clima atual...');

    const currentResponse = await fetch(
      'http://localhost:3001/api/weather/weather?lat=-23.5505&lon=-46.6333'
    );
    if (currentResponse.ok) {
      const currentData = await currentResponse.json();
      console.log('✅ API de clima atual funcionando:');
      console.log(`   📍 Local: ${currentData.name}`);
      console.log(`   🌡️ Temperatura: ${currentData.main.temp}°C`);
      console.log(`   🌤️ Condição: ${currentData.weather[0].description}`);
    } else {
      console.log('❌ Erro na API de clima atual:', currentResponse.status);
    }

    // 3. Testar API de previsão (dados reais da API)
    console.log('\n3️⃣ Testando API de previsão (5 dias reais)...');

    const forecastResponse = await fetch(
      'http://localhost:3001/api/weather/forecast?lat=-23.5505&lon=-46.6333'
    );
    if (forecastResponse.ok) {
      const forecastData = await forecastResponse.json();
      console.log('✅ API de previsão funcionando:');
      console.log(`   📍 Local: ${forecastData.city.name}`);
      console.log(`   📊 Registros de previsão: ${forecastData.list.length}`);

      // Simular processamento como no frontend
      const dailyData = {};

      forecastData.list.forEach((item) => {
        const date = new Date(item.dt * 1000);
        const dateKey = date.toDateString();

        if (!dailyData[dateKey]) {
          dailyData[dateKey] = [];
        }
        dailyData[dateKey].push(item);
      });

      const realDays = Object.keys(dailyData).slice(0, 5);
      console.log(`   📅 Dias reais disponíveis: ${realDays.length}`);

      realDays.forEach((dateKey, index) => {
        const date = new Date(dateKey);
        const dayData = dailyData[dateKey];
        const temps = dayData.map((item) => item.main.temp);
        const minTemp = Math.round(Math.min(...temps));
        const maxTemp = Math.round(Math.max(...temps));

        const dayLabel =
          index === 0
            ? 'Hoje'
            : index === 1
              ? 'Amanhã'
              : date.toLocaleDateString('pt-BR', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                });

        console.log(`     ${dayLabel}: ${minTemp}°C - ${maxTemp}°C`);
      });
    } else {
      console.log('❌ Erro na API de previsão:', forecastResponse.status);
    }

    // 4. Simular geração de previsões estendidas
    console.log('\n4️⃣ Testando geração de previsões estendidas...');

    // Simular dados da API (primeiros 5 dias)
    const mockApiDays = [
      {
        date: 'Hoje',
        temperature: { min: 18, max: 28 },
        description: 'ensolarado',
        humidity: 65,
        windSpeed: 12,
      },
      {
        date: 'Amanhã',
        temperature: { min: 19, max: 29 },
        description: 'parcialmente nublado',
        humidity: 70,
        windSpeed: 10,
      },
      {
        date: 'Ter, 3 dez',
        temperature: { min: 17, max: 26 },
        description: 'nublado',
        humidity: 75,
        windSpeed: 15,
      },
      {
        date: 'Qua, 4 dez',
        temperature: { min: 16, max: 24 },
        description: 'chuva leve',
        humidity: 80,
        windSpeed: 18,
      },
      {
        date: 'Qui, 5 dez',
        temperature: { min: 15, max: 22 },
        description: 'chuva',
        humidity: 85,
        windSpeed: 20,
      },
    ];

    console.log('📊 Dados reais da API (5 dias):');
    mockApiDays.forEach((day) => {
      console.log(
        `   ${day.date}: ${day.temperature.min}°C - ${day.temperature.max}°C (${day.description})`
      );
    });

    // Simular geração para 7, 10 e 14 dias
    const testCases = [7, 10, 14];

    testCases.forEach((requestedDays) => {
      console.log(`\n🔮 Simulando previsão para ${requestedDays} dias:`);

      if (requestedDays > 5) {
        const additionalDays = requestedDays - 5;
        console.log(`   📅 ${5} dias reais + ${additionalDays} dias estimados`);

        // Simular geração de dias estendidos
        const lastDay = mockApiDays[mockApiDays.length - 1];
        const tempTrend =
          (mockApiDays[4].temperature.max - mockApiDays[0].temperature.max) / 5;

        console.log(
          `   📈 Tendência de temperatura: ${tempTrend > 0 ? '+' : ''}${tempTrend.toFixed(1)}°C por dia`
        );

        for (let i = 0; i < additionalDays; i++) {
          const futureDate = new Date();
          futureDate.setDate(futureDate.getDate() + 5 + i);

          const estimatedMaxTemp = Math.round(
            lastDay.temperature.max +
              tempTrend * (i + 1) +
              (Math.random() - 0.5) * 4
          );
          const estimatedMinTemp = Math.round(
            estimatedMaxTemp - 8 - Math.random() * 4
          );

          const dateLabel = futureDate.toLocaleDateString('pt-BR', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
          });

          console.log(
            `   ${dateLabel}: ${estimatedMinTemp}°C - ${estimatedMaxTemp}°C (estimado)`
          );
        }
      } else {
        console.log(`   📅 Todos os ${requestedDays} dias são reais da API`);
      }
    });
  } catch (error) {
    console.error('❌ ERRO no teste:', error.message);
    console.log('\n🔧 VERIFICAÇÕES NECESSÁRIAS:');
    console.log('   1. Backend está rodando na porta 3001?');
    console.log('   2. API Key do OpenWeatherMap está configurada?');
    console.log('   3. Conexão com internet está funcionando?');
    console.log('\n💡 EXECUTE: npm start no diretório backend/');
  }
}

// Executar teste
testWeatherForecastFix();
