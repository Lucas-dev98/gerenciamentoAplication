import React from 'react';

// Teste de imports para detectar problemas
const ImportTest: React.FC = () => {
  console.log('Testing imports...');

  try {
    // Testar import do useAuth
    const { useAuth } = require('../contexts/AuthContext');
    console.log('✅ useAuth imported successfully');
  } catch (error) {
    console.error('❌ Error importing useAuth:', error);
  }

  try {
    // Testar import do api
    const api = require('../services/api');
    console.log('✅ api imported successfully');
  } catch (error) {
    console.error('❌ Error importing api:', error);
  }

  try {
    // Testar import do useToast
    const useToast = require('../hooks/useToast');
    console.log('✅ useToast imported successfully');
  } catch (error) {
    console.error('❌ Error importing useToast:', error);
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>🔍 Import Test</h1>
      <p>Check console for import results</p>
      <div>
        <h2>Expected Components:</h2>
        <ul>
          <li>Teams.tsx</li>
          <li>TeamModal.tsx</li>
          <li>AddMemberModal.tsx</li>
          <li>ConfirmModal.tsx</li>
          <li>Toast.tsx</li>
          <li>useToast.ts</li>
        </ul>
      </div>
    </div>
  );
};

export default ImportTest;
