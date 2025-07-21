import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface KPIData {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalMembers: number;
  activeMembers: number;
  totalTeams: number;
  productivity: number;
  satisfaction: number;
}

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
`;

const Subtitle = styled.p`
  color: #7f8c8d;
  margin: 0;
`;

const KPIGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const KPICard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const KPIValue = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: #3498db;
  margin-bottom: 0.5rem;
`;

const KPILabel = styled.div`
  color: #7f8c8d;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ChartsSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ChartTitle = styled.h3`
  color: #2c3e50;
  margin: 0 0 1rem 0;
`;

const ChartPlaceholder = styled.div`
  height: 200px;
  background-color: #f8f9fa;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7f8c8d;
  font-style: italic;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #7f8c8d;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #e74c3c;
  background-color: #fdf2f2;
  border-radius: 8px;
  margin: 1rem 0;
`;

const KPIsPage: React.FC = () => {
  const [kpiData, setKpiData] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchKPIData();
    }
  }, [isAuthenticated]);

  const fetchKPIData = async () => {
    try {
      setLoading(true);

      // Buscar dados de diferentes endpoints
      const [projectsRes, usersRes, teamsRes] = await Promise.all([
        axios.get('/api/projects').catch(() => ({ data: [] })),
        axios.get('/api/users').catch(() => ({ data: [] })),
        axios.get('/api/teams').catch(() => ({ data: [] })),
      ]);

      const projects = projectsRes.data.data || projectsRes.data || [];
      const users = usersRes.data.data || usersRes.data || [];
      const teams = teamsRes.data.data || teamsRes.data || [];

      // Calcular KPIs
      const kpis: KPIData = {
        totalProjects: projects.length,
        activeProjects: projects.filter((p: any) => p.status === 'active')
          .length,
        completedProjects: projects.filter((p: any) => p.status === 'completed')
          .length,
        totalMembers: users.length,
        activeMembers: users.filter((u: any) => u.isActive !== false).length,
        totalTeams: teams.length,
        productivity: Math.round(Math.random() * 100), // Mock data
        satisfaction: Math.round(Math.random() * 100), // Mock data
      };

      setKpiData(kpis);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching KPI data:', error);
      setError('Erro ao carregar dados dos KPIs');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingMessage>Carregando indicadores...</LoadingMessage>;
  }

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  if (!kpiData) {
    return <ErrorMessage>Dados não disponíveis</ErrorMessage>;
  }

  return (
    <Container>
      <Header>
        <Title>KPIs & Indicadores</Title>
        <Subtitle>Acompanhe os principais indicadores de performance</Subtitle>
      </Header>

      <KPIGrid>
        <KPICard>
          <KPIValue>{kpiData.totalProjects}</KPIValue>
          <KPILabel>Total de Projetos</KPILabel>
        </KPICard>

        <KPICard>
          <KPIValue>{kpiData.activeProjects}</KPIValue>
          <KPILabel>Projetos Ativos</KPILabel>
        </KPICard>

        <KPICard>
          <KPIValue>{kpiData.completedProjects}</KPIValue>
          <KPILabel>Projetos Concluídos</KPILabel>
        </KPICard>

        <KPICard>
          <KPIValue>{kpiData.totalMembers}</KPIValue>
          <KPILabel>Total de Membros</KPILabel>
        </KPICard>

        <KPICard>
          <KPIValue>{kpiData.activeMembers}</KPIValue>
          <KPILabel>Membros Ativos</KPILabel>
        </KPICard>

        <KPICard>
          <KPIValue>{kpiData.totalTeams}</KPIValue>
          <KPILabel>Total de Equipes</KPILabel>
        </KPICard>

        <KPICard>
          <KPIValue>{kpiData.productivity}%</KPIValue>
          <KPILabel>Produtividade</KPILabel>
        </KPICard>

        <KPICard>
          <KPIValue>{kpiData.satisfaction}%</KPIValue>
          <KPILabel>Satisfação</KPILabel>
        </KPICard>
      </KPIGrid>

      <ChartsSection>
        <ChartCard>
          <ChartTitle>Projetos por Status</ChartTitle>
          <ChartPlaceholder>
            Gráfico de projetos será implementado aqui
          </ChartPlaceholder>
        </ChartCard>

        <ChartCard>
          <ChartTitle>Produtividade por Mês</ChartTitle>
          <ChartPlaceholder>
            Gráfico de produtividade será implementado aqui
          </ChartPlaceholder>
        </ChartCard>
      </ChartsSection>
    </Container>
  );
};

export default KPIsPage;
