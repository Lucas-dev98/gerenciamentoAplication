import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface Team {
  _id: string;
  name: string;
  description: string;
  members: any[];
  leader: any;
  createdAt: string;
  updatedAt: string;
}

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: #2c3e50;
  margin: 0;
`;

const AddButton = styled.button`
  background-color: #3498db;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;

  &:hover {
    background-color: #2980b9;
  }
`;

const TeamsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const TeamCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const TeamName = styled.h3`
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
`;

const TeamDescription = styled.p`
  color: #7f8c8d;
  margin: 0 0 1rem 0;
  line-height: 1.4;
`;

const TeamInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: #95a5a6;
`;

const MemberCount = styled.span`
  background-color: #ecf0f1;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-weight: 500;
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

const TeamsPage: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

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
      setError(error.response?.data?.message || 'Erro ao carregar equipes');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeam = () => {
    // TODO: Implementar modal ou navegação para criação de equipe
    console.log('Add team functionality to be implemented');
  };

  if (loading) {
    return <LoadingMessage>Carregando equipes...</LoadingMessage>;
  }

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  return (
    <Container>
      <Header>
        <Title>Equipes</Title>
        <AddButton onClick={handleAddTeam}>+ Nova Equipe</AddButton>
      </Header>

      {teams.length === 0 ? (
        <LoadingMessage>Nenhuma equipe encontrada</LoadingMessage>
      ) : (
        <TeamsGrid>
          {teams.map((team) => (
            <TeamCard key={team._id}>
              <TeamName>{team.name}</TeamName>
              <TeamDescription>
                {team.description || 'Sem descrição disponível'}
              </TeamDescription>
              <TeamInfo>
                <MemberCount>{team.members?.length || 0} membros</MemberCount>
                <span>{team.leader?.name || 'Sem líder definido'}</span>
              </TeamInfo>
            </TeamCard>
          ))}
        </TeamsGrid>
      )}
    </Container>
  );
};

export default TeamsPage;
