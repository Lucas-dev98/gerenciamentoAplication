import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// Versão funcional e robusta do Teams
interface Team {
  _id: string;
  name: string;
  description: string;
  members: Member[];
  leader?: Member;
  createdAt: string;
  updatedAt: string;
  status?: 'Ativa' | 'Inativa' | 'Em Formação';
  department?: string;
  projects?: number;
}

interface Member {
  _id: string;
  name: string;
  email: string;
  position?: string;
  avatar?: string;
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

const TeamsPageWorking: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    department: '',
  });

  // Mock data
  useEffect(() => {
    // Simular carregamento
    setTimeout(() => {
      const mockTeams: Team[] = [
        {
          _id: '1',
          name: 'Equipe de Desenvolvimento',
          description:
            'Responsável pelo desenvolvimento de software e manutenção de sistemas',
          department: 'Tecnologia',
          status: 'Ativa',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-03-20T15:30:00Z',
          projects: 5,
          members: [
            {
              _id: '1',
              name: 'João Silva',
              email: 'joao@empresa.com',
              position: 'Desenvolvedor Frontend',
            },
            {
              _id: '2',
              name: 'Maria Santos',
              email: 'maria@empresa.com',
              position: 'Desenvolvedora Backend',
            },
            {
              _id: '3',
              name: 'Carlos Lima',
              email: 'carlos@empresa.com',
              position: 'DevOps Engineer',
            },
          ],
        },
        {
          _id: '2',
          name: 'Equipe de Design',
          description: 'Criação de interfaces e experiência do usuário',
          department: 'Design',
          status: 'Ativa',
          createdAt: '2024-02-01T09:00:00Z',
          updatedAt: '2024-03-15T14:00:00Z',
          projects: 3,
          members: [
            {
              _id: '4',
              name: 'Ana Costa',
              email: 'ana@empresa.com',
              position: 'UI/UX Designer',
            },
            {
              _id: '5',
              name: 'Pedro Oliveira',
              email: 'pedro@empresa.com',
              position: 'Motion Designer',
            },
          ],
        },
        {
          _id: '3',
          name: 'Equipe de Marketing',
          description: 'Estratégias de marketing digital e comunicação',
          department: 'Marketing',
          status: 'Em Formação',
          createdAt: '2024-03-01T11:00:00Z',
          updatedAt: '2024-03-10T16:45:00Z',
          projects: 2,
          members: [
            {
              _id: '6',
              name: 'Fernanda Silva',
              email: 'fernanda@empresa.com',
              position: 'Marketing Manager',
            },
          ],
        },
      ];
      setTeams(mockTeams);
      setLoading(false);
    }, 1000);
  }, []);

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    const newTeam: Team = {
      _id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      department: formData.department,
      status: 'Em Formação',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      members: [],
      projects: 0,
    };
    setTeams([...teams, newTeam]);
    setFormData({ name: '', description: '', department: '' });
    setShowCreateModal(false);
  };

  const stats = {
    total: teams.length,
    active: teams.filter((team) => team.status === 'Ativa').length,
    totalMembers: teams.reduce((sum, team) => sum + team.members.length, 0),
    avgTeamSize: teams.length
      ? Math.round(
          teams.reduce((sum, team) => sum + team.members.length, 0) /
            teams.length
        )
      : 0,
  };

  if (loading) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <h2>Carregando equipes...</h2>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        <h1>🏢 Gestão de Equipes</h1>
        <p>Gerencie suas equipes e membros de forma eficiente</p>
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
            {stats.avgTeamSize}
          </div>
          <div style={{ color: '#6c757d' }}>Média por Equipe</div>
        </StatCard>
      </StatsGrid>

      {/* Lista de Equipes */}
      <div
        style={{ background: 'white', borderRadius: '12px', padding: '2rem' }}
      >
        <h2 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>📋 Equipes</h2>

        <TeamsGrid>
          {teams.map((team) => (
            <TeamCard key={team._id}>
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
                      background:
                        team.status === 'Ativa' ? '#e8f5e8' : '#fff3cd',
                      color: team.status === 'Ativa' ? '#2e7d32' : '#f57c00',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                    }}
                  >
                    {team.status}
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
                    {team.members.length}
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
                    {team.projects || 0}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                    Projetos
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      color: '#ffc107',
                    }}
                  >
                    {new Date(team.createdAt).toLocaleDateString()}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                    Criada em
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
                Nome da Equipe:
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
                Descrição:
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
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                }}
              >
                Departamento:
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
              </select>
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
    </PageContainer>
  );
};

export default TeamsPageWorking;
