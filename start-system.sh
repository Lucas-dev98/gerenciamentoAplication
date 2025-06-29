#!/bin/bash

echo "🚀 Iniciando sistema EPU-Gestão..."

# Verificar se o Docker está rodando
echo "🔍 Verificando Docker..."
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker Desktop primeiro."
    echo "💡 Aguarde o Docker inicializar completamente antes de continuar."
    exit 1
fi

echo "✅ Docker está rodando"

# Parar containers existentes se estiverem rodando
echo "🛑 Parando containers existentes..."
docker-compose down --remove-orphans

# Construir e iniciar containers
echo "🏗️ Construindo e iniciando containers..."
docker-compose up -d --build

# Aguardar containers iniciarem
echo "⏳ Aguardando containers iniciarem..."
sleep 10

# Verificar status dos containers
echo "📋 Status dos containers:"
docker-compose ps

# Verificar saúde dos containers
echo "🏥 Verificando saúde dos containers..."
sleep 5

# Tentar algumas vezes verificar se o backend está respondendo
echo "🔍 Testando conectividade do backend..."
for i in {1..5}; do
    if curl -s http://localhost:5000/api/health >/dev/null 2>&1; then
        echo "✅ Backend está respondendo"
        break
    else
        echo "⏳ Tentativa $i/5 - Backend ainda não está pronto..."
        sleep 3
    fi
done

# Verificar se o frontend está acessível
echo "🔍 Testando conectividade do frontend..."
if curl -s http://localhost:3000 >/dev/null 2>&1; then
    echo "✅ Frontend está acessível"
else
    echo "⚠️ Frontend pode não estar pronto ainda"
fi

echo "🎉 Sistema iniciado! Acesse:"
echo "   Frontend: http://localhost:3000"
echo "   Backend: http://localhost:5000"
echo "   MongoDB: localhost:27017"
