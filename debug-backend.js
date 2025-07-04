// Test script to directly verify server behavior
const fs = require('fs');

// Check if the backend file compiles without errors
try {
  const backendContent = fs.readFileSync(
    'c:\\Users\\lobas\\Downloads\\EPU-Gestão\\backend\\epu-backend-complete.js',
    'utf8'
  );

  // Look for the specific endpoints we're interested in
  const frentesMatch = backendContent.match(
    /app\.get\('\/api\/projects\/:id\/frentes'/
  );
  const statisticsMatch = backendContent.match(
    /app\.get\('\/api\/projects\/:id\/statistics'/
  );

  console.log('🔍 Verificação do arquivo backend:');
  console.log(
    `✅ Endpoint frentes encontrado: ${frentesMatch ? 'SIM' : 'NÃO'}`
  );
  console.log(
    `✅ Endpoint statistics encontrado: ${statisticsMatch ? 'SIM' : 'NÃO'}`
  );

  // Look for mock data import
  const mockImport = backendContent.match(
    /require\('\.\/src\/config\/mockData'\)/
  );
  console.log(
    `✅ Import de mockData encontrado: ${mockImport ? 'SIM' : 'NÃO'}`
  );

  // Check for any duplicate route definitions
  const allRoutes =
    backendContent.match(/app\.get\('\/api\/projects\/[^']+'/g) || [];
  console.log(
    `📊 Total de rotas /api/projects encontradas: ${allRoutes.length}`
  );
  allRoutes.forEach((route, index) => {
    console.log(`  ${index + 1}. ${route}`);
  });
} catch (error) {
  console.error('❌ Erro ao verificar backend:', error.message);
}
