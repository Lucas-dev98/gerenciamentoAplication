const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Servir o arquivo HTML
  if (req.url === '/' || req.url === '/debug-dashboard.html') {
    fs.readFile(
      path.join(__dirname, 'debug-dashboard.html'),
      'utf8',
      (err, data) => {
        if (err) {
          res.writeHead(500);
          res.end('Erro ao ler arquivo');
          return;
        }

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      }
    );
  } else {
    res.writeHead(404);
    res.end('Página não encontrada');
  }
});

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`🌐 Servidor HTML rodando em http://localhost:${PORT}`);
  console.log('📋 Acesse: http://localhost:8080/debug-dashboard.html');
  console.log('🎯 Agora você pode testar o dashboard sem problemas de CORS!');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Servidor HTML encerrado');
  server.close();
  process.exit(0);
});
