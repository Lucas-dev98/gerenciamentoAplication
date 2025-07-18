#!/bin/bash

echo "🚀 Iniciando sistema EPU-Gestão com debug da API de clima..."
echo ""

# Verificar se Docker está rodando
if ! docker --version &> /dev/null; then
    echo "❌ Docker não encontrado. Por favor, instale o Docker."
    exit 1
fi

echo "✅ Docker encontrado"

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker-compose down

# Limpar imagens antigas (opcional)
echo "🧹 Limpando imagens antigas..."
docker system prune -f

# Verificar arquivos de configuração
echo "🔍 Verificando configurações..."
if [ -f ".env" ]; then
    echo "✅ .env encontrado"
    grep -E "REACT_APP_WEATHER_API_KEY|MONGODB_URI" .env
else
    echo "❌ .env não encontrado"
fi

if [ -f "frontend/.env" ]; then
    echo "✅ frontend/.env encontrado"
    grep -E "REACT_APP_WEATHER_API_KEY|REACT_APP_API_URL" frontend/.env
else
    echo "❌ frontend/.env não encontrado"
fi

# Construir e iniciar containers
echo ""
echo "🔨 Construindo e iniciando containers..."
docker-compose up --build -d

# Aguardar containers iniciarem
echo "⏳ Aguardando containers iniciarem..."
sleep 10

# Verificar status dos containers
echo "📋 Status dos containers:"
docker-compose ps

# Verificar logs do frontend
echo ""
echo "📜 Logs do frontend (últimas 20 linhas):"
docker-compose logs --tail=20 frontend

# Verificar logs do backend
echo ""
echo "📜 Logs do backend (últimas 20 linhas):"
docker-compose logs --tail=20 backend

echo ""
echo "🌐 Sistema disponível em:"
echo "  Frontend: http://localhost:3000"
echo "  Backend: http://localhost:5000"
echo ""
echo "🔧 Para debug:"
echo "  docker-compose logs frontend   # Logs do frontend"
echo "  docker-compose logs backend    # Logs do backend"
echo "  docker-compose down            # Parar sistema"
echo ""
echo "✨ Teste a API de clima no dashboard!"
