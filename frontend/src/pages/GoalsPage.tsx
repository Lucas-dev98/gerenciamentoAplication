import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  color: #2c3e50;
  margin: 0 0 2rem 0;
`;

const ComingSoon = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Icon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const Message = styled.h2`
  color: #7f8c8d;
  margin: 0 0 1rem 0;
`;

const Description = styled.p`
  color: #95a5a6;
  margin: 0;
`;

const GoalsPage: React.FC = () => {
  return (
    <Container>
      <Title>Metas & Objetivos</Title>
      <ComingSoon>
        <Icon>🎯</Icon>
        <Message>Em Desenvolvimento</Message>
        <Description>
          A página de metas e objetivos estará disponível em breve.
        </Description>
      </ComingSoon>
    </Container>
  );
};

export default GoalsPage;
