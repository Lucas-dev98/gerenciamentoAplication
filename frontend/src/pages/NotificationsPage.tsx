import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isRead: boolean;
  createdAt: string;
}

const Container = styled.div`
  padding: 2rem;
  max-width: 800px;
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

const MarkAllButton = styled.button`
  background-color: #95a5a6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;

  &:hover {
    background-color: #7f8c8d;
  }
`;

const NotificationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const NotificationCard = styled.div<{ isRead: boolean; type: string }>`
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-left: 4px solid
    ${(props) => {
      switch (props.type) {
        case 'success':
          return '#27ae60';
        case 'warning':
          return '#f39c12';
        case 'error':
          return '#e74c3c';
        default:
          return '#3498db';
      }
    }};
  opacity: ${(props) => (props.isRead ? 0.7 : 1)};
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }
`;

const NotificationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
`;

const NotificationTitle = styled.h3`
  color: #2c3e50;
  margin: 0;
  font-size: 1.1rem;
`;

const NotificationDate = styled.span`
  color: #95a5a6;
  font-size: 0.8rem;
`;

const NotificationMessage = styled.p`
  color: #7f8c8d;
  margin: 0;
  line-height: 1.5;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #7f8c8d;
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #95a5a6;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      // Simular dados de notificações
      const mockNotifications: Notification[] = [
        {
          _id: '1',
          title: 'Novo projeto criado',
          message: 'O projeto "Sistema de Gestão EPU" foi criado com sucesso.',
          type: 'success',
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        {
          _id: '2',
          title: 'Reunião agendada',
          message: 'Reunião de acompanhamento marcada para amanhã às 14h.',
          type: 'info',
          isRead: false,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          _id: '3',
          title: 'Prazo se aproximando',
          message:
            'O projeto "Frontend React" tem prazo para entrega em 3 dias.',
          type: 'warning',
          isRead: true,
          createdAt: new Date(Date.now() - 172800000).toISOString(),
        },
      ];

      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true }))
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <LoadingMessage>Carregando notificações...</LoadingMessage>;
  }

  return (
    <Container>
      <Header>
        <Title>Notificações</Title>
        {notifications.some((n) => !n.isRead) && (
          <MarkAllButton onClick={handleMarkAllAsRead}>
            Marcar todas como lidas
          </MarkAllButton>
        )}
      </Header>

      {notifications.length === 0 ? (
        <EmptyMessage>
          📭
          <br />
          Nenhuma notificação encontrada
        </EmptyMessage>
      ) : (
        <NotificationsList>
          {notifications.map((notification) => (
            <NotificationCard
              key={notification._id}
              isRead={notification.isRead}
              type={notification.type}
            >
              <NotificationHeader>
                <NotificationTitle>{notification.title}</NotificationTitle>
                <NotificationDate>
                  {formatDate(notification.createdAt)}
                </NotificationDate>
              </NotificationHeader>
              <NotificationMessage>{notification.message}</NotificationMessage>
            </NotificationCard>
          ))}
        </NotificationsList>
      )}
    </Container>
  );
};

export default NotificationsPage;
