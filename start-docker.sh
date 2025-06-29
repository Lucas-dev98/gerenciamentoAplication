#!/bin/bash
# Script para iniciar a aplicação EPU-Gestão com Docker

echo "🚀 Iniciando EPU-Gestão com Docker..."
echo ""

# Verificar se o Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker Desktop."
    exit 1
fi

# Verificar se o docker-compose está disponível
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose não encontrado. Por favor, instale o Docker Compose."
    exit 1
fi

echo "📦 Parando containers existentes..."
docker-compose down

echo "🔧 Construindo imagens..."
docker-compose build --no-cache

echo "🚀 Iniciando serviços..."
docker-compose up -d

echo ""
echo "⏳ Aguardando serviços iniciarem..."
sleep 10

echo ""
echo "🔍 Verificando status dos containers..."
docker-compose ps

echo ""
echo "📊 Status dos serviços:"

# Verificar MongoDB
if curl -f http://localhost:27017 > /dev/null 2>&1; then
    echo "✅ MongoDB: Rodando na porta 27017"
else
    echo "❌ MongoDB: Não está respondendo"
fi

# Verificar Backend
if curl -f http://localhost:5000/health > /dev/null 2>&1; then
    echo "✅ Backend: Rodando na porta 5000"
else
    echo "❌ Backend: Não está respondendo"
fi

# Verificar Frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend: Rodando na porta 3000"
else
    echo "❌ Frontend: Não está respondendo"
fi

echo ""
echo "🎉 EPU-Gestão está rodando!"
echo ""
echo "📋 URLs de acesso:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5000"
echo "   MongoDB: localhost:27017"
echo ""
echo "🔐 Credenciais padrão:"
echo "   Email: admin@epugestao.com"
echo "   Senha: admin123"
echo ""
echo "📝 Para ver os logs em tempo real:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 Para parar a aplicação:"
echo "   docker-compose down"
