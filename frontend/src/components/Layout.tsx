import React, { useState } from 'react';
import type { ReactNode } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const LayoutContainer = styled.div`
  min-height: 100vh;
  display: flex;
`;

const Sidebar = styled.aside<{ isOpen: boolean }>`
  width: ${props => props.isOpen ? '250px' : '60px'};
  background: linear-gradient(180deg, #34495e 0%, #2c3e50 100%);
  color: white;
  transition: width 0.3s ease;
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
`;

const SidebarHeader = styled.div`
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
`;

const ToggleButton = styled.button`
  position: absolute;
  top: 1rem;
  right: -15px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #3498db;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  
  &:hover {
    background: #2980b9;
  }
`;

const NavSection = styled.div`
  padding: 1rem 0;
`;

const SectionTitle = styled.h3<{ isOpen: boolean }>`
  font-size: 0.75rem;
  color: #95a5a6;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 0 0.5rem 1rem;
  opacity: ${props => props.isOpen ? 1 : 0};
  transition: opacity 0.3s ease;
`;

const NavItem = styled(Link)<{ isActive: boolean; isOpen: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: white;
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    background: rgba(52, 152, 219, 0.2);
    transform: translateX(2px);
  }
  
  ${props => props.isActive && `
    background: rgba(52, 152, 219, 0.3);
    border-right: 3px solid #3498db;
  `}
  
  .icon {
    font-size: 1.2rem;
    min-width: 20px;
    text-align: center;
  }
  
  .label {
    opacity: ${props => props.isOpen ? 1 : 0};
    transition: opacity 0.3s ease;
    white-space: nowrap;
  }
`;

const MainArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  background: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid #e9ecef;
`;

const HeaderTitle = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  color: #2c3e50;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const UserName = styled.span`
  color: #2c3e50;
  font-weight: 500;
`;

const LogoutButton = styled.button`
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
  }
`;

const MainContent = styled.main`
  flex: 1;
  padding: 2rem;
  background: #f8f9fa;
  overflow-y: auto;
`;

const UserAvatar = styled.div`
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.9rem;
`;

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    const path = location.pathname;
    const titles: { [key: string]: string } = {
      '/dashboard': 'Dashboard',
      '/teams': 'Equipes',
      '/members': 'Membros',
      '/projects': 'Projetos',
      '/profile': 'Perfil',
      '/tasks': 'Tarefas',
      '/kpis': 'KPIs',
      '/notifications': 'Notificações',
      '/goals': 'Metas',
      '/calendar': 'Calendário',
      '/alerts': 'Alertas',
    };
    return titles[path] || 'EPU - Gestão';
  };

  const menuItems = [
    // GERAL
    { section: 'GERAL', items: [
      { path: '/dashboard', icon: '🏠', label: 'Dashboard' },
      { path: '/teams', icon: '👥', label: 'Equipes' },
      { path: '/members', icon: '👤', label: 'Membros' },
      { path: '/projects', icon: '📋', label: 'Projetos' },
    ]},
    // PESSOAL
    { section: 'PESSOAL', items: [
      { path: '/profile', icon: '👤', label: 'Perfil' },
      { path: '/tasks', icon: '📝', label: 'Tarefas' },
    ]},
    // RELATÓRIOS
    { section: 'RELATÓRIOS', items: [
      { path: '/kpis', icon: '📊', label: 'KPIs' },
      { path: '/notifications', icon: '🔔', label: 'Notificações' },
      { path: '/goals', icon: '🎯', label: 'Metas' },
      { path: '/calendar', icon: '📅', label: 'Calendário' },
      { path: '/alerts', icon: '⚠️', label: 'Alertas' },
    ]},
  ];

  const getUserInitials = () => {
    const name = user?.fullName || user?.username || 'User';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <LayoutContainer>
      <Sidebar isOpen={sidebarOpen}>
        <SidebarHeader>
          <Logo>EPU</Logo>
          {sidebarOpen && <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>Gestão</span>}
        </SidebarHeader>
        
        <ToggleButton onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? '←' : '→'}
        </ToggleButton>

        {menuItems.map((section, index) => (
          <NavSection key={index}>
            <SectionTitle isOpen={sidebarOpen}>{section.section}</SectionTitle>
            {section.items.map((item) => (
              <NavItem
                key={item.path}
                to={item.path}
                isActive={location.pathname === item.path}
                isOpen={sidebarOpen}
              >
                <span className="icon">{item.icon}</span>
                <span className="label">{item.label}</span>
              </NavItem>
            ))}
          </NavSection>
        ))}
      </Sidebar>

      <MainArea>
        <Header>
          <HeaderTitle>{getPageTitle()}</HeaderTitle>
          <UserInfo>
            <UserAvatar>{getUserInitials()}</UserAvatar>
            <UserName>Olá, {user?.fullName || user?.username}</UserName>
            <LogoutButton onClick={handleLogout}>Sair</LogoutButton>
          </UserInfo>
        </Header>
        <MainContent>{children}</MainContent>
      </MainArea>
    </LayoutContainer>
  );
};

export default Layout;
