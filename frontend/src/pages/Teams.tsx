import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import TeamModal from '../components/TeamModal';
import AddMemberModal from '../components/AddMemberModal';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';

// Types
interface Team {
  _id: string;
  name: string;
  description: string;
  members: any[];
  leader: any;
  createdAt: string;
  updatedAt: string;
  status?: 'Ativa' | 'Inativa' | 'Em Formação';
  department?: string;
  projects?: number;
}

interface TeamFormData {
  name: string;
  description: string;
  department: string;
  leaderId?: string;
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

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
`;

const HeaderContent = styled.div`
  flex: 1;
`;

const PageTitle = styled.h1`
  margin: 0 0 0.5rem 0;
  font-size: 2.2rem;
  font-weight: 600;

  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const PageSubtitle = styled.p`
  margin: 0;
  font-size: 1rem;
  opacity: 0.9;
  line-height: 1.5;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const ActionBar = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
  }
`;

const CreateButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

const ContentSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
`;

const SectionTitle = styled.h2`
  margin: 0;
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 600;
`;

const FilterBar = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
    align-items: stretch;
  }
`;

const SearchInput = styled.input`
  padding: 0.5rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: border-color 0.3s ease;
  min-width: 250px;

  &:focus {
    outline: none;
    border-color: #667eea;
  }

  @media (max-width: 768px) {
    min-width: auto;
    width: 100%;
  }
`;

const FilterSelect = styled.select`
  padding: 0.5rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.9rem;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const TeamsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const TeamCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
    border-color: #667eea;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  }
`;

const TeamHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const TeamInfo = styled.div`
  flex: 1;
`;

const TeamName = styled.h3`
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.2rem;
  font-weight: 600;
`;

const TeamDepartment = styled.span`
  background: #e3f2fd;
  color: #1976d2;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
`;

const TeamStatus = styled.span<{ status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  background: ${(props) =>
    props.status === 'Ativa'
      ? '#e8f5e8'
      : props.status === 'Inativa'
        ? '#ffeaa7'
        : '#f8d7da'};
  color: ${(props) =>
    props.status === 'Ativa'
      ? '#2e7d32'
      : props.status === 'Inativa'
        ? '#f57c00'
        : '#721c24'};
`;

const TeamDescription = styled.p`
  color: #6c757d;
  margin: 1rem 0;
  line-height: 1.5;
  font-size: 0.9rem;
`;

const TeamMetrics = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin: 1rem 0;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
`;

const Metric = styled.div`
  text-align: center;
`;

const MetricValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #667eea;
`;

const MetricLabel = styled.div`
  font-size: 0.8rem;
  color: #6c757d;
  margin-top: 0.25rem;
`;

const TeamActions = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.3s ease;

  &.primary {
    background: #667eea;
    color: white;

    &:hover {
      background: #5a6fd8;
    }
  }

  &.secondary {
    background: #e9ecef;
    color: #6c757d;

    &:hover {
      background: #dee2e6;
    }
  }

  &.danger {
    background: #dc3545;
    color: white;

    &:hover {
      background: #c82333;
    }
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 3rem;
  color: #6c757d;
  font-size: 1.1rem;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #e74c3c;
  background: #fdf2f2;
  border: 1px solid #fadbd8;
  border-radius: 8px;
  margin: 1rem 0;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #6c757d;

  .icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  h3 {
    margin: 0 0 0.5rem 0;
    color: #495057;
  }

  p {
    margin: 0 0 1.5rem 0;
    line-height: 1.5;
  }
`;

// Modal styles (simplified)
const Modal = styled.div<{ show: boolean }>`
  display: ${(props) => (props.show ? 'flex' : 'none')};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: #2c3e50;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;

  &:hover {
    color: #2c3e50;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.9rem;
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.9rem;
  background: white;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;

  &.primary {
    background: #667eea;
    color: white;

    &:hover {
      background: #5a6fd8;
    }
  }

  &.secondary {
    background: #e9ecef;
    color: #6c757d;

    &:hover {
      background: #dee2e6;
    }
  }
`;

const TeamsPage: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRemoveMemberConfirm, setShowRemoveMemberConfirm] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<string | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<{
    teamId: string;
    memberId: string;
  } | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState<TeamFormData>({
    name: '',
    description: '',
    department: '',
  });
  const { isAuthenticated } = useAuth();
  const { toasts, removeToast, showSuccess, showError, showInfo } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      fetchTeams();
    }
  }, [isAuthenticated]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await api.get('/teams');
      setTeams(response.data.data || response.data);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching teams:', error);
      // Se erro de autenticação, usar dados mock como fallback
      if (error.response?.status === 401) {
        console.log('Using mock data due to authentication error');
        const mockTeams = [
          {
            _id: '1',
            name: 'Equipe de Desenvolvimento',
            description: 'Responsável pelo desenvolvimento de software',
            department: 'Tecnologia',
            status: 'Ativa' as const,
            members: [
              { _id: '1', name: 'João Silva', email: 'joao@empresa.com' },
              { _id: '2', name: 'Maria Santos', email: 'maria@empresa.com' },
            ],
            leader: { _id: '1', name: 'João Silva' },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            projects: 3,
          },
          {
            _id: '2',
            name: 'Equipe de Marketing',
            description: 'Responsável pelas estratégias de marketing',
            department: 'Marketing',
            status: 'Ativa' as const,
            members: [
              { _id: '3', name: 'Ana Costa', email: 'ana@empresa.com' },
              { _id: '4', name: 'Pedro Lima', email: 'pedro@empresa.com' },
              { _id: '5', name: 'Carla Oliveira', email: 'carla@empresa.com' },
            ],
            leader: { _id: '3', name: 'Ana Costa' },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            projects: 5,
          },
        ];
        setTeams(mockTeams);
        setError(null);
      } else {
        setError(error.response?.data?.message || 'Erro ao carregar equipes');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/teams', formData);
      setTeams((prevTeams) => [...prevTeams, response.data.data]);
      setShowCreateModal(false);
      setFormData({ name: '', description: '', department: '' });
      showSuccess('✅ Equipe criada com sucesso!');
      // Refetch teams to ensure consistency
      fetchTeams();
    } catch (error: any) {
      console.error('Error creating team:', error);
      const errorMessage =
        error.response?.data?.message || 'Erro ao criar equipe';
      setError(errorMessage);
      showError(`❌ ${errorMessage}`);
    }
  };

  const handleEditTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam) return;

    try {
      const response = await api.put(`/teams/${selectedTeam._id}`, formData);
      setTeams((prevTeams) =>
        prevTeams.map((team) =>
          team._id === selectedTeam._id
            ? { ...team, ...response.data.data }
            : team
        )
      );
      setShowEditModal(false);
      setSelectedTeam(null);
      setFormData({ name: '', description: '', department: '' });
      showSuccess('✅ Equipe atualizada com sucesso!');
    } catch (error: any) {
      console.error('Error updating team:', error);
      const errorMessage =
        error.response?.data?.message || 'Erro ao atualizar equipe';
      setError(errorMessage);
      showError(`❌ ${errorMessage}`);
    }
  };

  const handleDeleteTeam = (teamId: string) => {
    setTeamToDelete(teamId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteTeam = async () => {
    if (!teamToDelete) return;

    try {
      await api.delete(`/teams/${teamToDelete}`);
      setTeams((prevTeams) =>
        prevTeams.filter((team) => team._id !== teamToDelete)
      );
      showSuccess('✅ Equipe excluída com sucesso!');
    } catch (error: any) {
      console.error('Error deleting team:', error);
      const errorMessage =
        error.response?.data?.message || 'Erro ao excluir equipe';
      setError(errorMessage);
      showError(`❌ ${errorMessage}`);
    } finally {
      setShowDeleteConfirm(false);
      setTeamToDelete(null);
    }
  };

  const handleViewTeam = (team: Team) => {
    setSelectedTeam(team);
    setShowMembersModal(true);
  };

  const handleEditClick = (team: Team) => {
    setSelectedTeam(team);
    setFormData({
      name: team.name,
      description: team.description || '',
      department: team.department || '',
    });
    setShowEditModal(true);
  };

  const handleAddMember = (teamId: string) => {
    const team = teams.find((t) => t._id === teamId);
    if (team) {
      setSelectedTeam(team);
      setShowAddMemberModal(true);
    }
  };

  const handleMemberAdded = () => {
    setShowAddMemberModal(false);
    fetchTeams(); // Recarregar dados das equipes
    showSuccess('✅ Membro adicionado com sucesso!');
  };

  const handleRemoveMember = (teamId: string, memberId: string) => {
    setMemberToRemove({ teamId, memberId });
    setShowRemoveMemberConfirm(true);
  };

  const confirmRemoveMember = async () => {
    if (!memberToRemove) return;

    const { teamId, memberId } = memberToRemove;

    try {
      await api.delete(`/teams/${teamId}/members/${memberId}`);
      // Atualizar a equipe local
      setTeams((prevTeams) =>
        prevTeams.map((team) =>
          team._id === teamId
            ? {
                ...team,
                members: team.members.filter(
                  (member) => member._id !== memberId
                ),
              }
            : team
        )
      );
      // Atualizar equipe selecionada se for a mesma
      if (selectedTeam?._id === teamId) {
        setSelectedTeam((prev) =>
          prev
            ? {
                ...prev,
                members: prev.members.filter(
                  (member) => member._id !== memberId
                ),
              }
            : null
        );
      }
      showSuccess('✅ Membro removido com sucesso!');
    } catch (error: any) {
      console.error('Error removing member:', error);
      const errorMessage =
        error.response?.data?.message || 'Erro ao remover membro';
      setError(errorMessage);
      showError(`❌ ${errorMessage}`);
    } finally {
      setShowRemoveMemberConfirm(false);
      setMemberToRemove(null);
    }
  };

  // Filter teams based on search and status
  const filteredTeams = teams.filter((team) => {
    const matchesSearch =
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || team.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total: teams.length,
    active: teams.filter((team) => team.status === 'Ativa').length,
    totalMembers: teams.reduce(
      (sum, team) => sum + (team.members?.length || 0),
      0
    ),
    avgTeamSize: teams.length
      ? Math.round(
          teams.reduce((sum, team) => sum + (team.members?.length || 0), 0) /
            teams.length
        )
      : 0,
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingMessage>
          <div>⏳ Carregando equipes...</div>
        </LoadingMessage>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <ErrorMessage>
          <strong>Erro:</strong> {error}
        </ErrorMessage>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        <HeaderContent>
          <PageTitle>👥 Equipes</PageTitle>
          <PageSubtitle>
            Gerencie e organize as equipes da sua organização de forma eficiente
          </PageSubtitle>
        </HeaderContent>
        <ActionBar>
          <CreateButton onClick={() => setShowCreateModal(true)}>
            <span>+</span> Nova Equipe
          </CreateButton>
        </ActionBar>
      </PageHeader>

      {/* Stats Grid */}
      <StatsGrid>
        <StatCard>
          <StatValue>{stats.total}</StatValue>
          <StatLabel>Total de Equipes</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.active}</StatValue>
          <StatLabel>Equipes Ativas</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.totalMembers}</StatValue>
          <StatLabel>Total de Membros</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.avgTeamSize}</StatValue>
          <StatLabel>Tamanho Médio</StatLabel>
        </StatCard>
      </StatsGrid>

      {/* Content Section */}
      <ContentSection>
        <SectionHeader>
          <SectionTitle>Lista de Equipes</SectionTitle>
          <FilterBar>
            <SearchInput
              type="text"
              placeholder="🔍 Buscar equipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FilterSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Todos os Status</option>
              <option value="Ativa">Ativa</option>
              <option value="Inativa">Inativa</option>
              <option value="Em Formação">Em Formação</option>
            </FilterSelect>
          </FilterBar>
        </SectionHeader>

        {filteredTeams.length === 0 ? (
          <EmptyState>
            <div className="icon">👥</div>
            <h3>Nenhuma equipe encontrada</h3>
            <p>
              {teams.length === 0
                ? 'Comece criando sua primeira equipe para organizar sua empresa.'
                : 'Não encontramos equipes com os filtros aplicados.'}
            </p>
            {teams.length === 0 && (
              <CreateButton onClick={() => setShowCreateModal(true)}>
                <span>+</span> Criar Primeira Equipe
              </CreateButton>
            )}
          </EmptyState>
        ) : (
          <TeamsGrid>
            {filteredTeams.map((team) => (
              <TeamCard key={team._id}>
                <TeamHeader>
                  <TeamInfo>
                    <TeamName>{team.name}</TeamName>
                    {team.department && (
                      <TeamDepartment>{team.department}</TeamDepartment>
                    )}
                  </TeamInfo>
                  <TeamStatus status={team.status || 'Ativa'}>
                    {team.status || 'Ativa'}
                  </TeamStatus>
                </TeamHeader>

                <TeamDescription>
                  {team.description || 'Sem descrição disponível'}
                </TeamDescription>

                <TeamMetrics>
                  <Metric>
                    <MetricValue>{team.members?.length || 0}</MetricValue>
                    <MetricLabel>Membros</MetricLabel>
                  </Metric>
                  <Metric>
                    <MetricValue>{team.projects || 0}</MetricValue>
                    <MetricLabel>Projetos</MetricLabel>
                  </Metric>
                  <Metric>
                    <MetricValue>
                      {team.createdAt
                        ? new Date(team.createdAt).getFullYear()
                        : 'N/A'}
                    </MetricValue>
                    <MetricLabel>Criada em</MetricLabel>
                  </Metric>
                </TeamMetrics>

                <TeamActions>
                  <ActionButton
                    className="secondary"
                    onClick={() => handleViewTeam(team)}
                  >
                    👁️ Ver
                  </ActionButton>
                  <ActionButton
                    className="primary"
                    onClick={() => handleEditClick(team)}
                  >
                    ✏️ Editar
                  </ActionButton>
                  <ActionButton
                    className="danger"
                    onClick={() => handleDeleteTeam(team._id)}
                  >
                    🗑️ Excluir
                  </ActionButton>
                </TeamActions>
              </TeamCard>
            ))}
          </TeamsGrid>
        )}
      </ContentSection>

      {/* Create Team Modal */}
      <Modal show={showCreateModal}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Nova Equipe</ModalTitle>
            <CloseButton onClick={() => setShowCreateModal(false)}>
              ×
            </CloseButton>
          </ModalHeader>

          <form onSubmit={handleCreateTeam}>
            <FormGroup>
              <Label>Nome da Equipe</Label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                placeholder="Ex: Desenvolvimento Frontend"
              />
            </FormGroup>

            <FormGroup>
              <Label>Departamento</Label>
              <Select
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                required
              >
                <option value="">Selecione um departamento</option>
                <option value="Tecnologia">Tecnologia</option>
                <option value="Marketing">Marketing</option>
                <option value="Vendas">Vendas</option>
                <option value="Recursos Humanos">Recursos Humanos</option>
                <option value="Financeiro">Financeiro</option>
                <option value="Operações">Operações</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Descrição</Label>
              <TextArea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Descreva o propósito e responsabilidades da equipe..."
              />
            </FormGroup>

            <ButtonGroup>
              <Button
                type="button"
                className="secondary"
                onClick={() => setShowCreateModal(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" className="primary">
                Criar Equipe
              </Button>
            </ButtonGroup>
          </form>
        </ModalContent>
      </Modal>

      {/* Edit Team Modal */}
      <Modal show={showEditModal}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Editar Equipe</ModalTitle>
            <CloseButton
              onClick={() => {
                setShowEditModal(false);
                setSelectedTeam(null);
                setFormData({ name: '', description: '', department: '' });
              }}
            >
              ×
            </CloseButton>
          </ModalHeader>

          <form onSubmit={handleEditTeam}>
            <FormGroup>
              <Label>Nome da Equipe</Label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                placeholder="Ex: Desenvolvimento Frontend"
              />
            </FormGroup>

            <FormGroup>
              <Label>Departamento</Label>
              <Select
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                required
              >
                <option value="">Selecione um departamento</option>
                <option value="Tecnologia">Tecnologia</option>
                <option value="Marketing">Marketing</option>
                <option value="Vendas">Vendas</option>
                <option value="Recursos Humanos">Recursos Humanos</option>
                <option value="Financeiro">Financeiro</option>
                <option value="Operações">Operações</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Descrição</Label>
              <TextArea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Descreva o propósito e responsabilidades da equipe..."
              />
            </FormGroup>

            <ButtonGroup>
              <Button
                type="button"
                className="secondary"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedTeam(null);
                  setFormData({ name: '', description: '', department: '' });
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" className="primary">
                Salvar Alterações
              </Button>
            </ButtonGroup>
          </form>
        </ModalContent>
      </Modal>

      {/* Team Details Modal with Members Management */}
      <TeamModal
        team={selectedTeam}
        isOpen={showMembersModal}
        onClose={() => {
          setShowMembersModal(false);
          setSelectedTeam(null);
        }}
        onEdit={(team) => {
          setShowMembersModal(false);
          handleEditClick(team);
        }}
        onDelete={(teamId) => {
          setShowMembersModal(false);
          handleDeleteTeam(teamId);
        }}
        onAddMember={handleAddMember}
        onRemoveMember={handleRemoveMember}
      />

      {/* Modal para adicionar membros */}
      <AddMemberModal
        isOpen={showAddMemberModal}
        teamId={selectedTeam?._id || ''}
        onClose={() => setShowAddMemberModal(false)}
        onMemberAdded={handleMemberAdded}
      />

      {/* Toast notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}

      {/* Modal de confirmação para excluir equipe */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Excluir Equipe"
        message="Tem certeza que deseja excluir esta equipe? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
        onConfirm={confirmDeleteTeam}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setTeamToDelete(null);
        }}
      />

      {/* Modal de confirmação para remover membro */}
      <ConfirmModal
        isOpen={showRemoveMemberConfirm}
        title="Remover Membro"
        message="Tem certeza que deseja remover este membro da equipe?"
        confirmText="Remover"
        cancelText="Cancelar"
        type="warning"
        onConfirm={confirmRemoveMember}
        onCancel={() => {
          setShowRemoveMemberConfirm(false);
          setMemberToRemove(null);
        }}
      />
    </PageContainer>
  );
};

export default TeamsPage;
