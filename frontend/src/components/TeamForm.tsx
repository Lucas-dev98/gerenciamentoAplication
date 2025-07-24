import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

interface Team {
  _id?: string;
  name: string;
  description: string;
  department: string;
  leaderId?: string;
  status?: 'Ativa' | 'Inativa' | 'Em Formação';
}

interface User {
  _id: string;
  name: string;
  email: string;
  position?: string;
}

interface TeamFormProps {
  team?: Team;
  users?: User[];
  onSubmit: (teamData: Team) => void;
  onCancel: () => void;
  loading?: boolean;
  isEditing?: boolean;
}

const FormContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  width: 100%;
`;

const FormHeader = styled.div`
  margin-bottom: 2rem;
  text-align: center;
`;

const FormTitle = styled.h2`
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 600;
`;

const FormSubtitle = styled.p`
  margin: 0;
  color: #6c757d;
  font-size: 0.9rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }

  &.full-width {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: #2c3e50;
  font-weight: 600;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;

  .required {
    color: #e74c3c;
  }
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  background: white;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #adb5bd;
  }

  &:disabled {
    background: #f8f9fa;
    color: #6c757d;
    cursor: not-allowed;
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.9rem;
  min-height: 100px;
  resize: vertical;
  transition: all 0.3s ease;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #adb5bd;
  }

  &:disabled {
    background: #f8f9fa;
    color: #6c757d;
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.9rem;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &:disabled {
    background: #f8f9fa;
    color: #6c757d;
    cursor: not-allowed;
  }
`;

const FormSection = styled.div`
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #667eea;
`;

const SectionTitle = styled.h3`
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e9ecef;

  @media (max-width: 768px) {
    flex-direction: column-reverse;
  }
`;

const Button = styled.button`
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-width: 120px;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }
  }

  &.secondary {
    background: #e9ecef;
    color: #6c757d;

    &:hover:not(:disabled) {
      background: #dee2e6;
      color: #495057;
    }
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const CharacterCount = styled.div<{ isNearLimit: boolean }>`
  font-size: 0.8rem;
  text-align: right;
  margin-top: 0.25rem;
  color: ${(props) => (props.isNearLimit ? '#f39c12' : '#6c757d')};
`;

const departments = [
  'Tecnologia',
  'Marketing',
  'Vendas',
  'Recursos Humanos',
  'Financeiro',
  'Operações',
  'Jurídico',
  'Qualidade',
  'Logística',
  'Atendimento ao Cliente',
];

const statusOptions = [
  { value: 'Ativa', label: '🟢 Ativa' },
  { value: 'Inativa', label: '🔴 Inativa' },
  { value: 'Em Formação', label: '🟡 Em Formação' },
];

const TeamForm: React.FC<TeamFormProps> = ({
  team,
  users = [],
  onSubmit,
  onCancel,
  loading = false,
  isEditing = false,
}) => {
  const [formData, setFormData] = useState<Team>({
    name: '',
    description: '',
    department: '',
    leaderId: '',
    status: 'Ativa',
    ...team,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (team) {
      setFormData({ ...team });
    }
  }, [team]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome da equipe é obrigatório';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Nome não pode ter mais de 50 caracteres';
    }

    if (!formData.department) {
      newErrors.department = 'Departamento é obrigatório';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Descrição não pode ter mais de 500 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof Team, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <FormContainer>
      <FormHeader>
        <FormTitle>
          {isEditing ? '✏️ Editar Equipe' : '➕ Nova Equipe'}
        </FormTitle>
        <FormSubtitle>
          {isEditing
            ? 'Atualize as informações da equipe abaixo'
            : 'Preencha as informações para criar uma nova equipe'}
        </FormSubtitle>
      </FormHeader>

      <Form onSubmit={handleSubmit}>
        <FormSection>
          <SectionTitle>📋 Informações Básicas</SectionTitle>

          <FormRow>
            <FormGroup>
              <Label>
                Nome da Equipe <span className="required">*</span>
              </Label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ex: Desenvolvimento Frontend"
                disabled={loading}
                maxLength={50}
              />
              {errors.name && <ErrorMessage>❌ {errors.name}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label>
                Departamento <span className="required">*</span>
              </Label>
              <Select
                value={formData.department}
                onChange={(e) =>
                  handleInputChange('department', e.target.value)
                }
                disabled={loading}
              >
                <option value="">Selecione um departamento</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </Select>
              {errors.department && (
                <ErrorMessage>❌ {errors.department}</ErrorMessage>
              )}
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <Label>Líder da Equipe</Label>
              <Select
                value={formData.leaderId || ''}
                onChange={(e) => handleInputChange('leaderId', e.target.value)}
                disabled={loading}
              >
                <option value="">Selecione um líder (opcional)</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} {user.position ? `- ${user.position}` : ''}
                  </option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Status da Equipe</Label>
              <Select
                value={formData.status || 'Ativa'}
                onChange={(e) => handleInputChange('status', e.target.value)}
                disabled={loading}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FormGroup>
          </FormRow>

          <FormRow className="full-width">
            <FormGroup>
              <Label>Descrição</Label>
              <TextArea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange('description', e.target.value)
                }
                placeholder="Descreva o propósito, responsabilidades e objetivos da equipe..."
                disabled={loading}
                maxLength={500}
              />
              <CharacterCount
                isNearLimit={(formData.description?.length || 0) > 450}
              >
                {formData.description?.length || 0}/500 caracteres
              </CharacterCount>
              {errors.description && (
                <ErrorMessage>❌ {errors.description}</ErrorMessage>
              )}
            </FormGroup>
          </FormRow>
        </FormSection>

        <ButtonGroup>
          <Button
            type="button"
            className="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            ❌ Cancelar
          </Button>
          <Button type="submit" className="primary" disabled={loading}>
            {loading ? (
              <>⏳ Processando...</>
            ) : (
              <>{isEditing ? '💾 Atualizar' : '✅ Criar'} Equipe</>
            )}
          </Button>
        </ButtonGroup>
      </Form>
    </FormContainer>
  );
};

export default TeamForm;
