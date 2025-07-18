@echo off
echo 🔄 Reiniciando frontend com correção da API Key...
echo.

echo 🛑 Parando processos do React...
taskkill /f /im node.exe /fi "windowtitle eq React*" 2>nul
taskkill /f /im node.exe /fi "commandline eq *react-scripts*" 2>nul
timeout /t 3 /nobreak >nul

echo 📁 Entrando na pasta frontend...
cd frontend

echo 🧹 Limpando cache do React...
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache"
    echo ✅ Cache limpo
)

echo 🔍 Verificando arquivos .env...
if exist ".env" (
    echo ✅ .env encontrado
    type .env
    echo.
)
if exist ".env.local" (
    echo ✅ .env.local encontrado
    type .env.local
    echo.
)

echo 🔧 Fazendo build para verificar erros...
call npm run build

if %errorlevel% neq 0 (
    echo ❌ Erro no build! Verifique os logs acima.
    pause
    exit /b 1
)

echo ✅ Build bem-sucedido!
echo.
echo 🚀 Iniciando frontend com variáveis corrigidas...
echo 🌐 Acesse: http://localhost:3000
echo 🔍 Abra F12 e procure pelos logs:
echo    "🔍 WeatherService: Debug das variáveis de ambiente"
echo    "✅ WeatherService: Usando API Key: true"
echo.

start http://localhost:3000
call npm start

pause
