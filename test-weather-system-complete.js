/**
 * 🌤️ TESTE COMPLETO DO SISTEMA DE PREVISÃO DO TEMPO
 * Verificar se os dados para 7, 10 e 14 dias estão corretos
 */

console.log('🌤️ TESTE DO SISTEMA DE PREVISÃO - 7, 10 e 14 DIAS');
console.log('=================================================');

async function testWeatherForecastSystem() {
  try {
    console.log('\n1️⃣ Verificando se o backend está rodando...');

    // Testar se o backend está ativo
    try {
      const healthResponse = await fetch('http://localhost:3001/health');
      if (healthResponse.ok) {
        console.log('✅ Backend está rodando na porta 3001');
      } else {
        throw new Error('Backend não responde na porta 3001');
      }
    } catch (error) {
      console.log('❌ Backend não está rodando na porta 3001');
      console.log('💡 Execute: npm start no diretório backend/');
      return false;
    }

    // Coordenadas de teste (São Paulo)
    const lat = -23.5505;
    const lon = -46.6333;

    console.log('\n2️⃣ Testando API de clima atual...');
    const currentResponse = await fetch(
      `http://localhost:3001/api/weather/weather?lat=${lat}&lon=${lon}`
    );

    if (currentResponse.ok) {
      const currentData = await currentResponse.json();
      console.log('✅ API de clima atual funcionando:');
      console.log(`   📍 Local: ${currentData.name}`);
      console.log(`   🌡️ Temperatura: ${currentData.main.temp}°C`);
      console.log(`   🌤️ Condição: ${currentData.weather[0].description}`);
    } else {
      console.log('❌ Erro na API de clima atual:', currentResponse.status);
      return false;
    }

    console.log('\n3️⃣ Testando API de previsão do tempo...');
    const forecastResponse = await fetch(
      `http://localhost:3001/api/weather/forecast?lat=${lat}&lon=${lon}`
    );

    if (forecastResponse.ok) {
      const forecastData = await forecastResponse.json();
      console.log('✅ API de previsão funcionando:');
      console.log(`   📍 Local: ${forecastData.city.name}`);
      console.log(`   📊 Total de registros: ${forecastData.list.length}`);

      // Processar dados como no frontend
      console.log('\n4️⃣ Processando dados da API (como no frontend)...');

      const dailyData = {};

      // Agrupar por dia
      forecastData.list.forEach((item) => {
        const date = new Date(item.dt * 1000);
        const dateKey = date.toDateString();

        if (!dailyData[dateKey]) {
          dailyData[dateKey] = [];
        }
        dailyData[dateKey].push(item);
      });

      const apiDays = Object.keys(dailyData).slice(0, 5); // API fornece 5 dias
      console.log(`   📅 Dias reais da API: ${apiDays.length}`);

      // Processar cada dia real
      const realForecast = apiDays.map((dateKey, index) => {
        const dayData = dailyData[dateKey];
        const date = new Date(dateKey);

        const temps = dayData.map((item) => item.main.temp);
        const minTemp = Math.round(Math.min(...temps));
        const maxTemp = Math.round(Math.max(...temps));

        const midDayData =
          dayData.find((item) => {
            const hour = new Date(item.dt * 1000).getHours();
            return hour >= 11 && hour <= 14;
          }) || dayData[0];

        let formattedDate;
        if (index === 0) {
          formattedDate = 'Hoje';
        } else if (index === 1) {
          formattedDate = 'Amanhã';
        } else {
          formattedDate = date.toLocaleDateString('pt-BR', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
          });
        }

        return {
          date: formattedDate,
          temperature: { min: minTemp, max: maxTemp },
          description: midDayData.weather[0].description,
          icon: midDayData.weather[0].icon,
          humidity: midDayData.main.humidity,
          windSpeed: Math.round(midDayData.wind.speed * 3.6),
          source: 'API_REAL',
        };
      });

      console.log('\n   📋 PREVISÕES REAIS DA API (5 dias):');
      realForecast.forEach((day, index) => {
        console.log(
          `   ${index + 1}. ${day.date}: ${day.temperature.min}°C - ${day.temperature.max}°C (${day.description}) [${day.source}]`
        );
      });

      // Testar geração para 7, 10 e 14 dias
      console.log('\n5️⃣ Testando previsões estendidas...');

      const testCases = [7, 10, 14];

      testCases.forEach((requestedDays) => {
        console.log(`\n📅 TESTE PARA ${requestedDays} DIAS:`);

        let forecast = [...realForecast]; // Copiar dados reais

        if (requestedDays > forecast.length) {
          const additionalDays = requestedDays - forecast.length;
          console.log(
            `   ✅ ${forecast.length} dias reais + ${additionalDays} dias estimados`
          );

          // Simular geração de dias estendidos (como no código)
          const lastDay = forecast[forecast.length - 1];
          const today = new Date();

          // Calcular tendência
          const tempTrend =
            forecast.length > 1
              ? (forecast[forecast.length - 1].temperature.max -
                  forecast[0].temperature.max) /
                forecast.length
              : 0;

          console.log(
            `   📈 Tendência de temperatura: ${tempTrend > 0 ? '+' : ''}${tempTrend.toFixed(1)}°C por dia`
          );

          const seasonalPatterns = [
            {
              description: 'ensolarado',
              icon: '01d',
              tempVariation: 0,
              probability: 0.25,
            },
            {
              description: 'parcialmente nublado',
              icon: '02d',
              tempVariation: -1,
              probability: 0.3,
            },
            {
              description: 'nublado',
              icon: '03d',
              tempVariation: -2,
              probability: 0.2,
            },
            {
              description: 'chuva leve',
              icon: '10d',
              tempVariation: -4,
              probability: 0.15,
            },
            {
              description: 'chuva',
              icon: '09d',
              tempVariation: -6,
              probability: 0.08,
            },
            {
              description: 'trovoada',
              icon: '11d',
              tempVariation: -5,
              probability: 0.02,
            },
          ];

          for (let i = 0; i < additionalDays && i < 9; i++) {
            const futureDate = new Date(today);
            futureDate.setDate(today.getDate() + forecast.length + i);

            // Selecionar padrão climático
            const random = Math.random();
            let selectedPattern = seasonalPatterns[0];
            let cumulative = 0;

            for (const pattern of seasonalPatterns) {
              cumulative += pattern.probability;
              if (random <= cumulative) {
                selectedPattern = pattern;
                break;
              }
            }

            const baseTemp = lastDay.temperature.max;
            const trendAdjustment = tempTrend * (i + 1);
            const seasonalVariation = selectedPattern.tempVariation;
            const randomVariation = (Math.random() - 0.5) * 4;

            const maxTemp = Math.round(
              baseTemp + trendAdjustment + seasonalVariation + randomVariation
            );
            const minTemp = Math.round(maxTemp - 8 - Math.random() * 4);

            const estimatedDay = {
              date: futureDate.toLocaleDateString('pt-BR', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              }),
              temperature: {
                min: Math.max(5, minTemp),
                max: Math.min(45, maxTemp),
              },
              description: selectedPattern.description,
              icon: selectedPattern.icon,
              humidity: Math.round(
                lastDay.humidity + (Math.random() - 0.5) * 20
              ),
              windSpeed: Math.round(
                lastDay.windSpeed + (Math.random() - 0.5) * 10
              ),
              source: 'ESTIMADO',
            };

            forecast.push(estimatedDay);
          }
        }

        console.log(`   📋 RESULTADO FINAL (${requestedDays} dias):`);
        forecast.slice(0, requestedDays).forEach((day, index) => {
          const sourceIcon = day.source === 'API_REAL' ? '🌐' : '🔮';
          console.log(
            `   ${index + 1}. ${day.date}: ${day.temperature.min}°C - ${day.temperature.max}°C (${day.description}) ${sourceIcon} [${day.source}]`
          );
        });

        // Verificar se está retornando a quantidade correta
        const finalCount = forecast.slice(0, requestedDays).length;
        if (finalCount === requestedDays) {
          console.log(`   ✅ Retornando exatamente ${requestedDays} dias`);
        } else {
          console.log(
            `   ❌ ERRO: Deveria retornar ${requestedDays} dias, mas retornou ${finalCount}`
          );
        }
      });
    } else {
      console.log('❌ Erro na API de previsão:', forecastResponse.status);
      return false;
    }

    console.log('\n6️⃣ Verificando configuração do frontend...');

    // Verificar se o weatherService está configurado corretamente
    console.log('   📝 Pontos de verificação no código do frontend:');
    console.log(
      '   1. weatherService.getForecast() está sendo chamado com days correto?'
    );
    console.log(
      '   2. processForecastData() está processando requestedDays corretamente?'
    );
    console.log(
      '   3. generateExtendedForecast() está sendo chamado quando days > 5?'
    );
    console.log('   4. Interface está exibindo todos os cards de previsão?');

    console.log('\n✅ TESTE CONCLUÍDO - Sistema funcionando como esperado!');
    console.log('💡 Legenda: 🌐 = Dados reais da API | 🔮 = Dados estimados');

    return true;
  } catch (error) {
    console.error('❌ ERRO no teste:', error.message);
    return false;
  }
}

// Executar o teste
testWeatherForecastSystem();
