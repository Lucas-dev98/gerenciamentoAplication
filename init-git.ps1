# Script PowerShell para inicializar o repositório Git
Write-Host "🚀 Inicializando repositório Git para EPU-Gestão..." -ForegroundColor Green

# Verifica se já é um repositório git
if (!(Test-Path ".git")) {
    Write-Host "📁 Inicializando repositório Git..." -ForegroundColor Yellow
    git init
} else {
    Write-Host "✅ Repositório Git já existe" -ForegroundColor Green
}

# Adiciona arquivos ao staging (respeitando .gitignore)
Write-Host "📋 Adicionando arquivos ao staging..." -ForegroundColor Yellow
git add .

# Mostra o status
Write-Host "📊 Status do repositório:" -ForegroundColor Cyan
git status

Write-Host ""
Write-Host "✅ Repositório inicializado!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. git commit -m 'Initial commit: Sistema EPU-Gestão completo'" -ForegroundColor White
Write-Host "2. git remote add origin <url-do-seu-repositorio>" -ForegroundColor White
Write-Host "3. git branch -M main" -ForegroundColor White
Write-Host "4. git push -u origin main" -ForegroundColor White
Write-Host ""
Write-Host "🔐 Lembre-se de:" -ForegroundColor Yellow
Write-Host "- Configurar as variáveis de ambiente (.env) antes de executar" -ForegroundColor White
Write-Host "- Nunca commitar arquivos .env com dados sensíveis" -ForegroundColor White
Write-Host "- Os arquivos de teste (test-*.js) são opcionais no repositório" -ForegroundColor White
