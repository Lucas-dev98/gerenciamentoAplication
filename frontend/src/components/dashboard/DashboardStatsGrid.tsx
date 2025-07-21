import React from 'react';
import styled from 'styled-components';
import {
  device,
  responsiveStatsGrid,
  responsiveStatCard,
} from '../../styles/responsive';

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

interface StatsGridProps {
  stats: DashboardStats;
}

const StatsGrid = styled.div`
  ${responsiveStatsGrid}
`;

const StatCard = styled.div`
  ${responsiveStatCard}
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }

  @media ${device.mobile} {
    border-radius: 8px;

    &:hover {
      transform: translateY(-1px);
    }
  }

  .stat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;

    @media ${device.mobile} {
      margin-bottom: 0.75rem;
    }
  }

  .stat-title {
    font-size: 0.9rem;
    color: #6c757d;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;

    @media ${device.mobile} {
      font-size: 0.8rem;
    }
  }

  .stat-icon {
    font-size: 1.5rem;

    @media ${device.mobile} {
      font-size: 1.25rem;
    }
  }

  .stat-value {
    font-size: 2.5rem;
    font-weight: bold;
    color: #2c3e50;
    margin-bottom: 0.5rem;

    @media ${device.mobile} {
      font-size: 2rem;
    }

    @media ${device.tablet} {
      font-size: 2.25rem;
    }
  }

  .stat-change {
    font-size: 0.8rem;
    color: #28a745;

    @media ${device.mobile} {
      font-size: 0.75rem;
    }
  }
`;

const DashboardStatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  return (
    <StatsGrid>
      <StatCard>
        <div className="stat-header">
          <div className="stat-title">Total de Membros</div>
          <div className="stat-icon">👥</div>
        </div>
        <div className="stat-value">{stats.totalMembers}</div>
        <div className="stat-change">+12% este mês</div>
      </StatCard>

      <StatCard>
        <div className="stat-header">
          <div className="stat-title">Equipes Ativas</div>
          <div className="stat-icon">🏢</div>
        </div>
        <div className="stat-value">{stats.totalTeams}</div>
        <div className="stat-change">+2 novas equipes</div>
      </StatCard>

      <StatCard>
        <div className="stat-header">
          <div className="stat-title">Projetos Ativos</div>
          <div className="stat-icon">📋</div>
        </div>
        <div className="stat-value">{stats.activeProjects}</div>
        <div className="stat-change">+3 projetos</div>
      </StatCard>

      <StatCard>
        <div className="stat-header">
          <div className="stat-title">Aniversários Hoje</div>
          <div className="stat-icon">🎉</div>
        </div>
        <div className="stat-value">{stats.birthdaysToday}</div>
        <div className="stat-change">Parabenizar!</div>
      </StatCard>
    </StatsGrid>
  );
};

export default DashboardStatsGrid;
export type { DashboardStats };
