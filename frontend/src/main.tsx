import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// import './index.css' // Removido: agora usamos styled-components
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
