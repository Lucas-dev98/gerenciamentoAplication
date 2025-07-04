/**
 * Monitor de Logs em Tempo Real
 * Para capturar o erro exato quando você tentar via navegador
 */

const { spawn } = require('child_process');

console.log('🔍 Monitorando logs do backend em tempo real...');
console.log('📝 Agora tente acessar a rota via navegador/frontend\n');
console.log('='.repeat(80));

// Monitorar logs do Docker em tempo real
const dockerLogs = spawn('docker', ['logs', '-f', 'epu-backend'], {
  stdio: ['ignore', 'pipe', 'pipe'],
});

dockerLogs.stdout.on('data', (data) => {
  const logMessage = data.toString();

  // Filtrar apenas logs relevantes para autenticação e projetos
  if (
    logMessage.includes('/api/projects') ||
    logMessage.includes('Token') ||
    logMessage.includes('auth') ||
    logMessage.includes('ERROR') ||
    logMessage.includes('WARN')
  ) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${logMessage.trim()}`);
  }
});

dockerLogs.stderr.on('data', (data) => {
  const errorMessage = data.toString();
  console.log(`❌ ERRO: ${errorMessage.trim()}`);
});

dockerLogs.on('close', (code) => {
  console.log(`\n📄 Monitoramento finalizado (código: ${code})`);
});

// Parar o monitoramento após 2 minutos
setTimeout(() => {
  console.log('\n⏰ Tempo limite atingido, parando monitoramento...');
  dockerLogs.kill();
}, 120000);

console.log('💡 Dicas para teste:');
console.log('1. Abra o navegador em http://localhost:3000');
console.log('2. Faça login com: l.o.bastos@live.com');
console.log('3. Tente acessar uma página de projetos');
console.log('4. Observe os logs abaixo para ver o erro exato');
console.log('\n🔍 Aguardando requisições...\n');
