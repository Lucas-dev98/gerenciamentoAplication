# 🐳 GUIA DE INICIALIZAÇÃO DO DOCKER - EPU GESTÃO

📋 PRÉ-REQUISITOS:

1. Docker Desktop deve estar instalado ✅
2. Docker Desktop deve estar rodando 🔄

🚀 PASSOS PARA INICIAR:

1. INICIE O DOCKER DESKTOP:

   - Pressione Win + R e digite "docker-desktop"
   - OU procure "Docker Desktop" no menu Iniciar
   - OU execute: "C:\Program Files\Docker\Docker\Docker Desktop.exe"

2. AGUARDE O DOCKER FICAR PRONTO:

   - Veja o ícone da baleia na bandeja do sistema
   - Aguarde ficar verde (pode levar 2-5 minutos)

3. VERIFIQUE SE ESTÁ FUNCIONANDO:
   Execute: docker ps
4. INICIE OS SERVIÇOS:
   cd "c:\Users\lobas\Downloads\EPU-Gestão"
   docker-compose up -d --build

🏗️ SERVIÇOS QUE SERÃO INICIADOS:

- 🗄️ MongoDB (porta 27017)
- 🔧 Backend API (porta 5000)
- 🌐 Frontend React (porta 3000)

📝 COMANDOS ÚTEIS:

- Ver logs: docker-compose logs -f
- Parar serviços: docker-compose down
- Reconstruir: docker-compose up -d --build --force-recreate

🔍 VERIFICAÇÃO DE STATUS:

- Backend: http://localhost:5000/api/health
- Frontend: http://localhost:3000
- MongoDB: localhost:27017

⚠️ TROUBLESHOOTING:

- Se der erro de porta ocupada: docker-compose down && docker-compose up -d
- Se precisar limpar tudo: docker system prune -a
- Verificar containers: docker ps -a
