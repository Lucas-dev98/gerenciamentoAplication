/**
 * 🌐 SCRIPT DE DIAGNÓSTICO PARA EXECUTAR NO NAVEGADOR
 * Cole este código no Console do DevTools (F12) quando estiver na página
 */

// Função para diagnosticar o sistema de previsão no frontend
async function diagnosticarSistemaPrevisao() {
  console.log('🔍 DIAGNÓSTICO DO SISTEMA DE PREVISÃO - FRONTEND');
  console.log('===============================================');

  // 1. Verificar se o weatherService está disponível
  console.log('\n1️⃣ Verificando weatherService...');
  if (typeof window.weatherService !== 'undefined') {
    console.log('✅ weatherService encontrado globalmente');
  } else if (typeof weatherService !== 'undefined') {
    console.log('✅ weatherService encontrado no escopo');
  } else {
    console.log('❌ weatherService NÃO encontrado');
    console.log('💡 Verifique se o import do weatherService está correto');
    return;
  }

  // 2. Verificar conectividade com backend
  console.log('\n2️⃣ Verificando conectividade com backend...');
  try {
    const healthResponse = await fetch('/health');
    if (healthResponse.ok) {
      console.log('✅ Backend respondendo na rota /health');
    } else {
      console.log('⚠️ Backend retornou erro:', healthResponse.status);
    }
  } catch (error) {
    console.log('❌ Erro ao conectar com backend:', error.message);
    console.log('💡 Verifique se o backend está rodando na porta 3001');
  }

  // 3. Testar API de clima
  console.log('\n3️⃣ Testando API de clima...');
  try {
    const weatherResponse = await fetch(
      '/api/weather/weather?lat=-23.5505&lon=-46.6333'
    );
    if (weatherResponse.ok) {
      const weatherData = await weatherResponse.json();
      console.log('✅ API de clima funcionando:', weatherData.name);
    } else {
      console.log('❌ Erro na API de clima:', weatherResponse.status);
      console.log('💡 Verifique a API Key do OpenWeatherMap no backend');
    }
  } catch (error) {
    console.log('❌ Erro ao testar API de clima:', error.message);
  }

  // 4. Testar API de previsão
  console.log('\n4️⃣ Testando API de previsão...');
  try {
    const forecastResponse = await fetch(
      '/api/weather/forecast?lat=-23.5505&lon=-46.6333'
    );
    if (forecastResponse.ok) {
      const forecastData = await forecastResponse.json();
      console.log(
        '✅ API de previsão funcionando:',
        forecastData.list.length,
        'registros'
      );
    } else {
      console.log('❌ Erro na API de previsão:', forecastResponse.status);
    }
  } catch (error) {
    console.log('❌ Erro ao testar API de previsão:', error.message);
  }

  // 5. Testar weatherService diretamente
  console.log('\n5️⃣ Testando weatherService diretamente...');
  const testCases = [7, 10, 14];

  for (const days of testCases) {
    try {
      console.log(`\n📅 Testando previsão para ${days} dias...`);

      // Usar weatherService global ou importado
      const service = window.weatherService || weatherService;
      const forecast = await service.getForecast(-23.5505, -46.6333, days);

      if (forecast && Array.isArray(forecast)) {
        console.log(`✅ ${days} dias: Recebidos ${forecast.length} dias`);

        // Mostrar alguns detalhes
        forecast.slice(0, 3).forEach((day, index) => {
          console.log(
            `   ${index + 1}. ${day.date}: ${day.temperature.min}°C - ${day.temperature.max}°C (${day.description})`
          );
        });

        if (forecast.length > 3) {
          console.log(`   ... e mais ${forecast.length - 3} dias`);
        }

        // Verificar se está retornando a quantidade correta
        if (forecast.length === days) {
          console.log(`   ✅ Quantidade correta: ${days} dias`);
        } else {
          console.log(
            `   ❌ PROBLEMA: Esperava ${days} dias, recebeu ${forecast.length}`
          );
        }
      } else {
        console.log(`❌ ${days} dias: Dados inválidos recebidos`);
      }
    } catch (error) {
      console.log(`❌ ${days} dias: Erro ao obter previsão:`, error.message);
    }
  }

  // 6. Verificar estado atual da página
  console.log('\n6️⃣ Verificando estado atual da página...');

  // Procurar elementos relacionados ao clima
  const weatherSection =
    document.querySelector('[class*="weather"]') ||
    document.querySelector('[class*="Weather"]') ||
    document.querySelector('*[class*="forecast"]') ||
    document.querySelector('*[class*="Forecast"]');

  if (weatherSection) {
    console.log('✅ Seção de clima encontrada na página');

    // Procurar botões de dias
    const dayButtons = document.querySelectorAll('button');
    const weatherButtons = Array.from(dayButtons).filter(
      (btn) =>
        btn.textContent &&
        (btn.textContent.includes('dia') ||
          btn.textContent.includes('7') ||
          btn.textContent.includes('10') ||
          btn.textContent.includes('14'))
    );

    if (weatherButtons.length > 0) {
      console.log(
        `✅ Encontrados ${weatherButtons.length} botões de seleção de dias`
      );
      weatherButtons.forEach((btn) => {
        console.log(`   - "${btn.textContent.trim()}" (${btn.className})`);
      });
    } else {
      console.log('❌ Botões de seleção de dias não encontrados');
    }

    // Procurar cards de previsão
    const forecastCards =
      weatherSection.querySelectorAll('[class*="card"]') ||
      weatherSection.querySelectorAll('[class*="Card"]') ||
      weatherSection.querySelectorAll('div');

    console.log(
      `   📊 Elementos filhos na seção: ${weatherSection.children.length}`
    );
  } else {
    console.log('❌ Seção de clima NÃO encontrada na página');
    console.log('💡 Verifique se o componente de clima está sendo renderizado');
  }

  // 7. Verificar erros no console
  console.log('\n7️⃣ Verificando possíveis problemas...');
  console.log('📋 CHECKLIST DE VERIFICAÇÃO:');
  console.log('   □ Backend rodando (porta 3001)');
  console.log('   □ API Key configurada no backend');
  console.log('   □ Sem erros de CORS no console');
  console.log('   □ weatherService importado corretamente');
  console.log('   □ Componente de clima renderizando');
  console.log('   □ Botões de dias com onClick funcionando');
  console.log('   □ useEffect reagindo a mudanças em forecastDays');
  console.log('   □ loadWeatherData sendo chamada');

  console.log('\n💡 PRÓXIMOS PASSOS:');
  console.log('1. Verifique os logs acima para identificar falhas');
  console.log('2. Se APIs estão falhando, inicie o backend: npm start');
  console.log('3. Se dados não aparecem, verifique o console para erros React');
  console.log('4. Teste os botões 7/10/14 dias manualmente');
  console.log('5. Verifique a aba Network para requisições bloqueadas');

  return true;
}

// Executar diagnóstico automaticamente
diagnosticarSistemaPrevisao();
