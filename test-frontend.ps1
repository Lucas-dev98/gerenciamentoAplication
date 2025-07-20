#!/usr/bin/env pwsh

# Script para testar o frontend do EPU-Gestão
Write-Host "=== Testando Frontend EPU-Gestão ===" -ForegroundColor Green

# Navegar para o diretório do frontend
Set-Location "c:\Users\lobas\Downloads\EPU-Gestão\frontend"

# Verificar se node_modules existe
if (-not (Test-Path "node_modules")) {
    Write-Host "Instalando dependências..." -ForegroundColor Yellow
    npm install
}

# Executar verificação de tipos
Write-Host "Verificando tipos TypeScript..." -ForegroundColor Cyan
npm run type-check

# Tentar fazer o build
Write-Host "Fazendo build da aplicação..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build realizado com sucesso!" -ForegroundColor Green
} else {
    Write-Host "❌ Erro no build" -ForegroundColor Red
    exit 1
}

# Voltar para o diretório raiz
Set-Location ".."

Write-Host "=== Teste do Frontend Concluído ===" -ForegroundColor Green
