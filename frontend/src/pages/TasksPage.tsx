import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignedTo: string;
  dueDate: string;
  project?: string;
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
  background-color: #e67e22;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;

  &:hover {
    background-color: #d35400;
  }
`;

const TasksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const TaskCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #3498db;
`;

const TaskTitle = styled.h3`
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
`;

const TaskDescription = styled.p`
  color: #7f8c8d;
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
`;

const TaskMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const StatusBadge = styled.span<{ status: string }>`
  background-color: ${(props) => {
    switch (props.status) {
      case 'completed':
        return '#d4edda';
      case 'in-progress':
        return '#fff3cd';
      default:
        return '#f8d7da';
    }
  }};
  color: ${(props) => {
    switch (props.status) {
      case 'completed':
        return '#155724';
      case 'in-progress':
        return '#856404';
      default:
        return '#721c24';
    }
  }};
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
`;

const PriorityBadge = styled.span<{ priority: string }>`
  background-color: ${(props) => {
    switch (props.priority) {
      case 'high':
        return '#f8d7da';
      case 'medium':
        return '#fff3cd';
      default:
        return '#d1ecf1';
    }
  }};
  color: ${(props) => {
    switch (props.priority) {
      case 'high':
        return '#721c24';
      case 'medium':
        return '#856404';
      default:
        return '#0c5460';
    }
  }};
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #7f8c8d;
`;

const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      // Simular dados de tarefas já que não temos endpoint específico
      setTasks([
        {
          _id: '1',
          title: 'Implementar autenticação',
          description: 'Criar sistema de login e registro',
          status: 'completed',
          priority: 'high',
          assignedTo: 'João Silva',
          dueDate: '2024-01-15',
        },
        {
          _id: '2',
          title: 'Design da interface',
          description: 'Criar protótipos das telas principais',
          status: 'in-progress',
          priority: 'medium',
          assignedTo: 'Maria Santos',
          dueDate: '2024-01-20',
        },
        {
          _id: '3',
          title: 'Testes unitários',
          description: 'Implementar testes para componentes críticos',
          status: 'pending',
          priority: 'low',
          assignedTo: 'Pedro Costa',
          dueDate: '2024-01-25',
        },
      ]);
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleAddTask = () => {
    console.log('Add task functionality to be implemented');
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluída';
      case 'in-progress':
        return 'Em Progresso';
      default:
        return 'Pendente';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Média';
      default:
        return 'Baixa';
    }
  };

  if (loading) {
    return <LoadingMessage>Carregando tarefas...</LoadingMessage>;
  }

  return (
    <Container>
      <Header>
        <Title>Tarefas</Title>
        <AddButton onClick={handleAddTask}>+ Nova Tarefa</AddButton>
      </Header>

      {tasks.length === 0 ? (
        <LoadingMessage>Nenhuma tarefa encontrada</LoadingMessage>
      ) : (
        <TasksGrid>
          {tasks.map((task) => (
            <TaskCard key={task._id}>
              <TaskTitle>{task.title}</TaskTitle>
              <TaskDescription>{task.description}</TaskDescription>
              <TaskMeta>
                <div>
                  <StatusBadge status={task.status}>
                    {getStatusText(task.status)}
                  </StatusBadge>
                </div>
                <div>
                  <PriorityBadge priority={task.priority}>
                    {getPriorityText(task.priority)}
                  </PriorityBadge>
                </div>
              </TaskMeta>
            </TaskCard>
          ))}
        </TasksGrid>
      )}
    </Container>
  );
};

export default TasksPage;
