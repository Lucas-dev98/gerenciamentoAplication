#!/bin/bash

echo "🚀 Iniciando frontend local para debug da API de clima..."

# Ir para o diretório do frontend
cd frontend

# Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Verificar se .env existe
if [ -f ".env" ]; then
    echo "✅ .env encontrado:"
    cat .env
else
    echo "❌ .env não encontrado no frontend"
fi

echo ""
echo "🔧 Iniciando servidor de desenvolvimento..."
echo "📝 Logs de debug aparecerão no console do navegador"
echo "🌐 Acesse: http://localhost:3000"
echo "🔍 Abra F12 para ver os logs de debug da API de clima"
echo ""

# Iniciar servidor de desenvolvimento
npm start
