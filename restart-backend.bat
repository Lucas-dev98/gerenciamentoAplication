@echo off
echo 🔄 Reiniciando backend...
echo ⏹️ Parando processos na porta 3001...

for /f "tokens=5" %%a in ('netstat -aon ^| find ":3001"') do (
    echo 🛑 Parando processo %%a...
    taskkill /f /pid %%a 2>nul
)

timeout /t 2 /nobreak >nul

echo 🚀 Iniciando backend atualizado...
cd /d "c:\Users\lobas\Downloads\EPU-Gestão\backend"
node epu-backend-complete.js
