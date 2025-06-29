# Script PowerShell para parar e limpar a aplicação EPU-Gestão
# Uso: .\stop-docker.ps1

Write-Host "🛑 Parando aplicação EPU-Gestão..." -ForegroundColor Yellow
Write-Host ""

# Parar e remover containers
Write-Host "📦 Parando containers..." -ForegroundColor Yellow
docker-compose down

Write-Host ""
Write-Host "🧹 Limpando recursos Docker..." -ForegroundColor Yellow

# Remover volumes (opcional - descomente se quiser remover dados do banco)
# Write-Host "⚠️  Removendo volumes (dados do banco serão perdidos)..." -ForegroundColor Red
# docker-compose down -v

# Remover imagens órfãs
Write-Host "🗑️  Removendo imagens órfãs..." -ForegroundColor Yellow
docker image prune -f

# Remover redes órfãs
Write-Host "🌐 Removendo redes órfãs..." -ForegroundColor Yellow
docker network prune -f

Write-Host ""
Write-Host "📊 Status atual dos containers:" -ForegroundColor Cyan
docker-compose ps

Write-Host ""
Write-Host "✅ Aplicação EPU-Gestão foi parada com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Comandos úteis:" -ForegroundColor Cyan
Write-Host "   Remover tudo (incluindo volumes): docker-compose down -v" -ForegroundColor White
Write-Host "   Limpar sistema Docker: docker system prune -a" -ForegroundColor White
Write-Host "   Iniciar novamente: .\start-docker.ps1" -ForegroundColor White
