import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  responsiveSidebar,
  responsiveHamburgerMenu,
  responsiveMobileHeader,
  responsiveMobileNavigation,
  responsiveBottomNavigation,
  responsiveFabButton,
  device,
} from '../styles/responsive';

// Styled Components
const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
`;

const Sidebar = styled.aside<{ isOpen: boolean }>`
  ${responsiveSidebar}

  @media ${device.mobile} {
    ${(props) => (props.isOpen ? '&.open' : '')}
    background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
    box-shadow:
      0 25px 50px rgba(0, 0, 0, 0.15),
      0 10px 20px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(20px);
  }
`;

const MainContent = styled.main<{ sidebarOpen: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);

  @media ${device.mobile} {
    width: 100%;
    ${(props) =>
      props.sidebarOpen &&
      `
      filter: blur(3px);
      pointer-events: none;
      transform: scale(0.98);
    `}
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
`;

const MobileHeader = styled.header`
  ${responsiveMobileHeader}

  @media ${device.mobile} {
    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.08),
      0 2px 16px rgba(0, 0, 0, 0.04);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(52, 152, 219, 0.08);
    height: 70px;

    .mobile-header-content {
      flex: 1;
      text-align: center;
    }

    .header-title {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 700;
      color: #2c3e50;
      letter-spacing: -0.01em;
      background: linear-gradient(135deg, #2c3e50, #3498db);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .header-subtitle {
      margin: 0.125rem 0 0 0;
      font-size: 0.75rem;
      color: #7f8c8d;
      font-weight: 500;
    }

    .mobile-header-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .action-button {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: linear-gradient(
        135deg,
        rgba(52, 152, 219, 0.1),
        rgba(46, 204, 113, 0.05)
      );
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);

      &:hover {
        transform: translateY(-2px) scale(1.05);
        background: linear-gradient(
          135deg,
          rgba(52, 152, 219, 0.15),
          rgba(46, 204, 113, 0.08)
        );
        box-shadow: 0 8px 16px rgba(52, 152, 219, 0.2);
      }

      .icon {
        font-size: 1.25rem;
        filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
      }
    }
  }
`;

const HamburgerContainer = styled.div`
  ${responsiveHamburgerMenu}

  @media ${device.mobile} {
    .hamburger-button {
      width: 44px;
      height: 44px;
      background: linear-gradient(
        135deg,
        rgba(52, 152, 219, 0.1),
        rgba(46, 204, 113, 0.05)
      );
      border: none;
      cursor: pointer;
      border-radius: 12px;
      transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        transform: translateY(-2px) scale(1.05);
        background: linear-gradient(
          135deg,
          rgba(52, 152, 219, 0.15),
          rgba(46, 204, 113, 0.08)
        );
        box-shadow: 0 8px 16px rgba(52, 152, 219, 0.2);
      }
    }

    .hamburger-icon {
      width: 24px;
      height: 18px;
      position: relative;
      transition: 0.4s ease-in-out;

      span {
        display: block;
        position: absolute;
        height: 3px;
        width: 100%;
        background: linear-gradient(135deg, #2c3e50, #3498db);
        border-radius: 2px;
        opacity: 1;
        left: 0;
        transition: 0.3s ease-in-out;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);

        &:nth-child(1) {
          top: 0px;
          transform-origin: left center;
        }

        &:nth-child(2) {
          top: 7px;
          transform-origin: left center;
        }

        &:nth-child(3) {
          top: 14px;
          transform-origin: left center;
        }
      }

      &.open {
        span {
          &:nth-child(1) {
            transform: rotate(45deg);
            top: 0px;
            left: 4px;
          }

          &:nth-child(2) {
            width: 0%;
            opacity: 0;
          }

          &:nth-child(3) {
            transform: rotate(-45deg);
            top: 16px;
            left: 4px;
          }
        }
      }
    }
  }
`;

const SidebarContent = styled.div`
  ${responsiveMobileNavigation}
  height: 100%;
  overflow-y: auto;
  background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(52, 152, 219, 0.05);
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #3498db, #2980b9);
    border-radius: 2px;

    &:hover {
      background: linear-gradient(135deg, #2980b9, #1f5f8b);
    }
  }

  .sidebar-header {
    padding: 1.5rem 1rem 1rem 1rem;
    border-bottom: 1px solid rgba(52, 152, 219, 0.08);
    background: linear-gradient(
      135deg,
      rgba(52, 152, 219, 0.02),
      rgba(46, 204, 113, 0.01)
    );

    .logo {
      font-size: 1.5rem;
      font-weight: 800;
      background: linear-gradient(135deg, #2c3e50, #3498db);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 0.5rem;
    }

    .subtitle {
      font-size: 0.875rem;
      color: #7f8c8d;
      font-weight: 500;
    }
  }

  .nav-menu {
    padding: 1rem 0;

    .nav-section {
      margin-bottom: 1.5rem;

      .section-title {
        font-size: 0.75rem;
        color: #95a5a6;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding: 0 1rem 0.75rem 1rem;
        margin: 0;
      }

      .nav-item {
        display: flex;
        align-items: center;
        padding: 0.75rem 1rem;
        color: #2c3e50;
        text-decoration: none;
        transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        position: relative;
        margin: 0 0.5rem;
        border-radius: 12px;

        &:before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 0;
          background: linear-gradient(135deg, #3498db, #2980b9);
          border-radius: 12px 0 0 12px;
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        &:hover {
          background: linear-gradient(
            135deg,
            rgba(52, 152, 219, 0.05),
            rgba(46, 204, 113, 0.02)
          );
          transform: translateX(4px);

          &:before {
            width: 3px;
          }
        }

        &.active {
          background: linear-gradient(
            135deg,
            rgba(52, 152, 219, 0.1),
            rgba(46, 204, 113, 0.05)
          );
          color: #2c3e50;

          &:before {
            width: 3px;
          }

          .nav-icon {
            color: #3498db;
          }
        }

        .nav-icon {
          font-size: 1.25rem;
          margin-right: 0.75rem;
          color: #7f8c8d;
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.05));
        }

        .nav-text {
          font-weight: 500;
          font-size: 0.9rem;
        }
      }
    }
  }
`;

const Overlay = styled.div<{ show: boolean }>`
  display: none;

  @media ${device.mobile} {
    display: ${(props) => (props.show ? 'block' : 'none')};
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      rgba(44, 62, 80, 0.8) 0%,
      rgba(52, 152, 219, 0.6) 100%
    );
    backdrop-filter: blur(8px);
    z-index: 999;
    animation: fadeIn 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    cursor: pointer;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      backdrop-filter: blur(0px);
    }
    to {
      opacity: 1;
      backdrop-filter: blur(8px);
    }
  }
`;

const BottomNav = styled.nav`
  ${responsiveBottomNavigation}

  @media ${device.mobile} {
    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
    border-top: 1px solid rgba(52, 152, 219, 0.08);
    backdrop-filter: blur(20px);
    box-shadow:
      0 -8px 32px rgba(0, 0, 0, 0.08),
      0 -2px 16px rgba(0, 0, 0, 0.04);

    .bottom-nav-container {
      display: flex;
      justify-content: space-around;
      align-items: center;
      padding: 8px 16px 8px;
      min-height: 60px;
      position: relative;
    }

    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 8px 12px;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      background: transparent;
      border: none;
      position: relative;
      overflow: hidden;
      min-width: 60px;

      &:before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        background: radial-gradient(
          circle,
          rgba(52, 152, 219, 0.2) 0%,
          transparent 70%
        );
        border-radius: 50%;
        transform: translate(-50%, -50%);
        transition: all 0.4s ease;
        z-index: 0;
      }

      &:hover {
        transform: translateY(-2px);
        background: linear-gradient(
          135deg,
          rgba(52, 152, 219, 0.08),
          rgba(46, 204, 113, 0.05)
        );

        &:before {
          width: 100px;
          height: 100px;
        }
      }

      &.active {
        background: linear-gradient(
          135deg,
          rgba(52, 152, 219, 0.1),
          rgba(46, 204, 113, 0.05)
        );
        transform: translateY(-1px);

        .nav-icon {
          color: #3498db;
          transform: scale(1.1);
        }

        .nav-label {
          color: #2c3e50;
          font-weight: 600;
        }
      }
    }

    .nav-icon {
      font-size: 1.5rem;
      color: #7f8c8d;
      transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.05));
      z-index: 1;
    }

    .nav-label {
      font-size: 0.75rem;
      color: #95a5a6;
      font-weight: 500;
      letter-spacing: 0.01em;
      transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      z-index: 1;
    }
  }
`;

const FabButton = styled.button`
  ${responsiveFabButton}

  @media ${device.mobile} {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: linear-gradient(135deg, #3498db, #2980b9);
    border: none;
    cursor: pointer;
    box-shadow:
      0 8px 24px rgba(52, 152, 219, 0.3),
      0 4px 12px rgba(52, 152, 219, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    bottom: 90px;
    right: 20px;
    z-index: 1000;
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);

    &:before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      background: radial-gradient(
        circle,
        rgba(255, 255, 255, 0.4) 0%,
        transparent 70%
      );
      border-radius: 50%;
      transform: translate(-50%, -50%);
      transition: all 0.6s ease;
      animation: fabPulse 3s infinite;
    }

    &:hover {
      transform: translateY(-3px) rotate(5deg) scale(1.05);
      box-shadow:
        0 12px 32px rgba(52, 152, 219, 0.4),
        0 6px 16px rgba(52, 152, 219, 0.3);

      &:before {
        width: 80px;
        height: 80px;
      }
    }

    &:active {
      transform: translateY(-1px) scale(0.95);
    }

    .fab-icon {
      font-size: 1.5rem;
      color: white;
      transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
      z-index: 1;
    }
  }

  @keyframes fabPulse {
    0%,
    100% {
      box-shadow:
        0 8px 24px rgba(52, 152, 219, 0.3),
        0 4px 12px rgba(52, 152, 219, 0.2),
        0 0 0 0 rgba(52, 152, 219, 0.4);
    }
    50% {
      box-shadow:
        0 8px 24px rgba(52, 152, 219, 0.3),
        0 4px 12px rgba(52, 152, 219, 0.2),
        0 0 0 8px rgba(52, 152, 219, 0);
    }
  }
`;

// Interface para os itens de navegação
interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number;
}

interface MobileLayoutProps {
  children: React.ReactNode;
  currentPage?: string;
  navItems: NavItem[];
  onNavigate: (path: string) => void;
  showBottomNav?: boolean;
  showFab?: boolean;
  onFabClick?: () => void;
  headerTitle?: string;
  headerSubtitle?: string;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  currentPage = '',
  navItems,
  onNavigate,
  showBottomNav = false,
  showFab = false,
  onFabClick,
  headerTitle = 'EPU Gestão',
  headerSubtitle = 'Dashboard',
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fechar sidebar ao clicar no overlay
  const handleOverlayClick = () => {
    setSidebarOpen(false);
  };

  // Fechar sidebar ao navegar (mobile)
  const handleNavigation = (path: string) => {
    if (isMobile) {
      setSidebarOpen(false);
    }
    onNavigate(path);
  };

  // Prevenir scroll do body quando sidebar está aberta
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

  return (
    <LayoutContainer>
      {/* Overlay para mobile */}
      <Overlay show={sidebarOpen && isMobile} onClick={handleOverlayClick} />

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} className={sidebarOpen ? 'open' : ''}>
        <SidebarContent className="mobile-nav">
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
                  className={`nav-item ${currentPage === item.path ? 'active' : ''}`}
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
        </SidebarContent>
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
              <h1 className="header-title">{headerTitle}</h1>
              <p className="header-subtitle">{headerSubtitle}</p>
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

        {/* Conteúdo da Página */}
        <div
          style={{
            flex: 1,
            padding: isMobile ? '1rem' : '1.5rem',
            paddingBottom: showBottomNav && isMobile ? '6rem' : undefined,
          }}
        >
          {children}
        </div>
      </MainContent>

      {/* Bottom Navigation (Opcional) */}
      {showBottomNav && (
        <BottomNav className="bottom-nav">
          <ul className="bottom-nav-list">
            {navItems.slice(0, 5).map((item) => (
              <li key={`bottom-${item.id}`}>
                <button
                  className={`bottom-nav-item ${currentPage === item.path ? 'active' : ''}`}
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
        </BottomNav>
      )}

      {/* FAB Button (Opcional) */}
      {showFab && onFabClick && (
        <FabButton className="fab-button" onClick={onFabClick}>
          <span className="fab-icon">➕</span>
        </FabButton>
      )}
    </LayoutContainer>
  );
};

// Hook personalizado para controle do layout mobile
export const useMobileLayout = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    'portrait'
  );

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth <= 768);
      setOrientation(
        window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      );
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    window.addEventListener('orientationchange', checkDevice);

    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
    };
  }, []);

  return { isMobile, orientation };
};

export default MobileLayout;
