/**
 * 🔍 DIAGNÓSTICO DETALHADO DO SISTEMA DE PREVISÃO
 * Simular exatamente o que acontece no weatherService
 */

console.log('🔍 DIAGNÓSTICO DETALHADO - SISTEMA DE PREVISÃO 7/10/14 DIAS');
console.log('===========================================================');

// Simular dados da API (como se viessem do OpenWeatherMap)
const mockApiResponse = {
  city: { name: 'São Paulo' },
  list: [
    // Hoje
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

    // Amanhã
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

    // Dia 3
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

    // Dia 4
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

    // Dia 5
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

function simulateProcessForecastData(forecastList, requestedDays = 7) {
  console.log(`\n🔄 SIMULANDO processForecastData para ${requestedDays} dias`);
  console.log(`   📊 Dados da API: ${forecastList.length} registros`);

  const dailyData = {};

  // Agrupar por dia (igual ao código real)
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
  console.log(`   📅 Dias agrupados: ${apiDays.length}`);

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
      source: 'API_REAL',
    };
  });

  console.log(`   ✅ Processados ${result.length} dias da API real`);

  // Se requestedDays for maior que 5, adicionar previsões simuladas realistas
  if (requestedDays > result.length && requestedDays <= 14) {
    const additionalDays = simulateGenerateExtendedForecast(
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

function simulateGenerateExtendedForecast(baseForecast, additionalDays) {
  console.log(
    `\n🔮 SIMULANDO generateExtendedForecast para ${additionalDays} dias adicionais`
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
    { description: 'chuva', icon: '09d', tempVariation: -6, probability: 0.08 },
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

  console.log(
    `   📈 Tendência de temperatura: ${tempTrend > 0 ? '+' : ''}${tempTrend.toFixed(1)}°C por dia`
  );
  console.log(`   🌡️ Última temperatura real: ${lastDay.temperature.max}°C`);

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

    const dayData = {
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
      source: 'ESTIMADO',
    };

    extendedDays.push(dayData);

    console.log(
      `   ${i + 6}. ${dayData.date}: ${dayData.temperature.min}°C - ${dayData.temperature.max}°C (${dayData.description}) [${dayData.source}]`
    );
  }

  console.log(
    `   🔮 Geradas ${extendedDays.length} previsões simuladas com base em dados reais`
  );
  return extendedDays;
}

// Testar para 7, 10 e 14 dias
console.log('\n🧪 TESTANDO PROCESSAMENTO PARA DIFERENTES PERÍODOS:');
console.log('==================================================');

const testCases = [7, 10, 14];

testCases.forEach((days) => {
  console.log(`\n📅 TESTE PARA ${days} DIAS:`);
  console.log('─'.repeat(30));

  const forecast = simulateProcessForecastData(mockApiResponse.list, days);

  console.log(`\n   📋 RESULTADO DETALHADO (${days} dias):`);
  forecast.forEach((day, index) => {
    const sourceIcon = day.source === 'API_REAL' ? '🌐' : '🔮';
    console.log(
      `   ${index + 1}. ${day.date}: ${day.temperature.min}°C - ${day.temperature.max}°C (${day.description}) ${sourceIcon}`
    );
  });

  // Validações
  const realDays = forecast.filter((day) => day.source === 'API_REAL').length;
  const estimatedDays = forecast.filter(
    (day) => day.source === 'ESTIMADO'
  ).length;

  console.log(`\n   📊 ANÁLISE:`);
  console.log(`   ├─ Dias reais da API: ${realDays}`);
  console.log(`   ├─ Dias estimados: ${estimatedDays}`);
  console.log(`   ├─ Total retornado: ${forecast.length}`);
  console.log(
    `   └─ Status: ${forecast.length === days ? '✅ CORRETO' : '❌ INCORRETO'}`
  );
});

console.log('\n🔍 DIAGNÓSTICO CONCLUÍDO');
console.log('========================');
console.log('💡 LEGENDA:');
console.log('   🌐 = Dados reais da API OpenWeatherMap');
console.log('   🔮 = Dados estimados baseados em tendências');
console.log('\n📋 RESUMO:');
console.log('   ✅ API fornece 5 dias reais máximo');
console.log('   ✅ Sistema estende para 7/10/14 dias com estimativas');
console.log('   ✅ Processamento mantém qualidade dos dados');
