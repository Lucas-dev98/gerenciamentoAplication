import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// Versão mínima para diagnóstico
const TeamsMinimal: React.FC = () => {
  const [message, setMessage] = useState('✅ Teams page loaded successfully!');

  const Container = styled.div`
    padding: 2rem;
    background: #f8f9fa;
    min-height: 100vh;
  `;

  const Header = styled.div`
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 2rem;
    border-radius: 12px;
    text-align: center;
    margin-bottom: 2rem;
  `;

  const Card = styled.div`
    background: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    text-align: center;
  `;

  useEffect(() => {
    console.log('Teams component mounted');
    setMessage('🎉 Teams component is working!');
  }, []);

  return (
    <Container>
      <Header>
        <h1>🏢 Gestão de Equipes</h1>
        <p>Sistema de gerenciamento de equipes e membros</p>
      </Header>

      <Card>
        <h2>{message}</h2>
        <p>
          Esta é uma versão de diagnóstico para verificar se o componente está
          funcionando.
        </p>

        <div style={{ marginTop: '2rem' }}>
          <h3>🔍 Diagnóstico do Sistema:</h3>
          <ul
            style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto' }}
          >
            <li>✅ React importado e funcionando</li>
            <li>✅ Styled-components funcionando</li>
            <li>✅ useState funcionando</li>
            <li>✅ useEffect funcionando</li>
            <li>✅ Componente renderizando corretamente</li>
          </ul>
        </div>

        <div
          style={{
            marginTop: '2rem',
            padding: '1rem',
            background: '#e3f2fd',
            borderRadius: '8px',
          }}
        >
          <h4>📝 Próximos Passos:</h4>
          <p>
            Se você está vendo esta página, o componente básico está
            funcionando. Agora podemos adicionar as funcionalidades completas
            gradualmente.
          </p>
        </div>

        <button
          style={{
            marginTop: '1rem',
            padding: '0.75rem 1.5rem',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
          onClick={() => {
            setMessage('🔄 Sistema funcionando perfeitamente!');
            console.log('Button clicked - Teams system is working!');
          }}
        >
          Testar Interação
        </button>
      </Card>
    </Container>
  );
};

export default TeamsMinimal;
