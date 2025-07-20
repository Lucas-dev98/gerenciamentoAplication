@echo off
echo 🐳 EPU-Gestão Docker Setup
echo ==========================

echo.
echo Verificando Docker...
docker --version
if %errorlevel% neq 0 (
    echo ❌ Docker não encontrado. Instale o Docker Desktop primeiro.
    pause
    exit /b 1
)

echo.
echo Verificando Docker Compose...
docker-compose --version
if %errorlevel% neq 0 (
    echo ❌ Docker Compose não encontrado.
    pause
    exit /b 1
)

echo.
echo ✅ Docker está instalado e funcionando!
echo.

echo 🔨 Construindo imagens...
docker-compose build --no-cache

if %errorlevel% neq 0 (
    echo ❌ Erro ao construir imagens
    pause
    exit /b 1
)

echo.
echo 🚀 Iniciando serviços...
docker-compose up -d

if %errorlevel% neq 0 (
    echo ❌ Erro ao iniciar serviços
    pause
    exit /b 1
)

echo.
echo ✅ EPU-Gestão iniciado com sucesso!
echo.
echo 📱 Frontend: http://localhost:3000
echo 🔌 Backend: http://localhost:5000
echo 🍃 MongoDB: localhost:27017
echo.
echo Para ver os logs: docker-compose logs -f
echo Para parar: docker-compose down
echo.
pause
