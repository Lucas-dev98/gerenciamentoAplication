import React from 'react';
import styled from 'styled-components';
import { MobileLayout } from './MobileLayout';

// Styled Components para o conteúdo do dashboard
const DashboardContent = styled.div`
  padding: 1.5rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const WelcomeSection = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.08),
    0 2px 16px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(52, 152, 219, 0.08);

  .welcome-title {
    font-size: 1.75rem;
    font-weight: 700;
    background: linear-gradient(135deg, #2c3e50, #3498db);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
  }

  .welcome-subtitle {
    color: #7f8c8d;
    font-size: 1rem;
    font-weight: 500;
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
    margin-bottom: 1.5rem;

    .welcome-title {
      font-size: 1.5rem;
    }

    .welcome-subtitle {
      font-size: 0.9rem;
    }
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.08),
    0 2px 16px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(52, 152, 219, 0.08);
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  &:hover {
    transform: translateY(-4px);
    box-shadow:
      0 12px 40px rgba(0, 0, 0, 0.12),
      0 4px 20px rgba(0, 0, 0, 0.08);
  }

  .stat-icon {
    font-size: 2rem;
    margin-bottom: 0.75rem;
    display: block;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #2c3e50;
    margin-bottom: 0.25rem;
  }

  .stat-label {
    color: #7f8c8d;
    font-size: 0.875rem;
    font-weight: 500;
  }

  @media (max-width: 768px) {
    padding: 1rem;

    .stat-icon {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }

    .stat-value {
      font-size: 1.25rem;
    }

    .stat-label {
      font-size: 0.8rem;
    }
  }
`;

// Exemplo de como usar o MobileLayout no DashboardPage

const navItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: '📊',
    path: '/dashboard',
  },
  {
    id: 'projects',
    label: 'Projetos',
    icon: '📁',
    path: '/projects',
    badge: 3,
  },
  {
    id: 'teams',
    label: 'Equipes',
    icon: '👥',
    path: '/teams',
  },
  {
    id: 'members',
    label: 'Membros',
    icon: '👤',
    path: '/members',
    badge: 12,
  },
  {
    id: 'tasks',
    label: 'Tarefas',
    icon: '✓',
    path: '/tasks',
    badge: 5,
  },
  {
    id: 'calendar',
    label: 'Calendário',
    icon: '📅',
    path: '/calendar',
  },
  {
    id: 'reports',
    label: 'Relatórios',
    icon: '📈',
    path: '/reports',
  },
  {
    id: 'settings',
    label: 'Configurações',
    icon: '⚙️',
    path: '/settings',
  },
];

interface DashboardWithMobileLayoutProps {
  children: React.ReactNode;
  currentPage?: string;
}

export const DashboardWithMobileLayout: React.FC<
  DashboardWithMobileLayoutProps
> = ({ children, currentPage = '/dashboard' }) => {
  const handleNavigation = (path: string) => {
    // Aqui você implementaria a navegação real
    // Por exemplo, usando React Router:
    // navigate(path);
    console.log('Navegando para:', path);
  };

  const handleFabClick = () => {
    // Ação do botão FAB - por exemplo, criar novo projeto
    console.log('FAB clicked - Criar novo item');
  };

  return (
    <MobileLayout
      currentPage={currentPage}
      navItems={navItems}
      onNavigate={handleNavigation}
      showBottomNav={true} // Mostrar navegação inferior em mobile
      showFab={true} // Mostrar botão FAB
      onFabClick={handleFabClick}
      headerTitle="EPU Gestão"
      headerSubtitle="Dashboard Executivo"
    >
      <DashboardContent>
        <WelcomeSection>
          <h1 className="welcome-title">Bem-vindo ao EPU Gestão</h1>
          <p className="welcome-subtitle">
            Gerencie seus projetos, equipes e tarefas de forma eficiente
          </p>
        </WelcomeSection>

        <StatsGrid>
          <StatCard>
            <span className="stat-icon">📊</span>
            <div className="stat-value">24</div>
            <div className="stat-label">Projetos Ativos</div>
          </StatCard>

          <StatCard>
            <span className="stat-icon">👥</span>
            <div className="stat-value">15</div>
            <div className="stat-label">Equipes</div>
          </StatCard>

          <StatCard>
            <span className="stat-icon">👤</span>
            <div className="stat-value">142</div>
            <div className="stat-label">Membros</div>
          </StatCard>

          <StatCard>
            <span className="stat-icon">✓</span>
            <div className="stat-value">89</div>
            <div className="stat-label">Tarefas Concluídas</div>
          </StatCard>
        </StatsGrid>

        {/* Renderizar o conteúdo adicional passado como children */}
        {children}
      </DashboardContent>
    </MobileLayout>
  );
};

export default DashboardWithMobileLayout;
