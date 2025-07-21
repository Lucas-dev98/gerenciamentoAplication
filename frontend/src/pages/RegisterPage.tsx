import React, { useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 400px;
  margin: 40px auto;
  padding: 32px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const Title = styled.h2`
  margin-bottom: 24px;
  text-align: center;
  color: #2d3748;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Label = styled.label`
  font-weight: 500;
  color: #4a5568;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #cbd5e0;
  border-radius: 4px;
  font-size: 1rem;
  outline: none;
  &:focus {
    border-color: #3182ce;
  }
`;

const Button = styled.button`
  padding: 12px;
  background: #3182ce;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #2563eb;
  }
`;

const Error = styled.div`
  color: #e53e3e;
  font-size: 0.95rem;
  margin-bottom: 8px;
`;

const RegisterPage: React.FC = () => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phone: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || 'Erro ao registrar usuário');
      } else {
        setSuccess('Usuário cadastrado com sucesso!');
        setForm({
          username: '',
          email: '',
          password: '',
          fullName: '',
          phone: '',
        });
      }
    } catch (err) {
      setError('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>Cadastro de Usuário</Title>
      {error && <Error>{error}</Error>}
      {success && (
        <div style={{ color: '#38a169', marginBottom: 8 }}>{success}</div>
      )}
      <Form onSubmit={handleSubmit}>
        <Label htmlFor="username">Usuário</Label>
        <Input
          id="username"
          name="username"
          type="text"
          value={form.username}
          onChange={handleChange}
          minLength={3}
          required
        />
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          minLength={6}
          required
        />
        <Label htmlFor="fullName">Nome Completo</Label>
        <Input
          id="fullName"
          name="fullName"
          type="text"
          value={form.fullName}
          onChange={handleChange}
        />
        <Label htmlFor="phone">Telefone</Label>
        <Input
          id="phone"
          name="phone"
          type="text"
          value={form.phone}
          onChange={handleChange}
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </Button>
      </Form>
    </Container>
  );
};

export default RegisterPage;
