// Exemplo de como adaptar o DashboardPage.tsx existente para usar o novo layout mobile

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';
import { weatherService } from '../services/weatherService';
import type { WeatherData, WeatherForecast } from '../services/weatherService';
import {
  responsiveContainer,
  device,
  responsiveMobileHeader,
  responsiveHamburgerMenu,
  responsiveSidebar,
  responsiveMobileNavigation,
  responsiveBottomNavigation,
  responsiveFabButton,
} from '../styles/responsive';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardStatsGrid from '../components/dashboard/DashboardStatsGrid';
import DashboardWeatherSection from '../components/dashboard/DashboardWeatherSection';

// Container principal adaptado para mobile
const Container = styled.div`
  ${responsiveContainer}
  background-color: #f8f9fa;
  min-height: 100vh;

  // Mobile: remover padding top pois temos header mobile
  @media ${device.mobile} {
    padding-top: 0;
  }
`;

// Layout wrapper para sidebar mobile
const LayoutWrapper = styled.div`
  display: flex;
  min-height: 100vh;

  @media ${device.mobile} {
    flex-direction: column;
  }
`;

// Sidebar moderna
const Sidebar = styled.aside<{ isOpen: boolean }>`
  ${responsiveSidebar}

  @media ${device.mobile} {
    ${(props) => (props.isOpen ? '&.open' : '')}
  }
`;

// Header mobile
const MobileHeader = styled.header`
  ${responsiveMobileHeader}
`;

// Hamburger menu
const HamburgerContainer = styled.div`
  ${responsiveHamburgerMenu}
`;

// Main content adaptado
const MainContent = styled.main<{ sidebarOpen?: boolean }>`
  flex: 1;

  @media ${device.mobile} {
    ${(props) =>
      props.sidebarOpen &&
      `
      filter: blur(2px);
      pointer-events: none;
    `}
  }
`;

// Navigation mobile
const MobileNavigation = styled.nav`
  ${responsiveMobileNavigation}
`;

// Bottom nav
const BottomNavigation = styled.nav`
  ${responsiveBottomNavigation}
`;

// FAB button
const FabButton = styled.button`
  ${responsiveFabButton}
`;

// Overlay para mobile
const Overlay = styled.div<{ show: boolean }>`
  display: none;

  @media ${device.mobile} {
    display: ${(props) => (props.show ? 'block' : 'none')};
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

// Interface para navegação
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

const DashboardPageWithMobile: React.FC = () => {
  const { user } = useAuth();

  // Estados mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Estados existentes do clima
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

  // Itens de navegação
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/dashboard' },
    {
      id: 'projects',
      label: 'Projetos',
      icon: '📁',
      path: '/projects',
      badge: stats.activeProjects,
    },
    {
      id: 'teams',
      label: 'Equipes',
      icon: '👥',
      path: '/teams',
      badge: stats.totalTeams,
    },
    {
      id: 'members',
      label: 'Membros',
      icon: '👤',
      path: '/members',
      badge: stats.totalMembers,
    },
    { id: 'tasks', label: 'Tarefas', icon: '✅', path: '/tasks' },
    {
      id: 'calendar',
      label: 'Calendário',
      icon: '📅',
      path: '/calendar',
      badge: stats.birthdaysToday,
    },
    { id: 'reports', label: 'Relatórios', icon: '📈', path: '/reports' },
    { id: 'settings', label: 'Configurações', icon: '⚙️', path: '/settings' },
  ];

  // Detectar mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Prevenir scroll quando sidebar aberta
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobile, sidebarOpen]);

  // Funções existentes do clima (manter todas as existentes)
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

  // ... (manter todas as outras funções existentes do clima)

  // Handlers mobile
  const handleOverlayClick = () => {
    setSidebarOpen(false);
  };

  const handleNavigation = (path: string) => {
    if (isMobile) {
      setSidebarOpen(false);
    }
    // Implementar navegação real aqui
    console.log('Navegando para:', path);
  };

  const handleFabClick = () => {
    // Ação do FAB - criar novo projeto
    console.log('Criar novo projeto');
  };

  const handleDaysChange = (newDays: number) => {
    if (newDays >= 7 && newDays <= 14 && newDays !== forecastDays) {
      setForecastDays(newDays);
    }
  };

  const requestLocation = async () => {
    // ... manter função existente
  };

  // Effect para o relógio (manter existente)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // ... manter inicialização do clima existente

    return () => clearInterval(timer);
  }, []);

  return (
    <LayoutWrapper>
      {/* Overlay para mobile */}
      <Overlay show={sidebarOpen && isMobile} onClick={handleOverlayClick} />

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} className={sidebarOpen ? 'open' : ''}>
        <MobileNavigation className="mobile-nav">
          {/* Header da Sidebar */}
          <div
            style={{
              padding: '1.5rem',
              borderBottom: '1px solid rgba(0,0,0,0.1)',
              background: '#f8f9fa',
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: '1.25rem',
                fontWeight: 600,
                color: '#333',
              }}
            >
              EPU Gestão
            </h2>
            <p
              style={{
                margin: '0.25rem 0 0 0',
                fontSize: '0.875rem',
                color: '#666',
              }}
            >
              Sistema de Gerenciamento
            </p>
          </div>

          {/* Lista de Navegação */}
          <ul
            className="nav-list"
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
            }}
          >
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  className={`nav-item ${item.path === '/dashboard' ? 'active' : ''}`}
                  onClick={() => handleNavigation(item.path)}
                  style={{
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-text">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="nav-badge">{item.badge}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </MobileNavigation>
      </Sidebar>

      {/* Conteúdo Principal */}
      <MainContent sidebarOpen={sidebarOpen && isMobile}>
        {/* Header Mobile */}
        <MobileHeader className="mobile-header">
          <HamburgerContainer className="hamburger-container">
            <button
              className="hamburger-button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle Menu"
            >
              <div className={`hamburger-icon ${sidebarOpen ? 'open' : ''}`}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </button>
          </HamburgerContainer>

          <div className="mobile-header-content">
            <div>
              <h1 className="header-title">EPU Gestão</h1>
              <p className="header-subtitle">Dashboard Executivo</p>
            </div>
          </div>

          <div className="mobile-header-actions">
            <button className="action-button" aria-label="Notifications">
              <span className="icon">🔔</span>
            </button>
            <button className="action-button" aria-label="Profile">
              <span className="icon">👤</span>
            </button>
          </div>
        </MobileHeader>

        {/* Conteúdo do Dashboard */}
        <Container>
          {/* Header Desktop (oculto em mobile) */}
          <div style={{ display: isMobile ? 'none' : 'block' }}>
            <DashboardHeader
              user={user}
              currentTime={currentTime}
              weather={weather}
              getGreeting={getGreeting}
              formatTime={formatTime}
              formatDate={formatDate}
              getWeatherIcon={getWeatherIcon}
            />
          </div>

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
      </MainContent>

      {/* Bottom Navigation (apenas mobile) */}
      <BottomNavigation className="bottom-nav">
        <ul className="bottom-nav-list">
          {navItems.slice(0, 5).map((item) => (
            <li key={`bottom-${item.id}`}>
              <button
                className={`bottom-nav-item ${item.path === '/dashboard' ? 'active' : ''}`}
                onClick={() => handleNavigation(item.path)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                <span className="bottom-nav-icon">{item.icon}</span>
                <span className="bottom-nav-text">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="bottom-nav-badge">{item.badge}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </BottomNavigation>

      {/* FAB Button */}
      <FabButton className="fab-button" onClick={handleFabClick}>
        <span className="fab-icon">➕</span>
      </FabButton>
    </LayoutWrapper>
  );
};

export default DashboardPageWithMobile;
