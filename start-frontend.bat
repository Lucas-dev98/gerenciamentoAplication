@echo off
echo.
echo 🚀 Iniciando sistema EPU-Gestão para testar API de clima...
echo.

echo 📁 Verificando estrutura de pastas...
if not exist "frontend" (
    echo ❌ Pasta frontend não encontrada!
    pause
    exit /b 1
)

echo ✅ Pasta frontend encontrada

echo.
echo 🔧 Verificando arquivos críticos...

if exist "frontend\src\services\weatherService.ts" (
    echo ✅ weatherService.ts encontrado
) else (
    echo ❌ weatherService.ts não encontrado!
    pause
    exit /b 1
)

if exist "frontend\.env" (
    echo ✅ frontend\.env encontrado
    echo 📋 Conteúdo do .env:
    type "frontend\.env"
) else (
    echo ⚠️ frontend\.env não encontrado
)

echo.
echo 🔨 Iniciando frontend...
echo 📝 Aguarde alguns segundos para o sistema iniciar...
echo 🌐 Em seguida, acesse: http://localhost:3000
echo 🔍 Abra F12 no navegador para ver os logs da API
echo.

cd frontend
npm start

pause
