import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// Versão simplificada do Teams para teste
const SimpleTeamsPage: React.FC = () => {
  const [teams, setTeams] = useState([
    {
      _id: '1',
      name: 'Equipe de Desenvolvimento',
      description: 'Responsável pelo desenvolvimento de software',
      department: 'Tecnologia',
      status: 'Ativa',
      members: [
        { _id: '1', name: 'João Silva', email: 'joao@empresa.com' },
        { _id: '2', name: 'Maria Santos', email: 'maria@empresa.com' },
      ],
    },
    {
      _id: '2',
      name: 'Equipe de Design',
      description: 'Responsável pelo design e UX/UI',
      department: 'Design',
      status: 'Ativa',
      members: [{ _id: '3', name: 'Pedro Lima', email: 'pedro@empresa.com' }],
    },
  ]);

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
    text-align: center;
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
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    border-left: 4px solid #667eea;
  `;

  const TeamName = styled.h3`
    margin: 0 0 0.5rem 0;
    color: #2c3e50;
  `;

  const TeamDescription = styled.p`
    color: #6c757d;
    margin: 0.5rem 0;
  `;

  const TeamInfo = styled.div`
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e9ecef;
  `;

  const Badge = styled.span`
    background: #e3f2fd;
    color: #1976d2;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.8rem;
    margin-right: 0.5rem;
  `;

  return (
    <PageContainer>
      <PageHeader>
        <h1>🏢 Gestão de Equipes</h1>
        <p>Gerencie suas equipes e membros de forma eficiente</p>
      </PageHeader>

      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h2>📊 Estatísticas</h2>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              background: 'white',
              padding: '1rem',
              borderRadius: '8px',
              minWidth: '150px',
            }}
          >
            <div
              style={{ fontSize: '2rem', fontWeight: 'bold', color: '#667eea' }}
            >
              {teams.length}
            </div>
            <div style={{ color: '#6c757d' }}>Total de Equipes</div>
          </div>
          <div
            style={{
              background: 'white',
              padding: '1rem',
              borderRadius: '8px',
              minWidth: '150px',
            }}
          >
            <div
              style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}
            >
              {teams.filter((t) => t.status === 'Ativa').length}
            </div>
            <div style={{ color: '#6c757d' }}>Equipes Ativas</div>
          </div>
          <div
            style={{
              background: 'white',
              padding: '1rem',
              borderRadius: '8px',
              minWidth: '150px',
            }}
          >
            <div
              style={{ fontSize: '2rem', fontWeight: 'bold', color: '#17a2b8' }}
            >
              {teams.reduce((sum, team) => sum + team.members.length, 0)}
            </div>
            <div style={{ color: '#6c757d' }}>Total de Membros</div>
          </div>
        </div>
      </div>

      <div
        style={{ background: 'white', borderRadius: '12px', padding: '2rem' }}
      >
        <h2 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>
          📋 Lista de Equipes
        </h2>

        <TeamsGrid>
          {teams.map((team) => (
            <TeamCard key={team._id}>
              <TeamName>{team.name}</TeamName>
              <TeamDescription>{team.description}</TeamDescription>

              <div style={{ margin: '1rem 0' }}>
                <Badge>{team.department}</Badge>
                <Badge
                  style={{
                    background: team.status === 'Ativa' ? '#e8f5e8' : '#fff3cd',
                    color: team.status === 'Ativa' ? '#2e7d32' : '#f57c00',
                  }}
                >
                  {team.status}
                </Badge>
              </div>

              <TeamInfo>
                <div style={{ fontWeight: '500', marginBottom: '0.5rem' }}>
                  👥 Membros ({team.members.length}):
                </div>
                {team.members.map((member, index) => (
                  <div
                    key={member._id}
                    style={{
                      fontSize: '0.9rem',
                      color: '#6c757d',
                      marginLeft: '1rem',
                    }}
                  >
                    • {member.name} ({member.email})
                  </div>
                ))}
              </TeamInfo>

              <div
                style={{
                  marginTop: '1rem',
                  display: 'flex',
                  gap: '0.5rem',
                  justifyContent: 'flex-end',
                }}
              >
                <button
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  👁️ Ver Detalhes
                </button>
                <button
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  ✏️ Editar
                </button>
              </div>
            </TeamCard>
          ))}
        </TeamsGrid>

        <div
          style={{
            marginTop: '2rem',
            textAlign: 'center',
            padding: '2rem',
            background: '#f8f9fa',
            borderRadius: '8px',
          }}
        >
          <h3>🚀 Funcionalidades Disponíveis</h3>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '2rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem' }}>➕</div>
              <div>Criar Equipes</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem' }}>👥</div>
              <div>Gerenciar Membros</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem' }}>📊</div>
              <div>Visualizar Estatísticas</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem' }}>🔔</div>
              <div>Notificações</div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default SimpleTeamsPage;
