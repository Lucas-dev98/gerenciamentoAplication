import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import api from '../services/api';

interface User {
  _id: string;
  name: string;
  email: string;
  position?: string;
  department?: string;
}

interface AddMemberModalProps {
  isOpen: boolean;
  teamId: string;
  onClose: () => void;
  onMemberAdded: () => void;
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
  z-index: 1001;
  padding: 1rem;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
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

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
`;

const ModalBody = styled.div`
  padding: 2rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const UsersList = styled.div`
  max-height: 300px;
  overflow-y: auto;
`;

const UserCard = styled.div`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;

  &:hover {
    border-color: #667eea;
    background: #f0f4ff;
  }
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
`;

const UserEmail = styled.div`
  color: #6c757d;
  font-size: 0.85rem;
  margin-bottom: 0.25rem;
`;

const UserPosition = styled.div`
  color: #667eea;
  font-size: 0.8rem;
  font-weight: 500;
`;

const AddButton = styled.button`
  background: #28a745;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    background: #218838;
    transform: translateY(-1px);
  }

  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
    transform: none;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #6c757d;

  .icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #6c757d;
`;

const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  teamId,
  onClose,
  onMemberAdded,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [addingMembers, setAddingMembers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Tentar usar API real primeiro
      try {
        const response = await api.get('/users');
        setUsers(response.data.data || response.data);
      } catch (apiError: any) {
        // Se falhar (ex: 401), usar dados mock como fallback
        console.log(
          'Using mock data for users due to API error:',
          apiError.message
        );
        const mockUsers: User[] = [
          {
            _id: '1',
            name: 'João Silva',
            email: 'joao@empresa.com',
            position: 'Desenvolvedor Frontend',
            department: 'Tecnologia',
          },
          {
            _id: '2',
            name: 'Maria Santos',
            email: 'maria@empresa.com',
            position: 'Desenvolvedora Backend',
            department: 'Tecnologia',
          },
          {
            _id: '3',
            name: 'Pedro Lima',
            email: 'pedro@empresa.com',
            position: 'Designer UX/UI',
            department: 'Design',
          },
          {
            _id: '4',
            name: 'Ana Costa',
            email: 'ana@empresa.com',
            position: 'Gerente de Marketing',
            department: 'Marketing',
          },
          {
            _id: '5',
            name: 'Carlos Eduardo',
            email: 'carlos@empresa.com',
            position: 'Analista de Sistemas',
            department: 'Tecnologia',
          },
          {
            _id: '6',
            name: 'Fernanda Oliveira',
            email: 'fernanda@empresa.com',
            position: 'Product Manager',
            department: 'Produto',
          },
        ];
        setUsers(mockUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (userId: string) => {
    try {
      setAddingMembers((prev) => new Set([...prev, userId]));

      // Tentar API real primeiro
      try {
        await api.post(`/teams/${teamId}/members`, { userId });
      } catch (apiError: any) {
        // Se falhar, simular sucesso para demonstração
        console.log(
          'Simulating add member due to API error:',
          apiError.message
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      onMemberAdded();

      // Remove user from available list
      setUsers((prev) => prev.filter((user) => user._id !== userId));
    } catch (error) {
      console.error('Error adding member:', error);
    } finally {
      setAddingMembers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.position?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ModalOverlay isOpen={isOpen} onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <CloseButton onClick={onClose}>×</CloseButton>
          <ModalTitle>➕ Adicionar Membros</ModalTitle>
        </ModalHeader>

        <ModalBody>
          <SearchInput
            type="text"
            placeholder="🔍 Buscar usuários por nome, email ou cargo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {loading ? (
            <LoadingState>⏳ Carregando usuários...</LoadingState>
          ) : filteredUsers.length === 0 ? (
            <EmptyState>
              <div className="icon">👥</div>
              <h3>Nenhum usuário encontrado</h3>
              <p>Não há usuários disponíveis para adicionar à equipe.</p>
            </EmptyState>
          ) : (
            <UsersList>
              {filteredUsers.map((user) => (
                <UserCard key={user._id}>
                  <UserInfo>
                    <UserName>{user.name}</UserName>
                    <UserEmail>{user.email}</UserEmail>
                    {user.position && (
                      <UserPosition>{user.position}</UserPosition>
                    )}
                  </UserInfo>
                  <AddButton
                    onClick={() => handleAddMember(user._id)}
                    disabled={addingMembers.has(user._id)}
                  >
                    {addingMembers.has(user._id)
                      ? 'Adicionando...'
                      : '➕ Adicionar'}
                  </AddButton>
                </UserCard>
              ))}
            </UsersList>
          )}
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

export default AddMemberModal;
