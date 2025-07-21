import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface Member {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  role: string;
  team?: string;
  isActive: boolean;
  createdAt: string;
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
  background-color: #27ae60;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;

  &:hover {
    background-color: #229954;
  }
`;

const MembersTable = styled.div`
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 2fr 1.5fr 1fr 1fr;
  background-color: #f8f9fa;
  padding: 1rem;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 1px solid #e9ecef;
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 2fr 1.5fr 1fr 1fr;
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f8f9fa;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const StatusBadge = styled.span<{ isActive: boolean }>`
  background-color: ${(props) => (props.isActive ? '#d4edda' : '#f8d7da')};
  color: ${(props) => (props.isActive ? '#155724' : '#721c24')};
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
`;

const RoleBadge = styled.span`
  background-color: #e3f2fd;
  color: #1565c0;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.85rem;
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

const MembersPage: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchMembers();
    }
  }, [isAuthenticated]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setMembers(response.data.data || response.data);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching members:', error);
      setError(error.response?.data?.message || 'Erro ao carregar membros');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = () => {
    // TODO: Implementar modal ou navegação para criação de membro
    console.log('Add member functionality to be implemented');
  };

  if (loading) {
    return <LoadingMessage>Carregando membros...</LoadingMessage>;
  }

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  return (
    <Container>
      <Header>
        <Title>Membros</Title>
        <AddButton onClick={handleAddMember}>+ Novo Membro</AddButton>
      </Header>

      {members.length === 0 ? (
        <LoadingMessage>Nenhum membro encontrado</LoadingMessage>
      ) : (
        <MembersTable>
          <TableHeader>
            <div>Nome</div>
            <div>Email</div>
            <div>Telefone</div>
            <div>Função</div>
            <div>Status</div>
          </TableHeader>
          {members.map((member) => (
            <TableRow key={member._id}>
              <div>{member.fullName || member.username}</div>
              <div>{member.email}</div>
              <div>{member.phone || '-'}</div>
              <div>
                <RoleBadge>{member.role || 'user'}</RoleBadge>
              </div>
              <div>
                <StatusBadge isActive={member.isActive !== false}>
                  {member.isActive !== false ? 'Ativo' : 'Inativo'}
                </StatusBadge>
              </div>
            </TableRow>
          ))}
        </MembersTable>
      )}
    </Container>
  );
};

export default MembersPage;
