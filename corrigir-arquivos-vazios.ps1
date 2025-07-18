# Script para corrigir arquivos TypeScript vazios
Write-Host "🔧 Corrigindo arquivos TypeScript/React vazios..." -ForegroundColor Yellow

$emptyFiles = @()
$fixedFiles = @()

# Procurar arquivos vazios
Get-ChildItem -Path "frontend\src" -Include "*.tsx","*.ts" -Recurse | ForEach-Object {
    try {
        $content = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue
        if ([string]::IsNullOrWhiteSpace($content)) {
            $emptyFiles += $_.FullName
        }
    }
    catch {
        # Arquivo pode estar corrompido ou inacessível
        Write-Host "⚠️ Erro ao ler: $($_.Name)" -ForegroundColor Yellow
    }
}

Write-Host "📁 Encontrados $($emptyFiles.Count) arquivos vazios" -ForegroundColor Cyan

# Corrigir arquivos vazios
foreach ($file in $emptyFiles) {
    try {
        $exportStatement = "// Arquivo vazio - export para resolver erro de compilação TypeScript`nexport {};"
        Set-Content -Path $file -Value $exportStatement -Encoding UTF8
        $fixedFiles += $file
        Write-Host "✅ Corrigido: $(Split-Path $file -Leaf)" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Erro ao corrigir: $(Split-Path $file -Leaf)" -ForegroundColor Red
    }
}

Write-Host "`n🎉 Resumo:" -ForegroundColor Green
Write-Host "- Arquivos encontrados: $($emptyFiles.Count)" -ForegroundColor White
Write-Host "- Arquivos corrigidos: $($fixedFiles.Count)" -ForegroundColor White

if ($fixedFiles.Count -gt 0) {
    Write-Host "`n🚀 Agora você pode executar 'docker-compose up --build' novamente!" -ForegroundColor Green
} else {
    Write-Host "`n💡 Nenhum arquivo precisou ser corrigido." -ForegroundColor Blue
}
