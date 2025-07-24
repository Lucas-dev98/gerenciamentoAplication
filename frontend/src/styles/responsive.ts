import { css } from 'styled-components';

// Breakpoints modernos para responsividade
export const breakpoints = {
  xs: '320px', // Extra small phones
  sm: '576px', // Small phones
  md: '768px', // Tablets
  lg: '992px', // Small desktops
  xl: '1200px', // Large desktops
  xxl: '1400px', // Extra large desktops

  // Legacy support
  mobile: '576px',
  tablet: '768px',
  desktop: '1024px',
  largeDesktop: '1200px',
};

// Media queries helpers modernos
export const device = {
  // Mobile first approach
  xs: `(min-width: ${breakpoints.xs})`,
  sm: `(min-width: ${breakpoints.sm})`,
  md: `(min-width: ${breakpoints.md})`,
  lg: `(min-width: ${breakpoints.lg})`,
  xl: `(min-width: ${breakpoints.xl})`,
  xxl: `(min-width: ${breakpoints.xxl})`,

  // Max-width queries (legacy)
  mobile: `(max-width: ${breakpoints.mobile})`,
  tablet: `(max-width: ${breakpoints.tablet})`,
  desktop: `(max-width: ${breakpoints.desktop})`,
  largeDesktop: `(min-width: ${breakpoints.largeDesktop})`,

  // Between breakpoints
  xsToSm: `(min-width: ${breakpoints.xs}) and (max-width: ${breakpoints.sm})`,
  smToMd: `(min-width: ${breakpoints.sm}) and (max-width: ${breakpoints.md})`,
  mdToLg: `(min-width: ${breakpoints.md}) and (max-width: ${breakpoints.lg})`,
  lgToXl: `(min-width: ${breakpoints.lg}) and (max-width: ${breakpoints.xl})`,

  // Legacy
  mobileToTablet: `(min-width: ${breakpoints.mobile}) and (max-width: ${breakpoints.tablet})`,
  tabletToDesktop: `(min-width: ${breakpoints.tablet}) and (max-width: ${breakpoints.desktop})`,

  // Orientation queries
  landscape: '(orientation: landscape)',
  portrait: '(orientation: portrait)',

  // Pixel density
  retina: '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)',

  // Touch devices
  touch: '(hover: none) and (pointer: coarse)',
  nonTouch: '(hover: hover) and (pointer: fine)',
};

// Container responsivo moderno (mobile-first)
export const responsiveContainer = css`
  width: 100%;
  margin: 0 auto;
  padding: 0 0.75rem; // Mobile first

  // Safe area para dispositivos com notch
  padding-left: max(0.75rem, env(safe-area-inset-left));
  padding-right: max(0.75rem, env(safe-area-inset-right));

  @media ${device.sm} {
    padding: 0 1rem;
    padding-left: max(1rem, env(safe-area-inset-left));
    padding-right: max(1rem, env(safe-area-inset-right));
  }

  @media ${device.md} {
    padding: 0 1.5rem;
    max-width: 720px;
  }

  @media ${device.lg} {
    padding: 0 2rem;
    max-width: 960px;
  }

  @media ${device.xl} {
    max-width: 1140px;
    padding: 0 2rem;
  }

  @media ${device.xxl} {
    max-width: 1320px;
    padding: 0 2.5rem;
  }
`;

// Grid responsivo moderno
export const responsiveGrid = css`
  display: grid;
  gap: 1rem; // Mobile first
  grid-template-columns: 1fr; // Mobile: 1 coluna

  @media ${device.sm} {
    gap: 1.25rem;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }

  @media ${device.md} {
    gap: 1.5rem;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }

  @media ${device.lg} {
    gap: 1.75rem;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }

  @media ${device.xl} {
    gap: 2rem;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  }
`;

// Cards responsivos modernos
export const responsiveCard = css`
  padding: 1rem; // Mobile first
  border-radius: 8px;
  transition: all 0.2s ease-in-out;

  // Touch-friendly na mobile
  min-height: 44px; // Mínimo recomendado para touch

  @media ${device.sm} {
    padding: 1.25rem;
    border-radius: 10px;
  }

  @media ${device.md} {
    padding: 1.5rem;
    border-radius: 12px;
  }

  @media ${device.lg} {
    padding: 1.75rem;
    border-radius: 14px;
  }

  @media ${device.xl} {
    padding: 2rem;
    border-radius: 16px;
  }

  // Hover effects apenas para dispositivos não-touch
  @media ${device.nonTouch} {
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }
  }
`;

// Typography responsiva moderna com escala fluida
export const responsiveTypography = css`
  h1 {
    font-size: clamp(1.5rem, 4vw, 2.5rem); // Escala fluida
    line-height: 1.2;
    font-weight: 700;

    @media ${device.xs} {
      font-size: 1.5rem;
    }

    @media ${device.sm} {
      font-size: 1.75rem;
    }

    @media ${device.md} {
      font-size: 2rem;
    }

    @media ${device.lg} {
      font-size: 2.25rem;
    }

    @media ${device.xl} {
      font-size: 2.5rem;
    }
  }

  h2 {
    font-size: clamp(1.25rem, 3vw, 2rem);
    line-height: 1.3;
    font-weight: 600;

    @media ${device.xs} {
      font-size: 1.25rem;
    }

    @media ${device.sm} {
      font-size: 1.5rem;
    }

    @media ${device.md} {
      font-size: 1.75rem;
    }

    @media ${device.lg} {
      font-size: 1.875rem;
    }

    @media ${device.xl} {
      font-size: 2rem;
    }
  }

  h3 {
    font-size: clamp(1.125rem, 2.5vw, 1.5rem);
    line-height: 1.4;
    font-weight: 600;

    @media ${device.xs} {
      font-size: 1.125rem;
    }

    @media ${device.sm} {
      font-size: 1.25rem;
    }

    @media ${device.md} {
      font-size: 1.375rem;
    }

    @media ${device.lg} {
      font-size: 1.5rem;
    }
  }

  h4 {
    font-size: clamp(1rem, 2vw, 1.25rem);
    line-height: 1.4;
    font-weight: 500;
  }

  p {
    font-size: clamp(0.875rem, 1.5vw, 1rem);
    line-height: 1.6;

    @media ${device.xs} {
      font-size: 0.875rem;
    }

    @media ${device.sm} {
      font-size: 0.9rem;
    }

    @media ${device.md} {
      font-size: 1rem;
    }
  }

  small {
    font-size: clamp(0.75rem, 1.2vw, 0.875rem);
    line-height: 1.5;
  }
`;

// Spacing responsivo moderno
export const responsiveSpacing = css`
  .section-spacing {
    margin-bottom: 1.5rem; // Mobile first

    @media ${device.sm} {
      margin-bottom: 1.75rem;
    }

    @media ${device.md} {
      margin-bottom: 2rem;
    }

    @media ${device.lg} {
      margin-bottom: 2.25rem;
    }

    @media ${device.xl} {
      margin-bottom: 2.5rem;
    }

    @media ${device.xxl} {
      margin-bottom: 3rem;
    }
  }

  .element-spacing {
    margin-bottom: 0.75rem; // Mobile first

    @media ${device.sm} {
      margin-bottom: 1rem;
    }

    @media ${device.md} {
      margin-bottom: 1.25rem;
    }

    @media ${device.lg} {
      margin-bottom: 1.5rem;
    }
  }

  // Padding interno responsivo
  .inner-padding {
    padding: 1rem; // Mobile first

    @media ${device.sm} {
      padding: 1.25rem;
    }

    @media ${device.md} {
      padding: 1.5rem;
    }

    @media ${device.lg} {
      padding: 2rem;
    }

    @media ${device.xl} {
      padding: 2.5rem;
    }
  }

  // Margem vertical responsiva
  .vertical-margin {
    margin-top: 1rem;
    margin-bottom: 1rem;

    @media ${device.sm} {
      margin-top: 1.5rem;
      margin-bottom: 1.5rem;
    }

    @media ${device.md} {
      margin-top: 2rem;
      margin-bottom: 2rem;
    }

    @media ${device.lg} {
      margin-top: 2.5rem;
      margin-bottom: 2.5rem;
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

// Weather section responsivo moderno
export const responsiveWeather = css`
  padding: 1.5rem; // Mobile first

  // Safe area para dispositivos com notch
  padding-top: max(1.5rem, env(safe-area-inset-top));

  @media ${device.sm} {
    padding: 2rem;
  }

  @media ${device.md} {
    padding: 2.5rem;
  }

  @media ${device.lg} {
    padding: 3rem;
  }

  .weather-title {
    font-size: clamp(1.25rem, 3vw, 1.875rem);
    text-align: center;
    line-height: 1.3;
    margin-bottom: 0.5rem;

    @media ${device.xs} {
      font-size: 1.25rem;
      text-align: left;
    }

    @media ${device.sm} {
      font-size: 1.5rem;
      text-align: center;
    }

    @media ${device.md} {
      font-size: 1.75rem;
    }

    @media ${device.lg} {
      font-size: 1.875rem;
    }

    .subtitle {
      font-size: clamp(0.75rem, 1.5vw, 0.9rem);
      opacity: 0.8;
      margin-top: 0.25rem;
      display: block;

      @media ${device.xs} {
        font-size: 0.75rem;
        text-align: left;
      }

      @media ${device.sm} {
        font-size: 0.8rem;
        text-align: center;
      }

      @media ${device.md} {
        font-size: 0.9rem;
      }
    }
  }

  // Current weather display
  .current-weather {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin: 1.5rem 0;

    @media ${device.xs} {
      flex-direction: column;
      gap: 0.75rem;
      margin: 1rem 0;
    }

    @media ${device.sm} {
      flex-direction: row;
      gap: 1rem;
    }

    .weather-icon {
      font-size: clamp(2.5rem, 6vw, 4rem);
    }

    .weather-info {
      text-align: center;

      @media ${device.xs} {
        text-align: center;
      }

      .temperature {
        font-size: clamp(1.5rem, 4vw, 2.5rem);
        font-weight: 700;
        margin: 0;
      }

      .description {
        font-size: clamp(0.875rem, 2vw, 1rem);
        opacity: 0.8;
        margin: 0.25rem 0 0 0;
      }
    }
  }
`;

// Weather controls responsivos modernos
export const responsiveWeatherControls = css`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin: 1.5rem 0;

  @media ${device.xs} {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
    margin: 1rem 0;
  }

  @media ${device.sm} {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }

  @media ${device.md} {
    flex-wrap: nowrap;
    gap: 1.5rem;
  }

  .location-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;

    @media ${device.xs} {
      width: 100%;
    }

    .location-button {
      padding: 0.75rem 1.5rem;
      font-size: 0.875rem;
      border-radius: 25px;
      transition: all 0.2s ease;
      min-height: 44px; // Touch-friendly

      @media ${device.xs} {
        width: 100%;
        padding: 0.875rem 1rem;
        font-size: 0.8rem;
      }

      @media ${device.sm} {
        padding: 0.75rem 1.25rem;
        font-size: 0.85rem;
      }

      // Touch devices - remove hover effects
      @media ${device.touch} {
        &:active {
          transform: scale(0.98);
        }
      }

      // Non-touch devices - add hover effects
      @media ${device.nonTouch} {
        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
      }
    }
  }

  .days-selector {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;

    @media ${device.xs} {
      width: 100%;
    }

    .selector-label {
      font-size: clamp(0.8rem, 1.5vw, 0.9rem);
      font-weight: 500;
      text-align: center;
      opacity: 0.8;
    }
  }

  .quick-buttons {
    display: flex;
    gap: 0.5rem;
    justify-content: center;

    @media ${device.xs} {
      width: 100%;
      gap: 0.4rem;
    }

    @media ${device.sm} {
      gap: 0.6rem;
    }

    @media ${device.md} {
      gap: 0.8rem;
    }
  }

  .quick-btn {
    padding: 0.6rem 1rem;
    font-size: 0.8rem;
    border-radius: 20px;
    transition: all 0.2s ease;
    min-height: 44px; // Touch-friendly
    min-width: 60px;
    font-weight: 500;

    @media ${device.xs} {
      padding: 0.7rem 0.8rem;
      font-size: 0.75rem;
      flex: 1;
      min-width: auto;
    }

    @media ${device.sm} {
      padding: 0.65rem 0.9rem;
      font-size: 0.8rem;
      min-width: 65px;
    }

    @media ${device.md} {
      padding: 0.6rem 1rem;
      font-size: 0.85rem;
      min-width: 70px;
    }

    @media ${device.lg} {
      padding: 0.7rem 1.2rem;
      font-size: 0.9rem;
      min-width: 80px;
    }

    // Touch devices
    @media ${device.touch} {
      &:active {
        transform: scale(0.95);
      }
    }

    // Non-touch devices
    @media ${device.nonTouch} {
      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
    }

    &.active {
      font-weight: 600;
      transform: scale(1.05);

      @media ${device.xs} {
        transform: scale(1.02);
      }
    }
  }

  // Error message styling
  .error-message {
    width: 100%;
    text-align: center;
    padding: 0.75rem;
    border-radius: 8px;
    font-size: 0.875rem;

    @media ${device.xs} {
      font-size: 0.8rem;
      padding: 0.5rem;
    }
  }
`;

// Forecast grid responsivo moderno
export const responsiveForecastGrid = css`
  display: grid;
  gap: 1rem; // Mobile first
  margin-top: 1.5rem;

  // Mobile: 1 card por linha (extra small)
  grid-template-columns: 1fr;

  // Small mobile: 1 card
  @media ${device.xs} {
    gap: 0.875rem;
    margin-top: 1.25rem;
  }

  // Large mobile: 2 cards por linha
  @media ${device.sm} {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-top: 1.5rem;
  }

  // Tablet: 3 cards por linha
  @media ${device.md} {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.25rem;
    margin-top: 1.75rem;
  }

  // Desktop: 4 cards por linha
  @media ${device.lg} {
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
    margin-top: 2rem;
  }

  // Large desktop: auto-fit com mínimo
  @media ${device.xl} {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1.75rem;
  }

  // Extra large: mais espaço
  @media ${device.xxl} {
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 2rem;
    margin-top: 2.5rem;
  }

  // Scroll horizontal para muitos cards em mobile
  @media ${device.xs} {
    &.horizontal-scroll {
      display: flex;
      grid-template-columns: none;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      gap: 0.75rem;
      padding-bottom: 0.5rem;

      // Hide scrollbar but keep functionality
      &::-webkit-scrollbar {
        height: 4px;
      }

      &::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.1);
        border-radius: 2px;
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.3);
        border-radius: 2px;
      }

      > * {
        min-width: 220px;
        scroll-snap-align: start;
      }
    }
  }
`;

// Weather card responsivo moderno
export const responsiveWeatherCard = css`
  padding: 1.25rem 1rem; // Mobile first
  border-radius: 12px;
  transition: all 0.2s ease-in-out;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-height: 200px;
  justify-content: space-between;

  @media ${device.sm} {
    padding: 1.5rem 1.25rem;
    min-height: 220px;
    border-radius: 14px;
  }

  @media ${device.md} {
    padding: 1.75rem 1.5rem;
    min-height: 240px;
    border-radius: 16px;
  }

  @media ${device.lg} {
    padding: 2rem 1.75rem;
    min-height: 260px;
    border-radius: 18px;
  }

  @media ${device.xl} {
    padding: 2.25rem 2rem;
    min-height: 280px;
    border-radius: 20px;
  }

  // Touch-friendly interactions
  @media ${device.touch} {
    &:active {
      transform: scale(0.98);
    }
  }

  // Hover effects for non-touch devices
  @media ${device.nonTouch} {
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }
  }

  .date {
    font-size: clamp(0.8rem, 1.5vw, 1rem);
    font-weight: 600;
    opacity: 0.8;
    margin-bottom: 0.5rem;

    @media ${device.xs} {
      font-size: 0.8rem;
    }

    @media ${device.sm} {
      font-size: 0.85rem;
    }

    @media ${device.md} {
      font-size: 0.9rem;
    }

    @media ${device.lg} {
      font-size: 1rem;
    }
  }

  .icon {
    font-size: clamp(2.5rem, 5vw, 4rem);
    margin: 0.5rem 0;
    line-height: 1;

    @media ${device.xs} {
      font-size: 2.5rem;
      margin: 0.25rem 0;
    }

    @media ${device.sm} {
      font-size: 3rem;
      margin: 0.5rem 0;
    }

    @media ${device.md} {
      font-size: 3.5rem;
    }

    @media ${device.lg} {
      font-size: 4rem;
    }
  }

  .temperature {
    font-size: clamp(1.25rem, 3vw, 2rem);
    font-weight: 700;
    margin: 0.25rem 0;
    line-height: 1;

    @media ${device.xs} {
      font-size: 1.25rem;
    }

    @media ${device.sm} {
      font-size: 1.5rem;
    }

    @media ${device.md} {
      font-size: 1.75rem;
    }

    @media ${device.lg} {
      font-size: 2rem;
    }

    .temp-range {
      display: flex;
      justify-content: center;
      gap: 0.5rem;
      align-items: center;

      .max-temp {
        font-weight: 700;
      }

      .min-temp {
        font-weight: 400;
        opacity: 0.7;
        font-size: 0.85em;
      }

      .separator {
        opacity: 0.5;
        font-weight: 300;
      }
    }
  }

  .description {
    font-size: clamp(0.75rem, 1.5vw, 0.9rem);
    font-weight: 500;
    margin: 0.5rem 0;
    line-height: 1.3;

    @media ${device.xs} {
      font-size: 0.75rem;
    }

    @media ${device.sm} {
      font-size: 0.8rem;
    }

    @media ${device.md} {
      font-size: 0.85rem;
    }

    @media ${device.lg} {
      font-size: 0.9rem;
    }
  }

  .details {
    margin-top: auto;
    width: 100%;
    display: flex;
    justify-content: space-around;
    align-items: center;
    gap: 0.5rem;
    padding-top: 0.75rem;
    border-top: 1px solid rgba(0, 0, 0, 0.1);

    @media ${device.xs} {
      gap: 0.25rem;
      padding-top: 0.5rem;
      flex-direction: column;
    }

    @media ${device.sm} {
      flex-direction: row;
      gap: 0.5rem;
      padding-top: 0.75rem;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.2rem;
      flex: 1;

      @media ${device.xs} {
        flex-direction: row;
        justify-content: space-between;
        width: 100%;
        gap: 0.5rem;
      }

      @media ${device.sm} {
        flex-direction: column;
      }

      .detail-icon {
        font-size: clamp(0.8rem, 1.2vw, 1rem);
        opacity: 0.7;
      }

      .detail-value {
        font-size: clamp(0.7rem, 1vw, 0.8rem);
        font-weight: 500;

        @media ${device.xs} {
          font-size: 0.7rem;
        }

        @media ${device.sm} {
          font-size: 0.75rem;
        }

        @media ${device.md} {
          font-size: 0.8rem;
        }
      }
    }
  }

  // Loading state
  &.loading {
    .icon,
    .temperature,
    .description {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
      border-radius: 4px;

      &::after {
        content: '';
        display: block;
        height: 1em;
        width: 100%;
      }
    }
  }

  @keyframes loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
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

// Sidebar responsivo moderno com menu hamburger
export const responsiveSidebar = css`
  width: 280px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: #ffffff;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;

  @media ${device.sm} {
    width: 250px;
  }

  @media ${device.md} {
    width: 280px;
  }

  // Mobile: sidebar como overlay
  @media ${device.mobile} {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 280px;
    transform: translateX(-100%);
    background: #ffffff;
    box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);
    z-index: 1000;

    &.open {
      transform: translateX(0);
    }

    // Overlay backdrop
    &::before {
      content: '';
      position: fixed;
      top: 0;
      left: 280px;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      z-index: -1;
    }

    &.open::before {
      opacity: 1;
      visibility: visible;
    }
  }

  // Extra small mobile
  @media ${device.xs} {
    width: 90vw;
    max-width: 320px;

    &::before {
      left: 90vw;
    }
  }
`;

// Menu hamburger moderno
export const responsiveHamburgerMenu = css`
  .hamburger-container {
    display: none;

    @media ${device.mobile} {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.75rem;
      z-index: 1001;
      position: relative;
    }
  }

  .hamburger-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 8px;
    transition: all 0.2s ease;
    min-height: 44px;
    min-width: 44px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background: rgba(0, 0, 0, 0.05);
    }

    &:active {
      background: rgba(0, 0, 0, 0.1);
      transform: scale(0.95);
    }
  }

  .hamburger-icon {
    width: 24px;
    height: 18px;
    position: relative;
    cursor: pointer;

    span {
      display: block;
      position: absolute;
      height: 3px;
      width: 100%;
      background: #333;
      border-radius: 2px;
      opacity: 1;
      left: 0;
      transform: rotate(0deg);
      transition: 0.25s ease-in-out;

      &:nth-child(1) {
        top: 0px;
      }

      &:nth-child(2) {
        top: 7px;
      }

      &:nth-child(3) {
        top: 14px;
      }
    }

    // Animação para X quando aberto
    &.open span:nth-child(1) {
      top: 7px;
      transform: rotate(135deg);
    }

    &.open span:nth-child(2) {
      opacity: 0;
      left: -60px;
    }

    &.open span:nth-child(3) {
      top: 7px;
      transform: rotate(-135deg);
    }
  }
`;

// Header mobile melhorado
export const responsiveMobileHeader = css`
  .mobile-header {
    display: none;

    @media ${device.mobile} {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      background: #ffffff;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 999;
      gap: 1rem;
    }

    @media ${device.xs} {
      padding: 0.75rem;
    }

    .mobile-header-content {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex: 1;

      .header-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: #333;
        margin: 0;

        @media ${device.xs} {
          font-size: 1.1rem;
        }
      }

      .header-subtitle {
        font-size: 0.875rem;
        color: #666;
        margin: 0;

        @media ${device.xs} {
          font-size: 0.8rem;
          display: none;
        }
      }
    }

    .mobile-header-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      .action-button {
        background: none;
        border: none;
        padding: 0.5rem;
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.2s ease;
        min-height: 40px;
        min-width: 40px;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
          background: rgba(0, 0, 0, 0.05);
        }

        &:active {
          transform: scale(0.95);
        }

        .icon {
          font-size: 1.25rem;
          color: #555;
        }
      }
    }
  }
`;

// Navigation mobile fluida
export const responsiveMobileNavigation = css`
  .mobile-nav {
    @media ${device.mobile} {
      .nav-list {
        flex-direction: column;
        gap: 0;
        padding: 1rem 0;
      }

      .nav-item {
        width: 100%;
        padding: 1rem 1.5rem;
        border-radius: 0;
        text-align: left;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        transition: all 0.2s ease;
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);

        &:hover {
          background: rgba(0, 0, 0, 0.05);
          padding-left: 2rem;
        }

        &.active {
          background: #f0f7ff;
          border-right: 3px solid #007bff;
          color: #007bff;
          font-weight: 600;
        }

        .nav-icon {
          font-size: 1.25rem;
          min-width: 24px;
          text-align: center;
        }

        .nav-text {
          font-size: 1rem;

          @media ${device.xs} {
            font-size: 0.95rem;
          }
        }

        .nav-badge {
          margin-left: auto;
          background: #dc3545;
          color: white;
          border-radius: 10px;
          padding: 0.2rem 0.5rem;
          font-size: 0.75rem;
          font-weight: 500;
        }
      }
    }
  }
`;

// Bottom navigation para mobile (alternativa)
export const responsiveBottomNavigation = css`
  .bottom-nav {
    display: none;

    @media ${device.mobile} {
      display: flex;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: #ffffff;
      box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
      padding: 0.5rem 0;
      z-index: 998;

      // Safe area para dispositivos com notch
      padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
    }

    .bottom-nav-list {
      display: flex;
      width: 100%;
      justify-content: space-around;
      align-items: center;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .bottom-nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0.5rem;
      min-width: 60px;
      text-decoration: none;
      color: #666;
      transition: all 0.2s ease;
      border-radius: 8px;

      &:hover {
        background: rgba(0, 0, 0, 0.05);
      }

      &.active {
        color: #007bff;

        .bottom-nav-icon {
          transform: scale(1.1);
        }
      }

      .bottom-nav-icon {
        font-size: 1.5rem;
        margin-bottom: 0.25rem;
        transition: transform 0.2s ease;
      }

      .bottom-nav-text {
        font-size: 0.75rem;
        font-weight: 500;
        text-align: center;
        line-height: 1.2;
      }

      .bottom-nav-badge {
        position: absolute;
        top: 0.25rem;
        right: 0.25rem;
        background: #dc3545;
        color: white;
        border-radius: 50%;
        width: 18px;
        height: 18px;
        font-size: 0.7rem;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
      }
    }
  }

  // Adicionar padding bottom ao main content quando bottom nav está ativa
  .main-content-with-bottom-nav {
    @media ${device.mobile} {
      padding-bottom: 5rem; // Espaço para o bottom nav
    }
  }
`;

// Swipe gestures para mobile
export const responsiveSwipeGestures = css`
  .swipe-container {
    @media ${device.mobile} {
      touch-action: pan-x pan-y;
      overflow-x: hidden;

      &.swipe-enabled {
        .swipe-content {
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        &.swiping .swipe-content {
          transition: none;
        }
      }
    }
  }
`;

// Pull to refresh
export const responsivePullToRefresh = css`
  .pull-refresh-container {
    @media ${device.mobile} {
      position: relative;
      overflow-y: auto;

      .pull-refresh-indicator {
        position: absolute;
        top: -60px;
        left: 50%;
        transform: translateX(-50%);
        background: #ffffff;
        border-radius: 30px;
        padding: 0.75rem 1.5rem;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.3s ease;
        z-index: 100;

        &.visible {
          top: 20px;
        }

        &.loading {
          .refresh-icon {
            animation: spin 1s linear infinite;
          }
        }

        .refresh-icon {
          font-size: 1.25rem;
          color: #007bff;
        }

        .refresh-text {
          font-size: 0.875rem;
          color: #555;
          font-weight: 500;
        }
      }
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
`;

// Fab button para mobile
export const responsiveFabButton = css`
  .fab-button {
    display: none;

    @media ${device.mobile} {
      display: flex;
      position: fixed;
      bottom: 5rem;
      right: 1rem;
      width: 56px;
      height: 56px;
      background: #007bff;
      border-radius: 50%;
      border: none;
      box-shadow: 0 4px 20px rgba(0, 123, 255, 0.3);
      cursor: pointer;
      align-items: center;
      justify-content: center;
      z-index: 997;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      // Safe area
      bottom: max(5rem, calc(5rem + env(safe-area-inset-bottom)));
      right: max(1rem, env(safe-area-inset-right));

      &:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 25px rgba(0, 123, 255, 0.4);
      }

      &:active {
        transform: scale(0.95);
      }

      .fab-icon {
        font-size: 1.5rem;
        color: white;
      }

      // Variações de cores
      &.secondary {
        background: #6c757d;
        box-shadow: 0 4px 20px rgba(108, 117, 125, 0.3);
      }

      &.success {
        background: #28a745;
        box-shadow: 0 4px 20px rgba(40, 167, 69, 0.3);
      }

      &.danger {
        background: #dc3545;
        box-shadow: 0 4px 20px rgba(220, 53, 69, 0.3);
      }
    }

    @media ${device.xs} {
      width: 48px;
      height: 48px;
      bottom: 4.5rem;

      .fab-icon {
        font-size: 1.25rem;
      }
    }
  }
`;

// Mobile optimized cards
export const responsiveMobileCards = css`
  .mobile-card {
    @media ${device.mobile} {
      margin: 0 -1rem;
      border-radius: 0;
      border-left: none;
      border-right: none;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

      &:first-child {
        border-top: none;
        margin-top: -1rem;
      }

      &:last-child {
        border-bottom: none;
        margin-bottom: -1rem;
      }

      // Card com bordas arredondadas apenas no topo/bottom
      &.rounded-mobile {
        margin: 0;
        border-radius: 12px;
        border: 1px solid rgba(0, 0, 0, 0.1);
      }
    }

    @media ${device.xs} {
      .card-content {
        padding: 1rem;
      }

      .card-title {
        font-size: 1.1rem;
      }

      .card-subtitle {
        font-size: 0.85rem;
      }
    }
  }
`;

// Toast notifications para mobile
export const responsiveMobileToast = css`
  .toast-container {
    @media ${device.mobile} {
      position: fixed;
      top: 1rem;
      left: 1rem;
      right: 1rem;
      z-index: 1050;

      // Safe area
      top: max(1rem, env(safe-area-inset-top));
      left: max(1rem, env(safe-area-inset-left));
      right: max(1rem, env(safe-area-inset-right));
    }

    .toast {
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      padding: 1rem;
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      animation: slideInDown 0.3s ease;

      &.success {
        border-left: 4px solid #28a745;
      }

      &.error {
        border-left: 4px solid #dc3545;
      }

      &.warning {
        border-left: 4px solid #ffc107;
      }

      &.info {
        border-left: 4px solid #17a2b8;
      }

      .toast-icon {
        font-size: 1.25rem;
        min-width: 24px;
      }

      .toast-content {
        flex: 1;

        .toast-title {
          font-weight: 600;
          margin-bottom: 0.25rem;
          font-size: 0.9rem;
        }

        .toast-message {
          font-size: 0.85rem;
          color: #666;
          line-height: 1.4;
        }
      }

      .toast-close {
        background: none;
        border: none;
        padding: 0.25rem;
        cursor: pointer;
        color: #999;
        border-radius: 50%;
        min-width: 32px;
        min-height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
          background: rgba(0, 0, 0, 0.05);
        }
      }
    }
  }

  @keyframes slideInDown {
    from {
      transform: translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
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

// ===== NOVOS ESTILOS MODERNOS =====

// Modal responsivo
export const responsiveModal = css`
  .modal-content {
    width: 90vw;
    max-width: 500px;
    margin: 2rem auto;

    @media ${device.xs} {
      width: 95vw;
      margin: 1rem auto;
      max-height: 90vh;
      overflow-y: auto;
    }

    @media ${device.sm} {
      width: 85vw;
      margin: 1.5rem auto;
    }

    @media ${device.md} {
      width: 600px;
      margin: 2rem auto;
    }

    @media ${device.lg} {
      width: 700px;
      margin: 3rem auto;
    }
  }
`;

// Form responsivo
export const responsiveForm = css`
  .form-group {
    margin-bottom: 1rem;

    @media ${device.xs} {
      margin-bottom: 0.75rem;
    }

    @media ${device.sm} {
      margin-bottom: 1rem;
    }

    @media ${device.md} {
      margin-bottom: 1.25rem;
    }
  }

  .form-row {
    display: grid;
    gap: 1rem;
    grid-template-columns: 1fr;

    @media ${device.sm} {
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
    }

    @media ${device.md} {
      gap: 1.5rem;
    }

    &.three-cols {
      @media ${device.md} {
        grid-template-columns: 1fr 1fr 1fr;
      }
    }
  }

  input,
  textarea,
  select {
    width: 100%;
    padding: 0.75rem;
    border-radius: 8px;
    font-size: 1rem;

    @media ${device.xs} {
      padding: 0.6rem;
      font-size: 0.9rem;
    }

    @media ${device.sm} {
      padding: 0.75rem;
      font-size: 1rem;
    }
  }

  label {
    font-size: 0.9rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
    display: block;

    @media ${device.xs} {
      font-size: 0.85rem;
    }
  }
`;

// Navigation responsiva
export const responsiveNavigation = css`
  .nav-list {
    display: flex;
    gap: 1rem;

    @media ${device.xs} {
      flex-direction: column;
      gap: 0.5rem;
    }

    @media ${device.sm} {
      flex-direction: row;
      gap: 0.75rem;
    }

    @media ${device.md} {
      gap: 1rem;
    }

    @media ${device.lg} {
      gap: 1.5rem;
    }
  }

  .nav-item {
    padding: 0.5rem 1rem;
    border-radius: 6px;
    transition: all 0.2s ease;

    @media ${device.xs} {
      padding: 0.6rem 0.8rem;
      text-align: center;
    }

    @media ${device.sm} {
      padding: 0.5rem 1rem;
    }

    @media ${device.md} {
      padding: 0.6rem 1.2rem;
    }
  }
`;

// Table responsiva
export const responsiveTable = css`
  overflow-x: auto;

  table {
    width: 100%;
    min-width: 600px;

    @media ${device.xs} {
      min-width: 500px;
      font-size: 0.85rem;
    }

    @media ${device.sm} {
      min-width: 600px;
      font-size: 0.9rem;
    }

    @media ${device.md} {
      min-width: 700px;
      font-size: 1rem;
    }
  }

  th,
  td {
    padding: 0.75rem;

    @media ${device.xs} {
      padding: 0.5rem;
    }

    @media ${device.sm} {
      padding: 0.6rem;
    }

    @media ${device.md} {
      padding: 0.75rem;
    }

    @media ${device.lg} {
      padding: 1rem;
    }
  }
`;

// Image responsiva
export const responsiveImage = css`
  img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;

    @media ${device.xs} {
      border-radius: 6px;
    }

    @media ${device.md} {
      border-radius: 10px;
    }

    @media ${device.lg} {
      border-radius: 12px;
    }
  }

  .image-gallery {
    display: grid;
    gap: 1rem;
    grid-template-columns: 1fr;

    @media ${device.sm} {
      grid-template-columns: repeat(2, 1fr);
    }

    @media ${device.md} {
      grid-template-columns: repeat(3, 1fr);
    }

    @media ${device.lg} {
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
    }
  }
`;

// Utilities modernos
export const responsiveUtilities = css`
  // Scroll suave
  .smooth-scroll {
    scroll-behavior: smooth;
  }

  // Safe area support
  .safe-area-padding {
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
  }

  // Focus states para acessibilidade
  .focus-outline {
    &:focus {
      outline: 2px solid #007bff;
      outline-offset: 2px;
    }

    &:focus:not(:focus-visible) {
      outline: none;
    }
  }

  // Touch-friendly
  .touch-friendly {
    min-height: 44px;
    min-width: 44px;

    @media ${device.touch} {
      min-height: 48px;
      min-width: 48px;
    }
  }

  // High contrast support
  @media (prefers-contrast: high) {
    .high-contrast {
      border: 2px solid currentColor;
    }
  }

  // Reduced motion support
  @media (prefers-reduced-motion: reduce) {
    .respect-motion {
      animation: none !important;
      transition: none !important;
    }
  }

  // Dark mode support
  @media (prefers-color-scheme: dark) {
    .auto-dark {
      background-color: #1a1a1a;
      color: #ffffff;
    }
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
  // Novos estilos gerais
  responsiveModal,
  responsiveForm,
  responsiveNavigation,
  responsiveTable,
  responsiveImage,
  responsiveUtilities,
  // Novos estilos mobile
  responsiveHamburgerMenu,
  responsiveMobileHeader,
  responsiveMobileNavigation,
  responsiveBottomNavigation,
  responsiveSwipeGestures,
  responsivePullToRefresh,
  responsiveFabButton,
  responsiveMobileCards,
  responsiveMobileToast,
};
