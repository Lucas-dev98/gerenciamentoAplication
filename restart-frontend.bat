@echo off
echo 🔄 Reiniciando sistema EPU-Gestão...
echo.

echo 🛑 Parando processos existentes...
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul

echo 🧹 Limpando portas...
netsh int ipv4 show excludedportrange protocol=tcp 2>nul

echo 📁 Entrando na pasta frontend...
cd frontend

echo 🔧 Verificando se há erros de TypeScript...
call npm run build

if %errorlevel% neq 0 (
    echo ❌ Erro no build! Verifique os logs acima.
    pause
    exit /b 1
)

echo ✅ Build bem-sucedido!
echo.
echo 🚀 Iniciando frontend...
echo 🌐 Acesse: http://localhost:3000
echo 🔍 Abra F12 para ver logs da API de clima
echo.

start http://localhost:3000
call npm start

pause
