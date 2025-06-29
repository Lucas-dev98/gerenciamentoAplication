# Teste do fluxo de cadastro e login
Write-Host "Testando fluxo de autenticacao..." -ForegroundColor Yellow

# Teste 1: Cadastro
Write-Host "1. Testando cadastro..." -ForegroundColor Cyan
try {
    $registerData = @{
        username = "testfrontend"
        email = "testfrontend@example.com"
        password = "password123"
        fullName = "Test Frontend User"
    } | ConvertTo-Json

    $registerResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -ContentType "application/json" -Body $registerData
    
    Write-Host "Cadastro OK!" -ForegroundColor Green
    Write-Host "Usuario: $($registerResponse.user.username)" -ForegroundColor Green
    
    $token = $registerResponse.token
    
} catch {
    Write-Host "Erro no cadastro: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Teste 2: Login
Write-Host "2. Testando login..." -ForegroundColor Cyan
try {
    $loginData = @{
        email = "testfrontend@example.com"
        password = "password123"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -ContentType "application/json" -Body $loginData
    
    Write-Host "Login OK!" -ForegroundColor Green
    Write-Host "Usuario: $($loginResponse.user.username)" -ForegroundColor Green
    
} catch {
    Write-Host "Erro no login: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "Todos os testes passaram! Sistema funcionando." -ForegroundColor Green
