/**
 * 🔬 TESTE ESPECÍFICO - VERIFICAR PROBLEMAS NO FRONTEND
 * Simular o comportamento completo do weatherService
 */

console.log('🔬 TESTE ESPECÍFICO - PROBLEMAS NO FRONTEND');
console.log('==========================================');

// Simular o weatherService completo
class WeatherServiceSimulator {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
  }

  async getForecast(lat = -23.5505, lon = -46.6333, days = 7) {
    console.log(
      `\n🌍 getForecast chamado com: lat=${lat}, lon=${lon}, days=${days}`
    );

    // Simular dados da API como se viessem do backend
    const mockApiData = {
      list: [
        // Dados simulados para 5 dias (15 registros = 3 por dia)
        {
          dt: Math.floor(Date.now() / 1000),
          main: { temp: 25, humidity: 65 },
          weather: [{ description: 'ensolarado', icon: '01d' }],
          wind: { speed: 3.5 },
        },
        {
          dt: Math.floor(Date.now() / 1000) + 10800,
          main: { temp: 28, humidity: 60 },
          weather: [{ description: 'ensolarado', icon: '01d' }],
          wind: { speed: 4.0 },
        },
        {
          dt: Math.floor(Date.now() / 1000) + 21600,
          main: { temp: 22, humidity: 70 },
          weather: [{ description: 'ensolarado', icon: '01d' }],
          wind: { speed: 3.0 },
        },

        {
          dt: Math.floor(Date.now() / 1000) + 86400,
          main: { temp: 24, humidity: 68 },
          weather: [{ description: 'parcialmente nublado', icon: '02d' }],
          wind: { speed: 4.5 },
        },
        {
          dt: Math.floor(Date.now() / 1000) + 97200,
          main: { temp: 27, humidity: 62 },
          weather: [{ description: 'parcialmente nublado', icon: '02d' }],
          wind: { speed: 5.0 },
        },
        {
          dt: Math.floor(Date.now() / 1000) + 108000,
          main: { temp: 21, humidity: 72 },
          weather: [{ description: 'parcialmente nublado', icon: '02d' }],
          wind: { speed: 4.0 },
        },

        {
          dt: Math.floor(Date.now() / 1000) + 172800,
          main: { temp: 23, humidity: 70 },
          weather: [{ description: 'nublado', icon: '03d' }],
          wind: { speed: 6.0 },
        },
        {
          dt: Math.floor(Date.now() / 1000) + 183600,
          main: { temp: 26, humidity: 65 },
          weather: [{ description: 'nublado', icon: '03d' }],
          wind: { speed: 6.5 },
        },
        {
          dt: Math.floor(Date.now() / 1000) + 194400,
          main: { temp: 20, humidity: 75 },
          weather: [{ description: 'nublado', icon: '03d' }],
          wind: { speed: 5.5 },
        },

        {
          dt: Math.floor(Date.now() / 1000) + 259200,
          main: { temp: 22, humidity: 78 },
          weather: [{ description: 'chuva leve', icon: '10d' }],
          wind: { speed: 7.0 },
        },
        {
          dt: Math.floor(Date.now() / 1000) + 270000,
          main: { temp: 24, humidity: 72 },
          weather: [{ description: 'chuva leve', icon: '10d' }],
          wind: { speed: 7.5 },
        },
        {
          dt: Math.floor(Date.now() / 1000) + 280800,
          main: { temp: 19, humidity: 82 },
          weather: [{ description: 'chuva leve', icon: '10d' }],
          wind: { speed: 6.8 },
        },

        {
          dt: Math.floor(Date.now() / 1000) + 345600,
          main: { temp: 21, humidity: 80 },
          weather: [{ description: 'chuva', icon: '09d' }],
          wind: { speed: 8.0 },
        },
        {
          dt: Math.floor(Date.now() / 1000) + 356400,
          main: { temp: 23, humidity: 75 },
          weather: [{ description: 'chuva', icon: '09d' }],
          wind: { speed: 8.5 },
        },
        {
          dt: Math.floor(Date.now() / 1000) + 367200,
          main: { temp: 18, humidity: 85 },
          weather: [{ description: 'chuva', icon: '09d' }],
          wind: { speed: 7.8 },
        },
      ],
    };

    console.log('✅ Resposta da API recebida com sucesso para previsão');

    // Processar dados EXATAMENTE como no código real
    const dailyForecast = this.processForecastData(mockApiData.list, days);

    console.log(`📊 Resultado final: ${dailyForecast.length} dias processados`);
    return dailyForecast;
  }

  processForecastData(forecastList, requestedDays = 7) {
    console.log(`   🔄 processForecastData: requestedDays=${requestedDays}`);

    const dailyData = {};

    // Agrupar por dia
    forecastList.forEach((item) => {
      const date = new Date(item.dt * 1000);
      const dateKey = date.toDateString();

      if (!dailyData[dateKey]) {
        dailyData[dateKey] = [];
      }
      dailyData[dateKey].push(item);
    });

    // Processar cada dia (máximo de 5 dias da API)
    const apiDays = Object.keys(dailyData).slice(0, 5); // API limita a 5 dias reais

    const result = apiDays.map((dateKey, index) => {
      const dayData = dailyData[dateKey];
      const date = new Date(dateKey);

      // Calcular temperaturas min/max do dia
      const temps = dayData.map((item) => item.main.temp);
      const minTemp = Math.round(Math.min(...temps));
      const maxTemp = Math.round(Math.max(...temps));

      // Pegar dados do meio-dia (mais representativo)
      const midDayData =
        dayData.find((item) => {
          const hour = new Date(item.dt * 1000).getHours();
          return hour >= 11 && hour <= 14;
        }) || dayData[0];

      // Formatar data
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
      };
    });

    console.log(`   ✅ Processados ${result.length} dias da API real`);

    // Se requestedDays for maior que 5, adicionar previsões simuladas realistas
    if (requestedDays > result.length && requestedDays <= 14) {
      const additionalDays = this.generateExtendedForecast(
        result,
        requestedDays - result.length
      );
      result.push(...additionalDays);
      console.log(
        `   📅 Adicionados ${additionalDays.length} dias simulados para completar ${requestedDays} dias`
      );
    }

    const finalResult = result.slice(0, requestedDays); // Garantir que retorna exatamente o solicitado
    console.log(`   🎯 Resultado final: ${finalResult.length} dias`);

    return finalResult;
  }

  generateExtendedForecast(baseForecast, additionalDays) {
    console.log(
      `   🔮 generateExtendedForecast: ${additionalDays} dias adicionais`
    );

    const extendedDays = [];
    const lastDay = baseForecast[baseForecast.length - 1];
    const today = new Date();

    // Padrões de clima sazonais mais realistas para Brasil
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

    // Determinar tendência baseada nos últimos dias da API
    const tempTrend =
      baseForecast.length > 1
        ? (baseForecast[baseForecast.length - 1].temperature.max -
            baseForecast[0].temperature.max) /
          baseForecast.length
        : 0;

    for (let i = 0; i < additionalDays && i < 9; i++) {
      // Máximo 9 dias adicionais para 14 dias total
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + baseForecast.length + i);

      // Selecionar padrão climático baseado em probabilidades
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

      // Calcular temperatura baseada no último dia real + tendência + variação sazonal
      const baseTemp = lastDay.temperature.max;
      const trendAdjustment = tempTrend * (i + 1); // Aplicar tendência gradualmente
      const seasonalVariation = selectedPattern.tempVariation;
      const randomVariation = (Math.random() - 0.5) * 4; // ±2°C de variação aleatória

      const maxTemp = Math.round(
        baseTemp + trendAdjustment + seasonalVariation + randomVariation
      );
      const minTemp = Math.round(maxTemp - 8 - Math.random() * 4); // Diferença típica de 8-12°C

      extendedDays.push({
        date: futureDate.toLocaleDateString('pt-BR', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        }),
        temperature: {
          min: Math.max(5, minTemp), // Mínimo absoluto de 5°C
          max: Math.min(45, maxTemp), // Máximo absoluto de 45°C
        },
        description: selectedPattern.description,
        icon: selectedPattern.icon,
        humidity: Math.round(
          lastDay.humidity + (Math.random() - 0.5) * 20 // Variação de ±10%
        ),
        windSpeed: Math.round(
          lastDay.windSpeed + (Math.random() - 0.5) * 10 // Variação de ±5 km/h
        ),
      });
    }

    console.log(
      `   🔮 Geradas ${extendedDays.length} previsões simuladas com base em dados reais`
    );
    return extendedDays;
  }
}

// Simular o comportamento completo
async function testCompleteFlow() {
  console.log('\n🧪 SIMULANDO FLUXO COMPLETO DO FRONTEND:');
  console.log('======================================');

  const weatherService = new WeatherServiceSimulator();

  // Simular chamadas como no DashboardPageNew.tsx
  const testScenarios = [
    { days: 7, description: 'Usuário clica em "7 dias"' },
    { days: 10, description: 'Usuário clica em "10 dias"' },
    { days: 14, description: 'Usuário clica em "14 dias"' },
  ];

  for (const scenario of testScenarios) {
    console.log(`\n📅 CENÁRIO: ${scenario.description}`);
    console.log('─'.repeat(50));

    // Simular setForecastDays(newDays) -> useEffect -> loadWeatherData -> weatherService.getForecast
    console.log(`1. setForecastDays(${scenario.days})`);
    console.log(`2. useEffect detecta mudança em forecastDays`);
    console.log(`3. loadWeatherData() é chamada`);
    console.log(
      `4. weatherService.getForecast(lat, lon, ${scenario.days}) é executada`
    );

    const forecast = await weatherService.getForecast(
      -23.5505,
      -46.6333,
      scenario.days
    );

    console.log(`5. setForecast() recebe ${forecast.length} dias`);
    console.log(`6. Interface renderiza ${forecast.length} cards`);

    console.log(`\n   📋 PREVISÃO RETORNADA (${forecast.length} dias):`);
    forecast.forEach((day, index) => {
      const source = index < 5 ? '🌐 API' : '🔮 EST';
      console.log(
        `   ${index + 1}. ${day.date}: ${day.temperature.min}°C - ${day.temperature.max}°C (${day.description}) [${source}]`
      );
    });

    // Verificações
    if (forecast.length === scenario.days) {
      console.log(`   ✅ SUCESSO: Retornou exatamente ${scenario.days} dias`);
    } else {
      console.log(
        `   ❌ ERRO: Esperava ${scenario.days} dias, recebeu ${forecast.length}`
      );
    }
  }

  console.log('\n🔍 POSSÍVEIS PROBLEMAS NO FRONTEND:');
  console.log('=================================');
  console.log('1. 🔌 Backend não está rodando (porta 3001)');
  console.log('2. 🌐 API Key do OpenWeatherMap não configurada');
  console.log('3. 📡 Problemas de conectividade/CORS');
  console.log('4. 🧩 Componente não está re-renderizando após mudança');
  console.log('5. 📦 Cache está retornando dados antigos');
  console.log('6. 🎯 handleDaysChange não está sendo chamado corretamente');

  console.log('\n💡 VERIFICAÇÕES RECOMENDADAS:');
  console.log('============================');
  console.log('1. Abrir DevTools (F12) e verificar Console');
  console.log('2. Verificar aba Network para requisições falhas');
  console.log(
    '3. Confirmar se backend está rodando: http://localhost:3001/health'
  );
  console.log(
    '4. Testar API diretamente: http://localhost:3001/api/weather/forecast?lat=-23.5505&lon=-46.6333'
  );
  console.log(
    '5. Verificar se os botões 7/10/14 dias estão com onClick funcionando'
  );
}

// Executar teste
testCompleteFlow();
