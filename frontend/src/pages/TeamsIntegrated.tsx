import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

// Interface completa integrada com backend
interface Team {
  _id: string;
  name: string;
  description: string;
  department: string;
  color?: string;
  budget?: number;
  isActive: boolean;
  manager?: {
    _id: string;
    name: string;
    position: string;
  };
  createdBy: string;
  goals: Goal[];
  stats: {
    totalMembers: number;
    activeMembers: number;
    birthdaysThisMonth: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface Goal {
  title: string;
  description: string;
  deadline?: string;
  completed: boolean;
}

interface TeamFormData {
  name: string;
  description: string;
  department: string;
  color?: string;
  budget?: number;
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
  text-align: center;
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
  text-align: center;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-3px);
  }
`;

const TeamsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
`;

const TeamCard = styled.div<{ color?: string }>`
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
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${(props) => props.color || '#667eea'};
  }
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.3s ease;
  margin: 0.25rem;

  &.primary {
    background: #667eea;
    color: white;
    &:hover {
      background: #5a6fd8;
    }
  }

  &.success {
    background: #28a745;
    color: white;
    &:hover {
      background: #218838;
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

const CreateButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  margin-top: 1rem;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }
`;

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

const Toast = styled.div<{ show: boolean; type: 'success' | 'error' }>`
  position: fixed;
  top: 2rem;
  right: 2rem;
  background: ${(props) => (props.type === 'success' ? '#28a745' : '#dc3545')};
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  display: ${(props) => (props.show ? 'block' : 'none')};
  z-index: 1001;
  animation: slideIn 0.3s ease;

  @keyframes slideIn {
    from {
      transform: translateX(100%);
    }
    to {
      transform: translateX(0);
    }
  }
`;

const TeamsIntegrated: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState<TeamFormData>({
    name: '',
    description: '',
    department: '',
    color: '#667eea',
    budget: 0,
  });
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    show: false,
    message: '',
    type: 'success',
  });

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchTeams();
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  };

  const fetchTeams = async () => {
    try {
      setLoading(true);
      setError(null);

      // Tentar rota real primeiro
      let response;
      try {
        response = await api.get('/teams');
        console.log('✅ API Teams response:', response.data);
      } catch (apiError: any) {
        console.log(
          '⚠️ API Teams failed, trying test route:',
          apiError.message
        );

        // Fallback para rota de teste
        try {
          response = await api.get('/teams/test');
          console.log('✅ Test route response:', response.data);
        } catch (testError: any) {
          console.log('❌ Test route also failed, using mock data');
          throw new Error('Não foi possível conectar com o backend');
        }
      }

      const teamsData = response.data.data || response.data || [];
      setTeams(Array.isArray(teamsData) ? teamsData : []);
    } catch (error: any) {
      console.error('Error fetching teams:', error);
      setError(error.message);

      // Mock data como último recurso
      const mockTeams: Team[] = [
        {
          _id: '1',
          name: 'Equipe de Desenvolvimento',
          description:
            'Responsável pelo desenvolvimento de software e manutenção de sistemas',
          department: 'Tecnologia',
          color: '#667eea',
          budget: 50000,
          isActive: true,
          createdBy: 'user1',
          goals: [
            {
              title: 'Implementar nova API',
              description: 'Desenvolver API REST',
              completed: false,
            },
          ],
          stats: { totalMembers: 5, activeMembers: 4, birthdaysThisMonth: 1 },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          _id: '2',
          name: 'Equipe de Design',
          description: 'Criação de interfaces e experiência do usuário',
          department: 'Design',
          color: '#e74c3c',
          budget: 30000,
          isActive: true,
          createdBy: 'user2',
          goals: [],
          stats: { totalMembers: 3, activeMembers: 3, birthdaysThisMonth: 0 },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      setTeams(mockTeams);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      console.log('🚀 Creating team with data:', formData);

      // Tentar criar via API real
      const response = await api.post('/teams', formData);
      console.log('✅ Team created successfully:', response.data);

      // Adicionar nova equipe à lista
      const newTeam =
        response.data.data?.team || response.data.data || response.data;
      setTeams((prevTeams) => [...prevTeams, newTeam]);

      // Limpar formulário e fechar modal
      setFormData({
        name: '',
        description: '',
        department: '',
        color: '#667eea',
        budget: 0,
      });
      setShowCreateModal(false);

      showToast('✅ Equipe criada com sucesso!', 'success');

      // Recarregar dados para garantir consistência
      await fetchTeams();
    } catch (error: any) {
      console.error('❌ Error creating team:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Erro ao criar equipe';
      showToast(`❌ ${errorMessage}`, 'error');

      // Para demo, simular criação local se API falhar
      const mockTeam: Team = {
        _id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        department: formData.department,
        color: formData.color || '#667eea',
        budget: formData.budget || 0,
        isActive: true,
        createdBy: 'current-user',
        goals: [],
        stats: { totalMembers: 0, activeMembers: 0, birthdaysThisMonth: 0 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setTeams((prevTeams) => [...prevTeams, mockTeam]);
      setFormData({
        name: '',
        description: '',
        department: '',
        color: '#667eea',
        budget: 0,
      });
      setShowCreateModal(false);
      showToast('⚠️ Equipe criada localmente (API indisponível)', 'success');
    }
  };

  const stats = {
    total: teams.length,
    active: teams.filter((team) => team.isActive).length,
    totalMembers: teams.reduce(
      (sum, team) => sum + (team.stats?.totalMembers || 0),
      0
    ),
    totalBudget: teams.reduce((sum, team) => sum + (team.budget || 0), 0),
  };

  if (loading) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <h2>Carregando equipes...</h2>
          <p>Conectando com o backend...</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        <h1>🏢 Gestão de Equipes Integrada</h1>
        <p>Sistema completo conectado com backend</p>
        <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
          {error
            ? '⚠️ Modo offline - usando dados mock'
            : '✅ Conectado ao backend'}
        </p>
        <CreateButton onClick={() => setShowCreateModal(true)}>
          ➕ Nova Equipe
        </CreateButton>
      </PageHeader>

      {/* Estatísticas */}
      <StatsGrid>
        <StatCard>
          <div
            style={{ fontSize: '2rem', fontWeight: 'bold', color: '#667eea' }}
          >
            {stats.total}
          </div>
          <div style={{ color: '#6c757d' }}>Total de Equipes</div>
        </StatCard>
        <StatCard>
          <div
            style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}
          >
            {stats.active}
          </div>
          <div style={{ color: '#6c757d' }}>Equipes Ativas</div>
        </StatCard>
        <StatCard>
          <div
            style={{ fontSize: '2rem', fontWeight: 'bold', color: '#17a2b8' }}
          >
            {stats.totalMembers}
          </div>
          <div style={{ color: '#6c757d' }}>Total de Membros</div>
        </StatCard>
        <StatCard>
          <div
            style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffc107' }}
          >
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(stats.totalBudget)}
          </div>
          <div style={{ color: '#6c757d' }}>Orçamento Total</div>
        </StatCard>
      </StatsGrid>

      {/* Lista de Equipes */}
      <div
        style={{ background: 'white', borderRadius: '12px', padding: '2rem' }}
      >
        <h2 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>📋 Equipes</h2>

        <TeamsGrid>
          {teams.map((team) => (
            <TeamCard key={team._id} color={team.color}>
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50' }}>
                  {team.name}
                </h3>
                <div
                  style={{
                    display: 'flex',
                    gap: '0.5rem',
                    marginBottom: '0.5rem',
                  }}
                >
                  <span
                    style={{
                      background: '#e3f2fd',
                      color: '#1976d2',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                    }}
                  >
                    {team.department}
                  </span>
                  <span
                    style={{
                      background: team.isActive ? '#e8f5e8' : '#fff3cd',
                      color: team.isActive ? '#2e7d32' : '#f57c00',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                    }}
                  >
                    {team.isActive ? 'Ativa' : 'Inativa'}
                  </span>
                </div>
                <p
                  style={{
                    color: '#6c757d',
                    margin: '0.5rem 0',
                    fontSize: '0.9rem',
                  }}
                >
                  {team.description}
                </p>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '1rem',
                  margin: '1rem 0',
                  padding: '1rem',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      color: '#667eea',
                    }}
                  >
                    {team.stats?.totalMembers || 0}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                    Membros
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      color: '#28a745',
                    }}
                  >
                    {team.goals?.length || 0}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                    Metas
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      color: '#ffc107',
                    }}
                  >
                    {team.budget
                      ? new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                          minimumFractionDigits: 0,
                        }).format(team.budget)
                      : 'N/A'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                    Orçamento
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  justifyContent: 'flex-end',
                  marginTop: '1rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid #e9ecef',
                }}
              >
                <ActionButton className="primary">👁️ Ver</ActionButton>
                <ActionButton className="success">✏️ Editar</ActionButton>
                <ActionButton className="danger">🗑️ Excluir</ActionButton>
              </div>
            </TeamCard>
          ))}
        </TeamsGrid>
      </div>

      {/* Modal de Criação */}
      <Modal show={showCreateModal}>
        <ModalContent>
          <h2 style={{ marginBottom: '1.5rem' }}>➕ Nova Equipe</h2>
          <form onSubmit={handleCreateTeam}>
            <div style={{ marginBottom: '1rem' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                }}
              >
                Nome da Equipe: *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e9ecef',
                  borderRadius: '8px',
                }}
                required
                minLength={3}
                placeholder="Ex: Equipe de Desenvolvimento"
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                }}
              >
                Descrição: *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e9ecef',
                  borderRadius: '8px',
                  minHeight: '100px',
                }}
                required
                placeholder="Descreva o propósito e responsabilidades da equipe"
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                }}
              >
                Departamento: *
              </label>
              <select
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e9ecef',
                  borderRadius: '8px',
                }}
                required
              >
                <option value="">Selecione um departamento</option>
                <option value="Tecnologia">Tecnologia</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Vendas">Vendas</option>
                <option value="RH">Recursos Humanos</option>
                <option value="Financeiro">Financeiro</option>
                <option value="Operações">Operações</option>
                <option value="Qualidade">Qualidade</option>
              </select>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginBottom: '1.5rem',
              }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                  }}
                >
                  Cor da Equipe:
                </label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  style={{
                    width: '100%',
                    height: '45px',
                    border: '2px solid #e9ecef',
                    borderRadius: '8px',
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                  }}
                >
                  Orçamento (R$):
                </label>
                <input
                  type="number"
                  value={formData.budget || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, budget: Number(e.target.value) })
                  }
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e9ecef',
                    borderRadius: '8px',
                  }}
                  min="0"
                  step="1000"
                  placeholder="0"
                />
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'flex-end',
              }}
            >
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#e9ecef',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                Criar Equipe
              </button>
            </div>
          </form>
        </ModalContent>
      </Modal>

      {/* Toast de Notificação */}
      <Toast show={toast.show} type={toast.type}>
        {toast.message}
      </Toast>
    </PageContainer>
  );
};

export default TeamsIntegrated;
