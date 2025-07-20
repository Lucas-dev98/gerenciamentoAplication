# EPU-Gestão Docker Management Script para Windows
param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("start", "stop", "restart", "build", "rebuild", "logs", "status", "clean")]
    [string]$Action
)

Write-Host "🐳 EPU-Gestão Docker Management" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan

switch ($Action) {
    "start" {
        Write-Host "🚀 Iniciando todos os serviços..." -ForegroundColor Green
        docker-compose up -d
        Write-Host "✅ Serviços iniciados!" -ForegroundColor Green
        Write-Host "📱 Frontend: http://localhost:3000" -ForegroundColor Yellow
        Write-Host "🔌 Backend: http://localhost:5000" -ForegroundColor Yellow
        Write-Host "🍃 MongoDB: localhost:27017" -ForegroundColor Yellow
    }
    
    "stop" {
        Write-Host "🛑 Parando todos os serviços..." -ForegroundColor Red
        docker-compose down
        Write-Host "✅ Serviços parados!" -ForegroundColor Green
    }
    
    "restart" {
        Write-Host "🔄 Reiniciando todos os serviços..." -ForegroundColor Yellow
        docker-compose down
        docker-compose up -d
        Write-Host "✅ Serviços reiniciados!" -ForegroundColor Green
    }
    
    "build" {
        Write-Host "🔨 Reconstruindo imagens..." -ForegroundColor Blue
        docker-compose build --no-cache
        Write-Host "✅ Imagens reconstruídas!" -ForegroundColor Green
    }
    
    "rebuild" {
        Write-Host "🔨 Reconstruindo e iniciando..." -ForegroundColor Blue
        docker-compose down
        docker-compose build --no-cache
        docker-compose up -d
        Write-Host "✅ Aplicação reconstruída e iniciada!" -ForegroundColor Green
    }
    
    "logs" {
        Write-Host "📋 Visualizando logs..." -ForegroundColor Magenta
        docker-compose logs -f
    }
    
    "status" {
        Write-Host "📊 Status dos serviços:" -ForegroundColor Cyan
        docker-compose ps
    }
    
    "clean" {
        Write-Host "🧹 Limpando containers e volumes..." -ForegroundColor Red
        docker-compose down -v
        docker system prune -f
        Write-Host "✅ Limpeza concluída!" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Comandos disponíveis:" -ForegroundColor White
Write-Host "  start   - Inicia todos os serviços" -ForegroundColor Gray
Write-Host "  stop    - Para todos os serviços" -ForegroundColor Gray
Write-Host "  restart - Reinicia todos os serviços" -ForegroundColor Gray
Write-Host "  build   - Reconstrói as imagens" -ForegroundColor Gray
Write-Host "  rebuild - Reconstrói e inicia" -ForegroundColor Gray
Write-Host "  logs    - Mostra logs em tempo real" -ForegroundColor Gray
Write-Host "  status  - Mostra status dos serviços" -ForegroundColor Gray
Write-Host "  clean   - Remove containers e volumes" -ForegroundColor Gray
