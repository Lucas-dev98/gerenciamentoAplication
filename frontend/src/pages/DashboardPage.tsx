import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';
import { weatherService } from '../services/weatherService';
import type { WeatherData, WeatherForecast } from '../services/weatherService';
import { responsiveContainer, device } from '../styles/responsive';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardStatsGrid from '../components/dashboard/DashboardStatsGrid';
import DashboardWeatherSection from '../components/dashboard/DashboardWeatherSection';

interface DashboardStats {
  totalMembers: number;
  totalTeams: number;
  birthdaysToday: number;
  totalProjects: number;
  activeProjects: number;
  pendingProjects: number;
  completedProjects: number;
  activeMembers: number;
  inactiveMembers: number;
  sickLeaveMembers: number;
  vacationMembers: number;
}

const Container = styled.div`
  ${responsiveContainer}
  background-color: #f8f9fa;
  min-height: 100vh;
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;

  @media ${device.mobile} {
    padding-top: 1rem;
    padding-bottom: 1rem;
  }
`;

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  // Estados do clima
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<WeatherForecast[]>([]);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [forecastDays, setForecastDays] = useState(7);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lon: number;
    city?: string;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [hasRequestedLocation, setHasRequestedLocation] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Estados das estatísticas
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 156,
    totalTeams: 8,
    birthdaysToday: 3,
    totalProjects: 45,
    activeProjects: 23,
    pendingProjects: 12,
    completedProjects: 10,
    activeMembers: 142,
    inactiveMembers: 8,
    sickLeaveMembers: 3,
    vacationMembers: 3,
  });

  // Função para gerar previsão simulada
  const generateMockForecast = (days: number): WeatherForecast[] => {
    const forecast: WeatherForecast[] = [];
    const today = new Date();
    const weatherConditions = [
      { desc: 'Ensolarado', icon: '01d' },
      { desc: 'Parcialmente nublado', icon: '02d' },
      { desc: 'Nublado', icon: '03d' },
      { desc: 'Chuva leve', icon: '10d' },
      { desc: 'Tempestade', icon: '11d' },
    ];

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const condition =
        weatherConditions[Math.floor(Math.random() * weatherConditions.length)];

      forecast.push({
        date: date.toLocaleDateString('pt-BR', {
          weekday: 'short',
          day: '2-digit',
          month: '2-digit',
        }),
        temperature: {
          max: 20 + Math.floor(Math.random() * 15),
          min: 15 + Math.floor(Math.random() * 10),
        },
        description: condition.desc,
        icon: condition.icon,
        humidity: 60 + Math.floor(Math.random() * 30),
        windSpeed: 8 + Math.floor(Math.random() * 15),
      });
    }

    return forecast;
  };

  // Função para obter ícone do clima
  const getWeatherIcon = (iconCode: string): string => {
    const iconMap: { [key: string]: string } = {
      '01d': '☀️',
      '01n': '🌙',
      '02d': '⛅',
      '02n': '☁️',
      '03d': '☁️',
      '03n': '☁️',
      '04d': '☁️',
      '04n': '☁️',
      '09d': '🌧️',
      '09n': '🌧️',
      '10d': '🌦️',
      '10n': '🌧️',
      '11d': '⛈️',
      '11n': '⛈️',
      '13d': '❄️',
      '13n': '❄️',
      '50d': '🌫️',
      '50n': '🌫️',
    };
    return iconMap[iconCode] || '🌤️';
  };

  // Funções de utilidade
  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getBrazilianCityByCoordinates = (lat: number, lon: number): string => {
    const cities = [
      { name: 'São Paulo', lat: -23.5505, lon: -46.6333, threshold: 0.5 },
      { name: 'Rio de Janeiro', lat: -22.9068, lon: -43.1729, threshold: 0.5 },
      { name: 'Brasília', lat: -15.7939, lon: -47.8828, threshold: 0.5 },
      { name: 'Salvador', lat: -12.9714, lon: -38.5014, threshold: 0.5 },
      { name: 'Fortaleza', lat: -3.7319, lon: -38.5267, threshold: 0.5 },
      { name: 'Belo Horizonte', lat: -19.9191, lon: -43.9386, threshold: 0.5 },
      { name: 'Manaus', lat: -3.119, lon: -60.0217, threshold: 0.5 },
      { name: 'Curitiba', lat: -25.4244, lon: -49.2654, threshold: 0.5 },
      { name: 'Recife', lat: -8.0578, lon: -34.8829, threshold: 0.5 },
      { name: 'Porto Alegre', lat: -30.0346, lon: -51.2177, threshold: 0.5 },
    ];

    for (const city of cities) {
      const latDiff = Math.abs(lat - city.lat);
      const lonDiff = Math.abs(lon - city.lon);
      if (latDiff <= city.threshold && lonDiff <= city.threshold) {
        return city.name;
      }
    }

    return 'Brasil';
  };

  // Effect para atualizar o relógio
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Inicialização do clima com dados simulados
    const initializeWeather = async () => {
      console.log('🔄 Inicializando sistema de clima...');

      // Usar localização padrão (São Paulo) sem solicitar geolocalização do usuário
      const defaultLocation = {
        lat: -23.5505,
        lon: -46.6333,
        city: 'São Paulo',
      };

      console.log(
        'Inicializando com localização padrão (dados simulados) - Modo offline por padrão'
      );
      setUserLocation(defaultLocation);
      setLocationError(
        'Clique no botão "📍 Usar Minha Localização" para dados reais da sua região'
      );

      // Carregar APENAS dados simulados inicialmente (modo offline ativo)
      await loadWeatherData(defaultLocation.lat, defaultLocation.lon);
    };

    initializeWeather();

    return () => clearInterval(timer);
  }, []);

  // Recarregar dados quando forecastDays mudar
  useEffect(() => {
    if (userLocation && !isLoadingData) {
      console.log(`Recarregando previsão para ${forecastDays} dias`);
      loadWeatherData(userLocation.lat, userLocation.lon);
    }
  }, [forecastDays, userLocation?.lat, userLocation?.lon]);

  const getCurrentLocation = (): Promise<{
    lat: number;
    lon: number;
    city?: string;
  }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalização não é suportada neste navegador'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          try {
            // Tentar obter o nome da cidade usando reverse geocoding
            const cityName = await getCityName(lat, lon);
            resolve({ lat, lon, city: cityName });
          } catch {
            // Se falhar, usar coordenadas sem nome da cidade
            resolve({ lat, lon, city: 'Sua localização' });
          }
        },
        (error) => {
          console.error('Erro de geolocalização:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutos
        }
      );
    });
  };

  const getCityName = async (lat: number, lon: number): Promise<string> => {
    // Primeiro, tentar usar coordenadas conhecidas para retorno rápido
    if (lat >= -34 && lat <= 5 && lon >= -74 && lon <= -28) {
      const brazilianCity = getBrazilianCityByCoordinates(lat, lon);
      if (brazilianCity !== 'Brasil') {
        console.log(
          'Nome da cidade via coordenadas brasileiras:',
          brazilianCity
        );
        return brazilianCity;
      }
    }

    try {
      // Tentar APIs apenas se não conseguiu determinar pela coordenada
      const apiKey = (import.meta as any).env.VITE_OPENWEATHER_API_KEY;

      if (apiKey) {
        console.log('Tentando obter nome da cidade via OpenWeatherMap...');
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // Reduzido para 5 segundos

          const response = await fetch(
            `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`,
            {
              signal: controller.signal,
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
            }
          );

          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
              const location = data[0];
              const cityName = `${location.name}, ${location.state || location.country}`;
              console.log(
                'Nome da cidade obtido via OpenWeatherMap:',
                cityName
              );
              return cityName;
            }
          } else {
            console.warn(
              'Erro na API OpenWeatherMap:',
              response.status,
              response.statusText
            );
          }
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            console.log('Timeout na obtenção do nome da cidade');
          } else {
            console.warn('Erro ao obter nome da cidade:', error);
          }
        }
      }

      console.log('Usando localização genérica como fallback');
      return 'Sua localização';
    } catch (error) {
      console.warn('Erro geral ao obter nome da cidade:', error);
      return 'Sua localização';
    }
  };

  const handleDaysChange = (newDays: number) => {
    if (newDays >= 7 && newDays <= 14 && newDays !== forecastDays) {
      setForecastDays(newDays);
    }
  };

  // Carregar dados reais do clima com melhor tratamento de timeouts
  const loadWeatherData = async (lat: number, lon: number) => {
    // Prevenir múltiplas chamadas simultâneas
    if (isLoadingData) {
      console.log('Já existe uma requisição de dados do clima em andamento');
      return;
    }

    setIsLoadingData(true);

    try {
      console.log(`🌍 CARREGANDO DADOS REAIS para coordenadas: ${lat}, ${lon}`);

      // Carregar clima atual e previsão em paralelo - SOMENTE dados reais
      const [currentWeather, forecastData] = await Promise.all([
        weatherService.getCurrentWeather(lat, lon),
        weatherService.getForecast(lat, lon, forecastDays),
      ]);

      // Processar clima atual - DEVE ser dados reais
      if (currentWeather) {
        console.log(
          '✅ DADOS REAIS do clima atual carregados:',
          currentWeather
        );
        setWeather(currentWeather);
      } else {
        throw new Error('Não foi possível obter dados reais do clima atual');
      }

      // Processar previsão - DEVE ser dados reais
      if (
        forecastData &&
        Array.isArray(forecastData) &&
        forecastData.length > 0
      ) {
        console.log(
          '✅ DADOS REAIS da previsão carregados:',
          forecastData.length,
          'dias'
        );
        setForecast(forecastData);
      } else {
        throw new Error('Não foi possível obter dados reais da previsão');
      }
    } catch (error) {
      console.error(
        '❌ ERRO CRÍTICO: Não foi possível carregar dados reais do clima:',
        error
      );
      setLocationError(
        'Erro ao carregar dados meteorológicos. Verifique sua conexão com a internet.'
      );

      // NÃO usar fallback simulado - mostrar erro real
      setWeather(null);
      setForecast([]);
    } finally {
      setLoadingWeather(false);
      setIsLoadingData(false);
    }
  };

  const requestLocation = async () => {
    setLoadingWeather(true);
    setLocationError(null);
    setHasRequestedLocation(true);

    try {
      console.log(
        '🌍 Geolocalização solicitada pelo usuário - ativando modo online...'
      );

      // Ativar modo online para usar dados reais da API
      weatherService.enableOnlineMode();

      // Testar API primeiro
      const apiWorking = await weatherService.testAPI();
      if (!apiWorking) {
        console.warn(
          '⚠️ API não está funcionando, continuando com dados simulados'
        );
        setLocationError(
          'API meteorológica indisponível - usando dados simulados'
        );
        setLoadingWeather(false);
        return;
      }

      console.log('✅ API funcionando, obtendo localização...');

      // Obter localização do usuário
      const location = await getCurrentLocation();
      console.log('✅ Localização obtida:', location);

      setUserLocation(location);
      setLocationError(null);

      // Carregar dados reais
      await loadWeatherData(location.lat, location.lon);

      console.log('✅ Dados meteorológicos carregados com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao obter localização:', error);

      let errorMessage = 'Erro desconhecido ao obter localização';

      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              'Permissão de localização negada. Habilite a localização nas configurações do navegador.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage =
              'Localização indisponível. Verifique se o GPS está ativado.';
            break;
          case error.TIMEOUT:
            errorMessage =
              'Timeout ao obter localização. Tente novamente em alguns segundos.';
            break;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setLocationError(errorMessage);
      setLoadingWeather(false);

      // Usar dados simulados com a localização padrão
      console.log(
        'Continuando com dados simulados devido ao erro de localização'
      );
    }
  };

  return (
    <Container>
      <DashboardHeader
        user={user}
        currentTime={currentTime}
        weather={weather}
        getGreeting={getGreeting}
        formatTime={formatTime}
        formatDate={formatDate}
        getWeatherIcon={getWeatherIcon}
      />

      <DashboardStatsGrid stats={stats} />

      <DashboardWeatherSection
        weather={weather}
        forecast={forecast}
        loadingWeather={loadingWeather}
        forecastDays={forecastDays}
        userLocation={userLocation}
        locationError={locationError}
        hasRequestedLocation={hasRequestedLocation}
        handleDaysChange={handleDaysChange}
        requestLocation={requestLocation}
        getWeatherIcon={getWeatherIcon}
      />

      <div
        style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
          textAlign: 'center',
        }}
      >
        <h2>Painel em Desenvolvimento</h2>
        <p>Mais funcionalidades serão adicionadas em breve!</p>
      </div>
    </Container>
  );
};

export default DashboardPage;
