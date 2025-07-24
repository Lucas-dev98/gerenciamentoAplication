import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onClose: () => void;
}

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const ToastContainer = styled.div<{
  type: ToastProps['type'];
  isClosing: boolean;
}>`
  position: fixed;
  top: 2rem;
  right: 2rem;
  min-width: 300px;
  max-width: 500px;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  color: white;
  font-weight: 500;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  z-index: 10000;
  animation: ${(props) => (props.isClosing ? slideOut : slideIn)} 0.3s ease-out
    forwards;
  cursor: pointer;

  ${(props) => {
    switch (props.type) {
      case 'success':
        return `
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border: 1px solid rgba(16, 185, 129, 0.3);
        `;
      case 'error':
        return `
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          border: 1px solid rgba(239, 68, 68, 0.3);
        `;
      case 'warning':
        return `
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          border: 1px solid rgba(245, 158, 11, 0.3);
        `;
      case 'info':
        return `
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          border: 1px solid rgba(59, 130, 246, 0.3);
        `;
      default:
        return `
          background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
          border: 1px solid rgba(107, 114, 128, 0.3);
        `;
    }
  }}

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 768px) {
    top: 1rem;
    right: 1rem;
    left: 1rem;
    min-width: auto;
  }
`;

const ToastContent = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const ToastIcon = styled.div<{ type: ToastProps['type'] }>`
  font-size: 1.25rem;
  flex-shrink: 0;
`;

const ToastMessage = styled.div`
  flex: 1;
  line-height: 1.4;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const ProgressBar = styled.div<{ duration: number; type: ToastProps['type'] }>`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 0 0 12px 12px;
  animation: progress ${(props) => props.duration}ms linear;

  @keyframes progress {
    from {
      width: 100%;
    }
    to {
      width: 0%;
    }
  }
`;

const getIcon = (type: ToastProps['type']): string => {
  switch (type) {
    case 'success':
      return '✅';
    case 'error':
      return '❌';
    case 'warning':
      return '⚠️';
    case 'info':
      return 'ℹ️';
    default:
      return '📢';
  }
};

const Toast: React.FC<ToastProps> = ({
  message,
  type,
  duration = 5000,
  onClose,
}) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300); // Tempo da animação de saída
  };

  return (
    <ToastContainer type={type} isClosing={isClosing} onClick={handleClose}>
      <ToastContent>
        <ToastIcon type={type}>{getIcon(type)}</ToastIcon>
        <ToastMessage>{message}</ToastMessage>
        <CloseButton
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
        >
          ×
        </CloseButton>
      </ToastContent>
      {!isClosing && <ProgressBar duration={duration} type={type} />}
    </ToastContainer>
  );
};

export default Toast;
