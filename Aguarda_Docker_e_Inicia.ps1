# Script para aguardar e iniciar Docker quando estiver pronto
# Aguarda_Docker_e_Inicia.ps1

Write-Host "🐳 Aguardando Docker Desktop ficar pronto..." -ForegroundColor Yellow
Write-Host ""

$dockerReady = $false
$attempts = 0
$maxAttempts = 60  # 5 minutos (60 * 5 segundos)

while (-not $dockerReady -and $attempts -lt $maxAttempts) {
    try {
        $attempts++
        Write-Host "Tentativa $attempts/$maxAttempts - Verificando Docker..." -ForegroundColor Cyan
        
        # Testa se o Docker está respondendo
        docker ps 2>$null | Out-Null
        if ($LASTEXITCODE -eq 0) {
            $dockerReady = $true
            Write-Host "✅ Docker Desktop está pronto!" -ForegroundColor Green
        } else {
            Write-Host "⏳ Docker ainda não está pronto. Aguardando..." -ForegroundColor Yellow
            Start-Sleep -Seconds 5
        }
    }
    catch {
        Write-Host "⏳ Docker ainda inicializando..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    }
}

if ($dockerReady) {
    Write-Host ""
    Write-Host "🚀 Iniciando serviços do EPU Gestão..." -ForegroundColor Green
    Write-Host ""
    
    # Navega para o diretório do projeto
    Set-Location "c:\Users\lobas\Downloads\EPU-Gestão"
    
    # Para qualquer container que possa estar rodando
    Write-Host "🛑 Parando containers existentes..." -ForegroundColor Yellow
    docker-compose down
    
    Write-Host ""
    Write-Host "🏗️ Construindo e iniciando serviços..." -ForegroundColor Green
    Write-Host ""
    
    # Inicia os serviços
    docker-compose up -d --build
    
    Write-Host ""
    Write-Host "✅ Serviços iniciados com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Status dos serviços:" -ForegroundColor Cyan
    docker-compose ps
    
    Write-Host ""
    Write-Host "🌐 URLs disponíveis:" -ForegroundColor Cyan
    Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
    Write-Host "  Backend:  http://localhost:5000" -ForegroundColor White
    Write-Host "  MongoDB:  localhost:27017" -ForegroundColor White
    
    Write-Host ""
    Write-Host "📝 Comandos úteis:" -ForegroundColor Cyan
    Write-Host "  Ver logs: docker-compose logs -f" -ForegroundColor White
    Write-Host "  Parar:    docker-compose down" -ForegroundColor White
    
} else {
    Write-Host ""
    Write-Host "❌ Timeout: Docker Desktop não ficou pronto em 5 minutos." -ForegroundColor Red
    Write-Host "   Por favor, inicie manualmente o Docker Desktop e tente novamente." -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Para iniciar manualmente:" -ForegroundColor Yellow
    Write-Host "   1. Abra o Docker Desktop" -ForegroundColor White
    Write-Host "   2. Aguarde ficar verde na bandeja" -ForegroundColor White
    Write-Host "   3. Execute: docker-compose up -d --build" -ForegroundColor White
}

Write-Host ""
Write-Host "Pressione qualquer tecla para continuar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
