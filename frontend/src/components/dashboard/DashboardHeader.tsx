import React from 'react';
import styled from 'styled-components';
import { device, responsiveHeader } from '../../styles/responsive';
import type { WeatherData } from '../../services/weatherService';

interface DashboardHeaderProps {
  user: { fullName?: string } | null;
  currentTime: Date;
  weather: WeatherData | null;
  getGreeting: () => string;
  getWeatherIcon: (iconCode: string) => string;
  formatDate: (date: Date) => string;
  formatTime: (date: Date) => string;
}

const Header = styled.div`
  ${responsiveHeader}
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);

  @media ${device.mobile} {
    margin-bottom: 1.5rem;
    border-radius: 8px;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media ${device.mobile} {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  @media ${device.tablet} {
    flex-direction: row;
    align-items: center;
    gap: 1.5rem;
  }

  h1 {
    margin: 0;
    font-size: 2.2rem;

    @media ${device.mobile} {
      font-size: 1.6rem;
    }

    @media ${device.tablet} {
      font-size: 1.8rem;
    }
  }

  .time-info {
    text-align: right;
    opacity: 0.9;

    @media ${device.mobile} {
      text-align: left;
      width: 100%;
    }

    @media ${device.tablet} {
      text-align: center;
    }
  }
`;

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  user,
  currentTime,
  weather,
  getGreeting,
  getWeatherIcon,
  formatDate,
  formatTime,
}) => {
  return (
    <Header>
      <HeaderContent>
        <div>
          <h1>
            {getGreeting()}, {user?.fullName || 'Usuário'}!
          </h1>
          <p>Bem-vindo ao seu painel de controle</p>
        </div>
        <div className="time-info">
          <div>{formatTime(currentTime)}</div>
          <div>{formatDate(currentTime)}</div>
          {weather && (
            <div
              style={{
                marginTop: '1rem',
                padding: '1rem',
                background: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <div
                style={{
                  fontSize: '1.2rem',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>
                  {getWeatherIcon(weather.icon)}
                </span>
                <span style={{ fontWeight: '600' }}>
                  {weather.temperature}°C
                </span>
                <span style={{ opacity: 0.9 }}>•</span>
                <span style={{ textTransform: 'capitalize' }}>
                  {weather.description}
                </span>
              </div>
              <div
                style={{
                  fontSize: '0.9rem',
                  opacity: 0.85,
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '1rem',
                }}
              >
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <span>💧</span> {weather.humidity}%
                </span>
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <span>💨</span> {weather.windSpeed} km/h
                </span>
              </div>
            </div>
          )}
        </div>
      </HeaderContent>
    </Header>
  );
};

export default DashboardHeader;
