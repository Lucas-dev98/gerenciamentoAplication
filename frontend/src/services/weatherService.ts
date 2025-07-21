interface WeatherData {
  temperature: number;
  description: string;
  location: string;
  icon: string;
  humidity: number;
  windSpeed: number;
}

interface WeatherForecast {
  date: string;
  temperature: {
    min: number;
    max: number;
  };
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
}

class WeatherService {
  private apiKey: string;
  private baseUrl: string = 'https://api.openweathermap.org/data/2.5';
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutos
  private pendingRequests: Map<string, Promise<any>> = new Map();
  private offlineMode: boolean = false; // Modo offline para fallback rápido
  private maxRetries: number = 2;

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY || '';

    // Sempre usar proxy local /api/weather (tanto dev quanto prod)
    this.baseUrl = '/api/weather';
    console.log(
      'WeatherService: usando proxy /api/weather para todas as requisições'
    );

    // SEMPRE usar modo online para dados reais
    this.offlineMode = false;
    this.maxRetries = 5; // Aumentar tentativas
    console.log('WeatherService inicializado - SOMENTE dados reais da API');

    // Backend proxy está sempre disponível
    console.log('Backend proxy configurado - modo online FORÇADO');
    console.log('Base URL:', this.baseUrl);
  }

  // Função para ativar modo online (chamada quando usuário solicita geolocalização)
  public enableOnlineMode(): void {
    this.offlineMode = false;
    console.log('Modo online ativado pelo usuário');
    console.log('Testando conectividade com backend...');
    this.testApiConnection();
  }

  // Teste de conectividade com a API
  private async testApiConnection(): Promise<void> {
    try {
      // Remover apiKey pois o backend agora lida com isso
      const testUrl = `${this.baseUrl}/weather?lat=-23.5505&lon=-46.6333`;
      console.log('URL de teste:', testUrl);

      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        // Remover CORS mode para evitar problemas
      });

      if (response.ok) {
        console.log('✅ Conectividade com API confirmada');
        const data = await response.json();
        console.log('Resposta de teste:', {
          status: response.status,
          location: data.name,
        });
      } else {
        console.error(
          '❌ API retornou erro:',
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error('❌ Erro ao testar conectividade:', error);
    }
  }

  // Função para verificar se está em modo offline
  public isOffline(): boolean {
    return this.offlineMode;
  }

  // Função pública para testar a API
  public async testAPI(): Promise<boolean> {
    try {
      console.log('🧪 Testando API através do backend...');

      // Usar rota de teste do backend ao invés de fazer requisição direta
      const endpoint = '/test';
      const data = await this.makeApiRequest(endpoint);

      console.log('✅ Teste de API bem-sucedido:', data.message);
      return true;
    } catch (error) {
      console.error('❌ Erro no teste de API:', error);
      return false;
    }
  }

  private getCacheKey(lat: number, lon: number, type: string): string {
    return `${type}_${lat.toFixed(4)}_${lon.toFixed(4)}`;
  }

  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log(`Usando dados em cache para: ${key}`);
      return cached.data;
    }
    if (cached) {
      this.cache.delete(key); // Remove cache expirado
    }
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  // Função helper para fazer requests através do proxy /api/weather
  private async makeApiRequest(endpoint: string): Promise<any> {
    // Sempre usar o proxy /api/weather configurado no Vite
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  }

  async getCurrentWeather(
    lat: number = -23.5505,
    lon: number = -46.6333
  ): Promise<WeatherData | null> {
    const cacheKey = this.getCacheKey(lat, lon, 'current');

    // Verificar cache primeiro
    const cachedData = this.getCachedData<WeatherData>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    console.log(`🌍 BUSCANDO DADOS REAIS para lat: ${lat}, lon: ${lon}`);

    // Verificar se já existe uma requisição pendente
    if (this.pendingRequests.has(cacheKey)) {
      console.log(`Aguardando requisição pendente para: ${cacheKey}`);
      return this.pendingRequests.get(cacheKey);
    }

    const requestPromise = this.fetchCurrentWeather(lat, lon, cacheKey);
    this.pendingRequests.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  private async fetchCurrentWeather(
    lat: number,
    lon: number,
    cacheKey: string
  ): Promise<WeatherData | null> {
    let retries = 0;

    while (retries < this.maxRetries) {
      try {
        // Backend agora lida com a API Key, não precisamos verificar no frontend

        // Usar nova função helper para fazer requisição com proxy apropriado
        // Remover apiKey pois o backend agora lida com isso
        const endpoint = `/weather?lat=${lat}&lon=${lon}`;
        console.log(
          `Tentativa ${retries + 1}: Fazendo requisição para clima atual`
        );

        // Usar Promise.race com timeout para aguardar o retorno
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('REQUEST_TIMEOUT')), 20000);
        });

        const data = await Promise.race([
          this.makeApiRequest(endpoint),
          timeoutPromise,
        ]);

        console.log('✅ Resposta da API recebida com sucesso para clima atual');

        const weatherData = {
          temperature: Math.round(data.main.temp),
          description: data.weather[0].description,
          location: data.name,
          icon: data.weather[0].icon,
          humidity: data.main.humidity,
          windSpeed: Math.round(data.wind.speed * 3.6), // Converter m/s para km/h
        };

        this.setCachedData(cacheKey, weatherData);

        // Se a requisição foi bem-sucedida, desativar modo offline
        if (this.offlineMode) {
          this.offlineMode = false;
          console.log('Conexão restaurada: modo offline desativado');
        }

        return weatherData;
      } catch (error) {
        retries++;

        if (error instanceof Error) {
          if (error.message === 'REQUEST_TIMEOUT') {
            console.warn(
              `⏱️ Timeout ao buscar clima atual (tentativa ${retries}/${this.maxRetries}) - aguardando resposta...`
            );
          } else if (error.message.includes('Failed to fetch')) {
            console.error(
              `🌐 Erro de rede ao buscar clima atual (tentativa ${retries}/${this.maxRetries}):`,
              'Possível problema de CORS ou conectividade'
            );
          } else {
            console.error(
              `❌ Erro ao buscar clima atual (tentativa ${retries}/${this.maxRetries}):`,
              error.message
            );
          }
        } else {
          console.error(
            `❓ Erro desconhecido ao buscar clima atual (tentativa ${retries}/${this.maxRetries}):`,
            error
          );
        }

        // Se esgotou as tentativas, tentar mais uma vez com timeout maior
        if (retries >= this.maxRetries) {
          console.error(
            '❌ ERRO CRÍTICO: Não foi possível obter dados reais da API'
          );
          console.error('Verifique sua conexão de internet e tente novamente');
          throw new Error(
            `Falha ao conectar com API após ${this.maxRetries} tentativas`
          );
        }

        // Aguardar progressivamente mais tempo antes da próxima tentativa
        await new Promise((resolve) => setTimeout(resolve, 3000 * retries));
      }
    }

    // Se chegou aqui, algo deu muito errado
    throw new Error('Falha crítica na API de clima');
  }

  async getForecast(
    lat: number = -23.5505,
    lon: number = -46.6333,
    days: number = 7
  ): Promise<WeatherForecast[]> {
    const cacheKey = this.getCacheKey(lat, lon, `forecast_${days}`);

    // Verificar cache primeiro
    const cachedData = this.getCachedData<WeatherForecast[]>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    console.log(
      `🌍 BUSCANDO PREVISÃO REAL para lat: ${lat}, lon: ${lon}, dias: ${days}`
    );

    // Verificar se já existe uma requisição pendente
    if (this.pendingRequests.has(cacheKey)) {
      console.log(`Aguardando requisição pendente para: ${cacheKey}`);
      return this.pendingRequests.get(cacheKey);
    }

    const requestPromise = this.fetchForecast(lat, lon, days, cacheKey);
    this.pendingRequests.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  private async fetchForecast(
    lat: number,
    lon: number,
    days: number,
    cacheKey: string
  ): Promise<WeatherForecast[]> {
    let retries = 0;

    while (retries < this.maxRetries) {
      try {
        // Backend agora lida com a API Key, não precisamos verificar no frontend

        // Usar nova função helper para fazer requisição com proxy apropriado
        // Remover apiKey pois o backend agora lida com isso
        const endpoint = `/forecast?lat=${lat}&lon=${lon}`;
        console.log(
          `Tentativa ${retries + 1}: Fazendo requisição para previsão`
        );

        // Usar Promise.race com timeout para aguardar o retorno
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('REQUEST_TIMEOUT')), 25000);
        });

        const data = await Promise.race([
          this.makeApiRequest(endpoint),
          timeoutPromise,
        ]);

        console.log('✅ Resposta da API recebida com sucesso para previsão');

        // Processar dados para obter previsão diária (máximo baseado na API)
        const dailyForecast = this.processForecastData(data.list, days);

        this.setCachedData(cacheKey, dailyForecast);

        // Se a requisição foi bem-sucedida, desativar modo offline
        if (this.offlineMode) {
          this.offlineMode = false;
          console.log('Conexão restaurada: modo offline desativado');
        }

        return dailyForecast;
      } catch (error) {
        retries++;

        if (error instanceof Error) {
          if (error.message === 'REQUEST_TIMEOUT') {
            console.warn(
              `⏱️ Timeout ao buscar previsão do tempo (tentativa ${retries}/${this.maxRetries}) - aguardando resposta...`
            );
          } else if (error.message.includes('Failed to fetch')) {
            console.error(
              `🌐 Erro de rede ao buscar previsão do tempo (tentativa ${retries}/${this.maxRetries}):`,
              'Possível problema de CORS ou conectividade'
            );
          } else {
            console.error(
              `❌ Erro ao buscar previsão do tempo (tentativa ${retries}/${this.maxRetries}):`,
              error.message
            );
          }
        } else {
          console.error(
            `❓ Erro desconhecido ao buscar previsão do tempo (tentativa ${retries}/${this.maxRetries}):`,
            error
          );
        }

        // Se esgotou as tentativas, tentar mais uma vez com timeout maior
        if (retries >= this.maxRetries) {
          console.error(
            '❌ ERRO CRÍTICO: Não foi possível obter previsão real da API'
          );
          console.error('Verifique sua conexão de internet e tente novamente');
          throw new Error(
            `Falha ao conectar com API de previsão após ${this.maxRetries} tentativas`
          );
        }

        // Aguardar progressivamente mais tempo antes da próxima tentativa
        await new Promise((resolve) => setTimeout(resolve, 3000 * retries));
      }
    }

    // Se chegou aqui, algo deu muito errado
    throw new Error('Falha crítica na API de previsão do tempo');
  }

  private processForecastData(
    forecastList: any[],
    requestedDays: number = 7
  ): WeatherForecast[] {
    const dailyData: { [key: string]: any[] } = {};

    // Agrupar por dia
    forecastList.forEach((item: any) => {
      const date = new Date(item.dt * 1000);
      const dateKey = date.toDateString();

      if (!dailyData[dateKey]) {
        dailyData[dateKey] = [];
      }
      dailyData[dateKey].push(item);
    });

    // Processar cada dia (máximo baseado no requestedDays)
    const days = Object.keys(dailyData).slice(0, Math.min(requestedDays, 5)); // API limita a 5 dias

    const result = days.map((dateKey, index) => {
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
      let formattedDate: string;
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

    // Se requestedDays for maior que o que a API fornece (5), adicionar dias fictícios
    if (requestedDays > result.length && requestedDays <= 10) {
      const additionalDays = this.generateExtendedForecast(
        result,
        requestedDays - result.length
      );
      result.push(...additionalDays);
    }

    return result;
  }

  private getMockCurrentWeather(lat?: number, lon?: number): WeatherData {
    // Determinar cidade baseada nas coordenadas (simulação)
    let location = 'São Paulo';

    if (lat !== undefined && lon !== undefined) {
      // Algumas coordenadas conhecidas do Brasil para demonstração
      if (lat >= -23.6 && lat <= -23.4 && lon >= -46.8 && lon <= -46.4) {
        location = 'São Paulo';
      } else if (
        lat >= -22.95 &&
        lat <= -22.85 &&
        lon >= -43.25 &&
        lon <= -43.15
      ) {
        location = 'Rio de Janeiro';
      } else if (lat >= -30.1 && lat <= -29.9 && lon >= -51.3 && lon <= -51.1) {
        location = 'Porto Alegre';
      } else if (lat >= -15.9 && lat <= -15.6 && lon >= -48.0 && lon <= -47.6) {
        location = 'Brasília';
      } else if (lat >= -12.3 && lat <= -12.9 && lon >= -38.6 && lon <= -38.3) {
        location = 'Salvador';
      } else if (lat >= -8.15 && lat <= -7.95 && lon >= -35.0 && lon <= -34.8) {
        location = 'Recife';
      } else if (lat >= -3.85 && lat <= -3.65 && lon >= -38.7 && lon <= -38.4) {
        location = 'Fortaleza';
      } else if (lat >= -2.65 && lat <= -2.45 && lon >= -44.4 && lon <= -44.1) {
        location = 'São Luís';
      } else if (lat >= -1.5 && lat <= -1.3 && lon >= -48.6 && lon <= -48.3) {
        location = 'Belém';
      } else if (lat >= -3.2 && lat <= -2.8 && lon >= -60.2 && lon <= -59.8) {
        location = 'Manaus';
      } else {
        // Determinar região geral
        if (lat > -15) {
          location = 'Norte/Nordeste do Brasil';
        } else if (lat > -25) {
          location = 'Centro-Oeste/Sudeste do Brasil';
        } else {
          location = 'Sul do Brasil';
        }
      }
    }

    return {
      temperature: 20 + Math.floor(Math.random() * 15), // 20-35°C
      description: 'parcialmente nublado',
      location,
      icon: '02d',
      humidity: 55 + Math.floor(Math.random() * 25), // 55-80%
      windSpeed: 8 + Math.floor(Math.random() * 12), // 8-20 km/h
    };
  }

  private generateExtendedForecast(
    baseForecast: WeatherForecast[],
    additionalDays: number
  ): WeatherForecast[] {
    const extendedDays: WeatherForecast[] = [];
    const lastDay = baseForecast[baseForecast.length - 1];

    // Padrões de clima para gerar previsões realistas
    const weatherPatterns = [
      { description: 'ensolarado', icon: '01d', tempVariation: 0 },
      { description: 'parcialmente nublado', icon: '02d', tempVariation: -2 },
      { description: 'nublado', icon: '03d', tempVariation: -3 },
      { description: 'chuva leve', icon: '10d', tempVariation: -5 },
      { description: 'chuva', icon: '09d', tempVariation: -7 },
    ];

    for (let i = 0; i < additionalDays && i < 5; i++) {
      // Máximo 5 dias adicionais
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + baseForecast.length + i);

      const pattern =
        weatherPatterns[Math.floor(Math.random() * weatherPatterns.length)];
      const baseTemp = lastDay.temperature.max;

      extendedDays.push({
        date: futureDate.toLocaleDateString('pt-BR', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        }),
        temperature: {
          min: Math.round(baseTemp + pattern.tempVariation - 5),
          max: Math.round(
            baseTemp + pattern.tempVariation + Math.random() * 4 - 2
          ),
        },
        description: pattern.description,
        icon: pattern.icon,
        humidity: Math.round(60 + Math.random() * 30),
        windSpeed: Math.round(8 + Math.random() * 20),
      });
    }

    return extendedDays;
  }

  private getMockForecast(days: number = 7): WeatherForecast[] {
    const today = new Date();
    const mockData: WeatherForecast[] = [];

    const weatherPatterns = [
      { description: 'ensolarado', icon: '01d', baseTemp: 25 },
      { description: 'parcialmente nublado', icon: '02d', baseTemp: 23 },
      { description: 'nublado', icon: '03d', baseTemp: 21 },
      { description: 'chuva leve', icon: '10d', baseTemp: 19 },
      { description: 'chuva', icon: '09d', baseTemp: 17 },
      { description: 'trovoada', icon: '11d', baseTemp: 20 },
    ];

    for (let i = 0; i < Math.min(days, 10); i++) {
      const futureDate = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
      const pattern =
        weatherPatterns[Math.floor(Math.random() * weatherPatterns.length)];

      let formattedDate: string;
      if (i === 0) {
        formattedDate = 'Hoje';
      } else if (i === 1) {
        formattedDate = 'Amanhã';
      } else {
        formattedDate = futureDate.toLocaleDateString('pt-BR', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        });
      }

      mockData.push({
        date: formattedDate,
        temperature: {
          min: Math.round(pattern.baseTemp - 5 + Math.random() * 3),
          max: Math.round(pattern.baseTemp + Math.random() * 8),
        },
        description: pattern.description,
        icon: pattern.icon,
        humidity: Math.round(50 + Math.random() * 40),
        windSpeed: Math.round(8 + Math.random() * 15),
      });
    }

    return mockData;
  }
}

export const weatherService = new WeatherService();
export type { WeatherData, WeatherForecast };
