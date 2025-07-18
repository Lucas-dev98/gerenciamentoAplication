// Script para corrigir arquivos TypeScript vazios
const fs = require('fs');
const path = require('path');

console.log('🔧 Corrigindo arquivos TypeScript vazios...');

// Função para corrigir arquivo vazio
function fixEmptyFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Corrigido: ${filePath}`);
    return true;
  } catch (error) {
    console.log(`❌ Erro ao corrigir ${filePath}:`, error.message);
    return false;
  }
}

// Templates para diferentes tipos de arquivos
const templates = {
  service: `// Serviço placeholder
export const service = {
  // Implementação futura
};

export default service;`,

  component: `// Componente placeholder
import React from 'react';

const Component: React.FC = () => {
  return <div>Componente em desenvolvimento</div>;
};

export default Component;`,

  types: `// Tipos TypeScript
export interface PlaceholderType {
  id: string;
}

export {};`,

  utils: `// Utilitários
export const utils = {
  // Implementação futura
};

export default utils;`,

  default: `// Arquivo TypeScript
export {};`,
};

// Lista de arquivos para corrigir
const filesToFix = [
  { path: 'frontend/src/services/apiClient.ts', template: 'service' },
  { path: 'frontend/src/services/dashboardService.ts', template: 'service' },
  { path: 'frontend/src/services/membersService.ts', template: 'service' },
  { path: 'frontend/src/services/teamsService.ts', template: 'service' },
  { path: 'frontend/src/services/taskService.ts', template: 'service' },
  { path: 'frontend/src/services/kpiService.ts', template: 'service' },
  { path: 'frontend/src/services/notificationService.ts', template: 'service' },
  { path: 'frontend/src/services/organogramService.ts', template: 'service' },
  { path: 'frontend/src/services/api.ts', template: 'service' },
];

let fixedCount = 0;

filesToFix.forEach(({ path: filePath, template }) => {
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    if (stats.size === 0) {
      const content = templates[template] || templates.default;
      if (fixEmptyFile(filePath, content)) {
        fixedCount++;
      }
    } else {
      console.log(`✅ ${filePath} já tem conteúdo`);
    }
  } else {
    console.log(`⚠️ ${filePath} não existe`);
  }
});

console.log(`\n🎯 Resumo: ${fixedCount} arquivos corrigidos`);
console.log('📋 Próximo passo: Execute docker-compose build frontend');
