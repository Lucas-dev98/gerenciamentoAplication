#!/bin/bash

# Script para inicializar o repositório Git
echo "🚀 Inicializando repositório Git para EPU-Gestão..."

# Verifica se já é um repositório git
if [ ! -d ".git" ]; then
    echo "📁 Inicializando repositório Git..."
    git init
else
    echo "✅ Repositório Git já existe"
fi

# Adiciona arquivos ao staging (respeitando .gitignore)
echo "📋 Adicionando arquivos ao staging..."
git add .

# Mostra o status
echo "📊 Status do repositório:"
git status

echo ""
echo "✅ Repositório inicializado!"
echo ""
echo "📝 Próximos passos:"
echo "1. git commit -m 'Initial commit: Sistema EPU-Gestão completo'"
echo "2. git remote add origin <url-do-seu-repositorio>"
echo "3. git branch -M main"
echo "4. git push -u origin main"
echo ""
echo "🔐 Lembre-se de:"
echo "- Configurar as variáveis de ambiente (.env) antes de executar"
echo "- Nunca commitar arquivos .env com dados sensíveis"
echo "- Os arquivos de teste (test-*.js) são opcionais no repositório"
