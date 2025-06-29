@echo off
echo 🚀 Iniciando sistema EPU-Gestão...

REM Verificar se o Docker está rodando
echo 🔍 Verificando Docker...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker não está rodando. Por favor, inicie o Docker Desktop primeiro.
    echo 💡 Aguarde o Docker inicializar completamente antes de continuar.
    pause
    exit /b 1
)

echo ✅ Docker está rodando

REM Parar containers existentes se estiverem rodando
echo 🛑 Parando containers existentes...
docker-compose down --remove-orphans

REM Construir e iniciar containers
echo 🏗️ Construindo e iniciando containers...
docker-compose up -d --build

REM Aguardar containers iniciarem
echo ⏳ Aguardando containers iniciarem...
timeout /t 10 /nobreak >nul

REM Verificar status dos containers
echo 📋 Status dos containers:
docker-compose ps

REM Verificar saúde dos containers
echo 🏥 Verificando saúde dos containers...
timeout /t 5 /nobreak >nul

REM Tentar algumas vezes verificar se o backend está respondendo
echo 🔍 Testando conectividade do backend...
for /l %%i in (1,1,5) do (
    curl -s http://localhost:5000/api/health >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ Backend está respondendo
        goto :frontend_check
    ) else (
        echo ⏳ Tentativa %%i/5 - Backend ainda não está pronto...
        timeout /t 3 /nobreak >nul
    )
)

:frontend_check
REM Verificar se o frontend está acessível
echo 🔍 Testando conectividade do frontend...
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend está acessível
) else (
    echo ⚠️ Frontend pode não estar pronto ainda
)

echo 🎉 Sistema iniciado! Acesse:
echo    Frontend: http://localhost:3000
echo    Backend: http://localhost:5000
echo    MongoDB: localhost:27017
pause
