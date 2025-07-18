Write-Host "🧪 Testando backend após restart..."

# Aguardar um pouco para o backend iniciar
Start-Sleep -Seconds 3

# Testar rota de notices
Write-Host "🔍 Testando rota de notices..."
node test-notices-route.js

# Se funcionou, testar dashboard completo
Write-Host "🎯 Testando dashboard completo..."
node test-correct-dashboard.js
