import React from 'react';
import styled from 'styled-components';

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

interface TeamListProps {
  teams: Team[];
  onTeamSelect?: (team: Team) => void;
  onTeamEdit?: (team: Team) => void;
  onTeamDelete?: (teamId: string) => void;
  loading?: boolean;
}

const ListContainer = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const ListHeader = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 1.5rem;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 120px;
  gap: 1rem;
  font-weight: 600;
  font-size: 0.9rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    text-align: center;
  }
`;

const ListItem = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 120px;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e9ecef;
  align-items: center;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    background: #f8f9fa;
  }

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    text-align: center;
    padding: 1rem;
  }
`;

const TeamInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const TeamName = styled.div`
  font-weight: 600;
  color: #2c3e50;
  font-size: 1rem;
`;

const TeamDescription = styled.div`
  color: #6c757d;
  font-size: 0.85rem;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Department = styled.div`
  color: #495057;
  font-size: 0.9rem;

  @media (max-width: 768px) {
    font-weight: 500;
  }
`;

const MemberCount = styled.div`
  color: #495057;
  font-size: 0.9rem;

  .number {
    font-weight: 600;
    color: #667eea;
  }
`;

const Status = styled.span<{ status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  text-align: center;
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

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const ActionButton = styled.button`
  padding: 0.375rem 0.75rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.3s ease;

  &.view {
    background: #e3f2fd;
    color: #1976d2;

    &:hover {
      background: #bbdefb;
    }
  }

  &.edit {
    background: #fff3e0;
    color: #f57c00;

    &:hover {
      background: #ffe0b2;
    }
  }

  &.delete {
    background: #ffebee;
    color: #d32f2f;

    &:hover {
      background: #ffcdd2;
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1.5rem;
  color: #6c757d;

  .icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  h3 {
    margin: 0 0 0.5rem 0;
    color: #495057;
  }

  p {
    margin: 0;
    line-height: 1.5;
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 3rem 1.5rem;
  color: #6c757d;
`;

const MobileLabel = styled.span`
  display: none;
  font-weight: 600;
  color: #495057;
  margin-right: 0.5rem;

  @media (max-width: 768px) {
    display: inline;
  }
`;

const TeamList: React.FC<TeamListProps> = ({
  teams,
  onTeamSelect,
  onTeamEdit,
  onTeamDelete,
  loading = false,
}) => {
  if (loading) {
    return (
      <ListContainer>
        <LoadingState>
          <div>⏳ Carregando equipes...</div>
        </LoadingState>
      </ListContainer>
    );
  }

  if (teams.length === 0) {
    return (
      <ListContainer>
        <EmptyState>
          <div className="icon">👥</div>
          <h3>Nenhuma equipe encontrada</h3>
          <p>As equipes aparecerão aqui quando forem criadas.</p>
        </EmptyState>
      </ListContainer>
    );
  }

  return (
    <ListContainer>
      <ListHeader>
        <div>Equipe</div>
        <div>Departamento</div>
        <div>Membros</div>
        <div>Status</div>
        <div>Ações</div>
      </ListHeader>

      {teams.map((team) => (
        <ListItem key={team._id} onClick={() => onTeamSelect?.(team)}>
          <TeamInfo>
            <TeamName>{team.name}</TeamName>
            <TeamDescription>
              {team.description || 'Sem descrição disponível'}
            </TeamDescription>
          </TeamInfo>

          <Department>
            <MobileLabel>Departamento:</MobileLabel>
            {team.department || 'Não definido'}
          </Department>

          <MemberCount>
            <MobileLabel>Membros:</MobileLabel>
            <span className="number">{team.members?.length || 0}</span>
            {team.members?.length === 1 ? ' membro' : ' membros'}
          </MemberCount>

          <div>
            <MobileLabel>Status:</MobileLabel>
            <Status status={team.status || 'Ativa'}>
              {team.status || 'Ativa'}
            </Status>
          </div>

          <Actions onClick={(e) => e.stopPropagation()}>
            <ActionButton
              className="view"
              onClick={() => onTeamSelect?.(team)}
              title="Ver detalhes"
            >
              👁️
            </ActionButton>
            <ActionButton
              className="edit"
              onClick={() => onTeamEdit?.(team)}
              title="Editar equipe"
            >
              ✏️
            </ActionButton>
            <ActionButton
              className="delete"
              onClick={() => onTeamDelete?.(team._id)}
              title="Excluir equipe"
            >
              🗑️
            </ActionButton>
          </Actions>
        </ListItem>
      ))}
    </ListContainer>
  );
};

export default TeamList;
