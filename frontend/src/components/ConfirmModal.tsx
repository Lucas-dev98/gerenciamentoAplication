import React from 'react';
import styled from 'styled-components';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
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
  z-index: 10000;
  padding: 1rem;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  animation: modalEnter 0.3s ease-out;

  @keyframes modalEnter {
    from {
      opacity: 0;
      transform: scale(0.9) translateY(-20px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
`;

const ModalHeader = styled.div<{ type: ConfirmModalProps['type'] }>`
  padding: 2rem 2rem 1rem 2rem;
  text-align: center;

  .icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem auto;
    font-size: 1.5rem;

    ${(props) => {
      switch (props.type) {
        case 'danger':
          return `
            background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
            color: #dc2626;
          `;
        case 'warning':
          return `
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            color: #d97706;
          `;
        default:
          return `
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            color: #2563eb;
          `;
      }
    }}
  }
`;

const ModalTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
`;

const ModalMessage = styled.p`
  margin: 0;
  color: #6b7280;
  line-height: 1.5;
`;

const ModalFooter = styled.div`
  padding: 1rem 2rem 2rem 2rem;
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;

  @media (max-width: 480px) {
    flex-direction: column-reverse;
  }
`;

const Button = styled.button<{
  variant: 'primary' | 'secondary';
  type?: ConfirmModalProps['type'];
}>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 100px;

  ${(props) => {
    if (props.variant === 'primary') {
      switch (props.type) {
        case 'danger':
          return `
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
            color: white;
            &:hover {
              background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
              transform: translateY(-1px);
              box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
            }
          `;
        case 'warning':
          return `
            background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
            color: white;
            &:hover {
              background: linear-gradient(135deg, #b45309 0%, #92400e 100%);
              transform: translateY(-1px);
              box-shadow: 0 4px 12px rgba(217, 119, 6, 0.3);
            }
          `;
        default:
          return `
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            color: white;
            &:hover {
              background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
              transform: translateY(-1px);
              box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
            }
          `;
      }
    } else {
      return `
        background: #f9fafb;
        color: #374151;
        border: 1px solid #d1d5db;
        &:hover {
          background: #f3f4f6;
          border-color: #9ca3af;
          transform: translateY(-1px);
        }
      `;
    }
  }}

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 480px) {
    width: 100%;
  }
`;

const getIcon = (type: ConfirmModalProps['type']): string => {
  switch (type) {
    case 'danger':
      return '⚠️';
    case 'warning':
      return '⚠️';
    default:
      return 'ℹ️';
  }
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'danger',
  onConfirm,
  onCancel,
}) => {
  return (
    <ModalOverlay isOpen={isOpen} onClick={onCancel}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader type={type}>
          <div className="icon">{getIcon(type)}</div>
          <ModalTitle>{title}</ModalTitle>
          <ModalMessage>{message}</ModalMessage>
        </ModalHeader>

        <ModalFooter>
          <Button variant="secondary" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button variant="primary" type={type} onClick={onConfirm}>
            {confirmText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ConfirmModal;
