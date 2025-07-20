#!/bin/bash

# EPU-Gestão Docker Management Script

set -e

echo "🐳 EPU-Gestão Docker Management"
echo "==============================="

case "$1" in
  "start")
    echo "🚀 Iniciando todos os serviços..."
    docker-compose up -d
    echo "✅ Serviços iniciados!"
    echo "📱 Frontend: http://localhost:3000"
    echo "🔌 Backend: http://localhost:5000"
    echo "🍃 MongoDB: localhost:27017"
    ;;
  
  "stop")
    echo "🛑 Parando todos os serviços..."
    docker-compose down
    echo "✅ Serviços parados!"
    ;;
  
  "restart")
    echo "🔄 Reiniciando todos os serviços..."
    docker-compose down
    docker-compose up -d
    echo "✅ Serviços reiniciados!"
    ;;
  
  "build")
    echo "🔨 Reconstruindo imagens..."
    docker-compose build --no-cache
    echo "✅ Imagens reconstruídas!"
    ;;
  
  "rebuild")
    echo "🔨 Reconstruindo e iniciando..."
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    echo "✅ Aplicação reconstruída e iniciada!"
    ;;
  
  "logs")
    echo "📋 Visualizando logs..."
    docker-compose logs -f
    ;;
  
  "status")
    echo "📊 Status dos serviços:"
    docker-compose ps
    ;;
  
  "clean")
    echo "🧹 Limpando containers e volumes..."
    docker-compose down -v
    docker system prune -f
    echo "✅ Limpeza concluída!"
    ;;
  
  *)
    echo "Uso: $0 {start|stop|restart|build|rebuild|logs|status|clean}"
    echo ""
    echo "Comandos disponíveis:"
    echo "  start   - Inicia todos os serviços"
    echo "  stop    - Para todos os serviços"
    echo "  restart - Reinicia todos os serviços"
    echo "  build   - Reconstrói as imagens"
    echo "  rebuild - Reconstrói e inicia"
    echo "  logs    - Mostra logs em tempo real"
    echo "  status  - Mostra status dos serviços"
    echo "  clean   - Remove containers e volumes"
    exit 1
    ;;
esac
