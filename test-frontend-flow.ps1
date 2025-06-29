# Teste do fluxo de cadastro e login do frontend
Write-Host "🧪 Testando fluxo de cadastro e login..." -ForegroundColor Yellow

# Teste 1: Cadastro
Write-Host "`n1. Testando cadastro..." -ForegroundColor Cyan
try {
    $registerData = @{
        username = "testfrontend"
        email = "testfrontend@example.com"
        password = "password123"
        fullName = "Test Frontend User"
    } | ConvertTo-Json

    $registerResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -ContentType "application/json" -Body $registerData
    
    Write-Host "✅ Cadastro realizado com sucesso!" -ForegroundColor Green
    Write-Host "Usuario: $($registerResponse.user.username)" -ForegroundColor Green
    Write-Host "Email: $($registerResponse.user.email)" -ForegroundColor Green
    Write-Host "Token: $($registerResponse.token.Substring(0, 20))..." -ForegroundColor Green
    
    # Salvar token para próximo teste
    $token = $registerResponse.token
    
} catch {
    Write-Host "❌ Erro no cadastro: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Teste 2: Login
Write-Host "`n2. Testando login..." -ForegroundColor Cyan
try {
    $loginData = @{
        email = "testfrontend@example.com"
        password = "password123"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -ContentType "application/json" -Body $loginData
    
    Write-Host "✅ Login realizado com sucesso!" -ForegroundColor Green
    Write-Host "Usuario: $($loginResponse.user.username)" -ForegroundColor Green
    Write-Host "Token: $($loginResponse.token.Substring(0, 20))..." -ForegroundColor Green
    
} catch {
    Write-Host "❌ Erro no login: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Teste 3: Acesso protegido
Write-Host "`n3. Testando acesso a rota protegida..." -ForegroundColor Cyan
try {
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }

    $userResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/users" -Method GET -Headers $headers
    
    Write-Host "✅ Acesso protegido funcionando!" -ForegroundColor Green
    Write-Host "Usuários encontrados: $($userResponse.users.Count)" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Erro no acesso protegido: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n🎉 Todos os testes passaram! O sistema está funcionando corretamente." -ForegroundColor Green
Write-Host "`n📋 Resumo dos testes:" -ForegroundColor Yellow
Write-Host "✅ Cadastro de usuário com retorno de token" -ForegroundColor Green
Write-Host "✅ Login de usuário com retorno de token" -ForegroundColor Green
Write-Host "✅ Acesso a rotas protegidas com autenticação" -ForegroundColor Green
Write-Host "`n🌐 Agora você pode testar no frontend em http://localhost:3000" -ForegroundColor Cyan
