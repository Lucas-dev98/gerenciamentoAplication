import { css } from 'styled-components';

// Breakpoints para responsividade
export const breakpoints = {
  mobile: '480px',
  tablet: '768px',
  desktop: '1024px',
  largeDesktop: '1200px',
};

// Media queries helpers
export const device = {
  mobile: `(max-width: ${breakpoints.mobile})`,
  tablet: `(max-width: ${breakpoints.tablet})`,
  desktop: `(max-width: ${breakpoints.desktop})`,
  largeDesktop: `(min-width: ${breakpoints.largeDesktop})`,

  // Between breakpoints
  mobileToTablet: `(min-width: ${breakpoints.mobile}) and (max-width: ${breakpoints.tablet})`,
  tabletToDesktop: `(min-width: ${breakpoints.tablet}) and (max-width: ${breakpoints.desktop})`,
};

// Container responsivo
export const responsiveContainer = css`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;

  @media ${device.mobile} {
    padding: 0 0.75rem;
  }

  @media ${device.tablet} {
    padding: 0 1.5rem;
  }

  @media ${device.largeDesktop} {
    max-width: 1400px;
    padding: 0 2rem;
  }
`;

// Grid responsivo
export const responsiveGrid = css`
  display: grid;
  gap: 1.5rem;

  // Mobile: 1 coluna
  grid-template-columns: 1fr;

  // Tablet: 2 colunas
  @media (min-width: ${breakpoints.tablet}) {
    grid-template-columns: repeat(2, 1fr);
  }

  // Desktop: 3-4 colunas dependendo do conteúdo
  @media (min-width: ${breakpoints.desktop}) {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
  }

  @media ${device.mobile} {
    gap: 1rem;
  }
`;

// Cards responsivos
export const responsiveCard = css`
  padding: 1.5rem;
  border-radius: 12px;

  @media ${device.mobile} {
    padding: 1rem;
    border-radius: 8px;
  }

  @media ${device.tablet} {
    padding: 1.25rem;
    border-radius: 10px;
  }
`;

// Typography responsiva
export const responsiveTypography = css`
  h1 {
    font-size: 2.2rem;

    @media ${device.mobile} {
      font-size: 1.6rem;
    }

    @media ${device.tablet} {
      font-size: 1.8rem;
    }
  }

  h2 {
    font-size: 1.8rem;

    @media ${device.mobile} {
      font-size: 1.4rem;
    }

    @media ${device.tablet} {
      font-size: 1.6rem;
    }
  }

  h3 {
    font-size: 1.4rem;

    @media ${device.mobile} {
      font-size: 1.2rem;
    }
  }

  p {
    font-size: 1rem;

    @media ${device.mobile} {
      font-size: 0.9rem;
    }
  }
`;

// Spacing responsivo
export const responsiveSpacing = css`
  .section-spacing {
    margin-bottom: 2rem;

    @media ${device.mobile} {
      margin-bottom: 1.5rem;
    }

    @media ${device.tablet} {
      margin-bottom: 1.75rem;
    }

    @media ${device.largeDesktop} {
      margin-bottom: 2.5rem;
    }
  }

  .element-spacing {
    margin-bottom: 1rem;

    @media ${device.mobile} {
      margin-bottom: 0.75rem;
    }
  }
`;

// Flex layouts responsivos
export const responsiveFlex = css`
  display: flex;
  gap: 1rem;

  @media ${device.mobile} {
    flex-direction: column;
    gap: 0.75rem;
  }

  @media ${device.tablet} {
    flex-wrap: wrap;
    gap: 1rem;
  }
`;

// Header responsivo
export const responsiveHeader = css`
  padding: 2rem;

  @media ${device.mobile} {
    padding: 1rem;
  }

  @media ${device.tablet} {
    padding: 1.5rem;
  }

  .header-content {
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
  }

  .time-info {
    text-align: right;

    @media ${device.mobile} {
      text-align: left;
      width: 100%;
    }

    @media ${device.tablet} {
      text-align: center;
    }
  }
`;

// Weather section responsivo
export const responsiveWeather = css`
  padding: 2.5rem;

  @media ${device.mobile} {
    padding: 1rem;
  }

  @media ${device.tablet} {
    padding: 1.5rem;
  }

  .weather-title {
    font-size: 1.8rem;
    text-align: center;

    @media ${device.mobile} {
      font-size: 1.4rem;
      text-align: left;
    }

    @media ${device.tablet} {
      font-size: 1.6rem;
    }

    .subtitle {
      font-size: 0.9rem;

      @media ${device.mobile} {
        font-size: 0.8rem;
      }
    }
  }
`;

// Weather controls responsivos
export const responsiveWeatherControls = css`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;

  @media ${device.mobile} {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  @media ${device.tablet} {
    flex-wrap: wrap;
    justify-content: center;
  }

  .days-selector {
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
    font-size: 0.9rem;
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
  }
`;

// Forecast grid responsivo
export const responsiveForecastGrid = css`
  display: grid;
  gap: 1.5rem;
  margin-top: 2rem;

  // Mobile: 1 card por linha
  grid-template-columns: 1fr;

  // Tablet: 2 cards por linha
  @media (min-width: ${breakpoints.mobile}) and (max-width: ${breakpoints.tablet}) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  // Desktop pequeno: 3 cards por linha
  @media (min-width: ${breakpoints.tablet}) and (max-width: ${breakpoints.desktop}) {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.25rem;
  }

  // Desktop grande: 4+ cards por linha
  @media (min-width: ${breakpoints.desktop}) {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1.5rem;
  }

  @media ${device.mobile} {
    margin-top: 1.5rem;
  }
`;

// Weather card responsivo
export const responsiveWeatherCard = css`
  padding: 2rem 1.5rem;

  @media ${device.mobile} {
    padding: 1.25rem 1rem;
  }

  @media ${device.tablet} {
    padding: 1.5rem 1.25rem;
  }

  .date {
    font-size: 1rem;

    @media ${device.mobile} {
      font-size: 0.9rem;
    }
  }

  .icon {
    font-size: 3.5rem;

    @media ${device.mobile} {
      font-size: 2.5rem;
    }

    @media ${device.tablet} {
      font-size: 3rem;
    }
  }

  .temperature {
    font-size: 1.8rem;

    @media ${device.mobile} {
      font-size: 1.4rem;
    }

    @media ${device.tablet} {
      font-size: 1.6rem;
    }
  }

  .description {
    font-size: 1rem;

    @media ${device.mobile} {
      font-size: 0.9rem;
    }
  }

  .details {
    margin-top: 1.2rem;

    @media ${device.mobile} {
      margin-top: 1rem;

      span {
        font-size: 0.75rem;

        .icon {
          font-size: 1rem;
        }
      }
    }
  }
`;

// Loading card responsivo
export const responsiveLoadingCard = css`
  padding: 3rem 2rem;

  @media ${device.mobile} {
    padding: 2rem 1rem;
  }

  @media ${device.tablet} {
    padding: 2.5rem 1.5rem;
  }

  .loading-text {
    font-size: 1.3rem;

    @media ${device.mobile} {
      font-size: 1.1rem;
    }

    @media ${device.tablet} {
      font-size: 1.2rem;
    }
  }

  .loading-subtitle {
    font-size: 1rem;

    @media ${device.mobile} {
      font-size: 0.9rem;
    }
  }
`;

// Stats grid responsivo
export const responsiveStatsGrid = css`
  display: grid;
  gap: 1.5rem;
  margin-bottom: 2rem;

  // Mobile: 1 coluna
  grid-template-columns: 1fr;

  // Tablet: 2 colunas
  @media (min-width: ${breakpoints.mobile}) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
  }

  // Desktop: 3-4 colunas
  @media (min-width: ${breakpoints.tablet}) {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
  }

  @media ${device.mobile} {
    margin-bottom: 1.5rem;
  }
`;

// Stat card responsivo
export const responsiveStatCard = css`
  padding: 1.5rem;

  @media ${device.mobile} {
    padding: 1rem;
  }

  @media ${device.tablet} {
    padding: 1.25rem;
  }

  .stat-title {
    font-size: 0.9rem;

    @media ${device.mobile} {
      font-size: 0.8rem;
    }
  }

  .stat-value {
    font-size: 2.5rem;

    @media ${device.mobile} {
      font-size: 2rem;
    }

    @media ${device.tablet} {
      font-size: 2.25rem;
    }
  }

  .stat-change {
    font-size: 0.8rem;

    @media ${device.mobile} {
      font-size: 0.75rem;
    }
  }
`;

// Sidebar responsivo (para Layout)
export const responsiveSidebar = css`
  width: 280px;
  transition: all 0.3s ease;

  @media ${device.tablet} {
    width: 250px;
  }

  @media ${device.mobile} {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 1000;
    transform: translateX(-100%);

    &.open {
      transform: translateX(0);
    }
  }
`;

// Main content responsivo
export const responsiveMainContent = css`
  flex: 1;
  padding: 1.5rem;

  @media ${device.mobile} {
    padding: 1rem;
  }

  @media ${device.tablet} {
    padding: 1.25rem;
  }

  @media ${device.largeDesktop} {
    padding: 2rem;
  }
`;

// Button responsivo
export const responsiveButton = css`
  padding: 0.8rem 1.5rem;
  font-size: 0.9rem;

  @media ${device.mobile} {
    padding: 0.6rem 1rem;
    font-size: 0.8rem;
    width: 100%;
  }

  @media ${device.tablet} {
    padding: 0.7rem 1.25rem;
    font-size: 0.85rem;
  }
`;

// Utility classes
export const hiddenMobile = css`
  @media ${device.mobile} {
    display: none !important;
  }
`;

export const hiddenTablet = css`
  @media ${device.tablet} {
    display: none !important;
  }
`;

export const hiddenDesktop = css`
  @media (min-width: ${breakpoints.desktop}) {
    display: none !important;
  }
`;

export const showMobileOnly = css`
  display: none;

  @media ${device.mobile} {
    display: block;
  }
`;

export const showTabletOnly = css`
  display: none;

  @media ${device.mobileToTablet} {
    display: block;
  }
`;

export default {
  breakpoints,
  device,
  responsiveContainer,
  responsiveGrid,
  responsiveCard,
  responsiveTypography,
  responsiveSpacing,
  responsiveFlex,
  responsiveHeader,
  responsiveWeather,
  responsiveWeatherControls,
  responsiveForecastGrid,
  responsiveWeatherCard,
  responsiveLoadingCard,
  responsiveStatsGrid,
  responsiveStatCard,
  responsiveSidebar,
  responsiveMainContent,
  responsiveButton,
  hiddenMobile,
  hiddenTablet,
  hiddenDesktop,
  showMobileOnly,
  showTabletOnly,
};
