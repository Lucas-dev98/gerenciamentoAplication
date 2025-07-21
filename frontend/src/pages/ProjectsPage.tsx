import React, { useState } from 'react';
import styled from 'styled-components';

// Types
interface Project {
  id: string;
  name: string;
  description: string;
  status: 'Em Andamento' | 'Concluído' | 'Pausado' | 'Planejamento';
  progress: number;
  team: string;
  startDate: string;
  endDate?: string;
  priority: 'Alta' | 'Média' | 'Baixa';
}

const PageContainer = styled.div`
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
  background-color: #f8f9fa;
  min-height: 100vh;
`;

const PageHeader = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PageTitle = styled.h1`
  margin: 0 0 0.5rem 0;
  font-size: 2.2rem;
  font-weight: 600;
`;

const PageSubtitle = styled.p`
  margin: 0;
  font-size: 1rem;
  opacity: 0.9;
  line-height: 1.5;
`;

const PageContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border-left: 4px solid #667eea;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  }
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: #6c757d;
  font-size: 0.9rem;
  font-weight: 500;
`;

const ActionBar = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const CreateButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-2px);
  }
`;

const ProjectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const ProjectCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  }
`;

const ProjectHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const ProjectName = styled.h3`
  margin: 0;
  color: #2c3e50;
  font-size: 1.2rem;
  font-weight: 600;
`;

const StatusBadge = styled.span<{ $status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
  background: ${(props) => {
    switch (props.$status) {
      case 'Em Andamento':
        return '#28a745';
      case 'Concluído':
        return '#007bff';
      case 'Pausado':
        return '#ffc107';
      case 'Planejamento':
        return '#6f42c1';
      default:
        return '#6c757d';
    }
  }};
`;

const ProjectDescription = styled.p`
  color: #6c757d;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 1rem;
`;

const ProgressBar = styled.div`
  background: #e9ecef;
  border-radius: 10px;
  height: 8px;
  margin: 1rem 0;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $progress: number }>`
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  height: 100%;
  width: ${(props) => props.$progress}%;
  transition: width 0.3s ease;
`;

const ProjectMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: #6c757d;
  margin-top: 1rem;
`;

const PriorityBadge = styled.span<{ $priority: string }>`
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${(props) => {
    switch (props.$priority) {
      case 'Alta':
        return '#fee2e2';
      case 'Média':
        return '#fef3c7';
      case 'Baixa':
        return '#d1fae5';
      default:
        return '#f3f4f6';
    }
  }};
  color: ${(props) => {
    switch (props.$priority) {
      case 'Alta':
        return '#dc2626';
      case 'Média':
        return '#d97706';
      case 'Baixa':
        return '#059669';
      default:
        return '#6b7280';
    }
  }};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #6c757d;
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
`;

const ProjectsPage: React.FC = () => {
  // Mock data para demonstração
  const [projects] = useState<Project[]>([
    {
      id: '1',
      name: 'Sistema de Gestão EPU',
      description:
        'Desenvolvimento do sistema principal de gestão de equipes e projetos da EPU.',
      status: 'Em Andamento',
      progress: 75,
      team: 'Equipe Desenvolvimento',
      startDate: '2024-01-15',
      priority: 'Alta',
    },
    {
      id: '2',
      name: 'Dashboard Analytics',
      description:
        'Criação de dashboard para análise de dados e métricas da organização.',
      status: 'Planejamento',
      progress: 25,
      team: 'Equipe Data',
      startDate: '2024-02-01',
      priority: 'Média',
    },
    {
      id: '3',
      name: 'Mobile App EPU',
      description:
        'Aplicativo mobile para acesso aos recursos da EPU em dispositivos móveis.',
      status: 'Pausado',
      progress: 40,
      team: 'Equipe Mobile',
      startDate: '2023-11-10',
      priority: 'Baixa',
    },
    {
      id: '4',
      name: 'Integração API Externa',
      description: 'Integração com APIs externas para sincronização de dados.',
      status: 'Concluído',
      progress: 100,
      team: 'Equipe Backend',
      startDate: '2023-12-01',
      endDate: '2024-01-30',
      priority: 'Alta',
    },
  ]);

  const stats = {
    total: projects.length,
    inProgress: projects.filter((p) => p.status === 'Em Andamento').length,
    completed: projects.filter((p) => p.status === 'Concluído').length,
    paused: projects.filter((p) => p.status === 'Pausado').length,
  };

  return (
    <PageContainer>
      <PageHeader>
        <div>
          <PageTitle>Gestão de Projetos</PageTitle>
          <PageSubtitle>
            Gerencie seus projetos, acompanhe o progresso e organize sua equipe
          </PageSubtitle>
        </div>
        <ActionBar>
          <CreateButton>Novo Projeto</CreateButton>
          <CreateButton>Importar CSV</CreateButton>
        </ActionBar>
      </PageHeader>

      <PageContent>
        {/* Statistics Cards */}
        <DashboardGrid>
          <StatCard>
            <StatValue>{stats.total}</StatValue>
            <StatLabel>Total de Projetos</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.inProgress}</StatValue>
            <StatLabel>Em Andamento</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.completed}</StatValue>
            <StatLabel>Concluídos</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.paused}</StatValue>
            <StatLabel>Pausados</StatLabel>
          </StatCard>
        </DashboardGrid>

        {/* Projects List */}
        {projects.length > 0 ? (
          <ProjectsGrid>
            {projects.map((project) => (
              <ProjectCard key={project.id}>
                <ProjectHeader>
                  <ProjectName>{project.name}</ProjectName>
                  <StatusBadge $status={project.status}>
                    {project.status}
                  </StatusBadge>
                </ProjectHeader>

                <ProjectDescription>{project.description}</ProjectDescription>

                <ProgressBar>
                  <ProgressFill $progress={project.progress} />
                </ProgressBar>

                <ProjectMeta>
                  <span>Progresso: {project.progress}%</span>
                  <PriorityBadge $priority={project.priority}>
                    {project.priority}
                  </PriorityBadge>
                </ProjectMeta>

                <ProjectMeta>
                  <span>Equipe: {project.team}</span>
                  <span>
                    Início:{' '}
                    {new Date(project.startDate).toLocaleDateString('pt-BR')}
                  </span>
                </ProjectMeta>
              </ProjectCard>
            ))}
          </ProjectsGrid>
        ) : (
          <EmptyState>
            <EmptyIcon>📋</EmptyIcon>
            <h3>Nenhum projeto encontrado</h3>
            <p>
              Comece criando seu primeiro projeto clicando em "Novo Projeto"
            </p>
          </EmptyState>
        )}
      </PageContent>
    </PageContainer>
  );
};

export default ProjectsPage;
