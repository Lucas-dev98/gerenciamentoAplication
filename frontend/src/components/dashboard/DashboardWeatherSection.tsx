import React, { useState } from 'react';
import styled from 'styled-components';
import {
  device,
  responsiveWeather,
  responsiveWeatherControls,
  responsiveForecastGrid,
  responsiveWeatherCard,
  responsiveLoadingCard,
  responsiveButton,
} from '../../styles/responsive';
import { weatherService } from '../../services/weatherService';
import type {
  WeatherData,
  WeatherForecast,
} from '../../services/weatherService';

interface WeatherSectionProps {
  weather: WeatherData | null;
  forecast: WeatherForecast[];
  loadingWeather: boolean;
  forecastDays: number;
  userLocation: { lat: number; lon: number; city?: string } | null;
  locationError: string | null;
  hasRequestedLocation: boolean;
  handleDaysChange: (days: number) => void;
  requestLocation: () => Promise<void>;
  getWeatherIcon: (iconCode: string) => string;
}

const WeatherSection = styled.div`
  ${responsiveWeather}
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;

  @media ${device.mobile} {
    margin-bottom: 1.5rem;
    border-radius: 12px;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #667eea 100%);
    background-size: 200% 100%;
    animation: shimmer 3s ease-in-out infinite;
  }

  @keyframes shimmer {
    0%,
    100% {
      background-position: 200% 0;
    }
    50% {
      background-position: -200% 0;
    }
  }
`;

const WeatherTitle = styled.h2`
  color: #2c3e50;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 1.8rem;
  font-weight: 600;
  text-align: center;
  justify-content: center;

  @media ${device.mobile} {
    font-size: 1.4rem;
    text-align: left;
    justify-content: flex-start;
    margin-bottom: 1.5rem;
  }

  @media ${device.tablet} {
    font-size: 1.6rem;
  }

  .icon {
    font-size: 2rem;
    animation: float 3s ease-in-out infinite;

    @media ${device.mobile} {
      font-size: 1.5rem;
    }
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-5px);
    }
  }

  .subtitle {
    display: block;
    font-size: 0.9rem;
    font-weight: 400;
    color: #6c757d;
    margin-top: 0.3rem;

    @media ${device.mobile} {
      font-size: 0.8rem;
    }
  }
`;

const WeatherControls = styled.div`
  ${responsiveWeatherControls}
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);

  .days-selector {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #2c3e50;
    font-weight: 600;
    font-size: 1rem;

    @media ${device.mobile} {
      font-size: 0.9rem;
      text-align: center;
    }
  }

  .quick-buttons {
    display: flex;
    gap: 0.8rem;

    @media ${device.mobile} {
      gap: 0.5rem;
      justify-content: space-around;
    }

    @media ${device.tablet} {
      gap: 0.6rem;
    }
  }

  .quick-btn {
    padding: 0.6rem 1.2rem;
    border: 2px solid #74b9ff;
    background: transparent;
    color: #74b9ff;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 80px;

    @media ${device.mobile} {
      padding: 0.5rem 0.8rem;
      font-size: 0.8rem;
      min-width: 60px;
      flex: 1;
    }

    @media ${device.tablet} {
      padding: 0.55rem 1rem;
      font-size: 0.85rem;
      min-width: 70px;
    }

    &:hover {
      background: #74b9ff;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(116, 185, 255, 0.3);
    }

    &.active {
      background: #74b9ff;
      color: white;
      box-shadow: 0 4px 12px rgba(116, 185, 255, 0.4);
    }
  }
`;

const ForecastGrid = styled.div`
  ${responsiveForecastGrid}
`;

const WeatherCard = styled.div`
  ${responsiveWeatherCard}
  background: linear-gradient(
    135deg,
    rgba(102, 126, 234, 0.9) 0%,
    rgba(118, 75, 162, 0.9) 100%
  );
  color: white;
  border-radius: 20px;
  text-align: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;

  @media ${device.mobile} {
    border-radius: 12px;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
    transition: left 0.6s;
  }

  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 20px 40px rgba(102, 126, 234, 0.4);

    @media ${device.mobile} {
      transform: translateY(-4px) scale(1.01);
    }

    &::before {
      left: 100%;
    }
  }

  .date {
    font-size: 1rem;
    opacity: 0.9;
    margin-bottom: 1rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;

    @media ${device.mobile} {
      font-size: 0.9rem;
      margin-bottom: 0.75rem;
    }
  }

  .icon {
    font-size: 3.5rem;
    margin: 1rem 0;
    display: block;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
    animation: bounce 2s infinite;

    @media ${device.mobile} {
      font-size: 2.5rem;
      margin: 0.75rem 0;
    }

    @media ${device.tablet} {
      font-size: 3rem;
    }
  }

  @keyframes bounce {
    0%,
    20%,
    50%,
    80%,
    100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-5px);
    }
    60% {
      transform: translateY(-3px);
    }
  }

  .temperature {
    font-size: 1.8rem;
    font-weight: bold;
    margin: 1.2rem 0;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);

    @media ${device.mobile} {
      font-size: 1.4rem;
      margin: 1rem 0;
    }

    @media ${device.tablet} {
      font-size: 1.6rem;
    }

    .max {
      color: #fff;
    }

    .min {
      opacity: 0.8;
      font-size: 0.9em;
    }
  }

  .description {
    font-size: 1rem;
    opacity: 0.95;
    text-transform: capitalize;
    margin-bottom: 1rem;
    font-weight: 500;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);

    @media ${device.mobile} {
      font-size: 0.9rem;
      margin-bottom: 0.75rem;
    }
  }

  .details {
    margin-top: 1.2rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    display: flex;
    justify-content: space-around;

    @media ${device.mobile} {
      margin-top: 1rem;
      padding-top: 0.75rem;
    }

    span {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.3rem;
      font-size: 0.85rem;
      opacity: 0.9;

      @media ${device.mobile} {
        font-size: 0.75rem;
      }

      .icon {
        font-size: 1.2rem;
        margin: 0;
        animation: none;
        filter: none;

        @media ${device.mobile} {
          font-size: 1rem;
        }
      }

      .value {
        font-weight: 600;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
      }
    }
  }
`;

const LoadingCard = styled.div`
  ${responsiveLoadingCard}
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 20px;
  text-align: center;
  color: #6c757d;
  border: 2px dashed #dee2e6;
  position: relative;
  overflow: hidden;

  @media ${device.mobile} {
    border-radius: 12px;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(102, 126, 234, 0.1),
      transparent
    );
    animation: loading 2s infinite;
  }

  @keyframes loading {
    0% {
      left: -100%;
    }
    100% {
      left: 100%;
    }
  }

  .loading-text {
    font-size: 1.3rem;
    margin-bottom: 0.8rem;
    font-weight: 600;
    color: #495057;

    @media ${device.mobile} {
      font-size: 1.1rem;
      margin-bottom: 0.6rem;
    }

    @media ${device.tablet} {
      font-size: 1.2rem;
    }

    .emoji {
      display: inline-block;
      animation: spin 2s linear infinite;
      margin-right: 0.5rem;
    }
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .loading-subtitle {
    font-size: 1rem;
    opacity: 0.8;
    font-style: italic;

    @media ${device.mobile} {
      font-size: 0.9rem;
    }
  }
`;

const LocationButton = styled.button`
  ${responsiveButton}
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  margin: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const MoreInfoButton = styled.button`
  background: linear-gradient(135deg, #3498db 0%, #2ecc71 100%);
  color: white;
  border: none;
  border-radius: 25px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  margin: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;

  @media ${device.mobile} {
    padding: 0.6rem 1.2rem;
    font-size: 0.8rem;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

const WeatherActionsContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin: 1.5rem 0;
  flex-wrap: wrap;

  @media ${device.mobile} {
    gap: 0.5rem;
    margin: 1rem 0;
  }
`;

const DetailedInfoModal = styled.div<{ show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: ${(props) => (props.show ? 'flex' : 'none')};
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
  animation: ${(props) => (props.show ? 'fadeIn' : 'fadeOut')} 0.3s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }
`;

const ModalContent = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 20px;
  padding: 2rem;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  animation: slideIn 0.3s ease;

  @keyframes slideIn {
    from {
      transform: translateY(-50px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @media ${device.mobile} {
    padding: 1.5rem;
    max-width: 95vw;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    border-bottom: 1px solid #e9ecef;
    padding-bottom: 1rem;

    h3 {
      margin: 0;
      color: #2c3e50;
      font-size: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .close-button {
      background: #e74c3c;
      color: white;
      border: none;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      cursor: pointer;
      font-size: 1.2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;

      &:hover {
        background: #c0392b;
        transform: scale(1.1);
      }
    }
  }

  .modal-body {
    color: #2c3e50;

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;

      @media ${device.mobile} {
        grid-template-columns: 1fr;
      }
    }

    .info-card {
      background: linear-gradient(
        135deg,
        rgba(52, 152, 219, 0.1) 0%,
        rgba(46, 204, 113, 0.1) 100%
      );
      border-radius: 12px;
      padding: 1rem;
      border: 1px solid rgba(52, 152, 219, 0.2);

      h4 {
        margin: 0 0 0.5rem 0;
        color: #3498db;
        font-size: 1.1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      p {
        margin: 0;
        font-size: 0.9rem;
        line-height: 1.4;
      }
    }
  }
`;

const CurrentWeatherCard = styled.div`
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 8px 32px rgba(79, 70, 229, 0.3);

  .current-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;

    .location {
      font-size: 1.1rem;
      font-weight: 600;
      opacity: 0.9;
    }

    .weather-icon {
      font-size: 2.5rem;
    }
  }

  .current-temp {
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 0.5rem;

    @media ${device.mobile} {
      font-size: 2.5rem;
    }
  }

  .current-description {
    font-size: 1.1rem;
    margin-bottom: 1rem;
    opacity: 0.9;
    text-transform: capitalize;
  }

  .current-details {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;

    @media ${device.mobile} {
      grid-template-columns: 1fr;
      gap: 0.5rem;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;

      .detail-icon {
        font-size: 1.1rem;
      }
    }
  }

  @media ${device.mobile} {
    padding: 1.2rem;
    margin-bottom: 1rem;
  }
`;

const DashboardWeatherSection: React.FC<WeatherSectionProps> = ({
  weather,
  forecast,
  loadingWeather,
  forecastDays,
  userLocation,
  locationError,
  hasRequestedLocation,
  handleDaysChange,
  requestLocation,
  getWeatherIcon,
}) => {
  const [showDetailedInfo, setShowDetailedInfo] = useState(false);

  const toggleDetailedInfo = () => {
    setShowDetailedInfo(!showDetailedInfo);
  };

  const getDetailedWeatherInfo = () => {
    if (!weather) return null;

    return {
      location: {
        title: '🗺️ Localização',
        info: `${weather.location}${userLocation?.lat && userLocation?.lon ? ` (${userLocation.lat.toFixed(2)}, ${userLocation.lon.toFixed(2)})` : ''}`,
      },
      current: {
        title: '🌡️ Condições Atuais',
        info: `${weather.temperature}°C, ${weather.description}. Sensação térmica pode variar de acordo com umidade e vento.`,
      },
      humidity: {
        title: '💧 Umidade do Ar',
        info: `${weather.humidity}% - ${weather.humidity > 70 ? 'Alta umidade, ambiente pode parecer mais quente' : weather.humidity < 30 ? 'Baixa umidade, ar seco' : 'Umidade adequada para conforto'}`,
      },
      wind: {
        title: '💨 Vento',
        info: `${weather.windSpeed} km/h - ${weather.windSpeed > 20 ? 'Vento forte, cuidado ao sair' : weather.windSpeed > 10 ? 'Brisa moderada' : 'Vento calmo'}`,
      },
      forecast: {
        title: '📅 Previsão Estendida',
        info: `Exibindo ${forecastDays} dias de previsão. ${hasRequestedLocation ? `Primeiros 5 dias baseados em dados reais da API meteorológica, demais são estimativas.` : 'Dados simulados para demonstração.'}`,
      },
      api: {
        title: '🌐 Fonte dos Dados',
        info: hasRequestedLocation
          ? 'Dados obtidos via API meteorológica em tempo real com base na sua localização GPS.'
          : "Dados simulados para demonstração. Clique em 'Usar Minha Localização Real' para dados precisos.",
      },
    };
  };

  return (
    <WeatherSection>
      <WeatherTitle>
        <span className="icon">🌤️</span>
        <div>
          Previsão do Tempo
          <span className="subtitle">
            Próximos {forecastDays} dias em{' '}
            {weather?.location || userLocation?.city || 'Sua localização'}
            {!hasRequestedLocation && (
              <span
                style={{
                  color: '#3498db',
                  fontSize: '0.8rem',
                  display: 'block',
                  marginTop: '0.2rem',
                }}
              >
                🔹 Dados simulados - Clique no botão para usar sua localização
                real
              </span>
            )}
            {locationError && hasRequestedLocation && (
              <span
                style={{
                  color: '#e74c3c',
                  fontSize: '0.8rem',
                  display: 'block',
                }}
              >
                📍 {locationError}
              </span>
            )}
            {weatherService.isOffline() && hasRequestedLocation && (
              <span
                style={{
                  color: '#f39c12',
                  fontSize: '0.75rem',
                  display: 'block',
                  marginTop: '0.2rem',
                }}
              >
                ⏳ Aguardando resposta da API meteorológica...
              </span>
            )}
          </span>
        </div>
      </WeatherTitle>

      <WeatherControls>
        <div className="days-selector">
          <span>📅 Previsão para:</span>
          {forecastDays > 5 && hasRequestedLocation && (
            <span
              style={{
                fontSize: '0.7rem',
                color: '#3498db',
                marginLeft: '0.5rem',
                fontStyle: 'italic',
              }}
            >
              (5 dias reais + {forecastDays - 5} estimados)
            </span>
          )}
        </div>
        <div className="quick-buttons">
          <button
            className={`quick-btn ${forecastDays === 7 ? 'active' : ''}`}
            onClick={() => handleDaysChange(7)}
          >
            7 dias
          </button>
          <button
            className={`quick-btn ${forecastDays === 10 ? 'active' : ''}`}
            onClick={() => handleDaysChange(10)}
          >
            10 dias
          </button>
          <button
            className={`quick-btn ${forecastDays === 14 ? 'active' : ''}`}
            onClick={() => handleDaysChange(14)}
          >
            14 dias
          </button>
        </div>
      </WeatherControls>

      {/* Botões de Ação - Sempre Visíveis */}
      <WeatherActionsContainer>
        <LocationButton
          onClick={requestLocation}
          disabled={loadingWeather && hasRequestedLocation}
        >
          📍 Usar Minha Localização Real
        </LocationButton>
        {weather && !loadingWeather && (
          <MoreInfoButton onClick={toggleDetailedInfo}>
            ℹ️ Mais Informações
          </MoreInfoButton>
        )}
      </WeatherActionsContainer>

      {/* Card de Clima Atual */}
      {weather && !loadingWeather && (
        <CurrentWeatherCard>
          <div className="current-header">
            <div className="location">📍 {weather.location}</div>
            <div className="weather-icon">{getWeatherIcon(weather.icon)}</div>
          </div>
          <div className="current-temp">{weather.temperature}°C</div>
          <div className="current-description">{weather.description}</div>
          <div className="current-details">
            <div className="detail-item">
              <span className="detail-icon">💧</span>
              <span>Umidade: {weather.humidity}%</span>
            </div>
            <div className="detail-item">
              <span className="detail-icon">💨</span>
              <span>Vento: {weather.windSpeed} km/h</span>
            </div>
          </div>
        </CurrentWeatherCard>
      )}

      {loadingWeather ? (
        <LoadingCard>
          <div className="loading-text">
            <span className="emoji">⏳</span>
            {hasRequestedLocation
              ? 'Aguardando dados meteorológicos...'
              : 'Modo simulado carregado'}
          </div>
          <div className="loading-subtitle">
            {hasRequestedLocation
              ? 'Conectando com API meteorológica - pode levar alguns segundos'
              : 'Use o botão acima para solicitar dados reais da sua região'}
          </div>
        </LoadingCard>
      ) : forecast.length > 0 ? (
        <>
          <ForecastGrid>
            {forecast.map((day, index) => (
              <WeatherCard
                key={index}
                style={{
                  opacity: index >= 5 ? 0.85 : 1,
                  border:
                    index >= 5 ? '1px dashed #3498db50' : '1px solid #e0e0e0',
                  position: 'relative',
                }}
              >
                {index >= 5 && hasRequestedLocation && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      fontSize: '0.6rem',
                      color: '#3498db',
                      fontWeight: 'bold',
                    }}
                  >
                    EST
                  </div>
                )}
                <div className="date">{day.date}</div>
                <div className="icon">{getWeatherIcon(day.icon)}</div>
                <div className="temperature">
                  <span className="max">{day.temperature.max}°</span>
                  <span style={{ margin: '0 0.5rem', opacity: 0.7 }}>/</span>
                  <span className="min">{day.temperature.min}°</span>
                </div>
                <div className="description">{day.description}</div>
                <div className="details">
                  <span>
                    <span className="icon">💧</span>
                    <span className="value">{day.humidity}%</span>
                  </span>
                  <span>
                    <span className="icon">💨</span>
                    <span className="value">{day.windSpeed} km/h</span>
                  </span>
                </div>
              </WeatherCard>
            ))}
          </ForecastGrid>
          {!hasRequestedLocation && (
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <p
                style={{
                  fontSize: '0.8rem',
                  color: '#6c757d',
                  margin: '0.5rem 0',
                  fontStyle: 'italic',
                }}
              >
                Os dados atuais são simulados. Use o botão "📍 Usar Minha
                Localização Real" acima para dados precisos da sua região.
              </p>
            </div>
          )}
        </>
      ) : (
        <LoadingCard>
          <div className="loading-text">
            <span className="emoji">📡</span>
            Dados meteorológicos indisponíveis
          </div>
          <div className="loading-subtitle">
            Verifique sua conexão e tente novamente
          </div>
        </LoadingCard>
      )}

      {/* Modal de Informações Detalhadas */}
      <DetailedInfoModal show={showDetailedInfo}>
        <ModalContent>
          <div className="modal-header">
            <h3>🌤️ Informações Meteorológicas Detalhadas</h3>
            <button className="close-button" onClick={toggleDetailedInfo}>
              ×
            </button>
          </div>
          <div className="modal-body">
            {weather && (
              <div className="info-grid">
                {Object.entries(getDetailedWeatherInfo() || {}).map(
                  ([key, item]) => (
                    <div key={key} className="info-card">
                      <h4>{item.title}</h4>
                      <p>{item.info}</p>
                    </div>
                  )
                )}
              </div>
            )}

            <div
              style={{
                textAlign: 'center',
                marginTop: '1rem',
                padding: '1rem',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                borderRadius: '8px',
              }}
            >
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#2c3e50' }}>
                <strong>💡 Dica:</strong> Para obter dados meteorológicos mais
                precisos e atualizados, clique no botão "📍 Usar Minha
                Localização Real" e permita o acesso à sua localização.
              </p>
            </div>
          </div>
        </ModalContent>
      </DetailedInfoModal>
    </WeatherSection>
  );
};

export default DashboardWeatherSection;
