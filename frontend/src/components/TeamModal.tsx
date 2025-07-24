import React, { useState } from 'react';
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

interface Member {
  _id: string;
  name: string;
  email: string;
  position?: string;
  avatar?: string;
  joinedAt?: string;
}

interface TeamModalProps {
  team: Team | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (team: Team) => void;
  onDelete?: (teamId: string) => void;
  onAddMember?: (teamId: string) => void;
  onRemoveMember?: (teamId: string, memberId: string) => void;
}

const ModalOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: ${(props) => (props.isOpen ? 'flex' : 'none')};
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  transform: scale(1);
  transition: all 0.3s ease;
`;

const ModalHeader = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 16px 16px 0 0;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }
`;

const TeamTitle = styled.h1`
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 600;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const TeamMetaInfo = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  opacity: 0.9;
`;

const MetaBadge = styled.span`
  background: rgba(255, 255, 255, 0.2);
  padding: 0.375rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
`;

const ModalBody = styled.div`
  padding: 2rem;
`;

const Section = styled.div`
  margin-bottom: 2rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h2`
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.3rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const InfoCard = styled.div`
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
  border-left: 4px solid #667eea;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const InfoLabel = styled.div`
  color: #6c757d;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
`;

const InfoValue = styled.div`
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
`;

const Description = styled.div`
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
  color: #495057;
  line-height: 1.6;
  font-size: 0.95rem;
  border-left: 4px solid #28a745;
`;

const MembersList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
`;

const MemberCard = styled.div`
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;

  &:hover {
    border-color: #667eea;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
  }
`;

const MemberAvatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1.2rem;
  flex-shrink: 0;
`;

const MemberInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const MemberName = styled.div`
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
`;

const MemberEmail = styled.div`
  color: #6c757d;
  font-size: 0.85rem;
  margin-bottom: 0.25rem;
`;

const MemberPosition = styled.div`
  color: #667eea;
  font-size: 0.8rem;
  font-weight: 500;
`;

const MemberActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const MemberActionBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.3s ease;

  &:hover {
    background: #f8f9fa;
  }

  &.danger:hover {
    background: #ffebee;
    color: #d32f2f;
  }
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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

const ActionBar = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1.5rem 2rem;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
  border-radius: 0 0 16px 16px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ActionButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &.primary {
    background: #667eea;
    color: white;

    &:hover {
      background: #5a6fd8;
      transform: translateY(-2px);
    }
  }

  &.secondary {
    background: #28a745;
    color: white;

    &:hover {
      background: #218838;
      transform: translateY(-2px);
    }
  }

  &.danger {
    background: #dc3545;
    color: white;

    &:hover {
      background: #c82333;
      transform: translateY(-2px);
    }
  }
`;

const EmptyMembers = styled.div`
  text-align: center;
  padding: 3rem 1rem;
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
    margin: 0 0 1.5rem 0;
  }
`;

const TabContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #e9ecef;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  cursor: pointer;
  font-weight: 500;
  color: ${(props) => (props.active ? '#667eea' : '#6c757d')};
  border-bottom: 2px solid
    ${(props) => (props.active ? '#667eea' : 'transparent')};
  transition: all 0.3s ease;

  &:hover {
    color: #667eea;
  }
`;

const TeamModal: React.FC<TeamModalProps> = ({
  team,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onAddMember,
  onRemoveMember,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'members'>('info');

  if (!team) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <ModalOverlay isOpen={isOpen} onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <CloseButton onClick={onClose}>×</CloseButton>
          <TeamTitle>{team.name}</TeamTitle>
          <TeamMetaInfo>
            <MetaBadge>📅 Criada em {formatDate(team.createdAt)}</MetaBadge>
            <MetaBadge>🏢 {team.department || 'Sem departamento'}</MetaBadge>
            <StatusBadge status={team.status || 'Ativa'}>
              {team.status || 'Ativa'}
            </StatusBadge>
          </TeamMetaInfo>
        </ModalHeader>

        <ModalBody>
          <TabContainer>
            <Tab
              active={activeTab === 'info'}
              onClick={() => setActiveTab('info')}
            >
              📋 Informações
            </Tab>
            <Tab
              active={activeTab === 'members'}
              onClick={() => setActiveTab('members')}
            >
              👥 Membros ({team.members?.length || 0})
            </Tab>
          </TabContainer>

          {activeTab === 'info' && (
            <>
              <Section>
                <InfoGrid>
                  <InfoCard>
                    <InfoLabel>👥 Membros</InfoLabel>
                    <InfoValue>{team.members?.length || 0}</InfoValue>
                  </InfoCard>
                  <InfoCard>
                    <InfoLabel>📊 Projetos</InfoLabel>
                    <InfoValue>{team.projects || 0}</InfoValue>
                  </InfoCard>
                  <InfoCard>
                    <InfoLabel>👑 Líder</InfoLabel>
                    <InfoValue>{team.leader?.name || 'Não definido'}</InfoValue>
                  </InfoCard>
                  <InfoCard>
                    <InfoLabel>📅 Última Atualização</InfoLabel>
                    <InfoValue>{formatDate(team.updatedAt)}</InfoValue>
                  </InfoCard>
                </InfoGrid>
              </Section>

              <Section>
                <SectionTitle>📝 Descrição</SectionTitle>
                <Description>
                  {team.description ||
                    'Nenhuma descrição foi fornecida para esta equipe.'}
                </Description>
              </Section>
            </>
          )}

          {activeTab === 'members' && (
            <Section>
              <SectionTitle>
                👥 Membros da Equipe
                <ActionButton
                  className="secondary"
                  onClick={() => onAddMember?.(team._id)}
                  style={{
                    marginLeft: 'auto',
                    fontSize: '0.8rem',
                    padding: '0.5rem 1rem',
                  }}
                >
                  ➕ Adicionar Membro
                </ActionButton>
              </SectionTitle>

              {team.members && team.members.length > 0 ? (
                <MembersList>
                  {team.members.map((member: Member) => (
                    <MemberCard key={member._id}>
                      <MemberAvatar>
                        {member.avatar ? (
                          <img src={member.avatar} alt={member.name} />
                        ) : (
                          getInitials(member.name)
                        )}
                      </MemberAvatar>
                      <MemberInfo>
                        <MemberName>{member.name}</MemberName>
                        <MemberEmail>{member.email}</MemberEmail>
                        {member.position && (
                          <MemberPosition>{member.position}</MemberPosition>
                        )}
                      </MemberInfo>
                      <MemberActions>
                        <MemberActionBtn
                          title="Remover membro"
                          className="danger"
                          onClick={() => onRemoveMember?.(team._id, member._id)}
                        >
                          🗑️
                        </MemberActionBtn>
                      </MemberActions>
                    </MemberCard>
                  ))}
                </MembersList>
              ) : (
                <EmptyMembers>
                  <div className="icon">👥</div>
                  <h3>Nenhum membro na equipe</h3>
                  <p>Esta equipe ainda não possui membros cadastrados.</p>
                  <ActionButton
                    className="secondary"
                    onClick={() => onAddMember?.(team._id)}
                  >
                    ➕ Adicionar Primeiro Membro
                  </ActionButton>
                </EmptyMembers>
              )}
            </Section>
          )}
        </ModalBody>

        <ActionBar>
          <ActionButton className="danger" onClick={() => onDelete?.(team._id)}>
            🗑️ Excluir Equipe
          </ActionButton>
          <ActionButton className="primary" onClick={() => onEdit?.(team)}>
            ✏️ Editar Equipe
          </ActionButton>
        </ActionBar>
      </ModalContent>
    </ModalOverlay>
  );
};

export default TeamModal;
