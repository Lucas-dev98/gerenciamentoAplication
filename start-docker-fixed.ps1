# Script PowerShell para iniciar a aplicação EPU-Gestão com Docker
# Uso: .\start-docker.ps1

Write-Host "🚀 Iniciando EPU-Gestão com Docker..." -ForegroundColor Green
Write-Host ""

# Verificar se o Docker está rodando
try {
    docker info | Out-Null
    Write-Host "✅ Docker está rodando" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker não está rodando. Por favor, inicie o Docker Desktop." -ForegroundColor Red
    exit 1
}

# Verificar se o docker-compose está disponível
try {
    docker-compose --version | Out-Null
    Write-Host "✅ Docker Compose está disponível" -ForegroundColor Green
} catch {
    Write-Host "❌ docker-compose não encontrado. Por favor, instale o Docker Compose." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Parando containers existentes..." -ForegroundColor Yellow
docker-compose down

Write-Host ""
Write-Host "🔧 Construindo imagens..." -ForegroundColor Yellow
docker-compose build --no-cache

Write-Host ""
Write-Host "🚀 Iniciando serviços..." -ForegroundColor Yellow
docker-compose up -d

Write-Host ""
Write-Host "⏳ Aguardando serviços iniciarem..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host ""
Write-Host "🔍 Verificando status dos containers..." -ForegroundColor Cyan
docker-compose ps

Write-Host ""
Write-Host "📊 Status dos serviços:" -ForegroundColor Cyan

# Verificar Backend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend: Rodando na porta 5000" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Backend: Não está respondendo" -ForegroundColor Red
}

# Verificar Frontend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Frontend: Rodando na porta 3000" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Frontend: Não está respondendo" -ForegroundColor Red
}

# Verificar MongoDB (tentativa de conexão)
try {
    $tcpClient = New-Object System.Net.Sockets.TcpClient
    $tcpClient.Connect("localhost", 27017)
    $tcpClient.Close()
    Write-Host "✅ MongoDB: Rodando na porta 27017" -ForegroundColor Green
} catch {
    Write-Host "❌ MongoDB: Não está respondendo" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 EPU-Gestão está rodando!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 URLs de acesso:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   Backend API: http://localhost:5000" -ForegroundColor White
Write-Host "   MongoDB: localhost:27017" -ForegroundColor White
Write-Host ""
Write-Host "🔐 Credenciais padrão:" -ForegroundColor Cyan
Write-Host "   Email: admin@epugestao.com" -ForegroundColor White
Write-Host "   Senha: admin123" -ForegroundColor White
Write-Host ""
Write-Host "📝 Comandos úteis:" -ForegroundColor Cyan
Write-Host "   Ver logs: docker-compose logs -f" -ForegroundColor White
Write-Host "   Parar aplicação: docker-compose down" -ForegroundColor White
Write-Host "   Reconstruir: docker-compose build --no-cache" -ForegroundColor White
