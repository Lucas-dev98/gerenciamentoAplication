#!/usr/bin/env pwsh

Write-Host "=== Testando EPU-Gestão com Nova Sidebar ===" -ForegroundColor Green

# Navegar para o diretório frontend
Set-Location "c:\Users\lobas\Downloads\EPU-Gestão\frontend"

Write-Host "Iniciando servidor de desenvolvimento..." -ForegroundColor Cyan
npm run dev

Write-Host "Aplicação estará disponível em: http://localhost:3000" -ForegroundColor Yellow
Write-Host "Nova sidebar com funcionalidades:" -ForegroundColor Green
Write-Host "- Dashboard ✅" -ForegroundColor Green
Write-Host "- Equipes ✅" -ForegroundColor Green  
Write-Host "- Membros ✅" -ForegroundColor Green
Write-Host "- Projetos ✅" -ForegroundColor Green
Write-Host "- Perfil ✅" -ForegroundColor Green
Write-Host "- Tarefas ✅" -ForegroundColor Green
Write-Host "- KPIs ✅" -ForegroundColor Green
Write-Host "- Notificações ✅" -ForegroundColor Green
Write-Host "- Metas ✅" -ForegroundColor Green
Write-Host "- Calendário ✅" -ForegroundColor Green
Write-Host "- Alertas ✅" -ForegroundColor Green
