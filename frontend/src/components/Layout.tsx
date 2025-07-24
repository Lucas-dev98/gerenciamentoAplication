import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  device,
  responsiveSidebar,
  responsiveHamburgerMenu,
  responsiveMobileHeader,
  responsiveMobileNavigation,
  responsiveBottomNavigation,
  responsiveFabButton,
} from '../styles/responsive';

const LayoutContainer = styled.div`
  min-height: 100vh;
  display: flex;

  @media ${device.mobile} {
    flex-direction: column;
  }
`;

const Sidebar = styled.aside<{ isOpen: boolean }>`
  ${responsiveSidebar}
  width: ${(props) => (props.isOpen ? '280px !important' : '70px !important')};
  background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
  color: #2c3e50;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.08),
    0 2px 8px rgba(0, 0, 0, 0.06);
  border-right: 1px solid rgba(52, 152, 219, 0.08);
  backdrop-filter: blur(10px);
  height: 100vh;
  min-height: 100vh;
  overflow: visible;
  z-index: 100;

  /* Responsividade para diferentes tamanhos */
  @media (max-width: 480px) {
    width: ${(props) =>
      props.isOpen ? '260px !important' : '60px !important'};
  }

  @media (min-width: 481px) and (max-width: 768px) {
    width: ${(props) =>
      props.isOpen ? '240px !important' : '65px !important'};
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    width: ${(props) =>
      props.isOpen ? '260px !important' : '70px !important'};
  }

  @media (min-width: 1025px) and (max-width: 1440px) {
    width: ${(props) =>
      props.isOpen ? '280px !important' : '70px !important'};
  }

  @media (min-width: 1441px) {
    width: ${(props) =>
      props.isOpen ? '320px !important' : '80px !important'};
  }

  /* Container de navegação sem scroll */
  .nav-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    padding: 0.5rem 0;
    overflow: visible;
  }
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #3498db, #2ecc71, #e74c3c, #f39c12);
    background-size: 300% 100%;
    animation: gradientShift 8s ease infinite;
  }

  @keyframes gradientShift {
    0%,
    100% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
  }

  @media ${device.mobile} {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 320px;
    transform: translateX(${(props) => (props.isOpen ? '0' : '-100%')});
    z-index: 1000;
    box-shadow:
      0 25px 50px rgba(0, 0, 0, 0.15),
      0 10px 20px rgba(0, 0, 0, 0.1);
    height: 100vh;
    min-height: 100vh;

    /* Mobile pequeno */
    @media (max-width: 375px) {
      width: 300px;
    }

    /* Mobile grande */
    @media (min-width: 414px) and (max-width: 768px) {
      width: 340px;
    }
  }

  /* Tablet portrait */
  @media (min-width: 769px) and (max-width: 1024px) and (orientation: portrait) {
    width: ${(props) =>
      props.isOpen ? '260px !important' : '70px !important'};
    position: fixed;
  }

  /* Tablet landscape */
  @media (min-width: 769px) and (max-width: 1024px) and (orientation: landscape) {
    width: ${(props) =>
      props.isOpen ? '240px !important' : '65px !important'};
    position: fixed;
  }
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

// Header mobile
const MobileHeader = styled.header`
  ${responsiveMobileHeader}
  display: none;

  @media ${device.mobile} {
    display: flex;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.08),
      0 2px 16px rgba(0, 0, 0, 0.04);
    z-index: 998;
    height: 70px;
    padding: 0 1.5rem;
    align-items: center;
    justify-content: space-between;
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(52, 152, 219, 0.08);

    .mobile-header-title {
      flex: 1;
      text-align: center;
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
      position: relative;

      &:hover {
        transform: translateY(-2px) scale(1.05);
        background: linear-gradient(
          135deg,
          rgba(52, 152, 219, 0.15),
          rgba(46, 204, 113, 0.08)
        );
        box-shadow: 0 8px 16px rgba(52, 152, 219, 0.2);
      }

      &:active {
        transform: translateY(0) scale(0.98);
      }

      .icon {
        font-size: 1.25rem;
        filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
      }
    }
  }
`;

// Container do hambúrguer
const HamburgerContainer = styled.div`
  ${responsiveHamburgerMenu}
  display: none;

  @media ${device.mobile} {
    display: block;
  }

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

    &:active {
      transform: translateY(0) scale(0.98);
    }
  }

  .hamburger-icon {
    width: 24px;
    height: 18px;
    position: relative;
    transform: rotate(0deg);
    transition: 0.4s ease-in-out;
    cursor: pointer;

    span {
      display: block;
      position: absolute;
      height: 3px;
      width: 100%;
      background: linear-gradient(135deg, #2c3e50, #3498db);
      border-radius: 2px;
      opacity: 1;
      left: 0;
      transform: rotate(0deg);
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
`;

const SidebarHeader = styled.div<{ isOpen: boolean }>`
  padding: ${(props) => (props.isOpen ? '1.5rem' : '0.75rem 0.25rem')};
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgba(52, 152, 219, 0.1);
  position: relative;
  background: linear-gradient(
    135deg,
    rgba(52, 152, 219, 0.05),
    rgba(155, 89, 182, 0.05)
  );
  min-height: ${(props) => (props.isOpen ? '88px' : '64px')};

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: ${(props) => (props.isOpen ? '1rem' : '0.25rem')};
    right: ${(props) => (props.isOpen ? '1rem' : '0.25rem')};
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(52, 152, 219, 0.3),
      transparent
    );
  }
`;

const Logo = styled.div<{ isOpen: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${(props) => (props.isOpen ? '0.75rem' : '0')};
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;

  .logo-icon {
    font-size: ${(props) => (props.isOpen ? '1.75rem' : '1.125rem')};
    transition: all 0.35s ease;
    filter: drop-shadow(0 2px 4px rgba(52, 152, 219, 0.2));
  }

  .logo-text {
    font-size: 1.5rem;
    font-weight: 800;
    background: linear-gradient(135deg, #3498db, #2ecc71);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.02em;
    opacity: ${(props) => (props.isOpen ? 1 : 0)};
    width: ${(props) => (props.isOpen ? 'auto' : '0')};
    overflow: hidden;
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    white-space: nowrap;
  }

  &:hover {
    transform: ${(props) => (props.isOpen ? 'scale(1.02)' : 'scale(1.15)')};

    .logo-icon {
      transform: rotate(5deg);
    }
  }
`;
const ToggleButton = styled.button<{ isOpen: boolean }>`
  position: absolute;
  top: 1rem;
  right: ${(props) => (props.isOpen ? '-16px' : '-20px')};
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border: 2px solid white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 6px 20px rgba(52, 152, 219, 0.3),
    0 3px 10px rgba(52, 152, 219, 0.15);
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 0.875rem;
  font-weight: 700;
  z-index: 1000;

  /* Esconder em mobile */
  @media ${device.mobile} {
    display: none;
  }

  /* Mostrar apenas em desktop */
  @media ${device.desktop} {
    display: flex;
  }

  &:hover {
    transform: translateY(-2px) scale(1.15);
    box-shadow:
      0 8px 25px rgba(52, 152, 219, 0.4),
      0 4px 15px rgba(52, 152, 219, 0.2);
    background: linear-gradient(135deg, #2980b9, #3498db);
  }

  &:active {
    transform: translateY(0) scale(1.05);
  }

  /* Animação do ícone */
  .toggle-icon {
    transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    transform: ${(props) => (props.isOpen ? 'rotate(0deg)' : 'rotate(180deg)')};
    font-size: 1rem;
  }
`;

const NavSection = styled.div<{ isOpen: boolean }>`
  padding: ${(props) =>
    props.isOpen ? '0.75rem 0 0.5rem' : '0.5rem 0 0.25rem'};
  display: flex;
  flex-direction: column;
  gap: 0.125rem;

  &:not(:first-child) {
    border-top: 1px solid rgba(52, 152, 219, 0.08);
    margin-top: 0.25rem;
    padding-top: ${(props) => (props.isOpen ? '0.75rem' : '0.5rem')};
  }

  &:last-child {
    padding-bottom: ${(props) => (props.isOpen ? '1rem' : '0.5rem')};
  }
`;

const SectionTitle = styled.h3<{ isOpen: boolean }>`
  font-size: 0.65rem;
  color: #7f8c8d;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  margin: 0 0 0.5rem ${(props) => (props.isOpen ? '1.25rem' : '0')};
  opacity: ${(props) => (props.isOpen ? 1 : 0)};
  height: ${(props) => (props.isOpen ? 'auto' : '0')};
  overflow: hidden;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 700;
  position: relative;
  text-align: ${(props) => (props.isOpen ? 'left' : 'center')};

  &::after {
    content: '';
    position: absolute;
    bottom: -0.25rem;
    left: ${(props) => (props.isOpen ? '0' : '50%')};
    transform: ${(props) => (props.isOpen ? 'none' : 'translateX(-50%)')};
    width: ${(props) => (props.isOpen ? '30px' : '0')};
    height: 1px;
    background: linear-gradient(90deg, #3498db, #2ecc71);
    border-radius: 1px;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }
`;

const NavItem = styled(Link)<{ isActive: boolean; isOpen: boolean }>`
  display: flex;
  align-items: center;
  gap: ${(props) => (props.isOpen ? '0.875rem' : '0')};
  padding: ${(props) => (props.isOpen ? '0.625rem 1rem' : '0.625rem 0')};
  color: #2c3e50;
  text-decoration: none;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  margin: ${(props) =>
    props.isOpen ? '0.125rem 0.875rem' : '0.125rem 0.5rem'};
  border-radius: ${(props) => (props.isOpen ? '10px' : '14px')};
  font-weight: 500;
  justify-content: ${(props) => (props.isOpen ? 'flex-start' : 'center')};
  min-height: 38px;
  width: ${(props) => (props.isOpen ? 'auto' : '56px')};
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    left: ${(props) => (props.isOpen ? '0' : '50%')};
    top: ${(props) => (props.isOpen ? '0' : '50%')};
    bottom: ${(props) => (props.isOpen ? '0' : 'auto')};
    right: ${(props) => (props.isOpen ? 'auto' : '50%')};
    width: ${(props) => (props.isOpen ? '3px' : '0')};
    height: ${(props) => (props.isOpen ? '100%' : '0')};
    background: linear-gradient(135deg, #3498db, #2ecc71);
    border-radius: ${(props) => (props.isOpen ? '0 2px 2px 0' : '50%')};
    transform: ${(props) =>
      props.isOpen ? 'scaleY(0)' : 'translate(-50%, -50%) scale(0)'};
    transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    opacity: 0.1;
  }

  &:hover {
    background: linear-gradient(
      135deg,
      rgba(52, 152, 219, 0.12),
      rgba(46, 204, 113, 0.08)
    );
    transform: ${(props) => (props.isOpen ? 'translateX(3px)' : 'scale(1.05)')};
    color: #2980b9;

    &::before {
      transform: ${(props) =>
        props.isOpen ? 'scaleY(1)' : 'translate(-50%, -50%) scale(1)'};
      opacity: 0.8;
    }

    .icon {
      transform: ${(props) => (props.isOpen ? 'scale(1.08)' : 'scale(1.15)')};
    }
  }

  ${(props) =>
    props.isActive &&
    `
    background: linear-gradient(135deg, rgba(52, 152, 219, 0.15), rgba(46, 204, 113, 0.1));
    color: #2980b9;
    font-weight: 600;
    
    &::before {
      transform: ${props.isOpen ? 'scaleY(1)' : 'translate(-50%, -50%) scale(1)'};
      opacity: 1;
    }
    
    &::after {
      content: '';
      position: absolute;
      right: ${props.isOpen ? '0.875rem' : '50%'};
      top: 50%;
      transform: ${props.isOpen ? 'translateY(-50%)' : 'translate(50%, -50%)'};
      width: ${props.isOpen ? '5px' : '3px'};
      height: ${props.isOpen ? '5px' : '3px'};
      background: #3498db;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(52, 152, 219, 0.4);
    }
  `}

  .icon {
    font-size: ${(props) => (props.isOpen ? '1.125rem' : '1rem')};
    min-width: 18px;
    text-align: center;
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
  }

  .label {
    opacity: ${(props) => (props.isOpen ? 1 : 0)};
    visibility: ${(props) => (props.isOpen ? 'visible' : 'hidden')};
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    white-space: nowrap;
    font-size: 0.875rem;
    width: ${(props) => (props.isOpen ? 'auto' : '0')};
    overflow: hidden;
    font-weight: 500;
  }
`;

const MainArea = styled.div<{ sidebarOpen?: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  min-height: 100vh;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  /* Ajuste dinâmico baseado no tamanho da tela */
  margin-left: ${(props) => {
    if (props.sidebarOpen) {
      return 'clamp(240px, 20vw, 320px)';
    }
    return 'clamp(60px, 5vw, 80px)';
  }};

  /* Mobile */
  @media (max-width: 768px) {
    margin-left: 0;
    padding-top: 70px;
    ${(props) =>
      props.sidebarOpen &&
      `
      filter: blur(3px);
      pointer-events: none;
      transform: scale(0.98);
    `}
  }

  /* Tablet portrait */
  @media (min-width: 769px) and (max-width: 1024px) and (orientation: portrait) {
    margin-left: ${(props) => (props.sidebarOpen ? '260px' : '70px')};
  }

  /* Tablet landscape */
  @media (min-width: 769px) and (max-width: 1024px) and (orientation: landscape) {
    margin-left: ${(props) => (props.sidebarOpen ? '240px' : '65px')};
  }

  /* Desktop pequeno */
  @media (min-width: 1025px) and (max-width: 1440px) {
    margin-left: ${(props) => (props.sidebarOpen ? '280px' : '70px')};
  }

  /* Desktop grande */
  @media (min-width: 1441px) {
    margin-left: ${(props) => (props.sidebarOpen ? '320px' : '80px')};
  }
`;

const Header = styled.header`
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  padding: clamp(1rem, 2vw, 2rem) clamp(1rem, 3vw, 3rem);
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.05),
    0 1px 3px rgba(0, 0, 0, 0.03);
  border-bottom: 1px solid rgba(52, 152, 219, 0.08);
  backdrop-filter: blur(10px);
  flex-wrap: wrap;
  gap: 1rem;

  /* Mobile */
  @media (max-width: 768px) {
    display: none;
  }

  /* Tablet portrait */
  @media (min-width: 769px) and (max-width: 1024px) and (orientation: portrait) {
    padding: 1.25rem 1.5rem;
    flex-direction: column;
    gap: 0.75rem;
    text-align: center;
  }

  /* Tablet landscape e acima */
  @media (min-width: 1025px) {
    flex-direction: row;
    text-align: left;
  }
`;

const HeaderTitle = styled.h1`
  margin: 0;
  font-size: clamp(1.25rem, 3vw, 1.75rem);
  font-weight: 700;
  background: linear-gradient(135deg, #2c3e50, #3498db);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;

  /* Tablet portrait */
  @media (min-width: 769px) and (max-width: 1024px) and (orientation: portrait) {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: clamp(0.75rem, 2vw, 1.25rem);
  padding: clamp(0.5rem, 1.5vw, 0.75rem) clamp(0.75rem, 2vw, 1.25rem);
  background: linear-gradient(
    135deg,
    rgba(52, 152, 219, 0.05),
    rgba(46, 204, 113, 0.03)
  );
  border-radius: 16px;
  border: 1px solid rgba(52, 152, 219, 0.1);
  transition: all 0.3s ease;
  flex-wrap: wrap;
  justify-content: center;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 16px rgba(52, 152, 219, 0.1);
  }

  /* Tablet portrait */
  @media (min-width: 769px) and (max-width: 1024px) and (orientation: portrait) {
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem;
    text-align: center;
  }

  /* Desktop pequeno */
  @media (min-width: 1025px) and (max-width: 1200px) {
    flex-direction: row;
    gap: 0.75rem;
  }
`;

const UserName = styled.span`
  color: #2c3e50;
  font-weight: 600;
  font-size: clamp(0.8rem, 2vw, 0.95rem);
  white-space: nowrap;

  /* Tablet portrait */
  @media (min-width: 769px) and (max-width: 1024px) and (orientation: portrait) {
    white-space: normal;
    text-align: center;
  }

  /* Mobile landscape */
  @media (max-width: 768px) and (orientation: landscape) {
    display: none;
  }
`;

const LogoutButton = styled.button`
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.2);

  &:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 8px 20px rgba(231, 76, 60, 0.3);
  }

  &:active {
    transform: translateY(0) scale(0.98);
  }
`;

const MainContent = styled.main<{ paddingBottom?: boolean }>`
  flex: 1;
  padding: clamp(1rem, 3vw, 2rem);
  background: #f8f9fa;
  overflow-y: auto;

  /* Ocultar scrollbar mas manter funcionalidade */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */

  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }

  /* Mobile */
  @media (max-width: 768px) {
    padding: clamp(0.75rem, 2vw, 1rem);
    padding-bottom: ${(props) =>
      props.paddingBottom ? '80px' : 'clamp(0.75rem, 2vw, 1rem)'};
  }

  /* Tablet portrait */
  @media (min-width: 769px) and (max-width: 1024px) and (orientation: portrait) {
    padding: 1.5rem;
  }

  /* Desktop grande */
  @media (min-width: 1441px) {
    padding: 2.5rem;
    max-width: calc(100vw - 320px);
  }
`;

// Bottom Navigation para mobile
const BottomNavigation = styled.nav`
  ${responsiveBottomNavigation}
  display: none;

  @media ${device.mobile} {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
    box-shadow:
      0 -8px 32px rgba(0, 0, 0, 0.08),
      0 -2px 16px rgba(0, 0, 0, 0.04);
    padding: 0.75rem 0 0.5rem;
    z-index: 998;
    backdrop-filter: blur(20px);
    border-top: 1px solid rgba(52, 152, 219, 0.1);

    // Safe area para dispositivos com notch
    padding-bottom: calc(0.5rem + env(safe-area-inset-bottom));
  }

  .bottom-nav-list {
    display: flex;
    justify-content: space-around;
    align-items: center;
    width: 100%;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .bottom-nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.5rem 0.75rem;
    min-height: 56px;
    justify-content: center;
    position: relative;
    background: none;
    border: none;
    cursor: pointer;
    border-radius: 16px;
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    color: #7f8c8d;
    min-width: 64px;

    &.active {
      color: #3498db;
      background: linear-gradient(
        135deg,
        rgba(52, 152, 219, 0.12),
        rgba(46, 204, 113, 0.06)
      );
      transform: translateY(-2px);

      .bottom-nav-icon {
        transform: scale(1.1);
        filter: drop-shadow(0 2px 8px rgba(52, 152, 219, 0.3));
      }

      &::after {
        content: '';
        position: absolute;
        top: -2px;
        left: 50%;
        transform: translateX(-50%);
        width: 24px;
        height: 3px;
        background: linear-gradient(90deg, #3498db, #2ecc71);
        border-radius: 0 0 3px 3px;
      }
    }

    &:hover:not(.active) {
      background: rgba(52, 152, 219, 0.05);
      color: #3498db;
      transform: translateY(-1px);
    }
  }

  .bottom-nav-icon {
    font-size: 1.375rem;
    margin-bottom: 0.25rem;
    transition: all 0.3s ease;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
  }

  .bottom-nav-text {
    font-size: 0.6875rem;
    font-weight: 600;
    text-align: center;
    line-height: 1;
    letter-spacing: 0.02em;
  }

  .bottom-nav-badge {
    position: absolute;
    top: 0.25rem;
    right: 0.5rem;
    background: linear-gradient(135deg, #e74c3c, #c0392b);
    color: white;
    border-radius: 12px;
    padding: 0.125rem 0.5rem;
    font-size: 0.625rem;
    font-weight: 700;
    min-width: 18px;
    text-align: center;
    box-shadow: 0 2px 8px rgba(231, 76, 60, 0.3);
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }
`;

// FAB Button
const FabButton = styled.button`
  ${responsiveFabButton}
  display: none;

  @media ${device.mobile} {
    display: flex;
    position: fixed;
    bottom: 100px; // Acima do bottom nav
    right: 1.5rem;
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: linear-gradient(135deg, #3498db 0%, #2ecc71 100%);
    color: white;
    border: none;
    cursor: pointer;
    align-items: center;
    justify-content: center;
    box-shadow:
      0 12px 24px rgba(52, 152, 219, 0.3),
      0 4px 12px rgba(52, 152, 219, 0.15);
    z-index: 997;
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);

    // Safe area
    bottom: calc(100px + env(safe-area-inset-bottom));

    &:hover {
      transform: translateY(-4px) scale(1.08);
      box-shadow:
        0 20px 40px rgba(52, 152, 219, 0.4),
        0 8px 20px rgba(52, 152, 219, 0.2);
    }

    &:active {
      transform: translateY(-2px) scale(1.02);
    }

    &::before {
      content: '';
      position: absolute;
      top: -4px;
      left: -4px;
      right: -4px;
      bottom: -4px;
      border-radius: 50%;
      background: linear-gradient(
        135deg,
        rgba(52, 152, 219, 0.2),
        rgba(46, 204, 113, 0.2)
      );
      animation: ripple 3s infinite;
      z-index: -1;
    }
  }

  @keyframes ripple {
    0% {
      transform: scale(0.8);
      opacity: 1;
    }
    100% {
      transform: scale(1.4);
      opacity: 0;
    }
  }

  .fab-icon {
    font-size: 1.75rem;
    font-weight: bold;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    transition: transform 0.3s ease;
  }

  &:hover .fab-icon {
    transform: rotate(45deg);
  }
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3498db 0%, #2ecc71 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 0.875rem;
  box-shadow:
    0 4px 12px rgba(52, 152, 219, 0.3),
    0 2px 6px rgba(52, 152, 219, 0.15);
  transition: all 0.3s ease;
  border: 2px solid rgba(255, 255, 255, 0.2);

  &:hover {
    transform: translateY(-1px) scale(1.05);
    box-shadow:
      0 6px 16px rgba(52, 152, 219, 0.4),
      0 3px 8px rgba(52, 152, 219, 0.2);
  }
`;

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar mobile e tablet
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const isMobileDevice = width <= 768;
      const isTabletDevice = width > 768 && width <= 1024;

      setIsMobile(isMobileDevice);

      // Em mobile e tablet pequeno, sidebar começa fechada
      if ((isMobileDevice || (isTabletDevice && width <= 900)) && sidebarOpen) {
        setSidebarOpen(false);
      }

      // Em desktop grande, sidebar fica aberta por padrão
      if (width > 1200 && !sidebarOpen) {
        setSidebarOpen(true);
      }
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);

    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Prevenir scroll quando sidebar aberta em mobile
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleOverlayClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    // Fechar sidebar em mobile após navegação
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleFabClick = () => {
    // Ação do FAB - pode ser personalizada
    navigate('/projects');
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
    {
      section: 'GERAL',
      items: [
        { path: '/dashboard', icon: '🏠', label: 'Dashboard' },
        { path: '/teams', icon: '👥', label: 'Equipes' },
        { path: '/members', icon: '👤', label: 'Membros' },
        { path: '/projects', icon: '📋', label: 'Projetos' },
      ],
    },
    // PESSOAL
    {
      section: 'PESSOAL',
      items: [
        { path: '/profile', icon: '👤', label: 'Perfil' },
        { path: '/tasks', icon: '📝', label: 'Tarefas' },
      ],
    },
    // RELATÓRIOS
    {
      section: 'RELATÓRIOS',
      items: [
        { path: '/kpis', icon: '📊', label: 'KPIs' },
        { path: '/notifications', icon: '🔔', label: 'Notificações' },
        { path: '/goals', icon: '🎯', label: 'Metas' },
        { path: '/calendar', icon: '📅', label: 'Calendário' },
        { path: '/alerts', icon: '⚠️', label: 'Alertas' },
      ],
    },
  ];

  const getUserInitials = () => {
    const name = user?.fullName || user?.username || 'User';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Itens de navegação para mobile (seleção dos principais)
  const mobileNavItems = menuItems
    .flatMap((section) => section.items)
    .slice(0, 5); // Apenas 5 itens principais no bottom nav

  return (
    <LayoutContainer>
      {/* Overlay para mobile */}
      <Overlay show={sidebarOpen && isMobile} onClick={handleOverlayClick} />

      {/* Header Mobile */}
      <MobileHeader>
        <HamburgerContainer>
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

        <h1 className="mobile-header-title">{getPageTitle()}</h1>

        <div className="mobile-header-actions">
          <button className="action-button" aria-label="Notifications">
            <span className="icon">🔔</span>
          </button>
          <UserAvatar>{getUserInitials()}</UserAvatar>
        </div>
      </MobileHeader>

      <Sidebar isOpen={sidebarOpen}>
        <SidebarHeader isOpen={sidebarOpen}>
          <Logo isOpen={sidebarOpen}>
            <span className="logo-icon">🏢</span>
            <span className="logo-text">EPU</span>
          </Logo>
        </SidebarHeader>

        {/* Toggle button apenas para desktop */}
        {!isMobile && (
          <ToggleButton
            isOpen={sidebarOpen}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <span className="toggle-icon">←</span>
          </ToggleButton>
        )}

        <div className="nav-content">
          {menuItems.map((section, index) => (
            <NavSection key={index} isOpen={sidebarOpen}>
              <SectionTitle isOpen={sidebarOpen}>
                {section.section}
              </SectionTitle>
              {section.items.map((item) => (
                <NavItem
                  key={item.path}
                  to={item.path}
                  isActive={location.pathname === item.path}
                  isOpen={sidebarOpen}
                  onClick={() => handleNavigation(item.path)}
                >
                  <span className="icon">{item.icon}</span>
                  <span className="label">{item.label}</span>
                </NavItem>
              ))}
            </NavSection>
          ))}
        </div>
      </Sidebar>

      <MainArea sidebarOpen={sidebarOpen}>
        <Header>
          <HeaderTitle>{getPageTitle()}</HeaderTitle>
          <UserInfo>
            <UserAvatar>{getUserInitials()}</UserAvatar>
            <UserName>Olá, {user?.fullName || user?.username}</UserName>
            <LogoutButton onClick={handleLogout}>Sair</LogoutButton>
          </UserInfo>
        </Header>
        <MainContent paddingBottom={isMobile}>{children}</MainContent>
      </MainArea>

      {/* Bottom Navigation (apenas mobile) */}
      <BottomNavigation>
        <ul className="bottom-nav-list">
          {mobileNavItems.map((item) => (
            <li key={`bottom-${item.path}`}>
              <button
                className={`bottom-nav-item ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => handleNavigation(item.path)}
              >
                <span className="bottom-nav-icon">{item.icon}</span>
                <span className="bottom-nav-text">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </BottomNavigation>

      {/* FAB Button */}
      <FabButton onClick={handleFabClick}>
        <span className="fab-icon">➕</span>
      </FabButton>
    </LayoutContainer>
  );
};

export default Layout;
